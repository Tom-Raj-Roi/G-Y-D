import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { generateNumericOtp } from "@/lib/otp";

type EmailOTPAuthProps = {
  email: string;
  onVerified: (verified: boolean) => void;
  defaultVerified?: boolean;
};

type StoredOtp = {
  code: string;
  expiresAt: number;
};

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const FETCH_TIMEOUT_MS = 12 * 1000; // 12 seconds timeout

export default function EmailOTPAuth({ email, onVerified, defaultVerified = false }: EmailOTPAuthProps) {
  const { translate } = useLanguage();
  const [step, setStep] = useState<"idle" | "sending" | "sent" | "verifying" | "verified" | "error">("idle");
  const [otp, setOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isVerified, setIsVerified] = useState(defaultVerified);
  const resendTimeoutRef = useRef<number | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const isSendingRef = useRef(false);

  const getStorageKey = useCallback((emailAddr: string) => {
    return `email-otp:${emailAddr.trim().toLowerCase()}`;
  }, []);

  const clearTimer = useCallback(() => {
    if (resendTimeoutRef.current !== null) {
      clearInterval(resendTimeoutRef.current);
      resendTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    setStep("idle");
    setIsVerified(false);
    setOtp("");
    setErrorMsg("");
    clearTimer();
    setResendCountdown(0);
    isSendingRef.current = false;
    onVerified(false);
  }, [email, onVerified, clearTimer]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const startResendCountdown = (seconds = 60) => {
    clearTimer();
    setResendCountdown(seconds);
    resendTimeoutRef.current = window.setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const invokeOtpFunctionWithRetry = async (
    normalizedEmail: string,
    generatedCode: string,
    retries = 1
  ): Promise<{ success: boolean; message?: string }> => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

        const { data, error } = await supabase.functions.invoke("send-otp-email", {
          body: { email: normalizedEmail, otp: generatedCode },
          headers: { "x-request-timestamp": String(Date.now()) },
        });

        clearTimeout(timeoutId);

        if (error) {
          console.warn(`Attempt ${attempt + 1} send-otp-email error:`, error);
          if (attempt < retries) {
            await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
            continue;
          }
          throw error;
        }

        const payload = typeof data === "string" ? JSON.parse(data) : data;
        if (!payload || payload.success === false) {
          const msg = payload?.message ?? "Failed to send the verification code.";
          if (attempt < retries && (msg.includes("502") || msg.includes("timed out") || msg.includes("network"))) {
            await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
            continue;
          }
          return { success: false, message: msg };
        }

        return { success: true };
      } catch (err: any) {
        console.warn(`Attempt ${attempt + 1} caught exception:`, err);
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        throw err;
      }
    }
    return { success: false, message: "Maximum retries reached." };
  };

  const sendOTP = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setErrorMsg(translate("otp.error_invalid_email", "Please enter a valid email address."));
      setStep("error");
      return;
    }

    if (isSendingRef.current) return;
    isSendingRef.current = true;

    setStep("sending");
    setErrorMsg("");

    try {
      const generatedCode = generateNumericOtp(8);
      const storageKey = getStorageKey(normalizedEmail);
      
      const storedData: StoredOtp = {
        code: generatedCode,
        expiresAt: Date.now() + OTP_EXPIRY_MS,
      };
      window.localStorage.setItem(storageKey, JSON.stringify(storedData));

      const result = await invokeOtpFunctionWithRetry(normalizedEmail, generatedCode, 1);

      if (!result.success) {
        throw new Error(result.message || "Failed to send verification code.");
      }

      setStep("sent");
      startResendCountdown(60);
    } catch (err: any) {
      const error = err as Error & { name?: string };
      console.error("Email OTP send error:", error);

      const storageKey = getStorageKey(normalizedEmail);
      window.localStorage.removeItem(storageKey);

      const isFetchError =
        error?.name === "FunctionsFetchError" ||
        error?.name === "AbortError" ||
        error.message?.includes("Failed to send a request") ||
        error.message?.includes("timed out");
      const isHttpError =
        error?.name === "FunctionsHttpError" ||
        error.message?.includes("returned a non-2xx status code");

      let userMsg: string;
      if (isFetchError) {
        userMsg = translate(
          "otp.edge_function_error",
          "Unable to connect to the email verification service. Please check your connection and ensure the 'send-otp-email' Edge Function is deployed on Supabase."
        );
      } else if (isHttpError) {
        userMsg = translate(
          "otp.edge_function_http_error",
          "The email verification service returned an error. Please verify server secrets (RESEND_API_KEY and NOTIFICATION_FROM_EMAIL) in Supabase."
        );
      } else {
        userMsg =
          error.message ||
          translate("otp.error_send_failed", "Failed to send verification code. Please try again.");
      }

      setErrorMsg(userMsg);
      setStep("error");
    } finally {
      isSendingRef.current = false;
    }
  };

  const verifyOTP = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const enteredCode = otp.replace(/\D/g, "");
    const storageKey = getStorageKey(normalizedEmail);
    const rawStored = window.localStorage.getItem(storageKey);

    if (!enteredCode || enteredCode.length < 8) {
      setErrorMsg(translate("otp.error_invalid_code", "Please enter the 8-digit code."));
      setStep("error");
      return;
    }

    if (!rawStored) {
      setErrorMsg(translate("otp.error_code_expired", "The code has expired or was not requested. Please request a new code."));
      setStep("error");
      return;
    }

    try {
      let storedObj: StoredOtp;
      if (rawStored.startsWith("{")) {
        storedObj = JSON.parse(rawStored);
      } else {
        // Fallback for raw legacy string code
        storedObj = { code: rawStored, expiresAt: Date.now() + OTP_EXPIRY_MS };
      }

      if (Date.now() > storedObj.expiresAt) {
        window.localStorage.removeItem(storageKey);
        setErrorMsg(translate("otp.error_code_expired", "The code has expired. Please request a new OTP code."));
        setStep("error");
        return;
      }

      if (enteredCode !== storedObj.code.trim()) {
        setErrorMsg(translate("otp.error_verify_failed", "Verification failed. Please check the code and try again."));
        setStep("error");
        return;
      }

      setStep("verifying");
      setErrorMsg("");
      setIsVerified(true);
      setStep("verified");
      onVerified(true);
      window.localStorage.removeItem(storageKey);
    } catch {
      setErrorMsg(translate("otp.error_verify_failed", "Verification failed. Please check the code and try again."));
      setStep("error");
    }
  };

  const resendOTP = () => {
    setOtp("");
    sendOTP();
  };

  if (isVerified) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-300">
        <CheckCircle className="h-5 w-5 flex-shrink-0" />
        <span className="text-sm font-medium">{translate("otp.email_verified", "Email address verified")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {step === "idle" && (
        <Button type="button" variant="outline" size="sm" onClick={sendOTP} className="w-full">
          {translate("otp.send_email_code", "Send Email Verification Code")}
        </Button>
      )}
      {step === "sending" && (
        <div className="flex items-center justify-center gap-2 p-3 text-sm text-muted-foreground bg-muted/30 rounded-lg border">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          {translate("otp.sending", "Sending verification code...")}
        </div>
      )}
      {step === "sent" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="email-otp" className="text-sm font-medium">
              {translate("otp.enter_code_email", "Enter the 8-digit code sent to")} <span className="font-semibold text-foreground">{email}</span>
            </Label>
            <Input
              id="email-otp"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder={translate("otp.code_placeholder", "--------")}
              maxLength={8}
              className="font-mono text-center text-lg tracking-widest"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resendOTP}
              disabled={resendCountdown > 0}
              className="flex-1"
            >
              {resendCountdown > 0
                ? `${translate("otp.resend", "Resend")} (${resendCountdown}s)`
                : translate("otp.resend", "Resend")}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={verifyOTP}
              disabled={!otp || otp.length < 8}
              className="flex-1"
            >
              {translate("otp.verify", "Verify")}
            </Button>
          </div>
        </>
      )}
      {step === "verifying" && (
        <div className="flex items-center justify-center gap-2 p-3 text-sm text-muted-foreground bg-muted/30 rounded-lg border">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          {translate("otp.verifying", "Verifying...")}
        </div>
      )}
      {step === "error" && (
        <div className="space-y-2">
          {errorMsg && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm leading-relaxed">{errorMsg}</span>
            </div>
          )}
          <Button type="button" variant="outline" size="sm" onClick={sendOTP} className="w-full gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            {translate("otp.try_again", "Try Again")}
          </Button>
        </div>
      )}
    </div>
  );
}

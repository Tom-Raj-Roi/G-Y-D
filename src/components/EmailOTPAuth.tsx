import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { generateNumericOtp } from "@/lib/otp";

type EmailOTPAuthProps = {
  email: string;
  onVerified: (verified: boolean) => void;
  defaultVerified?: boolean;
};

type SupabaseErrorLike = { code?: string; message?: string; msg?: string };

export default function EmailOTPAuth({ email, onVerified, defaultVerified = false }: EmailOTPAuthProps) {
  const { translate } = useLanguage();
  const [step, setStep] = useState<"idle" | "sending" | "sent" | "verifying" | "verified" | "error">("idle");
  const [otp, setOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isVerified, setIsVerified] = useState(defaultVerified);
  const resendTimeoutRef = useRef<number | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Reset state whenever the email changes.
  useEffect(() => {
    setStep("idle");
    setIsVerified(false);
    setOtp("");
    setErrorMsg("");
    if (resendTimeoutRef.current) {
      clearInterval(resendTimeoutRef.current);
      resendTimeoutRef.current = null;
    }
    setResendCountdown(0);
    onVerified(false);
  }, [email, onVerified]);

  // Cleanup countdown on unmount.
  useEffect(() => {
    return () => {
      if (resendTimeoutRef.current) {
        clearInterval(resendTimeoutRef.current);
      }
    };
  }, []);

  const startResendCountdown = () => {
    setResendCountdown(60);
    resendTimeoutRef.current = window.setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          if (resendTimeoutRef.current) {
            clearInterval(resendTimeoutRef.current);
            resendTimeoutRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const sendOTP = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setErrorMsg(translate("otp.error_invalid_email", "Please enter a valid email address."));
      setStep("error");
      return;
    }
    setStep("sending");
    setErrorMsg("");

    try {
      const generatedCode = generateNumericOtp(8);
      const storageKey = `email-otp:${normalizedEmail}`;
      window.localStorage.setItem(storageKey, generatedCode);

      // This uses your existing Supabase function integration to send the verification code.
      // If the function is not deployed yet, the UI will surface the error clearly.
      const response = await fetch("/functions/v1/send-otp-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, otp: generatedCode }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.message || "Failed to send the verification code.");
      }

      setStep("sent");
      startResendCountdown();
    } catch (err) {
      const error = err as Error;
      console.error("Email OTP send error:", error);
      setErrorMsg(error.message || translate("otp.error_send_failed", "Failed to send OTP. Please try again."));
      setStep("error");
    }
  };

  const verifyOTP = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const enteredCode = otp.replace(/\D/g, "").slice(0, 8);
    const expectedCode = window.localStorage.getItem(`email-otp:${normalizedEmail}`) || "";

    if (!enteredCode || enteredCode.length < 8) {
      setErrorMsg(translate("otp.error_invalid_code", "Please enter the 8-digit code."));
      setStep("error");
      return;
    }

    if (enteredCode !== expectedCode) {
      setErrorMsg(translate("otp.error_verify_failed", "Verification failed. Please check the code and try again."));
      setStep("error");
      return;
    }

    setStep("verifying");
    setErrorMsg("");
    setIsVerified(true);
    setStep("verified");
    onVerified(true);
    window.localStorage.removeItem(`email-otp:${normalizedEmail}`);
  };

  const resendOTP = () => {
    setOtp("");
    sendOTP();
  };

  const tryAgain = () => {
    setStep("sent");
    setErrorMsg("");
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
        <div className="flex items-center justify-center gap-2 p-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {translate("otp.sending", "Sending verification code...")}
        </div>
      )}
      {step === "sent" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="email-otp" className="text-sm">
              {translate("otp.enter_code_email", "Enter the 8-digit code sent to")} {email}
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
        <div className="flex items-center justify-center gap-2 p-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {translate("otp.verifying", "Verifying...")}
        </div>
      )}
      {step === "error" && errorMsg && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{errorMsg}</span>
        </div>
      )}
      {step === "error" && (
        <Button type="button" variant="outline" size="sm" onClick={tryAgain} className="w-full">
          {translate("otp.try_again", "Try Again")}
        </Button>
      )}
    </div>
  );
}

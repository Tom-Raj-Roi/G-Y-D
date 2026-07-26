import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, AlertCircle, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

type EmailOTPAuthProps = {
  email: string;
  onVerified: (verified: boolean) => void;
  defaultVerified?: boolean;
};

type SupabaseErrorLike = { code?: string; message?: string };

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
    if (isVerified) {
      setIsVerified(false);
      onVerified(false);
    }
    setStep("idle");
    setOtp("");
    setErrorMsg("");
    if (resendTimeoutRef.current) {
      clearInterval(resendTimeoutRef.current);
      resendTimeoutRef.current = null;
    }
    setResendCountdown(0);
  }, [email, isVerified, onVerified]);

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
    if (!email || !email.includes("@")) {
      setErrorMsg(translate("otp.error_invalid_email", "Please enter a valid email address."));
      setStep("error");
      return;
    }
    setStep("sending");
    setErrorMsg("");

    try {
      // Supabase sends a 6-digit OTP code to the email (no magic link since
      // we don't pass emailRedirectTo). This uses the free Supabase Auth service.
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      setStep("sent");
      startResendCountdown();
    } catch (err) {
      const error = err as SupabaseErrorLike;
      console.error("Email OTP send error:", error);
      let msg = translate("otp.error_send_failed", "Failed to send OTP. Please try again.");
      if (error?.message) msg = error.message;
      setErrorMsg(msg);
      setStep("error");
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length < 6) {
      setErrorMsg(translate("otp.error_invalid_code", "Please enter the 6-digit code."));
      return;
    }
    setStep("verifying");
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });
      if (error) throw error;
      setIsVerified(true);
      setStep("verified");
      onVerified(true);
      // Sign out to avoid leaving a session for form-only verification.
      await supabase.auth.signOut();
    } catch (err) {
      const error = err as SupabaseErrorLike;
      console.error("Email OTP verify error:", error);
      let msg = translate("otp.error_verify_failed", "Verification failed. Please check the code and try again.");
      if (error?.message) msg = error.message;
      setErrorMsg(msg);
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
        <div className="flex items-center justify-center gap-2 p-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {translate("otp.sending", "Sending verification code...")}
        </div>
      )}
      {step === "sent" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="email-otp" className="text-sm">
              {translate("otp.enter_code", "Enter the 6-digit code sent to")} {email}
            </Label>
            <Input
              id="email-otp"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder={translate("otp.code_placeholder", "------")}
              maxLength={6}
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
              disabled={!otp || otp.length < 6}
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
        <Button type="button" variant="outline" size="sm" onClick={() => setStep("idle")} className="w-full">
          {translate("otp.try_again", "Try Again")}
        </Button>
      )}
    </div>
  );
}

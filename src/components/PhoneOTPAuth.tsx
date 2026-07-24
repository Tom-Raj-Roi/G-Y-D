import { useState, useEffect, useRef } from "react";
import { firebaseAuth } from "@/integrations/firebase/config";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult as ConfirmationResultType,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type PhoneOTPAuthProps = {
  phoneNumber: string;
  onVerified: (verified: boolean) => void;
  defaultVerified?: boolean;
};

export default function PhoneOTPAuth({ phoneNumber, onVerified, defaultVerified = false }: PhoneOTPAuthProps) {
  const { translate } = useLanguage();
  const [step, setStep] = useState<"idle" | "sending" | "sent" | "verifying" | "verified" | "error">("idle");
  const [otp, setOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationResultRef = useRef<ConfirmationResultType | null>(null);
  const [isVerified, setIsVerified] = useState(defaultVerified);

  useEffect(() => {
    if (isVerified) {
      setIsVerified(false);
      onVerified(false);
    }
    setStep("idle");
    setOtp("");
    setErrorMsg("");
    confirmationResultRef.current = null;
    if (recaptchaRef.current) {
      recaptchaRef.current.clear();
      recaptchaRef.current = null;
    }
  }, [phoneNumber]);

  useEffect(() => {
    return () => {
      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
      }
    };
  }, []);

  const sendOTP = async () => {
    if (!phoneNumber || !phoneNumber.startsWith("+")) {
      setErrorMsg(translate("otp.error_invalid_phone", "Please enter a valid phone number."));
      setStep("error");
      return;
    }
    setStep("sending");
    setErrorMsg("");
    try {
      const containerId = `recaptcha-container-${Math.random().toString(36).slice(2, 11)}`;
      const div = document.createElement("div");
      div.id = containerId;
      div.style.display = "none";
      document.body.appendChild(div);

      recaptchaRef.current = new RecaptchaVerifier(firebaseAuth, containerId, {
        size: "invisible",
        callback: () => {},
        'expired-callback': () => {
          setErrorMsg(translate("otp.error_recaptcha_expired", "reCAPTCHA expired. Please try again."));
          setStep("error");
        },
      });

      const confirmationResult = await signInWithPhoneNumber(firebaseAuth, phoneNumber, recaptchaRef.current);
      confirmationResultRef.current = confirmationResult;
      setStep("sent");
    } catch (err: any) {
      console.error("OTP send error:", err);
      let msg = translate("otp.error_send_failed", "Failed to send OTP. Please try again.");
      if (err?.code === "auth/invalid-phone-number") msg = translate("otp.error_invalid_phone", "Please enter a valid phone number.");
      else if (err?.code === "auth/missing-phone-number") msg = translate("otp.error_missing_phone", "Phone number is required.");
      else if (err?.code === "auth/too-many-requests") msg = translate("otp.error_too_many_requests", "Too many requests. Please wait a few minutes and try again.");
      else if (err?.message) msg = err.message;
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
      if (!confirmationResultRef.current) throw new Error("No confirmation result. Please resend the OTP.");
      const result = await confirmationResultRef.current.confirm(otp);
      if (result.user) {
        setIsVerified(true);
        setStep("verified");
        onVerified(true);
        await firebaseAuth.signOut();
      }
    } catch (err: any) {
      console.error("OTP verify error:", err);
      let msg = translate("otp.error_verify_failed", "Verification failed. Please check the code and try again.");
      if (err?.code === "auth/invalid-verification-code") msg = translate("otp.error_invalid_code", "The code you entered is incorrect. Please try again.");
      else if (err?.code === "auth/code-expired") { msg = translate("otp.error_code_expired", "The code has expired. Please resend the OTP."); setStep("sent"); }
      else if (err?.message) msg = err.message;
      setErrorMsg(msg);
      setStep("error");
    }
  };

  const resendOTP = () => { setOtp(""); sendOTP(); };

  if (isVerified) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-300">
        <CheckCircle className="h-5 w-5 flex-shrink-0" />
        <span className="text-sm font-medium">{translate("otp.phone_verified", "Phone number verified")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {step === "idle" && (
        <Button type="button" variant="outline" size="sm" onClick={sendOTP} className="w-full">
          {translate("otp.send_code", "Send SMS Verification Code")}
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
            <Label htmlFor="phone-otp" className="text-sm">
              {translate("otp.enter_code", "Enter the 6-digit code sent to")} {phoneNumber}
            </Label>
            <Input id="phone-otp" type="tel" inputMode="numeric" pattern="[0-9]*" value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder={translate("otp.code_placeholder", "------")} maxLength={6}
              className="font-mono text-center text-lg tracking-widest" />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={resendOTP} className="flex-1">
              {translate("otp.resend", "Resend")}
            </Button>
            <Button type="button" size="sm" onClick={verifyOTP} disabled={!otp || otp.length < 6} className="flex-1">
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

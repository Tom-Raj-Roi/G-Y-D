import { useState, useEffect, useRef, useCallback } from "react";
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
import { firebaseAuth } from "@/integrations/firebase/config";

type PhoneOTPAuthProps = {
  phoneNumber: string;
  onVerified: (verified: boolean) => void;
  defaultVerified?: boolean;
  /** When true, disables app verification so you can test with fictional phone numbers. */
  testMode?: boolean;
};

type FirebaseErrorLike = { code?: string; message?: string };

const RECAPTCHA_CONTAINER_ID = "recaptcha-container-gyd";

export default function PhoneOTPAuth({ phoneNumber, onVerified, defaultVerified = false, testMode = false }: PhoneOTPAuthProps) {
  const { translate, lang } = useLanguage();
  const [step, setStep] = useState<"idle" | "sending" | "sent" | "verifying" | "verified" | "error">("idle");
  const [otp, setOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationResultRef = useRef<ConfirmationResultType | null>(null);
  const [isVerified, setIsVerified] = useState(defaultVerified);

  // ── Localize the reCAPTCHA widget and the SMS message ──────────────
  // Setting languageCode on the Auth instance localizes both the rendered
  // reCAPTCHA widget and the SMS message that Firebase sends to the user.
  useEffect(() => {
    if (firebaseAuth) {
      firebaseAuth.languageCode = lang;
    }
  }, [lang]);

  // ── Enable app-verification bypass for testing ──────────────────────
  // When testMode is true (or VITE_OTP_TEST_MODE is set), Firebase
  // automatically resolves the reCAPTCHA so you can test with fictional
  // phone numbers without solving a real challenge.
  // ⚠️  Never enable this in production.
  useEffect(() => {
    if (firebaseAuth) {
      const isTestMode = testMode || import.meta.env.VITE_OTP_TEST_MODE === "true";
      firebaseAuth.settings.appVerificationDisabledForTesting = isTestMode;
    }
  }, [testMode]);

  /**
   * Properly tear down the reCAPTCHA widget so that a fresh
   * RecaptchaVerifier can be created later without the
   * "reCAPTCHA has already been rendered in this element" error.
   */
  const clearRecaptcha = useCallback(() => {
    if (recaptchaRef.current) {
      try {
        recaptchaRef.current.clear();
      } catch (e) {
        console.warn("Error clearing reCAPTCHA:", e);
      }
      recaptchaRef.current = null;
    }
    // Safety-net: wipe any leftover DOM nodes the verifier may have left behind.
    const container = document.getElementById(RECAPTCHA_CONTAINER_ID);
    if (container) {
      container.innerHTML = "";
    }
  }, []);

  // Reset state whenever the phone number changes, and clean up the
  // reCAPTCHA widget both on dependency change and on unmount.
  useEffect(() => {
    if (isVerified) {
      setIsVerified(false);
      onVerified(false);
    }
    setStep("idle");
    setOtp("");
    setErrorMsg("");
    confirmationResultRef.current = null;

    return () => {
      clearRecaptcha();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneNumber]);

  // Also clean up on unmount even if phoneNumber didn't change.
  useEffect(() => {
    return () => {
      clearRecaptcha();
    };
  }, [clearRecaptcha]);

  const sendOTP = async () => {
    if (!phoneNumber || !phoneNumber.startsWith("+")) {
      setErrorMsg(translate("otp.error_invalid_phone", "Please enter a valid phone number."));
      setStep("error");
      return;
    }
    setStep("sending");
    setErrorMsg("");

    try {
      if (!recaptchaRef.current) {
        const verifier = new RecaptchaVerifier(firebaseAuth, RECAPTCHA_CONTAINER_ID, {
          size: "invisible",
          callback: () => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
            // For invisible reCAPTCHA the challenge resolves automatically;
            // signInWithPhoneNumber is called below which issues the challenge.
          },
          expired_callback: () => {
            setErrorMsg(translate("otp.error_recaptcha_expired", "reCAPTCHA expired. Please try again."));
            setStep("error");
          },
        });
        recaptchaRef.current = verifier;

        // Pre-render the reCAPTCHA so the widget is ready before the user
        // submits the sign-in request. This avoids a flash of unstyled
        // content and ensures the widget ID is available for API calls.
        verifier.render().then((widgetId) => {
          // Store the widget ID for potential manual API calls (e.g. grecaptcha.reset).
          (window as Window & { recaptchaWidgetId?: number }).recaptchaWidgetId = widgetId;
        });
      }
      const confirmationResult = await signInWithPhoneNumber(firebaseAuth, phoneNumber, recaptchaRef.current);
      confirmationResultRef.current = confirmationResult;
      setStep("sent");
    } catch (err) {
      const error = err as FirebaseErrorLike;
      console.error("OTP send error:", error);
      let msg = translate("otp.error_send_failed", "Failed to send OTP. Please try again.");
      if (error?.code === "auth/invalid-phone-number") msg = translate("otp.error_invalid_phone", "Please enter a valid phone number.");
      else if (error?.code === "auth/missing-phone-number") msg = translate("otp.error_missing_phone", "Phone number is required.");
      else if (error?.code === "auth/too-many-requests") msg = translate("otp.error_too_many_requests", "Too many requests. Please wait a few minutes and try again.");
      else if (error?.code === "auth/operation-not-allowed") msg = translate("otp.error_operation_not_allowed", "Phone authentication is not enabled. Please contact the site administrator.");
      else if (error?.code === "auth/missing-credential" || error?.code === "auth/invalid-credential") {
        // reCAPTCHA token expired or invalid – clear and force a fresh verifier on retry.
        clearRecaptcha();
        msg = translate("otp.error_recaptcha_expired", "reCAPTCHA expired. Please try again.");
      }
      else if (error?.message) msg = error.message;
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
        // If the purpose of this component is solely phone verification for a form,
        // signing out immediately might cause unnecessary re-renders of the entire app.
        // Only sign out if a persistent Firebase user session is NOT desired after verification.
        // await firebaseAuth.signOut();
      }
    } catch (err) {
      const error = err as FirebaseErrorLike;
      console.error("OTP verify error:", error);
      let msg = translate("otp.error_verify_failed", "Verification failed. Please check the code and try again.");
      if (error?.code === "auth/invalid-verification-code") msg = translate("otp.error_invalid_code", "The code you entered is incorrect. Please try again.");
      else if (error?.code === "auth/code-expired") { msg = translate("otp.error_code_expired", "The code has expired. Please resend the OTP."); setStep("sent"); }
      else if (error?.message) msg = error.message;
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

  if (!firebaseAuth) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-800 dark:text-yellow-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">
            {translate("otp.error_firebase_not_configured", "Firebase is not configured. Phone verification is disabled.")}
          </span>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => onVerified(true)} className="w-full">
          {translate("otp.skip_verification", "Skip Phone Verification")}
        </Button>
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
      <div id={RECAPTCHA_CONTAINER_ID}></div>
    </div>
  );
}

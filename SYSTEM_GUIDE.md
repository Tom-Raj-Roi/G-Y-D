# GYD system guide

## Everyday editing

1. Sign in at `/auth` with your administrator account, then open `/admin`.
2. Use **Home content** to edit, hide, reorder, or replace the image URL for the home sections. This includes **Who We Are**, **Our Vision**, and **Our Mission**. Saving writes to Supabase and updates the website from the same database.
3. Use **Pages** to create or edit standalone pages. They can be shown automatically in the header and footer.
4. Use **Vacancies** to publish or change jobs.
5. For small text or images in the header, footer, and individual pages, enable **Edit page** from the three-dot menu while signed in as an admin, then click the content you want to change.

## Submission notifications

The migration `20260715000000_admin_notifications_and_remove_otp.sql` creates an in-dashboard notification for every Job Seeker, Job Referrer, Agency, Contact, and Vacancy Application form submission. Notifications are restricted to administrators and identify `ottatyre120421@gmail.com` as the recipient.

To receive actual email as well, deploy `send-admin-notification` and configure it with a transactional email provider:

1. Create a [Resend](https://resend.com) account and verify a sender domain.
2. Set the Supabase function secrets: `RESEND_API_KEY`, `NOTIFICATION_FROM_EMAIL`, and a long random `WEBHOOK_SECRET`.
3. Deploy the function: `supabase functions deploy send-admin-notification`.
4. In Supabase Dashboard → Database → Webhooks, add a webhook for `public.admin_notifications`, event **INSERT**, URL `https://<project-ref>.functions.supabase.co/send-admin-notification`, and header `x-webhook-secret` with the same secret.

The email provider credentials must stay in Supabase secrets. Do not place them in `.env` variables exposed to Vite or in browser code.

## Phone OTP verification (Firebase)

Phone number verification is now handled client-side via **Firebase Phone Authentication** (SMS OTP).

- The Firebase config lives in `src/integrations/firebase/config.ts` and reads credentials from `.env` (`VITE_FIREBASE_*`).
- The reusable component `src/components/PhoneOTPAuth.tsx` sends an SMS code via `signInWithPhoneNumber`, verifies it with `ConfirmationResult.confirm()`, and reports success back to the parent via `onVerified(true)`.
- The **Contact** form (`src/pages/Contact.tsx`) integrates `PhoneOTPAuth` after the phone field. The submit button is disabled until the phone is verified, and `phone_verified` is set to `true` only after successful OTP confirmation.
- `email_verified` is set to `false` by default; email verification can be added separately.
- **Prerequisites:** add your Firebase Web App credentials to `.env` and enable **Phone Authentication** in the Firebase Console → Authentication → Sign-in method.

### reCAPTCHA verifier

`PhoneOTPAuth` uses Firebase's `RecaptchaVerifier` with **invisible** reCAPTCHA (`size: "invisible"`). The verifier is created lazily when the user clicks "Send SMS Verification Code" and is automatically torn down (via `clear()`) on phone-number change and unmount to prevent the "reCAPTCHA has already been rendered" error.

Key features:

- **Localization:** The component sets `firebaseAuth.languageCode` to the current app language (from `useLanguage()`), which localizes both the reCAPTCHA widget and the SMS message sent to the user.
- **Pre-rendering:** The reCAPTCHA is pre-rendered via `verifier.render()` so the widget is ready before the user submits the sign-in request. The widget ID is stored on `window.recaptchaWidgetId` for potential manual API calls (e.g. `grecaptcha.reset`).
- **Testing with fictional phone numbers:** Pass `testMode={true}` to the component or set `VITE_OTP_TEST_MODE=true` in `.env` to enable `appVerificationDisabledForTesting`. This makes Firebase automatically resolve the reCAPTCHA so you can test with fictional phone numbers (configured in the Firebase Console → Authentication → Sign-in method → Phone numbers for testing) without solving a real challenge. **Never enable this in production.**

The old server-side `otp_codes` table was dropped by migration `20260715000000_admin_notifications_and_remove_otp.sql`.

## Language / translation

Navigation and the translation keys in `public/locales/en/translation.json` change with the language selector in the header. Text saved through **Home content** is shared editorial content; it is not automatically machine-translated.

**Google Translate widget** (`src/components/GoogleTranslate.tsx`, rendered in the Header) provides on-demand machine translation for every word on the page — including numbers, form labels, and placeholders — via the Google Translate Element API. It also auto-detects the visitor's browser language and shows a one-time popup offering to translate the page. `autoDisplay: true` ensures all text nodes are translated.

To publish edited content in multiple languages accurately, use a translation workflow (human review is recommended) and store a version for each language before enabling it.

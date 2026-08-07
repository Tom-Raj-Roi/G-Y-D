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

## Email OTP verification

Email verification is handled by the `EmailOTPAuth` component (`src/components/EmailOTPAuth.tsx`), which is used across form submissions. When the user clicks "Send Email Verification Code", the component:

1. Generates an 8-digit code and stores it in `localStorage` with a 10-minute expiration timestamp.
2. Invokes the `send-otp-email` Supabase Edge Function, which sends the code via the [Resend](https://resend.com) API with 8s timeout and automatic retry logic.
3. Once sent, the user enters the code to verify their email address.

**Prerequisites:** deploy the `send-otp-email` Edge Function and configure it with a transactional email provider:

1. Create a [Resend](https://resend.com) account and verify a sender domain (or use Resend's test mode).
2. Set the Supabase function secrets: `RESEND_API_KEY` and `NOTIFICATION_FROM_EMAIL`.
   ```bash
   supabase secrets set RESEND_API_KEY=<your-resend-api-key>
   supabase secrets set NOTIFICATION_FROM_EMAIL=<verified-sender@your-domain.com>
   ```
3. Deploy the function:
   ```bash
   supabase functions deploy send-otp-email
   ```

## Firebase Removal

Firebase has been completely removed from the project. All dependencies (`firebase`), SDK configurations, and phone OTP components have been removed and replaced with direct Supabase Edge Function services.

## Language / translation

Website translation is powered by **Google Translate widget** (`src/components/GoogleTranslate.tsx`, rendered in the Header), providing instant dynamic machine translation for every page, form field, and database content into 30+ supported languages.

- Persistent language selection is managed by `LanguageContext` via the `googtrans` cookie and local storage.
- Auto-detects visitor browser language and provides a seamless translation experience across page refreshes and route transitions.
- All legacy i18next dependencies and unneeded locale translation files have been removed to eliminate conflicts and prevent HTTP 404 errors.

## Database & Security Hardening

The migration `20260807000000_fix_all_security_warnings.sql` resolves all Supabase Security Advisor issues:
- Fixed mutable `search_path` on all SQL functions (`SET search_path = public, pg_temp`).
- Restricted `SECURITY DEFINER` function execution permissions.
- Hardened Row Level Security (RLS) policies on `contacts`, `job_seekers`, `job_referrers`, `agencies`, and `vacancy_applications` to ensure input payloads are validated.

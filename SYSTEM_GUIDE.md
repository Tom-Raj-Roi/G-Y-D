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

## OTP removal

OTP was unused scaffolding. The migration drops the `otp_codes` table, the unused UI component has been removed, and `input-otp` has been removed from dependencies. The normal admin email/password sign-in remains.

## Language content

Navigation and the translation keys already in `src/lib/translations.ts` change with the language selector. Text saved through **Home content** is shared editorial content; it is not automatically machine-translated. To publish edited content in multiple languages accurately, use a translation workflow (human review is recommended) and store a version for each language before enabling it. Automatic browser-side translation is intentionally not used because it would expose inconsistent content and cannot reliably update the database.

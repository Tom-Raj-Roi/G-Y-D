-- =========================================================
-- ADMIN NOTIFICATIONS
-- In-dashboard notification for every form submission.
-- =========================================================
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  submission_type TEXT NOT NULL,  -- 'job_seeker' | 'job_referrer' | 'agency' | 'contact' | 'vacancy_application'
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage notifications
CREATE POLICY "Admins view notifications" ON public.admin_notifications
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage notifications" ON public.admin_notifications
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- TRIGGERS: create a notification on every form submission
-- =========================================================
CREATE OR REPLACE FUNCTION public.create_admin_notification(
  _title TEXT,
  _summary TEXT,
  _submission_type TEXT
)
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_notifications (title, summary, submission_type)
  VALUES (_title, _summary, _submission_type);
  RETURN NULL;
END;
$$;

-- Job Seekers
CREATE TRIGGER job_seekers_notify_admin
  AFTER INSERT ON public.job_seekers
  FOR EACH ROW EXECUTE FUNCTION public.create_admin_notification(
    'New Job Seeker Application',
    'A new job seeker application has been submitted. Open the admin dashboard to review it.',
    'job_seeker'
  );

-- Job Referrers
CREATE TRIGGER job_referrers_notify_admin
  AFTER INSERT ON public.job_referrers
  FOR EACH ROW EXECUTE FUNCTION public.create_admin_notification(
    'New Job Referral',
    'A new job referral has been submitted. Open the admin dashboard to review it.',
    'job_referrer'
  );

-- Agencies
CREATE TRIGGER agencies_notify_admin
  AFTER INSERT ON public.agencies
  FOR EACH ROW EXECUTE FUNCTION public.create_admin_notification(
    'New Agency Registration',
    'A new agency registration has been submitted. Open the admin dashboard to review it.',
    'agency'
  );

-- Contacts
CREATE TRIGGER contacts_notify_admin
  AFTER INSERT ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.create_admin_notification(
    'New Contact Message',
    'A new contact message has been submitted. Open the admin dashboard to review it.',
    'contact'
  );

-- Vacancy Applications
CREATE TRIGGER vacancy_applications_notify_admin
  AFTER INSERT ON public.vacancy_applications
  FOR EACH ROW EXECUTE FUNCTION public.create_admin_notification(
    'New Vacancy Application',
    'A new application has been submitted. Open the admin dashboard to review it.',
    'vacancy_application'
  );

-- =========================================================
-- CLEANUP: drop the old server-side otp_codes table
-- (OTP is now handled entirely by Supabase Auth's built-in
--  email OTP service — no custom table needed.)
-- =========================================================
DROP TABLE IF EXISTS public.otp_codes;
DROP INDEX IF EXISTS public.otp_codes_identifier_idx;

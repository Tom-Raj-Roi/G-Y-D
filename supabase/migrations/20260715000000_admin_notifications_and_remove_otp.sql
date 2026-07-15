/*
  Admin notifications and OTP cleanup

  Every public form insert creates a durable notification that only admins can
  read. This is database-side, so it also works for submissions made outside
  the web UI. Email delivery can be connected to this table with a Supabase
  Database Webhook (see SYSTEM_GUIDE.md).
*/

DROP TABLE IF EXISTS public.otp_codes;

CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_type TEXT NOT NULL,
  submission_id UUID NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  recipient_email TEXT NOT NULL DEFAULT 'ottatyre120421@gmail.com',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS admin_notifications_created_at_idx
  ON public.admin_notifications (created_at DESC);
CREATE INDEX IF NOT EXISTS admin_notifications_unread_idx
  ON public.admin_notifications (read_at) WHERE read_at IS NULL;

CREATE POLICY "Admins view notifications" ON public.admin_notifications
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update notifications" ON public.admin_notifications
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete notifications" ON public.admin_notifications
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.create_admin_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  display_name TEXT;
  submission_label TEXT;
BEGIN
  display_name := COALESCE(
    to_jsonb(NEW)->>'name',
    to_jsonb(NEW)->>'agency_name',
    'New submission'
  );
  submission_label := replace(TG_TABLE_NAME, '_', ' ');

  INSERT INTO public.admin_notifications (submission_type, submission_id, title, summary)
  VALUES (
    TG_TABLE_NAME,
    NEW.id,
    initcap(submission_label) || ' received',
    display_name || COALESCE(' — ' || NULLIF(to_jsonb(NEW)->>'email', ''), '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_admin_job_seekers ON public.job_seekers;
CREATE TRIGGER notify_admin_job_seekers AFTER INSERT ON public.job_seekers
  FOR EACH ROW EXECUTE FUNCTION public.create_admin_notification();

DROP TRIGGER IF EXISTS notify_admin_job_referrers ON public.job_referrers;
CREATE TRIGGER notify_admin_job_referrers AFTER INSERT ON public.job_referrers
  FOR EACH ROW EXECUTE FUNCTION public.create_admin_notification();

DROP TRIGGER IF EXISTS notify_admin_agencies ON public.agencies;
CREATE TRIGGER notify_admin_agencies AFTER INSERT ON public.agencies
  FOR EACH ROW EXECUTE FUNCTION public.create_admin_notification();

DROP TRIGGER IF EXISTS notify_admin_contacts ON public.contacts;
CREATE TRIGGER notify_admin_contacts AFTER INSERT ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.create_admin_notification();

DROP TRIGGER IF EXISTS notify_admin_vacancy_applications ON public.vacancy_applications;
CREATE TRIGGER notify_admin_vacancy_applications AFTER INSERT ON public.vacancy_applications
  FOR EACH ROW EXECUTE FUNCTION public.create_admin_notification();

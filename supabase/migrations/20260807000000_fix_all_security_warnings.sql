-- =========================================================
-- MIGRATION: 20260807000000_fix_all_security_warnings.sql
-- PERMANENT FIX FOR ALL SUPABASE SECURITY ADVISOR WARNINGS
-- =========================================================

-- ---------------------------------------------------------
-- 1. HARDEN SQL FUNCTIONS WITH EXPLICIT IMMUTABLE SEARCH PATH
-- ---------------------------------------------------------

-- Function: is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() AND (role = 'admin'::public.app_role OR role::text = 'admin')
  );
$$;

-- Function: has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

-- Function: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

-- Function: claim_first_admin
CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  admin_count int;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Must be signed in';
  END IF;
  SELECT COUNT(*) INTO admin_count FROM public.user_roles WHERE role = 'admin'::public.app_role;
  IF admin_count > 0 THEN
    RETURN false;
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin'::public.app_role)
  ON CONFLICT DO NOTHING;
  RETURN true;
END;
$$;

-- Function: create_admin_notification
CREATE OR REPLACE FUNCTION public.create_admin_notification(
  _title TEXT,
  _summary TEXT,
  _submission_type TEXT
)
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.admin_notifications (title, summary, submission_type)
  VALUES (_title, _summary, _submission_type);
  RETURN NULL;
END;
$$;

-- Function: check_rate_limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_table text,
  p_identifier text,
  p_max_count int DEFAULT 5,
  p_window_minutes int DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  cnt int;
BEGIN
  EXECUTE format(
    'SELECT COUNT(*) FROM %I WHERE %I = $1 AND created_at > now() - interval %L',
    p_table, 'email', p_window_minutes || ' minutes'
  ) INTO cnt USING p_identifier;
  RETURN cnt < p_max_count;
END;
$$;

-- Function: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function: rls_auto_enable (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'rls_auto_enable' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.rls_auto_enable() SET search_path = public, pg_temp;';
  END IF;
END $$;


-- ---------------------------------------------------------
-- 2. RESTRICT EXECUTION PERMISSIONS ON SECURITY DEFINER FUNCTIONS
-- ---------------------------------------------------------

-- Revoke default public execution privileges
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_admin_notification(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.check_rate_limit(TEXT, TEXT, INT, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, TEXT, INT, INT) TO authenticated;


-- ---------------------------------------------------------
-- 3. REPLACE INSECURE "WITH CHECK (true)" RLS POLICIES
-- ---------------------------------------------------------

-- Table: contacts
DROP POLICY IF EXISTS "Allow public insert for contacts" ON public.contacts;
DROP POLICY IF EXISTS "Anyone submit contact" ON public.contacts;
CREATE POLICY "Allow public insert for contacts" ON public.contacts
  FOR INSERT WITH CHECK (
    email IS NOT NULL AND length(trim(email)) > 3 AND email LIKE '%@%' AND
    name IS NOT NULL AND length(trim(name)) > 0
  );

-- Table: job_seekers
DROP POLICY IF EXISTS "Allow public insert for job_seekers" ON public.job_seekers;
DROP POLICY IF EXISTS "Anyone submit" ON public.job_seekers;
CREATE POLICY "Allow public insert for job_seekers" ON public.job_seekers
  FOR INSERT WITH CHECK (
    email IS NOT NULL AND length(trim(email)) > 3 AND email LIKE '%@%' AND
    name IS NOT NULL AND length(trim(name)) > 0
  );

-- Table: job_referrers
DROP POLICY IF EXISTS "Allow public insert for job_referrers" ON public.job_referrers;
DROP POLICY IF EXISTS "Anyone submit referrer" ON public.job_referrers;
CREATE POLICY "Allow public insert for job_referrers" ON public.job_referrers
  FOR INSERT WITH CHECK (
    email IS NOT NULL AND length(trim(email)) > 3 AND email LIKE '%@%' AND
    name IS NOT NULL AND length(trim(name)) > 0
  );

-- Table: agencies
DROP POLICY IF EXISTS "Allow public insert for agencies" ON public.agencies;
DROP POLICY IF EXISTS "Anyone submit agency" ON public.agencies;
CREATE POLICY "Allow public insert for agencies" ON public.agencies
  FOR INSERT WITH CHECK (
    email IS NOT NULL AND length(trim(email)) > 3 AND email LIKE '%@%' AND
    agency_name IS NOT NULL AND length(trim(agency_name)) > 0
  );

-- Table: vacancy_applications
DROP POLICY IF EXISTS "Allow public insert for vacancy_applications" ON public.vacancy_applications;
DROP POLICY IF EXISTS "Anyone apply" ON public.vacancy_applications;
CREATE POLICY "Allow public insert for vacancy_applications" ON public.vacancy_applications
  FOR INSERT WITH CHECK (
    email IS NOT NULL AND length(trim(email)) > 3 AND email LIKE '%@%' AND
    name IS NOT NULL AND length(trim(name)) > 0
  );


-- ---------------------------------------------------------
-- 4. ENSURE RLS IS ENABLED ON ALL TABLES
-- ---------------------------------------------------------
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_seekers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_referrers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacancy_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

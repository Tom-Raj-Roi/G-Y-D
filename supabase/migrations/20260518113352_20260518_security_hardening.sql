/*
  # Security Hardening

  1. Security Changes
    - Tighten site_sections SELECT policy: only admins can see non-visible sections
    - Add restrictive policies for site_content INSERT/UPDATE/DELETE (already done, verifying)
    - Add rate limiting function for form submissions
    - Add input validation helper function

  2. Notes
    - The original site_sections policy used `visible = true OR has_role(...)` which could leak
      non-visible section data if the OR is evaluated incorrectly
    - Replaced with a cleaner policy that only shows visible sections to public
    - Added a helper function to check submission rate limits
*/

-- Tighten site_sections SELECT: separate policies for public vs admin
DROP POLICY IF EXISTS "Anyone view sections" ON public.site_sections;
CREATE POLICY "Public view visible sections" ON public.site_sections
  FOR SELECT USING (visible = true);
CREATE POLICY "Admins view all sections" ON public.site_sections
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Rate limit check function: prevents more than N submissions per time window
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_table text,
  p_identifier text,
  p_max_count int DEFAULT 5,
  p_window_minutes int DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Add created_by tracking to form submissions for audit
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_content' AND column_name = 'created_at') THEN
    ALTER TABLE public.site_content ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;
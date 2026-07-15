/*
  # Add salary_currency and industry columns

  1. Modified Tables
    - `job_seekers` — add `salary_currency` text column (default 'INR')
    - `job_referrers` — add `salary_currency` text column (default 'INR')
    - `agencies` — add `salary_currency` text column (default 'INR')
    - `vacancies` — add `salary_currency` text column (default 'INR')
    - `vacancies` — add `industry` text column

  2. Notes
    - salary_currency stores ISO 4217 currency codes (e.g. INR, USD, EUR, SAR)
    - industry stores the industry type for vacancies
    - Default 'INR' chosen as the primary operating currency
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_seekers' AND column_name = 'salary_currency') THEN
    ALTER TABLE public.job_seekers ADD COLUMN salary_currency text NOT NULL DEFAULT 'INR';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_referrers' AND column_name = 'salary_currency') THEN
    ALTER TABLE public.job_referrers ADD COLUMN salary_currency text NOT NULL DEFAULT 'INR';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agencies' AND column_name = 'salary_currency') THEN
    ALTER TABLE public.agencies ADD COLUMN salary_currency text NOT NULL DEFAULT 'INR';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vacancies' AND column_name = 'salary_currency') THEN
    ALTER TABLE public.vacancies ADD COLUMN salary_currency text NOT NULL DEFAULT 'INR';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vacancies' AND column_name = 'industry') THEN
    ALTER TABLE public.vacancies ADD COLUMN industry text;
  END IF;
END $$;
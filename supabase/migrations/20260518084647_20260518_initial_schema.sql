/*
  # Initial Schema Setup

  1. New Tables
    - `profiles` — User profiles linked to auth.users
    - `user_roles` — Role-based access control (admin/user)
    - `site_content` — Editable text/image blocks for CMS
    - `site_sections` — Reorderable home page sections
    - `job_seekers` — Job seeker submissions
    - `job_referrers` — Job referrer submissions
    - `agencies` — Agency registrations
    - `vacancies` — Admin-posted job vacancies
    - `vacancy_applications` — Applications to vacancies
    - `contacts` — Contact form submissions
    - `otp_codes` — OTP verification codes (server-side only)
    - `custom_pages` — Admin-created custom pages

  2. Enums
    - `app_role` — admin, user
    - `job_type` — full_time, part_time, freelancer, other
    - `submission_status` — pending, reviewed, approved, rejected

  3. Functions
    - `has_role()` — Check if user has a specific role
    - `handle_new_user()` — Auto-create profile on signup
    - `claim_first_admin()` — Allow first user to claim admin

  4. Storage Buckets
    - `site-assets` (public) — Site images and assets
    - `applications` (private) — Uploaded CVs, cover letters, etc.

  5. Security
    - RLS enabled on all tables
    - Public read for site_content, site_sections, vacancies, custom_pages
    - Admin-only write for most tables
    - Public insert for form submissions (job_seekers, job_referrers, agencies, contacts, vacancy_applications)
    - No client access to otp_codes

  6. Seed Data
    - 6 initial site sections for the home page
*/

-- =========================================================
-- ENUMS
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.job_type AS ENUM ('full_time', 'part_time', 'freelancer', 'other');
CREATE TYPE public.submission_status AS ENUM ('pending', 'reviewed', 'approved', 'rejected');

-- =========================================================
-- PROFILES
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- =========================================================
-- USER ROLES
-- =========================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- SITE CONTENT
-- =========================================================
CREATE TABLE public.site_content (
  id TEXT PRIMARY KEY,
  content_type TEXT NOT NULL DEFAULT 'text',
  value TEXT,
  styles JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Admins insert content" ON public.site_content FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update content" ON public.site_content FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete content" ON public.site_content FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- SITE SECTIONS
-- =========================================================
CREATE TABLE public.site_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  image_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  styles JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view sections" ON public.site_sections FOR SELECT USING (visible = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert sections" ON public.site_sections FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update sections" ON public.site_sections FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete sections" ON public.site_sections FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- JOB SEEKERS
-- =========================================================
CREATE TABLE public.job_seekers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT NOT NULL,
  designation TEXT,
  expected_salary TEXT,
  experience TEXT,
  expected_country TEXT,
  current_position TEXT,
  native_country TEXT,
  cv_url TEXT,
  cover_letter_url TEXT,
  passport_url TEXT,
  certificates_url TEXT,
  phone_verified BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  status submission_status DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.job_seekers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone submit seekers" ON public.job_seekers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view seekers" ON public.job_seekers FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update seekers" ON public.job_seekers FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete seekers" ON public.job_seekers FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- JOB REFERRERS
-- =========================================================
CREATE TABLE public.job_referrers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT NOT NULL,
  job_position TEXT NOT NULL,
  company_name TEXT,
  salary TEXT,
  location TEXT,
  job_expiry_date DATE,
  job_type job_type DEFAULT 'full_time',
  responsibilities TEXT,
  phone_verified BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  status submission_status DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.job_referrers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone submit referrer" ON public.job_referrers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view referrers" ON public.job_referrers FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update referrers" ON public.job_referrers FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete referrers" ON public.job_referrers FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- AGENCIES
-- =========================================================
CREATE TABLE public.agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT NOT NULL,
  job_position TEXT,
  agency_address TEXT,
  location TEXT,
  company_name TEXT,
  salary TEXT,
  job_expiry_date DATE,
  job_type job_type DEFAULT 'full_time',
  responsibilities TEXT,
  license_url TEXT,
  phone_verified BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  status submission_status DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone submit agency" ON public.agencies FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view agencies" ON public.agencies FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update agencies" ON public.agencies FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete agencies" ON public.agencies FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- VACANCIES
-- =========================================================
CREATE TABLE public.vacancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position TEXT NOT NULL,
  company_name TEXT,
  location TEXT,
  salary TEXT,
  experience TEXT,
  job_type job_type DEFAULT 'full_time',
  responsibilities TEXT,
  is_international BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vacancies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view active vacancies" ON public.vacancies FOR SELECT USING (active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert vacancies" ON public.vacancies FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update vacancies" ON public.vacancies FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete vacancies" ON public.vacancies FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- VACANCY APPLICATIONS
-- =========================================================
CREATE TABLE public.vacancy_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vacancy_id UUID REFERENCES public.vacancies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT NOT NULL,
  experience TEXT,
  cv_url TEXT,
  cover_letter_url TEXT,
  certificate_url TEXT,
  passport_url TEXT,
  phone_verified BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vacancy_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone apply" ON public.vacancy_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view applications" ON public.vacancy_applications FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete applications" ON public.vacancy_applications FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- CONTACTS
-- =========================================================
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  details TEXT NOT NULL,
  phone_verified BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone submit contact" ON public.contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view contacts" ON public.contacts FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete contacts" ON public.contacts FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- OTP CODES
-- =========================================================
CREATE TABLE public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  channel TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
CREATE INDEX otp_codes_identifier_idx ON public.otp_codes(identifier, channel);

-- =========================================================
-- CUSTOM PAGES
-- =========================================================
CREATE TABLE public.custom_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT,
  show_in_nav BOOLEAN NOT NULL DEFAULT true,
  show_in_footer BOOLEAN NOT NULL DEFAULT true,
  position INT NOT NULL DEFAULT 0,
  alignment TEXT NOT NULL DEFAULT 'left',
  max_width TEXT NOT NULL DEFAULT 'max-w-4xl',
  hero_image_url TEXT,
  show_hero BOOLEAN NOT NULL DEFAULT true,
  body_size TEXT NOT NULL DEFAULT 'base',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view custom pages" ON public.custom_pages FOR SELECT USING (true);
CREATE POLICY "Admins insert custom pages" ON public.custom_pages FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update custom pages" ON public.custom_pages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete custom pages" ON public.custom_pages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- STORAGE BUCKETS
-- =========================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('applications', 'applications', false)
ON CONFLICT (id) DO NOTHING;

-- site-assets policies
CREATE POLICY "Public read site-assets" ON storage.objects FOR SELECT
  USING (bucket_id = 'site-assets');
CREATE POLICY "Admins upload site-assets" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update site-assets" ON storage.objects FOR UPDATE
  USING (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete site-assets" ON storage.objects FOR DELETE
  USING (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'));

-- applications bucket policies
CREATE POLICY "Anyone upload applications" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'applications');
CREATE POLICY "Admins read applications" ON storage.objects FOR SELECT
  USING (bucket_id = 'applications' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete application files" ON storage.objects FOR DELETE
  USING (bucket_id = 'applications' AND public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- SEED DATA
-- =========================================================
INSERT INTO public.site_sections (key, title, body, position) VALUES
  ('disclaimer', 'Disclaimer', '

Disclaimer & Terms of Use

* This platform/service is completely free of charge. No upfront payment is required from job seekers or employers.

* Employers or company representatives may refer job vacancies through this platform, and job seekers can explore and apply for suitable opportunities.

* Once an employer or referring agent identifies a suitable candidate, they may proceed with their own selection and hiring process independently.

* If a candidate is successfully hired, the person who referred the opportunity may choose to: Offer the referral free of cost, or Request a referral reward from the candidate (optional and mutually agreed).


* Any referral reward or payment must be made only after the candidate has officially joined the company.

* Do not make any payment before joining.

* Candidates who secure a job through a referral are encouraged (but not legally required) to refer other job seekers within their network.

* If any candidate chooses to pay money before joining a job, and suffers any loss, we are not responsible for such transactions.

* Candidates must independently verify the authenticity of job offers, including offer letters, company details, and employment terms.

* We are not responsible for fake or misleading job offers.

* We act only as a platform for connecting job seekers and referrers. We are not involved in hiring decisions or employment contracts.


* Any agreement regarding referral rewards is strictly between the candidate and the referrer. We are not a party to such agreements.

* Users must ensure that all information shared (resume, job details, company info) is accurate and truthful.

* Any misuse of the platform, including scams, false job postings, or misleading information, may result in removal or restriction of access.

* We reserve the right to modify these terms at any time without prior notice.
', 1),
  ('our_services', 'Our Services', 'OUR SERVICE 


We act as a bridge between job seekers and employers who are willing to refer candidates for suitable opportunities. Our platform is completely free to use ¡ª there are no charges or hidden fees at any stage.

If a job seeker successfully secures a position through a referral, they may choose to offer a referral reward based on mutual agreement with the referrer. However, this is entirely optional. If the job seeker does not wish to provide any reward, they are under no obligation to pay ¡ª the service remains 100% free.

Our platform operates at both domestic and international levels, with a special focus on supporting IT job seekers looking for opportunities abroad across various countries.

We encourage all users to utilize this platform responsibly, professionally, and with genuine intent. This initiative is built on trust, transparency, and the goal of helping individuals achieve their career dreams.


', 2),
  ('job_seekers', 'For Job Seekers', 'We are reaching out to individuals who are genuinely interested in the opportunity we are offering. Before proceeding, we strongly encourage you to carefully review our “Who We Are” section, along with the services and disclaimers we provide. This will help you gain a clear understanding of our work, values, and processes.

Our organization is committed to delivering genuine and transparent services. We do not make false promises or provide misleading information. Integrity and honesty are at the core of everything we do.

We kindly request that only serious and committed candidates contact us. If you are interested in pursuing your goals through our services, please ensure that you prepare and submit accurate and complete documentation from your side. Providing false information or fake documents is strictly unacceptable and may lead to immediate disqualification.

We are looking to work with individuals who:

Have a genuine interest in achieving their goals
Are ready to cooperate throughout the process
Value honesty and professionalism

If you are not fully committed, or if your inquiry is only for formality or casual interest, we respectfully ask that you refrain from contacting us. We aim to maintain efficiency and focus on candidates who are serious, as we are not willing to spend valuable time on incomplete or non-serious applications.

Please note that we do not charge fees for initiating your process, so there is no financial risk from your side. However, any complications, losses, or issues arising during the process are borne by us. Therefore, we expect mutual understanding, responsibility, and cooperation.

We appreciate your understanding and look forward to working with sincere and dedicated individuals who are ready to take meaningful steps toward their future.', 3),
  ('job_referrer', 'For Job Referrers', '

We are reaching out to individuals and organizations who are interested in collaborating with us by referring genuine job opportunities for job seekers.

We kindly request that you first review our “Who We Are,” along with the services and disclaimers we provide. This will help you better understand our recruitment standards, ethical practices, and the nature of our operations.

Our organization is committed to delivering authentic and transparent recruitment services. We strictly do not support or entertain fake job offers, false commitments, or misleading information under any circumstances.

If you are willing to refer job opportunities, you are welcome to contact us without hesitation. However, we expect a high level of professionalism and cooperation. We encourage only those referrers who:

Respect time and maintain clear, consistent communication
Are willing to cooperate throughout the recruitment process
Understand the importance of providing accurate and verified information

We strictly prohibit:

Fake offer letters or unverified job references (both domestic and international)
Submission of incorrect, incomplete, or misleading company or job details
Any form of unethical recruitment practices

All job referrals must include complete and accurate information, such as:

Company details and background
Job role, responsibilities, and requirements
Location, salary structure, and employment terms

Additionally, no referrer has the right to request any referral fees, rewards, or payments from candidates before or during the initial stages of the process. We maintain a fair and ethical approach to ensure candidates are protected from exploitation.

We aim to work only with genuine, responsible, and professional referrers who share our values and are committed to helping candidates achieve their career goals. If you are not fully committed, or if your involvement is only temporary or informal, we respectfully request that you do not proceed.

We do not charge candidates for initiating the process, meaning there is no financial burden on their side. However, the responsibility, coordination efforts, and potential risks involved in managing the process are handled by us. Therefore, we expect honesty, accountability, and mutual respect from all our partners.

We value our time and resources and prefer to invest them in meaningful and productive collaborations. We hope you understand and respect our guidelines.

We look forward to working with trusted and genuine job referrers who are committed to maintaining professional standards and delivering real opportunities.', 4),
  ('agency', 'For Agencies', '

We are reaching out to agencies interested in collaborating with us for providing genuine job opportunities to candidates.

We kindly request you to first review our “Who We Are,” along with the services and disclaimers we provide. This will help you clearly understand our operational standards, ethical policies, and the nature of our recruitment process.

Our organization is committed to delivering authentic, transparent, and reliable services. We strictly do not support fake promises, misleading commitments, or unethical recruitment practices under any circumstances.

We welcome agencies that operate on:

Done-based payment models
Free recruitment services
Salary deduction agreements (where applicable and ethical)

If you are willing to refer genuine job opportunities for candidates, you may contact us without hesitation. However, we expect professionalism, accountability, and timely communication. Only agencies that respect time and maintain proper coordination throughout the process should proceed.

We strictly require that:

No fake offer letters or false job references are shared (both domestic and international)
All company details, job descriptions, and employment terms are accurate, complete, and verifiable
Proper documentation and transparent communication are maintained at every stage

Additionally, no agency is permitted to request any upfront payment from candidates before the process begins. Protecting candidates from financial risk and unethical practices is a priority for us.

We are looking to collaborate only with genuine, responsible, and professional agencies that are truly committed to helping candidates achieve their career goals. Agencies that are not serious, discontinue communication midway, or engage only for formalities are kindly requested not to contact us.

Please note that we do not charge candidates to initiate the process. Therefore, there is no financial risk for candidates. However, the responsibility, coordination, and potential challenges involved in managing the process are handled by us. We expect mutual understanding, honesty, and cooperation in return.

We value our time and resources and aim to build long-term partnerships with agencies that share our commitment to integrity and quality service.

We appreciate your understanding and look forward to working with trustworthy recruitment partners.', 5),
  ('contact', 'Contact Us', 'Get in touch with our team for any inquiries, partnerships, or support requests. We respond to every message personally.', 6)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.custom_pages (slug, title, content, show_in_nav, show_in_footer, position)
VALUES (
  'employer-note',
  'Note to Employers / Company Representatives',
  E'Dear Employers / Company Representatives,\n\nWe are reaching out to organizations and company representatives who are interested in collaborating with us by providing genuine job opportunities for candidates.\n\nWe kindly request you to first review our "Who We Are", along with the services and disclaimers we provide. This will help you clearly understand our operational standards, ethical policies, and the nature of our recruitment support process.\n\nOur organization is committed to delivering authentic, transparent, and reliable services. We strictly do not support fake job offers, misleading commitments, or unethical hiring practices under any circumstances.\n\nWe welcome companies and employers who operate with integrity and professionalism, including those offering:\n\n- Direct hiring opportunities\n- Internship or trainee programs\n- Remote or international job roles\n- Ethical employment contracts with clear terms\n\nIf you are willing to provide genuine job opportunities, you are welcome to contact us without hesitation. However, we expect professionalism, accountability, and timely communication throughout the process.\n\nWe strictly require that:\n\n- All job openings shared must be genuine, active, and verifiable\n- No fake offer letters or misleading job descriptions are provided\n- Complete company details, job roles, responsibilities, and employment terms are clearly defined\n- Transparent communication is maintained at every stage of the hiring process\n- Proper documentation and verification processes are followed\n\nImportant Guidelines:\n\n- Employers must not request any upfront payment from candidates at any stage before hiring\n- Any salary deductions or agreements must be clearly communicated, ethical, and legally compliant\n- Candidates must be treated fairly, respectfully, and professionally\n- Employers are responsible for conducting their own interviews, assessments, and hiring decisions\n\nWe aim to collaborate only with genuine, responsible, and professional organizations that are truly committed to hiring qualified candidates and supporting their career growth.\n\nEmployers who are not serious, delay communication, or engage only for formalities are kindly requested not to proceed.\n\nPlease note that we do not charge candidates to initiate the process. Therefore, there is no financial risk for candidates. However, the coordination, effort, and potential challenges involved in managing the process are handled by us. We expect mutual understanding, honesty, and cooperation in return.\n\nWe value our time and resources and aim to build long-term partnerships with companies that share our commitment to integrity, transparency, and quality hiring practices.\n\nWe appreciate your understanding and look forward to working with trustworthy employers and organizations.',
  true, true, 1
)
ON CONFLICT (slug) DO NOTHING;

-- =========================================================
-- CLAIM FIRST ADMIN FUNCTION
-- =========================================================
CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count int;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Must be signed in';
  END IF;
  SELECT COUNT(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
  IF admin_count > 0 THEN
    RETURN false;
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin')
  ON CONFLICT DO NOTHING;
  RETURN true;
END;
$$;
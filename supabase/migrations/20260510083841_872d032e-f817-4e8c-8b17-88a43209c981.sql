
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE IF NOT EXISTS public.custom_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT,
  show_in_nav BOOLEAN NOT NULL DEFAULT true,
  show_in_footer BOOLEAN NOT NULL DEFAULT true,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view custom pages" ON public.custom_pages FOR SELECT USING (true);
CREATE POLICY "Admins insert custom pages" ON public.custom_pages FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update custom pages" ON public.custom_pages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete custom pages" ON public.custom_pages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS trg_custom_pages_updated_at ON public.custom_pages;
CREATE TRIGGER trg_custom_pages_updated_at BEFORE UPDATE ON public.custom_pages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.custom_pages (slug, title, content, show_in_nav, show_in_footer, position)
VALUES (
  'employer-note',
  'Note to Employers / Company Representatives',
  E'Dear Employers / Company Representatives,\n\nWe are reaching out to organizations and company representatives who are interested in collaborating with us by providing genuine job opportunities for candidates.\n\nWe kindly request you to first review our "Who We Are", along with the services and disclaimers we provide. This will help you clearly understand our operational standards, ethical policies, and the nature of our recruitment support process.\n\nOur organization is committed to delivering authentic, transparent, and reliable services. We strictly do not support fake job offers, misleading commitments, or unethical hiring practices under any circumstances.\n\nWe welcome companies and employers who operate with integrity and professionalism, including those offering:\n\n• Direct hiring opportunities\n• Internship or trainee programs\n• Remote or international job roles\n• Ethical employment contracts with clear terms\n\nIf you are willing to provide genuine job opportunities, you are welcome to contact us without hesitation. However, we expect professionalism, accountability, and timely communication throughout the process.\n\nWe strictly require that:\n\n• All job openings shared must be genuine, active, and verifiable\n• No fake offer letters or misleading job descriptions are provided\n• Complete company details, job roles, responsibilities, and employment terms are clearly defined\n• Transparent communication is maintained at every stage of the hiring process\n• Proper documentation and verification processes are followed\n\nImportant Guidelines:\n\n• Employers must not request any upfront payment from candidates at any stage before hiring\n• Any salary deductions or agreements must be clearly communicated, ethical, and legally compliant\n• Candidates must be treated fairly, respectfully, and professionally\n• Employers are responsible for conducting their own interviews, assessments, and hiring decisions\n\nWe aim to collaborate only with genuine, responsible, and professional organizations that are truly committed to hiring qualified candidates and supporting their career growth.\n\nEmployers who are not serious, delay communication, or engage only for formalities are kindly requested not to proceed.\n\nPlease note that we do not charge candidates to initiate the process. Therefore, there is no financial risk for candidates. However, the coordination, effort, and potential challenges involved in managing the process are handled by us. We expect mutual understanding, honesty, and cooperation in return.\n\nWe value our time and resources and aim to build long-term partnerships with companies that share our commitment to integrity, transparency, and quality hiring practices.\n\nWe appreciate your understanding and look forward to working with trustworthy employers and organizations.',
  true, true, 1
)
ON CONFLICT (slug) DO NOTHING;

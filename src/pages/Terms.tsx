import { useEffect } from "react";
import Layout from "@/components/Layout";
import EditableText from "@/components/EditableText";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Terms() {
  const { translate } = useLanguage();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="font-display font-bold text-4xl text-gradient mb-6">{translate("terms.title", "Terms & Conditions")}</h1>
        <div className="prose prose-lg max-w-none text-foreground/80 whitespace-pre-line">
          <p>
            {`By using GET YOUR DREAMS, you agree to provide accurate information in all submissions.

1. Acceptance of Terms

Welcome to GET YOUR DREAMS. By accessing and using this website, you agree to comply with and be bound by these Terms and Conditions. If you do not agree, please do not use our platform.

2. About Our Services

GET YOUR DREAMS acts as a bridge between:

>> Job Seekers
>> Employers
>> Recruitment Agencies
>> Job Referrers

Our mission is to connect qualified candidates with employment opportunities worldwide.

3. Free Service Policy

>> Registration on the platform is free.
>> Job seekers are not required to pay any upfront fees to use our services.
>> Referral rewards, if applicable, are only provided after successful employment confirmation and according to company policy.

4. User Responsibilities

Users agree to:

>> Provide accurate and truthful information.
>> Upload genuine resumes and documents.
>> Maintain confidentiality of account credentials.
>> Comply with applicable laws and regulations.

Users must not:

>> Submit false information.
>> Upload forged certificates or documents.
>> Create fake accounts.
>> Misuse the platform for fraudulent activities.

5. Employer and Agency Responsibilities

Employers and agencies must:

=> Provide genuine job opportunities.
=> Share accurate job descriptions.
=> Follow local employment laws.
=> Avoid misleading candidates.

Any employer or agency found engaging in fraudulent activities may be permanently removed.

6. Job Referrer Guidelines

Job referrers must:

=> Share authentic opportunities only.
=> Avoid misleading candidates.
=> Respect privacy and confidentiality.

Referral benefits are subject to verification and company policies.

7. No Employment Guarantee

GET YOUR DREAMS facilitates connections between parties but does not guarantee:

=> Job placement
=> Interview selection
=> Employment offers
=> Salary levels
=> Visa approvals

Final hiring decisions remain solely with employers.

8. Intellectual Property

All content, logos, branding, text, and website materials belong to GET YOUR DREAMS unless otherwise stated.

Unauthorized copying, reproduction, or distribution is prohibited.

9. Account Suspension

We reserve the right to:

=> Suspend accounts
=> Remove content
=> Restrict access

for violations of these Terms and Conditions.

10. Limitation of Liability

GET YOUR DREAMS shall not be liable for:

=> Employment disputes
=> Employer decisions
=> Recruitment outcomes
=> Financial losses
=> Technical interruptions

Users use the platform at their own discretion.

11. Changes to Terms

We may update these Terms at any time. Continued use of the platform indicates acceptance of revised terms.`}
          </p>
        </div>
      </div>
    </Layout>
  );
}

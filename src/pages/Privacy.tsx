import { useEffect } from "react";
import Layout from "@/components/Layout";
import EditableText from "@/components/EditableText";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Privacy() {
  const { translate } = useLanguage();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="font-display font-bold text-4xl text-gradient mb-6">{translate("privacy.title", "Privacy Policy")}</h1>
        <div className="prose prose-lg max-w-none">
          <EditableText id="privacy.body" multiline as="p" className="text-foreground/80 whitespace-pre-line"
            fallback={`1. Introduction

GET YOUR DREAMS values your privacy and is committed to protecting your personal information.

This Privacy Policy explains how we collect, use, store, and protect your data.

2. Information We Collect

We may collect:

=> Personal Information
=> Full name
=> Email address
=> Phone number
=> Nationality
=> Location
=> Employment Information
=> Resume/CV
=> Educational qualifications
=> Employment history
=> Skills and certifications
=> Job preferences

3. How We Use Your Information

We use information to:

=> Create user accounts
=> Connect candidates with employers
=> Process job applications
=> Improve platform services
=> Communicate with users
=> Verify user information
=> Prevent fraud and misuse

4. Information Sharing

We may share information with:

>> Employers
>> Recruitment agencies
>> Authorized job referrers
>> Service providers supporting platform operations

We do not sell, rent, or trade personal information to third parties.

5. Data Security

We implement reasonable security measures including:

>> Secure databases
>> Access controls
>> Encrypted communications
>> OTP verification where applicable

However, no online system can guarantee 100% security.

6. User Responsibilities

Users should:

>> Keep login credentials secure.
>> Submit accurate information.
>> Report unauthorized access immediately.

7. Data Retention

We retain information only as long as necessary for:

>> Recruitment services
>> Legal compliance
>> Business operations

Data may be deleted upon request where legally permitted.

8. Cookies

Our website may use cookies to:

>> Improve user experience
>> Remember preferences
>> Analyze website traffic
>> Enhance platform performance

Users can disable cookies through browser settings.

9. Third-Party Services

The platform may use third-party services such as:

>> Email services
>> Hosting providers
>> Analytics tools
>> Authentication systems

These providers may process information according to their own privacy policies.

10. Your Rights

Users may:

>> Access their information
>> Update information
>> Request correction
>> Request deletion where applicable
>> Withdraw consent where legally permitted

11. Children's Privacy

Our services are intended for individuals legally eligible to work and seek employment. We do not knowingly collect information from children.

12. Policy Updates

We may update this Privacy Policy periodically. Updated versions will be published on this website.`} />
        </div>
      </div>
    </Layout>
  );
}
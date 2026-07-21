export interface Section {
  id: string;
  key: string;
  title: string;
  body: string | null;
  position: number;
  image_url?: string | null;
  visible?: boolean;
}

export const mergeSiteSections = (dbSections: Partial<Section>[]): Section[] => {
  const defaults = DEFAULT_SECTIONS.map((section) => ({ ...section }));
  const merged = new Map<string, Section>();

  defaults.forEach((section) => merged.set(section.key, section));

  (dbSections || []).forEach((section) => {
    if (!section?.key) return;

    const existing = merged.get(section.key);
    if (!existing) {
      merged.set(section.key, section as Section);
      return;
    }

    merged.set(section.key, {
      ...existing,
      ...section,
      title: section.title?.trim() ? section.title : existing.title,
      body: section.body?.toString().trim() ? section.body : existing.body,
      visible: section.visible ?? existing.visible,
      image_url: section.image_url ?? existing.image_url,
    });
  });

  return Array.from(merged.values()).sort((a, b) => a.position - b.position);
};

// SEED initial site sections (coding number 290 to 409)
export const DEFAULT_SECTIONS: Section[] = [
  {
    id: "410",
    key: "disclaimer",
    title: "Disclaimer",
    body: `

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

* We reserve the right to modify these terms at any time without prior notice.`,
    position: 2,
    visible: true,
  },
  {
    id: "290",
    key: "who_we_are",
    title: "Who We Are",
    body: `GET YOUR DREAMS (GYD) is a global recruitment and career development platform dedicated to connecting talented professionals with trusted employers worldwide. We bridge the gap between job seekers, recruitment agencies, referral partners, and organizations by providing a streamlined and transparent hiring experience.

Our mission is to help individuals achieve their career goals while supporting businesses in finding the right talent to drive growth and success.`,
    position: 1,
    visible: true,
  },
  {
    id: "291",
    key: "our_vision",
    title: "Our Vision",
    body: `To become a leading global recruitment platform that transforms how people find jobs and how organizations hire talent, creating opportunities without borders.

We envision a future where every individual can access meaningful career opportunities and every employer can find the right talent quickly and efficiently.`,
    position: 2,
    visible: true,
  },
  {
    id: "292",
    key: "our_mission",
    title: "Our Mission",
    body: `To empower job seekers by providing access to global career opportunities and to help employers discover qualified talent through a reliable, efficient, and innovative recruitment ecosystem.

We strive to:

Connect talent with opportunities worldwide.
Simplify the hiring process for employers and candidates.
Support career growth through guidance and professional networking.
Build long-term partnerships based on trust and transparency.
Create a positive impact on the global workforce.`,
    position: 3,
    visible: true,
  },
  {
    id: "300",
    key: "our_services",
    title: "Our Services",
    body: `We act as a bridge between job seekers and employers who are willing to refer candidates for suitable opportunities. Our platform is completely free to use — there are no charges or hidden fees at any stage.

If a job seeker successfully secures a position through a referral, they may choose to offer a referral reward based on mutual agreement with the referrer. However, this is entirely optional. If the job seeker does not wish to provide any reward, they are under no obligation to pay — the service remains 100% free.

Our platform operates at both domestic and international levels, with a special focus on supporting IT job seekers looking for opportunities abroad across various countries.

We encourage all users to utilize this platform responsibly, professionally, and with genuine intent. This initiative is built on trust, transparency, and the goal of helping individuals achieve their career dreams.
`,
    position: 4,
    visible: true,
  },
  {
    id: "350",
    key: "job_seekers",
    title: "For Job Seekers",
    body: `We are reaching out to individuals who are genuinely interested in the opportunity we are offering. Before proceeding, we strongly encourage you to carefully review our "Who We Are" section, along with the services and disclaimers we provide. This will help you gain a clear understanding of our work, values, and processes.

Our organization is committed to delivering genuine and transparent services. We do not make false promises or provide misleading information. Integrity and honesty are at the core of everything we do.

We kindly request that only serious and committed candidates contact us. If you are interested in pursuing your goals through our services, please ensure that you prepare and submit accurate and complete documentation from your side. Providing false information or fake documents is strictly unacceptable and may lead to immediate disqualification.

We are looking to work with individuals who:

Have a genuine interest in achieving their goals
Are ready to cooperate throughout the process
Value honesty and professionalism

If you are not fully committed, or if your inquiry is only for formality or casual interest, we respectfully ask that you refrain from contacting us. We aim to maintain efficiency and focus on candidates who are serious, as we are not willing to spend valuable time on incomplete or non-serious applications.

Please note that we do not charge fees for initiating your process, so there is no financial risk from your side. However, any complications, losses, or issues arising during the process are borne by us. Therefore, we expect mutual understanding, responsibility, and cooperation.

We appreciate your understanding and look forward to working with sincere and dedicated individuals who are ready to take meaningful steps toward their future.`,
    position: 5,
    visible: true,
  },
  {
    id: "380",
    key: "job_referrer",
    title: "Become a Job Referrer",
    body: `We are reaching out to individuals and organizations who are interested in collaborating with us by referring genuine job opportunities for job seekers.

We kindly request that you first review our "Who We Are", along with the services and disclaimers we provide. This will help you better understand our recruitment standards, ethical practices, and the nature of our operations.

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

We look forward to working with trusted and genuine job referrers who are committed to maintaining professional standards and delivering real opportunities.`,
    position: 6,
    visible: true,
  },
  {
    id: "400",
    key: "agency",
    title: "Partner With Us - Agencies",
    body: "Are you a recruitment agency looking to expand your reach and offer more opportunities to your candidates? Partner with GET YOUR DREAMS to access our extensive network of international employers and job openings. We welcome collaborations with registered recruitment agencies, manpower consultancies, and HR service providers. Our partnership model is designed to be mutually beneficial - you bring your candidate network, and we provide access to verified job opportunities, documentation support, and placement assistance. Together, we can serve more candidates and create more success stories.",
    position: 7,
    visible: true,
  },
  {
    id: "409",
    key: "contact",
    title: "Get in Touch",
    body: `We would be delighted to hear from you. Whether you are a job seeker exploring new career opportunities, an employer seeking qualified talent, or a prospective partner interested in collaboration, our dedicated team is here to assist you.

Please feel free to contact us through any of our communication channels, and we will respond as promptly as possible. Job seekers are encouraged to submit their CV/resume, cover letter, and any relevant supporting documents to our HR email for review. For general inquiries, business partnerships, or additional information about our services, please reach out through our official information email.

You can also follow and connect with us on our social media platforms to stay informed about the latest job opportunities, industry insights, company updates, and recruitment announcements.
We would love to hear from you! Whether you are a job seeker looking for opportunities, an employer seeking talent, or a potential partner interested in collaboration, our team is ready to assist you. Reach out to us through any of our contact channels, and we will respond promptly. For job applications, please send your CV, cover letter, and supporting documents to our HR email. For general inquiries and partnerships, use our info email. You can also connect with us on our social media channels for the latest updates and job postings.`,
    position: 8,
    visible: true,
  },
  
];
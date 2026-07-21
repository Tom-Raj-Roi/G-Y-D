interface Section {
  id: string;
  key: string;
  title: string;
  body: string | null;
  position: number;
  image_url?: string | null;
  visible?: boolean;
}

// SEED initial site sections (coding number 290 to 409)
export const DEFAULT_SECTIONS: Section[] = [
  {
    id: "290",
    key: "who_we_are",
    title: "Who We Are",
    body: "GET YOUR DREAMS (GYD) is a professional recruitment and career consulting organization dedicated to bridging the gap between talented individuals and global employment opportunities. Founded with a vision to transform lives through meaningful career connections, we operate with integrity, transparency, and a commitment to excellence. Our team comprises experienced HR professionals, career counselors, and industry experts who understand the evolving job market dynamics across multiple sectors and geographies.",
    position: 1,
    visible: true,
  },
  {
    id: "291",
    key: "our_vision",
    title: "Our Vision",
    body: "To become the most trusted global recruitment partner, empowering individuals to achieve their career aspirations while helping organizations build exceptional teams. We envision a world where geographical boundaries do not limit career growth, and every qualified professional has access to opportunities that match their skills and ambitions. Our goal is to create lasting impact by facilitating career transformations that benefit individuals, families, and communities worldwide.",
    position: 2,
    visible: true,
  },
  {
    id: "292",
    key: "our_mission",
    title: "Our Mission",
    body: "Our mission is to provide ethical, transparent, and reliable recruitment services that connect job seekers with genuine employment opportunities across the globe. We are committed to: (1) Maintaining the highest standards of professional integrity in all our dealings, (2) Providing accurate and honest information about job opportunities, (3) Supporting candidates throughout their career journey with guidance and resources, (4) Building long-term relationships with employers who share our values, and (5) Continuously improving our services to meet the evolving needs of the job market.",
    position: 3,
    visible: true,
  },
  {
    id: "300",
    key: "our_services",
    title: "Our Services",
    body: `OUR SERVICE  We act as a bridge between job seekers and employers who are willing to refer candidates for suitable opportunities. Our platform is completely free to use — there are no charges or hidden fees at any stage.

If a job seeker successfully secures a position through a referral, they may choose to offer a referral reward based on mutual agreement with the referrer. However, this is entirely optional. If the job seeker does not wish to provide any reward, they are under no obligation to pay — the service remains 100% free.

Our platform operates at both domestic and international levels, with a special focus on supporting IT job seekers looking for opportunities abroad across various countries.

We encourage all users to utilize this platform responsibly, professionally, and with genuine intent. This initiative is built on trust, transparency, and the goal of helping individuals achieve their career dreams.`,
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
    body: "We would love to hear from you! Whether you are a job seeker looking for opportunities, an employer seeking talent, or a potential partner interested in collaboration, our team is ready to assist you. Reach out to us through any of our contact channels, and we will respond promptly. For job applications, please send your CV, cover letter, and supporting documents to our HR email. For general inquiries and partnerships, use our info email. You can also connect with us on our social media channels for the latest updates and job postings.",
    position: 8,
    visible: true,
  },
];
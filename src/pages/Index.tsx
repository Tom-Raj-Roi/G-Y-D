import { useState } from "react";
import Layout from "@/components/Layout";
import EditableText from "@/components/EditableText";
import EditableImage from "@/components/EditableImage";
import ReadMore from "@/components/ReadMore";
import Reveal from "@/components/Reveal";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Briefcase, Users, Building2, Phone, Globe, Award, Shield, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { DEFAULT_SECTIONS } from "@/lib/content";

// Import hero image from assets
import heroImage from "@/assets/hero.jpg";

// Local image placeholders - drop your JPG/PNG files into src/assets and import them here
import imgDisclaimer from "@/assets/section-disclaimer.jpg";
import imgServices from "@/assets/section-services.jpg";
import imgSeekers from "@/assets/section-seekers.jpg";
import imgReferrer from "@/assets/section-referrer.jpg";
import imgAgency from "@/assets/section-agency.jpg";
import imgContact from "@/assets/section-contact.jpg";
import imgEmployerNote from "@/assets/section-employer-note.jpg";
import imgWhoWeAre from "@/assets/who we are.jpg";
import imgOurVision from "@/assets/our vision.jpg";
import imgOurMission from "@/assets/our mission.jpg";

interface Section {
  id: string;
  key: string;
  title: string;
  body: string | null;
  position: number;
  image_url?: string | null;
  visible?: boolean;
}

const SECTION_CTA_KEYS: Record<string, { key: string; to: string }> = {
  our_services: { key: "cta.learn_more", to: "/our-services" },
  job_seekers: { key: "cta.apply_now", to: "/job-seekers" },
  job_referrer: { key: "cta.post_job", to: "/job-referrer" },
  agency: { key: "cta.register_agency", to: "/agency" },
  contact: { key: "cta.contact_us", to: "/contact" },
};

const SECTION_IMAGES: Record<string, string> = {
  disclaimer: imgDisclaimer,
  our_services: imgServices,
  job_seekers: imgSeekers,
  job_referrer: imgReferrer,
  agency: imgAgency,
  contact: imgContact,
  who_we_are: imgWhoWeAre,
  our_vision: imgOurVision,
  our_mission: imgOurMission,
};

export default function Index() {
  const [sections] = useState<Section[]>(DEFAULT_SECTIONS);
  const { translate } = useLanguage();

  return (
    <Layout>
      {/* Hero Section with Background Image */}
      <section className="relative overflow-hidden min-h-[700px]">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/60" />
        </div>
        <div className="relative container mx-auto px-4 py-28 lg:py-40">
          <div className="max-w-3xl text-primary-foreground space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 backdrop-blur-sm border border-accent/40 rounded-full text-accent text-sm font-medium animate-fade-up">
              <Globe className="h-4 w-4" /> Your Global Career Partner
            </div>
            <EditableText 
              id="hero.title" 
              fallback="Find Your Dream Career, Anywhere in the World"
              as="h1" 
              className="font-display font-bold text-4xl md:text-5xl lg:text-6xl leading-tight animate-slide-left" 
            />
            <EditableText 
              id="hero.subtitle" 
              fallback="GET YOUR DREAMS (GYD) creates relevant job opportunities and workforce solutions across a variety of industries by matching qualified workers with reliable companies worldwide. We are dedicated to helping you succeed at every stage, whether you are an employer looking for outstanding talent or a job seeker pursuing your next professional milestone. This is where your path to development, opportunity, and success starts."
              as="p" 
              className="text-lg md:text-xl lg:text-2xl text-primary-foreground/90 leading-relaxed animate-slide-left" 
              multiline 
            />
            <div className="flex flex-wrap gap-4 animate-fade-up pt-4">
              <Link to="/job-seekers" className="inline-flex items-center justify-center rounded-md text-lg font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-accent text-accent-foreground hover:bg-accent/90 h-11 px-8 py-6">
                Find Jobs <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/current-vacancy" className="inline-flex items-center justify-center rounded-md text-lg font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary h-11 px-8 py-6 border-primary-foreground/40">
                View Vacancies
              </Link>
              <Link to="/contact" className="inline-flex items-center justify-center rounded-md text-lg font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-accent/60 bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground h-11 px-8 py-6">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-card border-y">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <EditableText id="home.stat1.value" fallback="500+" as="div" className="text-4xl font-bold text-foreground" />
              <EditableText id="home.stat1.label" fallback="Successful Placements" as="div" className="text-sm text-muted-foreground" />
            </div>
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <EditableText id="home.stat2.value" fallback="10,000+" as="div" className="text-4xl font-bold text-foreground" />
              <EditableText id="home.stat2.label" fallback="Registered Candidates" as="div" className="text-sm text-muted-foreground" />
            </div>
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <EditableText id="home.stat3.value" fallback="200+" as="div" className="text-4xl font-bold text-foreground" />
              <EditableText id="home.stat3.label" fallback="Partner Companies" as="div" className="text-sm text-muted-foreground" />
            </div>
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <EditableText id="home.stat4.value" fallback="15+" as="div" className="text-4xl font-bold text-foreground" />
              <EditableText id="home.stat4.label" fallback="Countries Served" as="div" className="text-sm text-muted-foreground" />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Reveal>
              <EditableText id="home.why_choose.title" fallback="Why Choose GET YOUR DREAMS?" as="h2" className="font-display font-bold text-3xl md:text-4xl text-gradient mb-4" />
              <EditableText id="home.why_choose.subtitle" fallback="Through honesty, openness, and moral hiring procedures, we are committed to supporting your achievement. We are dedicated to offering trustworthy advice, equitable procedures, and real chances that enable people and businesses to confidently accomplish their objectives." as="p" className="text-muted-foreground text-lg" multiline />
            </Reveal>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Reveal direction="up">
              <div className="bg-card border rounded-2xl p-8 shadow-card hover:shadow-elegant transition-smooth h-full">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <EditableText id="home.feature1.title" fallback="100% Verified Jobs" as="h3" className="font-display font-bold text-xl mb-3" />
                <EditableText id="home.feature1.body" fallback="To guarantee legitimacy and dependability, every job opportunity listed on our platform goes through a rigorous verification process. We don't advertise, support, or publish false, deceptive, or unconfirmed employment offers because we are dedicated to upholding the greatest standards of integrity and openness." as="p" className="text-muted-foreground" multiline />
              </div>
            </Reveal>
            <Reveal direction="up">
              <div className="bg-card border rounded-2xl p-8 shadow-card hover:shadow-elegant transition-smooth h-full">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Award className="h-7 w-7 text-primary" />
                </div>
                <EditableText id="home.feature2.title" fallback="Expert Guidance" as="h3" className="font-display font-bold text-xl mb-3" />
                <EditableText id="home.feature2.body" fallback="Our experienced professionals provide personalized career guidance, resume enhancement support, and interview preparation services to help candidates present their strengths effectively and achieve their career objectives with confidence.
" as="p" className="text-muted-foreground" multiline />
              </div>
            </Reveal>
            <Reveal direction="up">
              <div className="bg-card border rounded-2xl p-8 shadow-card hover:shadow-elegant transition-smooth h-full">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <CheckCircle className="h-7 w-7 text-primary" />
                </div>
                <EditableText id="home.feature3.title" fallback="Transparent Process" as="h3" className="font-display font-bold text-xl mb-3" />
                <EditableText id="home.feature3.body" fallback="We believe in clear and transparent communication throughout every stage of the recruitment process. With no hidden fees, misleading information, or unrealistic promises, we are committed to delivering honest, ethical, and professional recruitment services that you can trust.
" as="p" className="text-muted-foreground" multiline />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-20 space-y-28">
        {sections.filter(s => s.visible !== false).map((s, i) => {
          const img = s.image_url || SECTION_IMAGES[s.key] || imgServices;
          const ctaInfo = SECTION_CTA_KEYS[s.key];
          const reverse = i % 2 === 1;
          const sectionId = s.key.replace(/_/g, "-");
          return (
            <div key={s.id} id={sectionId} className="space-y-28 scroll-mt-24">
              <section className="grid md:grid-cols-2 gap-12 items-center">
                <Reveal direction={reverse ? "right" : "left"} className={reverse ? "md:order-2" : ""}>
                  <EditableImage 
                    id={`section.${s.key}.image`} 
                    fallback={img} 
                    alt={s.title}
                    className="w-full rounded-2xl shadow-elegant object-cover aspect-[4/3]" 
                  />
                </Reveal>
                <Reveal direction={reverse ? "left" : "right"} className="space-y-6">
                  <EditableText 
                    id={`section.${s.key}.title`} 
                    fallback={translate(`section.${s.key}.title`, s.title)}
                    as="h2" 
                    className="font-display font-bold text-3xl md:text-4xl text-gradient" 
                  />
                  {s.key === "contact" ? (
                    <div className="space-y-4 text-base text-foreground/85">
                      <EditableText 
                        id="home.contact.intro"
                        fallback="Reach out to us — We welcome the opportunity to assist you. Whether you have a general inquiry, are interested in a partnership, or require career guidance and support, our team is here to provide prompt, professional, and reliable assistance every step of the way."
                        as="p" 
                        multiline 
                      />
                      <div className="rounded-xl border bg-muted/30 p-6 space-y-3">
                        <p className="flex items-start gap-2">
                          <span className="font-semibold text-primary">General inquiries:</span>
                          <a href="mailto:info@getyourdreams.com" className="text-primary underline">info@getyourdreams.com</a>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="font-semibold text-accent">CV & Documents:</span>
                          <a href="mailto:hr@getyourdreams.com" className="text-accent font-semibold underline">hr@getyourdreams.com</a>
                        </p>
                        <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 mt-3">
                          Please use the info mailbox only for inquiries. All applications and documents must be sent to hr@getyourdreams.com.
                        </p>
                        <div className="pt-2 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-primary" />
                          <span className="font-medium">+966 552390860 | +91 6374504413 | +91 9597589990</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <ReadMore text={s.body || ""} limit={250} />
                  )}
                  {ctaInfo && (
                    <Link to={ctaInfo.to} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md px-8 bg-primary-gradient hover:opacity-90 transition-smooth shadow-elegant">
                      {translate(ctaInfo.key) !== ctaInfo.key ? translate(ctaInfo.key) : ctaInfo.key.split('.')[1].replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  )}
                </Reveal>
              </section>

              {s.key === "job_seekers" && (
                <section className="grid md:grid-cols-2 gap-12 items-center bg-card border rounded-2xl p-8 md:p-12 shadow-card">
                  <Reveal direction="left">
                    <EditableImage
                      id="home.employer_note.image"
                      fallback={imgEmployerNote}
                      alt="Note to Employers"
                      className="w-full rounded-2xl shadow-elegant object-cover aspect-[4/3]"
                    />
                  </Reveal>
                  <Reveal direction="right" className="space-y-6">
                    <EditableText
                      id="home.employer_note_title"
                      fallback="Note to Employers / Company Representatives"
                      as="h2"
                      className="font-display font-bold text-2xl md:text-3xl text-gradient text-center md:text-left"
                    />
                    <ReadMore
                      text={`

We are reaching out to organizations and company representatives who are interested in collaborating with us by providing genuine job opportunities for candidates.

We kindly request you to first review our "Who We Are", along with the services and disclaimers we provide. This will help you clearly understand our operational standards, ethical policies, and the nature of our recruitment support process.

Our organization is committed to delivering authentic, transparent, and reliable services. We strictly do not support fake job offers, misleading commitments, or unethical hiring practices under any circumstances.

We welcome companies and employers who operate with integrity and professionalism.`}
                      limit={300}
                    />
                    <Link to="/p/employer-note" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 rounded-md px-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      Read full note <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Reveal>
                </section>
              )}
            </div>
          );
        })}
      </div>

      {/* Call to Action Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <Reveal>
            <EditableText id="home.cta.title" fallback="Ready to Start Your Journey?" as="h2" className="font-display font-bold text-3xl md:text-4xl mb-6" />
            <EditableText id="home.cta.subtitle"
              fallback="Whether you are looking for your dream job or seeking the perfect candidate, GET YOUR DREAMS is here to help you succeed."
              as="p" className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-10" multiline />
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/job-seekers" className="inline-flex items-center justify-center rounded-md text-lg font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-accent text-accent-foreground hover:bg-accent/90 h-11 px-8 py-6">
                I am a Job Seeker <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/contact" className="inline-flex items-center justify-center rounded-md text-lg font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground hover:text-primary h-11 px-8 py-6">
                I am an Employer
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </Layout>
  );
}

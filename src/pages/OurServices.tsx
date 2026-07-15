import Layout from "@/components/Layout";
import EditableText from "@/components/EditableText";
import EditableImage from "@/components/EditableImage";
import Reveal from "@/components/Reveal";
import imgServices from "@/assets/section-services.jpg";

export default function OurServices() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <Reveal>
          <EditableText id="services.heading" fallback="Our Services"
            as="h1" className="font-display font-bold text-4xl md:text-5xl text-gradient mb-6 text-center" />
        </Reveal>
        <Reveal direction="up" delay={150}>
          <EditableImage id="services.image" fallback={imgServices} alt="Our services"
            className="w-full rounded-2xl shadow-elegant mb-10" />
        </Reveal>
        <div className="prose prose-lg max-w-none space-y-6">
          <EditableText id="services.intro"
            fallback="At GET YOUR DREAMS, we provide end-to-end recruitment solutions for individuals, employers, and agencies worldwide."
            as="p" className="text-xl text-muted-foreground" multiline />
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            {[
              { id: "services.card1.title", title: "International Placements", id2: "services.card1.body", body: "Placements across Saudi Arabia, UAE, Europe, and beyond." },
              { id: "services.card2.title", title: "Career Counselling", id2: "services.card2.body", body: "One-on-one guidance to help you choose the right path." },
              { id: "services.card3.title", title: "Document & Visa Support", id2: "services.card3.body", body: "Full assistance with paperwork, certifications, and visa processing." },
              { id: "services.card4.title", title: "Employer Hiring Solutions", id2: "services.card4.body", body: "Curated talent pools matched to your company's needs." },
            ].map((c) => (
              <div key={c.id} className="p-6 rounded-xl bg-card shadow-card border hover:shadow-elegant transition-smooth">
                <EditableText id={c.id} fallback={c.title} as="h3" className="font-display font-bold text-xl text-primary mb-2" />
                <EditableText id={c.id2} fallback={c.body} as="p" className="text-muted-foreground" multiline />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

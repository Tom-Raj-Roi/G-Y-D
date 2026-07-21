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
              { id: "services.card1", title: "International Placements", body: "Placements across Saudi Arabia, UAE, Europe, and beyond." },
              { id: "services.card2", title: "Career Counselling", body: "One-on-one guidance to help you choose the right path." },
              { id: "services.card3", title: "Document & Visa Support", body: "Full assistance with paperwork, certifications, and visa processing." },
              { id: "services.card4", title: "Employer Hiring Solutions", body: "Curated talent pools matched to your company's needs." },
            ].map((c, i) => (
              <Reveal key={c.id} direction="up" delay={i * 100}>
                <div className="p-6 rounded-xl bg-card shadow-card border hover:shadow-elegant transition-smooth h-full">
                  <EditableText id={`${c.id}.title`} fallback={c.title} as="h3" className="font-display font-bold text-xl text-primary mb-2" />
                  <EditableText id={`${c.id}.body`} fallback={c.body} as="p" className="text-muted-foreground" multiline />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

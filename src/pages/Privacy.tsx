import Layout from "@/components/Layout";
import EditableText from "@/components/EditableText";

export default function Privacy() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="font-display font-bold text-4xl text-gradient mb-6">Privacy Policy</h1>
        <div className="prose prose-lg max-w-none">
          <EditableText id="privacy.body" multiline as="p" className="text-foreground/80 whitespace-pre-line"
            fallback={`Your privacy is important to us. This privacy statement explains the personal data GET YOUR DREAMS processes, how we process it, and for what purposes.`} />
        </div>
      </div>
    </Layout>
  );
}
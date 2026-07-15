import Layout from "@/components/Layout";
import EditableText from "@/components/EditableText";

export default function Terms() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="font-display font-bold text-4xl text-gradient mb-6">Terms & Conditions</h1>
        <div className="prose prose-lg max-w-none">
          <EditableText id="terms.body" multiline as="p" className="text-foreground/80 whitespace-pre-line"
            fallback={`By using GET YOUR DREAMS, you agree to provide accurate information in all submissions.

We do not guarantee placement and act solely as a facilitator between candidates, employers, and agencies.

All personal data is handled in accordance with our privacy policy. You retain ownership of materials you upload.

For full terms, please contact our team. This text is fully editable from the admin edit mode.`} />
        </div>
      </div>
    </Layout>
  );
}

import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Mail, Phone } from "lucide-react";
import PhoneInput from "@/components/PhoneInput";
import { useLanguage } from "@/contexts/LanguageContext";

function generateCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b, answer: a + b };
}

export default function Contact() {
  const { translate } = useLanguage();
  const [form, setForm] = useState({ name: "", contact_number: "", email: "", subject: "", details: "" });
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(captchaInput) !== captcha.answer) {
      toast.error(translate("contact.toast.captcha_incorrect", "Captcha incorrect."));
      setCaptcha(generateCaptcha()); setCaptchaInput("");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("contacts").insert({ ...form, phone_verified: true, email_verified: true });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success(translate("contact.toast.success", "Message sent! We'll be in touch soon."));
    setForm({ name: "", contact_number: "", email: "", subject: "", details: "" });
    setCaptcha(generateCaptcha()); setCaptchaInput("");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="font-display font-bold text-4xl text-gradient mb-2">{translate("contact.title", "Get in Touch")}</h1>
        <p className="text-muted-foreground mb-6">{translate("contact.subtitle", "We'd love to hear from you.")}</p>

        <div className="mb-8 p-5 rounded-xl border bg-accent/10 space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p><strong>{translate("contact.general_inquiries", "General inquiries:")}</strong>{" "}
                <a href="mailto:info@getyourdreams.xyz" className="text-primary underline">info@getyourdreams.xyz</a>
              </p>
              <p><strong>{translate("contact.cv_and_docs", "CV, cover letter & supporting documents:")}</strong>{" "}
                <a href="mailto:hr@getyourdreams.xyz" className="text-primary font-semibold underline">hr@getyourdreams.xyz</a>
              </p>
              <p><strong>{translate("contact.admin_contact", "Admin Contact:")}</strong>{" "}
                <a href="mailto:admin@getyourdreams.xyz" className="text-primary underline">admin@getyourdreams.xyz</a> <span className="text-xs text-muted-foreground">({translate("contact.emergency_only", "contact only for emergency")})</span>
              </p>
              <p className="text-muted-foreground mt-1">
                {translate("contact.important_note", "Please use the info mailbox only for inquiries. All applications and documents must be sent to hr@getyourdreams.xyz.")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-primary shrink-0" />
            <div>
              {translate("contact.phone_numbers", "+966 55 239 0860 | +91 6374 504 413 | +91 9597589990")}
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-5 bg-card p-6 md:p-8 rounded-2xl shadow-card border">
          <div><Label>{translate("form.name", "Name")} *</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div>
            <Label>{translate("form.phone", "Phone")} *</Label>
            <PhoneInput required value={form.contact_number} onChange={(v) => setForm({ ...form, contact_number: v })} />
          </div>
          <div>
            <Label>{translate("form.email", "Email")} *</Label>
            <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div><Label>{translate("form.subject", "Subject")} *</Label><Input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
          <div><Label>{translate("form.message", "Message")} *</Label><Textarea required rows={5} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} /></div>
          <div className="bg-muted/40 p-4 rounded-md flex items-center gap-3">
            <span className="font-mono font-bold text-lg">{captcha.a} + {captcha.b} = ?</span>
            <Input value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} className="w-24" placeholder={translate("form.captcha_answer", "Answer")} />
            <Button type="button" variant="ghost" size="sm" onClick={() => { setCaptcha(generateCaptcha()); setCaptchaInput(""); }}>{translate("form.captcha_refresh", "Refresh")}</Button>
          </div>
          <Button type="submit" disabled={submitting} className="w-full bg-primary-gradient" size="lg">
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} {translate("form.send_message", "Send Message")}
          </Button>
        </form>
      </div>
    </Layout>
  );
}

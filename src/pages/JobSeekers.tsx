import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRIES } from "@/lib/countries";
import { supabase } from "@/integrations/supabase/client";
import { uploadApplicationFile } from "@/lib/uploads";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import PhoneInput from "@/components/PhoneInput";
import CurrencyInput from "@/components/CurrencyInput";
import PageNav from "@/components/PageNav";
import { useLanguage } from "@/contexts/LanguageContext";

export default function JobSeekers() {
  const { translate } = useLanguage();

  const [form, setForm] = useState({
    name: "", contact_number: "", email: "", designation: "", expected_salary: "",
    salary_currency: "INR", experience: "", expected_country: "", current_position: "", native_country: "",
  });
  const [files, setFiles] = useState<{ cv?: File; cover?: File; passport?: File; cert?: File }>({});
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.cv) { toast.error(translate("job_seekers.toast.cv_required", "CV is required.")); return; }
    setSubmitting(true);
    const cv_url = await uploadApplicationFile(files.cv, "seekers/cv");
    const cover_letter_url = files.cover ? await uploadApplicationFile(files.cover, "seekers/cover") : null;
    const passport_url = files.passport ? await uploadApplicationFile(files.passport, "seekers/passport") : null;
    const certificates_url = files.cert ? await uploadApplicationFile(files.cert, "seekers/cert") : null;

    const { error } = await supabase.from("job_seekers").insert({
      ...form, cv_url, cover_letter_url, passport_url, certificates_url,
      phone_verified: true, email_verified: true,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success(translate("job_seekers.toast.success", "Your application has been submitted! Our team will reach out shortly."));
    setForm({ name: "", contact_number: "", email: "", designation: "", expected_salary: "", salary_currency: "INR", experience: "", expected_country: "", current_position: "", native_country: "" });
    setFiles({});
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="font-display font-bold text-4xl text-gradient mb-2">{translate("job_seekers.title", "Job Seekers")}</h1>
        <p className="text-muted-foreground mb-4">{translate("job_seekers.subtitle", "Submit your details and let us match you with your dream role.")}</p>

        <div className="mb-8 p-4 rounded-lg border bg-accent/10 text-sm flex gap-3">
          <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <strong>{translate("job_seekers.important.title", "Important:")}</strong> {translate("job_seekers.important.body1", "Please send your")} <strong>{translate("job_seekers.important.body2", "CV, cover letter, and supporting documents")}</strong> {translate("job_seekers.important.body3", "to")}{" "}
            <a href="mailto:hr@getyourdreams.com" className="text-primary font-semibold underline">hr@getyourdreams.com</a>.
            {translate("job_seekers.important.body4", "Use")} <a href="mailto:info@getyourdreams.com" className="text-primary underline">info@getyourdreams.com</a> {translate("job_seekers.important.body5", "only for general inquiries.")}
            {translate("job_seekers.important.body6", "Always mention your full name and the position you are applying for in the subject.")}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-card p-6 md:p-8 rounded-2xl shadow-card border">
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>{translate("form.full_name", "Full Name")} *</Label><Input required value={form.name} onChange={set("name")} /></div>
            <div><Label>{translate("form.designation", "Designation")}</Label><Input value={form.designation} onChange={set("designation")} /></div>
          </div>

          <div>
            <Label>{translate("form.contact_number", "Contact Number")} *</Label>
            <PhoneInput required value={form.contact_number} onChange={(v) => setForm((f) => ({ ...f, contact_number: v }))} />
          </div>
          <div>
            <Label>{translate("form.email", "Email")} *</Label>
            <Input required type="email" value={form.email} onChange={set("email")} />
          </div>

          <div>
            <Label>{translate("form.expected_salary", "Expected Salary")}</Label>
            <CurrencyInput
              amount={form.expected_salary}
              currency={form.salary_currency}
              onAmountChange={(v) => setForm((f) => ({ ...f, expected_salary: v }))}
              onCurrencyChange={(v) => setForm((f) => ({ ...f, salary_currency: v }))}
              placeholder={translate("form.salary_placeholder", "e.g. 50,000")}
            />
          </div>
          <div><Label>{translate("form.experience", "Experience")}</Label><Input placeholder={translate("form.experience_placeholder", "e.g. 5 years")} value={form.experience} onChange={set("experience")} /></div>

          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>{translate("form.current_position", "Current Position")}</Label><Input value={form.current_position} onChange={set("current_position")} /></div>
            <div><Label>{translate("form.expected_country", "Expected Country")}</Label>
              <Select value={form.expected_country} onValueChange={(v) => setForm((f) => ({ ...f, expected_country: v }))}>
                <SelectTrigger><SelectValue placeholder={translate("form.select_country", "Select country")} /></SelectTrigger>
                <SelectContent className="max-h-72">{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div><Label>{translate("form.native_country", "Native Country")}</Label>
            <Select value={form.native_country} onValueChange={(v) => setForm((f) => ({ ...f, native_country: v }))}>
              <SelectTrigger><SelectValue placeholder={translate("form.select_country", "Select country")} /></SelectTrigger>
              <SelectContent className="max-h-72">{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>{translate("form.updated_cv", "Updated CV (PDF)")} *</Label><Input required type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFiles({ ...files, cv: e.target.files?.[0] })} /></div>
            <div><Label>{translate("form.cover_letter", "Cover Letter")}</Label><Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFiles({ ...files, cover: e.target.files?.[0] })} /></div>
            <div><Label>{translate("form.passport", "Passport (optional)")}</Label><Input type="file" accept="image/*" onChange={(e) => setFiles({ ...files, passport: e.target.files?.[0] })} /></div>
            <div><Label>{translate("form.degree_certificates", "Degree Certificates (optional)")}</Label><Input type="file" accept="image/*" onChange={(e) => setFiles({ ...files, cert: e.target.files?.[0] })} /></div>
          </div>

          <Button type="submit" disabled={submitting} className="w-full bg-primary-gradient" size="lg">
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} {translate("form.submit_application", "Submit Application")}
          </Button>
        </form>

        <PageNav />
      </div>
    </Layout>
  );
}

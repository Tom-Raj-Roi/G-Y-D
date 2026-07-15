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
import { Link } from "react-router-dom";
import PhoneInput from "@/components/PhoneInput";
import CurrencyInput from "@/components/CurrencyInput";

const PAGE_NAV = [
  { to: "/", label: "Home" },
  { to: "/our-services", label: "Our Services" },
  { to: "/job-seekers", label: "Job Seekers" },
  { to: "/job-referrer", label: "Job Referrer" },
  { to: "/current-vacancy", label: "Current Vacancies" },
  { to: "/agency", label: "Agency" },
  { to: "/contact", label: "Contact" },
];

export default function JobSeekers() {
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
    if (!files.cv) { toast.error("CV is required."); return; }
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
    toast.success("Your application has been submitted! Our team will reach out shortly.");
    setForm({ name: "", contact_number: "", email: "", designation: "", expected_salary: "", salary_currency: "INR", experience: "", expected_country: "", current_position: "", native_country: "" });
    setFiles({});
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="font-display font-bold text-4xl text-gradient mb-2">Job Seekers</h1>
        <p className="text-muted-foreground mb-4">Submit your details and let us match you with your dream role.</p>

        <div className="mb-8 p-4 rounded-lg border bg-accent/10 text-sm flex gap-3">
          <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <strong>Important:</strong> Please send your <strong>CV, cover letter, and supporting documents</strong> to{" "}
            <a href="mailto:hr@getyourdreams.com" className="text-primary font-semibold underline">hr@getyourdreams.com</a>.
            Use <a href="mailto:info@getyourdreams.com" className="text-primary underline">info@getyourdreams.com</a> only for general inquiries.
            Always mention your full name and the position you are applying for in the subject.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-card p-6 md:p-8 rounded-2xl shadow-card border">
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Full Name *</Label><Input required value={form.name} onChange={set("name")} /></div>
            <div><Label>Designation</Label><Input value={form.designation} onChange={set("designation")} /></div>
          </div>

          <div>
            <Label>Contact Number *</Label>
            <PhoneInput required value={form.contact_number} onChange={(v) => setForm((f) => ({ ...f, contact_number: v }))} />
          </div>
          <div>
            <Label>Email *</Label>
            <Input required type="email" value={form.email} onChange={set("email")} />
          </div>

          <div>
            <Label>Expected Salary</Label>
            <CurrencyInput
              amount={form.expected_salary}
              currency={form.salary_currency}
              onAmountChange={(v) => setForm((f) => ({ ...f, expected_salary: v }))}
              onCurrencyChange={(v) => setForm((f) => ({ ...f, salary_currency: v }))}
              placeholder="e.g. 50,000"
            />
          </div>
          <div><Label>Experience</Label><Input placeholder="e.g. 5 years" value={form.experience} onChange={set("experience")} /></div>

          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Current Position</Label><Input value={form.current_position} onChange={set("current_position")} /></div>
            <div><Label>Expected Country</Label>
              <Select value={form.expected_country} onValueChange={(v) => setForm((f) => ({ ...f, expected_country: v }))}>
                <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                <SelectContent className="max-h-72">{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div><Label>Native Country</Label>
            <Select value={form.native_country} onValueChange={(v) => setForm((f) => ({ ...f, native_country: v }))}>
              <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent className="max-h-72">{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Updated CV (PDF) *</Label><Input required type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFiles({ ...files, cv: e.target.files?.[0] })} /></div>
            <div><Label>Cover Letter</Label><Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFiles({ ...files, cover: e.target.files?.[0] })} /></div>
            <div><Label>Passport (optional)</Label><Input type="file" accept=".pdf,image/*" onChange={(e) => setFiles({ ...files, passport: e.target.files?.[0] })} /></div>
            <div><Label>Degree Certificates (optional)</Label><Input type="file" accept=".pdf,image/*" onChange={(e) => setFiles({ ...files, cert: e.target.files?.[0] })} /></div>
          </div>

          <Button type="submit" disabled={submitting} className="w-full bg-primary-gradient" size="lg">
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Submit Application
          </Button>
        </form>

        <nav className="mt-10 mb-2 flex flex-wrap justify-center gap-2 border-t pt-6">
          {PAGE_NAV.map((n) => (
            <Link key={n.to} to={n.to}
              className="px-4 py-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground text-sm font-medium transition-smooth">
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </Layout>
  );
}

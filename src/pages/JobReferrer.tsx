import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JOB_TYPES } from "@/lib/countries";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Mail } from "lucide-react";
import PhoneInput from "@/components/PhoneInput";
import CurrencyInput from "@/components/CurrencyInput";
import PageNav from "@/components/PageNav";

export default function JobReferrer() {
  const [form, setForm] = useState({
    name: "", contact_number: "", email: "", job_position: "", company_name: "",
    salary: "", salary_currency: "INR", location: "", job_expiry_date: "", job_type: "full_time", responsibilities: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("job_referrers").insert({
      ...form,
      job_expiry_date: form.job_expiry_date || null,
      job_type: form.job_type as "full_time" | "part_time" | "freelancer" | "other",
      phone_verified: true, email_verified: true,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Job posting submitted privately to admin.");
    setForm({ name: "", contact_number: "", email: "", job_position: "", company_name: "", salary: "", salary_currency: "INR", location: "", job_expiry_date: "", job_type: "full_time", responsibilities: "" });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="font-display font-bold text-4xl text-gradient mb-2">Refer a Job Position</h1>
        <p className="text-muted-foreground mb-4">Have a vacancy? Share details — only our admin team can view your submission.</p>
        <div className="flex items-center gap-2 text-sm text-primary mb-6"><ShieldCheck className="h-4 w-4" /> Confidential — only visible to admin.</div>

        <div className="mb-8 p-4 rounded-lg border bg-accent/10 text-sm flex gap-3">
          <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <strong>Important:</strong> For any inquiries please email{" "}
            <a href="mailto:info@getyourdreams.xyz" className="text-primary underline">info@getyourdreams.xyz</a>.
            Send job details, offer letters and supporting documents to{" "}
            <a href="mailto:hr@getyourdreams.xyz" className="text-primary font-semibold underline">hr@getyourdreams.xyz</a> or <a href="mailto:admin@getyourdreams.xyz" className="text-primary font-semibold underline">admin@getyourdreams.xyz</a> <span className="text-xs text-muted-foreground">(for emergency use)</span>.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-card p-6 md:p-8 rounded-2xl shadow-card border">
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Your Name *</Label><Input required value={form.name} onChange={set("name")} /></div>
            <div><Label>Company Name</Label><Input value={form.company_name} onChange={set("company_name")} /></div>
          </div>
          <div>
            <Label>Contact Number *</Label>
            <PhoneInput required value={form.contact_number} onChange={(v) => setForm((f) => ({ ...f, contact_number: v }))} />
          </div>
          <div>
            <Label>Email *</Label>
            <Input required type="email" value={form.email} onChange={set("email")} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Job Position *</Label><Input required value={form.job_position} onChange={set("job_position")} /></div>
            <div>
              <Label>Salary</Label>
              <CurrencyInput
                amount={form.salary}
                currency={form.salary_currency}
                onAmountChange={(v) => setForm((f) => ({ ...f, salary: v }))}
                onCurrencyChange={(v) => setForm((f) => ({ ...f, salary_currency: v }))}
                placeholder="e.g. 50,000"
              />
            </div>
            <div><Label>Location</Label><Input value={form.location} onChange={set("location")} /></div>
            <div><Label>Job Expiry Date</Label><Input type="date" value={form.job_expiry_date} onChange={set("job_expiry_date")} /></div>
          </div>
          <div>
            <Label>Job Type</Label>
            <Select value={form.job_type} onValueChange={(v) => setForm((f) => ({ ...f, job_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{JOB_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Responsibilities</Label><Textarea rows={5} value={form.responsibilities} onChange={set("responsibilities")} /></div>
          <Button type="submit" disabled={submitting} className="w-full bg-primary-gradient" size="lg">
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Submit Privately
          </Button>
        </form>

        <PageNav />
      </div>
    </Layout>
  );
}

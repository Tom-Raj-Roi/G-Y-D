import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JOB_TYPES } from "@/lib/countries";
import { supabase } from "@/integrations/supabase/client";
import { uploadApplicationFile } from "@/lib/uploads";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import PhoneInput from "@/components/PhoneInput";
import CurrencyInput from "@/components/CurrencyInput";

export default function Agency() {
  const [form, setForm] = useState({
    agency_name: "", contact_number: "", email: "", job_position: "",
    agency_address: "", location: "", company_name: "", salary: "",
    salary_currency: "INR", job_expiry_date: "", job_type: "full_time", responsibilities: "",
  });
  const [licenseFile, setLicenseFile] = useState<File | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseFile) { toast.error("Agency license PDF is required."); return; }
    setSubmitting(true);
    const license_url = await uploadApplicationFile(licenseFile, "agencies/license");
    const { error } = await supabase.from("agencies").insert({
      ...form,
      job_expiry_date: form.job_expiry_date || null,
      job_type: form.job_type as "full_time" | "part_time" | "freelancer" | "other",
      license_url, phone_verified: true, email_verified: true,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Agency submission received privately by admin.");
    setForm({ agency_name: "", contact_number: "", email: "", job_position: "", agency_address: "", location: "", company_name: "", salary: "", salary_currency: "INR", job_expiry_date: "", job_type: "full_time", responsibilities: "" });
    setLicenseFile(undefined);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="font-display font-bold text-4xl text-gradient mb-2">Agency Registration</h1>
        <p className="text-muted-foreground mb-4">Register your recruitment agency with us.</p>
        <div className="flex items-center gap-2 text-sm text-primary mb-6"><ShieldCheck className="h-4 w-4" /> Confidential — only visible to admin.</div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-card p-6 md:p-8 rounded-2xl shadow-card border">
          <div><Label>Agency Name *</Label><Input required value={form.agency_name} onChange={set("agency_name")} /></div>
          <div>
            <Label>Contact Number *</Label>
            <PhoneInput required value={form.contact_number} onChange={(v) => setForm((f) => ({ ...f, contact_number: v }))} />
          </div>
          <div>
            <Label>Email *</Label>
            <Input required type="email" value={form.email} onChange={set("email")} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Job Position</Label><Input value={form.job_position} onChange={set("job_position")} /></div>
            <div><Label>Company Name</Label><Input value={form.company_name} onChange={set("company_name")} /></div>
            <div className="md:col-span-2"><Label>Agency Address</Label><Textarea rows={2} value={form.agency_address} onChange={set("agency_address")} /></div>
            <div><Label>Location</Label><Input value={form.location} onChange={set("location")} /></div>
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
            <div><Label>Job Expiry Date</Label><Input type="date" value={form.job_expiry_date} onChange={set("job_expiry_date")} /></div>
            <div><Label>Job Type</Label>
              <Select value={form.job_type} onValueChange={(v) => setForm((f) => ({ ...f, job_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{JOB_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Responsibilities</Label><Textarea rows={4} value={form.responsibilities} onChange={set("responsibilities")} /></div>
          <div><Label>Agency License (PDF) *</Label><Input required type="file" accept=".pdf,image/*" onChange={(e) => setLicenseFile(e.target.files?.[0])} /></div>
          <Button type="submit" disabled={submitting} className="w-full bg-primary-gradient" size="lg">
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Submit Agency Registration
          </Button>
        </form>
      </div>
    </Layout>
  );
}

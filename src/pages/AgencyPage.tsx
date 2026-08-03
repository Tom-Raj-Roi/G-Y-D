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
import EmailOTPAuth from "@/components/EmailOTPAuth";
import CurrencyInput from "@/components/CurrencyInput";
import { isValidEmail, normalizePhone, sanitizeEmail, sanitizeText, validateUpload } from "@/lib/form-security";

export default function Agency() {
  const [form, setForm] = useState({
    agency_name: "", contact_number: "", email: "", job_position: "",
    agency_address: "", location: "", company_name: "", salary: "",
    salary_currency: "INR", job_expiry_date: "", job_type: "full_time", responsibilities: "",
  });
  const [licenseFile, setLicenseFile] = useState<File | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const safeAgencyName = sanitizeText(form.agency_name);
    const safeEmail = sanitizeEmail(form.email);
    const safeCompanyName = sanitizeText(form.company_name);
    const safeJobPosition = sanitizeText(form.job_position);
    const safePhone = normalizePhone(form.contact_number);

    if (!safeAgencyName || !safeEmail || !safeJobPosition) {
      toast.error("Please fill in the required agency details.");
      return;
    }
    if (!isValidEmail(safeEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    const licenseCheck = validateUpload(licenseFile, "document");
    if (!licenseCheck.ok) {
      toast.error(licenseCheck.reason);
      return;
    }
    if (!emailVerified) {
      toast.warning("Please verify your email address before submitting.");
      return;
    }
    setSubmitting(true);
    const license_url = await uploadApplicationFile(licenseFile!, "agencies/license");
    const submissionData = {
      agency_name: safeAgencyName,
      contact_number: safePhone,
      email: safeEmail,
      job_position: safeJobPosition,
      agency_address: sanitizeText(form.agency_address),
      location: sanitizeText(form.location),
      company_name: safeCompanyName,
      salary: sanitizeText(form.salary),
      salary_currency: form.salary_currency,
      job_expiry_date: form.job_expiry_date || null,
      job_type: form.job_type as "full_time" | "part_time" | "freelancer" | "other",
      responsibilities: sanitizeText(form.responsibilities),
      license_url,
      phone_verified: false,
      email_verified: true,
    };
    const { error } = await supabase.from("agencies").insert(submissionData);
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }

    supabase.functions.invoke("notify-admin-on-submission", {
      body: { subject: `New Agency Registration: ${safeAgencyName}`, message: `<p>A new agency has registered.</p><pre>${JSON.stringify(submissionData, null, 2)}</pre>` },
    });

    toast.success("Agency submission received privately by admin.");
    setForm({ agency_name: "", contact_number: "", email: "", job_position: "", agency_address: "", location: "", company_name: "", salary: "", salary_currency: "INR", job_expiry_date: "", job_type: "full_time", responsibilities: "" });
    setLicenseFile(undefined);
    setEmailVerified(false);
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
          {form.email && (
            <div className="p-4 border rounded-lg bg-muted/20">
              <p className="text-sm text-muted-foreground mb-2">
                Verify your email address using the OTP service.
              </p>
              <EmailOTPAuth email={sanitizeEmail(form.email)} onVerified={setEmailVerified} />
            </div>
          )}
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

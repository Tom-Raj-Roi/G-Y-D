import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import Reveal from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { uploadApplicationFile } from "@/lib/uploads";
import { toast } from "sonner";
import { Briefcase, MapPin, DollarSign, Clock, Loader2, Building2 } from "lucide-react";
import { COUNTRIES, JOB_TYPES } from "@/lib/countries";
import { INDUSTRIES } from "@/lib/dial-codes";
import { findCurrencyByCode } from "@/lib/currencies";
import PhoneInput from "@/components/PhoneInput";

interface Vacancy {
  id: string; position: string; company_name: string | null; location: string | null;
  salary: string | null; salary_currency: string | null; experience: string | null; job_type: string | null;
  responsibilities: string | null; is_international: boolean | null; industry: string | null;
}

function ApplyDialog({ vacancy }: { vacancy: Vacancy }) {
  const [form, setForm] = useState({ name: "", contact_number: "", email: "", experience: "" });
  const [files, setFiles] = useState<{ cv?: File; cover?: File; cert?: File; passport?: File }>({});
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.cv) { toast.error("CV is required."); return; }
    setSubmitting(true);
    const cv_url = await uploadApplicationFile(files.cv, `applications/${vacancy.id}/cv`);
    const cover_letter_url = files.cover ? await uploadApplicationFile(files.cover, `applications/${vacancy.id}/cover`) : null;
    const certificate_url = files.cert ? await uploadApplicationFile(files.cert, `applications/${vacancy.id}/cert`) : null;
    const passport_url = files.passport ? await uploadApplicationFile(files.passport, `applications/${vacancy.id}/passport`) : null;

    const { error } = await supabase.from("vacancy_applications").insert({
      vacancy_id: vacancy.id, ...form, cv_url, cover_letter_url, certificate_url, passport_url,
      phone_verified: true, email_verified: true,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Application submitted!");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent text-accent-foreground hover:bg-accent-glow">Apply Now</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Apply for {vacancy.position}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div><Label>Full Name *</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div>
            <Label>Phone *</Label>
            <PhoneInput required value={form.contact_number} onChange={(v) => setForm({ ...form, contact_number: v })} />
          </div>
          <div>
            <Label>Email *</Label>
            <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div><Label>Experience</Label><Input value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} /></div>
          <div><Label>CV *</Label><Input required type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFiles({ ...files, cv: e.target.files?.[0] })} /></div>
          <div><Label>Cover Letter</Label><Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFiles({ ...files, cover: e.target.files?.[0] })} /></div>
          <div><Label>Certificate</Label><Input type="file" accept=".pdf,image/*" onChange={(e) => setFiles({ ...files, cert: e.target.files?.[0] })} /></div>
          {vacancy.is_international && (
            <div><Label>Passport (required for international roles)</Label>
              <Input type="file" accept=".pdf,image/*" onChange={(e) => setFiles({ ...files, passport: e.target.files?.[0] })} /></div>
          )}
          <Button type="submit" disabled={submitting} className="w-full bg-primary-gradient">
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Submit Application
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CurrentVacancy() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState("");
  const [experience, setExperience] = useState("");
  const [keyword, setKeyword] = useState("");
  const [jobType, setJobType] = useState("");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [intl, setIntl] = useState("");
  const [minSalary, setMinSalary] = useState("");

  useEffect(() => {
    supabase.from("vacancies").select("*").eq("active", true).order("created_at", { ascending: false })
      .then(({ data }) => { setVacancies(data || []); setLoading(false); });
  }, []);

  const companies = Array.from(new Set(vacancies.map(v => v.company_name).filter(Boolean) as string[]));

  const parseSalary = (s: string | null) => {
    if (!s) return 0;
    const m = s.replace(/,/g, "").match(/\d+/g);
    return m ? Math.max(...m.map(Number)) : 0;
  };

  const filtered = vacancies.filter(v => {
    if (country && v.location !== country) return false;
    if (company && v.company_name !== company) return false;
    if (jobType && v.job_type !== jobType) return false;
    if (industry) {
      const hay = `${v.position} ${v.company_name ?? ""} ${v.responsibilities ?? ""}`.toLowerCase();
      if (!hay.includes(industry.toLowerCase())) return false;
    }
    if (intl === "intl" && !v.is_international) return false;
    if (intl === "local" && v.is_international) return false;
    if (experience && !(v.experience || "").toLowerCase().includes(experience.toLowerCase())) return false;
    if (minSalary && parseSalary(v.salary) < Number(minSalary)) return false;
    if (keyword) {
      const k = keyword.toLowerCase();
      const hay = `${v.position} ${v.company_name ?? ""} ${v.responsibilities ?? ""} ${v.location ?? ""}`.toLowerCase();
      if (!hay.includes(k)) return false;
    }
    return true;
  });

  const reset = () => {
    setCountry(""); setExperience(""); setKeyword(""); setJobType(""); setCompany(""); setIndustry(""); setIntl(""); setMinSalary("");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-4xl text-gradient mb-2">Current Vacancies</h1>
        <p className="text-muted-foreground mb-6">Browse our latest opportunities and apply directly.</p>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8 p-4 bg-card border rounded-2xl shadow-card">
          <div>
            <Label className="text-xs">Country / Location</Label>
            <select value={country} onChange={(e) => setCountry(e.target.value)}
              className="w-full h-10 px-3 rounded-md border bg-background text-sm">
              <option value="">All countries</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs">Company</Label>
            <select value={company} onChange={(e) => setCompany(e.target.value)}
              className="w-full h-10 px-3 rounded-md border bg-background text-sm">
              <option value="">All companies</option>
              {companies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs">Industry</Label>
            <select value={industry} onChange={(e) => setIndustry(e.target.value)}
              className="w-full h-10 px-3 rounded-md border bg-background text-sm">
              <option value="">All industries</option>
              {INDUSTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs">Job Type</Label>
            <select value={jobType} onChange={(e) => setJobType(e.target.value)}
              className="w-full h-10 px-3 rounded-md border bg-background text-sm">
              <option value="">All types</option>
              {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs">Scope</Label>
            <select value={intl} onChange={(e) => setIntl(e.target.value)}
              className="w-full h-10 px-3 rounded-md border bg-background text-sm">
              <option value="">All</option>
              <option value="intl">International only</option>
              <option value="local">Local only</option>
            </select>
          </div>
          <div>
            <Label className="text-xs">Experience</Label>
            <Input placeholder="e.g. 2 years, fresher" value={experience} onChange={(e) => setExperience(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Min Salary</Label>
            <Input type="number" placeholder="e.g. 30000" value={minSalary} onChange={(e) => setMinSalary(e.target.value)} />
          </div>
          <div className="lg:col-span-1 md:col-span-2">
            <Label className="text-xs">Keywords</Label>
            <Input placeholder="position, skill…" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button type="button" variant="outline" onClick={reset} className="w-full">Reset filters</Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{filtered.length} of {vacancies.length} vacancies</p>

        {loading ? <p className="text-muted-foreground">Loading…</p>
          : filtered.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-2xl">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No vacancies match your filters.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filtered.map((v, i) => (
                <Reveal key={v.id} delay={i * 80} direction={i % 2 === 0 ? "left" : "right"}>
                  <div className="p-6 rounded-2xl bg-card border shadow-card hover:shadow-elegant transition-smooth">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-display font-bold text-xl text-primary">{v.position}</h3>
                      {v.is_international && <Badge className="bg-accent text-accent-foreground">International</Badge>}
                    </div>
                    {v.company_name && <p className="text-sm text-muted-foreground mb-3">{v.company_name}</p>}
                    <div className="space-y-2 text-sm mb-4">
                      {v.location && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{v.location}</div>}
                      {v.salary && <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" />{v.salary}{v.salary_currency && findCurrencyByCode(v.salary_currency) ? ` ${findCurrencyByCode(v.salary_currency)!.symbol}` : ""}</div>}
                      {v.experience && <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />{v.experience}</div>}
                      {v.industry && <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" />{v.industry}</div>}
                      {v.job_type && <Badge variant="secondary">{v.job_type.replace("_", " ")}</Badge>}
                    </div>
                    {v.responsibilities && <p className="text-sm text-foreground/80 mb-4 line-clamp-3">{v.responsibilities}</p>}
                    <ApplyDialog vacancy={v} />
                  </div>
                </Reveal>
              ))}
            </div>
          )}
      </div>
    </Layout>
  );
}

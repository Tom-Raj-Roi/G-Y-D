import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, Loader2, Trash2, Download, Plus, Shield } from "lucide-react";
import { JOB_TYPES } from "@/lib/countries";
import { INDUSTRIES } from "@/lib/dial-codes";
import { CURRENCIES, findCurrencyByCode } from "@/lib/currencies";
import { toast } from "sonner";
import CurrencyInput from "@/components/CurrencyInput";

function FileLink({ bucket, path, label }: { bucket: string; path: string | null; label: string }) {
  if (!path) return <span className="text-xs text-muted-foreground">—</span>;
  const download = async () => {
    const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };
  return <Button variant="ghost" size="sm" onClick={download}><Download className="h-3 w-3 mr-1" />{label}</Button>;
}

function SubmissionsTable({ table, columns, fileFields = [] }: { table: string; columns: { key: string; label: string }[]; fileFields?: { key: string; bucket: string; label: string }[]; }) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    // @ts-expect-error dynamic table
    const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as Record<string, unknown>[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this submission?")) return;
    // @ts-expect-error dynamic table
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  if (loading) return <Loader2 className="h-5 w-5 animate-spin" />;
  if (rows.length === 0) return <p className="text-muted-foreground py-8 text-center">No submissions yet.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b">
          <tr>
            {columns.map((c) => <th key={c.key} className="text-left p-2 font-semibold">{c.label}</th>)}
            {fileFields.map((f) => <th key={f.key} className="text-left p-2 font-semibold">{f.label}</th>)}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r.id)} className="border-b hover:bg-muted/30">
              {columns.map((c) => <td key={c.key} className="p-2">{String(r[c.key] ?? "—")}</td>)}
              {fileFields.map((f) => <td key={f.key} className="p-2"><FileLink bucket={f.bucket} path={r[f.key] as string | null} label={f.label} /></td>)}
              <td className="p-2"><Button variant="ghost" size="icon" onClick={() => remove(String(r.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VacancyManager() {
  const [vacancies, setVacancies] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState({
    position: "", company_name: "", location: "", salary: "", salary_currency: "INR", experience: "",
    job_type: "full_time", responsibilities: "", industry: "", is_international: false, active: true,
  });
  const [editing, setEditing] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("vacancies").select("*").order("created_at", { ascending: false });
    setVacancies(data || []);
  };
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, job_type: form.job_type as "full_time" | "part_time" | "freelancer" | "other" };
    let error;
    if (editing) {
      ({ error } = await supabase.from("vacancies").update(payload).eq("id", editing));
    } else {
      ({ error } = await supabase.from("vacancies").insert(payload));
    }
    if (error) return toast.error(error.message);
    toast.success(editing ? "Updated" : "Vacancy posted");
    setForm({ position: "", company_name: "", location: "", salary: "", salary_currency: "INR", experience: "", job_type: "full_time", responsibilities: "", industry: "", is_international: false, active: true });
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("vacancies").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="grid md:grid-cols-2 gap-3 p-4 bg-muted/20 rounded-lg">
        <Input required placeholder="Position *" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
        <Input placeholder="Company" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
        <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <div>
          <Label className="text-xs">Salary</Label>
          <CurrencyInput
            amount={form.salary}
            currency={form.salary_currency}
            onAmountChange={(v) => setForm({ ...form, salary: v })}
            onCurrencyChange={(v) => setForm({ ...form, salary_currency: v })}
            placeholder="e.g. 50,000"
          />
        </div>
        <Input placeholder="Experience" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
        <Select value={form.job_type} onValueChange={(v) => setForm({ ...form, job_type: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{JOB_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={form.industry} onValueChange={(v) => setForm({ ...form, industry: v })}>
          <SelectTrigger><SelectValue placeholder="Industry" /></SelectTrigger>
          <SelectContent className="max-h-72">{INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
        </Select>
        <Textarea className="md:col-span-2" placeholder="Responsibilities" value={form.responsibilities} onChange={(e) => setForm({ ...form, responsibilities: e.target.value })} />
        <label className="flex items-center gap-2"><Switch checked={form.is_international} onCheckedChange={(v) => setForm({ ...form, is_international: v })} /> International role</label>
        <label className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /> Active</label>
        <Button type="submit" className="md:col-span-2 bg-primary-gradient"><Plus className="h-4 w-4 mr-1" />{editing ? "Update Vacancy" : "Post Vacancy"}</Button>
      </form>

      <div className="space-y-2">
        {vacancies.map((v) => (
          <div key={String(v.id)} className="flex justify-between items-center p-3 border rounded-lg">
            <div>
              <div className="font-semibold">{String(v.position)} {v.active ? <Badge className="ml-2">Active</Badge> : <Badge variant="secondary" className="ml-2">Inactive</Badge>}</div>
              <div className="text-sm text-muted-foreground">{String(v.company_name || "")} • {String(v.location || "")} {v.industry ? `• ${String(v.industry)}` : ""}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setEditing(String(v.id)); setForm(v as never); }}>Edit</Button>
              <Button variant="ghost" size="icon" onClick={() => remove(String(v.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomPagesManager() {
  const [pages, setPages] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState({
    slug: "", title: "", content: "", show_in_nav: true, show_in_footer: true, position: 0,
    alignment: "left", max_width: "max-w-4xl", body_size: "base", hero_image_url: "", show_hero: true,
  });
  const [editing, setEditing] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("custom_pages").select("*").order("position");
    setPages(data || []);
  };
  useEffect(() => { load(); }, []);

  const reset = () => setForm({
    slug: "", title: "", content: "", show_in_nav: true, show_in_footer: true, position: 0,
    alignment: "left", max_width: "max-w-4xl", body_size: "base", hero_image_url: "", show_hero: true,
  });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = form.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (!slug) return toast.error("Slug required");
    const payload = { ...form, slug };
    let error;
    if (editing) ({ error } = await supabase.from("custom_pages").update(payload).eq("id", editing));
    else ({ error } = await supabase.from("custom_pages").insert(payload));
    if (error) return toast.error(error.message);
    toast.success(editing ? "Updated" : "Page created");
    reset();
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this page?")) return;
    const { error } = await supabase.from("custom_pages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Create a custom page. It will automatically appear in the header navigation and/or footer (toggle below).
        The page is reachable at <code className="px-1 bg-muted rounded">/p/your-slug</code>. Inside the page, admins can also click any text or image (in Edit mode) to refine it visually.
      </p>
      <form onSubmit={save} className="grid md:grid-cols-2 gap-3 p-4 bg-muted/20 rounded-lg">
        <Input required placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Input required placeholder="Slug (e.g. about-us) *" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        <Textarea className="md:col-span-2" rows={8} placeholder="Body content (supports line breaks)" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        <Input className="md:col-span-2" placeholder="Hero image URL (optional, overrides default)" value={form.hero_image_url} onChange={(e) => setForm({ ...form, hero_image_url: e.target.value })} />

        <div>
          <Label className="text-xs">Text alignment</Label>
          <Select value={form.alignment} onValueChange={(v) => setForm({ ...form, alignment: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
              <SelectItem value="justify">Justify</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Body width</Label>
          <Select value={form.max_width} onValueChange={(v) => setForm({ ...form, max_width: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="max-w-2xl">Narrow</SelectItem>
              <SelectItem value="max-w-4xl">Medium</SelectItem>
              <SelectItem value="max-w-6xl">Wide</SelectItem>
              <SelectItem value="max-w-full">Full</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Body text size</Label>
          <Select value={form.body_size} onValueChange={(v) => setForm({ ...form, body_size: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="base">Normal</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
              <SelectItem value="xl">Extra large</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input type="number" placeholder="Position (order)" value={form.position} onChange={(e) => setForm({ ...form, position: Number(e.target.value) })} />

        <label className="flex items-center gap-2"><Switch checked={form.show_hero} onCheckedChange={(v) => setForm({ ...form, show_hero: v })} /> Show hero image</label>
        <label className="flex items-center gap-2"><Switch checked={form.show_in_nav} onCheckedChange={(v) => setForm({ ...form, show_in_nav: v })} /> Show in header navigation</label>
        <label className="flex items-center gap-2"><Switch checked={form.show_in_footer} onCheckedChange={(v) => setForm({ ...form, show_in_footer: v })} /> Show in footer</label>

        <Button type="submit" className="md:col-span-2 bg-primary-gradient">
          <Plus className="h-4 w-4 mr-1" />{editing ? "Update Page" : "Create Page"}
        </Button>
        {editing && <Button type="button" variant="outline" className="md:col-span-2"
          onClick={() => { setEditing(null); reset(); }}>
          Cancel edit
        </Button>}
      </form>

      <div className="space-y-2">
        {pages.map((p) => (
          <div key={String(p.id)} className="flex justify-between items-center p-3 border rounded-lg">
            <div>
              <div className="font-semibold">{String(p.title)}
                {(p as { show_in_nav: boolean }).show_in_nav && <Badge className="ml-2">Nav</Badge>}
                {(p as { show_in_footer: boolean }).show_in_footer && <Badge variant="secondary" className="ml-2">Footer</Badge>}
              </div>
              <div className="text-xs text-muted-foreground">/p/{String(p.slug)}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setEditing(String(p.id)); setForm({
                slug: String(p.slug), title: String(p.title), content: String(p.content || ""),
                show_in_nav: Boolean(p.show_in_nav), show_in_footer: Boolean(p.show_in_footer),
                position: Number(p.position || 0),
                alignment: String((p as Record<string, unknown>).alignment || "left"),
                max_width: String((p as Record<string, unknown>).max_width || "max-w-4xl"),
                body_size: String((p as Record<string, unknown>).body_size || "base"),
                hero_image_url: String((p as Record<string, unknown>).hero_image_url || ""),
                show_hero: (p as Record<string, unknown>).show_hero !== false,
              }); }}>Edit</Button>
              <Button variant="ghost" size="icon" onClick={() => remove(String(p.id))}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type HomeSection = {
  id: string; key: string; title: string; body: string | null; image_url: string | null;
  position: number; visible: boolean;
};

function HomeContentManager() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase.from("site_sections").select("*").order("position");
    if (error) toast.error(error.message);
    setSections(data || []);
  };
  useEffect(() => { load(); }, []);

  const update = (id: string, patch: Partial<HomeSection>) =>
    setSections((items) => items.map((section) => section.id === id ? { ...section, ...patch } : section));

  const save = async (section: HomeSection) => {
    setSaving(section.id);
    const { error } = await supabase.from("site_sections").update({
      title: section.title, body: section.body, image_url: section.image_url,
      position: section.position, visible: section.visible,
    }).eq("id", section.id);
    setSaving(null);
    if (error) return toast.error(error.message);
    toast.success(`${section.title} updated on the website.`);
    load();
  };

  return <div className="space-y-5">
    <p className="text-sm text-muted-foreground">Edit home-page sections here. Saving updates the live database, so the website uses the same text automatically.</p>
    {sections.map((section) => <div key={section.id} className="border rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap gap-3 items-center">
        <Input value={section.title} onChange={(e) => update(section.id, { title: e.target.value })} className="font-semibold" />
        <Input type="number" value={section.position} onChange={(e) => update(section.id, { position: Number(e.target.value) })} className="w-24" aria-label="Display order" />
        <label className="flex items-center gap-2 text-sm"><Switch checked={section.visible} onCheckedChange={(visible) => update(section.id, { visible })} /> Visible</label>
      </div>
      <Textarea rows={6} value={section.body || ""} onChange={(e) => update(section.id, { body: e.target.value })} aria-label={`${section.title} body`} />
      <Input value={section.image_url || ""} onChange={(e) => update(section.id, { image_url: e.target.value || null })} placeholder="Optional image URL" />
      <Button onClick={() => save(section)} disabled={saving === section.id}>
        {saving === section.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save section
      </Button>
    </div>)}
  </div>;
}

type AdminNotification = {
  id: string; title: string; summary: string; submission_type: string; read_at: string | null; created_at: string;
};

function NotificationsManager() {
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("admin_notifications").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  const markAllRead = async () => {
    const { error } = await supabase.from("admin_notifications").update({ read_at: new Date().toISOString() }).is("read_at", null);
    if (error) return toast.error(error.message);
    load();
  };
  const unread = items.filter((item) => !item.read_at).length;
  if (loading) return <Loader2 className="h-5 w-5 animate-spin" />;
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">New public form submissions appear here for <strong>ottatyre120421@gmail.com</strong>.</p><Button variant="outline" onClick={markAllRead} disabled={!unread}><CheckCheck className="h-4 w-4 mr-2" />Mark all read ({unread})</Button></div>
    {items.length === 0 ? <p className="text-muted-foreground py-8 text-center">No notifications yet.</p> : <div className="space-y-2">{items.map((item) => <div key={item.id} className={`border rounded-lg p-3 ${item.read_at ? "bg-muted/20" : "border-primary/40 bg-primary/5"}`}><div className="flex justify-between gap-4"><div><p className="font-semibold">{item.title}</p><p className="text-sm text-muted-foreground">{item.summary}</p></div><time className="text-xs text-muted-foreground whitespace-nowrap">{new Date(item.created_at).toLocaleString()}</time></div></div>)}</div>}
  </div>;
}

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const [hasAdmins, setHasAdmins] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "admin")
      .then(({ count }) => setHasAdmins((count ?? 0) > 0));
  }, []);

  const grantSelfAdmin = async () => {
    if (!user) return;
    const { data, error } = await supabase.rpc("claim_first_admin");
    if (error) toast.error(error.message);
    else if (data === true) { toast.success("You are now an admin. Refreshing…"); setTimeout(() => window.location.reload(), 800); }
    else toast.error("An admin already exists. Ask them to grant you access.");
  };

  if (loading) return <Layout><div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div></Layout>;
  if (!user) return <Navigate to="/auth" replace />;

  // Bootstrap: if no admins exist yet, let the first signed-in user claim it.
  if (!isAdmin && hasAdmins === false) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-md text-center space-y-4">
          <Shield className="h-12 w-12 mx-auto text-primary" />
          <h1 className="font-display font-bold text-2xl">Claim First Admin</h1>
          <p className="text-muted-foreground">No admins exist yet. As the first signed-in user, you can claim admin access for this site.</p>
          <Button onClick={grantSelfAdmin} className="bg-primary-gradient">Grant me admin access</Button>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return <Layout><div className="p-12 text-center text-muted-foreground">Access denied. Contact an existing admin to grant you access.</div></Layout>;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-display font-bold text-3xl text-gradient mb-6">Admin Dashboard</h1>
        <Tabs defaultValue="notifications">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-1" />Notifications</TabsTrigger>
            <TabsTrigger value="content">Home content</TabsTrigger>
            <TabsTrigger value="vacancies">Vacancies</TabsTrigger>
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="seekers">Job Seekers</TabsTrigger>
            <TabsTrigger value="referrers">Referrers</TabsTrigger>
            <TabsTrigger value="agencies">Agencies</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
          </TabsList>
          <TabsContent value="notifications" className="bg-card p-4 rounded-lg border mt-4"><NotificationsManager /></TabsContent>
          <TabsContent value="content" className="bg-card p-4 rounded-lg border mt-4"><HomeContentManager /></TabsContent>
          <TabsContent value="vacancies" className="bg-card p-4 rounded-lg border mt-4"><VacancyManager /></TabsContent>
          <TabsContent value="pages" className="bg-card p-4 rounded-lg border mt-4"><CustomPagesManager /></TabsContent>
          <TabsContent value="seekers" className="bg-card p-4 rounded-lg border mt-4">
            <SubmissionsTable table="job_seekers"
              columns={[{ key: "name", label: "Name" }, { key: "email", label: "Email" }, { key: "contact_number", label: "Phone" }, { key: "designation", label: "Designation" }, { key: "expected_country", label: "Country" }, { key: "experience", label: "Exp" }]}
              fileFields={[
                { key: "cv_url", bucket: "applications", label: "CV" },
                { key: "cover_letter_url", bucket: "applications", label: "Cover" },
                { key: "passport_url", bucket: "applications", label: "Passport" },
                { key: "certificates_url", bucket: "applications", label: "Cert" },
              ]} />
          </TabsContent>
          <TabsContent value="referrers" className="bg-card p-4 rounded-lg border mt-4">
            <SubmissionsTable table="job_referrers"
              columns={[{ key: "name", label: "Referrer" }, { key: "email", label: "Email" }, { key: "company_name", label: "Company" }, { key: "job_position", label: "Position" }, { key: "location", label: "Location" }, { key: "salary", label: "Salary" }]} />
          </TabsContent>
          <TabsContent value="agencies" className="bg-card p-4 rounded-lg border mt-4">
            <SubmissionsTable table="agencies"
              columns={[{ key: "agency_name", label: "Agency" }, { key: "email", label: "Email" }, { key: "contact_number", label: "Phone" }, { key: "location", label: "Location" }, { key: "job_position", label: "Position" }]}
              fileFields={[{ key: "license_url", bucket: "applications", label: "License" }]} />
          </TabsContent>
          <TabsContent value="applications" className="bg-card p-4 rounded-lg border mt-4">
            <SubmissionsTable table="vacancy_applications"
              columns={[{ key: "name", label: "Name" }, { key: "email", label: "Email" }, { key: "contact_number", label: "Phone" }, { key: "experience", label: "Exp" }]}
              fileFields={[
                { key: "cv_url", bucket: "applications", label: "CV" },
                { key: "cover_letter_url", bucket: "applications", label: "Cover" },
                { key: "certificate_url", bucket: "applications", label: "Cert" },
                { key: "passport_url", bucket: "applications", label: "Passport" },
              ]} />
          </TabsContent>
          <TabsContent value="contacts" className="bg-card p-4 rounded-lg border mt-4">
            <SubmissionsTable table="contacts"
              columns={[{ key: "name", label: "Name" }, { key: "email", label: "Email" }, { key: "contact_number", label: "Phone" }, { key: "subject", label: "Subject" }, { key: "details", label: "Message" }]} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

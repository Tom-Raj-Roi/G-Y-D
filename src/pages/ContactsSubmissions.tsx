import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Loader2 } from "lucide-react";

// Define a type for the contact submission for type safety
type ContactSubmission = {
  id: string;
  created_at: string;
  name: string | null;
  email: string | null;
  contact_number: string | null;
  subject: string | null;
  details: string | null;
  email_verified: boolean | null;
  phone_verified: boolean | null;
};

export default function ContactsSubmissions() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      // Fetch data from the 'contacts' table
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching contacts:", error);
        setError("Failed to load submissions. You may not have the correct permissions.");
      } else {
        setSubmissions(data);
      }
      setLoading(false);
    };

    fetchSubmissions();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl text-gradient mb-6">Contact Form Submissions</h1>
        {loading && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Loading submissions...</div>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <div className="space-y-4">
            {submissions.length === 0 ? <p>No submissions yet.</p> : submissions.map((sub) => (
              <div key={sub.id} className="p-4 border rounded-lg bg-card">
                <h3 className="font-bold">{sub.subject || "No Subject"}</h3>
                <p className="text-sm text-muted-foreground">From: {sub.name} ({sub.email}) on {new Date(sub.created_at).toLocaleString()}</p>
                <p className="mt-2 whitespace-pre-wrap">{sub.details}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

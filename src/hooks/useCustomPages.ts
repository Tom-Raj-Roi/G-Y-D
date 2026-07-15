import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CustomPage {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  show_in_nav: boolean;
  show_in_footer: boolean;
  position: number;
}

export function useCustomPages() {
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("custom_pages").select("*").order("position");
    setPages((data as CustomPage[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`custom_pages_changes_${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "custom_pages" }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return { pages, loading, reload: load };
}

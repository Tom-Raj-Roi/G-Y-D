import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import EditableText from "@/components/EditableText";
import EditableImage from "@/components/EditableImage";
import imgFallback from "@/assets/section-employer-note.jpg";

interface PageData {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  alignment?: string | null;
  max_width?: string | null;
  body_size?: string | null;
  hero_image_url?: string | null;
  show_hero?: boolean | null;
}

const ALIGN_MAP: Record<string, string> = {
  left: "text-left", center: "text-center", right: "text-right", justify: "text-justify",
};
const SIZE_MAP: Record<string, string> = {
  sm: "text-sm", base: "text-base", lg: "text-lg", xl: "text-xl",
};
const WIDTH_WHITELIST = new Set(["max-w-2xl", "max-w-4xl", "max-w-6xl", "max-w-full"]);

export default function CustomPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    supabase.from("custom_pages").select("*").eq("slug", slug).maybeSingle().then(({ data }) => {
      if (!data) setNotFound(true); else setPage(data as PageData);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return <Layout><div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div></Layout>;
  }
  if (notFound || !page) return <Navigate to="/404" replace />;

  const alignClass = ALIGN_MAP[page.alignment || "left"] || "text-left";
  const sizeClass = SIZE_MAP[page.body_size || "base"] || "text-base";
  const widthClass = WIDTH_WHITELIST.has(page.max_width || "") ? page.max_width! : "max-w-4xl";
  const showHero = page.show_hero !== false;
  const heroSrc = page.hero_image_url || imgFallback;

  return (
    <Layout>
      <article className={`container mx-auto px-4 py-12 ${widthClass}`}>
        {showHero && (
          <EditableImage
            id={`custom_page.${page.slug}.image`}
            fallback={heroSrc}
            alt={page.title}
            className="w-full rounded-2xl shadow-elegant object-cover aspect-[16/7] mb-8"
          />
        )}
        <EditableText
          id={`custom_page.${page.slug}.title`}
          fallback={page.title}
          as="h1"
          className={`font-display font-bold text-3xl md:text-5xl text-gradient mb-6 ${alignClass}`}
        />
        <EditableText
          id={`custom_page.${page.slug}.content`}
          fallback={page.content || ""}
          as="div"
          multiline
          className={`text-foreground/80 leading-relaxed whitespace-pre-line block bg-card border rounded-2xl p-6 md:p-10 shadow-card ${alignClass} ${sizeClass}`}
        />
      </article>
    </Layout>
  );
}

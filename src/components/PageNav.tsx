import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export const PAGE_NAV_LINKS = [
  { to: "/", key: "nav.home" },
  { to: "/our-services", key: "nav.our_services" },
  { to: "/job-seekers", key: "nav.job_seekers" },
  { to: "/job-referrer", key: "nav.job_referrer" },
  { to: "/current-vacancy", key: "nav.current_vacancy" },
  { to: "/agency", key: "nav.agency" },
  { to: "/contact", key: "nav.contact" },
];

export default function PageNav() {
  const { translate } = useLanguage();

  return <nav className="mt-10 mb-2 flex flex-wrap justify-center gap-2 border-t pt-6">
    {PAGE_NAV_LINKS.map((n) => (
      <Link key={n.to} to={n.to}
        className="px-4 py-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground text-sm font-medium transition-smooth">
        {translate(n.key)}
      </Link>
    ))}
  </nav>;
}
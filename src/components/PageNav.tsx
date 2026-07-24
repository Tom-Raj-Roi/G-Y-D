import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export const PAGE_NAV_LINKS = [
  { to: "/", key: "Home", fallback: "Home" },
  { to: "/our-services", key: "Our Services", fallback: "Our Services" },
  { to: "/job-seekers", key: "Job Seekers", fallback: "Job Seekers" },
  { to: "/job-referrer", key: "Job Referrer", fallback: "Job Referrer" },
  { to: "/current-vacancy", key: "Current Vacancy", fallback: "Current Vacancy" },
  { to: "/agency", key: "Agency", fallback: "Agency" },
  { to: "/contact", key: "Contact", fallback: "Contact" },
];

export default function PageNav() {
  const { translate } = useLanguage();

  return <nav className="mt-10 mb-2 flex flex-wrap justify-center gap-2 border-t pt-6">
    {PAGE_NAV_LINKS.map((n) => (
      <Link key={n.to} to={n.to}
        className="px-4 py-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground text-sm font-medium transition-smooth">
        {translate(n.key, n.fallback)}
      </Link>
    ))}
  </nav>;
}
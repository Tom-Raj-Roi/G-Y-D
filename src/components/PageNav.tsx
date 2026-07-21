import { Link } from "react-router-dom";

const PAGE_NAV = [
  { to: "/", label: "Home" },
  { to: "/our-services", label: "Our Services" },
  { to: "/job-seekers", label: "Job Seekers" },
  { to: "/job-referrer", label: "Job Referrer" },
  { to: "/current-vacancy", label: "Current Vacancies" },
  { to: "/agency", label: "Agency" },
  { to: "/contact", label: "Contact" },
];

export default function PageNav() {
  return <nav className="mt-10 mb-2 flex flex-wrap justify-center gap-2 border-t pt-6">
    {PAGE_NAV.map((n) => (
      <Link key={n.to} to={n.to}
        className="px-4 py-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground text-sm font-medium transition-smooth">
        {n.label}
      </Link>
    ))}
  </nav>;
}
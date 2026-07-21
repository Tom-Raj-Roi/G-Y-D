import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, MessageCircle, Users, Music2, Send } from "lucide-react";
import { useEditor } from "@/contexts/EditorContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCustomPages } from "@/hooks/useCustomPages";
import EditableText from "./EditableText";
import EditableImage from "./EditableImage";
import logoFallback from "@/assets/company-logo.jpg";

const NAV_KEYS = [
  { to: "/", key: "nav.home" },
  { to: "/our-services", key: "nav.our_services" },
  { to: "/job-seekers", key: "nav.job_seekers" },
  { to: "/job-referrer", key: "nav.job_referrer" },
  { to: "/current-vacancy", key: "nav.current_vacancy" },
  { to: "/agency", key: "nav.agency" },
  { to: "/contact", key: "nav.contact" },
];

const SOCIALS: { id: string; label: string; fallback: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "footer.social.whatsapp_channel", label: "WhatsApp Channel", fallback: "https://whatsapp.com/channel/0029VbEKWwnDp2QC77ngL60O", Icon: MessageCircle },
  { id: "footer.social.whatsapp_group", label: "WhatsApp Group", fallback: "https://chat.whatsapp.com/KPggZqVk9Gc63a8NboQzYa", Icon: Users },
  { id: "footer.social.telegram", label: "Telegram", fallback: "https://t.me/+40JIyl-SLqRiYzdl", Icon: Send },
  { id: "footer.social.instagram", label: "Instagram", fallback: "Coming Soon", Icon: Instagram },
  { id: "footer.social.tiktok", label: "TikTok", fallback: "https://www.tiktok.com/@getyourdreams.com?_r=1&_t=ZS-96BztL2vBvZ", Icon: Music2 },
  { id: "footer.social.facebook", label: "Facebook", fallback: "Coming Soon", Icon: Facebook },
  { id: "footer.social.twitter", label: "Twitter / X", fallback: "Coming soon", Icon: Twitter },
  { id: "footer.social.linkedin", label: "LinkedIn", fallback: "Coming Soon", Icon: Linkedin },
];

export default function Footer() {
  const { getContent } = useEditor();
  const { translate } = useLanguage();
  const { pages } = useCustomPages();
  const location = useLocation();
  const [activeLegal, setActiveLegal] = useState<"terms" | "privacy" | null>(null);

  const footerNav = [
    ...NAV_KEYS.map((n) => ({ to: n.to, label: translate(n.key) })),
    ...pages.filter(p => p.show_in_footer).map(p => ({ to: `/p/${p.slug}`, label: p.title })),
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavClick = (to: string) => {
    if (location.pathname === to) {
      scrollToTop();
    } else {
      setTimeout(scrollToTop, 100);
    }
  };

  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <EditableImage id="footer.logo" fallback={logoFallback} alt="Logo"
              className="h-12 w-12 rounded-lg bg-white/10 p-1" />
            <EditableText id="footer.company_name" fallback="GET YOUR DREAMS"
              as="h3" className="font-display font-bold text-lg" />
          </div>
          <EditableText id="footer.tagline" fallback="Connecting talent with opportunity worldwide. Your dream career starts here."
            as="p" className="text-sm text-primary-foreground/80" multiline />
          <div className="mt-4 space-y-2">
            <h5 className="text-xs uppercase tracking-wider text-accent font-semibold">{translate("footer.connect")}</h5>
            <div className="grid grid-cols-1 gap-1.5">
              {SOCIALS.map(({ id, label, fallback, Icon }) => {
                const url = getContent(id, fallback);
                return (
                  <div key={id} className="flex items-center gap-2 text-xs">
                    <a href={url} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 hover:text-accent transition-smooth shrink-0">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{label}</span>
                    </a>
                    <EditableText id={id} fallback={fallback}
                      className="text-primary-foreground/60 truncate text-[10px] underline-offset-2 hover:underline" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-display font-bold mb-4 text-accent">{translate("footer.quick_links")}</h4>
          <ul className="space-y-2 text-sm">
            {footerNav.map((n) => (
              <li key={n.to}>
                <Link to={n.to} onClick={() => handleNavClick(n.to)} className="hover:text-accent transition-smooth">{n.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold mb-4 text-accent">{translate("footer.contact")}</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li className="flex items-start gap-2">
              <Phone className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <EditableText id="footer.phone1" fallback="+966 552390860" /><br />
                <EditableText id="footer.phone2" fallback="+91 6374504413" /><br />
                <EditableText id="footer.phone3" fallback="+91 9597589990" />
              </div>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <div>
                  <EditableText id="footer.email" fallback="info@getyourdreams.com" />
                  <span className="block text-[10px] text-primary-foreground/60">For general inquiries only</span>
                </div>
                <div>
                  <EditableText id="footer.email_hr" fallback="hr@getyourdreams.com" className="font-semibold text-accent" />
                  <span className="block text-[10px] text-primary-foreground/60">Send CV, cover letter & supporting documents here</span>
                </div>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              <EditableText id="footer.address"
                fallback="Head Office: Tiruvannamalai, Tamil Nadu, India&#10;Branch: Dharmapuri, Tamil Nadu, India"
                multiline />
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold mb-4 text-accent">{translate("footer.legal")}</h4>
          <p className="text-sm text-primary-foreground/80 mb-4">GET YOUR DREAMS values your privacy and is committed to protecting your personal information.</p>
          <ul className="space-y-2 text-sm">
            <li>
              <button type="button" onClick={() => setActiveLegal(activeLegal === "terms" ? null : "terms")}
                className="text-left w-full hover:text-accent transition-smooth">
                {translate("footer.terms_and_conditions")}
              </button>
            </li>
            <li>
              <button type="button" onClick={() => setActiveLegal(activeLegal === "privacy" ? null : "privacy")}
                className="text-left w-full hover:text-accent transition-smooth">
                {translate("footer.privacy_policy")}
              </button>
            </li>
            <li><Link to="/contact" onClick={() => handleNavClick("/contact")} className="hover:text-accent transition-smooth">{translate("footer.support")}</Link></li>
          </ul>
          {activeLegal === "terms" && (
            <div className="mt-4 space-y-2 text-sm text-primary-foreground/80">
              <p>
                These Terms describe how GET YOUR DREAMS works, what is expected from users, and the limits on our liability.
                By using the site, you agree to act responsibly and provide accurate information.
              </p>
              <p>
                We serve job seekers, employers, agencies, and referrers by connecting them through our recruitment platform.
                Violations may result in restrictions, account suspension, or removal.
              </p>
            </div>
          )}
          {activeLegal === "privacy" && (
            <div className="mt-4 space-y-2 text-sm text-primary-foreground/80">
              <p>
                GET YOUR DREAMS collects and uses personal information to deliver recruitment services and support your job search.
                We do not sell your data and only share it with trusted partners when needed to provide our service.
              </p>
              <p>
                You may request corrections, updates, or deletion of your information where legally permitted.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-primary-foreground/10 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-primary-foreground/70">
          <EditableText id="footer.copyright"
            fallback="© 2026 GET YOUR DREAMS. All rights reserved." />
        </div>
      </div>
    </footer>
  );
}

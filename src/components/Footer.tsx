import { Link, useLocation } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, MessageCircle, Users, Music2, Send } from "lucide-react";
import { useEditor } from "@/contexts/EditorContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCustomPages } from "@/hooks/useCustomPages";
import { PAGE_NAV_LINKS } from "./PageNav";
import EditableText from "./EditableText";
import EditableImage from "./EditableImage";
import logoFallback from "@/assets/company-logo.jpg";

const SOCIALS: { id: string; label: string; fallback: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "footer.social.whatsapp_channel", label: "socials.whatsapp_channel", fallback: "https://whatsapp.com/channel/0029VbEKWwnDp2QC77ngL60O", Icon: MessageCircle },
  { id: "footer.social.whatsapp_group", label: "socials.whatsapp_group", fallback: "https://chat.whatsapp.com/KPggZqVk9Gc63a8NboQzYa", Icon: Users },
  { id: "footer.social.telegram", label: "socials.telegram", fallback: "https://t.me/+40JIyl-SLqRiYzdl", Icon: Send },
  { id: "footer.social.instagram", label: "socials.instagram", fallback: "Coming Soon", Icon: Instagram },
  { id: "footer.social.tiktok", label: "socials.tiktok", fallback: "https://www.tiktok.com/@getyourdreams.com?_r=1&_t=ZS-96BztL2vBvZ", Icon: Music2 },
  { id: "footer.social.facebook", label: "socials.facebook", fallback: "Coming Soon", Icon: Facebook },
  { id: "footer.social.twitter", label: "socials.twitter", fallback: "Coming soon", Icon: Twitter },
  { id: "footer.social.linkedin", label: "socials.linkedin", fallback: "Coming Soon", Icon: Linkedin },
];

export default function Footer() {
  const { getContent } = useEditor();
  const { translate } = useLanguage();
  const { pages } = useCustomPages();
  const location = useLocation();



  const footerNav = [
    ...PAGE_NAV_LINKS.map((n) => ({ to: n.to, label: translate(n.key) })),
    ...pages.filter((p) => p.show_in_footer).map((p) => ({ to: `/p/${p.slug}`, label: getContent(`custom_page.${p.slug}.title`, p.title) })),
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavClick = (to: string) => {
    if (location.pathname === to) {
      scrollToTop();
      return;
    }

    setTimeout(scrollToTop, 150);
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
                      <span className="font-medium">{translate(label)}</span>
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
                  <EditableText id="footer.email" fallback="info@getyourdreams.xyz" />
                  <span className="block text-[10px] text-primary-foreground/60">{translate("footer.general_inquiries_only", "For general inquiries only")}</span>
                </div>
                <div>
                  <EditableText id="footer.email_hr" fallback="hr@getyourdreams.xyz" className="font-semibold text-accent" />
                  <span className="block text-[10px] text-primary-foreground/60">{translate("footer.send_cv_here", "Send CV, cover letter & supporting documents here")}</span>
                </div>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              <EditableText id="footer.address"
                fallback="Head Office: Tiruvannamalai, Tamil Nadu, India"
                multiline />
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              <EditableText id="footer.address"
                fallback="Office Branch: Dharmapuri, Tamil Nadu, India"
                multiline />
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold mb-4 text-accent">{translate("footer.legal")}</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/terms" onClick={() => handleNavClick("/terms")} className="block text-left w-full hover:text-accent transition-smooth">
                {translate("footer.terms")}
              </Link>
            </li>
            <li>
              <Link to="/privacy" onClick={() => handleNavClick("/privacy")} className="block text-left w-full hover:text-accent transition-smooth">
                {translate("footer.privacy")}
              </Link>
            </li>
            <li>
              <Link to="/contact" onClick={() => handleNavClick("/contact")} className="hover:text-accent transition-smooth">
                {translate("footer.support")}
              </Link>
            </li>
          </ul>
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

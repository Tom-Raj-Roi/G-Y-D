import { Link, NavLink } from "react-router-dom";
import { Mail, Phone, MoreVertical, Globe, LogOut, Settings, Pencil } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import EditableText from "./EditableText";
import EditableImage from "./EditableImage";
import { useEditor } from "@/contexts/EditorContext";
import { useAuth } from "@/contexts/AuthContext";
import { LANGUAGES, useLanguage } from "@/contexts/LanguageContext";
import { PAGE_NAV_LINKS } from "./PageNav";
import { useCustomPages } from "@/hooks/useCustomPages";
import logoFallback from "@/assets/company-logo.jpg";

export default function Header() {
  const { editMode, toggleEditMode } = useEditor();
  const { isAdmin, signOut } = useAuth();
  const { lang, setLang, translate } = useLanguage();
  const { pages } = useCustomPages();
  const navItems = [
    ...PAGE_NAV_LINKS.map(n => ({ to: n.to, label: translate(n.key) })),
    ...pages.filter(p => p.show_in_nav).map(p => ({ to: `/p/${p.slug}`, label: p.title }))
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b shadow-card">
      <div className="container mx-auto px-4 py-3 flex items-center gap-4 flex-wrap lg:flex-nowrap">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <EditableImage
            id="header.logo"
            fallback={logoFallback}
            alt="GET YOUR DREAMS Logo"
            className="h-16 w-16 lg:h-20 lg:w-20 object-contain rounded-lg"
          />
          <div className="flex flex-col leading-tight">
            <EditableText
              id="header.company_short"
              fallback="GYD"
              as="span"
              className="font-display font-extrabold text-2xl lg:text-3xl text-gradient"
            />
            <EditableText
              id="header.company_name"
              fallback="GET YOUR DREAMS"
              as="span"
              className="font-display font-semibold text-xs lg:text-sm text-primary tracking-wide"
            />
          </div>
        </Link>

        <div className="flex-1 hidden md:flex flex-col items-center text-xs lg:text-sm text-muted-foreground">
          <div className="flex items-center gap-1 lg:gap-3 flex-wrap justify-center">
            <Phone className="h-3.5 w-3.5 text-primary" />
            <EditableText id="header.phone1" fallback="+966 55 239 0860" className="hover:text-primary transition-smooth" />
            <span className="text-border">|</span>
            <EditableText id="header.phone2" fallback="+91 6374 504 413" className="hover:text-primary transition-smooth" />
            <span className="text-border">|</span>
            <EditableText id="header.phone3" fallback="+91 9597589990" className="hover:text-primary transition-smooth" />
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap justify-center">
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5 text-primary" />
              <EditableText id="header.email" fallback="info@getyourdreams.com" className="hover:text-primary transition-smooth" />
            </span>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5 text-accent" />
              <EditableText id="header.email_hr" fallback="hr@getyourdreams.com" className="hover:text-primary transition-smooth font-medium" />
              <span className="text-[10px] text-muted-foreground">{translate("header.send_cv_here", "(send CV here)")}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-muted transition-smooth text-sm">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">{LANGUAGES.find((l) => l.code === lang)?.name ?? "English"}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-80 overflow-y-auto bg-popover">
              {LANGUAGES.map((l) => (
                <DropdownMenuItem key={l.code} onClick={() => setLang(l.code)}
                  className={l.code === lang ? "bg-accent/20 font-semibold" : ""}>
                  {l.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="p-2 rounded-lg hover:bg-muted transition-smooth">
              <MoreVertical className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover w-56">
              {navItems.map((n) => (
                <DropdownMenuItem key={n.to} asChild>
                  <NavLink to={n.to} className="cursor-pointer">{n.label}</NavLink>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              {isAdmin && (
                <>
                  <DropdownMenuItem asChild>
                    <NavLink to="/admin"><Settings className="h-4 w-4 mr-2" />{translate("header.admin_dashboard", "Admin Dashboard")}</NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={toggleEditMode}>
                    <Pencil className="h-4 w-4 mr-2" />{editMode ? translate("header.stop_editing", "Stop editing") : translate("header.edit_page", "Edit page")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />{translate("header.sign_out", "Sign out")}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {editMode && (
        <div className="bg-accent text-accent-foreground text-center text-sm py-1 font-medium">
          {translate("edit.active")}
        </div>
      )}
    </header>
  );
}

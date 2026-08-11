import { useEffect, useRef, useState } from "react";
import logo from "../../assets/logo.png";
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react";

interface LandingNavbarProps { onPortalClick?: () => void; }

type MenuGroup = {
  label: string;
  items: { label: string; href: string; description?: string }[];
};

const menuGroups: MenuGroup[] = [
  {
    label: "Platform",
    items: [
      { label: "Academic Intelligence", href: "academic-intelligence", description: "See learning evidence, academic progress and classroom intelligence as one connected picture." },
      { label: "Growth Intelligence", href: "growth", description: "Turn learning evidence into actionable growth intelligence for students, teachers and schools." },
      { label: "Opportunities", href: "marketplace", description: "Discover scholarships, workshops, consultations and real-world opportunities." },
      { label: "For Schools", href: "schools", description: "Why schools need continuous learning intelligence." },
      { label: "Student Portfolio", href: "student-portfolio", description: "One verified lifelong growth profile." },
      { label: "NEP-Aligned Skills", href: "nep-skills", description: "Make holistic competencies visible." },
      { label: "HPC / Talent Passport", href: "hpc", description: "The verified student growth credential." },
    ],
  },
  {
    label: "Opportunities",
    items: [
      { label: "Consultation", href: "consultation", description: "Guidance connected to student context." },
      { label: "Competitions", href: "competitions", description: "20+ formats across key skill categories." },
      { label: "Partners", href: "partners", description: "The verified learning partner ecosystem." },
      { label: "Recognition Journey", href: "recognition", description: "From participation to achievement." },
      { label: "Star Performer", href: "star-performer", description: "Celebrate growth, effort and leadership." },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "Resources", href: "resources", description: "Guides for the entire ecosystem." },
      { label: "Blogs", href: "blogs", description: "Ideas on education and student growth." },
      { label: "FAQs", href: "faq", description: "Quick answers about the platform." },
      { label: "Trust Center", href: "trust", description: "Trust, access and responsibility." },
      { label: "Testimonials", href: "testimonials", description: "Stories from the ecosystem." },
    ],
  },
  {
    label: "Company",
    items: [
      { label: "Founder", href: "founder", description: "The thinking behind Talent Passport." },
      { label: "Plans", href: "plans", description: "Simple access paths for institutions." },
      { label: "Contact Center", href: "contact", description: "Find the right team to speak with." },
    ],
  },
];

export default function LandingNavbar({ onPortalClick }: LandingNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(null); setMobileOpen(false); }
    };
    const onOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onEscape);
    document.addEventListener("mousedown", onOutside);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onEscape);
      document.removeEventListener("mousedown", onOutside);
    };
  }, []);

  const go = (href: string) => {
    window.location.hash = href;
    setOpen(null);
    setMobileOpen(false);
  };

  return (
    <header ref={navRef} className={`iw-navbar ${scrolled ? "iw-navbar-scrolled" : ""}`}>
      <div className="iw-navbar-inner">
        <a
          href="#hero"
          className="iw-logo"
          aria-label="Talent Passport home"
          onClick={() => { setOpen(null); setMobileOpen(false); }}
        >
          <img src={logo} alt="Talent Passport" />
        </a>

        <nav className="iw-desktop-nav" aria-label="Primary navigation">
          <button type="button" className="iw-nav-home" onClick={() => go("hero")}>Home</button>

          {menuGroups.map(group => (
            <div className="iw-nav-group" key={group.label}>
              <button
                type="button"
                className={`iw-nav-trigger ${open === group.label ? "is-open" : ""}`}
                onClick={() => setOpen(open === group.label ? null : group.label)}
                aria-expanded={open === group.label}
              >
                {group.label}
                <ChevronDown size={14} className={open === group.label ? "iw-chevron-open" : ""}/>
              </button>

              {open === group.label && (
                <div className="iw-dropdown">
                  <div className="iw-dropdown-title">
                    <span>{group.label}</span>
                    <small>Explore</small>
                  </div>
                  <div className="iw-dropdown-grid">
                    {group.items.map(item => (
                      <button
                        key={item.href}
                        type="button"
                        className="iw-dropdown-item"
                        onClick={() => go(item.href)}
                      >
                        <span>
                          <strong>{item.label}</strong>
                          {item.description && <small>{item.description}</small>}
                        </span>
                        <ArrowRight size={15}/>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="iw-navbar-actions">
          <button type="button" className="iw-portal-button" onClick={onPortalClick}>
            Enter Portal <ArrowRight size={16}/>
          </button>
          <button
            type="button"
            className="iw-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={23}/> : <Menu size={23}/>}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="iw-mobile-panel">
          <button type="button" className="iw-mobile-home" onClick={() => go("hero")}>
            Home <ArrowRight size={16}/>
          </button>

          {menuGroups.map(group => (
            <div className="iw-mobile-group" key={group.label}>
              <button
                type="button"
                className="iw-mobile-group-trigger"
                onClick={() => setOpen(open === group.label ? null : group.label)}
              >
                <span>{group.label}</span>
                <ChevronDown size={17} className={open === group.label ? "iw-chevron-open" : ""}/>
              </button>

              {open === group.label && (
                <div className="iw-mobile-items">
                  {group.items.map(item => (
                    <button type="button" key={item.href} onClick={() => go(item.href)}>
                      <span>
                        <strong>{item.label}</strong>
                        {item.description && <small>{item.description}</small>}
                      </span>
                      <ArrowRight size={15}/>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button type="button" className="iw-mobile-portal" onClick={onPortalClick}>
            Enter Portal <ArrowRight size={16}/>
          </button>
        </div>
      )}
    </header>
  );
}

import { useEffect, useRef, useState } from "react";
import logo from "../../assets/logo.png";
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react";

interface LandingNavbarProps {
  onPortalClick?: () => void;
}

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
      { label: "Marketplace", href: "marketplace", description: "Scholarships, workshops and opportunities." },
      { label: "Consultation", href: "consultation", description: "Guidance connected to student context." },
      { label: "Competitions", href: "competitions", description: "20+ formats across key skill categories." },
      { label: "Star Performer", href: "star-performer", description: "Celebrate growth, effort and leadership." },
      { label: "Partners", href: "partners", description: "The verified learning partner ecosystem." },
      { label: "Recognition Journey", href: "recognition", description: "From participation to achievement." },
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
      { label: "Request Demo", href: "request-demo", description: "Request a focused school intelligence walkthrough." },
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
      if (e.key === "Escape") {
        setOpen(null);
        setMobileOpen(false);
      }
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
    <>
      <style>{`
        .tp-public-navbar {
          --tp-navy: #14213d;
          --tp-blue: #244f8f;
          --tp-muted: #64748b;
          --tp-gold: #f4a825;
          position: sticky;
          top: 0;
          z-index: 1000;
          width: 100%;
          background: rgba(255,255,255,.98);
          border-bottom: 1px solid rgba(20,33,61,.08);
          box-shadow: 0 4px 20px rgba(20,33,61,.035);
          backdrop-filter: blur(14px);
        }

        .tp-public-navbar * { box-sizing: border-box; }

        .tp-public-navbar .iw-navbar-inner {
          width: min(1240px, calc(100% - 40px));
          min-height: 84px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 230px minmax(0,1fr) auto;
          align-items: center;
          gap: 24px;
        }

        /* IMPORTANT: the logo is inside the SAME navigation row.
           No extra header/row is created. */
        .tp-public-navbar .iw-logo {
          width: 220px;
          height: 84px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          flex-shrink: 0;
          text-decoration: none;
          overflow: hidden;
        }

        .tp-public-navbar .iw-logo img {
          display: block;
          width: 220px;
          height: 84px;
          max-width: none;
          max-height: none;
          object-fit: contain;
          object-position: left center;
          transform: scale(2.35);
          transform-origin: left center;
        }

        .tp-public-navbar .iw-desktop-nav {
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }

        .tp-public-navbar .iw-nav-home,
        .tp-public-navbar .iw-nav-trigger {
          height: 42px;
          padding: 0 11px;
          border: 0;
          background: transparent;
          color: var(--tp-navy);
          font: inherit;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
          border-radius: 10px;
        }

        .tp-public-navbar .iw-nav-home:hover,
        .tp-public-navbar .iw-nav-trigger:hover,
        .tp-public-navbar .iw-nav-trigger.is-open {
          background: #f6f8fb;
        }

        .tp-public-navbar .iw-nav-group { position: relative; }

        .tp-public-navbar .iw-chevron-open {
          transform: rotate(180deg);
        }

        .tp-public-navbar .iw-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          width: min(620px, 82vw);
          padding: 16px;
          border: 1px solid rgba(20,33,61,.09);
          border-radius: 18px;
          background: rgba(255,255,255,.99);
          box-shadow: 0 22px 60px rgba(20,33,61,.13);
        }

        .tp-public-navbar .iw-dropdown-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2px 5px 12px;
          border-bottom: 1px solid rgba(20,33,61,.08);
          color: var(--tp-navy);
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 1.2px;
          text-transform: uppercase;
        }

        .tp-public-navbar .iw-dropdown-title small {
          color: #a0aaba;
          font-size: 9px;
          letter-spacing: 1px;
        }

        .tp-public-navbar .iw-dropdown-grid {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 7px;
          padding-top: 10px;
        }

        .tp-public-navbar .iw-dropdown-item {
          width: 100%;
          min-height: 70px;
          padding: 10px 11px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          text-align: left;
          border: 1px solid transparent;
          border-radius: 12px;
          background: #fbfcfe;
          color: var(--tp-navy);
          cursor: pointer;
        }

        .tp-public-navbar .iw-dropdown-item:hover {
          border-color: rgba(244,168,37,.25);
          background: #fffaf1;
        }

        .tp-public-navbar .iw-dropdown-item span {
          min-width: 0;
        }

        .tp-public-navbar .iw-dropdown-item strong {
          display: block;
          font-size: 12px;
          line-height: 1.25;
        }

        .tp-public-navbar .iw-dropdown-item small {
          display: block;
          margin-top: 4px;
          color: var(--tp-muted);
          font-size: 10px;
          line-height: 1.4;
        }

        .tp-public-navbar .iw-dropdown-item > svg {
          flex: 0 0 auto;
          color: var(--tp-blue);
        }

        .tp-public-navbar .iw-navbar-actions {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .tp-public-navbar .iw-demo-button,
        .tp-public-navbar .iw-mobile-demo {
          border: 1px solid rgba(244,168,37,.45);
          background: #fffaf1;
          color: var(--tp-navy);
          cursor: pointer;
          font: inherit;
          font-size: 14px;
          font-weight: 850;
          box-shadow: 0 6px 18px rgba(20,33,61,.05);
        }

        .tp-public-navbar .iw-demo-button {
          min-height: 50px;
          padding: 0 17px;
          border-radius: 13px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          white-space: nowrap;
        }

        .tp-public-navbar .iw-demo-button:hover {
          background: #fff5df;
          border-color: rgba(244,168,37,.7);
          transform: translateY(-1px);
        }

        .tp-public-navbar .iw-mobile-demo {
          min-height: 48px;
          padding: 0 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .tp-public-navbar .iw-mobile-demo:hover {
          background: #fff5df;
        }

        .tp-public-navbar .iw-portal-button,
        .tp-public-navbar .iw-mobile-portal {
          border: 0;
          background: var(--tp-gold);
          color: #fff;
          cursor: pointer;
          font: inherit;
          font-size: 14px;
          font-weight: 850;
          box-shadow: 0 8px 22px rgba(244,168,37,.20);
        }

        .tp-public-navbar .iw-portal-button {
          min-height: 50px;
          padding: 0 19px;
          border-radius: 13px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          white-space: nowrap;
        }

        .tp-public-navbar .iw-portal-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 28px rgba(244,168,37,.26);
        }

        .tp-public-navbar .iw-mobile-toggle {
          display: none;
          width: 44px;
          height: 44px;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(20,33,61,.1);
          border-radius: 12px;
          background: #fff;
          color: var(--tp-navy);
          cursor: pointer;
        }

        .tp-public-navbar .iw-mobile-panel {
          display: none;
        }

        @media (max-width: 1080px) {
          .tp-public-navbar .iw-navbar-inner {
            grid-template-columns: 205px minmax(0,1fr) auto;
            gap: 12px;
          }
          .tp-public-navbar .iw-logo,
          .tp-public-navbar .iw-logo img {
            width: 190px;
          }
          .tp-public-navbar .iw-logo,
          .tp-public-navbar .iw-logo img {
            height: 70px;
          }
          .tp-public-navbar .iw-nav-home,
          .tp-public-navbar .iw-nav-trigger {
            padding: 0 7px;
            font-size: 12.5px;
          }
        }

        @media (max-width: 900px) {
          .tp-public-navbar .iw-navbar-inner {
            width: min(100% - 28px, 680px);
            min-height: 70px;
            grid-template-columns: auto 1fr auto;
          }

          .tp-public-navbar .iw-logo {
            width: 160px;
            height: 70px;
            overflow: hidden;
          }

          .tp-public-navbar .iw-logo img {
            width: 160px;
            height: 70px;
            transform: scale(2.05);
            transform-origin: left center;
          }

          .tp-public-navbar .iw-desktop-nav {
            display: none;
          }

          /* Keep both primary acquisition actions visible on tablet/mobile.
             The logo size is intentionally unchanged. */
          .tp-public-navbar .iw-navbar-actions {
            justify-content: flex-end;
            gap: 6px;
          }

          .tp-public-navbar .iw-demo-button,
          .tp-public-navbar .iw-portal-button {
            display: inline-flex;
            min-height: 40px;
            padding: 0 10px;
            border-radius: 10px;
            font-size: 10.5px;
            gap: 5px;
          }

          .tp-public-navbar .iw-demo-button svg,
          .tp-public-navbar .iw-portal-button svg {
            width: 12px;
            height: 12px;
          }

          .tp-public-navbar .iw-mobile-toggle {
            display: inline-flex;
          }

          .tp-public-navbar .iw-mobile-panel {
            display: block;
            width: min(100% - 20px, 680px);
            max-height: calc(100vh - 82px);
            overflow-y: auto;
            margin: 0 auto 10px;
            padding: 9px;
            border: 1px solid rgba(20,33,61,.08);
            border-radius: 16px;
            background: #fff;
            box-shadow: 0 18px 45px rgba(20,33,61,.11);
          }

          .tp-public-navbar .iw-mobile-home,
          .tp-public-navbar .iw-mobile-group-trigger,
          .tp-public-navbar .iw-mobile-items button {
            width: 100%;
            border: 0;
            background: transparent;
            color: var(--tp-navy);
            cursor: pointer;
            font: inherit;
            text-align: left;
          }

          .tp-public-navbar .iw-mobile-home,
          .tp-public-navbar .iw-mobile-group-trigger {
            min-height: 48px;
            padding: 0 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 850;
          }

          .tp-public-navbar .iw-mobile-home:hover,
          .tp-public-navbar .iw-mobile-group-trigger:hover {
            background: #f7f9fc;
          }

          .tp-public-navbar .iw-mobile-group {
            border-top: 1px solid rgba(20,33,61,.07);
          }

          .tp-public-navbar .iw-mobile-items {
            padding: 3px 7px 8px;
          }

          .tp-public-navbar .iw-mobile-items button {
            min-height: 57px;
            padding: 9px 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            border-radius: 9px;
          }

          .tp-public-navbar .iw-mobile-items button:hover {
            background: #fffaf1;
          }

          .tp-public-navbar .iw-mobile-items strong {
            display: block;
            font-size: 12px;
          }

          .tp-public-navbar .iw-mobile-items small {
            display: block;
            margin-top: 3px;
            color: var(--tp-muted);
            font-size: 10px;
            line-height: 1.35;
          }

          .tp-public-navbar .iw-mobile-items svg {
            flex: 0 0 auto;
            color: var(--tp-blue);
          }

          .tp-public-navbar .iw-mobile-portal {
            width: 100%;
            min-height: 48px;
            margin-top: 7px;
            border-radius: 11px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
          }
        }

        @media (max-width: 480px) {
          .tp-public-navbar .iw-navbar-inner {
            width: calc(100% - 20px);
            min-height: 64px;
          }

          .tp-public-navbar .iw-logo {
            width: 145px;
            height: 64px;
            overflow: hidden;
          }

          .tp-public-navbar .iw-logo img {
            width: 145px;
            height: 64px;
            transform: scale(1.95);
            transform-origin: left center;
          }

          .tp-public-navbar .iw-navbar-inner {
            width: calc(100% - 12px);
            gap: 0;
          }

          .tp-public-navbar .iw-navbar-actions {
            gap: 3px;
          }

          .tp-public-navbar .iw-demo-button,
          .tp-public-navbar .iw-portal-button {
            min-height: 36px;
            border-radius: 9px;
            padding: 0 7px;
            font-size: 8.5px;
            gap: 3px;
            letter-spacing: -.01em;
          }

          .tp-public-navbar .iw-demo-button {
            min-width: 54px;
          }

          .tp-public-navbar .iw-portal-button {
            min-width: 58px;
          }

          .tp-public-navbar .iw-demo-button svg,
          .tp-public-navbar .iw-portal-button svg {
            width: 10px;
            height: 10px;
          }

          .tp-public-navbar .iw-mobile-toggle {
            width: 36px;
            height: 36px;
            margin-left: 1px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tp-public-navbar .iw-portal-button {
            transition: none;
          }
        }
      `}</style>

      <header
        ref={navRef}
        className={`tp-public-navbar ${scrolled ? "iw-navbar-scrolled" : ""}`}
      >
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

            {menuGroups.map((group) => (
              <div className="iw-nav-group" key={group.label}>
                <button
                  type="button"
                  className={`iw-nav-trigger ${open === group.label ? "is-open" : ""}`}
                  onClick={() => setOpen(open === group.label ? null : group.label)}
                  aria-expanded={open === group.label}
                >
                  {group.label}
                  <ChevronDown size={14} className={open === group.label ? "iw-chevron-open" : ""} />
                </button>

                {open === group.label && (
                  <div className="iw-dropdown">
                    <div className="iw-dropdown-title">
                      <span>{group.label}</span>
                      <small>Explore</small>
                    </div>
                    <div className="iw-dropdown-grid">
                      {group.items.map((item) => (
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
                          <ArrowRight size={15} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="iw-navbar-actions">
            <button
              type="button"
              className="iw-demo-button"
              onClick={() => go("request-demo")}
            >
              Request Demo <ArrowRight size={15} />
            </button>
            <button type="button" className="iw-portal-button" onClick={onPortalClick}>
              Enter Portal <ArrowRight size={16} />
            </button>
            <button
              type="button"
              className="iw-mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="iw-mobile-panel">
            <button type="button" className="iw-mobile-home" onClick={() => go("hero")}>
              Home <ArrowRight size={16} />
            </button>

            {menuGroups.map((group) => (
              <div className="iw-mobile-group" key={group.label}>
                <button
                  type="button"
                  className="iw-mobile-group-trigger"
                  onClick={() => setOpen(open === group.label ? null : group.label)}
                >
                  <span>{group.label}</span>
                  <ChevronDown size={17} className={open === group.label ? "iw-chevron-open" : ""} />
                </button>

                {open === group.label && (
                  <div className="iw-mobile-items">
                    {group.items.map((item) => (
                      <button type="button" key={item.href} onClick={() => go(item.href)}>
                        <span>
                          <strong>{item.label}</strong>
                          {item.description && <small>{item.description}</small>}
                        </span>
                        <ArrowRight size={15} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              className="iw-mobile-demo"
              onClick={() => go("request-demo")}
            >
              <span>Request Demo</span>
              <ArrowRight size={16} />
            </button>

            <button type="button" className="iw-mobile-portal" onClick={onPortalClick}>
              Enter Portal <ArrowRight size={16} />
            </button>
          </div>
        )}
      </header>
    </>
  );
}
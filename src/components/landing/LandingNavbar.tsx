import { useEffect, useState } from "react";
import logo from "../../assets/logo.png";

interface LandingNavbarProps {
  onPortalClick?: () => void;
}

const navItems = [
  { label: "Home", href: "#hero" },
  { label: "Journey", href: "#journey" },
  { label: "Recognition", href: "#recognition" },
  { label: "Opportunities", href: "#opportunities" },
  { label: "Community", href: "#community" },
  { label: "Vision", href: "#impact" },
];

export default function LandingNavbar({
  onPortalClick,
}: LandingNavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 25);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`landing-navbar ${scrolled ? "landing-navbar-scrolled" : ""}`}
    >
      <div className="landing-navbar-container">
        {/* Logo */}

        <a
  href="#hero"
  className="landing-logo"
>
          <img src={logo} alt="Talent Passport" />
        </a>

        {/* Navigation */}

        <nav className="landing-nav-links">
          {navItems.map((item) => (
            <a key={item.label} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right */}

        <div className="landing-navbar-actions">
          <button
            className="portal-button"
            onClick={onPortalClick}
          >
            Enter Portal
          </button>
        </div>
      </div>
    </header>
  );
}
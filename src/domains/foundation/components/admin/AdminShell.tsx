import React, { useEffect, useState } from "react";
import "../../../../styles/adminResponsive.css";

interface AdminShellProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
}

export default function AdminShell({
  sidebar,
  header,
  children,
}: AdminShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add("tp-admin-responsive-context");
    return () => {
      document.body.classList.remove("tp-admin-responsive-context");
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  return (
    <div className="tp-admin-portal" style={containerStyle}>
      <div
        className={`tp-admin-sidebar-backdrop${mobileMenuOpen ? " is-open" : ""}`}
        aria-hidden="true"
        onClick={() => setMobileMenuOpen(false)}
      />

      <aside
        className={`tp-admin-portal__sidebar${mobileMenuOpen ? " is-open" : ""}`}
        style={sidebarStyle}
        aria-label="Admin navigation"
        onClickCapture={() => setMobileMenuOpen(false)}
      >
        {sidebar}
      </aside>

      <main className="tp-admin-portal__main" style={mainStyle}>
        <div className="tp-admin-mobile-bar">
          <button
            type="button"
            className="tp-admin-mobile-menu-button"
            aria-label={mobileMenuOpen ? "Close admin navigation" : "Open admin navigation"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? "×" : "☰"}
          </button>
          <div className="tp-admin-mobile-title">Talent Passport Admin</div>
          <div className="tp-admin-mobile-spacer" aria-hidden="true" />
        </div>

        <header className="tp-admin-portal__header" style={headerStyle}>
          {header}
        </header>

        <section className="tp-admin-portal__content" style={contentStyle}>
          {children}
        </section>
      </main>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  display: "flex",
  minHeight: "100vh",
  minWidth: 0,
  width: "100%",
  background: "#F8FAFC",
};

const sidebarStyle: React.CSSProperties = {
  width: "270px",
  background: "#FFFFFF",
  borderRight: "1px solid #E5E7EB",
  display: "flex",
  flexDirection: "column",
};

const mainStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
};

const headerStyle: React.CSSProperties = {
  background: "#FFFFFF",
  borderBottom: "1px solid #E5E7EB",
};

const contentStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  padding: "24px",
  overflow: "auto",
};

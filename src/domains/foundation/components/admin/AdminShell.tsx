import React from "react";

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
  return (
    <div style={containerStyle}>
      {/* Sidebar */}
      <aside style={sidebarStyle}>
        {sidebar}
      </aside>

      {/* Main Area */}
      <main style={mainStyle}>
        {/* Header */}
        <header style={headerStyle}>
          {header}
        </header>

        {/* Page Content */}
        <section style={contentStyle}>
          {children}
        </section>
      </main>
    </div>
  );
}

/* ============================================================
   STYLES
============================================================ */

const containerStyle: React.CSSProperties = {
  display: "flex",
  minHeight: "100vh",
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
  display: "flex",
  flexDirection: "column",
};

const headerStyle: React.CSSProperties = {
  background: "#FFFFFF",
  borderBottom: "1px solid #E5E7EB",
};

const contentStyle: React.CSSProperties = {
  flex: 1,
  padding: "24px",
  overflow: "auto",
};
import React from "react";

export type StudentTab =
  | "dna-radar"
  | "homeboard"
  | "timeline"
  | "portfolio"
  | "competitions"
  | "opportunities"
  | "mauke-pe-chauka"
  | "my-analysis"
  | "growth-plan";

interface StudentLayoutProps {
  activeTab: StudentTab;
  setActiveTab: (tab: StudentTab) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const tabs: {
  key: StudentTab;
  label: string;
}[] = [
  { key: "dna-radar", label: "🏅 New User DNA Radar" },
  { key: "homeboard", label: "Home Board" },
  { key: "timeline", label: "Timeline" },
  { key: "portfolio", label: "Portfolio" },
  { key: "competitions", label: "Competitions" },
  { key: "opportunities", label: "Opportunities" },
  {
    key: "mauke-pe-chauka",
    label: "🎯 Mauke Pe Chauka",
  },
  { key: "my-analysis", label: "My Analysis" },
  { key: "growth-plan", label: "Growth Plan" },
];

export default function StudentLayout({
  activeTab,
  setActiveTab,
  onLogout,
  children,
}: StudentLayoutProps) {
  return (
    <div className="portal-shell student-portal-shell">
      <div className="portal-shell-inner">

        {/* =====================================================
            STUDENT PORTAL NAVIGATION
        ===================================================== */}

        <div className="portal-nav-card student-portal-nav">
          <div className="portal-nav-row">

            {/* NAVIGATION TABS */}

            <div
              className="portal-nav-tabs"
              role="navigation"
              aria-label="Student portal navigation"
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`portal-nav-tab ${
                      isActive ? "portal-nav-tab-active" : ""
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* LOGOUT */}

            <div className="portal-nav-actions">
              <button
                type="button"
                onClick={onLogout}
                className="portal-logout-button"
              >
                Logout
              </button>
            </div>

          </div>
        </div>

        {/* =====================================================
            CURRENT PAGE
        ===================================================== */}

        <main className="portal-page-content">
          {children}
        </main>

      </div>
    </div>
  );
}
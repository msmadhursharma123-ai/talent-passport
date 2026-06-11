import React from "react";

export type StudentTab =
  | "homeboard"
  | "timeline"
  | "portfolio"
  | "competitions"
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
  { key: "homeboard", label: "Home Board" },
  { key: "timeline", label: "Timeline" },
  { key: "portfolio", label: "Portfolio" },
  { key: "competitions", label: "Competitions" },
  { key: "my-analysis", label: "My Analysis" },
  { key: "growth-plan", label: "Growth Plan" }
];

export default function StudentLayout({
  activeTab,
  setActiveTab,
  onLogout,
  children
}: StudentLayoutProps) {
  return (
    <div
      style={{
        background: "#F4F5F7",
        minHeight: "100vh",
        padding: 30
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto"
        }}
      >
        <div
          style={{
            background: "#FFF",
            borderRadius: 28,
            padding: 30,
            marginBottom: 25,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div>
            <div
              style={{
                color: "#F97316",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 2
              }}
            >
              STUDENT PORTAL
            </div>

            <h1
              style={{
                marginTop: 10,
                color: "#0B2A4A",
                fontSize: 42
              }}
            >
              Student Talent Ledger Terminal
            </h1>

            <div
              style={{
                marginTop: 12,
                color: "#64748B"
              }}
            >
              Navigate between your student dashboard views and review progress.
            </div>
          </div>

          <div
            style={{
              background: "#FF6B00",
              borderRadius: 20,
              padding: "22px 24px",
              color: "white",
              textAlign: "center",
              minWidth: 200
            }}
          >
            <div
              style={{
                fontSize: 12,
                letterSpacing: 1,
                opacity: 0.9,
                marginBottom: 8
              }}
            >
              STUDENT PORTAL ACCESS
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                lineHeight: 1
              }}
            >
              LEDGER
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr",
            gap: 24
          }}
        >
          <div
            style={{
              background: "#FFF",
              borderRadius: 28,
              padding: 28,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minHeight: 220,
              boxShadow: "0 24px 48px rgba(15, 23, 42, 0.08)"
            }}
          >
            <div
              style={{
                color: "#F97316",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 2,
                marginBottom: 16
              }}
            >
              PORTAL TERMINAL
            </div>
            <div
              style={{
                color: "#0B2A4A",
                fontSize: 22,
                fontWeight: 700,
                lineHeight: 1.2,
                marginBottom: 14
              }}
            >
              STUDENT TALENT LEDGER TERMINAL
            </div>
            <div
              style={{
                color: "#475569",
                lineHeight: 1.7
              }}
            >
              Use the navigation on the right to move between Home Board, Timeline, Portfolio, Competitions, My Analysis, and Growth Plan.
            </div>
          </div>

          <div>
            <div
              style={{
                background: "#FFF",
                borderRadius: 28,
                padding: 24,
                marginBottom: 24,
                boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  marginBottom: 20
                }}
              >
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      style={{
                        background: isActive ? "#F97316" : "#F8FAFC",
                        color: isActive ? "white" : "#0B2A4A",
                        border: "none",
                        borderRadius: 14,
                        padding: "12px 18px",
                        cursor: "pointer",
                        fontWeight: 700,
                        minWidth: 140,
                        transition: "background 0.2s ease"
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end"
                }}
              >
                <button
                  type="button"
                  onClick={onLogout}
                  style={{
                    background: "#D32F2F",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    padding: "12px 22px",
                    cursor: "pointer",
                    fontWeight: 700
                  }}
                >
                  Logout
                </button>
              </div>
            </div>

            <div
              style={{
                background: "#FFF",
                borderRadius: 28,
                padding: 28,
                minHeight: 400,
                boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)"
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

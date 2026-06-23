import React from "react";

export type StudentTab =
  | "dna-radar"
  | "homeboard"
  | "timeline"
  | "portfolio"
  | "competitions"
  | "opportunities"
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
        background: "#F5F7F8",
        minHeight: "100vh",
        padding: "0 24px 40px"
      }}
    >
      <div
        style={{
          maxWidth: "1800px",
          margin: "0 auto"
        }}
      >
        {/* TOP BAR */}

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 18,
            padding: "20px 24px",
            marginBottom: 20,
            border: "1px solid #E5E7EB"
          }}
        >
          {/* LOGOUT */}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 16
            }}
          >
            <button
              onClick={onLogout}
              style={{
                background: "#D32F2F",
                color: "#FFF",
                border: "none",
                borderRadius: 10,
                padding: "10px 20px",
                cursor: "pointer",
                fontWeight: 700
              }}
            >
              Logout
            </button>
          </div>

          {/* TABS */}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end"
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                maxWidth: "1100px"
              }}
            >
              {tabs.map((tab) => {
                const isActive =
                  activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    onClick={() =>
                      setActiveTab(tab.key)
                    }
                    style={{
                      border: "none",
                      cursor: "pointer",
                      borderRadius: 10,
                      padding: "10px 16px",
                      fontSize: 13,
                      fontWeight: 700,
                      background: isActive
                        ? "#FF6B00"
                        : "#EFF2F6",
                      color: isActive
                        ? "#FFFFFF"
                        : "#475569",
                      transition:
                        "all .2s ease"
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* PAGE CONTENT */}

       <div
  style={{
    width: "100%"
  }}
>
  {children}
</div>
      </div>
    </div>
  );
}
import React from "react";

export type PartnerTab =
  | "home"
  | "programs"
  | "talent-discovery"
  | "workshops"
  | "scholarships"
  | "opportunities"
  | "profile";

interface Props {
  activeTab: PartnerTab;
  setActiveTab: (
    tab: PartnerTab
  ) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const tabs = [
  {
    key: "home",
    label: "Home"
  },
  {
    key: "programs",
    label: "Programs"
  },
  {
    key: "talent-discovery",
    label: "Talent Discovery"
  },
  {
    key: "workshops",
    label: "Workshops"
  },
  {
    key: "scholarships",
    label: "Scholarships"
  },
  {
    key: "opportunities",
    label: "Opportunities"
  },
  {
    key: "profile",
    label: "Profile"
  }
];

export default function PartnerLayout({
  activeTab,
  setActiveTab,
  onLogout,
  children
}: Props) {

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8F7F4",
        padding: "30px"
      }}
    >

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto"
        }}
      >

        <div
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "25px 35px",
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.05)",
            marginBottom: "25px"
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center"
            }}
          >

            <div>

              <div
                style={{
                  color: "#F4A623",
                  fontWeight: 700,
                  letterSpacing: "2px",
                  marginBottom: 6
                }}
              >
                TALENT PASSPORT
              </div>

              <h2
                style={{
                  margin: 0,
                  color: "#143B73"
                }}
              >
                Partner Portal
              </h2>

            </div>

            <button
              onClick={onLogout}
              style={{
                background: "#143B73",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding:
                  "12px 20px",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              Logout
            </button>

          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "25px",
              flexWrap: "wrap"
            }}
          >
            {tabs.map(tab => (

              <button
                key={tab.key}
                onClick={() =>
                  setActiveTab(
                    tab.key as PartnerTab
                  )
                }
                style={{
                  padding:
                    "14px 22px",
                  borderRadius:
                    "14px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,

                  background:
                    activeTab ===
                    tab.key
                      ? "#F4A623"
                      : "#EFF2F6",

                  color:
                    activeTab ===
                    tab.key
                      ? "white"
                      : "#475569"
                }}
              >
                {tab.label}
              </button>

            ))}
          </div>

        </div>

        {children}

      </div>

    </div>
  );
}
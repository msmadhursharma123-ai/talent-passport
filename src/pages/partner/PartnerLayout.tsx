import React from "react";

export type PartnerTab =
  | "dashboard"
  | "talent-discovery"
  | "incoming-requests"
  | "lead-pipeline";

interface Props {
  activeTab: PartnerTab;

  setActiveTab: (
    tab: PartnerTab
  ) => void;

  onLogout: () => void;

  children: React.ReactNode;
}

const tabs: {
  key: PartnerTab;
  label: string;
}[] = [
  {
    key: "dashboard",
    label: "Dashboard",
  },
  {
    key: "talent-discovery",
    label: "Talent Discovery",
  },
  {
    key: "incoming-requests",
    label: "Incoming Requests",
  },
  {
    key: "lead-pipeline",
    label: "Lead Pipeline",
  },
];

export default function PartnerLayout({
  activeTab,
  setActiveTab,
  onLogout,
  children,
}: Props) {
  return (
    <div
      style={{
        minHeight: "100vh",

        background: `
          radial-gradient(
            circle at 94% 8%,
            rgba(249, 115, 22, 0.07) 0,
            rgba(249, 115, 22, 0.07) 120px,
            transparent 121px
          ),
          radial-gradient(
            circle at 5% 92%,
            rgba(37, 99, 235, 0.045) 0,
            rgba(37, 99, 235, 0.045) 145px,
            transparent 146px
          ),
          #F8FAFC
        `,

        color: "#0F172A",
      }}
    >
      {/* =========================================================
          PARTNER PORTAL NAVIGATION
         ========================================================= */}
      <div
        style={{
          padding: "18px 32px 16px",
        }}
      >
        <div
          style={{
            maxWidth: 1600,
            margin: "0 auto",

            background:
              "linear-gradient(135deg, #FFFFFF 0%, #FFFCF8 72%, #FFF7ED 100%)",

            border: "1px solid #E2E8F0",
            borderRadius: 22,

            boxShadow:
              "0 10px 30px rgba(15, 23, 42, 0.06)",

            padding: "20px 24px 18px",

            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative background circles */}
          <div
            style={{
              position: "absolute",
              width: 150,
              height: 150,
              borderRadius: "50%",
              background:
                "rgba(249, 115, 22, 0.055)",
              right: -45,
              top: -85,
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "absolute",
              width: 90,
              height: 90,
              borderRadius: "50%",
              background:
                "rgba(249, 115, 22, 0.04)",
              right: 125,
              top: -55,
              pointerEvents: "none",
            }}
          />

          {/* TOP ROW */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 24,
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* PORTAL IDENTITY */}
            <div>
              <div
                style={{
                  color: "#F97316",
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: 2.2,
                  textTransform: "uppercase",
                  marginBottom: 5,
                }}
              >
                TALENT PASSPORT
              </div>

              <div
                style={{
                  color: "#0F172A",
                  fontSize: 22,
                  lineHeight: 1.2,
                  fontWeight: 800,
                }}
              >
                Partner Portal
              </div>
            </div>

            {/* LOGOUT */}
            <button
              onClick={onLogout}
              style={{
                background:
                  "linear-gradient(135deg, #F97316 0%, #FB923C 100%)",

                color: "#FFFFFF",

                border: "1px solid rgba(249, 115, 22, 0.25)",
                borderRadius: 12,

                padding: "11px 20px",

                fontSize: 14,
                fontWeight: 800,

                cursor: "pointer",

                boxShadow:
                  "0 6px 16px rgba(249, 115, 22, 0.18)",

                transition:
                  "transform 0.18s ease, box-shadow 0.18s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  "translateY(-1px)";

                e.currentTarget.style.boxShadow =
                  "0 8px 20px rgba(249, 115, 22, 0.24)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform =
                  "translateY(0)";

                e.currentTarget.style.boxShadow =
                  "0 6px 16px rgba(249, 115, 22, 0.18)";
              }}
            >
              Logout
            </button>
          </div>

          {/* NAVIGATION */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,

              marginTop: 18,
              padding: 6,

              width: "fit-content",
              maxWidth: "100%",

              background: "#F8FAFC",

              border: "1px solid #E2E8F0",
              borderRadius: 14,

              position: "relative",
              zIndex: 1,

              flexWrap: "wrap",
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
                    border: isActive
                      ? "1px solid rgba(249, 115, 22, 0.22)"
                      : "1px solid transparent",

                    borderRadius: 10,

                    padding: "10px 17px",

                    cursor: "pointer",

                    fontSize: 14,
                    fontWeight: 750,

                    background: isActive
                      ? "linear-gradient(135deg, #F97316 0%, #FB923C 100%)"
                      : "transparent",

                    color: isActive
                      ? "#FFFFFF"
                      : "#475569",

                    boxShadow: isActive
                      ? "0 5px 12px rgba(249, 115, 22, 0.17)"
                      : "none",

                    transition:
                      "all 0.18s ease",

                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background =
                        "#FFFFFF";

                      e.currentTarget.style.color =
                        "#0F172A";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background =
                        "transparent";

                      e.currentTarget.style.color =
                        "#475569";
                    }
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================
          CURRENT PARTNER PAGE
         ========================================================= */}
      <div
        style={{
          padding: "8px 30px 36px",
        }}
      >
        {children}
      </div>
    </div>
  );
}
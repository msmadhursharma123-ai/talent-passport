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
      className="partner-layout-root"
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
      <style>{`
        /* =========================================================
           TABLET
           ========================================================= */

        @media (max-width: 1024px) {
          .partner-layout-nav-wrap {
            padding: 8px 10px 6px !important;
          }

          .partner-layout-nav-card {
            padding: 12px 14px 10px !important;
            border-radius: 16px !important;
          }

          .partner-layout-top-row {
            gap: 12px !important;
          }

          .partner-layout-identity > div:first-child {
            font-size: 8px !important;
            letter-spacing: 1.25px !important;
            margin-bottom: 3px !important;
          }

          .partner-layout-identity > div:last-child {
            font-size: 16px !important;
          }

          /* Logout matches tablet navigation tab sizing */
          .partner-layout-logout {
            padding: 7px 11px !important;

            border-radius: 8px !important;

            font-size: 10px !important;

            min-width: 0 !important;
            min-height: 0 !important;

            line-height: normal !important;
          }

          .partner-layout-tabs {
            width: 100% !important;
            max-width: 100% !important;

            margin-top: 10px !important;

            padding: 4px !important;
            gap: 4px !important;

            flex-wrap: nowrap !important;

            overflow-x: auto !important;

            scrollbar-width: none;
          }

          .partner-layout-tabs::-webkit-scrollbar {
            display: none;
          }

          .partner-layout-tab {
            flex: 0 0 auto !important;

            padding: 7px 11px !important;

            border-radius: 8px !important;

            font-size: 10px !important;
          }

          .partner-layout-content {
            padding: 4px 10px 22px !important;
          }
        }


        /* =========================================================
           MOBILE
           ========================================================= */

        @media (max-width: 600px) {
          .partner-layout-nav-wrap {
            padding: 6px 7px 4px !important;
          }

          .partner-layout-nav-card {
            padding: 9px 10px 8px !important;

            border-radius: 13px !important;
          }

          .partner-layout-identity > div:first-child {
            font-size: 6px !important;

            letter-spacing: .9px !important;
          }

          .partner-layout-identity > div:last-child {
            font-size: 13px !important;
          }

          /* Logout matches mobile navigation tab sizing */
          .partner-layout-logout {
            padding: 6px 9px !important;

            border-radius: 7px !important;

            font-size: 8px !important;

            min-width: 0 !important;
            min-height: 0 !important;

            line-height: normal !important;
          }

          .partner-layout-tabs {
            margin-top: 7px !important;

            padding: 3px !important;

            gap: 3px !important;
          }

          .partner-layout-tab {
            padding: 6px 9px !important;

            border-radius: 7px !important;

            font-size: 8px !important;
          }

          .partner-layout-content {
            padding: 3px 7px 18px !important;
          }
        }
      `}</style>


      {/* =========================================================
          PARTNER PORTAL NAVIGATION
         ========================================================= */}

      <div
        className="partner-layout-nav-wrap"
        style={{
          padding: "18px 32px 16px",
        }}
      >
        <div
          className="partner-layout-nav-card"
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


          {/* =====================================================
              TOP ROW
             ===================================================== */}

          <div
            className="partner-layout-top-row"
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

            <div className="partner-layout-identity">
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


            {/* =====================================================
                LOGOUT
                Same sizing system as navigation tabs.
                Only red visual treatment is different.
               ===================================================== */}

            <button
              className="partner-layout-logout"
              onClick={onLogout}
              style={{
                padding: "10px 17px",

                background: "#DC2F2F",

                color: "#FFFFFF",

                border: "1px solid #DC2F2F",

                borderRadius: 10,

                fontSize: 14,

                fontWeight: 750,

                lineHeight: "normal",

                cursor: "pointer",

                whiteSpace: "nowrap",

                flexShrink: 0,

                boxShadow:
                  "0 5px 12px rgba(220, 47, 47, 0.17)",

                transition:
                  "all 0.18s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "#C92828";

                e.currentTarget.style.borderColor =
                  "#C92828";

                e.currentTarget.style.transform =
                  "translateY(-1px)";

                e.currentTarget.style.boxShadow =
                  "0 6px 14px rgba(220, 47, 47, 0.22)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "#DC2F2F";

                e.currentTarget.style.borderColor =
                  "#DC2F2F";

                e.currentTarget.style.transform =
                  "translateY(0)";

                e.currentTarget.style.boxShadow =
                  "0 5px 12px rgba(220, 47, 47, 0.17)";
              }}
            >
              Logout
            </button>
          </div>


          {/* =====================================================
              NAVIGATION
             ===================================================== */}

          <div
            className="partner-layout-tabs"
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
                  className="partner-layout-tab"
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
        className="partner-layout-content"
        style={{
          padding: "8px 30px 36px",
        }}
      >
        {children}
      </div>
    </div>
  );
}
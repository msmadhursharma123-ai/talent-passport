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

const tabs = [

  {
    key: "dashboard",
    label: "Dashboard"
  },

  {
    key: "talent-discovery",
    label: "Talent Discovery"
  },

  {
    key: "incoming-requests",
    label: "Incoming Requests"
  },

  {
    key: "lead-pipeline",
    label: "Lead Pipeline"
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
        background: "#F5F7F8"
      }}
    >

      <div
        style={{
          background: "#0F172A",
          padding: "20px 40px",
          color: "white"
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
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 2
              }}
            >
              TALENT PASSPORT
            </div>

            <h2
              style={{
                margin: 0,
                marginTop: 6
              }}
            >
              Partner Portal
            </h2>

          </div>

          <button
            onClick={onLogout}
            style={{
              background: "#F4A623",
              color: "white",
              border: "none",
              borderRadius: 12,
              padding: "12px 20px",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Logout
          </button>

        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 20,
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
                border: "none",
                borderRadius: 12,
                padding: "12px 18px",
                cursor: "pointer",
                fontWeight: 600,

                background:

                  activeTab ===
                  tab.key

                    ? "#F4A623"

                    : "#1E293B",

                color: "white"
              }}
            >
              {tab.label}
            </button>

          ))}

        </div>

      </div>

      <div
        style={{
          padding: "30px"
        }}
      >
        {children}
      </div>

    </div>

  );
}
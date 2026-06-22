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
  setActiveTab: (tab: PartnerTab) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const tabs = [
  { key: "home", label: "Partner Home" },
  { key: "programs", label: "Programs" },
  { key: "talent-discovery", label: "Talent Discovery" },
  { key: "workshops", label: "Workshops" },
  { key: "scholarships", label: "Scholarships" },
  { key: "opportunities", label: "Opportunities" },
  { key: "profile", label: "Profile" }
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
        background:"#F5F7F8",
        minHeight:"100vh",
        padding:"20px"
      }}
    >
      <div
        style={{
          background:"white",
          borderRadius:20,
          padding:20,
          marginBottom:20
        }}
      >
        <div
          style={{
            display:"flex",
            justifyContent:"space-between",
            alignItems:"center"
          }}
        >
          <h2>Partner Portal</h2>

          <button
            onClick={onLogout}
          >
            Logout
          </button>
        </div>

        <div
          style={{
            display:"flex",
            gap:10,
            flexWrap:"wrap",
            marginTop:20
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
                padding:"10px 16px",
                borderRadius:10,
                border:"none",
                cursor:"pointer",
                background:
                  activeTab === tab.key
                    ? "#FF6B00"
                    : "#EFF2F6",
                color:
                  activeTab === tab.key
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
  );
}
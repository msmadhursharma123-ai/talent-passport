interface Props {
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function TeacherSidebar({
  activePage,
  onNavigate,
}: Props) {
  const items = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "◇",
    },
    {
      id: "daily-log",
      label: "Daily Log",
      icon: "○",
    },
    {
      id: "teaching-journal",
      label: "Teaching Journal",
      icon: "□",
    },
    {
      id: "my-classroom",
      label: "My Classroom",
      icon: "△",
    },
    {
      id: "exam-preparation",
      label: "Exam Prep",
      icon: "☆",
    },
  ];

  return (
    <aside
      className="teacher-sidebar"
      style={{
        width: 205,
        minWidth: 205,
        minHeight: "100vh",

        display: "flex",
        flexDirection: "column",

        position: "relative",
        overflow: "hidden",

        boxSizing: "border-box",

        padding: "22px 14px 16px",

        background:
          "linear-gradient(180deg, #FFFFFF 0%, #FFFCF8 55%, #FFF9F2 100%)",

        borderRight: "1px solid #E2E8F0",

        boxShadow:
          "8px 0 28px rgba(15, 23, 42, 0.035)",
      }}
    >
      {/* DECORATIVE CIRCLES */}

      <div
        style={{
          position: "absolute",
          width: 145,
          height: 145,
          borderRadius: "50%",
          background: "rgba(249, 115, 22, 0.045)",
          top: -70,
          right: -75,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "rgba(59, 130, 246, 0.035)",
          bottom: 105,
          left: -65,
          pointerEvents: "none",
        }}
      />

      {/* PORTAL IDENTITY */}

      <div
        className="teacher-sidebar-identity"
        style={{
          position: "relative",
          zIndex: 1,

          padding: "3px 8px 20px",

          borderBottom: "1px solid #EEF2F7",
        }}
      >
        <div
          style={{
            color: "#F97316",

            fontSize: 10,
            fontWeight: 800,

            letterSpacing: 1.6,
            textTransform: "uppercase",

            marginBottom: 7,
          }}
        >
          Talent Passport
        </div>

        <div
          style={{
            color: "#0F172A",

            fontSize: 22,
            fontWeight: 800,

            letterSpacing: "-0.4px",
          }}
        >
          Teacher Portal
        </div>

        <div
          style={{
            marginTop: 6,

            color: "#64748B",

            fontSize: 10,
            fontWeight: 600,

            lineHeight: 1.45,
          }}
        >
          Classroom Intelligence System
        </div>
      </div>

      {/* SECTION LABEL */}

      <div
        className="teacher-sidebar-label"
        style={{
          position: "relative",
          zIndex: 1,

          padding: "19px 9px 9px",

          color: "#94A3B8",

          fontSize: 10,
          fontWeight: 800,

          letterSpacing: 1.5,
          textTransform: "uppercase",
        }}
      >
        Academic Workspace
      </div>

      {/* NAVIGATION */}

      <nav
        className="teacher-sidebar-nav"
        style={{
          position: "relative",
          zIndex: 1,

          display: "flex",
          flexDirection: "column",

          gap: 7,
        }}
      >
        {items.map((item) => {
          const isActive =
            activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() =>
                onNavigate(item.id)
              }
              style={{
                width: "100%",

                display: "flex",
                alignItems: "center",

                gap: 10,

                padding: "10px 11px",

                boxSizing: "border-box",

                background: isActive
                  ? "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)"
                  : "transparent",

                border: isActive
                  ? "1px solid #FDBA74"
                  : "1px solid transparent",

                borderRadius: 11,

                cursor: "pointer",

                color: isActive
                  ? "#EA580C"
                  : "#334155",

                textAlign: "left",

                boxShadow: isActive
                  ? "0 5px 14px rgba(249, 115, 22, 0.08)"
                  : "none",

                transition: "all 0.18s ease",
              }}
              onMouseEnter={(event) => {
                if (!isActive) {
                  event.currentTarget.style.background =
                    "#F8FAFC";
                  event.currentTarget.style.borderColor =
                    "#E2E8F0";
                }
              }}
              onMouseLeave={(event) => {
                if (!isActive) {
                  event.currentTarget.style.background =
                    "transparent";
                  event.currentTarget.style.borderColor =
                    "transparent";
                }
              }}
            >
              {/* ICON */}

              <div
                style={{
                  width: 28,
                  height: 28,

                  flexShrink: 0,

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  borderRadius: 8,

                  background: isActive
                    ? "#FFFFFF"
                    : "#F8FAFC",

                  border: isActive
                    ? "1px solid #FED7AA"
                    : "1px solid #E2E8F0",

                  color: isActive
                    ? "#F97316"
                    : "#64748B",

                  fontSize: 18,
                  fontWeight: 800,
                }}
              >
                {item.icon}
              </div>

              <span
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  lineHeight: 1.25,
                }}
              >
                {item.label}
              </span>

              {isActive && (
                <div
                  style={{
                    width: 5,
                    height: 5,

                    borderRadius: "50%",

                    background: "#F97316",

                    marginLeft: "auto",

                    boxShadow:
                      "0 0 0 3px rgba(249,115,22,0.10)",
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* FLEX SPACE */}

      <div style={{ flex: 1 }} />

      {/* INTELLIGENCE STATUS */}

      <div
        className="teacher-sidebar-status"
        style={{
          position: "relative",
          zIndex: 1,

          marginTop: 20,

          padding: 12,

          background:
            "linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)",

          border: "1px solid #BBF7D0",
          borderRadius: 12,

          boxShadow:
            "0 5px 16px rgba(22, 163, 74, 0.045)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,

              borderRadius: "50%",

              background: "#16A34A",

              boxShadow:
                "0 0 0 3px rgba(22,163,74,0.10)",
            }}
          />

          <div
            style={{
              color: "#15803D",

              fontSize: 9,
              fontWeight: 800,

              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            Live Classroom Status
          </div>
        </div>

        <div
          style={{
            marginTop: 8,

            color: "#166534",

            fontSize: 11,
            fontWeight: 800,

            lineHeight: 1.4,
          }}
        >
          Academic Intelligence
        </div>

        <div
          style={{
            marginTop: 2,

            color: "#16A34A",

            fontSize: 10,
            fontWeight: 700,
          }}
        >
          Enabled
        </div>
      </div>
    
<style>{`
@media (max-width: 1024px) {
 .teacher-sidebar { width:100% !important; min-width:0 !important; min-height:0 !important; height:auto !important; padding:10px 14px !important; border-right:0 !important; border-bottom:1px solid #E2E8F0 !important; overflow-x:auto !important; flex-direction:row !important; align-items:center !important; gap:12px !important; }
 .teacher-sidebar-identity { padding:0 14px 0 2px !important; border-bottom:0 !important; border-right:1px solid #EEF2F7 !important; flex:0 0 auto; }
 .teacher-sidebar-identity > div:first-child, .teacher-sidebar-identity > div:last-child { display:none !important; }
 .teacher-sidebar-identity > div:nth-child(2) { font-size:15px !important; white-space:nowrap; }
 .teacher-sidebar-label, .teacher-sidebar-status { display:none !important; }
 .teacher-sidebar-nav { flex-direction:row !important; gap:7px !important; flex:0 0 auto; }
 .teacher-sidebar-nav button { width:auto !important; padding:7px 9px !important; gap:6px !important; white-space:nowrap; }
 .teacher-sidebar-nav button > div:first-child { width:24px !important; height:24px !important; font-size:14px !important; }
 .teacher-sidebar-nav button span { font-size:12px !important; }
}
@media (max-width: 600px) {
 .teacher-sidebar { padding:8px 10px !important; gap:8px !important; scrollbar-width:none; }
 .teacher-sidebar::-webkit-scrollbar { display:none; }
 .teacher-sidebar-identity { display:none !important; }
 .teacher-sidebar-nav { width:max-content; }
 .teacher-sidebar-nav button { padding:7px 8px !important; border-radius:9px !important; }
 .teacher-sidebar-nav button > div:first-child { width:22px !important; height:22px !important; font-size:13px !important; }
 .teacher-sidebar-nav button span { font-size:11px !important; }
}
`}</style>
</aside>
  );
}
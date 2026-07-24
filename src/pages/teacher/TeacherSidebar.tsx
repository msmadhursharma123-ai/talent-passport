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
    },
    {
      id: "daily-log",
      label: "Daily Log",
    },
    {
      id: "teaching-journal",
      label: "Teaching Journal",
    },
    {
    
id:"my-classroom",
label:"My Classroom",
},

{
id:"exam-preparation",
label:"Exam Preparation",
},
  
  ];

  return (
    <div
      style={{
        width: 190,
        minHeight: "100vh",
        background:
          "linear-gradient(180deg,#03122E 0%, #071D46 100%)",
        color: "white",
        padding: "24px 16px",
        boxSizing: "border-box",
        borderRight: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* LOGO */}

      <div
        style={{
          marginBottom: 24,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          Teacher Portal
        </h2>

        <p
          style={{
            marginTop: 4,
            color: "#94A3B8",
            fontSize: 10,
            lineHeight: 1.5,
          }}
        >
          Classroom Intelligence System
        </p>
      </div>

      {/* NAVIGATION */}

      <div>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() =>
              onNavigate(item.id)
            }
            style={{
              width: "100%",
              marginBottom: 10,
              padding: "12px 14px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",

              background:
                activePage === item.id
                  ? "linear-gradient(90deg,#F59E0B,#FB923C)"
                  : "transparent",

              color: "white",

              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 0.5,

              textAlign: "left",

              transition: "0.2s ease",

              boxShadow:
                activePage === item.id
                  ? "0px 8px 18px rgba(245,158,11,0.25)"
                  : "none",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* FOOTER */}

      <div
        style={{
          position: "absolute",
          bottom: 18,
          width: 150,
        }}
      >
        <div
          style={{
            background: "#0F244D",
            padding: 10,
            borderRadius: 10,
          }}
        >
          <div
            style={{
              color: "#10B981",
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: 1,
              marginBottom: 3,
            }}
          >
            LIVE CLASSROOM STATUS
          </div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              lineHeight: 1.4,
            }}
          >
            Academic Intelligence
            Enabled
          </div>
        </div>
      </div>
    </div>
  );
}
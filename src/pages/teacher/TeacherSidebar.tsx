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
      id: "my-classroom",
      label: "My Classroom",
    },
  ];

  return (
    <div
      style={{
        width: 280,
        minHeight: "100vh",
        background:
          "linear-gradient(180deg,#03122E 0%, #071D46 100%)",
        color: "white",
        padding: "40px 24px",
        boxSizing: "border-box",
        borderRight: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* LOGO */}

      <div
        style={{
          marginBottom: 45,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          Teacher Portal
        </h2>

        <p
          style={{
            marginTop: 8,
            color: "#94A3B8",
            fontSize: 14,
            lineHeight: 1.6,
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
              marginBottom: 16,
              padding: "18px 20px",
              borderRadius: 18,
              border: "none",
              cursor: "pointer",

              background:
                activePage === item.id
                  ? "linear-gradient(90deg,#F59E0B,#FB923C)"
                  : "transparent",

              color: "white",

              fontSize: 17,
              fontWeight: 700,
              letterSpacing: 0.5,

              textAlign: "left",

              transition: "0.2s ease",

              boxShadow:
                activePage === item.id
                  ? "0px 10px 25px rgba(245,158,11,0.25)"
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
          bottom: 30,
          width: 220,
        }}
      >
        <div
          style={{
            background: "#0F244D",
            padding: 18,
            borderRadius: 16,
          }}
        >
          <div
            style={{
              color: "#10B981",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1,
              marginBottom: 6,
            }}
          >
            LIVE CLASSROOM STATUS
          </div>

          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
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
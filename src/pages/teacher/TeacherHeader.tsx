interface Props {
  onLogout: () => void;
}

export default function TeacherHeader({
  onLogout,
}: Props) {
  const today = new Date();

  const formattedDate =
    today.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div
      style={{
        height: 110,
        background: "white",
        borderBottom: "1px solid #E2E8F0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0px 40px",
        boxShadow:
          "0px 4px 20px rgba(0,0,0,0.03)",
      }}
    >
      {/* LEFT SECTION */}

      <div>
        <h1
          style={{
            margin: 0,
            color: "#03122E",
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          Teacher Portal
        </h1>

        <p
          style={{
            marginTop: 8,
            color: "#64748B",
            fontSize: 15,
          }}
        >
          Classroom Intelligence &
          Academic Growth System
        </p>
      </div>

      {/* CENTER SECTION */}

      <div
        style={{
          background: "#F8FAFC",
          padding: "14px 22px",
          borderRadius: 18,
          textAlign: "center",
          minWidth: 260,
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#F59E0B",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: 1,
          }}
        >
          TODAY
        </p>

        <p
          style={{
            marginTop: 8,
            marginBottom: 0,
            color: "#1E293B",
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          {formattedDate}
        </p>
      </div>

      {/* RIGHT SECTION */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div
          style={{
            textAlign: "right",
          }}
        >
          <p
            style={{
              margin: 0,
              fontWeight: 700,
              color: "#03122E",
            }}
          >
            Academic Workspace
          </p>

          <p
            style={{
              marginTop: 6,
              color: "#64748B",
              fontSize: 13,
            }}
          >
            Ready for today's classes
          </p>
        </div>

        <button
          onClick={onLogout}
          style={{
            background:
              "linear-gradient(90deg,#EF4444,#DC2626)",
            color: "white",
            border: "none",
            padding: "14px 24px",
            borderRadius: 14,
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 15,
            boxShadow:
              "0px 10px 25px rgba(220,38,38,0.25)",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
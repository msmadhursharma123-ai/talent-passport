import { getCurrentTeacher } from "../../services/identityService";

interface Props {
  onLogout: () => void;
}

export default function TeacherHeader({
  onLogout,
}: Props) {
  const teacher = getCurrentTeacher();

  const schoolName =
    teacher?.schoolName?.trim() ||
    "Academic Workspace";

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
        height: 72,
        background: "white",
        borderBottom: "1px solid #E2E8F0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0px 24px",
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
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          Teacher Portal
        </h1>

        <p
          style={{
            marginTop: 4,
            color: "#64748B",
            fontSize: 11,
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
          padding: "9px 16px",
          borderRadius: 12,
          textAlign: "center",
          minWidth: 190,
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#F59E0B",
            fontWeight: 700,
            fontSize: 9,
            letterSpacing: 1,
          }}
        >
          TODAY
        </p>

        <p
          style={{
            marginTop: 4,
            marginBottom: 0,
            color: "#1E293B",
            fontWeight: 600,
            fontSize: 12,
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
    gap: 14,
  }}
>
  <div
    style={{
      textAlign: "right",
      maxWidth: 280,
    }}
  >
    <p
      style={{
        margin: 0,
        fontWeight: 700,
        fontSize: 14,
        color: "#03122E",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
      title={schoolName}
    >
      {schoolName}
    </p>

    <p
      style={{
        marginTop: 3,
        marginBottom: 0,
        color: "#64748B",
        fontSize: 10,
      }}
    >
      Academic Workspace
    </p>
  </div>

  <button
    onClick={onLogout}
    style={{
      background:
        "linear-gradient(90deg,#EF4444,#DC2626)",
      color: "white",
      border: "none",
      padding: "9px 16px",
      borderRadius: 10,
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 12,
      boxShadow:
        "0px 8px 18px rgba(220,38,38,0.25)",
    }}
  >
    Logout
  </button>
</div>

    </div>
  );
}
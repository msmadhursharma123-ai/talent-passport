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
    <header
      className="teacher-header"
      style={{
        minHeight: 82,

        background:
          "linear-gradient(135deg, #FFFFFF 0%, #FFFCF8 72%, #FFF7ED 100%)",

        borderBottom: "1px solid #E2E8F0",

        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",

        padding: "0 26px",

        boxSizing: "border-box",

        boxShadow:
          "0 8px 24px rgba(15, 23, 42, 0.035)",

        position: "relative",
        overflow: "hidden",

        zIndex: 20,
      }}
    >
      {/* =====================================================
          DECORATIVE BACKGROUND
         ===================================================== */}

      <div
        style={{
          position: "absolute",

          width: 150,
          height: 150,

          borderRadius: "50%",

          background:
            "rgba(249, 115, 22, 0.045)",

          right: 175,
          top: -100,

          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",

          width: 100,
          height: 100,

          borderRadius: "50%",

          background:
            "rgba(59, 130, 246, 0.035)",

          left: "31%",
          bottom: -72,

          pointerEvents: "none",
        }}
      />

      {/* =====================================================
          LEFT

          Intentionally empty.

          Portal identity already exists in TeacherSidebar.
          Keeping this column preserves true center alignment
          for the date card.
         ===================================================== */}

      <div />

      {/* =====================================================
          CENTER — CURRENT DATE
         ===================================================== */}

      <div
        className="teacher-header-date"
        style={{
          position: "relative",
          zIndex: 1,

          minWidth: 190,

          padding: "10px 20px",

          background:
            "linear-gradient(135deg, #FFF9F2 0%, #FFFFFF 100%)",

          border: "1px solid #FDBA74",

          borderRadius: 14,

          textAlign: "center",

          boxShadow:
            "0 6px 18px rgba(249, 115, 22, 0.055)",
        }}
      >
        <div
          style={{
            color: "#F97316",

            fontSize: 11,
            fontWeight: 800,

            letterSpacing: 1.5,

            textTransform: "uppercase",
          }}
        >
          Today
        </div>

        <div
          style={{
            marginTop: 5,

            color: "#0F172A",

            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {formattedDate}
        </div>
      </div>

      {/* =====================================================
          RIGHT — SCHOOL IDENTITY + LOGOUT
         ===================================================== */}

      <div
        className="teacher-header-right"
        style={{
          position: "relative",
          zIndex: 1,

          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",

          gap: 14,

          minWidth: 0,
        }}
      >
        {/* SCHOOL */}

        <div
          style={{
            textAlign: "right",

            maxWidth: 280,
            minWidth: 0,
          }}
        >
          <div
            style={{
              color: "#0F172A",

              fontSize: 17,
              fontWeight: 800,

              lineHeight: 1.2,

              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={schoolName}
          >
            {schoolName}
          </div>

          <div
            style={{
              marginTop: 5,

              color: "#64748B",

              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Academic Workspace
          </div>
        </div>

        {/* SEPARATOR */}

        <div
          style={{
            width: 1,
            height: 30,

            background: "#E2E8F0",
          }}
        />

        {/* LOGOUT */}

        <button
          onClick={onLogout}
          style={{
            padding: "10px 17px",

            background:
              "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)",

            color: "#EA580C",

            border: "1px solid #FDBA74",

            borderRadius: 11,

            cursor: "pointer",

            fontSize: 14,
            fontWeight: 800,

            boxShadow:
              "0 6px 16px rgba(249, 115, 22, 0.08)",

            transition:
              "all 0.2s ease",

            whiteSpace: "nowrap",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.background =
              "#F97316";

            event.currentTarget.style.color =
              "#FFFFFF";

            event.currentTarget.style.transform =
              "translateY(-1px)";

            event.currentTarget.style.boxShadow =
              "0 8px 20px rgba(249, 115, 22, 0.18)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background =
              "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)";

            event.currentTarget.style.color =
              "#EA580C";

            event.currentTarget.style.transform =
              "translateY(0)";

            event.currentTarget.style.boxShadow =
              "0 6px 16px rgba(249, 115, 22, 0.08)";
          }}
        >
          Logout
        </button>
      </div>
    
<style>{`
@media (max-width: 1024px) {
 .teacher-header { min-height: 72px !important; grid-template-columns: auto 1fr !important; padding: 0 18px !important; gap: 14px !important; }
 .teacher-header > div:nth-of-type(3) { display:none !important; }
 .teacher-header-date { justify-self:start !important; min-width:0 !important; padding:8px 14px !important; }
 .teacher-header-right { justify-self:end !important; }
}
@media (max-width: 600px) {
 .teacher-header { min-height:64px !important; padding:8px 12px !important; gap:8px !important; }
 .teacher-header-date { padding:7px 9px !important; border-radius:10px !important; }
 .teacher-header-date > div:first-child { font-size:8px !important; letter-spacing:1px !important; }
 .teacher-header-date > div:last-child { font-size:10px !important; margin-top:3px !important; white-space:nowrap; }
 .teacher-header-right { gap:7px !important; min-width:0 !important; }
 .teacher-header-right > div:first-child { display:none !important; }
 .teacher-header-right > div:nth-child(2) { display:none !important; }
 .teacher-header-right button { padding:8px 10px !important; font-size:11px !important; border-radius:9px !important; }
}
`}</style>
</header>
  );
}
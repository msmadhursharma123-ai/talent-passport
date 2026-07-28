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
    <header
      className="teacher-header"
      style={{
        minHeight: 82,

        background:
          "linear-gradient(135deg, #FFFFFF 0%, #FFFCF8 72%, #FFF7ED 100%)",

        borderBottom: "1px solid #E2E8F0",

        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",

        padding: "0 26px",

        boxSizing: "border-box",

        boxShadow:
          "0 8px 24px rgba(15, 23, 42, 0.035)",

        position: "relative",
        overflow: "hidden",

        zIndex: 20,
      }}
    >

      {/* DECORATIVE BACKGROUND */}

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


      {/* LEFT — CURRENT DATE */}

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


      {/* RIGHT — LOGOUT */}

      <div
        className="teacher-header-right"
        style={{
          position: "relative",
          zIndex: 1,

          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",

          minWidth: 0,
        }}
      >

        <button
          className="teacher-header-logout"
          onClick={onLogout}
          style={{
            padding: "14px 25px",

            background: "#DC2F2F",

            color: "#FFFFFF",

            border: "none",

            borderRadius: 16,

            cursor: "pointer",

            fontSize: 16,
            fontWeight: 800,

            boxShadow:
              "0 7px 18px rgba(220, 47, 47, 0.16)",

            transition:
              "all 0.2s ease",

            whiteSpace: "nowrap",
          }}

          onMouseEnter={(event) => {

            event.currentTarget.style.background =
              "#C62828";

            event.currentTarget.style.transform =
              "translateY(-1px)";

            event.currentTarget.style.boxShadow =
              "0 9px 22px rgba(220, 47, 47, 0.22)";
          }}

          onMouseLeave={(event) => {

            event.currentTarget.style.background =
              "#DC2F2F";

            event.currentTarget.style.transform =
              "translateY(0)";

            event.currentTarget.style.boxShadow =
              "0 7px 18px rgba(220, 47, 47, 0.16)";
          }}
        >
          Logout
        </button>

      </div>


      <style>{`

        /* ================================
           TABLET
        ================================= */

        @media (max-width: 1024px) {

          .teacher-header {
            min-height: 72px !important;

            padding:
              0 18px !important;

            gap: 14px !important;
          }

          .teacher-header-date {
            min-width: 0 !important;

            padding:
              8px 14px !important;

            flex-shrink: 0 !important;
          }

          .teacher-header-right {
            margin-left: auto !important;
          }

          .teacher-header-logout {
            padding:
              11px 18px !important;

            font-size:
              14px !important;

            border-radius:
              13px !important;
          }
        }


        /* ================================
           MOBILE
        ================================= */

        @media (max-width: 600px) {

          .teacher-header {
            min-height: 64px !important;

            padding:
              8px 12px !important;

            gap: 8px !important;

            justify-content:
              space-between !important;
          }

          .teacher-header-date {
            min-width: 0 !important;

            padding:
              7px 9px !important;

            border-radius:
              10px !important;

            flex-shrink: 1 !important;
          }

          .teacher-header-date > div:first-child {
            font-size:
              8px !important;

            letter-spacing:
              1px !important;
          }

          .teacher-header-date > div:last-child {
            font-size:
              10px !important;

            margin-top:
              3px !important;

            white-space: nowrap;
          }

          .teacher-header-right {
            margin-left: auto !important;

            flex-shrink: 0 !important;
          }

          .teacher-header-logout {
            padding:
              9px 13px !important;

            font-size:
              11px !important;

            border-radius:
              11px !important;
          }
        }

      `}</style>

    </header>
  );
}
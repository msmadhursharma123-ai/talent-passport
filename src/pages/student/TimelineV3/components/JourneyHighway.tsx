import React from "react";

type JourneyAchievement = {
  id: string;
  achievement_year: number;
  event_name: string;
};

interface JourneyHighwayProps {
  achievements: JourneyAchievement[];
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
}

export default function JourneyHighway({
  achievements,
  activeIndex,
  setActiveIndex,
}: JourneyHighwayProps) {
  const totalAchievements = achievements.length;

  function goPrevious() {
    setActiveIndex((currentIndex) =>
      Math.max(currentIndex - 1, 0)
    );
  }

  function goNext() {
    setActiveIndex((currentIndex) =>
      Math.min(
        currentIndex + 1,
        totalAchievements - 1
      )
    );
  }

  return (
    <div
      className="journey-highway-card"
      style={{
        background: "#FFFFFF",
        borderRadius: 28,
        border: "1px solid #E2E8F0",
        padding: 34,
        marginBottom: 28,
        overflow: "hidden",
      }}
    >
      {/* HEADER */}

      <div
        className="journey-highway-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 28,
        }}
      >
        <div className="journey-highway-header-copy">
          <div
            className="journey-highway-eyebrow"
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#F97316",
              marginBottom: 8,
            }}
          >
            Talent Journey Highway
          </div>

          <h3
            className="journey-highway-title"
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 800,
              color: "#0F172A",
            }}
          >
            Achievement Progress Road
          </h3>

          <div
            className="journey-highway-description"
            style={{
              marginTop: 8,
              color: "#64748B",
            }}
          >
            Move through every milestone of your student journey.
          </div>
        </div>

        <div
          className="journey-highway-counter"
          style={{
            background: "#F8FAFC",
            padding: "10px 18px",
            borderRadius: 14,
            fontWeight: 700,
            color: "#16335B",
          }}
        >
          {totalAchievements > 0
            ? `${activeIndex + 1} / ${totalAchievements}`
            : "0 / 0"}
        </div>
      </div>

      {/* EMPTY STATE */}

      {totalAchievements === 0 ? (
        <div
          className="journey-highway-empty"
          style={{
            minHeight: 210,
            borderRadius: 22,
            border: "1px dashed #CBD5E1",
            background: "#F8FAFC",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: 30,
          }}
        >
          <div>
            <div
              className="journey-highway-empty-icon"
              style={{
                width: 64,
                height: 64,
                margin: "0 auto 14px",
                borderRadius: "50%",
                background: "#FFF7ED",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
              }}
            >
              🚀
            </div>

            <div
              className="journey-highway-empty-title"
              style={{
                color: "#0F172A",
                fontWeight: 800,
                fontSize: 18,
              }}
            >
              Your achievement highway starts here
            </div>

            <div
              className="journey-highway-empty-copy"
              style={{
                color: "#64748B",
                fontSize: 14,
                marginTop: 7,
              }}
            >
              Add an achievement to create your first journey checkpoint.
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* HIGHWAY */}

          <div
            className="journey-highway-scroll"
            style={{
              position: "relative",
              height: 210,
              overflowX: "auto",
              overflowY: "hidden",
            }}
          >
            <svg
              className="journey-highway-svg"
              width={Math.max(
                totalAchievements * 230,
                1200
              )}
              height="210"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
              }}
            >
              <path
                d={achievements
                  .map((_, index) => {
                    const x = 120 + index * 220;

                    const y =
                      index % 2 === 0
                        ? 115
                        : 85;

                    return `${
                      index === 0 ? "M" : "S"
                    } ${x} ${y} ${x + 110} ${y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="#203A63"
                strokeWidth="8"
                strokeLinecap="round"
              />
            </svg>

            {/* CHECKPOINTS */}

            {achievements.map((item, index) => {
              const x = 120 + index * 220;

              const y =
                index % 2 === 0
                  ? 115
                  : 85;

              const isCurrent =
                index === activeIndex;

              const completed =
                index < activeIndex;

              return (
                <div
                  className="journey-highway-checkpoint"
                  key={item.id}
                  onClick={() =>
                    setActiveIndex(index)
                  }
                  style={{
                    position: "absolute",
                    left: x - 35,
                    top: y - 35,
                    cursor: "pointer",
                    textAlign: "center",
                    transition: ".35s",
                  }}
                >
                  <div
                    className={`journey-highway-node ${
                      isCurrent
                        ? "journey-highway-node-current"
                        : ""
                    }`}
                    style={{
                      width: isCurrent
                        ? 78
                        : 62,
                      height: isCurrent
                        ? 78
                        : 62,
                      borderRadius: "50%",
                      background: isCurrent
                        ? "linear-gradient(135deg,#F97316,#FB923C)"
                        : completed
                        ? "#16A34A"
                        : "#203A63",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "#FFF",
                      fontSize: isCurrent
                        ? 28
                        : 20,
                      fontWeight: 800,
                      boxShadow: isCurrent
                        ? "0 12px 30px rgba(249,115,22,.28)"
                        : "0 8px 20px rgba(15,23,42,.10)",
                      transition: "all .35s",
                    }}
                  >
                    {completed
                      ? "✓"
                      : isCurrent
                      ? "🚀"
                      : index + 1}
                  </div>

                  <div
                    className="journey-highway-event"
                    style={{
                      marginTop: 12,
                      fontWeight: 700,
                      color: "#0F172A",
                      fontSize: 14,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.event_name}
                  </div>

                  <div
                    className="journey-highway-year"
                    style={{
                      marginTop: 3,
                      fontSize: 12,
                      color: "#64748B",
                    }}
                  >
                    {item.achievement_year}
                  </div>
                </div>
              );
            })}
          </div>

          {/* NAVIGATION */}

          <div
            className="journey-highway-navigation"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 14,
              marginTop: 26,
            }}
          >
            <button
              className="journey-highway-button"
              onClick={goPrevious}
              disabled={activeIndex === 0}
              style={{
                background: "#FFF",
                border: "1px solid #CBD5E1",
                padding: "12px 20px",
                borderRadius: 12,
                cursor:
                  activeIndex === 0
                    ? "not-allowed"
                    : "pointer",
                fontWeight: 700,
                color:
                  activeIndex === 0
                    ? "#94A3B8"
                    : "#0F172A",
                opacity:
                  activeIndex === 0
                    ? 0.65
                    : 1,
              }}
            >
              ← Previous
            </button>

            <button
              className="journey-highway-button"
              onClick={goNext}
              disabled={
                activeIndex >=
                totalAchievements - 1
              }
              style={{
                background: "#FFF",
                border: "1px solid #CBD5E1",
                padding: "12px 20px",
                borderRadius: 12,
                cursor:
                  activeIndex >=
                  totalAchievements - 1
                    ? "not-allowed"
                    : "pointer",
                fontWeight: 700,
                color:
                  activeIndex >=
                  totalAchievements - 1
                    ? "#94A3B8"
                    : "#0F172A",
                opacity:
                  activeIndex >=
                  totalAchievements - 1
                    ? 0.65
                    : 1,
              }}
            >
              Next →
            </button>
          </div>
        </>
      )}

      <style>{`

        /* =====================================================
           TABLET
           DESKTOP > 1024px UNTOUCHED
        ===================================================== */

        @media (max-width: 1024px) {

          .journey-highway-card {
            padding: 20px !important;
            margin-bottom: 17px !important;
            border-radius: 20px !important;
          }

          .journey-highway-header {
            margin-bottom: 18px !important;
          }

          .journey-highway-eyebrow {
            font-size: 9.5px !important;
            letter-spacing: 1.5px !important;
            margin-bottom: 6px !important;
          }

          .journey-highway-title {
            font-size: 21px !important;
          }

          .journey-highway-description {
            margin-top: 6px !important;
            font-size: 12.5px !important;
          }

          .journey-highway-counter {
            padding: 8px 13px !important;
            border-radius: 11px !important;
            font-size: 12px !important;
          }

          .journey-highway-scroll {
            height: 175px !important;
          }

          .journey-highway-navigation {
            gap: 9px !important;
            margin-top: 17px !important;
          }

          .journey-highway-button {
            padding: 9px 15px !important;
            border-radius: 10px !important;
            font-size: 12px !important;
          }

          .journey-highway-empty {
            min-height: 160px !important;
            padding: 20px !important;
            border-radius: 17px !important;
          }

          .journey-highway-empty-icon {
            width: 50px !important;
            height: 50px !important;
            font-size: 22px !important;
            margin-bottom: 10px !important;
          }

          .journey-highway-empty-title {
            font-size: 15px !important;
          }

          .journey-highway-empty-copy {
            font-size: 12px !important;
          }

        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 768px) {

          .journey-highway-card {
            width: 100% !important;
            max-width: 100% !important;

            padding: 13px !important;
            margin-bottom: 10px !important;

            border-radius: 15px !important;

            box-sizing: border-box;
          }


          /* ================= HEADER ================= */

          .journey-highway-header {
            align-items: flex-start !important;

            gap: 8px !important;

            margin-bottom: 11px !important;
          }

          .journey-highway-header-copy {
            flex: 1 1 auto;
            min-width: 0;
          }

          .journey-highway-eyebrow {
            font-size: 7.5px !important;
            letter-spacing: 1.1px !important;
            margin-bottom: 4px !important;
          }

          .journey-highway-title {
            font-size: 17px !important;
            line-height: 1.15 !important;
          }

          .journey-highway-description {
            margin-top: 4px !important;

            font-size: 10px !important;
            line-height: 1.3 !important;
          }

          .journey-highway-counter {
            flex-shrink: 0;

            padding: 6px 9px !important;

            border-radius: 9px !important;

            font-size: 10px !important;
          }


          /* ================= HIGHWAY ================= */

          .journey-highway-scroll {
            width: 100% !important;
            max-width: 100% !important;

            height: 150px !important;

            overflow-x: auto !important;
            overflow-y: hidden !important;

            -webkit-overflow-scrolling: touch;

            scrollbar-width: thin;
          }


          /*
            Keep the actual journey horizontal.

            We scale the desktop highway rather than converting
            the feature into unrelated vertical cards.
          */

          .journey-highway-svg {
            transform: scale(.78);
            transform-origin: left top;
          }

          .journey-highway-checkpoint {
            transform: scale(.78);
            transform-origin: center top;
          }

          .journey-highway-event {
            margin-top: 8px !important;

            font-size: 11px !important;

            max-width: 145px;

            overflow: hidden;
            text-overflow: ellipsis;
          }

          .journey-highway-year {
            margin-top: 2px !important;

            font-size: 9.5px !important;
          }


          /* ================= NAVIGATION ================= */

          .journey-highway-navigation {
            gap: 7px !important;

            margin-top: 10px !important;
          }

          .journey-highway-button {
            padding: 7px 12px !important;

            border-radius: 9px !important;

            font-size: 10px !important;
          }


          /* ================= EMPTY ================= */

          .journey-highway-empty {
            min-height: 125px !important;

            padding: 15px !important;

            border-radius: 13px !important;
          }

          .journey-highway-empty-icon {
            width: 42px !important;
            height: 42px !important;

            margin-bottom: 8px !important;

            font-size: 18px !important;
          }

          .journey-highway-empty-title {
            font-size: 13px !important;
          }

          .journey-highway-empty-copy {
            margin-top: 5px !important;

            font-size: 10px !important;
            line-height: 1.3 !important;
          }

        }


        /* =====================================================
           520px
        ===================================================== */

        @media (max-width: 520px) {

          .journey-highway-card {
            padding: 11px !important;

            border-radius: 14px !important;
          }

          .journey-highway-title {
            font-size: 16px !important;
          }

          .journey-highway-description {
            font-size: 9.5px !important;
          }

          .journey-highway-scroll {
            height: 138px !important;
          }

          .journey-highway-svg {
            transform: scale(.70);
          }

          .journey-highway-checkpoint {
            transform: scale(.70);
          }

          .journey-highway-navigation {
            margin-top: 8px !important;
          }

          .journey-highway-button {
            padding: 6px 10px !important;

            font-size: 9.5px !important;
          }

        }


        /* =====================================================
           390px / 400px
        ===================================================== */

        @media (max-width: 420px) {

          .journey-highway-card {
            padding: 10px !important;
            margin-bottom: 8px !important;

            border-radius: 13px !important;
          }

          .journey-highway-header {
            gap: 6px !important;
            margin-bottom: 8px !important;
          }

          .journey-highway-eyebrow {
            font-size: 7px !important;
          }

          .journey-highway-title {
            font-size: 15px !important;
          }

          .journey-highway-description {
            font-size: 9px !important;
          }

          .journey-highway-counter {
            padding: 5px 8px !important;

            font-size: 9px !important;
          }

          .journey-highway-scroll {
            height: 130px !important;
          }

          .journey-highway-svg {
            transform: scale(.65);
          }

          .journey-highway-checkpoint {
            transform: scale(.65);
          }

          .journey-highway-button {
            padding: 6px 9px !important;

            border-radius: 8px !important;

            font-size: 9px !important;
          }

        }

      `}</style>
    </div>
  );
}
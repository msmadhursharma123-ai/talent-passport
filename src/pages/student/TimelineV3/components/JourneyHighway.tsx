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
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 28,
        }}
      >
        <div>
          <div
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
            style={{
              marginTop: 8,
              color: "#64748B",
            }}
          >
            Move through every milestone of your student journey.
          </div>
        </div>

        <div
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
              style={{
                color: "#0F172A",
                fontWeight: 800,
                fontSize: 18,
              }}
            >
              Your achievement highway starts here
            </div>

            <div
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
            style={{
              position: "relative",
              height: 210,
              overflowX: "auto",
              overflowY: "hidden",
            }}
          >
            <svg
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
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 14,
              marginTop: 26,
            }}
          >
            <button
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
    </div>
  );
}
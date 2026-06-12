import { useState } from "react";

export default function Timeline() {
  const [activeIndex, setActiveIndex] =
    useState(1);

  const timeline = [
    {
      checkpoint: "C1",
      title: "Inter School Youth Debate",
      level: "District Level",
      result: "Runner Up",
      year: "2023"
    },

    {
      checkpoint: "C2",
      title:
        "National Creative Expressions Olympiad",
      level: "National Level",
      result: "Gold Medal",
      year: "2024"
    },

    {
      checkpoint: "C3",
      title:
        "Cluster Monologue Drama Fest",
      level: "Cluster Level",
      result: "Best Performer",
      year: "2025"
    }
  ];

  const current =
    timeline[activeIndex];

  const previous =
    timeline[
      Math.max(
        activeIndex - 1,
        0
      )
    ];

  const next =
    timeline[
      Math.min(
        activeIndex + 1,
        timeline.length - 1
      )
    ];

  return (
    <div>
      <div
        style={{
          marginBottom: 35
        }}
      >
        <div
          style={{
            color: "#FF6B00",
            fontWeight: 700,
            letterSpacing: 2,
            fontSize: 12
          }}
        >
          STUDENT JOURNEY ROADMAP
        </div>

        <h1
          style={{
            color: "#0B2A4A",
            marginTop: 10
          }}
        >
          Achievement Timeline
        </h1>

        <p
          style={{
            color: "#64748B"
          }}
        >
          Navigate through your
          co-curricular journey.
        </p>
      </div>

      <div
        style={{
          background: "#071226",
          borderRadius: 30,
          padding: 40,
          color: "white"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: 50
          }}
        >
          {timeline.map(
            (item, index) => (
              <div
                key={item.checkpoint}
                style={{
                  textAlign:
                    "center",
                  flex: 1
                }}
              >
                <div
                  style={{
                    width: 55,
                    height: 55,
                    borderRadius:
                      "50%",
                    margin:
                      "0 auto",
                    background:
                      index ===
                      activeIndex
                        ? "#FF6B00"
                        : "#22304A",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    fontWeight:
                      700
                  }}
                >
                  {item.checkpoint}
                </div>
              </div>
            )
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 1fr 1fr",
            gap: 20
          }}
        >
          {[previous, current, next].map(
            (
              item,
              index
            ) => (
              <div
                key={
                  item.title +
                  index
                }
                style={{
                  background:
                    index === 1
                      ? "#FF6B00"
                      : "#0F1B35",
                  padding: 25,
                  borderRadius: 20,
                  color:
                    index === 1
                      ? "white"
                      : "#D7E3F4"
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.8,
                    marginBottom: 10
                  }}
                >
                  {index === 0
                    ? "PREVIOUS"
                    : index === 1
                    ? "CURRENT"
                    : "NEXT"}
                </div>

                <h3>
                  {item.title}
                </h3>

                <div>
                  {item.level}
                </div>

                <div>
                  {item.result}
                </div>

                <div
                  style={{
                    marginTop: 12
                  }}
                >
                  {item.year}
                </div>
              </div>
            )
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent:
              "center",
            gap: 20,
            marginTop: 30
          }}
        >
          <button
            onClick={() =>
              setActiveIndex(
                Math.max(
                  activeIndex -
                    1,
                  0
                )
              )
            }
          >
            Previous
          </button>

          <button
            onClick={() =>
              setActiveIndex(
                Math.min(
                  activeIndex +
                    1,
                  timeline.length -
                    1
                )
              )
            }
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
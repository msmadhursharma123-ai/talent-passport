import { useEffect, useMemo, useState } from "react";

import {
  buildLeaderboard,
  getLeaderboardFilters,
} from "./LeaderboardEngine";

import {
  requireIdentity,
} from "../../services/identityService";

type CompetencyCardProps = {
  title: string;
  score: number;
  rank: number;
  icon: string;
  accent: string;
  iconBg: string;
};

type MetricCardProps = {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  iconBg: string;
};

function CompetencyCard({
  title,
  score,
  rank,
  icon,
  accent,
  iconBg,
}: CompetencyCardProps) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 18,
        padding: "22px 18px",
        border: "1px solid #E2E8F0",
        minHeight: 170,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        boxShadow: "0 2px 8px rgba(15,23,42,0.035)",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          marginBottom: 14,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          color: "#334155",
          fontSize: 13,
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 30,
          lineHeight: 1,
          fontWeight: 800,
          color: "#0F172A",
        }}
      >
        #{rank}
      </div>

      <div
        style={{
          color: accent,
          fontWeight: 700,
          fontSize: 13,
          marginTop: 10,
        }}
      >
        Score {score}
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  iconBg,
}: MetricCardProps) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 18,
        padding: "18px 20px",
        border: "1px solid #E2E8F0",
        minHeight: 112,
        display: "flex",
        alignItems: "center",
        gap: 16,
        boxShadow: "0 2px 8px rgba(15,23,42,0.035)",
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          flexShrink: 0,
          borderRadius: "50%",
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 21,
        }}
      >
        {icon}
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 10,
            color: "#2563EB",
            marginBottom: 5,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#0F172A",
            lineHeight: 1.2,
          }}
        >
          {value}
        </div>

        <div
          style={{
            marginTop: 5,
            fontSize: 11,
            color: "#64748B",
            lineHeight: 1.35,
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
}

export default function StudentLeaderboard() {
  const [leaderboard, setLeaderboard] =
    useState<any[]>([]);

  const [filters, setFilters] =
    useState<any>({
      schools: [],
      classes: [],
      events: [],
    });

  const [
    selectedSchool,
    setSelectedSchool,
  ] = useState("All Schools");

  const [
    selectedClass,
    setSelectedClass,
  ] = useState("All Classes");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const studentId =
    requireIdentity().studentCode;

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    try {
      const rows =
        await buildLeaderboard();

      const filterData =
        await getLeaderboardFilters();

      setLeaderboard(rows);
      setFilters(filterData);
    } finally {
      setLoading(false);
    }
  }

  const filteredRows =
    useMemo(() => {
      return leaderboard.filter(
        (row) => {
          const schoolMatch =
            selectedSchool ===
              "All Schools" ||
            row.school_name ===
              selectedSchool;

          const classMatch =
            selectedClass ===
              "All Classes" ||
            row.class_name ===
              selectedClass;

          return (
            schoolMatch &&
            classMatch
          );
        }
      );
    }, [
      leaderboard,
      selectedSchool,
      selectedClass,
    ]);

  const myRow =
    leaderboard.find(
      (row) =>
        row.student_id ===
        studentId
    );

  function getTier(
    score: number
  ) {
    if (score >= 90) {
      return "Elite";
    }

    if (score >= 80) {
      return "Rising Star";
    }

    if (score >= 70) {
      return "Emerging Talent";
    }

    return "Explorer";
  }

  const competencies = myRow
    ? [
        {
          title: "Communication",
          score:
            myRow.communication_score,
        },
        {
          title: "Leadership",
          score:
            myRow.leadership_score,
        },
        {
          title: "Critical Thinking",
          score:
            myRow.critical_thinking_score,
        },
        {
          title: "Collaboration",
          score:
            myRow.collaboration_score,
        },
        {
          title: "Confidence",
          score:
            myRow.confidence_score,
        },
      ]
    : [];

  const strongestSkill =
    [...competencies].sort(
      (a, b) =>
        b.score - a.score
    )[0];

  const growthSkill =
    [...competencies].sort(
      (a, b) =>
        a.score - b.score
    )[0];

  const topScore =
    leaderboard.length
      ? leaderboard[0]
          .overall_score
      : 0;

  const gapToLeader =
    myRow
      ? topScore -
        myRow.overall_score
      : 0;

  const goldCutoff = 90;
  const silverCutoff = 80;
  const bronzeCutoff = 70;

    const talentTier =
    myRow
      ? getTier(myRow.overall_score)
      : "—";

  const topStrength =
    strongestSkill?.title ?? "—";

  const growthArea =
    growthSkill?.title ?? "—";

  const schools =
    filters?.schools ?? [];

  const classes =
    filters?.classes ?? [];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 22,
      }}
    >
      {/* HERO */}

      <div
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: 235,
          borderRadius: 28,
          border: "1px solid #E2E8F0",
          background:
            "linear-gradient(115deg, #FFFFFF 0%, #FFFFFF 48%, #FFF7ED 76%, #EEF4FF 100%)",
          boxShadow:
            "0 4px 16px rgba(15,23,42,0.04)",
        }}
      >
        {/* Decorative right background */}

        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: "50%",
            right: -100,
            top: -210,
            background:
              "rgba(249,115,22,0.055)",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            right: 120,
            bottom: -235,
            background:
              "rgba(37,99,235,0.055)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: "42px 40px",
            maxWidth: "67%",
          }}
        >
          <div
            style={{
              color: "#F97316",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 1.8,
              marginBottom: 14,
              textTransform: "uppercase",
            }}
          >
            Accredited Talent Ledger
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 42,
              fontWeight: 800,
              color: "#0F172A",
              lineHeight: 1.12,
              letterSpacing: -1,
            }}
          >
            Student Leaderboard
          </h1>

          <div
            style={{
              marginTop: 15,
              fontSize: 15,
              color: "#475569",
              lineHeight: 1.75,
              maxWidth: 720,
            }}
          >
            Complete ranking intelligence,
            school benchmarking, competency
            positioning and performance analytics
            across the Talent Passport ecosystem.
          </div>
        </div>

        {/* Trophy visual */}

        <div
          style={{
            position: "absolute",
            right: 62,
            top: 27,
            width: 230,
            height: 185,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 132,
              height: 132,
              borderRadius: "50%",
              background:
                "rgba(255,237,213,0.78)",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 2,
              fontSize: 96,
              lineHeight: 1,
              filter:
                "drop-shadow(0 10px 14px rgba(249,115,22,0.16))",
            }}
          >
            🏆
          </div>
        </div>
      </div>

      {/* PART 2 CONTINUES HERE */}

            {/* STUDENT TALENT RANKING LEDGER */}

      <section
        style={{
          background: "#FFFFFF",
          borderRadius: 24,
          border: "1px solid #E2E8F0",
          padding: "28px 30px 30px",
          boxShadow: "0 3px 14px rgba(15,23,42,0.035)",
        }}
      >
        {/* Section Header */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            marginBottom: 22,
          }}
        >
          <div>
            <div
              style={{
                color: "#F97316",
                fontSize: 10,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                marginBottom: 7,
              }}
            >
              Accredited Performance Ledger
            </div>

            <h2
              style={{
                margin: 0,
                color: "#0F172A",
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: -0.4,
              }}
            >
              Student Talent Ranking Ledger
            </h2>

            <p
              style={{
                margin: "7px 0 0",
                color: "#64748B",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              Compare overall talent performance and competency scores across the active leaderboard.
            </p>
          </div>

          <div
            style={{
              flexShrink: 0,
              minWidth: 112,
              padding: "12px 16px",
              borderRadius: 14,
              border: "1px solid #FED7AA",
              background: "#FFF7ED",
              textAlign: "center",
            }}
          >
            <div
              style={{
                color: "#9A3412",
                fontSize: 20,
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              {loading ? "--" : filteredRows.length}
            </div>

            <div
              style={{
                color: "#C2410C",
                fontSize: 9,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                marginTop: 5,
              }}
            >
              {filteredRows.length === 1
                ? "Student"
                : "Students"}
            </div>
          </div>
        </div>

        {/* Ranking Table */}

        <div
          style={{
            overflowX: "auto",
            borderRadius: 18,
            border: "1px solid #E2E8F0",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: 1050,
              borderCollapse: "separate",
              borderSpacing: 0,
              background: "#FFFFFF",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#07142D",
                }}
              >
                {[
                  "Rank",
                  "Student",
                  "School",
                  "Communication",
                  "Leadership",
                  "Critical Thinking",
                  "Collaboration",
                  "Confidence",
                  "Overall",
                ].map((heading, index) => (
                  <th
                    key={heading}
                    style={{
                      padding: "16px 16px",
                      textAlign:
                        index <= 2
                          ? "left"
                          : "center",
                      color: "#FFFFFF",
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 0.45,
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      borderRight:
                        index < 8
                          ? "1px solid rgba(255,255,255,0.07)"
                          : "none",
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      padding: "42px 20px",
                      textAlign: "center",
                      color: "#64748B",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    Loading leaderboard...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      padding: "42px 20px",
                      textAlign: "center",
                      color: "#64748B",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    No students found for the selected filters.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const isCurrentStudent =
                    row.student_id === studentId;

                  return (
                    <tr
                      key={row.student_id}
                      style={{
                        background: isCurrentStudent
                          ? "#FFF7ED"
                          : "#FFFFFF",
                      }}
                    >
                      {/* Rank */}

                      <td
                        style={{
                          padding: "17px 16px",
                          borderBottom: "1px solid #E2E8F0",
                          color: "#0F172A",
                          fontWeight: 800,
                          fontSize: 14,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          {row.global_rank === 1 ? (
                            <span style={{ fontSize: 18 }}>
                              🥇
                            </span>
                          ) : row.global_rank === 2 ? (
                            <span style={{ fontSize: 18 }}>
                              🥈
                            </span>
                          ) : row.global_rank === 3 ? (
                            <span style={{ fontSize: 18 }}>
                              🥉
                            </span>
                          ) : (
                            <span
                              style={{
                                width: 25,
                                height: 25,
                                borderRadius: "50%",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "#F1F5F9",
                                color: "#475569",
                                fontSize: 10,
                                fontWeight: 800,
                              }}
                            >
                              #
                            </span>
                          )}

                          <span>
                            #{row.global_rank}
                          </span>
                        </div>
                      </td>

                      {/* Student */}

                      <td
                        style={{
                          padding: "17px 16px",
                          borderBottom: "1px solid #E2E8F0",
                          minWidth: 180,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 11,
                          }}
                        >
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              flexShrink: 0,
                              borderRadius: "50%",
                              background: isCurrentStudent
                                ? "#FFEDD5"
                                : "#EFF6FF",
                              color: isCurrentStudent
                                ? "#EA580C"
                                : "#2563EB",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 13,
                              fontWeight: 800,
                              textTransform: "uppercase",
                            }}
                          >
                            {String(
                              row.student_name || "S"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <div
                              style={{
                                color: "#0F172A",
                                fontSize: 13,
                                fontWeight: 800,
                                textTransform: "capitalize",
                              }}
                            >
                              {row.student_name}
                            </div>

                            {isCurrentStudent && (
                              <div
                                style={{
                                  marginTop: 3,
                                  color: "#F97316",
                                  fontSize: 8,
                                  fontWeight: 800,
                                  textTransform: "uppercase",
                                  letterSpacing: 0.7,
                                }}
                              >
                                Current Student
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* School */}

                      <td
                        style={{
                          padding: "17px 16px",
                          borderBottom: "1px solid #E2E8F0",
                          color: "#475569",
                          fontSize: 12,
                          fontWeight: 600,
                          minWidth: 120,
                        }}
                      >
                        {row.school_name || "—"}
                      </td>

                      {/* Communication */}

                      <td
                        style={{
                          padding: "17px 16px",
                          borderBottom: "1px solid #E2E8F0",
                          textAlign: "center",
                          color: "#334155",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {row.communication_score}
                      </td>

                      {/* Leadership */}

                      <td
                        style={{
                          padding: "17px 16px",
                          borderBottom: "1px solid #E2E8F0",
                          textAlign: "center",
                          color: "#334155",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {row.leadership_score}
                      </td>

                      {/* Critical Thinking */}

                      <td
                        style={{
                          padding: "17px 16px",
                          borderBottom: "1px solid #E2E8F0",
                          textAlign: "center",
                          color: "#334155",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {row.critical_thinking_score}
                      </td>

                      {/* Collaboration */}

                      <td
                        style={{
                          padding: "17px 16px",
                          borderBottom: "1px solid #E2E8F0",
                          textAlign: "center",
                          color: "#334155",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {row.collaboration_score}
                      </td>

                      {/* Confidence */}

                      <td
                        style={{
                          padding: "17px 16px",
                          borderBottom: "1px solid #E2E8F0",
                          textAlign: "center",
                          color: "#334155",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {row.confidence_score}
                      </td>

                      {/* Overall */}

                      <td
                        style={{
                          padding: "17px 16px",
                          borderBottom: "1px solid #E2E8F0",
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            minWidth: 42,
                            height: 34,
                            padding: "0 10px",
                            borderRadius: 10,
                            background: isCurrentStudent
                              ? "#F97316"
                              : "#EFF6FF",
                            color: isCurrentStudent
                              ? "#FFFFFF"
                              : "#1D4ED8",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: 800,
                          }}
                        >
                          {row.overall_score}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* STUDENT POSITION SUMMARY */}

      {myRow && (
        <section
          style={{
            borderRadius: 20,
            border: "1px solid #D9E6C4",
            background:
              "linear-gradient(90deg, #F7FEE7 0%, #F0FDF4 100%)",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                flexShrink: 0,
                borderRadius: 14,
                background: "#DCFCE7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
              }}
            >
              📈
            </div>

            <div>
              <div
                style={{
                  color: "#F97316",
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: 1.1,
                  marginBottom: 6,
                }}
              >
                Student Position Summary
              </div>

              <div
                style={{
                  color: "#166534",
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: 1.7,
                }}
              >
                You rank{" "}
                <strong>
                  #{myRow.global_rank} globally
                </strong>
                ,{" "}
                <strong>
                  #{myRow.school_rank} in your school
                </strong>
                , and{" "}
                <strong>
                  #{myRow.class_rank} in your class
                </strong>
                , with an overall Talent Passport score of{" "}
                <strong>
                  {myRow.overall_score}
                </strong>
                .
              </div>
            </div>
          </div>

          <div
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                borderRadius: 12,
                border: "1px solid #BBF7D0",
                background: "#FFFFFF",
                padding: "10px 14px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  color: "#64748B",
                  fontSize: 8,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                Overall Score
              </div>

              <div
                style={{
                  color: "#15803D",
                  fontSize: 20,
                  fontWeight: 800,
                  marginTop: 3,
                }}
              >
                {myRow.overall_score}
              </div>
            </div>

            <div
              style={{
                borderRadius: 12,
                border: "1px solid #BBF7D0",
                background: "#FFFFFF",
                padding: "10px 14px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  color: "#64748B",
                  fontSize: 8,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                Gap To Leader
              </div>

              <div
                style={{
                  color: "#15803D",
                  fontSize: 20,
                  fontWeight: 800,
                  marginTop: 3,
                }}
              >
                {gapToLeader}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* PART 3 CONTINUES HERE */}

            {/* YOUR COMPETENCY POSITION */}

      {myRow && (
        <section
          style={{
            background: "#FFFFFF",
            borderRadius: 24,
            border: "1px solid #E2E8F0",
            padding: "26px 28px",
            boxShadow: "0 3px 14px rgba(15,23,42,0.035)",
          }}
        >
          {/* Section Header */}

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 20,
              marginBottom: 20,
            }}
          >
            <div>
              <div
                style={{
                  color: "#F97316",
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: 1.4,
                  marginBottom: 6,
                }}
              >
                Your Competency Position
              </div>

              <h2
                style={{
                  margin: 0,
                  color: "#0F172A",
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: -0.3,
                }}
              >
                Competency Ranking Overview
              </h2>

              <p
                style={{
                  margin: "6px 0 0",
                  color: "#64748B",
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              >
                Your current position across the five Talent Passport
                competencies.
              </p>
            </div>

            <div
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                background: "#FFF7ED",
                color: "#C2410C",
                fontSize: 9,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                whiteSpace: "nowrap",
              }}
            >
              Talent Passport Intelligence
            </div>
          </div>

          {/* Competency Cards */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            {/* Communication */}

            <div
              style={{
                minWidth: 0,
                borderRadius: 16,
                border: "1px solid #BFDBFE",
                background: "#EFF6FF",
                padding: "17px 16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: "#DBEAFE",
                    color: "#2563EB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  💬
                </div>

                <span
                  style={{
                    color: "#2563EB",
                    fontSize: 9,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: 0.7,
                  }}
                >
                  Communication
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#64748B",
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.6,
                    }}
                  >
                    Position
                  </div>

                  <div
                    style={{
                      color: "#0F172A",
                      fontSize: 26,
                      fontWeight: 900,
                      lineHeight: 1,
                      marginTop: 5,
                    }}
                  >
                    #{myRow.communication_rank}
                  </div>
                </div>

                <div
                  style={{
                    textAlign: "right",
                  }}
                >
                  <div
                    style={{
                      color: "#64748B",
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    Score
                  </div>

                  <div
                    style={{
                      color: "#2563EB",
                      fontSize: 17,
                      fontWeight: 900,
                      marginTop: 3,
                    }}
                  >
                    {myRow.communication_score}
                  </div>
                </div>
              </div>
            </div>

            {/* Leadership */}

            <div
              style={{
                minWidth: 0,
                borderRadius: 16,
                border: "1px solid #C7D2FE",
                background: "#EEF2FF",
                padding: "17px 16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: "#E0E7FF",
                    color: "#4F46E5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  👑
                </div>

                <span
                  style={{
                    color: "#4F46E5",
                    fontSize: 9,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: 0.7,
                  }}
                >
                  Leadership
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#64748B",
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.6,
                    }}
                  >
                    Position
                  </div>

                  <div
                    style={{
                      color: "#0F172A",
                      fontSize: 26,
                      fontWeight: 900,
                      lineHeight: 1,
                      marginTop: 5,
                    }}
                  >
                    #{myRow.leadership_rank}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      color: "#64748B",
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    Score
                  </div>

                  <div
                    style={{
                      color: "#4F46E5",
                      fontSize: 17,
                      fontWeight: 900,
                      marginTop: 3,
                    }}
                  >
                    {myRow.leadership_score}
                  </div>
                </div>
              </div>
            </div>

            {/* Critical Thinking */}

            <div
              style={{
                minWidth: 0,
                borderRadius: 16,
                border: "1px solid #DDD6FE",
                background: "#F5F3FF",
                padding: "17px 16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: "#EDE9FE",
                    color: "#7C3AED",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  🧠
                </div>

                <span
                  style={{
                    color: "#7C3AED",
                    fontSize: 9,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    textAlign: "right",
                  }}
                >
                  Critical Thinking
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#64748B",
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    Position
                  </div>

                  <div
                    style={{
                      color: "#0F172A",
                      fontSize: 26,
                      fontWeight: 900,
                      lineHeight: 1,
                      marginTop: 5,
                    }}
                  >
                    #{myRow.critical_thinking_rank}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      color: "#64748B",
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    Score
                  </div>

                  <div
                    style={{
                      color: "#7C3AED",
                      fontSize: 17,
                      fontWeight: 900,
                      marginTop: 3,
                    }}
                  >
                    {myRow.critical_thinking_score}
                  </div>
                </div>
              </div>
            </div>

            {/* Collaboration */}

            <div
              style={{
                minWidth: 0,
                borderRadius: 16,
                border: "1px solid #BBF7D0",
                background: "#F0FDF4",
                padding: "17px 16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: "#DCFCE7",
                    color: "#16A34A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  🤝
                </div>

                <span
                  style={{
                    color: "#15803D",
                    fontSize: 9,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                  }}
                >
                  Collaboration
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#64748B",
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    Position
                  </div>

                  <div
                    style={{
                      color: "#0F172A",
                      fontSize: 26,
                      fontWeight: 900,
                      lineHeight: 1,
                      marginTop: 5,
                    }}
                  >
                    #{myRow.collaboration_rank}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      color: "#64748B",
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    Score
                  </div>

                  <div
                    style={{
                      color: "#16A34A",
                      fontSize: 17,
                      fontWeight: 900,
                      marginTop: 3,
                    }}
                  >
                    {myRow.collaboration_score}
                  </div>
                </div>
              </div>
            </div>

            {/* Confidence */}

            <div
              style={{
                minWidth: 0,
                borderRadius: 16,
                border: "1px solid #FED7AA",
                background: "#FFF7ED",
                padding: "17px 16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: "#FFEDD5",
                    color: "#EA580C",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  ⚡
                </div>

                <span
                  style={{
                    color: "#C2410C",
                    fontSize: 9,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                  }}
                >
                  Confidence
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#64748B",
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    Position
                  </div>

                  <div
                    style={{
                      color: "#0F172A",
                      fontSize: 26,
                      fontWeight: 900,
                      lineHeight: 1,
                      marginTop: 5,
                    }}
                  >
                    #{myRow.confidence_rank}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      color: "#64748B",
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    Score
                  </div>

                  <div
                    style={{
                      color: "#EA580C",
                      fontSize: 17,
                      fontWeight: 900,
                      marginTop: 3,
                    }}
                  >
                    {myRow.confidence_score}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TALENT PROFILE SUMMARY */}

      {myRow && (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 14,
          }}
        >
          {/* Talent Tier */}

          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 18,
              border: "1px solid #E2E8F0",
              padding: "19px 20px",
              boxShadow: "0 2px 8px rgba(15,23,42,0.025)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 13,
              }}
            >
              <div
                style={{
                  width: 31,
                  height: 31,
                  borderRadius: 9,
                  background: "#FFF7ED",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 15,
                }}
              >
                ⭐
              </div>

              <span
                style={{
                  color: "#94A3B8",
                  fontSize: 9,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Talent Tier
              </span>
            </div>

            <div
              style={{
                color: "#0F172A",
                fontSize: 19,
                fontWeight: 850,
              }}
            >
              {talentTier}
            </div>

            <div
              style={{
                marginTop: 5,
                color: "#64748B",
                fontSize: 10,
                fontWeight: 600,
              }}
            >
              Current Talent Passport tier
            </div>
          </div>

          {/* Top Strength */}

          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 18,
              border: "1px solid #E2E8F0",
              padding: "19px 20px",
              boxShadow: "0 2px 8px rgba(15,23,42,0.025)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 13,
              }}
            >
              <div
                style={{
                  width: 31,
                  height: 31,
                  borderRadius: 9,
                  background: "#F0FDF4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 15,
                }}
              >
                ↗
              </div>

              <span
                style={{
                  color: "#94A3B8",
                  fontSize: 9,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Top Strength
              </span>
            </div>

            <div
              style={{
                color: "#0F172A",
                fontSize: 19,
                fontWeight: 850,
              }}
            >
              {topStrength}
            </div>

            <div
              style={{
                marginTop: 5,
                color: "#16A34A",
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              Strongest competency
            </div>
          </div>

          {/* Growth Area */}

          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 18,
              border: "1px solid #E2E8F0",
              padding: "19px 20px",
              boxShadow: "0 2px 8px rgba(15,23,42,0.025)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 13,
              }}
            >
              <div
                style={{
                  width: 31,
                  height: 31,
                  borderRadius: 9,
                  background: "#FFF7ED",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 15,
                }}
              >
                ◎
              </div>

              <span
                style={{
                  color: "#94A3B8",
                  fontSize: 9,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Growth Area
              </span>
            </div>

            <div
              style={{
                color: "#0F172A",
                fontSize: 19,
                fontWeight: 850,
              }}
            >
              {growthArea}
            </div>

            <div
              style={{
                marginTop: 5,
                color: "#EA580C",
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              Highest development opportunity
            </div>
          </div>

          {/* Overall Score */}

          <div
            style={{
              background: "#07142D",
              borderRadius: 18,
              border: "1px solid #07142D",
              padding: "19px 20px",
              boxShadow: "0 5px 16px rgba(7,20,45,0.10)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 13,
              }}
            >
              <div
                style={{
                  width: 31,
                  height: 31,
                  borderRadius: 9,
                  background: "rgba(255,255,255,0.10)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 15,
                }}
              >
                🏆
              </div>

              <span
                style={{
                  color: "#94A3B8",
                  fontSize: 9,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Overall Score
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 5,
              }}
            >
              <div
                style={{
                  color: "#FFFFFF",
                  fontSize: 25,
                  fontWeight: 900,
                }}
              >
                {myRow.overall_score}
              </div>

              <div
                style={{
                  color: "#94A3B8",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                / 100
              </div>
            </div>

            <div
              style={{
                marginTop: 4,
                color: "#FB923C",
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              Talent Passport Score
            </div>
          </div>
        </section>
      )}

      {/* LEADERBOARD FILTERS */}

      <section
        style={{
          background: "#FFFFFF",
          borderRadius: 18,
          border: "1px solid #E2E8F0",
          padding: "15px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 18,
          boxShadow: "0 2px 8px rgba(15,23,42,0.025)",
        }}
      >
        {/* Filter Label */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: "#F1F5F9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
            }}
          >
            ⚙
          </div>

          <div>
            <div
              style={{
                color: "#0F172A",
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              Leaderboard Filters
            </div>

            <div
              style={{
                color: "#94A3B8",
                fontSize: 9,
                fontWeight: 600,
                marginTop: 2,
              }}
            >
              Refine ranking view
            </div>
          </div>
        </div>

        {/* Filters */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flex: 1,
            justifyContent: "flex-end",
          }}
        >
          {/* School Filter */}

          <div
            style={{
              position: "relative",
              minWidth: 210,
            }}
          >
            <select
              value={selectedSchool}
              onChange={(e) =>
                setSelectedSchool(e.target.value)
              }
              style={{
                width: "100%",
                height: 42,
                appearance: "none",
                borderRadius: 11,
                border: "1px solid #CBD5E1",
                background: "#F8FAFC",
                padding: "0 38px 0 13px",
                color: "#334155",
                fontSize: 11,
                fontWeight: 700,
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="All Schools">
                All Schools
              </option>

              {schools.map((school: string) => (
                <option
                  key={school}
                  value={school}
                >
                  {school}
                </option>
              ))}
            </select>

            <div
              style={{
                position: "absolute",
                right: 13,
                top: "50%",
                transform: "translateY(-50%) rotate(45deg)",
                width: 7,
                height: 7,
                borderRight: "2px solid #475569",
                borderBottom: "2px solid #475569",
                pointerEvents: "none",
                marginTop: -2,
              }}
            />
          </div>

          {/* Class Filter */}

          <div
            style={{
              position: "relative",
              minWidth: 180,
            }}
          >
            <select
              value={selectedClass}
              onChange={(e) =>
                setSelectedClass(e.target.value)
              }
              style={{
                width: "100%",
                height: 42,
                appearance: "none",
                borderRadius: 11,
                border: "1px solid #CBD5E1",
                background: "#F8FAFC",
                padding: "0 38px 0 13px",
                color: "#334155",
                fontSize: 11,
                fontWeight: 700,
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="All Classes">
                All Classes
              </option>

             {classes.map((className: string) => (
                <option
                  key={className}
                  value={className}
                >
                  {className}
                </option>
              ))}
            </select>

            <div
              style={{
                position: "absolute",
                right: 13,
                top: "50%",
                transform: "translateY(-50%) rotate(45deg)",
                width: 7,
                height: 7,
                borderRight: "2px solid #475569",
                borderBottom: "2px solid #475569",
                pointerEvents: "none",
                marginTop: -2,
              }}
            />
          </div>
        </div>
      </section>

      {/* PART 4 CONTINUES HERE */}

            {/* TALENT INSIGHTS */}

      {myRow && (
        <section
          style={{
            background: "#FFFFFF",
            borderRadius: 24,
            border: "1px solid #E2E8F0",
            padding: "26px 28px 28px",
            boxShadow: "0 3px 14px rgba(15,23,42,0.035)",
          }}
        >
          {/* HEADER */}

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 20,
              marginBottom: 22,
            }}
          >
            <div>
              <div
                style={{
                  color: "#F97316",
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: 1.4,
                  marginBottom: 6,
                }}
              >
                Talent Intelligence
              </div>

              <h2
                style={{
                  margin: 0,
                  color: "#0F172A",
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: -0.3,
                }}
              >
                Your Talent Insights
              </h2>

              <p
                style={{
                  margin: "6px 0 0",
                  color: "#64748B",
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              >
                A concise view of your current performance,
                strongest competency and next development area.
              </p>
            </div>

            <div
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid #E2E8F0",
                background: "#F8FAFC",
                color: "#475569",
                fontSize: 9,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                whiteSpace: "nowrap",
              }}
            >
              Live Talent Profile
            </div>
          </div>

          {/* INSIGHT GRID */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: 14,
            }}
          >
            {/* CURRENT POSITION */}

            <div
              style={{
                position: "relative",
                overflow: "hidden",
                minHeight: 205,
                borderRadius: 18,
                border: "1px solid #BFDBFE",
                background: "#F8FBFF",
                padding: "21px 20px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  right: -55,
                  top: -55,
                  background:
                    "rgba(37,99,235,0.055)",
                }}
              />

              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "space-between",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 11,
                      background: "#DBEAFE",
                      color: "#2563EB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "center",
                      fontSize: 17,
                      fontWeight: 900,
                    }}
                  >
                    #
                  </div>

                  <span
                    style={{
                      color: "#2563EB",
                      fontSize: 9,
                      fontWeight: 800,
                      textTransform:
                        "uppercase",
                      letterSpacing: 0.8,
                    }}
                  >
                    Current Position
                  </span>
                </div>

                <div
                  style={{
                    marginTop: 22,
                    display: "flex",
                    alignItems: "baseline",
                    gap: 7,
                  }}
                >
                  <span
                    style={{
                      color: "#0F172A",
                      fontSize: 34,
                      fontWeight: 900,
                      lineHeight: 1,
                    }}
                  >
                    #{myRow.global_rank}
                  </span>

                  <span
                    style={{
                      color: "#64748B",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    Global Rank
                  </span>
                </div>

                <div
                  style={{
                    marginTop: 20,
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(2, minmax(0, 1fr))",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      borderRadius: 10,
                      background: "#FFFFFF",
                      border:
                        "1px solid #DBEAFE",
                      padding: "10px 11px",
                    }}
                  >
                    <div
                      style={{
                        color: "#94A3B8",
                        fontSize: 8,
                        fontWeight: 800,
                        textTransform:
                          "uppercase",
                        letterSpacing: 0.6,
                      }}
                    >
                      School
                    </div>

                    <div
                      style={{
                        color: "#1D4ED8",
                        fontSize: 15,
                        fontWeight: 900,
                        marginTop: 3,
                      }}
                    >
                      #{myRow.school_rank}
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: 10,
                      background: "#FFFFFF",
                      border:
                        "1px solid #DBEAFE",
                      padding: "10px 11px",
                    }}
                  >
                    <div
                      style={{
                        color: "#94A3B8",
                        fontSize: 8,
                        fontWeight: 800,
                        textTransform:
                          "uppercase",
                        letterSpacing: 0.6,
                      }}
                    >
                      Class
                    </div>

                    <div
                      style={{
                        color: "#1D4ED8",
                        fontSize: 15,
                        fontWeight: 900,
                        marginTop: 3,
                      }}
                    >
                      #{myRow.class_rank}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STRONGEST COMPETENCY */}

            <div
              style={{
                position: "relative",
                overflow: "hidden",
                minHeight: 205,
                borderRadius: 18,
                border: "1px solid #BBF7D0",
                background: "#F7FEF9",
                padding: "21px 20px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  right: -55,
                  top: -55,
                  background:
                    "rgba(22,163,74,0.055)",
                }}
              />

              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "space-between",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 11,
                      background: "#DCFCE7",
                      color: "#16A34A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "center",
                      fontSize: 18,
                      fontWeight: 900,
                    }}
                  >
                    ↗
                  </div>

                  <span
                    style={{
                      color: "#15803D",
                      fontSize: 9,
                      fontWeight: 800,
                      textTransform:
                        "uppercase",
                      letterSpacing: 0.8,
                    }}
                  >
                    Strongest Competency
                  </span>
                </div>

                <div
                  style={{
                    marginTop: 22,
                  }}
                >
                  <div
                    style={{
                      color: "#0F172A",
                      fontSize: 22,
                      fontWeight: 900,
                      lineHeight: 1.25,
                    }}
                  >
                    {strongestSkill?.title ||
                      "—"}
                  </div>

                  <div
                    style={{
                      marginTop: 7,
                      color: "#64748B",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    Your highest scoring
                    competency
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 21,
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "space-between",
                    gap: 12,
                    borderRadius: 11,
                    border:
                      "1px solid #BBF7D0",
                    background: "#FFFFFF",
                    padding: "11px 13px",
                  }}
                >
                  <span
                    style={{
                      color: "#64748B",
                      fontSize: 9,
                      fontWeight: 800,
                      textTransform:
                        "uppercase",
                      letterSpacing: 0.6,
                    }}
                  >
                    Competency Score
                  </span>

                  <span
                    style={{
                      color: "#15803D",
                      fontSize: 18,
                      fontWeight: 900,
                    }}
                  >
                    {strongestSkill?.score ??
                      "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* GROWTH OPPORTUNITY */}

            <div
              style={{
                position: "relative",
                overflow: "hidden",
                minHeight: 205,
                borderRadius: 18,
                border: "1px solid #FED7AA",
                background: "#FFFBF7",
                padding: "21px 20px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  right: -55,
                  top: -55,
                  background:
                    "rgba(249,115,22,0.055)",
                }}
              />

              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "space-between",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 11,
                      background: "#FFEDD5",
                      color: "#EA580C",
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "center",
                      fontSize: 18,
                      fontWeight: 900,
                    }}
                  >
                    ◎
                  </div>

                  <span
                    style={{
                      color: "#C2410C",
                      fontSize: 9,
                      fontWeight: 800,
                      textTransform:
                        "uppercase",
                      letterSpacing: 0.8,
                    }}
                  >
                    Growth Opportunity
                  </span>
                </div>

                <div
                  style={{
                    marginTop: 22,
                  }}
                >
                  <div
                    style={{
                      color: "#0F172A",
                      fontSize: 22,
                      fontWeight: 900,
                      lineHeight: 1.25,
                    }}
                  >
                    {growthSkill?.title ||
                      "—"}
                  </div>

                  <div
                    style={{
                      marginTop: 7,
                      color: "#64748B",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    Your next competency
                    development opportunity
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 21,
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "space-between",
                    gap: 12,
                    borderRadius: 11,
                    border:
                      "1px solid #FED7AA",
                    background: "#FFFFFF",
                    padding: "11px 13px",
                  }}
                >
                  <span
                    style={{
                      color: "#64748B",
                      fontSize: 9,
                      fontWeight: 800,
                      textTransform:
                        "uppercase",
                      letterSpacing: 0.6,
                    }}
                  >
                    Current Score
                  </span>

                  <span
                    style={{
                      color: "#EA580C",
                      fontSize: 18,
                      fontWeight: 900,
                    }}
                  >
                    {growthSkill?.score ??
                      "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* PERFORMANCE BENCHMARK */}

          <div
            style={{
              marginTop: 14,
              borderRadius: 16,
              border: "1px solid #E2E8F0",
              background: "#F8FAFC",
              padding: "17px 19px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                gap: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 13,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    flexShrink: 0,
                    borderRadius: 10,
                    background: "#EDE9FE",
                    color: "#7C3AED",
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "center",
                    fontSize: 16,
                    fontWeight: 900,
                  }}
                >
                  ◈
                </div>

                <div>
                  <div
                    style={{
                      color: "#0F172A",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    Performance Benchmark
                  </div>

                  <div
                    style={{
                      marginTop: 3,
                      color: "#64748B",
                      fontSize: 10,
                      fontWeight: 600,
                      lineHeight: 1.5,
                    }}
                  >
                    Your overall score compared
                    with the current leaderboard
                    leader and Talent Passport
                    performance bands.
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    minWidth: 88,
                    borderRadius: 10,
                    border:
                      "1px solid #E2E8F0",
                    background: "#FFFFFF",
                    padding: "9px 11px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      color: "#94A3B8",
                      fontSize: 7,
                      fontWeight: 800,
                      textTransform:
                        "uppercase",
                      letterSpacing: 0.6,
                    }}
                  >
                    Your Score
                  </div>

                  <div
                    style={{
                      marginTop: 3,
                      color: "#0F172A",
                      fontSize: 17,
                      fontWeight: 900,
                    }}
                  >
                    {myRow.overall_score}
                  </div>
                </div>

                <div
                  style={{
                    minWidth: 88,
                    borderRadius: 10,
                    border:
                      "1px solid #E2E8F0",
                    background: "#FFFFFF",
                    padding: "9px 11px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      color: "#94A3B8",
                      fontSize: 7,
                      fontWeight: 800,
                      textTransform:
                        "uppercase",
                      letterSpacing: 0.6,
                    }}
                  >
                    Leader
                  </div>

                  <div
                    style={{
                      marginTop: 3,
                      color: "#2563EB",
                      fontSize: 17,
                      fontWeight: 900,
                    }}
                  >
                    {topScore}
                  </div>
                </div>

                <div
                  style={{
                    minWidth: 88,
                    borderRadius: 10,
                    border:
                      "1px solid #FED7AA",
                    background: "#FFF7ED",
                    padding: "9px 11px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      color: "#C2410C",
                      fontSize: 7,
                      fontWeight: 800,
                      textTransform:
                        "uppercase",
                      letterSpacing: 0.6,
                    }}
                  >
                    Gap
                  </div>

                  <div
                    style={{
                      marginTop: 3,
                      color: "#EA580C",
                      fontSize: 17,
                      fontWeight: 900,
                    }}
                  >
                    {gapToLeader}
                  </div>
                </div>
              </div>
            </div>

            {/* SCORE BAND */}

            <div
              style={{
                marginTop: 17,
              }}
            >
              <div
                style={{
                  position: "relative",
                  height: 7,
                  borderRadius: 999,
                  overflow: "hidden",
                  background:
                    "linear-gradient(90deg, #E2E8F0 0%, #FDE68A 70%, #FDBA74 80%, #86EFAC 90%, #60A5FA 100%)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: `${Math.min(
                      Math.max(
                        myRow.overall_score,
                        0
                      ),
                      100
                    )}%`,
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: "#07142D",
                    border:
                      "3px solid #FFFFFF",
                    boxShadow:
                      "0 1px 5px rgba(15,23,42,0.25)",
                    transform:
                      "translate(-50%, -50%)",
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: 7,
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "space-between",
                  color: "#94A3B8",
                  fontSize: 8,
                  fontWeight: 800,
                  textTransform:
                    "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                <span>
                  Explorer
                </span>

                <span>
                  Emerging · {bronzeCutoff}+
                </span>

                <span>
                  Rising · {silverCutoff}+
                </span>

                <span>
                  Elite · {goldCutoff}+
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* EMPTY STUDENT PROFILE STATE */}

      {!loading && !myRow && (
        <section
          style={{
            borderRadius: 20,
            border:
              "1px dashed #CBD5E1",
            background: "#FFFFFF",
            padding: "36px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              margin: "0 auto",
              borderRadius: 14,
              background: "#FFF7ED",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 21,
            }}
          >
            🏆
          </div>

          <h3
            style={{
              margin: "14px 0 0",
              color: "#0F172A",
              fontSize: 17,
              fontWeight: 800,
            }}
          >
            Talent ranking will appear here
          </h3>

          <p
            style={{
              maxWidth: 520,
              margin: "7px auto 0",
              color: "#64748B",
              fontSize: 12,
              lineHeight: 1.6,
            }}
          >
            Your personal ranking and Talent
            Passport insights will populate once
            your leaderboard record is available.
          </p>
        </section>
      )}
    </div>
  );
}
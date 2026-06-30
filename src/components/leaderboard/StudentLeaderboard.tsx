import { useEffect, useMemo, useState } from "react";

import {
  buildLeaderboard,
  getLeaderboardFilters,
} from "./LeaderboardEngine";

import {
  requireIdentity
} from "../../services/identityService";

type CompetencyCardProps = {
  title: string;
  score: number;
  rank: number;
};

function CompetencyCard({
  title,
  score,
  rank,
}: CompetencyCardProps) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 20,
        padding: 20,
        border: "1px solid #E2E8F0",
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow:
          "0 1px 3px rgba(15,23,42,0.04)"
      }}
    >
      <div
        style={{
          color: "#64748B",
          fontSize: 12,
          fontWeight: 600
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 30,
          fontWeight: 800,
          color: "#0F172A"
        }}
      >
        #{rank}
      </div>

      <div
        style={{
          color: "#F97316",
          fontWeight: 700,
          fontSize: 14
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
}: any) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 20,
        padding: "18px 20px",
        border: "1px solid #E2E8F0",
        minHeight: 105,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        boxShadow:
          "0 1px 3px rgba(15,23,42,0.04)"
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "#94A3B8",
          marginBottom: 8,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1.5
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 24,
          fontWeight: 800,
          color: "#0F172A",
          lineHeight: 1.2
        }}
      >
        {value}
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

  const [selectedSchool,
    setSelectedSchool] =
    useState("All Schools");

  const [selectedClass,
    setSelectedClass] =
    useState("All Classes");

  const [loading,
    setLoading] =
    useState(true);

const studentId =
  requireIdentity().studentCode;

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const rows =
      await buildLeaderboard();

    const filterData =
      await getLeaderboardFilters();

    setLeaderboard(rows);
    setFilters(filterData);

    setLoading(false);
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
    if (score >= 90)
      return "Elite";

    if (score >= 80)
      return "Rising Star";

    if (score >= 70)
      return "Emerging Talent";

    return "Explorer";
  }

  const competencies = myRow
    ? [
        {
          title:
            "Communication",
          score:
            myRow.communication_score,
        },
        {
          title:
            "Leadership",
          score:
            myRow.leadership_score,
        },
        {
          title:
            "Critical Thinking",
          score:
            myRow.critical_thinking_score,
        },
        {
          title:
            "Collaboration",
          score:
            myRow.collaboration_score,
        },
        {
          title:
            "Confidence",
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

  return (
    <div
      style={{
        display: "flex",
        flexDirection:
          "column",
        gap: 24,
      }}
    >

     {/* HERO */}

<div
  style={{
    background: "#F8FAFC",
    borderRadius: 28,
    padding: "42px 40px",
    border: "1px solid #E2E8F0",
  }}
>
  <div
    style={{
      color: "#F97316",
      fontSize: 16,
      fontWeight: 200,
      letterSpacing: 2,
      marginBottom: 12,
      textTransform: "uppercase",
    }}
  >
    ACCREDITED TALENT LEDGER
  </div>

  <h1
    style={{
      margin: 0,
      fontSize: 48,
      fontWeight: 200,
      color: "#0F172A",
      lineHeight: 1.15,
    }}
  >
    Student Leaderboard
  </h1>

  <div
    style={{
      marginTop: 16,
      fontSize: 20,
      color: "#000000",
      lineHeight: 1.7,
      maxWidth: 1800,
    }}
  >
    Complete ranking intelligence, school benchmarking,
    competency positioning and performance analytics
    across the Talent Passport ecosystem.
  </div>
</div>

{/* LEADERBOARD */}

<div
  style={{
    background: "#FFF",
    borderRadius: 24,
    padding: 28,
    border: "1px solid #E2E8F0",
    minHeight: 520
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 18,
      alignItems: "center",
    }}
  >
    <div>
      <div
        style={{
          color: "#F97316",
          fontSize: 14,
          fontWeight: 400,
          letterSpacing: 2,
        }}
      >
        ACCREDITED PERFORMANCE LEDGER
      </div>

      <h2
  style={{
    marginTop: 6,
    marginBottom: 0,
    fontSize: 30,
    fontWeight: 200
  }}
>
        Student Talent Ranking Ledger
      </h2>
    </div>

    <div
  style={{
    background: "#ffffff",
    border: "1px solid #FED7AA",
    padding: "14px 20px",
    borderRadius: 14,
    fontWeight: 700,
    color: "#9A3412",
  }}
>
      {filteredRows.length} Students
    </div>
  </div>

  {/* HEADER */}

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "120px 220px 160px repeat(5,1fr) 120px",
      padding: "20px 24px",
      fontSize: 19,
color: "#0a0303",
      background: "#f3f3f3",
      borderRadius: 14,
      fontWeight: 700,
      marginBottom: 12,
      minHeight: 80,
    }}
  >
    <div>Rank</div>
    <div>Student</div>
    <div>School</div>
    <div>Communication</div>
    <div>Leadership</div>
    <div>Critical Thinking</div>
    <div>Collaboration</div>
    <div>Confidence</div>
    <div>Overall</div>
  </div>

  {filteredRows.map(
    (row: any) => (
      <div
        key={row.student_id}
        style={{
          display: "grid",
          gridTemplateColumns:
            "120px 220px 160px repeat(5,1fr) 120px",
          alignItems: "center",
          padding: "18px 22px",
          marginBottom: 12,

          border:
            row.student_id ===
            studentId
              ? "2px solid #f6e4d7"
              : "1px solid #E2E8F0",

          background:
            row.student_id ===
            studentId
              ? "#FFF7ED"
              : "#FFF",

          borderRadius: 18,
        }}
      >
        {/* RANK */}

        <div
          style={{
            fontWeight: 700,
          }}
        >
          {row.rank === 1
            ? "🥇 #1"
            : row.rank === 2
            ? "🥈 #2"
            : row.rank === 3
            ? "🥉 #3"
            : `#${row.rank}`}
        </div>

        {/* STUDENT */}

        <div>
          <div
            style={{
              fontWeight: 700,
            }}
          >
            {row.student_name}
          </div>

          {row.student_id ===
            studentId && (
            <div
              style={{
                color: "#F97316",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              CURRENT STUDENT
            </div>
          )}
        </div>

        <div>
          {row.school_name}
        </div>

        <div>
          {row.communication_score}
        </div>

        <div>
          {row.leadership_score}
        </div>

        <div>
          {
            row.critical_thinking_score
          }
        </div>

        <div>
          {
            row.collaboration_score
          }
        </div>

        <div>
          {row.confidence_score}
        </div>

        <div>
          <span
            style={{
              background: "#F97316",
              color: "#FFF",
              padding: "8px 12px",
borderRadius: 8,
fontSize: 13,
              fontWeight: 700,
            }}
          >
            {row.overall_score}
          </span>
        </div>
      </div>
    )
  )}
</div>

     {/* STUDENT POSITION SUMMARY */}

<div
  style={{
    background: "#f7ffed",
    border: "1px solid #0f0a04",
    padding: "22px 28px",
    borderRadius: 18,
    marginTop: 24,
    marginBottom: 24
  }}
>
  <div
    style={{
      fontSize: 14,
      color: "#EA580C",
      fontWeight: 700,
      letterSpacing: 1.5,
      marginBottom: 10
    }}
  >
    STUDENT POSITION SUMMARY
  </div>

  <div
    style={{
      fontSize: 17.5,
      lineHeight: 2.0,
      color: "#398d01",
      fontWeight: 600
    }}
  >
    You rank

    <strong>
      {" "}#{myRow?.rank}
    </strong>

    {" "}globally,

    <strong>
      {" "}#{myRow?.school_rank}
    </strong>

    {" "}in your school,

    <strong>
      {" "}#{myRow?.class_rank}
    </strong>

    {" "}in your class and currently sit in the

    <strong>
      {" "}Top {myRow?.percentile}%
    </strong>

    {" "}of Talent Passport students with an overall score of

    <strong>
      {" "} {myRow?.overall_score}
    </strong>

    . You are currently

    <strong>
      {" "} {myRow?.gap_to_top}
    </strong>

    {" "}points behind the leaderboard leader.
  </div>
</div>

      {/* COMPETENCY POSITION */}
<div
  style={{
    background: "#FFF",
    borderRadius: 24,
    padding: 20,
    border: "1px solid #E2E8F0",
    marginBottom: 24
  }}
>
        <div
          style={{
            color: "#F97316",
            fontWeight: 700,
            marginBottom: 18,
fontSize: 13,
letterSpacing: 1,
          }}
        >
          YOUR COMPETENCY POSITION
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(5,1fr)",
            gap: 12,
          }}
        >
             <CompetencyCard
            title="Communication"
            score={
              myRow?.communication_score || 0
            }
            rank={myRow?.rank || 0}
          />

          <CompetencyCard
            title="Leadership"
            score={
              myRow?.leadership_score || 0
            }
            rank={myRow?.rank || 0}
          />

          <CompetencyCard
            title="Critical Thinking"
            score={
              myRow?.critical_thinking_score || 0
            }
            rank={myRow?.rank || 0}
          />

          <CompetencyCard
            title="Collaboration"
            score={
              myRow?.collaboration_score || 0
            }
            rank={myRow?.rank || 0}
          />

          <CompetencyCard
            title="Confidence"
            score={
              myRow?.confidence_score || 0
            }
            rank={myRow?.rank || 0}
          />

        </div>
      </div>

      {/* TALENT PROFILE */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr 1fr 1fr",
          gap: 16,
        }}
      >
        <MetricCard
          title="Talent Tier"
          value={getTier(
            myRow?.overall_score || 0
          )}
        />

        <MetricCard
          title="Top Strength"
          value={
            strongestSkill?.title || "-"
          }
        />

        <MetricCard
          title="Growth Area"
          value={
            growthSkill?.title || "-"
          }
        />

        <MetricCard
          title="Overall Score"
          value={
            myRow?.overall_score || 0
          }
        />
      </div>


      {/* FILTERS */}

      <div
        style={{
  background: "#FFF",
  borderRadius: 20,
  padding: 18,
  border: "1px solid #E2E8F0",
  display: "flex",
  gap: 12,
  alignItems: "center"
}}
      >
        <select
          value={selectedSchool}
          onChange={(e) =>
            setSelectedSchool(
              e.target.value
            )
          }
        >
          <option>
            All Schools
          </option>

          {filters.schools.map(
            (school: any) => (
              <option
                key={school}
              >
                {school}
              </option>
            )
          )}
        </select>

        <select
          value={selectedClass}
          onChange={(e) =>
            setSelectedClass(
              e.target.value
            )
          }
        >
          <option>
            All Classes
          </option>

          {filters.classes.map(
            (item: any) => (
              <option
                key={item}
              >
                {item}
              </option>
            )
          )}
        </select>
      </div>

    
     <div
  style={{
    background: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    minHeight: 220,
    border: "1px solid #E2E8F0"
  }}
>
  <div
    style={{
      color: "#F97316",
      fontWeight: 700,
      fontSize: 12,
      letterSpacing: 2,
      marginBottom: 24
    }}
  >
    TALENT INSIGHT
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "1fr 1fr",
      gap: 18,
      lineHeight: 1.8
    }}
  >
    <div>
      ✓ You currently rank #{myRow?.rank} globally.
    </div>

    <div>
      ✓ You rank #{myRow?.school_rank} in school.
    </div>

    <div>
      ✓ Strongest competency:
      {" "}
      {strongestSkill?.title}
    </div>

    <div>
      ✓ Growth opportunity:
      {" "}
      {growthSkill?.title}
    </div>

    <div>
      ✓ Gap to leader:
      {" "}
      {myRow?.gap_to_top}
      {" "}points.
    </div>

    <div>
      ✓ Talent Tier:
      {" "}
      {getTier(myRow?.overall_score || 0)}
    </div>

    <div>
      ✓ Overall score:
      {" "}
      {myRow?.overall_score}
    </div>

    <div>
      ✓ Percentile:
      {" "}
      {myRow?.percentile}%
    </div>
  </div>
</div>
</div>
)}
import { useEffect, useMemo, useState } from "react";

import {
  buildLeaderboard,
  getLeaderboardFilters,
} from "./LeaderboardEngine";

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
        borderRadius: 24,
        padding: 24,
        border: "1px solid #E2E8F0",
        boxShadow:
          "0px 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          color: "#64748B",
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 36,
          fontWeight: 800,
          color: "#0F172A",
        }}
      >
        #{rank}
      </div>

      <div
        style={{
          marginTop: 10,
          color: "#F97316",
          fontWeight: 700,
          fontSize: 16,
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
        borderRadius: 24,
        padding: 24,
        border: "1px solid #E2E8F0",
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "#64748B",
          marginBottom: 10,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 32,
          fontWeight: 800,
          color: "#0F172A",
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

  const profile = JSON.parse(
    localStorage.getItem(
      "studentProfile"
    ) || "{}"
  );

  const studentId =
    profile.parent_email
      ?.toLowerCase()
      ?.replace("@", "_")
      ?.replace(/\./g, "_");

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
      return "ELITE";

    if (score >= 80)
      return "RISING STAR";

    if (score >= 70)
      return "EMERGING TALENT";

    return "EXPLORER";
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
          background:
            "linear-gradient(135deg,#0F172A,#1E293B)",
          color: "#FFF",
          borderRadius: 30,
          padding: 36,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 2,
            color: "#F97316",
          }}
        >
          TALENT PASSPORT
        </div>

        <h1
          style={{
            marginTop: 12,
            marginBottom: 10,
            fontSize: 40,
          }}
        >
          Talent Ranking
          Command Center
        </h1>

        <div
          style={{
            opacity: 0.8,
          }}
        >
          Understand where you
          stand across your
          school, class and
          competition ecosystem.
        </div>
      </div>

      {/* POSITION CARDS */}

      <div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(6,1fr)",
    gap: 18,
    marginTop: 24,
  }}
>
  <MetricCard
    title="Global Rank"
    value={`#${myRow?.rank || "-"}`}
  />

  <MetricCard
    title="School Rank"
    value={`#${myRow?.school_rank || "-"}`}
  />

  <MetricCard
    title="Class Rank"
    value={`#${myRow?.class_rank || "-"}`}
  />

  <MetricCard
    title="Percentile"
    value={`${myRow?.percentile || 0}%`}
  />

  <MetricCard
    title="Gap To Leader"
    value={myRow?.gap_to_top || 0}
  />

</div>

<div
  style={{
    background: "#FFF7ED",
    border:
      "1px solid #FDBA74",
    padding: 20,
    borderRadius: 16,
    marginTop: 24,
    fontWeight: 600,
    color: "#9A3412",
  }}
>
  You rank #{myRow?.rank}
  globally, #{myRow?.school_rank}
  in your school and are
  currently in the top{" "}
  {myRow?.percentile}% of
  Talent Passport students.
</div>

      {/* COMPETENCY POSITION */}

      <div
        style={{
          background: "#FFF",
          borderRadius: 28,
          padding: 28,
          border: "1px solid #E2E8F0",
        }}
      >
        <div
          style={{
            color: "#F97316",
            fontWeight: 700,
            marginBottom: 20,
          }}
        >
          YOUR COMPETENCY POSITION
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(5,1fr)",
            gap: 20,
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
          gap: 20,
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

      {/* MEDAL ZONE */}

      <div
        style={{
          background: "#FFF",
          borderRadius: 28,
          padding: 28,
          border: "1px solid #E2E8F0",
        }}
      >
        <div
          style={{
            color: "#F97316",
            fontWeight: 700,
            marginBottom: 20,
          }}
        >
          MEDAL ZONE
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4,1fr)",
            gap: 20,
          }}
        >
          <MetricCard
            title="Gold"
            value={goldCutoff}
          />

          <MetricCard
            title="Silver"
            value={silverCutoff}
          />

          <MetricCard
            title="Bronze"
            value={bronzeCutoff}
          />

          <MetricCard
            title="Current Medal"
            value={
              myRow?.overall_score >=
              goldCutoff
                ? "🥇"
                : myRow?.overall_score >=
                  silverCutoff
                ? "🥈"
                : myRow?.overall_score >=
                  bronzeCutoff
                ? "🥉"
                : "-"
            }
          />
        </div>
      </div>

      {/* FILTERS */}

      <div
        style={{
          background: "#FFF",
          borderRadius: 24,
          padding: 24,
          border: "1px solid #E2E8F0",
          display: "flex",
          gap: 16,
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

      {/* LEADERBOARD */}

     {/* LEADERBOARD */}

<div
  style={{
    background: "#FFF",
    borderRadius: 28,
    padding: 30,
    border: "1px solid #E2E8F0",
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 24,
      alignItems: "center",
    }}
  >
    <div>
      <div
        style={{
          color: "#F97316",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 2,
        }}
      >
        PERFORMANCE LEADERBOARD
      </div>

      <h2
        style={{
          marginTop: 8,
          marginBottom: 0,
        }}
      >
        Student Ranking Ledger
      </h2>
    </div>

    <div
      style={{
        background: "#F8FAFC",
        padding: "12px 18px",
        borderRadius: 14,
        fontWeight: 700,
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
      padding: "18px",
      background: "#F8FAFC",
      borderRadius: 14,
      fontWeight: 700,
      marginBottom: 12,
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
          padding: "20px",
          marginBottom: 12,

          border:
            row.student_id ===
            studentId
              ? "2px solid #F97316"
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
              padding: "10px 14px",
              borderRadius: 10,
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

      {/* TALENT INSIGHT */}


      <div
        style={{
          background: "#FFF",
          borderRadius: 28,
          padding: 28,
          border: "1px solid #E2E8F0",
        }}
      >
        <div
          style={{
            color: "#F97316",
            fontWeight: 700,
            marginBottom: 20,
          }}
        >
          TALENT INSIGHT
        </div>

        <div
          style={{
            lineHeight: 2,
            color: "#334155",
            fontSize: 15,
          }}
        >
          • You currently rank
          #{myRow?.rank || "-"} globally.

          <br />

          • You rank
          #{myRow?.school_rank || "-"}
          in your school.

          <br />

          • Your strongest area is{" "}
          {
            strongestSkill?.title
          }.

          <br />

          • Biggest growth
          opportunity is{" "}
          {
            growthSkill?.title
          }.

          <br />

          • You are {gapToLeader}
          points behind the
          current leader.

          <br />

          • Your Talent Tier is{" "}
          {getTier(
            myRow?.overall_score || 0
          )}.
        </div>
      </div>

    </div>
  );
}
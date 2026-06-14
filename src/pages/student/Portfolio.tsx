import { useState } from "react";
import { useEffect } from "react";

import {
  getStudentPerformances,
  getStudentProjects,
  getStudentSkills
} from "../../data/studentRepository";

type PortfolioSection =
  | "performances"
  | "projects"
  | "skills";

export default function Portfolio() {
  const [activeSection, setActiveSection] =
    useState<PortfolioSection>(
      "performances"
    );

    const [performances, setPerformances] =
  useState<any[]>([]);

const [projects, setProjects] =
  useState<any[]>([]);

const [skills, setSkills] =
  useState<any[]>([]);

useEffect(() => {
  loadPortfolio();
}, []);

async function loadPortfolio() {

  const profile =
    JSON.parse(
      localStorage.getItem(
        "studentProfile"
      ) || "{}"
    );

  if (!profile?.id) return;

  const perf =
    await getStudentPerformances(
      profile.id
    );

  const proj =
    await getStudentProjects(
      profile.id
    );

  const skill =
    await getStudentSkills(
      profile.id
    );

  setPerformances(perf);

  setProjects(proj);

  setSkills(skill);
}

return (
  <div
  style={{
    width: "95%",
    maxWidth: "1600px",
    margin: "0 auto",
    padding: "25px"
  }}
>
    {/* TERMINAL HEADER */}

    <div
      style={{
        background:
          "linear-gradient(135deg,#050816,#0A0F2E)",
        borderRadius: "24px",
        padding: "28px",
        color: "white",
        marginBottom: "24px",
        display: "flex",
        justifyContent:
          "space-between",
        alignItems: "center"
      }}
    >
      <div>
        <div
          style={{
            color: "#F97316",
            fontSize: "12px",
            letterSpacing: "2px"
          }}
        >
          NEP-2020 STANDARDIZED
          LEDGER NODE
        </div>

        <h1
          style={{
            margin: "8px 0",
            fontSize: "52px",
fontWeight: 700
          }}
        >
          TALENT REGISTRY —
          STUDENT GATEWAY
        </h1>
      </div>

      <div
        style={{
          background:
            "rgba(255,255,255,0.08)",
          padding: "16px 24px",
          borderRadius: "16px"
        }}
      >
        <div
          style={{
            fontSize: "12px",
            opacity: 0.7
          }}
        >
          SYSTEM STATUS
        </div>

        <div
          style={{
            color: "#F97316",
            fontWeight: 700
          }}
        >
          SECURE CONTEXT
        </div>
      </div>
    </div>

    {/* LEDGER */}

    <div
      style={{
        background: "#fff",
        borderRadius: "28px",
        overflow: "hidden",
        border:
          "1px solid #E5E7EB"
      }}
    >
      {/* TITLE */}

      <div
        style={{
          padding: "28px 32px",
          borderBottom:
            "1px solid #ECECEC"
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: "#FFF1E6",
            color: "#F97316",
            fontSize: "12px",
            padding:
              "6px 12px",
            borderRadius: "10px",
            marginBottom: "10px"
          }}
        >
          PORTAL : STUDENT/PARENT
        </div>

        <h2
          style={{
            margin: 0,
            fontSize: "34px"
          }}
        >
          STUDENT TALENT LEDGER
          TERMINAL
        </h2>
      </div>

      {/* SHOWCASE */}

      <div
        style={{
          padding: "30px"
        }}
      >
        <h2
          style={{
            marginBottom: "6px"
          }}
        >
          ACCREDITED
          CO-CURRICULAR
          SHOWCASE
        </h2>

        <p
          style={{
            color: "#64748B"
          }}
        >
          Present, play and verify
          student achievements,
          project builds and verified
          live performances.
        </p>

        <div
          style={{
            height: "1px",
            background: "#ECECEC",
            margin:
              "24px 0 30px"
          }}
        />

        {/* EXPLORER */}

        <div
          style={{
            background: "#F8FAFC",
            border:
              "1px solid #E5E7EB",
            borderRadius: "24px",
            padding: "24px",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center"
          }}
        >
          <div>
            <div
              style={{
                display:
                  "inline-block",
                background:
                  "#FFF1E6",
                color:
                  "#F97316",
                fontSize:
                  "12px",
                padding:
                  "6px 12px",
                borderRadius:
                  "10px"
              }}
            >
              ACTIVE SHOWCASE
              DESK
            </div>

            <h3
              style={{
                marginTop:
                  "12px"
              }}
            >
              PORTFOLIO SECTION
              EXPLORER
            </h3>

            <p
              style={{
                color:
                  "#64748B"
              }}
            >
              Select a section to
              review achievements.
            </p>
          </div>

          <select
            value={activeSection}
            onChange={(e) =>
              setActiveSection(
                e.target
                  .value as PortfolioSection
              )
            }
            style={{
              width: "340px",
              height: "60px",
              border:
                "2px solid #F97316",
              borderRadius:
                "18px",
              padding:
                "0 20px",
              fontSize:
                "18px",
              fontWeight:
                600
            }}
          >
            <option value="performances">
              🎭 Live Performances
            </option>

            <option value="projects">
              📁 Projects Completed
            </option>

            <option value="skills">
              ✨ Skills Learned
            </option>
          </select>
        </div>

        <div
          style={{
            marginTop: "28px"
          }}
        >
          {activeSection ===
            "performances" && (
            <PerformanceDrawer
  performances={performances}
/>
          )}

          {activeSection ===
            "projects" && (
            <ProjectsDrawer
  projects={projects}
/>
          )}

          {activeSection ===
            "skills" && (
            <SkillsDrawer
  skills={skills}
/>
          )}
        </div>
      </div>
    </div>
  </div>
);
}

function PerformanceDrawer({
  performances
}: any) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "28px",
        padding: "30px",
        border: "1px solid #E5E7EB"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px"
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "28px"
            }}
          >
            🎭 LIVE PERFORMANCES
          </h2>

          <div
            style={{
              color: "#94A3B8",
              marginTop: "6px"
            }}
          >
             Performances & Accredited Clips
          </div>
        </div>

        <button
          style={{
            background: "#EEF2F7",
            border: "none",
            padding: "14px 20px",
            borderRadius: "14px",
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          + ADD PERFORMANCE
        </button>
      </div>

      {performances.map(
  (item: any) => (
    <PerformanceCard
      key={item.id}
      item={item}
    />
  )
)}
    </div>
  );
}
function PerformanceCard({
  item
}: any) {
  return (
    <div
      style={{
        border: "1px solid #E5E7EB",
        borderRadius: "22px",
        padding: "30px",
        marginBottom: "20px"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between"
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "14px"
            }}
          >
            <span
              style={{
                background: "#FFF1E6",
                color: "#F97316",
                padding: "5px 12px",
                borderRadius: "999px",
                fontSize: "12px"
              }}
            >
              CLASS 9TH B
            </span>

            <span
              style={{
                color: "#94A3B8"
              }}
            >
              Year 2025
            </span>

            <span
              style={{
                background: "#EEF2FF",
                color: "#4F46E5",
                padding: "5px 12px",
                borderRadius: "999px",
                fontSize: "12px"
              }}
            >
              THEATRE PLAY
            </span>
          </div>

          <h3
            style={{
              margin: 0,
              fontSize: "28px"
            }}
          >
            {item.title}
          </h3>

          <div
            style={{
              marginTop: "10px",
              color: "#F97316",
              fontWeight: 600
            }}
          >
            📍 Stage Venue:
            {item.venue}
          </div>

          <p
            style={{
              color: "#64748B",
              maxWidth: "700px"
            }}
          >
            {item.description}
          </p>
        </div>

        <div>
          <div
            style={{
              background: "#DCFCE7",
              color: "#166534",
              padding: "8px 14px",
              borderRadius: "999px",
              fontWeight: 700
            }}
          >
            {item.parent_verified
  ? "✓ VERIFIED"
  : "PENDING OTP"}
          </div>
        </div>
      </div>
    </div>
  );
}
function ProjectCard({
  item
}: any) {
  return (
    <div
      style={{
        border: "1px solid #E5E7EB",
        borderRadius: "22px",
        padding: "30px"
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "14px"
        }}
      >
        <span
          style={{
            background: "#DBEAFE",
            color: "#2563EB",
            padding: "4px 10px",
            borderRadius: "999px",
            fontSize: "12px"
          }}
        >
          CLASS 8TH A
        </span>

        <span
          style={{
            color: "#94A3B8"
          }}
        >
          Year 2024
        </span>
      </div>

      <h3
        style={{
          marginTop: 0,
          fontSize: "24px"
        }}
      >
       {item.title}
      </h3>

      <p
        style={{
          color: "#64748B"
        }}
      >
        {item.description}
      </p>

      <div
  style={{
    marginTop: "16px",
    display: "inline-block",
    background: item.is_verified
      ? "#DCFCE7"
      : "#FEF3C7",
    color: item.is_verified
      ? "#166534"
      : "#92400E",
    padding: "8px 14px",
    borderRadius: "999px"
  }}
>
  {item.is_verified
    ? "VERIFIED"
    : "PENDING"}
</div>
    </div>
  );
}
function ProjectsDrawer({
  projects
}: any) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "28px",
        padding: "24px",
        border: "1px solid #E5E7EB"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "24px",
          fontSize: "28px"
        }}
      >
        <h2>📁 PROJECTS COMPLETED</h2>

        <button>
          + ADD PROJECT
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: "20px"
        }}
      >
        {projects.map(
  (item: any) => (
    <ProjectCard
      key={item.id}
      item={item}
    />
  )
)}
      </div>
    </div>
  );
}

function SkillCard({
  item
}: any) {
  return (
    <div
      style={{
        border: "1px solid #E5E7EB",
        borderRadius: "22px",
        padding: "30px"
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "14px"
        }}
      >
        <span
          style={{
            background: "#DCFCE7",
            color: "#166534",
            padding: "4px 10px",
            borderRadius: "999px",
            fontSize: "12px"
          }}
        >
          CLASS 8TH B
        </span>

        <span
          style={{
            color: "#94A3B8"
          }}
        >
          Year 2024
        </span>
      </div>

      <h3
        style={{
          marginTop: 0,
          fontSize: "24px"
        }}
      >
        {item.skill_name}
      </h3>

      <p
        style={{
          color: "#64748B"
        }}
      >
        {item.description}
      </p>

           <div
  style={{
    marginTop: "16px",
    display: "inline-block",
    background: item.is_verified
      ? "#DCFCE7"
      : "#FEF3C7",
    color: item.is_verified
      ? "#166534"
      : "#92400E",
    padding: "8px 14px",
    borderRadius: "999px"
  }}
>
  {item.is_verified
    ? "VERIFIED"
    : "PENDING"}
</div>
    </div>
  );
}

function SkillsDrawer({
  skills
}: any) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "28px",
        padding: "24px",
        border: "1px solid #E5E7EB"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "24px",
          fontSize: "28px"
        }}
      >
        <h2>✨ SKILLS LEARNED</h2>

        <button>
          + ADD SKILL
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: "20px"
        }}
      >
        {skills.map(
  (item: any) => (
    <SkillCard
      key={item.id}
      item={item}
    />
  )
)}
      </div>
    </div>
  );
}
  
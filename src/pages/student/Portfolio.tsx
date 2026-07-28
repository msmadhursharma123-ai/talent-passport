import { useState } from "react";
import { useEffect } from "react";

import {
  getStudentPerformances,
  getStudentProjects,
  getStudentSkills,
  createPerformanceOtp,
  verifyPerformanceOtp,
  deletePerformance,
  updatePerformance,
  createProject,
   deleteProject,
  createSkill,
  createPerformance,
  uploadPerformanceVideo,
  markPerformanceVerified,
  uploadProjectVideo,
deleteSkill,
  uploadSkillCertificate
} from "../../data/studentRepository";

import {
    requireIdentity
} from "../../services/identityService";

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

const performanceCredits =
  performances.length * 5;

const projectCredits =
  projects.length * 5;

const skillCredits =
  skills.length * 5;

const totalCredits =
  performanceCredits +
  projectCredits +
  skillCredits;

useEffect(() => {
  loadPortfolio();
}, []);

async function loadPortfolio() {

  const perf =
    await getStudentPerformances();

  const proj =
    await getStudentProjects();

  const skill =
    await getStudentSkills();

  setPerformances(
    perf || []
  );

  setProjects(
    proj || []
  );

  setSkills(
    skill || []
  );
}

return (
  <div
    className="portfolio-responsive-page"
    style={{
      width: "95%",
      maxWidth: "1600px",
      margin: "0 auto",
      padding: "24px",
      boxSizing: "border-box"
    }}
  >

    {/* =========================================================
        PREMIUM PORTFOLIO HERO
       ========================================================= */}

    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #FFFFFF 0%, #FFFCF8 55%, #F7FAFF 100%)",
        borderRadius: "28px",
        border: "1px solid #DCE4EE",
        boxShadow: "0 12px 34px rgba(15, 23, 42, 0.06)",
        padding: "34px 38px",
        marginBottom: "20px",
        minHeight: "150px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}
    >

      {/* Decorative background circle - orange */}

      <div
        style={{
          position: "absolute",
          width: "330px",
          height: "330px",
          borderRadius: "50%",
          right: "-105px",
          top: "-175px",
          background:
            "rgba(249, 115, 22, 0.065)",
          pointerEvents: "none"
        }}
      />

      {/* Decorative background circle - blue */}

      <div
        style={{
          position: "absolute",
          width: "240px",
          height: "240px",
          borderRadius: "50%",
          right: "150px",
          bottom: "-180px",
          background:
            "rgba(59, 130, 246, 0.055)",
          pointerEvents: "none"
        }}
      />

      {/* Decorative small circle */}

      <div
        style={{
          position: "absolute",
          width: "115px",
          height: "115px",
          borderRadius: "50%",
          right: "92px",
          top: "22px",
          background:
            "rgba(255, 237, 213, 0.55)",
          pointerEvents: "none"
        }}
      />

      {/* HERO LEFT */}

      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "850px"
        }}
      >
        <div
          style={{
            color: "#F97316",
            fontSize: "12px",
            letterSpacing: "2.4px",
            fontWeight: 800,
            textTransform: "uppercase",
            marginBottom: "12px"
          }}
        >
          ACCREDITED CO-CURRICULAR SHOWCASE
        </div>

        <h1
          style={{
            margin: 0,
            color: "#0F172A",
            fontSize: "40px",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-1px"
          }}
        >
          Your Portfolio — Your Gateway
        </h1>

        <p
          style={{
            margin: "12px 0 0",
            color: "#64748B",
            fontSize: "15px",
            lineHeight: 1.6,
            maxWidth: "720px"
          }}
        >
          Build your accredited record through performances,
          projects and verified skills.
        </p>
      </div>

      {/* HERO RIGHT VISUAL */}

      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "128px",
          height: "128px",
          borderRadius: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(145deg, #FFF7ED, #FFFFFF)",
          border: "1px solid #FED7AA",
          boxShadow:
            "0 12px 30px rgba(249, 115, 22, 0.10)",
          flexShrink: 0
        }}
      >
        <div
          style={{
            textAlign: "center"
          }}
        >
          <div
            style={{
              fontSize: "42px",
              lineHeight: 1
            }}
          >
            ◈
          </div>

          <div
            style={{
              marginTop: "9px",
              color: "#F97316",
              fontSize: "9px",
              fontWeight: 900,
              letterSpacing: "1.4px"
            }}
          >
            TALENT RECORD
          </div>
        </div>
      </div>

    </div>


    {/* =========================================================
        PORTFOLIO INTELLIGENCE / CREDIT SUMMARY
       ========================================================= */}

    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "24px",
        padding: "24px",
        marginBottom: "20px",
        boxShadow:
          "0 8px 24px rgba(15, 23, 42, 0.035)"
      }}
    >

      {/* SECTION HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "20px",
          marginBottom: "20px"
        }}
      >
        <div>
          <div
            style={{
              color: "#F97316",
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "1.8px",
              textTransform: "uppercase",
              marginBottom: "7px"
            }}
          >
            PORTFOLIO INTELLIGENCE
          </div>

          <h2
            style={{
              margin: 0,
              color: "#0F172A",
              fontSize: "21px",
              fontWeight: 800
            }}
          >
            Portfolio Credit Summary
          </h2>

          <p
            style={{
              margin: "6px 0 0",
              color: "#64748B",
              fontSize: "13px"
            }}
          >
            Your accumulated portfolio credits across all
            accredited activity categories.
          </p>
        </div>

        <div
          style={{
            color: "#94A3B8",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.8px",
            whiteSpace: "nowrap"
          }}
        >
          TALENT PASSPORT LEDGER
        </div>
      </div>


      {/* CREDIT CARDS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "14px"
        }}
      >

        {/* TOTAL */}

        <div
          style={{
            position: "relative",
            overflow: "hidden",
            minHeight: "112px",
            background:
              "linear-gradient(135deg, #FFF7ED 0%, #FFFBF5 100%)",
            border: "1px solid #FED7AA",
            borderRadius: "18px",
            padding: "18px"
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              right: "-30px",
              top: "-35px",
              background: "rgba(249,115,22,0.08)"
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1
            }}
          >
            <div
              style={{
                color: "#9A3412",
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.7px",
                textTransform: "uppercase"
              }}
            >
              Total Credits
            </div>

            <div
              style={{
                marginTop: "10px",
                color: "#F97316",
                fontSize: "31px",
                lineHeight: 1,
                fontWeight: 900
              }}
            >
              {totalCredits}
            </div>

            <div
              style={{
                marginTop: "8px",
                color: "#9A3412",
                fontSize: "11px",
                fontWeight: 600
              }}
            >
              Combined portfolio score
            </div>
          </div>
        </div>


        {/* PERFORMANCE */}

        <div
          style={{
            position: "relative",
            overflow: "hidden",
            minHeight: "112px",
            background:
              "linear-gradient(135deg, #EFF6FF 0%, #F8FBFF 100%)",
            border: "1px solid #BFDBFE",
            borderRadius: "18px",
            padding: "18px"
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              right: "-30px",
              top: "-35px",
              background: "rgba(37,99,235,0.07)"
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1
            }}
          >
            <div
              style={{
                color: "#1E40AF",
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.7px",
                textTransform: "uppercase"
              }}
            >
              Performance Credits
            </div>

            <div
              style={{
                marginTop: "10px",
                color: "#2563EB",
                fontSize: "31px",
                lineHeight: 1,
                fontWeight: 900
              }}
            >
              {performanceCredits}
            </div>

            <div
              style={{
                marginTop: "8px",
                color: "#475569",
                fontSize: "11px",
                fontWeight: 600
              }}
            >
              {performances.length} recorded performances
            </div>
          </div>
        </div>


        {/* PROJECT */}

        <div
          style={{
            position: "relative",
            overflow: "hidden",
            minHeight: "112px",
            background:
              "linear-gradient(135deg, #ECFDF5 0%, #F7FFFB 100%)",
            border: "1px solid #BBF7D0",
            borderRadius: "18px",
            padding: "18px"
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              right: "-30px",
              top: "-35px",
              background: "rgba(22,163,74,0.07)"
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1
            }}
          >
            <div
              style={{
                color: "#166534",
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.7px",
                textTransform: "uppercase"
              }}
            >
              Project Credits
            </div>

            <div
              style={{
                marginTop: "10px",
                color: "#16A34A",
                fontSize: "31px",
                lineHeight: 1,
                fontWeight: 900
              }}
            >
              {projectCredits}
            </div>

            <div
              style={{
                marginTop: "8px",
                color: "#475569",
                fontSize: "11px",
                fontWeight: 600
              }}
            >
              {projects.length} portfolio projects
            </div>
          </div>
        </div>


        {/* SKILLS */}

        <div
          style={{
            position: "relative",
            overflow: "hidden",
            minHeight: "112px",
            background:
              "linear-gradient(135deg, #F5F3FF 0%, #FBFAFF 100%)",
            border: "1px solid #DDD6FE",
            borderRadius: "18px",
            padding: "18px"
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              right: "-30px",
              top: "-35px",
              background: "rgba(124,58,237,0.07)"
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1
            }}
          >
            <div
              style={{
                color: "#6D28D9",
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.7px",
                textTransform: "uppercase"
              }}
            >
              Skill Credits
            </div>

            <div
              style={{
                marginTop: "10px",
                color: "#7C3AED",
                fontSize: "31px",
                lineHeight: 1,
                fontWeight: 900
              }}
            >
              {skillCredits}
            </div>

            <div
              style={{
                marginTop: "8px",
                color: "#475569",
                fontSize: "11px",
                fontWeight: 600
              }}
            >
              {skills.length} accredited skills
            </div>
          </div>
        </div>

      </div>

    </div>


    {/* =========================================================
        MAIN PORTFOLIO LEDGER
       ========================================================= */}

    <div
      style={{
        background: "#FFFFFF",
        borderRadius: "26px",
        border: "1px solid #E2E8F0",
        overflow: "hidden",
        boxShadow:
          "0 8px 24px rgba(15, 23, 42, 0.035)"
      }}
    >

      <div
        style={{
          padding: "24px"
        }}
      >

        {/* EXPLORER */}

            <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "20px",
            border: "1px solid #E2E8F0",
            background:
              "linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 55%, #FFF9F5 100%)",
            padding: "18px 20px",
            marginBottom: "20px"
          }}
        >

          {/* Soft decorative background */}

          <div
            style={{
              position: "absolute",
              width: "170px",
              height: "170px",
              borderRadius: "50%",
              right: "-70px",
              top: "-95px",
              background: "rgba(249, 115, 22, 0.045)",
              pointerEvents: "none"
            }}
          />

          <div
            style={{
              position: "absolute",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              right: "160px",
              bottom: "-90px",
              background: "rgba(59, 130, 246, 0.04)",
              pointerEvents: "none"
            }}
          />


          {/* EXPLORER TOP ROW */}

          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "24px",
              flexWrap: "wrap"
            }}
          >

            {/* LEFT */}

            <div
              style={{
                minWidth: "240px"
              }}
            >

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  borderRadius: "999px",
                  background: "#FFF7ED",
                  border: "1px solid #FED7AA",
                  color: "#EA580C",
                  padding: "5px 10px",
                  fontSize: "9px",
                  fontWeight: 900,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  marginBottom: "8px"
                }}
              >
                ACTIVE SHOWCASE DESK
              </div>

              <h3
                style={{
                  margin: 0,
                  color: "#0F172A",
                  fontSize: "17px",
                  fontWeight: 800
                }}
              >
                Portfolio Section Explorer
              </h3>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748B",
                  fontSize: "12px",
                  lineHeight: 1.5
                }}
              >
                Switch between your performances, projects and
                accredited skills.
              </p>

            </div>


            {/* RIGHT — SECTION TABS */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px",
                borderRadius: "16px",
                background: "#F1F5F9",
                border: "1px solid #E2E8F0",
                flexWrap: "wrap"
              }}
            >

              {/* LIVE PERFORMANCES */}

              <button
                type="button"
                onClick={() => setActiveSection("performances")}
                style={{
                  minWidth: "170px",
                  height: "44px",
                  borderRadius: "12px",
                  border:
                    activeSection === "performances"
                      ? "1px solid #FDBA74"
                      : "1px solid transparent",
                  background:
                    activeSection === "performances"
                      ? "#FFFFFF"
                      : "transparent",
                  color:
                    activeSection === "performances"
                      ? "#EA580C"
                      : "#475569",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow:
                    activeSection === "performances"
                      ? "0 5px 14px rgba(15, 23, 42, 0.07)"
                      : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >

                <span
                  style={{
                    width: "25px",
                    height: "25px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      activeSection === "performances"
                        ? "#FFF7ED"
                        : "#E2E8F0",
                    fontSize: "13px"
                  }}
                >
                  ◉
                </span>

                Live Performances

              </button>


              {/* PROJECTS */}

              <button
                type="button"
                onClick={() => setActiveSection("projects")}
                style={{
                  minWidth: "135px",
                  height: "44px",
                  borderRadius: "12px",
                  border:
                    activeSection === "projects"
                      ? "1px solid #86EFAC"
                      : "1px solid transparent",
                  background:
                    activeSection === "projects"
                      ? "#FFFFFF"
                      : "transparent",
                  color:
                    activeSection === "projects"
                      ? "#15803D"
                      : "#475569",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow:
                    activeSection === "projects"
                      ? "0 5px 14px rgba(15, 23, 42, 0.07)"
                      : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >

                <span
                  style={{
                    width: "25px",
                    height: "25px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      activeSection === "projects"
                        ? "#ECFDF5"
                        : "#E2E8F0",
                    fontSize: "13px"
                  }}
                >
                  ◆
                </span>

                Projects

              </button>


              {/* SKILLS */}

              <button
                type="button"
                onClick={() => setActiveSection("skills")}
                style={{
                  minWidth: "125px",
                  height: "44px",
                  borderRadius: "12px",
                  border:
                    activeSection === "skills"
                      ? "1px solid #C4B5FD"
                      : "1px solid transparent",
                  background:
                    activeSection === "skills"
                      ? "#FFFFFF"
                      : "transparent",
                  color:
                    activeSection === "skills"
                      ? "#7C3AED"
                      : "#475569",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow:
                    activeSection === "skills"
                      ? "0 5px 14px rgba(15, 23, 42, 0.07)"
                      : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >

                <span
                  style={{
                    width: "25px",
                    height: "25px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      activeSection === "skills"
                        ? "#F5F3FF"
                        : "#E2E8F0",
                    fontSize: "13px"
                  }}
                >
                  ✦
                </span>

                Skills

              </button>

            </div>

          </div>


          {/* ACTIVE SECTION INFORMATION */}

          <div
            style={{
              position: "relative",
              zIndex: 1,
              marginTop: "16px",
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: "10px"
            }}
          >

            {/* PERFORMANCE STATUS */}

            <div
              style={{
                borderRadius: "14px",
                border:
                  activeSection === "performances"
                    ? "1px solid #FED7AA"
                    : "1px solid #E2E8F0",
                background:
                  activeSection === "performances"
                    ? "#FFF7ED"
                    : "#FFFFFF",
                padding: "11px 13px",
                transition: "all 0.2s ease"
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px"
                }}
              >

                <div>
                  <div
                    style={{
                      color:
                        activeSection === "performances"
                          ? "#C2410C"
                          : "#64748B",
                      fontSize: "9px",
                      fontWeight: 800,
                      letterSpacing: "0.8px",
                      textTransform: "uppercase"
                    }}
                  >
                    Performance Ledger
                  </div>

                  <div
                    style={{
                      marginTop: "4px",
                      color: "#0F172A",
                      fontSize: "13px",
                      fontWeight: 800
                    }}
                  >
                    {performances.length} Performances
                  </div>
                </div>

                <div
                  style={{
                    minWidth: "36px",
                    height: "36px",
                    padding: "0 9px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      activeSection === "performances"
                        ? "#FFEDD5"
                        : "#F1F5F9",
                    color:
                      activeSection === "performances"
                        ? "#EA580C"
                        : "#64748B",
                    fontSize: "15px",
                    fontWeight: 900
                  }}
                >
                  {performanceCredits}
                </div>

              </div>

            </div>


            {/* PROJECT STATUS */}

            <div
              style={{
                borderRadius: "14px",
                border:
                  activeSection === "projects"
                    ? "1px solid #BBF7D0"
                    : "1px solid #E2E8F0",
                background:
                  activeSection === "projects"
                    ? "#ECFDF5"
                    : "#FFFFFF",
                padding: "11px 13px",
                transition: "all 0.2s ease"
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px"
                }}
              >

                <div>
                  <div
                    style={{
                      color:
                        activeSection === "projects"
                          ? "#166534"
                          : "#64748B",
                      fontSize: "9px",
                      fontWeight: 800,
                      letterSpacing: "0.8px",
                      textTransform: "uppercase"
                    }}
                  >
                    Project Ledger
                  </div>

                  <div
                    style={{
                      marginTop: "4px",
                      color: "#0F172A",
                      fontSize: "13px",
                      fontWeight: 800
                    }}
                  >
                    {projects.length} Projects
                  </div>
                </div>

                <div
                  style={{
                    minWidth: "36px",
                    height: "36px",
                    padding: "0 9px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      activeSection === "projects"
                        ? "#DCFCE7"
                        : "#F1F5F9",
                    color:
                      activeSection === "projects"
                        ? "#16A34A"
                        : "#64748B",
                    fontSize: "15px",
                    fontWeight: 900
                  }}
                >
                  {projectCredits}
                </div>

              </div>

            </div>


            {/* SKILL STATUS */}

            <div
              style={{
                borderRadius: "14px",
                border:
                  activeSection === "skills"
                    ? "1px solid #DDD6FE"
                    : "1px solid #E2E8F0",
                background:
                  activeSection === "skills"
                    ? "#F5F3FF"
                    : "#FFFFFF",
                padding: "11px 13px",
                transition: "all 0.2s ease"
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px"
                }}
              >

                <div>
                  <div
                    style={{
                      color:
                        activeSection === "skills"
                          ? "#6D28D9"
                          : "#64748B",
                      fontSize: "9px",
                      fontWeight: 800,
                      letterSpacing: "0.8px",
                      textTransform: "uppercase"
                    }}
                  >
                    Skill Ledger
                  </div>

                  <div
                    style={{
                      marginTop: "4px",
                      color: "#0F172A",
                      fontSize: "13px",
                      fontWeight: 800
                    }}
                  >
                    {skills.length} Skills
                  </div>
                </div>

                <div
                  style={{
                    minWidth: "36px",
                    height: "36px",
                    padding: "0 9px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      activeSection === "skills"
                        ? "#EDE9FE"
                        : "#F1F5F9",
                    color:
                      activeSection === "skills"
                        ? "#7C3AED"
                        : "#64748B",
                    fontSize: "15px",
                    fontWeight: 900
                  }}
                >
                  {skillCredits}
                </div>

              </div>

            </div>

          </div>

        </div>


          {activeSection ===
            "performances" && (
   <PerformanceDrawer
  performances={performances}
  loadPortfolio={loadPortfolio}
/>
          )}

          {activeSection === "projects" && (
  <ProjectsDrawer
    projects={projects}
    loadPortfolio={loadPortfolio}

  
  />
)}

         {activeSection === "skills" && (
  <SkillsDrawer
    skills={skills}
    loadPortfolio={loadPortfolio}

  />
)}
         </div>
      </div>

      <style>
        {portfolioResponsiveStyles}
      </style>

    </div>
);
}

function PerformanceDrawer({
  performances,
  loadPortfolio
}: any) {

  console.log(
    "PERFORMANCES",
    performances
  );

  const [showModal, setShowModal] =
    useState(false);

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: "22px",
        border: "1px solid #E2E8F0",
        overflow: "hidden"
      }}
    >

      {/* =====================================================
          LIVE PERFORMANCE HEADER
         ===================================================== */}

      <div
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "22px 24px",
          borderBottom: "1px solid #E2E8F0",
          background:
            "linear-gradient(135deg, #FFFFFF 0%, #FFFDF9 60%, #FFF7ED 100%)"
        }}
      >

        {/* Decorative circle */}

        <div
          style={{
            position: "absolute",
            width: "170px",
            height: "170px",
            borderRadius: "50%",
            right: "-55px",
            top: "-100px",
            background:
              "rgba(249, 115, 22, 0.055)",
            pointerEvents: "none"
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            right: "165px",
            bottom: "-75px",
            background:
              "rgba(59, 130, 246, 0.04)",
            pointerEvents: "none"
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
            flexWrap: "wrap"
          }}
        >

          {/* LEFT */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px"
            }}
          >

            {/* Performance identity */}

            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "15px",
                background:
                  "linear-gradient(145deg, #FFF7ED, #FFEDD5)",
                border: "1px solid #FED7AA",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <span
                style={{
                  color: "#EA580C",
                  fontSize: "22px",
                  fontWeight: 900
                }}
              >
                ◉
              </span>
            </div>

            <div>

              <div
                style={{
                  color: "#F97316",
                  fontSize: "9px",
                  fontWeight: 900,
                  letterSpacing: "1.6px",
                  textTransform: "uppercase",
                  marginBottom: "5px"
                }}
              >
                ACCREDITED PERFORMANCE LEDGER
              </div>

              <h2
                style={{
                  margin: 0,
                  color: "#0F172A",
                  fontSize: "21px",
                  fontWeight: 800,
                  letterSpacing: "-0.3px"
                }}
              >
                Live Performances
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748B",
                  fontSize: "12px",
                  lineHeight: 1.5
                }}
              >
               Showcase performances.
              </p>

            </div>

          </div>


          {/* RIGHT */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}
          >

            {/* RECORD COUNT */}

            <div
              style={{
                height: "42px",
                padding: "0 14px",
                borderRadius: "12px",
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >

              <span
                style={{
                  color: "#F97316",
                  fontSize: "16px",
                  fontWeight: 900
                }}
              >
                {performances.length}
              </span>

              <span
                style={{
                  color: "#64748B",
                  fontSize: "10px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}
              >
                Records
              </span>

            </div>


            {/* ADD PERFORMANCE */}

            <button
              type="button"
              onClick={() =>
                setShowModal(true)
              }
              style={{
                height: "42px",
                padding: "0 17px",
                borderRadius: "12px",
                border: "1px solid #F97316",
                background: "#F97316",
                color: "#FFFFFF",
                fontSize: "11px",
                fontWeight: 900,
                letterSpacing: "0.3px",
                cursor: "pointer",
                boxShadow:
                  "0 6px 14px rgba(249, 115, 22, 0.16)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px"
              }}
            >
              <span
                style={{
                  fontSize: "17px",
                  lineHeight: 1
                }}
              >
                +
              </span>

              ADD PERFORMANCE
            </button>

          </div>

        </div>

      </div>


      {/* =====================================================
          PERFORMANCE COLLECTION
         ===================================================== */}

      <div
        style={{
          padding: "20px 22px 22px"
        }}
      >

        {/* COLLECTION LABEL */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            marginBottom: "14px"
          }}
        >

          <div>

            <div
              style={{
                color: "#0F172A",
                fontSize: "13px",
                fontWeight: 800
              }}
            >
              Performance Showcase
            </div>

            <div
              style={{
                color: "#94A3B8",
                fontSize: "10px",
                marginTop: "3px"
              }}
            >
              Review, watch and manage your portfolio performances.
            </div>

          </div>


          {performances.length > 0 && (

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#64748B",
                fontSize: "10px",
                fontWeight: 700
              }}
            >

              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#22C55E",
                  display: "inline-block"
                }}
              />

              Portfolio Active

            </div>

          )}

        </div>


        {/* =====================================================
            EMPTY STATE
           ===================================================== */}

        {performances.length === 0 && (

          <div
            style={{
              minHeight: "190px",
              borderRadius: "18px",
              border: "1px dashed #CBD5E1",
              background:
                "linear-gradient(135deg, #F8FAFC, #FFFFFF)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "28px",
              textAlign: "center"
            }}
          >

            <div
              style={{
                maxWidth: "390px"
              }}
            >

              <div
                style={{
                  width: "52px",
                  height: "52px",
                  margin: "0 auto 13px",
                  borderRadius: "16px",
                  background: "#FFF7ED",
                  border: "1px solid #FED7AA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#F97316",
                  fontSize: "24px",
                  fontWeight: 900
                }}
              >
                ◉
              </div>

              <div
                style={{
                  color: "#0F172A",
                  fontSize: "15px",
                  fontWeight: 800
                }}
              >
                Your performance showcase starts here
              </div>

              <div
                style={{
                  color: "#64748B",
                  fontSize: "11px",
                  lineHeight: 1.6,
                  marginTop: "6px"
                }}
              >
                Add your first performance to begin building your
                accredited co-curricular performance record.
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowModal(true)
                }
                style={{
                  marginTop: "15px",
                  height: "38px",
                  padding: "0 15px",
                  borderRadius: "11px",
                  border: "none",
                  background: "#F97316",
                  color: "#FFFFFF",
                  fontSize: "10px",
                  fontWeight: 900,
                  cursor: "pointer"
                }}
              >
                + ADD FIRST PERFORMANCE
              </button>

            </div>

          </div>

        )}


        {/* =====================================================
            EXISTING PERFORMANCE RECORDS

            PerformanceCard remains responsible for:
            Watch
            Edit
            Delete
            Parent verification
            OTP verification
            Video modal

            We redesign PerformanceCard in Part 4.
           ===================================================== */}

        {performances.length > 0 && (

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(360px, 1fr))",
              gap: "14px"
            }}
          >

            {performances.map(
              (item: any) => (

                <PerformanceCard
                  key={item.id}
                  item={item}
                  loadPortfolio={
                    loadPortfolio
                  }
                />

              )
            )}

          </div>

        )}

      </div>


      {/* =====================================================
          EXISTING ADD PERFORMANCE MODAL
         ===================================================== */}

      {showModal && (

        <AddPerformanceModal
          onClose={() => {

            setShowModal(false);

            loadPortfolio();

          }}
        />

      )}

    </div>
  );
}

function PerformanceCard({
  item,
  loadPortfolio
}: any) {

  async function handleDelete() {

    const confirmDelete =
      window.confirm(
        "Delete this performance?"
      );

    if (!confirmDelete) return;

    const success =
      await deletePerformance(
        item.id
      );

    if (success) {

      console.log(
        "Performance Deleted"
      );

      loadPortfolio();

    } else {

      alert(
        "Delete Failed"
      );

    }

  }


  const [editing, setEditing] =
    useState(false);

  const [
    showVideoModal,
    setShowVideoModal
  ] = useState(false);

  const [
    editTitle,
    setEditTitle
  ] = useState(item.title);

  const [
    editDescription,
    setEditDescription
  ] = useState(
    item.description
  );

  const [
    editVenue,
    setEditVenue
  ] = useState(
    item.venue
  );


  async function handleUpdate() {

    const success =
      await updatePerformance(
        item.id,
        {
          title:
            editTitle,

          description:
            editDescription,

          venue:
            editVenue
        }
      );

    if (success) {

      alert(
        "Updated"
      );

      setEditing(false);

      loadPortfolio();

    } else {

      alert(
        "Update Failed"
      );

    }

  }


  const [
    showOtpModal,
    setShowOtpModal
  ] = useState(false);

  const [
    otp,
    setOtp
  ] = useState("");

  const [
    verifying,
    setVerifying
  ] = useState(false);


  async function handleVerifyOtp() {

    try {

      setVerifying(true);

      const result =
        await verifyPerformanceOtp(
          item.id,
          otp
        );

      if (!result) {

        alert(
          "Invalid OTP"
        );

        return;

      }

      await markPerformanceVerified(
        item.id
      );

      alert(
        "Performance Verified"
      );

      setShowOtpModal(
        false
      );

      if (loadPortfolio) {

        await loadPortfolio();

      }

    } catch (err) {

      console.error(err);

      alert(
        "Verification failed"
      );

    } finally {

      setVerifying(false);

    }

  }


  return (

    <>

      {/* =====================================================
          PERFORMANCE CARD
         ===================================================== */}

      <div
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: "285px",
          borderRadius: "20px",
          border: item.parent_verified
            ? "1px solid #BBF7D0"
            : "1px solid #FED7AA",
          background: item.parent_verified
            ? "linear-gradient(145deg, #FFFFFF 0%, #F8FFFB 100%)"
            : "linear-gradient(145deg, #FFFFFF 0%, #FFFBF5 100%)",
          boxShadow:
            "0 8px 24px rgba(15, 23, 42, 0.055)",
          display: "flex",
          flexDirection: "column"
        }}
      >

        {/* Decorative circles */}

        <div
          style={{
            position: "absolute",
            width: "145px",
            height: "145px",
            borderRadius: "50%",
            right: "-62px",
            top: "-68px",
            background:
              item.parent_verified
                ? "rgba(34, 197, 94, 0.055)"
                : "rgba(249, 115, 22, 0.055)",
            pointerEvents: "none"
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            right: "72px",
            top: "-53px",
            border:
              item.parent_verified
                ? "12px solid rgba(34, 197, 94, 0.035)"
                : "12px solid rgba(249, 115, 22, 0.035)",
            pointerEvents: "none"
          }}
        />


        {/* =================================================
            TOP BAR
           ================================================= */}

        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: "15px 16px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px"
          }}
        >

          {/* TYPE */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px"
            }}
          >

            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "10px",
                background: "#FFF7ED",
                border: "1px solid #FED7AA",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#EA580C",
                fontSize: "15px",
                fontWeight: 900
              }}
            >
              ◉
            </div>

            <div>

              <div
                style={{
                  color: "#F97316",
                  fontSize: "8px",
                  fontWeight: 900,
                  letterSpacing: "1px",
                  textTransform: "uppercase"
                }}
              >
                PERFORMANCE
              </div>

              <div
                style={{
                  color: "#94A3B8",
                  fontSize: "9px",
                  marginTop: "2px"
                }}
              >
                Portfolio Record
              </div>

            </div>

          </div>


          {/* VERIFICATION BADGE */}

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              minHeight: "28px",
              padding: "0 9px",
              borderRadius: "999px",

              background:
                item.parent_verified
                  ? "#ECFDF5"
                  : "#FFF7ED",

              border:
                item.parent_verified
                  ? "1px solid #BBF7D0"
                  : "1px solid #FED7AA",

              color:
                item.parent_verified
                  ? "#15803D"
                  : "#C2410C",

              fontSize: "8px",
              fontWeight: 900,
              letterSpacing: "0.35px",
              textTransform: "uppercase",
              whiteSpace: "nowrap"
            }}
          >

            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background:
                  item.parent_verified
                    ? "#22C55E"
                    : "#F97316"
              }}
            />

            {item.parent_verified
              ? "Parent Verified"
              : "Self Reported"}

          </div>

        </div>


        {/* =================================================
            VISUAL IDENTITY AREA
           ================================================= */}

        <div
          style={{
            position: "relative",
            zIndex: 1,
            margin: "0 16px",
            height: "82px",
            borderRadius: "15px",
            overflow: "hidden",
            border: "1px solid #E2E8F0",
            background:
              "linear-gradient(135deg, #07142D 0%, #10244A 65%, #183A65 100%)",
            display: "flex",
            alignItems: "center",
            padding: "0 17px"
          }}
        >

          {/* background circles */}

          <div
            style={{
              position: "absolute",
              width: "105px",
              height: "105px",
              borderRadius: "50%",
              right: "-25px",
              top: "-48px",
              border:
                "18px solid rgba(255,255,255,0.055)"
            }}
          />

          <div
            style={{
              position: "absolute",
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              right: "55px",
              bottom: "-39px",
              background:
                "rgba(249,115,22,0.14)"
            }}
          />


          {/* Abstract play mark */}

          <div
            style={{
              position: "relative",
              width: "48px",
              height: "48px",
              borderRadius: "15px",
              background:
                "rgba(255,255,255,0.10)",
              border:
                "1px solid rgba(255,255,255,0.13)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >

            <div
              style={{
                width: 0,
                height: 0,
                borderTop:
                  "9px solid transparent",
                borderBottom:
                  "9px solid transparent",
                borderLeft:
                  "14px solid #F97316",
                marginLeft: "4px"
              }}
            />

          </div>


          <div
            style={{
              marginLeft: "13px",
              minWidth: 0
            }}
          >

            <div
              style={{
                color: "#FDBA74",
                fontSize: "8px",
                fontWeight: 900,
                letterSpacing: "1px",
                textTransform: "uppercase"
              }}
            >
              LIVE SHOWCASE
            </div>

            <div
              style={{
                marginTop: "4px",
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: 800
              }}
            >
              Performance Evidence
            </div>

            <div
              style={{
                marginTop: "2px",
                color: "#94A3B8",
                fontSize: "9px"
              }}
            >
              Accredited portfolio submission
            </div>

          </div>

        </div>


        {/* =================================================
            INFORMATION
           ================================================= */}

        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: "14px 16px 12px",
            flex: 1
          }}
        >

          <h3
            style={{
              margin: 0,
              color: "#0F172A",
              fontSize: "15px",
              fontWeight: 850,
              lineHeight: 1.35
            }}
          >
            {item.title ||
              "Untitled Performance"}
          </h3>


          {/* META */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "6px",
              marginTop: "8px"
            }}
          >

            {item.category && (

              <div
                style={{
                  padding: "4px 7px",
                  borderRadius: "7px",
                  background: "#EFF6FF",
                  color: "#2563EB",
                  fontSize: "8px",
                  fontWeight: 800
                }}
              >
                {item.category}
              </div>

            )}


            {item.venue && (

              <div
                style={{
                  padding: "4px 7px",
                  borderRadius: "7px",
                  background: "#F8FAFC",
                  border:
                    "1px solid #E2E8F0",
                  color: "#475569",
                  fontSize: "8px",
                  fontWeight: 700
                }}
              >
                📍 {item.venue}
              </div>

            )}


            {item.performance_date && (

              <div
                style={{
                  padding: "4px 7px",
                  borderRadius: "7px",
                  background: "#F8FAFC",
                  border:
                    "1px solid #E2E8F0",
                  color: "#475569",
                  fontSize: "8px",
                  fontWeight: 700
                }}
              >
                {new Date(
                  item.performance_date
                ).toLocaleDateString()}
              </div>

            )}

          </div>


          {/* DESCRIPTION */}

          <p
            style={{
              margin:
                "10px 0 0",
              color: "#64748B",
              fontSize: "10px",
              lineHeight: 1.55,
              minHeight: "31px",
              display:
                "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient:
                "vertical",
              overflow: "hidden"
            }}
          >
            {item.description ||
              "No performance description added yet."}
          </p>

        </div>


        {/* =================================================
            ACTION BAR
           ================================================= */}

        <div
          style={{
            position: "relative",
            zIndex: 1,
            borderTop:
              "1px solid #E2E8F0",
            background:
              "rgba(248,250,252,0.75)",
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexWrap: "wrap"
          }}
        >

          {/* WATCH */}

          {item.video_url && (

            <button
              type="button"
              onClick={() =>
                setShowVideoModal(
                  true
                )
              }
              style={{
                height: "32px",
                padding:
                  "0 11px",
                borderRadius:
                  "9px",
                border:
                  "1px solid #FDBA74",
                background:
                  "#FFF7ED",
                color:
                  "#C2410C",
                fontSize: "9px",
                fontWeight: 900,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              ▶ WATCH
            </button>

          )}


          {/* VERIFY */}

          {!item.parent_verified && (

            <button
              type="button"
              onClick={() =>
                setShowOtpModal(
                  true
                )
              }
              style={{
                height: "32px",
                padding:
                  "0 10px",
                borderRadius:
                  "9px",
                border:
                  "1px solid #BBF7D0",
                background:
                  "#ECFDF5",
                color:
                  "#15803D",
                fontSize: "9px",
                fontWeight: 900,
                cursor: "pointer"
              }}
            >
              ✓ VERIFY
            </button>

          )}


          {/* EDIT */}

          <button
            type="button"
            onClick={() =>
              setEditing(true)
            }
            style={{
              height: "32px",
              padding: "0 10px",
              borderRadius: "9px",
              border:
                "1px solid #BFDBFE",
              background: "#EFF6FF",
              color: "#2563EB",
              fontSize: "9px",
              fontWeight: 900,
              cursor: "pointer"
            }}
          >
            EDIT
          </button>


          {/* DELETE */}

          <button
            type="button"
            onClick={
              handleDelete
            }
            style={{
              height: "32px",
              padding: "0 10px",
              borderRadius: "9px",
              border:
                "1px solid #FECACA",
              background: "#FEF2F2",
              color: "#DC2626",
              fontSize: "9px",
              fontWeight: 900,
              cursor: "pointer"
            }}
          >
            DELETE
          </button>


          {/* VERIFIED END STATUS */}

          {item.parent_verified && (

            <div
              style={{
                marginLeft: "auto",
                color: "#15803D",
                fontSize: "8px",
                fontWeight: 900,
                letterSpacing:
                  "0.4px",
                textTransform:
                  "uppercase"
              }}
            >
              ✓ Accredited
            </div>

          )}

        </div>

      </div>


      {/* =====================================================
          EDIT MODAL
         ===================================================== */}

      {editing && (

        <div
          onClick={() =>
            setEditing(false)
          }
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(7, 20, 45, 0.72)",
            backdropFilter:
              "blur(4px)",
            display: "flex",
            justifyContent:
              "center",
            alignItems: "center",
            zIndex: 99999,
            padding: "20px"
          }}
        >

          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              width: "100%",
              maxWidth: "500px",
              borderRadius: "22px",
              background: "#FFFFFF",
              border:
                "1px solid #E2E8F0",
              boxShadow:
                "0 30px 80px rgba(0,0,0,0.24)",
              overflow: "hidden"
            }}
          >

            {/* EDIT HEADER */}

            <div
              style={{
                padding:
                  "20px 22px",
                background:
                  "linear-gradient(135deg, #07142D, #10244A)",
                color: "#FFFFFF"
              }}
            >

              <div
                style={{
                  color:
                    "#FDBA74",
                  fontSize: "9px",
                  fontWeight: 900,
                  letterSpacing:
                    "1.3px",
                  textTransform:
                    "uppercase"
                }}
              >
                PERFORMANCE RECORD
              </div>

              <h3
                style={{
                  margin:
                    "5px 0 0",
                  fontSize: "19px"
                }}
              >
                Edit Performance
              </h3>

            </div>


            <div
              style={{
                padding:
                  "20px 22px"
              }}
            >

              <div
                style={{
                  marginBottom:
                    "13px"
                }}
              >

                <label
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "6px",
                    color:
                      "#475569",
                    fontSize:
                      "9px",
                    fontWeight:
                      900,
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      "0.7px"
                  }}
                >
                  Performance Title
                </label>

                <input
                  value={
                    editTitle
                  }
                  onChange={(e) =>
                    setEditTitle(
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    boxSizing:
                      "border-box",
                    height: "42px",
                    border:
                      "1px solid #CBD5E1",
                    borderRadius:
                      "10px",
                    padding:
                      "0 12px",
                    outline: "none",
                    fontSize:
                      "12px"
                  }}
                />

              </div>


              <div
                style={{
                  marginBottom:
                    "13px"
                }}
              >

                <label
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "6px",
                    color:
                      "#475569",
                    fontSize:
                      "9px",
                    fontWeight:
                      900,
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      "0.7px"
                  }}
                >
                  Venue
                </label>

                <input
                  value={
                    editVenue
                  }
                  onChange={(e) =>
                    setEditVenue(
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    boxSizing:
                      "border-box",
                    height: "42px",
                    border:
                      "1px solid #CBD5E1",
                    borderRadius:
                      "10px",
                    padding:
                      "0 12px",
                    outline: "none",
                    fontSize:
                      "12px"
                  }}
                />

              </div>


              <div>

                <label
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "6px",
                    color:
                      "#475569",
                    fontSize:
                      "9px",
                    fontWeight:
                      900,
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      "0.7px"
                  }}
                >
                  Description
                </label>

                <textarea
                  value={
                    editDescription
                  }
                  onChange={(e) =>
                    setEditDescription(
                      e.target.value
                    )
                  }
                  rows={4}
                  style={{
                    width: "100%",
                    boxSizing:
                      "border-box",
                    border:
                      "1px solid #CBD5E1",
                    borderRadius:
                      "10px",
                    padding:
                      "11px 12px",
                    outline: "none",
                    resize:
                      "vertical",
                    fontSize:
                      "12px",
                    fontFamily:
                      "inherit"
                  }}
                />

              </div>


              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "flex-end",
                  gap: "8px",
                  marginTop:
                    "18px"
                }}
              >

                <button
                  type="button"
                  onClick={() =>
                    setEditing(
                      false
                    )
                  }
                  style={{
                    height: "38px",
                    padding:
                      "0 15px",
                    borderRadius:
                      "10px",
                    border:
                      "1px solid #CBD5E1",
                    background:
                      "#FFFFFF",
                    color:
                      "#475569",
                    fontSize:
                      "10px",
                    fontWeight:
                      800,
                    cursor:
                      "pointer"
                  }}
                >
                  CANCEL
                </button>

                <button
                  type="button"
                  onClick={
                    handleUpdate
                  }
                  style={{
                    height: "38px",
                    padding:
                      "0 16px",
                    borderRadius:
                      "10px",
                    border: "none",
                    background:
                      "#F97316",
                    color:
                      "#FFFFFF",
                    fontSize:
                      "10px",
                    fontWeight:
                      900,
                    cursor:
                      "pointer"
                  }}
                >
                  SAVE CHANGES
                </button>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          PARENT OTP MODAL
         ===================================================== */}

      {showOtpModal && (

        <div
          onClick={() =>
            setShowOtpModal(
              false
            )
          }
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(7, 20, 45, 0.72)",
            backdropFilter:
              "blur(4px)",
            display: "flex",
            justifyContent:
              "center",
            alignItems: "center",
            zIndex: 99999,
            padding: "20px"
          }}
        >

          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              width: "100%",
              maxWidth: "420px",
              background:
                "#FFFFFF",
              borderRadius:
                "22px",
              overflow:
                "hidden",
              boxShadow:
                "0 30px 80px rgba(0,0,0,0.24)"
            }}
          >

            <div
              style={{
                padding:
                  "21px 22px",
                background:
                  "linear-gradient(135deg, #07142D, #10244A)"
              }}
            >

              <div
                style={{
                  color:
                    "#FDBA74",
                  fontSize:
                    "9px",
                  fontWeight:
                    900,
                  letterSpacing:
                    "1.3px",
                  textTransform:
                    "uppercase"
                }}
              >
                ACCREDITATION CHECK
              </div>

              <h3
                style={{
                  margin:
                    "6px 0 0",
                  color:
                    "#FFFFFF",
                  fontSize:
                    "19px"
                }}
              >
                Verify Parent OTP
              </h3>

              <p
                style={{
                  margin:
                    "6px 0 0",
                  color:
                    "#CBD5E1",
                  fontSize:
                    "10px",
                  lineHeight: 1.5
                }}
              >
                Enter the verification code for this performance record.
              </p>

            </div>


            <div
              style={{
                padding:
                  "22px"
              }}
            >

              <input
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value
                  )
                }
                placeholder="Enter OTP"
                style={{
                  width: "100%",
                  boxSizing:
                    "border-box",
                  height: "46px",
                  border:
                    "1px solid #CBD5E1",
                  borderRadius:
                    "11px",
                  padding:
                    "0 13px",
                  fontSize:
                    "14px",
                  fontWeight:
                    700,
                  letterSpacing:
                    "2px",
                  outline: "none"
                }}
              />


              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginTop:
                    "15px"
                }}
              >

                <button
                  type="button"
                  onClick={
                    handleVerifyOtp
                  }
                  disabled={
                    verifying
                  }
                  style={{
                    flex: 1,
                    height: "40px",
                    borderRadius:
                      "10px",
                    border: "none",
                    background:
                      verifying
                        ? "#FDBA74"
                        : "#F97316",
                    color:
                      "#FFFFFF",
                    fontSize:
                      "10px",
                    fontWeight:
                      900,
                    cursor:
                      verifying
                        ? "default"
                        : "pointer"
                  }}
                >
                  {verifying
                    ? "VERIFYING..."
                    : "VERIFY PERFORMANCE"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowOtpModal(
                      false
                    )
                  }
                  style={{
                    height: "40px",
                    padding:
                      "0 15px",
                    borderRadius:
                      "10px",
                    border:
                      "1px solid #CBD5E1",
                    background:
                      "#FFFFFF",
                    color:
                      "#475569",
                    fontSize:
                      "10px",
                    fontWeight:
                      800,
                    cursor:
                      "pointer"
                  }}
                >
                  CANCEL
                </button>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          VIDEO PLAYER MODAL
         ===================================================== */}

      {showVideoModal && (

        <div
          onClick={() =>
            setShowVideoModal(
              false
            )
          }
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(2, 6, 23, 0.92)",
            backdropFilter:
              "blur(5px)",
            display: "flex",
            justifyContent:
              "center",
            alignItems: "center",
            zIndex: 99999,
            padding: "24px"
          }}
        >

          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              width: "100%",
              maxWidth:
                "900px"
            }}
          >

            {/* VIDEO HEADER */}

            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
                gap: "20px",
                marginBottom:
                  "12px"
              }}
            >

              <div>

                <div
                  style={{
                    color:
                      "#FDBA74",
                    fontSize:
                      "9px",
                    fontWeight:
                      900,
                    letterSpacing:
                      "1.2px",
                    textTransform:
                      "uppercase"
                  }}
                >
                  PERFORMANCE EVIDENCE
                </div>

                <div
                  style={{
                    color:
                      "#FFFFFF",
                    fontSize:
                      "16px",
                    fontWeight:
                      800,
                    marginTop:
                      "3px"
                  }}
                >
                  {item.title}
                </div>

              </div>


              <button
                type="button"
                onClick={() =>
                  setShowVideoModal(
                    false
                  )
                }
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius:
                    "10px",
                  border:
                    "1px solid rgba(255,255,255,0.18)",
                  background:
                    "rgba(255,255,255,0.08)",
                  color:
                    "#FFFFFF",
                  fontSize:
                    "16px",
                  cursor:
                    "pointer"
                }}
              >
                ×
              </button>

            </div>


            <video
              controls
              autoPlay
              style={{
                width: "100%",
                maxHeight:
                  "75vh",
                display:
                  "block",
                background:
                  "#000000",
                borderRadius:
                  "18px",
                boxShadow:
                  "0 30px 80px rgba(0,0,0,0.45)"
              }}
            >
              <source
                src={
                  item.video_url
                }
              />
            </video>

          </div>

        </div>

      )}

    </>

  );

}
function ProjectCard({
  item,
  loadPortfolio
}: any) {

  async function handleDelete() {

    const confirmed =
      window.confirm(
        "Delete this project?"
      );

    if (!confirmed) return;

    try {

      await deleteProject(
        item.id
      );

      console.log(
        "Project Deleted"
      );

      if (loadPortfolio) {
        await loadPortfolio();
      }

    } catch (err) {

      console.error(err);

      alert(
        "Failed to delete project"
      );

    }

  }


  return (

    <div
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "270px",
        borderRadius: "20px",
        border: item.is_verified
          ? "1px solid #BBF7D0"
          : "1px solid #BFDBFE",
        background: item.is_verified
          ? "linear-gradient(145deg, #FFFFFF 0%, #F7FFF9 100%)"
          : "linear-gradient(145deg, #FFFFFF 0%, #F8FBFF 100%)",
        boxShadow:
          "0 8px 24px rgba(15, 23, 42, 0.05)",
        display: "flex",
        flexDirection: "column"
      }}
    >

      {/* DECORATIVE BACKGROUND */}

      <div
        style={{
          position: "absolute",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          right: "-65px",
          top: "-70px",
          background: item.is_verified
            ? "rgba(34, 197, 94, 0.055)"
            : "rgba(37, 99, 235, 0.055)",
          pointerEvents: "none"
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "82px",
          height: "82px",
          borderRadius: "50%",
          right: "76px",
          top: "-55px",
          border: item.is_verified
            ? "12px solid rgba(34,197,94,0.035)"
            : "12px solid rgba(37,99,235,0.035)",
          pointerEvents: "none"
        }}
      />


      {/* =================================================
          TOP BAR
         ================================================= */}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "15px 16px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px"
        }}
      >

        {/* PROJECT IDENTITY */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >

          <div
            style={{
              width: "31px",
              height: "31px",
              borderRadius: "10px",
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2563EB",
              fontSize: "15px",
              fontWeight: 900
            }}
          >
            ◆
          </div>

          <div>

            <div
              style={{
                color: "#2563EB",
                fontSize: "8px",
                fontWeight: 900,
                letterSpacing: "1px",
                textTransform: "uppercase"
              }}
            >
              PROJECT
            </div>

            <div
              style={{
                color: "#94A3B8",
                fontSize: "9px",
                marginTop: "2px"
              }}
            >
              Portfolio Record
            </div>

          </div>

        </div>


        {/* VERIFICATION */}

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            minHeight: "28px",
            padding: "0 9px",
            borderRadius: "999px",

            background:
              item.is_verified
                ? "#ECFDF5"
                : "#FFF7ED",

            border:
              item.is_verified
                ? "1px solid #BBF7D0"
                : "1px solid #FED7AA",

            color:
              item.is_verified
                ? "#15803D"
                : "#C2410C",

            fontSize: "8px",
            fontWeight: 900,
            letterSpacing: "0.35px",
            textTransform: "uppercase",
            whiteSpace: "nowrap"
          }}
        >

          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background:
                item.is_verified
                  ? "#22C55E"
                  : "#F97316"
            }}
          />

          {item.is_verified
            ? "Verified"
            : "Pending"}

        </div>

      </div>


      {/* =================================================
          PROJECT VISUAL
         ================================================= */}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          margin: "0 16px",
          height: "82px",
          borderRadius: "15px",
          overflow: "hidden",
          border: "1px solid #DBEAFE",
          background:
            "linear-gradient(135deg, #07142D 0%, #10244A 62%, #163E68 100%)",
          display: "flex",
          alignItems: "center",
          padding: "0 17px"
        }}
      >

        {/* circles */}

        <div
          style={{
            position: "absolute",
            width: "110px",
            height: "110px",
            borderRadius: "50%",
            right: "-27px",
            top: "-51px",
            border:
              "18px solid rgba(255,255,255,0.05)"
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            right: "58px",
            bottom: "-41px",
            background:
              "rgba(59,130,246,0.19)"
          }}
        />


        {/* PROJECT SYMBOL */}

        <div
          style={{
            position: "relative",
            width: "48px",
            height: "48px",
            borderRadius: "15px",
            background:
              "rgba(255,255,255,0.10)",
            border:
              "1px solid rgba(255,255,255,0.13)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}
        >

          <span
            style={{
              color: "#60A5FA",
              fontSize: "23px",
              lineHeight: 1,
              fontWeight: 900
            }}
          >
            ◆
          </span>

        </div>


        <div
          style={{
            marginLeft: "13px",
            minWidth: 0
          }}
        >

          <div
            style={{
              color: "#93C5FD",
              fontSize: "8px",
              fontWeight: 900,
              letterSpacing: "1px",
              textTransform: "uppercase"
            }}
          >
            PROJECT SHOWCASE
          </div>

          <div
            style={{
              marginTop: "4px",
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: 800
            }}
          >
            Project Evidence
          </div>

          <div
            style={{
              marginTop: "2px",
              color: "#94A3B8",
              fontSize: "9px"
            }}
          >
            Documented portfolio creation
          </div>

        </div>

      </div>


      {/* =================================================
          INFORMATION
         ================================================= */}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "14px 16px 12px",
          flex: 1
        }}
      >

        <h3
          style={{
            margin: 0,
            color: "#0F172A",
            fontSize: "15px",
            fontWeight: 850,
            lineHeight: 1.35
          }}
        >
          {item.title ||
            "Untitled Project"}
        </h3>


        {/* META */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "6px",
            marginTop: "8px"
          }}
        >

          {item.category && (

            <div
              style={{
                padding: "4px 7px",
                borderRadius: "7px",
                background: "#EFF6FF",
                color: "#2563EB",
                fontSize: "8px",
                fontWeight: 800
              }}
            >
              {item.category}
            </div>

          )}


          {item.project_date && (

            <div
              style={{
                padding: "4px 7px",
                borderRadius: "7px",
                background: "#F8FAFC",
                border:
                  "1px solid #E2E8F0",
                color: "#475569",
                fontSize: "8px",
                fontWeight: 700
              }}
            >
              {new Date(
                item.project_date
              ).toLocaleDateString()}
            </div>

          )}

        </div>


        {/* DESCRIPTION */}

        <p
          style={{
            margin: "10px 0 0",
            color: "#64748B",
            fontSize: "10px",
            lineHeight: 1.55,
            minHeight: "31px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden"
          }}
        >
          {item.description ||
            "No project description added yet."}
        </p>

      </div>


      {/* =================================================
          ACTION BAR
         ================================================= */}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          borderTop:
            "1px solid #E2E8F0",
          background:
            "rgba(248,250,252,0.78)",
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          flexWrap: "wrap"
        }}
      >

        {/* VIDEO EVIDENCE */}

        {item.project_video_url && (

          <button
            type="button"
            onClick={() =>
              window.open(
                item.project_video_url,
                "_blank"
              )
            }
            style={{
              height: "32px",
              padding: "0 11px",
              borderRadius: "9px",
              border:
                "1px solid #BFDBFE",
              background: "#EFF6FF",
              color: "#2563EB",
              fontSize: "9px",
              fontWeight: 900,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px"
            }}
          >
            ▶ VIEW EVIDENCE
          </button>

        )}


        {/* PROJECT LINK */}

        {item.project_link && (

          <button
            type="button"
            onClick={() =>
              window.open(
                item.project_link,
                "_blank"
              )
            }
            style={{
              height: "32px",
              padding: "0 10px",
              borderRadius: "9px",
              border:
                "1px solid #DDD6FE",
              background: "#F5F3FF",
              color: "#7C3AED",
              fontSize: "9px",
              fontWeight: 900,
              cursor: "pointer"
            }}
          >
            ↗ OPEN PROJECT
          </button>

        )}


        {/* DELETE */}

        <button
          type="button"
          onClick={handleDelete}
          style={{
            height: "32px",
            padding: "0 10px",
            borderRadius: "9px",
            border:
              "1px solid #FECACA",
            background: "#FEF2F2",
            color: "#DC2626",
            fontSize: "9px",
            fontWeight: 900,
            cursor: "pointer"
          }}
        >
          DELETE
        </button>


        {item.is_verified && (

          <div
            style={{
              marginLeft: "auto",
              color: "#15803D",
              fontSize: "8px",
              fontWeight: 900,
              letterSpacing: "0.4px",
              textTransform: "uppercase"
            }}
          >
            ✓ Accredited
          </div>

        )}

      </div>

    </div>

  );

}


function ProjectsDrawer({
  projects,
  loadPortfolio
}: any) {

  const [showModal, setShowModal] =
    useState(false);


  return (

    <div
      style={{
        background: "#FFFFFF",
        borderRadius: "22px",
        border: "1px solid #E2E8F0",
        overflow: "hidden"
      }}
    >

      {/* =====================================================
          PROJECT HEADER
         ===================================================== */}

      <div
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "22px 24px",
          borderBottom:
            "1px solid #E2E8F0",
          background:
            "linear-gradient(135deg, #FFFFFF 0%, #FAFFFC 60%, #ECFDF5 100%)"
        }}
      >

        {/* DECORATIVE CIRCLES */}

        <div
          style={{
            position: "absolute",
            width: "170px",
            height: "170px",
            borderRadius: "50%",
            right: "-55px",
            top: "-100px",
            background:
              "rgba(22, 163, 74, 0.055)",
            pointerEvents: "none"
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            right: "165px",
            bottom: "-75px",
            background:
              "rgba(59, 130, 246, 0.04)",
            pointerEvents: "none"
          }}
        />


        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: "20px",
            flexWrap: "wrap"
          }}
        >

          {/* LEFT */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px"
            }}
          >

            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "15px",
                background:
                  "linear-gradient(145deg, #ECFDF5, #DCFCE7)",
                border:
                  "1px solid #BBF7D0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <span
                style={{
                  color: "#16A34A",
                  fontSize: "22px",
                  fontWeight: 900
                }}
              >
                ◆
              </span>
            </div>


            <div>

              <div
                style={{
                  color: "#16A34A",
                  fontSize: "9px",
                  fontWeight: 900,
                  letterSpacing: "1.6px",
                  textTransform: "uppercase",
                  marginBottom: "5px"
                }}
              >
                PROJECT CREATION LEDGER
              </div>

              <h2
                style={{
                  margin: 0,
                  color: "#0F172A",
                  fontSize: "21px",
                  fontWeight: 800,
                  letterSpacing: "-0.3px"
                }}
              >
                Projects Completed
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748B",
                  fontSize: "12px",
                  lineHeight: 1.5
                }}
              >
                Your documented projects and creations.
              </p>

            </div>

          </div>


          {/* RIGHT */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}
          >

            <div
              style={{
                height: "42px",
                padding: "0 14px",
                borderRadius: "12px",
                background: "#F8FAFC",
                border:
                  "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >

              <span
                style={{
                  color: "#16A34A",
                  fontSize: "16px",
                  fontWeight: 900
                }}
              >
                {projects.length}
              </span>

              <span
                style={{
                  color: "#64748B",
                  fontSize: "10px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}
              >
                Projects
              </span>

            </div>


            <button
              type="button"
              onClick={() =>
                setShowModal(true)
              }
              style={{
                height: "42px",
                padding: "0 17px",
                borderRadius: "12px",
                border:
                  "1px solid #16A34A",
                background: "#16A34A",
                color: "#FFFFFF",
                fontSize: "11px",
                fontWeight: 900,
                letterSpacing: "0.3px",
                cursor: "pointer",
                boxShadow:
                  "0 6px 14px rgba(22, 163, 74, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px"
              }}
            >
              <span
                style={{
                  fontSize: "17px",
                  lineHeight: 1
                }}
              >
                +
              </span>

              ADD PROJECT
            </button>

          </div>

        </div>

      </div>


      {/* =====================================================
          PROJECT COLLECTION
         ===================================================== */}

      <div
        style={{
          padding: "20px 22px 22px"
        }}
      >

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: "16px",
            marginBottom: "14px"
          }}
        >

          <div>

            <div
              style={{
                color: "#0F172A",
                fontSize: "13px",
                fontWeight: 800
              }}
            >
              Project Showcase
            </div>

            <div
              style={{
                color: "#94A3B8",
                fontSize: "10px",
                marginTop: "3px"
              }}
            >
              Review and manage your completed project records.
            </div>

          </div>


          {projects.length > 0 && (

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#64748B",
                fontSize: "10px",
                fontWeight: 700
              }}
            >

              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#22C55E",
                  display: "inline-block"
                }}
              />

              Project Ledger Active

            </div>

          )}

        </div>


        {/* EMPTY STATE */}

        {projects.length === 0 && (

          <div
            style={{
              minHeight: "190px",
              borderRadius: "18px",
              border:
                "1px dashed #BBF7D0",
              background:
                "linear-gradient(135deg, #F7FFF9, #FFFFFF)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "28px",
              textAlign: "center"
            }}
          >

            <div
              style={{
                maxWidth: "390px"
              }}
            >

              <div
                style={{
                  width: "52px",
                  height: "52px",
                  margin:
                    "0 auto 13px",
                  borderRadius: "16px",
                  background: "#ECFDF5",
                  border:
                    "1px solid #BBF7D0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#16A34A",
                  fontSize: "24px",
                  fontWeight: 900
                }}
              >
                ◆
              </div>

              <div
                style={{
                  color: "#0F172A",
                  fontSize: "15px",
                  fontWeight: 800
                }}
              >
                Your project showcase starts here
              </div>

              <div
                style={{
                  color: "#64748B",
                  fontSize: "11px",
                  lineHeight: 1.6,
                  marginTop: "6px"
                }}
              >
                Add your first project to build your documented
                creation and project portfolio.
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowModal(true)
                }
                style={{
                  marginTop: "15px",
                  height: "38px",
                  padding: "0 15px",
                  borderRadius: "11px",
                  border: "none",
                  background: "#16A34A",
                  color: "#FFFFFF",
                  fontSize: "10px",
                  fontWeight: 900,
                  cursor: "pointer"
                }}
              >
                + ADD FIRST PROJECT
              </button>

            </div>

          </div>

        )}


        {/* PROJECT GRID */}

        {projects.length > 0 && (

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(360px, 1fr))",
              gap: "14px"
            }}
          >

            {projects.map(
              (item: any) => (

                <ProjectCard
                  key={item.id}
                  item={item}
                  loadPortfolio={
                    loadPortfolio
                  }
                />

              )
            )}

          </div>

        )}

      </div>


      {/* EXISTING ADD PROJECT FUNCTIONALITY */}

      {showModal && (

        <AddProjectModal
          onClose={() => {

            console.log(
              "PROJECT MODAL CLOSED"
            );

            setShowModal(false);

            loadPortfolio();

          }}
        />

      )}

    </div>

  );

}

function SkillCard({
  item,
  loadPortfolio
}: any) {

  async function handleDelete() {

    const confirmed =
      window.confirm(
        "Delete this skill?"
      );

    if (!confirmed) return;

    try {

      await deleteSkill(
        item.id
      );

      console.log(
        "Skill Deleted"
      );

      if (loadPortfolio) {
        await loadPortfolio();
      }

    } catch (err) {

      console.error(err);

      alert(
        "Failed to delete skill"
      );

    }

  }


  return (

    <div
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "255px",
        borderRadius: "20px",

        border:
          item.is_verified
            ? "1px solid #DDD6FE"
            : "1px solid #E2E8F0",

        background:
          item.is_verified
            ? "linear-gradient(145deg, #FFFFFF 0%, #FCFAFF 100%)"
            : "linear-gradient(145deg, #FFFFFF 0%, #FAFAFC 100%)",

        boxShadow:
          "0 8px 24px rgba(15,23,42,0.05)",

        display: "flex",
        flexDirection: "column"
      }}
    >

      {/* BACKGROUND DECORATION */}

      <div
        style={{
          position: "absolute",
          width: "155px",
          height: "155px",
          borderRadius: "50%",
          right: "-70px",
          top: "-80px",
          background:
            "rgba(124,58,237,0.055)",
          pointerEvents: "none"
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "75px",
          height: "75px",
          borderRadius: "50%",
          right: "68px",
          top: "-50px",
          border:
            "12px solid rgba(124,58,237,0.035)",
          pointerEvents: "none"
        }}
      />


      {/* ==========================================
          TOP IDENTITY BAR
         ========================================== */}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "15px 16px 12px",

          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px"
        }}
      >

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >

          <div
            style={{
              width: "31px",
              height: "31px",
              borderRadius: "10px",

              background: "#F5F3FF",

              border:
                "1px solid #DDD6FE",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              color: "#7C3AED",
              fontSize: "15px",
              fontWeight: 900
            }}
          >
            ✦
          </div>


          <div>

            <div
              style={{
                color: "#7C3AED",
                fontSize: "8px",
                fontWeight: 900,
                letterSpacing: "1px",
                textTransform: "uppercase"
              }}
            >
              SKILL
            </div>

            <div
              style={{
                color: "#94A3B8",
                fontSize: "9px",
                marginTop: "2px"
              }}
            >
              Capability Record
            </div>

          </div>

        </div>


        {/* VERIFICATION */}

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",

            minHeight: "28px",
            padding: "0 9px",

            borderRadius: "999px",

            background:
              item.is_verified
                ? "#ECFDF5"
                : "#FFF7ED",

            border:
              item.is_verified
                ? "1px solid #BBF7D0"
                : "1px solid #FED7AA",

            color:
              item.is_verified
                ? "#15803D"
                : "#C2410C",

            fontSize: "8px",
            fontWeight: 900,
            letterSpacing: "0.35px",
            textTransform: "uppercase",
            whiteSpace: "nowrap"
          }}
        >

          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",

              background:
                item.is_verified
                  ? "#22C55E"
                  : "#F97316"
            }}
          />

          {item.is_verified
            ? "Verified"
            : "Pending"}

        </div>

      </div>


      {/* ==========================================
          SKILL VISUAL
         ========================================== */}

      <div
        style={{
          position: "relative",
          zIndex: 1,

          margin: "0 16px",
          height: "74px",

          borderRadius: "15px",
          overflow: "hidden",

          border:
            "1px solid #E9D5FF",

          background:
            "linear-gradient(135deg, #1E103D 0%, #321B5D 58%, #4C1D95 100%)",

          display: "flex",
          alignItems: "center",

          padding: "0 17px"
        }}
      >

        <div
          style={{
            position: "absolute",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            right: "-20px",
            top: "-52px",
            border:
              "17px solid rgba(255,255,255,0.05)"
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "58px",
            height: "58px",
            borderRadius: "50%",
            right: "58px",
            bottom: "-38px",
            background:
              "rgba(167,139,250,0.17)"
          }}
        />


        <div
          style={{
            position: "relative",

            width: "44px",
            height: "44px",

            borderRadius: "14px",

            background:
              "rgba(255,255,255,0.10)",

            border:
              "1px solid rgba(255,255,255,0.13)",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            flexShrink: 0
          }}
        >

          <span
            style={{
              color: "#C4B5FD",
              fontSize: "22px",
              lineHeight: 1,
              fontWeight: 900
            }}
          >
            ✦
          </span>

        </div>


        <div
          style={{
            marginLeft: "13px",
            minWidth: 0
          }}
        >

          <div
            style={{
              color: "#C4B5FD",
              fontSize: "8px",
              fontWeight: 900,
              letterSpacing: "1px",
              textTransform: "uppercase"
            }}
          >
            CAPABILITY PROFILE
          </div>

          <div
            style={{
              marginTop: "4px",
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: 800
            }}
          >
            Skill Development
          </div>

          <div
            style={{
              marginTop: "2px",
              color: "#C4B5FD",
              fontSize: "9px"
            }}
          >
            Documented learning evidence
          </div>

        </div>

      </div>


      {/* ==========================================
          SKILL INFORMATION
         ========================================== */}

      <div
        style={{
          position: "relative",
          zIndex: 1,

          padding: "14px 16px 12px",

          flex: 1
        }}
      >

        <h3
          style={{
            margin: 0,

            color: "#0F172A",

            fontSize: "15px",
            fontWeight: 850,
            lineHeight: 1.35
          }}
        >
          {item.skill_name ||
            "Unnamed Skill"}
        </h3>


        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",

            marginTop: "8px"
          }}
        >

          <div
            style={{
              padding: "4px 7px",

              borderRadius: "7px",

              background: "#F5F3FF",

              color: "#7C3AED",

              fontSize: "8px",
              fontWeight: 800
            }}
          >
            Learned Skill
          </div>


          {item.certificate_url && (

            <div
              style={{
                padding: "4px 7px",

                borderRadius: "7px",

                background: "#EFF6FF",

                color: "#2563EB",

                fontSize: "8px",
                fontWeight: 800
              }}
            >
              Certificate Attached
            </div>

          )}

        </div>


        <p
          style={{
            margin: "10px 0 0",

            color: "#64748B",

            fontSize: "10px",
            lineHeight: 1.55,

            minHeight: "31px",

            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden"
          }}
        >
          {item.description ||
            "No skill description added yet."}
        </p>

      </div>


      {/* ==========================================
          ACTION BAR
         ========================================== */}

      <div
        style={{
          position: "relative",
          zIndex: 1,

          borderTop:
            "1px solid #E2E8F0",

          background:
            "rgba(248,250,252,0.78)",

          padding: "10px 12px",

          display: "flex",
          alignItems: "center",
          gap: "6px",
          flexWrap: "wrap"
        }}
      >

        {item.certificate_url && (

          <button
            type="button"

            onClick={() =>
              window.open(
                item.certificate_url,
                "_blank"
              )
            }

            style={{
              height: "32px",
              padding: "0 11px",

              borderRadius: "9px",

              border:
                "1px solid #DDD6FE",

              background: "#F5F3FF",

              color: "#7C3AED",

              fontSize: "9px",
              fontWeight: 900,

              cursor: "pointer",

              display: "flex",
              alignItems: "center",
              gap: "5px"
            }}
          >
            ◉ VIEW CERTIFICATE
          </button>

        )}


        <button
          type="button"

          onClick={handleDelete}

          style={{
            height: "32px",
            padding: "0 10px",

            borderRadius: "9px",

            border:
              "1px solid #FECACA",

            background: "#FEF2F2",

            color: "#DC2626",

            fontSize: "9px",
            fontWeight: 900,

            cursor: "pointer"
          }}
        >
          DELETE
        </button>


        {item.is_verified && (

          <div
            style={{
              marginLeft: "auto",

              color: "#15803D",

              fontSize: "8px",
              fontWeight: 900,

              letterSpacing: "0.4px",

              textTransform: "uppercase"
            }}
          >
            ✓ Accredited
          </div>

        )}

      </div>

    </div>

  );

}



function SkillsDrawer({
  skills,
  loadPortfolio
}: any) {

  const [showModal, setShowModal] =
    useState(false);


  const verifiedSkills =
    skills.filter(
      (item: any) =>
        item.is_verified
    ).length;


  return (

    <div
      style={{
        background: "#FFFFFF",

        borderRadius: "22px",

        border:
          "1px solid #E2E8F0",

        overflow: "hidden"
      }}
    >

      {/* ==============================================
          SKILLS HEADER
         ============================================== */}

      <div
        style={{
          position: "relative",
          overflow: "hidden",

          padding: "22px 24px",

          borderBottom:
            "1px solid #E2E8F0",

          background:
            "linear-gradient(135deg, #FFFFFF 0%, #FCFAFF 60%, #F5F3FF 100%)"
        }}
      >

        <div
          style={{
            position: "absolute",

            width: "170px",
            height: "170px",

            borderRadius: "50%",

            right: "-55px",
            top: "-100px",

            background:
              "rgba(124,58,237,0.055)",

            pointerEvents: "none"
          }}
        />

        <div
          style={{
            position: "absolute",

            width: "100px",
            height: "100px",

            borderRadius: "50%",

            right: "165px",
            bottom: "-75px",

            background:
              "rgba(168,85,247,0.04)",

            pointerEvents: "none"
          }}
        />


        <div
          style={{
            position: "relative",
            zIndex: 1,

            display: "flex",
            alignItems: "center",

            justifyContent:
              "space-between",

            gap: "20px",

            flexWrap: "wrap"
          }}
        >

          {/* LEFT */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px"
            }}
          >

            <div
              style={{
                width: "48px",
                height: "48px",

                borderRadius: "15px",

                background:
                  "linear-gradient(145deg, #F5F3FF, #EDE9FE)",

                border:
                  "1px solid #DDD6FE",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                flexShrink: 0
              }}
            >

              <span
                style={{
                  color: "#7C3AED",
                  fontSize: "23px",
                  fontWeight: 900
                }}
              >
                ✦
              </span>

            </div>


            <div>

              <div
                style={{
                  color: "#7C3AED",

                  fontSize: "9px",
                  fontWeight: 900,

                  letterSpacing: "1.6px",

                  textTransform:
                    "uppercase",

                  marginBottom: "5px"
                }}
              >
                CAPABILITY LEDGER
              </div>


              <h2
                style={{
                  margin: 0,

                  color: "#0F172A",

                  fontSize: "21px",
                  fontWeight: 800,

                  letterSpacing: "-0.3px"
                }}
              >
                Skills Learned
              </h2>


              <p
                style={{
                  margin: "5px 0 0",

                  color: "#64748B",

                  fontSize: "12px",
                  lineHeight: 1.5
                }}
              >
              
              </p>

            </div>

          </div>


          {/* RIGHT */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap"
            }}
          >

            <div
              style={{
                height: "42px",

                padding: "0 14px",

                borderRadius: "12px",

                background: "#F8FAFC",

                border:
                  "1px solid #E2E8F0",

                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >

              <span
                style={{
                  color: "#7C3AED",

                  fontSize: "16px",
                  fontWeight: 900
                }}
              >
                {skills.length}
              </span>

              <span
                style={{
                  color: "#64748B",

                  fontSize: "10px",
                  fontWeight: 800,

                  textTransform:
                    "uppercase",

                  letterSpacing: "0.5px"
                }}
              >
                Skills
              </span>

            </div>


            {verifiedSkills > 0 && (

              <div
                style={{
                  height: "42px",

                  padding: "0 13px",

                  borderRadius: "12px",

                  background: "#ECFDF5",

                  border:
                    "1px solid #BBF7D0",

                  display: "flex",
                  alignItems: "center",
                  gap: "7px"
                }}
              >

                <span
                  style={{
                    color: "#15803D",

                    fontSize: "14px",
                    fontWeight: 900
                  }}
                >
                  {verifiedSkills}
                </span>

                <span
                  style={{
                    color: "#15803D",

                    fontSize: "9px",
                    fontWeight: 900,

                    textTransform:
                      "uppercase"
                  }}
                >
                  Verified
                </span>

              </div>

            )}


            <button
              type="button"

              onClick={() =>
                setShowModal(true)
              }

              style={{
                height: "42px",

                padding: "0 17px",

                borderRadius: "12px",

                border:
                  "1px solid #7C3AED",

                background: "#7C3AED",

                color: "#FFFFFF",

                fontSize: "11px",
                fontWeight: 900,

                letterSpacing: "0.3px",

                cursor: "pointer",

                boxShadow:
                  "0 6px 14px rgba(124,58,237,0.16)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px"
              }}
            >

              <span
                style={{
                  fontSize: "17px",
                  lineHeight: 1
                }}
              >
                +
              </span>

              ADD SKILL

            </button>

          </div>

        </div>

      </div>


      {/* ==============================================
          SKILL COLLECTION
         ============================================== */}

      <div
        style={{
          padding: "20px 22px 22px"
        }}
      >

        <div
          style={{
            display: "flex",
            alignItems: "center",

            justifyContent:
              "space-between",

            gap: "16px",

            marginBottom: "14px"
          }}
        >

          <div>

            <div
              style={{
                color: "#0F172A",

                fontSize: "13px",
                fontWeight: 800
              }}
            >
              Capability Collection
            </div>

            <div
              style={{
                color: "#94A3B8",

                fontSize: "10px",

                marginTop: "3px"
              }}
            >
              Review your learned skills and
              supporting credentials.
            </div>

          </div>


          {skills.length > 0 && (

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",

                color: "#64748B",

                fontSize: "10px",
                fontWeight: 700
              }}
            >

              <span
                style={{
                  width: "7px",
                  height: "7px",

                  borderRadius: "50%",

                  background: "#8B5CF6",

                  display: "inline-block"
                }}
              />

              Capability Ledger Active

            </div>

          )}

        </div>


        {/* EMPTY STATE */}

        {skills.length === 0 && (

          <div
            style={{
              minHeight: "190px",

              borderRadius: "18px",

              border:
                "1px dashed #DDD6FE",

              background:
                "linear-gradient(135deg, #FCFAFF, #FFFFFF)",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              padding: "28px",

              textAlign: "center"
            }}
          >

            <div
              style={{
                maxWidth: "390px"
              }}
            >

              <div
                style={{
                  width: "52px",
                  height: "52px",

                  margin:
                    "0 auto 13px",

                  borderRadius: "16px",

                  background: "#F5F3FF",

                  border:
                    "1px solid #DDD6FE",

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  color: "#7C3AED",

                  fontSize: "24px",
                  fontWeight: 900
                }}
              >
                ✦
              </div>


              <div
                style={{
                  color: "#0F172A",

                  fontSize: "15px",
                  fontWeight: 800
                }}
              >
                Build your capability profile
              </div>


              <div
                style={{
                  color: "#64748B",

                  fontSize: "11px",
                  lineHeight: 1.6,

                  marginTop: "6px"
                }}
              >
                Add skills you learn through
                courses, workshops, projects and
                real-world experiences.
              </div>


              <button
                type="button"

                onClick={() =>
                  setShowModal(true)
                }

                style={{
                  marginTop: "15px",

                  height: "38px",

                  padding: "0 15px",

                  borderRadius: "11px",

                  border: "none",

                  background: "#7C3AED",

                  color: "#FFFFFF",

                  fontSize: "10px",
                  fontWeight: 900,

                  cursor: "pointer"
                }}
              >
                + ADD FIRST SKILL
              </button>

            </div>

          </div>

        )}


        {/* SKILLS GRID */}

        {skills.length > 0 && (

          <div
            style={{
              display: "grid",

              gridTemplateColumns:
                "repeat(auto-fit, minmax(360px, 1fr))",

              gap: "14px"
            }}
          >

            {skills.map(
              (item: any) => (

                <SkillCard
                  key={item.id}

                  item={item}

                  loadPortfolio={
                    loadPortfolio
                  }
                />

              )
            )}

          </div>

        )}

      </div>


      {/* EXISTING ADD SKILL FLOW */}

      {showModal && (

        <AddSkillModal
          onClose={() => {

            console.log(
              "SKILL MODAL CLOSED"
            );

            setShowModal(false);

            loadPortfolio();

          }}
        />

      )}

    </div>

  );

}

 function AddPerformanceModal({
  onClose
}: any) {

  const [title, setTitle] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [venue, setVenue] =
    useState("");

  const [
    description,
    setDescription
  ] = useState("");

  const [
    performanceDate,
    setPerformanceDate
  ] = useState("");

  const [file, setFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);


  async function handleSave() {

    try {

      setLoading(true);

      const identity =
        requireIdentity();

      let videoUrl = "";

      if (file) {

        const uploaded =
          await uploadPerformanceVideo(
            file
          );

        if (uploaded) {
          videoUrl = uploaded;
        }

      }


      const performance =
        await createPerformance({

          title,

          category,

          venue,

          performance_date:
            performanceDate,

          description,

          video_url:
            videoUrl,

          parent_verified:
            false

        });


      if (!performance) {

        throw new Error(
          "Unable to create performance."
        );

      }


      const otp =
        Math.floor(
          100000 +
          Math.random() *
          900000
        ).toString();


      await createPerformanceOtp(

        performance.id,

        otp

      );


      console.log(

        "Performance created for",

        identity.studentName

      );


      alert(
        `Parent OTP: ${otp}`
      );

      alert(
        "Performance Added"
      );

      onClose();


    } catch (err) {

      console.error(err);

      alert(
        "Failed to save"
      );

    } finally {

      setLoading(false);

    }

  }


  const inputStyle = {

    width: "100%",

    boxSizing:
      "border-box" as const,

    height: "44px",

    border:
      "1px solid #CBD5E1",

    borderRadius: "11px",

    padding:
      "0 13px",

    background:
      "#FFFFFF",

    color:
      "#0F172A",

    fontSize:
      "12px",

    outline:
      "none"

  };


  const labelStyle = {

    display:
      "block",

    marginBottom:
      "6px",

    color:
      "#475569",

    fontSize:
      "9px",

    fontWeight:
      900,

    letterSpacing:
      "0.8px",

    textTransform:
      "uppercase" as const

  };


  return (

    <div

      onClick={onClose}

      style={{

        position:
          "fixed",

        inset: 0,

        zIndex:
          99999,

        padding:
          "24px",

        display:
          "flex",

        alignItems:
          "center",

        justifyContent:
          "center",

        background:
          "rgba(7,20,45,0.76)",

        backdropFilter:
          "blur(5px)"

      }}

    >

      <div

        onClick={(e) =>
          e.stopPropagation()
        }

        style={{

          position:
            "relative",

          width:
            "100%",

          maxWidth:
            "760px",

          maxHeight:
            "92vh",

          overflowY:
            "auto",

          borderRadius:
            "24px",

          background:
            "#FFFFFF",

          border:
            "1px solid rgba(255,255,255,0.15)",

          boxShadow:
            "0 35px 90px rgba(2,6,23,0.35)"

        }}

      >


        {/* ==========================================
            HEADER
           ========================================== */}

        <div

          style={{

            position:
              "relative",

            overflow:
              "hidden",

            padding:
              "24px 26px",

            background:
              "linear-gradient(135deg, #07142D 0%, #10244A 68%, #183A65 100%)",

            color:
              "#FFFFFF"

          }}

        >


          {/* DECORATIVE CIRCLES */}

          <div

            style={{

              position:
                "absolute",

              width:
                "190px",

              height:
                "190px",

              borderRadius:
                "50%",

              right:
                "-60px",

              top:
                "-115px",

              border:
                "30px solid rgba(255,255,255,0.045)",

              pointerEvents:
                "none"

            }}

          />


          <div

            style={{

              position:
                "absolute",

              width:
                "100px",

              height:
                "100px",

              borderRadius:
                "50%",

              right:
                "125px",

              bottom:
                "-72px",

              background:
                "rgba(249,115,22,0.14)",

              pointerEvents:
                "none"

            }}

          />


          <div

            style={{

              position:
                "relative",

              zIndex: 1,

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "space-between",

              gap:
                "20px"

            }}

          >


            {/* LEFT */}

            <div

              style={{

                display:
                  "flex",

                alignItems:
                  "center",

                gap:
                  "14px"

              }}

            >

              <div

                style={{

                  width:
                    "48px",

                  height:
                    "48px",

                  borderRadius:
                    "15px",

                  flexShrink: 0,

                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  background:
                    "rgba(249,115,22,0.13)",

                  border:
                    "1px solid rgba(253,186,116,0.25)"

                }}

              >

                <div

                  style={{

                    width: 0,

                    height: 0,

                    borderTop:
                      "8px solid transparent",

                    borderBottom:
                      "8px solid transparent",

                    borderLeft:
                      "13px solid #F97316",

                    marginLeft:
                      "3px"

                  }}

                />

              </div>


              <div>

                <div

                  style={{

                    color:
                      "#FDBA74",

                    fontSize:
                      "9px",

                    fontWeight:
                      900,

                    letterSpacing:
                      "1.5px",

                    textTransform:
                      "uppercase"

                  }}

                >
                  PERFORMANCE REGISTRY
                </div>


                <h2

                  style={{

                    margin:
                      "5px 0 0",

                    color:
                      "#FFFFFF",

                    fontSize:
                      "21px",

                    fontWeight:
                      850,

                    letterSpacing:
                      "-0.3px"

                  }}

                >
                  Add Live Performance
                </h2>


                <p

                  style={{

                    margin:
                      "5px 0 0",

                    color:
                      "#CBD5E1",

                    fontSize:
                      "10px",

                    lineHeight:
                      1.5

                  }}

                >
                  Add performance evidence to your accredited portfolio.
                </p>

              </div>

            </div>


            {/* CLOSE */}

            <button

              type="button"

              onClick={
                onClose
              }

              style={{

                width:
                  "36px",

                height:
                  "36px",

                borderRadius:
                  "11px",

                border:
                  "1px solid rgba(255,255,255,0.16)",

                background:
                  "rgba(255,255,255,0.08)",

                color:
                  "#FFFFFF",

                fontSize:
                  "18px",

                cursor:
                  "pointer",

                flexShrink: 0

              }}

            >
              ×
            </button>

          </div>

        </div>


        {/* ==========================================
            FORM BODY
           ========================================== */}

        <div

          style={{

            padding:
              "22px 26px 24px",

            background:
              "linear-gradient(180deg, #FFFFFF 0%, #FCFCFD 100%)"

          }}

        >


          {/* SECTION LABEL */}

          <div

            style={{

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "space-between",

              gap:
                "15px",

              marginBottom:
                "17px"

            }}

          >

            <div>

              <div

                style={{

                  color:
                    "#0F172A",

                  fontSize:
                    "13px",

                  fontWeight:
                    850

                }}

              >
                Performance Details
              </div>


              <div

                style={{

                  color:
                    "#94A3B8",

                  fontSize:
                    "10px",

                  marginTop:
                    "3px"

                }}

              >
                Record the activity and attach supporting video evidence.
              </div>

            </div>


            <div

              style={{

                display:
                  "inline-flex",

                alignItems:
                  "center",

                gap:
                  "6px",

                padding:
                  "6px 9px",

                borderRadius:
                  "999px",

                background:
                  "#FFF7ED",

                border:
                  "1px solid #FED7AA",

                color:
                  "#C2410C",

                fontSize:
                  "8px",

                fontWeight:
                  900,

                textTransform:
                  "uppercase",

                whiteSpace:
                  "nowrap"

              }}

            >

              <span

                style={{

                  width:
                    "6px",

                  height:
                    "6px",

                  borderRadius:
                    "50%",

                  background:
                    "#F97316"

                }}

              />

              New Record

            </div>

          </div>


          {/* ==========================================
              ROW 1
             ========================================== */}

          <div

            style={{

              display:
                "grid",

              gridTemplateColumns:
                "minmax(0, 1.4fr) minmax(0, 1fr)",

              gap:
                "13px"

            }}

          >


            <div>

              <label
                style={
                  labelStyle
                }
              >
                Performance Title
              </label>

              <input

                placeholder="Example: Annual Dance Showcase"

                value={
                  title
                }

                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }

                style={
                  inputStyle
                }

              />

            </div>


            <div>

              <label
                style={
                  labelStyle
                }
              >
                Category
              </label>

              <input

                placeholder="Dance, Music, Theatre..."

                value={
                  category
                }

                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }

                style={
                  inputStyle
                }

              />

            </div>

          </div>


          {/* ==========================================
              ROW 2
             ========================================== */}

          <div

            style={{

              display:
                "grid",

              gridTemplateColumns:
                "minmax(0, 1.4fr) minmax(0, 1fr)",

              gap:
                "13px",

              marginTop:
                "14px"

            }}

          >

            <div>

              <label
                style={
                  labelStyle
                }
              >
                Venue
              </label>

              <input

                placeholder="School auditorium, academy, event..."

                value={
                  venue
                }

                onChange={(e) =>
                  setVenue(
                    e.target.value
                  )
                }

                style={
                  inputStyle
                }

              />

            </div>


            <div>

              <label
                style={
                  labelStyle
                }
              >
                Performance Date
              </label>

              <input

                type="date"

                value={
                  performanceDate
                }

                onChange={(e) =>
                  setPerformanceDate(
                    e.target.value
                  )
                }

                style={
                  inputStyle
                }

              />

            </div>

          </div>


          {/* ==========================================
              DESCRIPTION
             ========================================== */}

          <div

            style={{

              marginTop:
                "14px"

            }}

          >

            <label
              style={
                labelStyle
              }
            >
              Performance Description
            </label>


            <textarea

              placeholder="Describe the performance, your role and what this performance represents..."

              rows={3}

              value={
                description
              }

              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }

              style={{

                width:
                  "100%",

                boxSizing:
                  "border-box",

                minHeight:
                  "82px",

                border:
                  "1px solid #CBD5E1",

                borderRadius:
                  "11px",

                padding:
                  "11px 13px",

                background:
                  "#FFFFFF",

                color:
                  "#0F172A",

                fontSize:
                  "12px",

                fontFamily:
                  "inherit",

                lineHeight:
                  1.5,

                resize:
                  "vertical",

                outline:
                  "none"

              }}

            />

          </div>


          {/* ==========================================
              VIDEO EVIDENCE
             ========================================== */}

          <div

            style={{

              position:
                "relative",

              overflow:
                "hidden",

              marginTop:
                "16px",

              border:
                file
                  ? "1px solid #FDBA74"
                  : "1px dashed #CBD5E1",

              borderRadius:
                "16px",

              background:
                file
                  ? "#FFF7ED"
                  : "#F8FAFC",

              padding:
                "15px 16px"

            }}

          >


            <div

              style={{

                position:
                  "absolute",

                width:
                  "90px",

                height:
                  "90px",

                borderRadius:
                  "50%",

                right:
                  "-35px",

                top:
                  "-45px",

                background:
                  "rgba(249,115,22,0.06)",

                pointerEvents:
                  "none"

              }}

            />


            <div

              style={{

                position:
                  "relative",

                zIndex: 1,

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "space-between",

                gap:
                  "20px"

              }}

            >


              <div

                style={{

                  display:
                    "flex",

                  alignItems:
                    "center",

                  gap:
                    "11px",

                  minWidth: 0

                }}

              >

                <div

                  style={{

                    width:
                      "39px",

                    height:
                      "39px",

                    borderRadius:
                      "12px",

                    flexShrink: 0,

                    background:
                      "#FFF7ED",

                    border:
                      "1px solid #FED7AA",

                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center"

                  }}

                >

                  <div

                    style={{

                      width: 0,

                      height: 0,

                      borderTop:
                        "6px solid transparent",

                      borderBottom:
                        "6px solid transparent",

                      borderLeft:
                        "10px solid #F97316",

                      marginLeft:
                        "2px"

                    }}

                  />

                </div>


                <div
                  style={{
                    minWidth: 0
                  }}
                >

                  <div

                    style={{

                      color:
                        "#0F172A",

                      fontSize:
                        "11px",

                      fontWeight:
                        850

                    }}

                  >
                    Performance Video
                  </div>


                  <div

                    style={{

                      marginTop:
                        "3px",

                      color:
                        file
                          ? "#C2410C"
                          : "#64748B",

                      fontSize:
                        "9px",

                      whiteSpace:
                        "nowrap",

                      overflow:
                        "hidden",

                      textOverflow:
                        "ellipsis",

                      maxWidth:
                        "330px"

                    }}

                  >
                    {file
                      ? file.name
                      : "Upload supporting video evidence"}
                  </div>

                </div>

              </div>


              <label

                style={{

                  height:
                    "34px",

                  padding:
                    "0 12px",

                  borderRadius:
                    "9px",

                  border:
                    "1px solid #FED7AA",

                  background:
                    "#FFFFFF",

                  color:
                    "#C2410C",

                  fontSize:
                    "9px",

                  fontWeight:
                    900,

                  cursor:
                    "pointer",

                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  whiteSpace:
                    "nowrap"

                }}

              >

                {file
                  ? "CHANGE VIDEO"
                  : "SELECT VIDEO"}


                <input

                  type="file"

                  accept="video/*"

                  onChange={(e) =>
                    setFile(
                      e.target.files?.[0] ||
                        null
                    )
                  }

                  style={{
                    display:
                      "none"
                  }}

                />

              </label>

            </div>

          </div>


          {/* ==========================================
              VERIFICATION INFORMATION
             ========================================== */}

          <div

            style={{

              marginTop:
                "14px",

              padding:
                "11px 13px",

              borderRadius:
                "12px",

              border:
                "1px solid #DBEAFE",

              background:
                "#F8FBFF",

              display:
                "flex",

              alignItems:
                "center",

              gap:
                "10px"

            }}

          >

            <div

              style={{

                width:
                  "28px",

                height:
                  "28px",

                borderRadius:
                  "9px",

                flexShrink: 0,

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                background:
                  "#EFF6FF",

                color:
                  "#2563EB",

                fontSize:
                  "13px",

                fontWeight:
                  900

              }}

            >
              ✓
            </div>


            <div>

              <div

                style={{

                  color:
                    "#334155",

                  fontSize:
                    "9px",

                  fontWeight:
                    850

                }}

              >
                Parent verification follows submission
              </div>


              <div

                style={{

                  color:
                    "#64748B",

                  fontSize:
                    "9px",

                  marginTop:
                    "2px",

                  lineHeight:
                    1.45

                }}

              >
                Saving this record generates the existing parent OTP used for accreditation.
              </div>

            </div>

          </div>


          {/* ==========================================
              FOOTER ACTIONS
             ========================================== */}

          <div

            style={{

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "space-between",

              gap:
                "16px",

              paddingTop:
                "18px",

              marginTop:
                "18px",

              borderTop:
                "1px solid #E2E8F0"

            }}

          >

            <div

              style={{

                color:
                  "#94A3B8",

                fontSize:
                  "9px",

                lineHeight:
                  1.5

              }}

            >
              Your performance will become part of the Portfolio Ledger.
            </div>


            <div

              style={{

                display:
                  "flex",

                alignItems:
                  "center",

                gap:
                  "8px",

                flexShrink: 0

              }}

            >

              <button

                type="button"

                onClick={
                  onClose
                }

                disabled={
                  loading
                }

                style={{

                  height:
                    "39px",

                  padding:
                    "0 15px",

                  borderRadius:
                    "10px",

                  border:
                    "1px solid #CBD5E1",

                  background:
                    "#FFFFFF",

                  color:
                    "#475569",

                  fontSize:
                    "10px",

                  fontWeight:
                    850,

                  cursor:
                    loading
                      ? "default"
                      : "pointer"

                }}

              >
                CANCEL
              </button>


              <button

                type="button"

                onClick={
                  handleSave
                }

                disabled={
                  loading
                }

                style={{

                  minWidth:
                    "145px",

                  height:
                    "39px",

                  padding:
                    "0 17px",

                  borderRadius:
                    "10px",

                  border:
                    "1px solid #F97316",

                  background:
                    loading
                      ? "#FDBA74"
                      : "#F97316",

                  color:
                    "#FFFFFF",

                  fontSize:
                    "10px",

                  fontWeight:
                    900,

                  letterSpacing:
                    "0.3px",

                  cursor:
                    loading
                      ? "default"
                      : "pointer",

                  boxShadow:
                    loading
                      ? "none"
                      : "0 6px 15px rgba(249,115,22,0.18)"

                }}

              >

                {loading
                  ? "SAVING..."
                  : "SAVE PERFORMANCE"}

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

function AddProjectModal({
  onClose
}: any) {

  const [title, setTitle] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [projectDate, setProjectDate] =
    useState("");

  const [
    description,
    setDescription
  ] = useState("");

  const [
    projectLink,
    setProjectLink
  ] = useState("");

  const [file, setFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);


  async function handleSave() {

    try {

      setLoading(true);


      let videoUrl = "";


      if (file) {

        const uploaded =
          await uploadProjectVideo(
            file
          );

        if (uploaded) {

          videoUrl =
            uploaded;

        }

      }


      await createProject({

        title,

        category,

        project_date:
          projectDate,

        description,

        project_link:
          projectLink,

        project_video_url:
          videoUrl,

        parent_verified:
          false

      });


      console.log(
        "PROJECT SAVED"
      );

      console.log(
        "CALLING ONCLOSE"
      );


      onClose();


      console.log(
        "ONCLOSE FINISHED"
      );


    } catch (err) {

      console.error(
        "PROJECT ERROR",
        err
      );

      console.error(err);


      if (
        err instanceof Error
      ) {

        alert(
          err.message
        );

      } else {

        alert(
          "Unknown error"
        );

      }

    } finally {

      setLoading(false);

    }

  }


  const inputStyle = {

    width:
      "100%",

    boxSizing:
      "border-box" as const,

    height:
      "44px",

    border:
      "1px solid #CBD5E1",

    borderRadius:
      "11px",

    padding:
      "0 13px",

    background:
      "#FFFFFF",

    color:
      "#0F172A",

    fontSize:
      "12px",

    outline:
      "none"

  };


  const labelStyle = {

    display:
      "block",

    marginBottom:
      "6px",

    color:
      "#475569",

    fontSize:
      "9px",

    fontWeight:
      900,

    letterSpacing:
      "0.8px",

    textTransform:
      "uppercase" as const

  };


  return (

    <div

      onClick={
        onClose
      }

      style={{

        position:
          "fixed",

        inset: 0,

        zIndex:
          99999,

        padding:
          "24px",

        display:
          "flex",

        alignItems:
          "center",

        justifyContent:
          "center",

        background:
          "rgba(7,20,45,0.76)",

        backdropFilter:
          "blur(5px)"

      }}

    >

      <div

        onClick={(e) =>
          e.stopPropagation()
        }

        style={{

          position:
            "relative",

          width:
            "100%",

          maxWidth:
            "760px",

          maxHeight:
            "92vh",

          overflowY:
            "auto",

          borderRadius:
            "24px",

          background:
            "#FFFFFF",

          border:
            "1px solid rgba(255,255,255,0.15)",

          boxShadow:
            "0 35px 90px rgba(2,6,23,0.35)"

        }}

      >


        {/* ==========================================
            HEADER
           ========================================== */}

        <div

          style={{

            position:
              "relative",

            overflow:
              "hidden",

            padding:
              "24px 26px",

            background:
              "linear-gradient(135deg, #07142D 0%, #10244A 68%, #183A65 100%)",

            color:
              "#FFFFFF"

          }}

        >


          <div

            style={{

              position:
                "absolute",

              width:
                "190px",

              height:
                "190px",

              borderRadius:
                "50%",

              right:
                "-60px",

              top:
                "-115px",

              border:
                "30px solid rgba(255,255,255,0.045)",

              pointerEvents:
                "none"

            }}

          />


          <div

            style={{

              position:
                "absolute",

              width:
                "100px",

              height:
                "100px",

              borderRadius:
                "50%",

              right:
                "125px",

              bottom:
                "-72px",

              background:
                "rgba(249,115,22,0.14)",

              pointerEvents:
                "none"

            }}

          />


          <div

            style={{

              position:
                "relative",

              zIndex: 1,

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "space-between",

              gap:
                "20px"

            }}

          >


            <div

              style={{

                display:
                  "flex",

                alignItems:
                  "center",

                gap:
                  "14px"

              }}

            >


              {/* PROJECT ICON */}

              <div

                style={{

                  width:
                    "48px",

                  height:
                    "48px",

                  borderRadius:
                    "15px",

                  flexShrink: 0,

                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  background:
                    "rgba(249,115,22,0.13)",

                  border:
                    "1px solid rgba(253,186,116,0.25)"

                }}

              >

                <div

                  style={{

                    width:
                      "22px",

                    height:
                      "17px",

                    position:
                      "relative",

                    border:
                      "2px solid #F97316",

                    borderRadius:
                      "4px"

                  }}

                >

                  <div

                    style={{

                      position:
                        "absolute",

                      width:
                        "9px",

                      height:
                        "4px",

                      left:
                        "2px",

                      top:
                        "-6px",

                      border:
                        "2px solid #F97316",

                      borderBottom:
                        "none",

                      borderRadius:
                        "3px 3px 0 0"

                    }}

                  />

                </div>

              </div>


              <div>

                <div

                  style={{

                    color:
                      "#FDBA74",

                    fontSize:
                      "9px",

                    fontWeight:
                      900,

                    letterSpacing:
                      "1.5px",

                    textTransform:
                      "uppercase"

                  }}

                >
                  PROJECT REGISTRY
                </div>


                <h2

                  style={{

                    margin:
                      "5px 0 0",

                    color:
                      "#FFFFFF",

                    fontSize:
                      "21px",

                    fontWeight:
                      850,

                    letterSpacing:
                      "-0.3px"

                  }}

                >
                  Add Project
                </h2>


                <p

                  style={{

                    margin:
                      "5px 0 0",

                    color:
                      "#CBD5E1",

                    fontSize:
                      "10px",

                    lineHeight:
                      1.5

                  }}

                >
                  Document meaningful work, creations and independent projects.
                </p>

              </div>

            </div>


            <button

              type="button"

              onClick={
                onClose
              }

              style={{

                width:
                  "36px",

                height:
                  "36px",

                borderRadius:
                  "11px",

                border:
                  "1px solid rgba(255,255,255,0.16)",

                background:
                  "rgba(255,255,255,0.08)",

                color:
                  "#FFFFFF",

                fontSize:
                  "18px",

                cursor:
                  "pointer",

                flexShrink: 0

              }}

            >
              ×
            </button>

          </div>

        </div>


        {/* ==========================================
            FORM
           ========================================== */}

        <div

          style={{

            padding:
              "22px 26px 24px",

            background:
              "linear-gradient(180deg, #FFFFFF 0%, #FCFCFD 100%)"

          }}

        >


          <div

            style={{

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "space-between",

              gap:
                "15px",

              marginBottom:
                "17px"

            }}

          >

            <div>

              <div

                style={{

                  color:
                    "#0F172A",

                  fontSize:
                    "13px",

                  fontWeight:
                    850

                }}

              >
                Project Details
              </div>


              <div

                style={{

                  color:
                    "#94A3B8",

                  fontSize:
                    "10px",

                  marginTop:
                    "3px"

                }}

              >
                Capture the project, its context and supporting evidence.
              </div>

            </div>


            <div

              style={{

                display:
                  "inline-flex",

                alignItems:
                  "center",

                gap:
                  "6px",

                padding:
                  "6px 9px",

                borderRadius:
                  "999px",

                background:
                  "#FFF7ED",

                border:
                  "1px solid #FED7AA",

                color:
                  "#C2410C",

                fontSize:
                  "8px",

                fontWeight:
                  900,

                textTransform:
                  "uppercase",

                whiteSpace:
                  "nowrap"

              }}

            >

              <span

                style={{

                  width:
                    "6px",

                  height:
                    "6px",

                  borderRadius:
                    "50%",

                  background:
                    "#F97316"

                }}

              />

              New Project

            </div>

          </div>


          {/* ==========================================
              TITLE + CATEGORY
             ========================================== */}

          <div

            style={{

              display:
                "grid",

              gridTemplateColumns:
                "minmax(0, 1.4fr) minmax(0, 1fr)",

              gap:
                "13px"

            }}

          >

            <div>

              <label
                style={
                  labelStyle
                }
              >
                Project Title
              </label>


              <input

                placeholder="Example: Solar Powered Model"

                value={
                  title
                }

                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }

                style={
                  inputStyle
                }

              />

            </div>


            <div>

              <label
                style={
                  labelStyle
                }
              >
                Category
              </label>


              <input

                placeholder="Science, Art, Coding..."

                value={
                  category
                }

                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }

                style={
                  inputStyle
                }

              />

            </div>

          </div>


          {/* ==========================================
              DATE + LINK
             ========================================== */}

          <div

            style={{

              display:
                "grid",

              gridTemplateColumns:
                "minmax(0, 0.8fr) minmax(0, 1.6fr)",

              gap:
                "13px",

              marginTop:
                "14px"

            }}

          >

            <div>

              <label
                style={
                  labelStyle
                }
              >
                Project Date
              </label>


              <input

                type="date"

                value={
                  projectDate
                }

                onChange={(e) =>
                  setProjectDate(
                    e.target.value
                  )
                }

                style={
                  inputStyle
                }

              />

            </div>


            <div>

              <label
                style={
                  labelStyle
                }
              >
                Project Link
              </label>


              <input

                placeholder="Portfolio, GitHub, Drive or project URL"

                value={
                  projectLink
                }

                onChange={(e) =>
                  setProjectLink(
                    e.target.value
                  )
                }

                style={
                  inputStyle
                }

              />

            </div>

          </div>


          {/* ==========================================
              DESCRIPTION
             ========================================== */}

          <div

            style={{

              marginTop:
                "14px"

            }}

          >

            <label
              style={
                labelStyle
              }
            >
              Project Description
            </label>


            <textarea

              rows={3}

              placeholder="Describe what you built, your role, the problem you worked on and what you learned..."

              value={
                description
              }

              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }

              style={{

                width:
                  "100%",

                boxSizing:
                  "border-box",

                minHeight:
                  "82px",

                border:
                  "1px solid #CBD5E1",

                borderRadius:
                  "11px",

                padding:
                  "11px 13px",

                background:
                  "#FFFFFF",

                color:
                  "#0F172A",

                fontSize:
                  "12px",

                fontFamily:
                  "inherit",

                lineHeight:
                  1.5,

                resize:
                  "vertical",

                outline:
                  "none"

              }}

            />

          </div>


          {/* ==========================================
              PROJECT VIDEO
             ========================================== */}

          <div

            style={{

              position:
                "relative",

              overflow:
                "hidden",

              marginTop:
                "16px",

              border:
                file
                  ? "1px solid #FDBA74"
                  : "1px dashed #CBD5E1",

              borderRadius:
                "16px",

              background:
                file
                  ? "#FFF7ED"
                  : "#F8FAFC",

              padding:
                "15px 16px"

            }}

          >


            <div

              style={{

                position:
                  "absolute",

                width:
                  "90px",

                height:
                  "90px",

                borderRadius:
                  "50%",

                right:
                  "-35px",

                top:
                  "-45px",

                background:
                  "rgba(249,115,22,0.06)",

                pointerEvents:
                  "none"

              }}

            />


            <div

              style={{

                position:
                  "relative",

                zIndex: 1,

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "space-between",

                gap:
                  "20px"

              }}

            >


              <div

                style={{

                  display:
                    "flex",

                  alignItems:
                    "center",

                  gap:
                    "11px",

                  minWidth: 0

                }}

              >


                <div

                  style={{

                    width:
                      "39px",

                    height:
                      "39px",

                    borderRadius:
                      "12px",

                    flexShrink: 0,

                    background:
                      "#FFF7ED",

                    border:
                      "1px solid #FED7AA",

                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center"

                  }}

                >

                  <div

                    style={{

                      width: 0,

                      height: 0,

                      borderTop:
                        "6px solid transparent",

                      borderBottom:
                        "6px solid transparent",

                      borderLeft:
                        "10px solid #F97316",

                      marginLeft:
                        "2px"

                    }}

                  />

                </div>


                <div
                  style={{
                    minWidth: 0
                  }}
                >

                  <div

                    style={{

                      color:
                        "#0F172A",

                      fontSize:
                        "11px",

                      fontWeight:
                        850

                    }}

                  >
                    Project Video
                  </div>


                  <div

                    style={{

                      marginTop:
                        "3px",

                      color:
                        file
                          ? "#C2410C"
                          : "#64748B",

                      fontSize:
                        "9px",

                      whiteSpace:
                        "nowrap",

                      overflow:
                        "hidden",

                      textOverflow:
                        "ellipsis",

                      maxWidth:
                        "330px"

                    }}

                  >

                    {file
                      ? file.name
                      : "Upload a demonstration or project walkthrough"}

                  </div>

                </div>

              </div>


              <label

                style={{

                  height:
                    "34px",

                  padding:
                    "0 12px",

                  borderRadius:
                    "9px",

                  border:
                    "1px solid #FED7AA",

                  background:
                    "#FFFFFF",

                  color:
                    "#C2410C",

                  fontSize:
                    "9px",

                  fontWeight:
                    900,

                  cursor:
                    "pointer",

                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  whiteSpace:
                    "nowrap"

                }}

              >

                {file
                  ? "CHANGE VIDEO"
                  : "SELECT VIDEO"}


                <input

                  type="file"

                  accept="video/*"

                  onChange={(e) =>
                    setFile(
                      e.target.files?.[0] ||
                        null
                    )
                  }

                  style={{
                    display:
                      "none"
                  }}

                />

              </label>

            </div>

          </div>


          {/* ==========================================
              PORTFOLIO INFO
             ========================================== */}

          <div

            style={{

              marginTop:
                "14px",

              padding:
                "11px 13px",

              borderRadius:
                "12px",

              border:
                "1px solid #DBEAFE",

              background:
                "#F8FBFF",

              display:
                "flex",

              alignItems:
                "center",

              gap:
                "10px"

            }}

          >

            <div

              style={{

                width:
                  "28px",

                height:
                  "28px",

                borderRadius:
                  "9px",

                flexShrink: 0,

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                background:
                  "#EFF6FF",

                color:
                  "#2563EB",

                fontSize:
                  "13px",

                fontWeight:
                  900

              }}

            >
              ✓
            </div>


            <div>

              <div

                style={{

                  color:
                    "#334155",

                  fontSize:
                    "9px",

                  fontWeight:
                    850

                }}

              >
                Project evidence becomes part of your portfolio
              </div>


              <div

                style={{

                  color:
                    "#64748B",

                  fontSize:
                    "9px",

                  marginTop:
                    "2px",

                  lineHeight:
                    1.45

                }}

              >
                Your description, project link and uploaded evidence stay attached to this record.
              </div>

            </div>

          </div>


          {/* ==========================================
              ACTIONS
             ========================================== */}

          <div

            style={{

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "space-between",

              gap:
                "16px",

              paddingTop:
                "18px",

              marginTop:
                "18px",

              borderTop:
                "1px solid #E2E8F0"

            }}

          >

            <div

              style={{

                color:
                  "#94A3B8",

                fontSize:
                  "9px",

                lineHeight:
                  1.5

              }}

            >
              Build a long-term record of work beyond classroom scores.
            </div>


            <div

              style={{

                display:
                  "flex",

                alignItems:
                  "center",

                gap:
                  "8px",

                flexShrink: 0

              }}

            >

              <button

                type="button"

                onClick={
                  onClose
                }

                disabled={
                  loading
                }

                style={{

                  height:
                    "39px",

                  padding:
                    "0 15px",

                  borderRadius:
                    "10px",

                  border:
                    "1px solid #CBD5E1",

                  background:
                    "#FFFFFF",

                  color:
                    "#475569",

                  fontSize:
                    "10px",

                  fontWeight:
                    850,

                  cursor:
                    loading
                      ? "default"
                      : "pointer"

                }}

              >
                CANCEL
              </button>


              <button

                type="button"

                onClick={
                  handleSave
                }

                disabled={
                  loading
                }

                style={{

                  minWidth:
                    "130px",

                  height:
                    "39px",

                  padding:
                    "0 17px",

                  borderRadius:
                    "10px",

                  border:
                    "1px solid #F97316",

                  background:
                    loading
                      ? "#FDBA74"
                      : "#F97316",

                  color:
                    "#FFFFFF",

                  fontSize:
                    "10px",

                  fontWeight:
                    900,

                  letterSpacing:
                    "0.3px",

                  cursor:
                    loading
                      ? "default"
                      : "pointer",

                  boxShadow:
                    loading
                      ? "none"
                      : "0 6px 15px rgba(249,115,22,0.18)"

                }}

              >

                {loading
                  ? "SAVING..."
                  : "SAVE PROJECT"}

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

function AddSkillModal({
  onClose
}: any) {

  const [
    skillName,
    setSkillName
  ] = useState("");

  const [
    organization,
    setOrganization
  ] = useState("");

  const [
    certificateDate,
    setCertificateDate
  ] = useState("");

  const [
    description,
    setDescription
  ] = useState("");

  const [file, setFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);


  async function handleSave() {

    try {

      setLoading(true);

      let imageUrl = "";

      if (file) {

        const uploaded =
          await uploadSkillCertificate(
            file
          );

        if (uploaded) {
          imageUrl = uploaded;
        }

      }

      await createSkill({

        skill_name:
          skillName,

        organization,

        certificate_date:
          certificateDate,

        description,

        certificate_url:
          imageUrl,

        parent_verified:
          false

      });

      console.log(
        "SKILL SAVED"
      );

      console.log(
        "CALLING ONCLOSE"
      );

      onClose();

      console.log(
        "ONCLOSE FINISHED"
      );

    } catch (err) {

      console.error(
        "SKILL ERROR",
        err
      );

      alert(
        JSON.stringify(err)
      );

    } finally {

      setLoading(false);

    }

  }


  const inputStyle = {

    width:
      "100%",

    boxSizing:
      "border-box" as const,

    height:
      "44px",

    border:
      "1px solid #CBD5E1",

    borderRadius:
      "11px",

    padding:
      "0 13px",

    background:
      "#FFFFFF",

    color:
      "#0F172A",

    fontSize:
      "12px",

    outline:
      "none"

  };


  const labelStyle = {

    display:
      "block",

    marginBottom:
      "6px",

    color:
      "#475569",

    fontSize:
      "9px",

    fontWeight:
      900,

    letterSpacing:
      "0.8px",

    textTransform:
      "uppercase" as const

  };


  return (

    <div

      onClick={
        onClose
      }

      style={{

        position:
          "fixed",

        inset: 0,

        zIndex:
          99999,

        padding:
          "24px",

        display:
          "flex",

        alignItems:
          "center",

        justifyContent:
          "center",

        background:
          "rgba(7,20,45,0.76)",

        backdropFilter:
          "blur(5px)"

      }}

    >

      <div

        onClick={(e) =>
          e.stopPropagation()
        }

        style={{

          position:
            "relative",

          width:
            "100%",

          maxWidth:
            "760px",

          maxHeight:
            "92vh",

          overflowY:
            "auto",

          borderRadius:
            "24px",

          background:
            "#FFFFFF",

          border:
            "1px solid rgba(255,255,255,0.15)",

          boxShadow:
            "0 35px 90px rgba(2,6,23,0.35)"

        }}

      >


        {/* ==========================================
            HEADER
           ========================================== */}

        <div

          style={{

            position:
              "relative",

            overflow:
              "hidden",

            padding:
              "24px 26px",

            background:
              "linear-gradient(135deg, #07142D 0%, #10244A 68%, #183A65 100%)",

            color:
              "#FFFFFF"

          }}

        >


          {/* LARGE DECORATIVE CIRCLE */}

          <div

            style={{

              position:
                "absolute",

              width:
                "190px",

              height:
                "190px",

              borderRadius:
                "50%",

              right:
                "-60px",

              top:
                "-115px",

              border:
                "30px solid rgba(255,255,255,0.045)",

              pointerEvents:
                "none"

            }}

          />


          {/* PURPLE ACCENT CIRCLE */}

          <div

            style={{

              position:
                "absolute",

              width:
                "100px",

              height:
                "100px",

              borderRadius:
                "50%",

              right:
                "125px",

              bottom:
                "-72px",

              background:
                "rgba(139,92,246,0.18)",

              pointerEvents:
                "none"

            }}

          />


          <div

            style={{

              position:
                "relative",

              zIndex: 1,

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "space-between",

              gap:
                "20px"

            }}

          >


            {/* LEFT HEADER */}

            <div

              style={{

                display:
                  "flex",

                alignItems:
                  "center",

                gap:
                  "14px"

              }}

            >


              {/* SKILL ICON */}

              <div

                style={{

                  width:
                    "48px",

                  height:
                    "48px",

                  borderRadius:
                    "15px",

                  flexShrink: 0,

                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  background:
                    "rgba(139,92,246,0.15)",

                  border:
                    "1px solid rgba(196,181,253,0.28)",

                  color:
                    "#C4B5FD",

                  fontSize:
                    "23px",

                  fontWeight:
                    900

                }}

              >
                ✦
              </div>


              <div>

                <div

                  style={{

                    color:
                      "#C4B5FD",

                    fontSize:
                      "9px",

                    fontWeight:
                      900,

                    letterSpacing:
                      "1.5px",

                    textTransform:
                      "uppercase"

                  }}

                >
                  CAPABILITY REGISTRY
                </div>


                <h2

                  style={{

                    margin:
                      "5px 0 0",

                    color:
                      "#FFFFFF",

                    fontSize:
                      "21px",

                    fontWeight:
                      850,

                    letterSpacing:
                      "-0.3px"

                  }}

                >
                  Add Skill
                </h2>


                <p

                  style={{

                    margin:
                      "5px 0 0",

                    color:
                      "#CBD5E1",

                    fontSize:
                      "10px",

                    lineHeight:
                      1.5

                  }}

                >
                  Record a capability, learning experience or certified skill.
                </p>

              </div>

            </div>


            {/* CLOSE BUTTON */}

            <button

              type="button"

              onClick={
                onClose
              }

              style={{

                width:
                  "36px",

                height:
                  "36px",

                borderRadius:
                  "11px",

                border:
                  "1px solid rgba(255,255,255,0.16)",

                background:
                  "rgba(255,255,255,0.08)",

                color:
                  "#FFFFFF",

                fontSize:
                  "18px",

                cursor:
                  "pointer",

                flexShrink: 0

              }}

            >
              ×
            </button>

          </div>

        </div>


        {/* ==========================================
            FORM BODY
           ========================================== */}

        <div

          style={{

            padding:
              "22px 26px 24px",

            background:
              "linear-gradient(180deg, #FFFFFF 0%, #FCFCFD 100%)"

          }}

        >


          {/* FORM INTRO */}

          <div

            style={{

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "space-between",

              gap:
                "15px",

              marginBottom:
                "17px"

            }}

          >

            <div>

              <div

                style={{

                  color:
                    "#0F172A",

                  fontSize:
                    "13px",

                  fontWeight:
                    850

                }}

              >
                Skill Details
              </div>


              <div

                style={{

                  color:
                    "#94A3B8",

                  fontSize:
                    "10px",

                  marginTop:
                    "3px"

                }}

              >
                Capture what you learned and attach supporting credentials.
              </div>

            </div>


            <div

              style={{

                display:
                  "inline-flex",

                alignItems:
                  "center",

                gap:
                  "6px",

                padding:
                  "6px 9px",

                borderRadius:
                  "999px",

                background:
                  "#F5F3FF",

                border:
                  "1px solid #DDD6FE",

                color:
                  "#7C3AED",

                fontSize:
                  "8px",

                fontWeight:
                  900,

                textTransform:
                  "uppercase",

                whiteSpace:
                  "nowrap"

              }}

            >

              <span

                style={{

                  width:
                    "6px",

                  height:
                    "6px",

                  borderRadius:
                    "50%",

                  background:
                    "#8B5CF6"

                }}

              />

              New Capability

            </div>

          </div>


          {/* ==========================================
              SKILL + ORGANIZATION
             ========================================== */}

          <div

            style={{

              display:
                "grid",

              gridTemplateColumns:
                "minmax(0, 1fr) minmax(0, 1fr)",

              gap:
                "13px"

            }}

          >


            <div>

              <label
                style={
                  labelStyle
                }
              >
                Skill Name
              </label>


              <input

                placeholder="Example: Public Speaking"

                value={
                  skillName
                }

                onChange={(e) =>
                  setSkillName(
                    e.target.value
                  )
                }

                style={
                  inputStyle
                }

              />

            </div>


            <div>

              <label
                style={
                  labelStyle
                }
              >
                Organization
              </label>


              <input

                placeholder="School, academy, institute..."

                value={
                  organization
                }

                onChange={(e) =>
                  setOrganization(
                    e.target.value
                  )
                }

                style={
                  inputStyle
                }

              />

            </div>

          </div>


          {/* ==========================================
              CERTIFICATE DATE
             ========================================== */}

          <div

            style={{

              marginTop:
                "14px",

              maxWidth:
                "340px"

            }}

          >

            <label
              style={
                labelStyle
              }
            >
              Certificate / Completion Date
            </label>


            <input

              type="date"

              value={
                certificateDate
              }

              onChange={(e) =>
                setCertificateDate(
                  e.target.value
                )
              }

              style={
                inputStyle
              }

            />

          </div>


          {/* ==========================================
              DESCRIPTION
             ========================================== */}

          <div

            style={{

              marginTop:
                "14px"

            }}

          >

            <label
              style={
                labelStyle
              }
            >
              Skill Description
            </label>


            <textarea

              rows={3}

              placeholder="Describe the skill, where you learned it, what you practiced and what capability you developed..."

              value={
                description
              }

              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }

              style={{

                width:
                  "100%",

                boxSizing:
                  "border-box",

                minHeight:
                  "82px",

                border:
                  "1px solid #CBD5E1",

                borderRadius:
                  "11px",

                padding:
                  "11px 13px",

                background:
                  "#FFFFFF",

                color:
                  "#0F172A",

                fontSize:
                  "12px",

                fontFamily:
                  "inherit",

                lineHeight:
                  1.5,

                resize:
                  "vertical",

                outline:
                  "none"

              }}

            />

          </div>


          {/* ==========================================
              CERTIFICATE UPLOAD
             ========================================== */}

          <div

            style={{

              position:
                "relative",

              overflow:
                "hidden",

              marginTop:
                "16px",

              border:
                file
                  ? "1px solid #C4B5FD"
                  : "1px dashed #CBD5E1",

              borderRadius:
                "16px",

              background:
                file
                  ? "#F5F3FF"
                  : "#F8FAFC",

              padding:
                "15px 16px"

            }}

          >


            {/* DECORATIVE CIRCLE */}

            <div

              style={{

                position:
                  "absolute",

                width:
                  "90px",

                height:
                  "90px",

                borderRadius:
                  "50%",

                right:
                  "-35px",

                top:
                  "-45px",

                background:
                  "rgba(139,92,246,0.06)",

                pointerEvents:
                  "none"

              }}

            />


            <div

              style={{

                position:
                  "relative",

                zIndex: 1,

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "space-between",

                gap:
                  "20px"

              }}

            >


              {/* LEFT */}

              <div

                style={{

                  display:
                    "flex",

                  alignItems:
                    "center",

                  gap:
                    "11px",

                  minWidth: 0

                }}

              >


                <div

                  style={{

                    width:
                      "39px",

                    height:
                      "39px",

                    borderRadius:
                      "12px",

                    flexShrink: 0,

                    background:
                      "#F5F3FF",

                    border:
                      "1px solid #DDD6FE",

                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center",

                    color:
                      "#7C3AED",

                    fontSize:
                      "18px",

                    fontWeight:
                      900

                  }}

                >
                  ◈
                </div>


                <div
                  style={{
                    minWidth: 0
                  }}
                >

                  <div

                    style={{

                      color:
                        "#0F172A",

                      fontSize:
                        "11px",

                      fontWeight:
                        850

                    }}

                  >
                    Certificate Evidence
                  </div>


                  <div

                    style={{

                      marginTop:
                        "3px",

                      color:
                        file
                          ? "#7C3AED"
                          : "#64748B",

                      fontSize:
                        "9px",

                      whiteSpace:
                        "nowrap",

                      overflow:
                        "hidden",

                      textOverflow:
                        "ellipsis",

                      maxWidth:
                        "330px"

                    }}

                  >

                    {file
                      ? file.name
                      : "Upload an image of your certificate or credential"}

                  </div>

                </div>

              </div>


              {/* SELECT FILE */}

              <label

                style={{

                  height:
                    "34px",

                  padding:
                    "0 12px",

                  borderRadius:
                    "9px",

                  border:
                    "1px solid #DDD6FE",

                  background:
                    "#FFFFFF",

                  color:
                    "#7C3AED",

                  fontSize:
                    "9px",

                  fontWeight:
                    900,

                  cursor:
                    "pointer",

                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  whiteSpace:
                    "nowrap"

                }}

              >

                {file
                  ? "CHANGE IMAGE"
                  : "SELECT IMAGE"}


                <input

                  type="file"

                  accept="image/*"

                  onChange={(e) =>
                    setFile(
                      e.target.files?.[0] ||
                        null
                    )
                  }

                  style={{
                    display:
                      "none"
                  }}

                />

              </label>

            </div>

          </div>


          {/* ==========================================
              CAPABILITY INFO
             ========================================== */}

          <div

            style={{

              marginTop:
                "14px",

              padding:
                "11px 13px",

              borderRadius:
                "12px",

              border:
                "1px solid #DDD6FE",

              background:
                "#FAF9FF",

              display:
                "flex",

              alignItems:
                "center",

              gap:
                "10px"

            }}

          >

            <div

              style={{

                width:
                  "28px",

                height:
                  "28px",

                borderRadius:
                  "9px",

                flexShrink: 0,

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                background:
                  "#F5F3FF",

                color:
                  "#7C3AED",

                fontSize:
                  "13px",

                fontWeight:
                  900

              }}

            >
              ✦
            </div>


            <div>

              <div

                style={{

                  color:
                    "#334155",

                  fontSize:
                    "9px",

                  fontWeight:
                    850

                }}

              >
                This skill becomes part of your Capability Ledger
              </div>


              <div

                style={{

                  color:
                    "#64748B",

                  fontSize:
                    "9px",

                  marginTop:
                    "2px",

                  lineHeight:
                    1.45

                }}

              >
                Your organization, completion date, description and certificate remain attached to this skill record.
              </div>

            </div>

          </div>


          {/* ==========================================
              FOOTER ACTIONS
             ========================================== */}

          <div

            style={{

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "space-between",

              gap:
                "16px",

              paddingTop:
                "18px",

              marginTop:
                "18px",

              borderTop:
                "1px solid #E2E8F0"

            }}

          >

            <div

              style={{

                color:
                  "#94A3B8",

                fontSize:
                  "9px",

                lineHeight:
                  1.5

              }}

            >
              Build a growing record of capabilities beyond academic performance.
            </div>


            <div

              style={{

                display:
                  "flex",

                alignItems:
                  "center",

                gap:
                  "8px",

                flexShrink: 0

              }}

            >


              <button

                type="button"

                onClick={
                  onClose
                }

                disabled={
                  loading
                }

                style={{

                  height:
                    "39px",

                  padding:
                    "0 15px",

                  borderRadius:
                    "10px",

                  border:
                    "1px solid #CBD5E1",

                  background:
                    "#FFFFFF",

                  color:
                    "#475569",

                  fontSize:
                    "10px",

                  fontWeight:
                    850,

                  cursor:
                    loading
                      ? "default"
                      : "pointer"

                }}

              >
                CANCEL
              </button>


              <button

                type="button"

                onClick={
                  handleSave
                }

                disabled={
                  loading
                }

                style={{

                  minWidth:
                    "125px",

                  height:
                    "39px",

                  padding:
                    "0 17px",

                  borderRadius:
                    "10px",

                  border:
                    "1px solid #7C3AED",

                  background:
                    loading
                      ? "#C4B5FD"
                      : "#7C3AED",

                  color:
                    "#FFFFFF",

                  fontSize:
                    "10px",

                  fontWeight:
                    900,

                  letterSpacing:
                    "0.3px",

                  cursor:
                    loading
                      ? "default"
                      : "pointer",

                  boxShadow:
                    loading
                      ? "none"
                      : "0 6px 15px rgba(124,58,237,0.18)"

                }}

              >

                {loading
                  ? "SAVING..."
                  : "SAVE SKILL"}

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

const portfolioResponsiveStyles = `
  /* =========================================================
     PORTFOLIO RESPONSIVE SYSTEM

     DESKTOP > 1024px:
     COMPLETELY UNTOUCHED.

     TABLET + MOBILE ONLY.
  ========================================================= */


  /* =========================================================
     TABLET
     <= 1024px
  ========================================================= */

  @media (max-width: 1024px) {

    .portfolio-responsive-page {
      width: 100% !important;
      max-width: 100% !important;
      min-width: 0;
      padding: 18px !important;
      box-sizing: border-box;
      overflow-x: hidden;
    }

    .portfolio-responsive-page * {
      box-sizing: border-box;
    }

    .portfolio-responsive-page img,
    .portfolio-responsive-page video {
      max-width: 100%;
    }


    /* =========================
       HERO
    ========================= */

    .portfolio-responsive-page > div:first-child {
      min-height: 0 !important;
      padding: 26px 28px !important;
      border-radius: 23px !important;
      gap: 24px;
    }

    .portfolio-responsive-page
      > div:first-child
      > div:nth-last-child(2)
      > div:first-child {
      font-size: 12px !important;
      letter-spacing: 2px !important;
    }

    .portfolio-responsive-page > div:first-child h1 {
      font-size: 34px !important;
      line-height: 1.08 !important;
      letter-spacing: -0.7px !important;
    }

    .portfolio-responsive-page > div:first-child p {
      font-size: 15px !important;
      line-height: 1.5 !important;
    }

    .portfolio-responsive-page
      > div:first-child
      > div:last-child {
      width: 104px !important;
      height: 104px !important;
      border-radius: 25px !important;
    }


    /* =========================
       CREDIT SUMMARY
    ========================= */

    .portfolio-responsive-page > div:nth-child(2) {
      padding: 20px !important;
      border-radius: 21px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(2)
      > div:first-child
      > div:first-child
      > div:first-child {
      font-size: 11px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(2) h2 {
      font-size: 23px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(2) p {
      font-size: 14px !important;
      line-height: 1.45 !important;
    }

    .portfolio-responsive-page
      > div:nth-child(2)
      > div:last-child {
      grid-template-columns:
        repeat(2, minmax(0, 1fr)) !important;
      gap: 11px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(2)
      > div:last-child
      > div {
      min-height: 110px !important;
      padding: 15px !important;
      border-radius: 15px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(2)
      > div:last-child
      > div
      > div:last-child
      > div:first-child {
      font-size: 11px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(2)
      > div:last-child
      > div
      > div:last-child
      > div:nth-child(2) {
      font-size: 32px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(2)
      > div:last-child
      > div
      > div:last-child
      > div:nth-child(3) {
      font-size: 12px !important;
    }


    /* =========================
       MAIN LEDGER
    ========================= */

    .portfolio-responsive-page > div:nth-child(3) {
      border-radius: 22px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(3)
      > div {
      padding: 18px !important;
    }


    /* =========================
       EXPLORER
    ========================= */

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child {
      padding: 16px !important;
      border-radius: 17px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child
      > div:nth-last-child(2) {
      gap: 15px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child button {
      min-width: 0 !important;
    }

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child h3 {
      font-size: 19px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child p {
      font-size: 13px !important;
    }


    /* =========================
       PERFORMANCE / PROJECT /
       SKILL COLLECTION GRIDS
    ========================= */

    .portfolio-responsive-page
      [style*="minmax(360px"] {
      grid-template-columns:
        repeat(2, minmax(0, 1fr)) !important;
    }

  }


  /* =========================================================
     MOBILE
     <= 768px
  ========================================================= */

  @media (max-width: 768px) {

    .portfolio-responsive-page {
      width: 100% !important;
      max-width: 100% !important;
      padding: 0 !important;
      overflow-x: hidden !important;
    }


    /* =====================================================
       HERO
    ===================================================== */

    .portfolio-responsive-page > div:first-child {
      min-height: 0 !important;
      padding: 19px !important;
      margin-bottom: 12px !important;
      border-radius: 18px !important;
      align-items: flex-start !important;
      gap: 12px !important;
    }

    .portfolio-responsive-page
      > div:first-child
      > div:nth-last-child(2) {
      max-width: calc(100% - 70px) !important;
    }


    /* HERO EYEBROW */

    .portfolio-responsive-page
      > div:first-child
      > div:nth-last-child(2)
      > div:first-child {
      margin-bottom: 8px !important;
      font-size: 10px !important;
      letter-spacing: 1.7px !important;
      line-height: 1.3 !important;
    }


    /* HERO TITLE */

    .portfolio-responsive-page > div:first-child h1 {
      font-size: 25px !important;
      line-height: 1.12 !important;
      letter-spacing: -0.45px !important;
    }


    /* HERO DESCRIPTION */

    .portfolio-responsive-page > div:first-child p {
      margin-top: 9px !important;
      max-width: 100% !important;
      font-size: 13px !important;
      line-height: 1.45 !important;
    }


    /* HERO ICON */

    .portfolio-responsive-page
      > div:first-child
      > div:last-child {
      width: 56px !important;
      height: 56px !important;
      border-radius: 15px !important;
    }

    .portfolio-responsive-page
      > div:first-child
      > div:last-child
      > div
      > div:first-child {
      font-size: 25px !important;
    }

    .portfolio-responsive-page
      > div:first-child
      > div:last-child
      > div
      > div:last-child {
      display: none;
    }


    /* Decorative circles */

    .portfolio-responsive-page
      > div:first-child
      > div:nth-child(1) {
      width: 180px !important;
      height: 180px !important;
      right: -80px !important;
      top: -105px !important;
    }

    .portfolio-responsive-page
      > div:first-child
      > div:nth-child(2) {
      width: 120px !important;
      height: 120px !important;
      right: 40px !important;
      bottom: -90px !important;
    }

    .portfolio-responsive-page
      > div:first-child
      > div:nth-child(3) {
      width: 60px !important;
      height: 60px !important;
      right: 32px !important;
      top: 12px !important;
    }


    /* =====================================================
       CREDIT SUMMARY
    ===================================================== */

    .portfolio-responsive-page > div:nth-child(2) {
      padding: 16px !important;
      margin-bottom: 12px !important;
      border-radius: 17px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(2)
      > div:first-child {
      align-items: flex-start !important;
      gap: 8px !important;
      margin-bottom: 14px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(2)
      > div:first-child
      > div:last-child {
      display: none;
    }


    /* PORTFOLIO INTELLIGENCE */

    .portfolio-responsive-page
      > div:nth-child(2)
      > div:first-child
      > div:first-child
      > div:first-child {
      font-size: 10px !important;
      letter-spacing: 1.5px !important;
      margin-bottom: 7px !important;
    }


    /* CREDIT SUMMARY TITLE */

    .portfolio-responsive-page
      > div:nth-child(2) h2 {
      font-size: 20px !important;
      line-height: 1.2 !important;
    }


    /* CREDIT SUMMARY DESCRIPTION */

    .portfolio-responsive-page
      > div:nth-child(2) p {
      margin-top: 6px !important;
      font-size: 12px !important;
      line-height: 1.45 !important;
    }


    /* 2 × 2 credit grid */

    .portfolio-responsive-page
      > div:nth-child(2)
      > div:last-child {
      grid-template-columns:
        repeat(2, minmax(0, 1fr)) !important;
      gap: 8px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(2)
      > div:last-child
      > div {
      min-width: 0;
      min-height: 98px !important;
      padding: 12px !important;
      border-radius: 13px !important;
    }


    /* CREDIT LABEL */

    .portfolio-responsive-page
      > div:nth-child(2)
      > div:last-child
      > div
      > div:last-child
      > div:first-child {
      font-size: 9px !important;
      letter-spacing: 0.45px !important;
      line-height: 1.25 !important;
    }


    /* CREDIT NUMBER */

    .portfolio-responsive-page
      > div:nth-child(2)
      > div:last-child
      > div
      > div:last-child
      > div:nth-child(2) {
      margin-top: 8px !important;
      font-size: 27px !important;
    }


    /* CREDIT DESCRIPTION */

    .portfolio-responsive-page
      > div:nth-child(2)
      > div:last-child
      > div
      > div:last-child
      > div:nth-child(3) {
      margin-top: 7px !important;
      font-size: 10px !important;
      line-height: 1.3 !important;
    }


    /* =====================================================
       MAIN PORTFOLIO LEDGER
    ===================================================== */

    .portfolio-responsive-page > div:nth-child(3) {
      border-radius: 17px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(3)
      > div {
      padding: 11px !important;
    }


    /* =====================================================
       PORTFOLIO SECTION EXPLORER
    ===================================================== */

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child {
      padding: 14px !important;
      margin-bottom: 12px !important;
      border-radius: 15px !important;
    }


    /* Explorer top area */

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child
      > div:nth-last-child(2) {
      display: block !important;
    }

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child
      > div:nth-last-child(2)
      > div:first-child {
      min-width: 0 !important;
      width: 100% !important;
    }


    /* ACTIVE SHOWCASE DESK */

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child
      > div:nth-last-child(2)
      > div:first-child
      > div:first-child {
      padding: 5px 9px !important;
      margin-bottom: 7px !important;
      font-size: 9px !important;
      letter-spacing: .8px !important;
    }


    /* Explorer title */

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child h3 {
      font-size: 19px !important;
      line-height: 1.2 !important;
    }


    /* Explorer description */

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child p {
      margin-top: 6px !important;
      font-size: 12px !important;
      line-height: 1.4 !important;
    }


    /* =====================================================
       EXPLORER SECTION TABS
    ===================================================== */

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child
      > div:nth-last-child(2)
      > div:last-child {
      width: 100% !important;
      margin-top: 12px !important;
      display: grid !important;
      grid-template-columns:
        repeat(3, minmax(0, 1fr)) !important;
      gap: 5px !important;
      padding: 5px !important;
      border-radius: 12px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child
      > div:nth-last-child(2)
      > div:last-child
      > button {
      width: 100% !important;
      min-width: 0 !important;
      height: 40px !important;
      padding: 0 6px !important;
      border-radius: 9px !important;
      gap: 5px !important;
      font-size: 10px !important;
      white-space: nowrap !important;
    }


    /* Selector icons */

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child
      > div:nth-last-child(2)
      > div:last-child
      > button
      > span {
      width: 22px !important;
      height: 22px !important;
      min-width: 22px !important;
      border-radius: 7px !important;
      font-size: 10px !important;
    }


    /* =====================================================
       THREE LEDGER STATUS CARDS
    ===================================================== */

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child
      > div:last-child {
      margin-top: 11px !important;
      grid-template-columns:
        repeat(3, minmax(0, 1fr)) !important;
      gap: 6px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child
      > div:last-child
      > div {
      min-width: 0 !important;
      padding: 9px !important;
      border-radius: 10px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child
      > div:last-child
      > div
      > div {
      gap: 5px !important;
    }


    /* Ledger label */

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child
      > div:last-child
      > div
      > div
      > div:first-child
      > div:first-child {
      font-size: 7.5px !important;
      letter-spacing: .3px !important;
      line-height: 1.2 !important;
    }


    /* Ledger record count */

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child
      > div:last-child
      > div
      > div
      > div:first-child
      > div:last-child {
      margin-top: 4px !important;
      font-size: 10px !important;
      line-height: 1.2 !important;
    }


    /* Ledger number */

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child
      > div:last-child
      > div
      > div
      > div:last-child {
      min-width: 30px !important;
      width: 30px !important;
      height: 30px !important;
      padding: 0 !important;
      border-radius: 8px !important;
      font-size: 13px !important;
      flex-shrink: 0 !important;
    }


    /* =====================================================
       DRAWER / LIVE PERFORMANCE SECTION
    ===================================================== */

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:not(:first-child) {
      max-width: 100%;
      min-width: 0;
    }

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:not(:first-child)
      > div {
      max-width: 100%;
      min-width: 0;
      border-radius: 14px !important;
    }


    /* Drawer padding */

    .portfolio-responsive-page
      [style*='padding: "22px 24px"'] {
      padding: 16px !important;
    }

    .portfolio-responsive-page
      [style*='padding: "20px 22px 22px"'] {
      padding: 14px !important;
    }


    /* =====================================================
       COLLECTION GRIDS
    ===================================================== */

    .portfolio-responsive-page
      [style*="minmax(360px"] {
      width: 100% !important;
      grid-template-columns:
        minmax(0, 1fr) !important;
      gap: 10px !important;
    }

    .portfolio-responsive-page
      [style*='minHeight: "285px"'],
    .portfolio-responsive-page
      [style*='minHeight: "270px"'] {
      min-width: 0 !important;
      max-width: 100% !important;
    }


    /* =====================================================
       PERFORMANCE SHOWCASE EMPTY STATE
    ===================================================== */

    .portfolio-responsive-page
      [style*='borderStyle: "dashed"'] {
      max-width: 100% !important;
      padding-left: 18px !important;
      padding-right: 18px !important;
    }


    /* =====================================================
       TEXT SAFETY
    ===================================================== */

    .portfolio-responsive-page h1,
    .portfolio-responsive-page h2,
    .portfolio-responsive-page h3,
    .portfolio-responsive-page p,
    .portfolio-responsive-page span,
    .portfolio-responsive-page strong {
      max-width: 100%;
      overflow-wrap: break-word;
    }


    /* =====================================================
       VIDEO
    ===================================================== */

    .portfolio-responsive-page video {
      width: 100% !important;
      max-width: 100% !important;
      border-radius: 12px !important;
    }


    /* =====================================================
       MODALS
    ===================================================== */

    .portfolio-responsive-page
      [style*='position: "fixed"'] {
      max-width: none !important;
    }

    .portfolio-responsive-page
      [style*='position: "fixed"']
      input,
    .portfolio-responsive-page
      [style*='position: "fixed"']
      select,
    .portfolio-responsive-page
      [style*='position: "fixed"']
      textarea {
      max-width: 100%;
      box-sizing: border-box;
    }

  }


  /* =========================================================
     PHONE
     <= 520px

     IMPORTANT:
     We no longer shrink the typography aggressively.
     The 768px typography remains the visual baseline.
  ========================================================= */

  @media (max-width: 520px) {

    .portfolio-responsive-page > div:first-child {
      padding: 17px !important;
      border-radius: 16px !important;
    }

    .portfolio-responsive-page > div:first-child h1 {
      font-size: 23px !important;
    }

    .portfolio-responsive-page > div:first-child p {
      font-size: 12px !important;
    }

    .portfolio-responsive-page
      > div:first-child
      > div:nth-last-child(2)
      > div:first-child {
      font-size: 9px !important;
    }


    /* CREDIT */

    .portfolio-responsive-page > div:nth-child(2) {
      padding: 14px !important;
      border-radius: 15px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(2) h2 {
      font-size: 19px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(2) p {
      font-size: 11px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(2)
      > div:last-child
      > div {
      min-height: 94px !important;
      padding: 11px !important;
    }


    /* MAIN LEDGER */

    .portfolio-responsive-page
      > div:nth-child(3)
      > div {
      padding: 10px !important;
    }


    /* EXPLORER */

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child {
      padding: 12px !important;
      margin-bottom: 10px !important;
      border-radius: 13px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child h3 {
      font-size: 18px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child p {
      font-size: 11px !important;
    }


    /* Tabs */

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child
      > div:nth-last-child(2)
      > div:last-child {
      margin-top: 10px !important;
      gap: 4px !important;
      padding: 4px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child
      > div:nth-last-child(2)
      > div:last-child
      > button {
      height: 38px !important;
      padding: 0 4px !important;
      font-size: 9px !important;
      gap: 4px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child
      > div:nth-last-child(2)
      > div:last-child
      > button
      > span {
      width: 20px !important;
      height: 20px !important;
      min-width: 20px !important;
      font-size: 9px !important;
    }


    /* Ledger cards */

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child
      > div:last-child {
      margin-top: 10px !important;
      gap: 5px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child
      > div:last-child
      > div {
      padding: 8px !important;
    }


    /* DRAWER CARDS */

    .portfolio-responsive-page
      [style*='borderRadius: "20px"'] {
      max-width: 100%;
    }


    /* Empty showcase */

    .portfolio-responsive-page
      [style*='borderStyle: "dashed"'] {
      padding: 22px 16px !important;
    }


    /* Modal overlays */

    .portfolio-responsive-page
      [style*='position: "fixed"'][style*='inset: 0'] {
      padding: 12px !important;
    }

  }


  /* =========================================================
     390 / 400px PHONE
     <= 420px
  ========================================================= */

  @media (max-width: 420px) {

    /* HERO */

    .portfolio-responsive-page > div:first-child {
      padding: 15px !important;
      margin-bottom: 9px !important;
      border-radius: 15px !important;
    }

    .portfolio-responsive-page
      > div:first-child
      > div:nth-last-child(2) {
      max-width: calc(100% - 56px) !important;
    }

    .portfolio-responsive-page
      > div:first-child
      > div:nth-last-child(2)
      > div:first-child {
      font-size: 8.5px !important;
      letter-spacing: 1.3px !important;
    }

    .portfolio-responsive-page > div:first-child h1 {
      font-size: 22px !important;
      line-height: 1.12 !important;
    }

    .portfolio-responsive-page > div:first-child p {
      margin-top: 7px !important;
      font-size: 11px !important;
      line-height: 1.4 !important;
    }

    .portfolio-responsive-page
      > div:first-child
      > div:last-child {
      width: 48px !important;
      height: 48px !important;
      border-radius: 13px !important;
    }


    /* CREDIT */

    .portfolio-responsive-page > div:nth-child(2) {
      padding: 12px !important;
      margin-bottom: 9px !important;
      border-radius: 14px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(2)
      > div:first-child
      > div:first-child
      > div:first-child {
      font-size: 9px !important;
      letter-spacing: 1.2px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(2) h2 {
      font-size: 18px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(2) p {
      font-size: 10.5px !important;
      line-height: 1.4 !important;
    }

    .portfolio-responsive-page
      > div:nth-child(2)
      > div:last-child {
      gap: 6px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(2)
      > div:last-child
      > div {
      min-height: 90px !important;
      padding: 10px !important;
      border-radius: 11px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(2)
      > div:last-child
      > div
      > div:last-child
      > div:first-child {
      font-size: 8.5px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(2)
      > div:last-child
      > div
      > div:last-child
      > div:nth-child(2) {
      margin-top: 7px !important;
      font-size: 25px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(2)
      > div:last-child
      > div
      > div:last-child
      > div:nth-child(3) {
      margin-top: 6px !important;
      font-size: 9px !important;
      line-height: 1.3 !important;
    }


    /* EXPLORER */

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child {
      padding: 11px !important;
      border-radius: 12px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child
      > div:nth-last-child(2)
      > div:first-child
      > div:first-child {
      padding: 4px 7px !important;
      font-size: 8px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child h3 {
      font-size: 17px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child p {
      font-size: 10px !important;
    }


    /* TABS */

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child
      > div:nth-last-child(2)
      > div:last-child
      > button {
      height: 37px !important;
      padding: 0 3px !important;
      font-size: 8.5px !important;
      gap: 3px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child
      > div:nth-last-child(2)
      > div:last-child
      > button
      > span {
      width: 19px !important;
      height: 19px !important;
      min-width: 19px !important;
      font-size: 9px !important;
    }


    /* STATUS CARDS */

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child
      > div:last-child {
      gap: 5px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child
      > div:last-child
      > div {
      padding: 7px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child
      > div:last-child
      > div
      > div
      > div:first-child
      > div:first-child {
      font-size: 7px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child
      > div:last-child
      > div
      > div
      > div:first-child
      > div:last-child {
      font-size: 9px !important;
    }

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child
      > div:last-child
      > div
      > div
      > div:last-child {
      min-width: 28px !important;
      width: 28px !important;
      height: 28px !important;
      font-size: 12px !important;
    }


    /* EMPTY PERFORMANCE SHOWCASE */

    .portfolio-responsive-page
      [style*='borderStyle: "dashed"'] {
      padding: 20px 14px !important;
    }


    /* MODALS */

    .portfolio-responsive-page
      [style*='position: "fixed"'][style*='inset: 0'] {
      padding: 9px !important;
    }

  }


  /* =========================================================
     VERY SMALL PHONE
     <= 360px
  ========================================================= */

  @media (max-width: 360px) {

    .portfolio-responsive-page > div:first-child h1 {
      font-size: 20px !important;
    }

    .portfolio-responsive-page > div:first-child p {
      font-size: 10.5px !important;
    }


    /* Hide tab icons only when width becomes genuinely tight */

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child
      > div:nth-last-child(2)
      > div:last-child
      > button
      > span {
      display: none !important;
    }


    /* Stack ledger summaries only on very narrow phones */

    .portfolio-responsive-page
      > div:nth-child(3)
      > div
      > div:first-child
      > div:last-child {
      grid-template-columns: 1fr !important;
    }

  }
`;
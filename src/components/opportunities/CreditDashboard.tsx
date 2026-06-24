
import { useEffect, useState } from "react";

import {
  getSupabaseClient
} from "../../supabaseClient";

import {
  getStudentAchievements
} from "../../data/timelineRepository";

import {
  getStudentPerformances,
  getStudentProjects,
  getStudentSkills
} from "../../data/studentRepository";

import {
  calculateCompetitionCredits,
  calculateAchievementCredits,
  calculatePortfolioCredits
} from "../../data/creditEngine";

export default function CreditDashboard() {

const [competitionCredits,
  setCompetitionCredits] =
  useState(0);

const [achievementCredits,
  setAchievementCredits] =
  useState(0);

const [portfolioCredits,
  setPortfolioCredits] =
  useState(0);

const [totalCredits,
  setTotalCredits] =
  useState(0);

  useEffect(() => {
  loadCredits();
}, []);

async function loadCredits() {

  const profile =
    JSON.parse(
      localStorage.getItem(
        "studentProfile"
      ) || "{}"
    );

  const studentId =
    profile?.id;

  if (!studentId)
    return;

  const supabase =
    getSupabaseClient();

  if (!supabase)
    return;

  const {
    data: submissions
  } = await supabase
    .from("submissions")
    .select("*")
    .eq(
      "student_id",
      studentId
    );

  const achievements =
    await getStudentAchievements(
      studentId
    );

  const performances =
    await getStudentPerformances(
      studentId
    );

  const projects =
    await getStudentProjects(
      studentId
    );

  const skills =
    await getStudentSkills(
      studentId
    );

  const verifiedCount =
    achievements.filter(
      (a: any) =>
        a.verification_status ===
        "Verified"
    ).length;

  const competition =
    calculateCompetitionCredits(
      submissions?.length || 0
    );

  const timeline =
    calculateAchievementCredits(
      achievements.length,
      verifiedCount
    );

  const portfolio =
    calculatePortfolioCredits(
      performances.length,
      projects.length,
      skills.length
    );

  setCompetitionCredits(
    competition
  );

  setAchievementCredits(
    timeline
  );

  setPortfolioCredits(
    portfolio
  );

  setTotalCredits(
    competition +
      timeline +
      portfolio
  );
}

  const [creditView, setCreditView] =
    useState<
      "guidelines" | "rewards"
    >("guidelines");

  return (
 <div
  style={{
    background: "#f8f7f4",
    color: "#0F172A",
    borderRadius: 32,
    padding: 40,
    minHeight: "1100px",
    border: "1px solid #E2E8F0"
  }}
>
    {/* HEADER */}

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 30
      }}
    >
      <div>
        <div
          style={{
            color: "#FF8A00",
            fontSize: 22,
            letterSpacing: 2,
            fontWeight: 700,
            marginBottom: 8
          }}
        >
          YOUR OPPORTUNITIES ARE IN YOUR HAND 

        </div>

        <h2
          style={{
            margin: 0,
            fontSize: 40,
            fontWeight: 500
          }}
        >
          Earn Credits and Learn From The Best  🚀
        </h2>
      </div>
    </div>

    {/* CREDIT SUMMARY */}

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(3,1fr)",
        gap: 20,
        marginBottom: 24
      }}
    >
      <div
        style={{
          background: "#FFF8EC",
          border: "1px solid #5E2D00",
          borderRadius: 18,
          padding: 24
        }}
      >
        <div>Total Earned Credits</div>

        <h1
          style={{
            marginTop: 12
    
          }}
        >
          {totalCredits}
        </h1>
      </div>

      <div
        style={{
          background: "#EEF4FF",
          border: "1px solid #5E2D00",
          borderRadius: 18,
          padding: 24
        }}
      >
        <div>Spent Credits</div>

        <h1
          style={{
            marginTop: 12
          }}
        >
          0
        </h1>
      </div>

      <div
        style={{
          background: "#E8F5EE",
          border: "1px solid #5E2D00",
          borderRadius: 18,
          padding: 24
        }}
      >
        <div>
          Available Balance
        </div>

        <h1
          style={{
            marginTop: 12
          }}
        >
          {totalCredits}
        </h1>
      </div>
    </div>

    {/* BREAKDOWN */}

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(3,1fr)",
        gap: 20,
        marginBottom: 30
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
border: "1px solid #5E2D00",
          borderRadius: 18,
          padding: 20
        }}
      >
        <div
          style={{
            color: "#0e131b"
          }}
        >
          Competition Credits
        </div>

        <h2>
          {competitionCredits}
        </h2>
      </div>

      <div
        style={{
          background: "#FFFFFF",
border: "1px solid #5E2D00",
          borderRadius: 18,
          padding: 20
        }}
      >
        <div
          style={{
            color: "#0e131b"
          }}
        >
          Achievement Credits
        </div>

        <h2>
          {achievementCredits}
        </h2>
      </div>

      <div
        style={{
          background: "#FFFFFF",
border: "1px solid #5E2D00",
          borderRadius: 18,
          padding: 20
        }}
      >
        <div
          style={{
            color: "#0e131b"
          }}
        >
          Portfolio Credits
        </div>

        <h2>
          {portfolioCredits}
        </h2>
      </div>
    </div>

    {/* TOGGLE */}

    <div
      style={{
        display: "flex",
        gap: 12,
        marginBottom: 24
      }}
    >
      <button
        onClick={() =>
          setCreditView(
            "guidelines"
          )
        }
        style={{
          background:
            creditView ===
            "guidelines"
              ? "#FF6B00"
              : "#16223D",
          color: "white",
          border: "none",
          padding:
            "12px 18px",
          borderRadius: 12,
          cursor: "pointer"
        }}
      >
        Credit Guidelines
      </button>

      <button
        onClick={() =>
          setCreditView(
            "rewards"
          )
        }
        style={{
          background:
            creditView ===
            "rewards"
              ? "#FF6B00"
              : "#16223D",
          color: "white",
          border: "none",
          padding:
            "12px 18px",
          borderRadius: 12,
          cursor: "pointer"
        }}
      >
        Rewards Marketplace
      </button>
    </div>

    {/* CONTENT */}

    <div
      style={{
        background: "#FFFFFF",
border: "1px solid #E2E8F0",
        borderRadius: 24,
        padding: 28
      }}
    >
      {creditView ===
      "guidelines" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 1fr",
            gap: 24
          }}
        >
          <div>
            <h3>
              📈 Ways To Earn Credits
            </h3>

            {[
              [
                "Competition Submission",
                "+10"
              ],
              [
                "Competition Winner",
                "+50"
              ],
              [
                "Achievement Added",
                "+10"
              ],
              [
                "Verified Achievement",
                "+10"
              ],
              [
                "Portfolio Upload",
                "+10"
              ]
            ].map(
              (item) => (
                <div
                  key={item[0]}
                  style={{
                    background:
                      "#F8FAFC",
                    padding: 16,
                    borderRadius: 14,
                    marginBottom: 12,
                    display:
                      "flex",
                    justifyContent:
                      "space-between"
                  }}
                >
                  <span>
                    {item[0]}
                  </span>

                  <strong>
                    {item[1]}
                  </strong>
                </div>
              )
            )}
          </div>

          <div>
            <h3>
              🎁 Ways To Spend Credits
            </h3>

            {[
              [
                "Expert Consultation",
                "-60"
              ],
              [
                "Partner Reach Out",
                "-80"
              ],
              [
                "Leadership Nomination",
                "-250"
              ],
              [
                "Principal Roundtable",
                "-300"
              ]
            ].map(
              (item) => (
                <div
                  key={item[0]}
                  style={{
                    background:
                      "#F8FAFC",
                    padding: 16,
                    borderRadius: 14,
                    marginBottom: 12,
                    display:
                      "flex",
                    justifyContent:
                      "space-between"
                  }}
                >
                  <span>
                    {item[0]}
                  </span>

                  <strong>
                    {item[1]}
                  </strong>
                </div>
              )
            )}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 14
          }}
        >
          {[
            [
              "Expert Consultation",
              "60 Credits"
            ],
            [
              "Partner Reach-Out",
              "80 Credits"
            ],
            [
              "Leadership Eligibility",
              "250 Credits"
            ],
            [
              "Principal Roundtable",
              "300 Credits"
            ]
          ].map(
            (item) => (
              <div
                key={item[0]}
                style={{
                  background:
                    "#F8FAFC",
                  padding: 20,
                  borderRadius: 14,
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center"
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight:
                        700
                    }}
                  >
                    {item[0]}
                  </div>

                  <div>
                    Cost:
                    {" "}
                    {item[1]}
                  </div>
                </div>

                <button
                  style={{
                    background:
                      "#FF6B00",
                    border: "none",
                    color:
                      "white",
                    padding:
                      "10px 18px",
                    borderRadius:
                      10
                  }}
                >
                  Redeem
                </button>
              </div>
            )
          )}
        </div>
      )}



      {/* CONSULTATION MARKETPLACE */}

      <div
        style={{
          background:
            "linear-gradient(135deg,#FFF7ED,#FFEDD5)",
          borderRadius: 24,
          padding: 24,
          marginBottom: 24
        }}
      >

        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#9A3412"
          }}
        >
          🎓 Consultation Marketplace
        </div>

        <div
          style={{
            marginTop: 12,
            color: "#7C2D12"
          }}
        >
          Coming Soon:
          Expert Mentors,
          Career Coaches,
          Scholarship Guidance,
          Personal Growth Advisors.
        </div>

      </div>
    </div>
  </div>
);
}


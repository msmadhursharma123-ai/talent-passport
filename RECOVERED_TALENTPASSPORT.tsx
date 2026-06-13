
import React, {
  useEffect,
  useState
} from "react";
import {
  calculateTalentDNA
} from "../data/talentDNAEngine";

import {
  getStudentAchievements
} from "../data/timelineRepository";
import {
  getSchoolBenchmarks
} from "../data/schoolBenchmarkEngine";

import {
  getPercentileData
} from "../data/passportAnalytics";
import { generatePassport } from "../data/passportEngine";
import {
  savePassport
} from "../data/passportRepository";
import {
  calculateRarity
} from "../data/rarityEngine";
import {
  getRecommendedCompetitions
} from "../data/competitionEngine";

import {
  getDNAConfidence,
  getStrongestSkill,
  getWeakestSkill,
  getFutureReadinessScore
} from "../data/dnaInsightsEngine";

export default function TalentPassport() {

const handleLogout = () => {
  localStorage.removeItem("studentProfile");
  localStorage.removeItem("student_id");
  localStorage.removeItem("studentCalibration");
  localStorage.removeItem("talentScores");

  window.location.reload();
};

const answers = JSON.parse(
  localStorage.getItem(
    "studentCalibration"
  ) || "{}"
);

const scores = JSON.parse(
  localStorage.getItem(
    "talentScores"
  ) || "{}"
);

const [
  passport,
  setPassport
] = useState<any>(null);

const [
  schoolBenchmarks,
  setSchoolBenchmarks
] = useState<any>(null);

const [
  percentileData,
  setPercentileData
] = useState<any>(null);

const [
  dnaScores,
  setDnaScores
] = useState<any>(null);

useEffect(() => {

  const storedPassport =
    localStorage.getItem(
      "studentPassport"
    );

  if (
    storedPassport
  ) {

    setPassport(
      JSON.parse(
        storedPassport
      )
    );

  }

}, []);

useEffect(() => {

  if (!passport)
    return;

  getSchoolBenchmarks(
    passport
  ).then(
    (
      data
    ) => {

      setSchoolBenchmarks(
        data
      );

    }
  );

}, [passport]);

useEffect(() => {

  if (!passport)
    return;

  getPercentileData(
    passport
  ).then(
    setPercentileData
  );

}, [passport]);

useEffect(() => {

  const loadDNA =
    async () => {

      const profile =
        JSON.parse(
          localStorage.getItem(
            "studentProfile"
          ) || "{}"
        );

      if (
        !profile?.id
      )
        return;

      const achievements =
        await getStudentAchievements(
          profile.id
        );

      const dna =
        calculateTalentDNA(
          achievements
        );

      setDnaScores(
        dna
      );
    };

  loadDNA();

}, []);

if (!passport) {

  return (
    <div
      style={{
        padding: 40
      }}
    >
      Loading Passport...
    </div>
  );
}

if (!dnaScores) {

  return (
    <div
      style={{
        padding: 40
      }}
    >
      Loading Talent DNA...
    </div>
  );
}

const recommendedCompetitions =
  getRecommendedCompetitions(
    passport
  );

  const dimensions = [
  {
    name: "Creativity",
    key: "Creativity",
    score:
  dnaScores.creativity,
    benchmark:
  passport?.benchmarkDelta?.Creativity ?? 0,
   projected:
  passport?.projectedScores?.Creativity ?? 0,
    icon: "🎨",
    color: "#FF6B00"
  },

  {
    name: "Communication",
    key: "Communication",
  score:
  dnaScores.communication,
    benchmark:
      passport?.benchmarkDelta?.Communication ?? 0,
    projected:
      passport?.projectedScores?.Communication ?? 0,
    icon: "📢",
    color: "#1DA1F2"
  },

  {
    name: "Leadership",
    key: "Leadership",
    score:
  dnaScores.leadership,
    benchmark:
      passport?.benchmarkDelta?.Leadership ?? 0,
    projected:
      passport?.projectedScores?.Leadership ?? 0,
    icon: "👑",
    color: "#6C63FF"
  },

  {
    name: "Confidence",
    key: "Confidence",
    score:
  dnaScores.confidence,
    benchmark:
      passport?.benchmarkDelta?.Confidence ?? 0,
    projected:
      passport?.projectedScores?.Confidence ?? 0,
    icon: "🎯",
    color: "#FF2D55"
  },

  {
    name: "Collaboration",
    key: "Collaboration",
 score:
  dnaScores.collaboration,
    benchmark:
      passport?.benchmarkDelta?.Collaboration ?? 0,
    projected:
      passport?.projectedScores?.Collaboration ?? 0,
    icon: "🤝",
    color: "#00C781"
  },

  {
    name: "Critical Thinking",
    key: "CriticalThinking",
    score:
  dnaScores.criticalThinking,
    benchmark:
      passport?.benchmarkDelta?.CriticalThinking ?? 0,
    projected:
      passport?.projectedScores?.CriticalThinking ?? 0,
    icon: "🧠",
    color: "#A855F7"
  }
  
];
const rarityData =
  dimensions.map((item) => ({
    ...item,
    rarity:
      calculateRarity(
        item.score
      )
  }));
  const sorted = [...dimensions].sort(
    (a, b) => b.score - a.score
  );

  const topStrengths =
    sorted.slice(0, 3);

  const growthGaps =
    [...sorted]
      .reverse()
      .slice(0, 2);

const verifiedAchievements =
  5;

const strongestSkill =
  getStrongestSkill(
    dnaScores
  );

const weakestSkill =
  getWeakestSkill(
    dnaScores
  );

const futureReadiness =
  getFutureReadinessScore(
    dnaScores
  );

const dnaConfidence =
  getDNAConfidence(
    verifiedAchievements
  );

  return (
    <div
      style={{
        background: "#F4F5F7",
        minHeight: "100vh",
        padding: "30px"
      }}
    ><div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "20px"
  }}
>
  
</div>
      <div
      
        style={{
          maxWidth: "1400px",
          margin: "0 auto"
        }}
      >

        {/* HEADER */}

        <div
          style={{
            background: "#FFF",
            borderRadius: 28,
            padding: 30,
            marginBottom: 25,
            display: "flex",
            justifyContent:
              "space-between"
          }}
        >
          <div>
            <div
              style={{
                color: "#F97316",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 2
              }}
            >
              PRE-TERM TALENT PROFILING
            </div>

            <h1
              style={{
                marginTop: 10,
                color: "#0B2A4A",
                fontSize: 42
              }}
            >
              Co-Curricular
              Diagnostic Calibration
            </h1>

            <div
              style={{
                marginTop: 12,
                color: "#64748B"
              }}
            >
              Student Profile Generated
            </div>
          </div>

          <div
            style={{
              background:
                "#FF6B00",
              color: "white",
              borderRadius: 20,
              padding: 25,
              width: 200,
              textAlign: "center"
            }}
          >
            <div
              style={{
                fontSize: 12,
                letterSpacing: 1
              }}
            >
              RELATIVE DNA AVG
            </div>

            <div
              style={{
                fontSize: 54,
                fontWeight: 700
              }}
            >
              {
                passport.dnaIndex
              }
            </div>

            <div>
              /100
            </div>
            <div
  style={{
    marginTop: 8,
    fontSize: 11,
    opacity: 0.9,
  }}
>
  Reliability: {passport.reliability}%
</div>
          </div>
        </div>

        {/* MAIN */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 1fr",
            gap: 25
          }}
        >

          {/* LEFT */}

          <div
            style={{
              background: "#FFF",
              borderRadius: 28,
              padding: 30
            }}
          >

            <div
              style={{
                color: "#F97316",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 2
              }}
            >
              INITIAL BASELINE
            </div>

            <h2
              style={{
                color: "#0B2A4A"
              }}
            >
              NEW USER DNA RADAR
            </h2>

            {dimensions.map(
              (item) => (
                <div
                  key={item.name}
                  style={{
                    marginBottom: 18
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between"
                    }}
                  >
                    <div>
                      {item.icon}{" "}
                      {item.name}
                    </div>

                    <div>
                      {item.score}
                    </div>
                  </div>

                  <div
                    style={{
                      height: 10,
                      background:
                        "#E5E7EB",
                      borderRadius: 20,
                      marginTop: 6
                    }}
                  >
                    <div
                      style={{
                        width: `${item.score}%`,
                        height: "100%",
                        borderRadius: 20,
                        background:
                          item.color
                      }}
                    />
                  </div>
                </div>
              )
            )}
<div
  style={{
    marginTop: 25,
    padding: 20,
    borderRadius: 18,
    background: "#F8FAFC",
    border: "1px solid #E2E8F0"
  }}
>

  <div
    style={{
      fontSize: 12,
      fontWeight: 700,
      color: "#94A3B8",
      marginBottom: 12
    }}
  >
    BENCHMARK ANALYSIS
  </div>

  {dimensions.map((item) => (

    <div
      key={item.name}
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 8
      }}
    >
      <span>
        {item.name}
      </span>

      <span
        style={{
          color:
            item.benchmark >= 0
              ? "#00C781"
              : "#EF4444",
          fontWeight: 700
        }}
      >
        {item.benchmark >= 0
          ? `+${item.benchmark}`
          : item.benchmark}
      </span>

    </div>

  ))}

</div>

<div
  style={{
    marginTop: 20,
    padding: 20,
    borderRadius: 18,
    background: "#F8FAFC",
    border: "1px solid #E2E8F0"
  }}
>

  <div
    style={{
      fontSize: 12,
      fontWeight: 700,
      color: "#94A3B8",
      marginBottom: 12
    }}
  >
    SCHOOL POSITIONING
  </div>

  {schoolBenchmarks && (

    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8
        }}
      >
        <span>Communication</span>

        <span>
          Better than {schoolBenchmarks?.communication?.percentile ?? 0}% students
        </span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8
        }}
      >
        <span>Leadership</span>

        <span>
          Better than {schoolBenchmarks?.leadership?.percentile ?? 0}% students
        </span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between"
        }}
      >
        <span>Confidence</span>

        <span>
          Better than {schoolBenchmarks?.confidence?.percentile ?? 0}% students
        </span>
      </div>

    </>

  )}

</div>

RARITY INDEX

</div>

{percentileData && (
  <>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 8
      }}
    >
      <span>Creativity</span>

      <span>
        {percentileData.creativity}th Percentile
      </span>
    </div>

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 8
      }}
    >
      <span>Communication</span>

      <span>
        {percentileData.communication}th Percentile
      </span>
    </div>

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 8
      }}
    >
      <span>Leadership</span>

      <span>
        {percentileData.leadership}th Percentile
      </span>
    </div>

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 8
      }}
    >
      <span>Confidence</span>

      <span>
        {percentileData.confidence}th Percentile
      </span>
    </div>

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 8
      }}
    >
      <span>Collaboration</span>

      <span>
        {percentileData.collaboration}th Percentile
      </span>
    </div>

    <div
      style={{
        display: "flex",
        justifyContent: "space-between"
      }}
    >
      <span>Critical Thinking</span>

      <span>
        {percentileData.criticalThinking}th Percentile
      </span>
    </div>
  </>
)}
</div>
            {/* TOP STRENGTHS */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: 20,
                marginTop: 30
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color:
                      "#94A3B8",
                    fontWeight: 700
                  }}
                >
                  TOP STRENGTHS
                </div>

                {topStrengths.map(
                  (item) => (
                    <div
                      key={item.name}
                      style={{
                        padding: 14,
                        border:
                          "1px solid #E5E7EB",
                        borderRadius: 16,
                        marginTop: 10
                      }}
                    >
                      <strong>
                        {item.name}
                      </strong>

                      <div>
                        {
                          item.score
                        }{" "}
                        pts
                      </div>
                    </div>
                  )
                )}
              </div>

              <div>
                <div
                  style={{
                    fontSize: 12,
                    color:
                      "#94A3B8",
                    fontWeight: 700
                  }}
                >
                  GROWTH GAPS
                </div>

                {growthGaps.map(
                  (item) => (
                    <div
                      key={item.name}
                      style={{
                        padding: 14,
                        border:
                          "1px solid #E5E7EB",
                        borderRadius: 16,
                        marginTop: 10
                      }}
                    >
                      <strong>
                        {item.name}
                      </strong>

                      <div>
                        {
                          item.score
                        }{" "}
                        pts
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* FOOTER */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                marginTop: 40
              }}
            >
              <div>
  <div
    style={{
      fontSize: 12,
      color: "#94A3B8"
    }}
    
  >
    <div
  style={{
    marginTop: 30,
    padding: 20,
    border:
      "1px solid #E5E7EB",
    borderRadius: 20,
  }}
>
  <div
    style={{
      fontSize: 12,
      fontWeight: 700,
      color: "#94A3B8",
      marginBottom: 12,
    }}
  >



    RECOMMENDED COMPETITIONS
  </div>

  {recommendedCompetitions.map(
    (competition) => (
      <div
        key={competition.name}
        style={{
          marginBottom: 16,
        }}
      >
        <strong>
          {competition.name}
        </strong>

        <div>
          Match Score:
          {" "}
          {competition.score}
        </div>
      </div>
    )
  )}
</div>

    PARTICIPATION READINESS
  </div>

  <div
    style={{
      fontSize: 36,
      fontWeight: 700
    }}
  >
    
    {passport.participationIndex}/100
  </div>

  <div
    style={{
      marginTop: 12,
      fontSize: 12,
      color: "#94A3B8"
    }}
  >
    ASSESSMENT RELIABILITY
  </div>

  <div
    style={{
      fontSize: 24,
      fontWeight: 700
    }}
  >
    {passport.reliability}%
  </div>
</div>

              <div>
                <div
                  style={{
                    fontSize: 12,
                    color:
                      "#94A3B8"
                  }}
                >
                  DEVELOPMENT
                  PRIORITIES
                </div>

                <div
                  style={{
                    marginTop: 8
                  }}
                >
                  {(answers[6] ||
                    []
                  ).join(", ")}
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT */}

          <div
            style={{
              background:
                "#071A38",
              color: "white",
              borderRadius: 28,
              padding: 30
            }}
          >
            <div
              style={{
                color: "#00E5A0",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 2
              }}
            >
              YEAR-END EVALUATION
              PROJECTION
            </div>

            <h2>
              12-MONTH TARGET &
              IMPACT MAP
            </h2>

            <div
              style={{
                textAlign: "right",
                marginBottom: 25
              }}
            >
              <div>
                Expected Target
              </div>

             <div
  style={{
    fontSize: 52,
    color: "#00E5A0",
    fontWeight: 700
  }}
>
  {
   Math.round(
  (
    Object.values(
      passport.projectedScores
    ) as number[]
  ).reduce(
    (a, b) => a + b,
    0
  ) /
  Object.keys(
    passport.projectedScores
  ).length
)
  }
</div>
            </div>
            </div>

            {dimensions.map(
              (item) => {

                const projected =
  item.projected;

                return (
                  <div
                    key={item.name}
                    style={{
                      marginBottom: 20
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between"
                      }}
                    >
                      <div>
                        {item.icon}{" "}
                        {item.name}
                      </div>

                      <div>
  {item.score}
  {" → "}
  {projected}

  <span
    style={{
      color: "#00E5A0",
      marginLeft: 8,
      fontWeight: 700
    }}
  >
    +{projected - item.score}
  </span>
</div>
                    </div>

                    <div
                      style={{
                        background:
                          "#243B60",
                        height: 10,
                        borderRadius: 20,
                        marginTop: 8
                      }}
                    >
                      <div
                        style={{
                          width: `${projected}%`,
                          height:
                            "100%",
                          borderRadius: 20,
                          background:
                            "#00E5A0"
                        }}
                      />
                    </div>
                  </div>
                );
              }
            )}

            <div
              style={{
                marginTop: 40,
                background:
                  "rgba(255,255,255,0.04)",
                borderRadius: 20,
                padding: 20
              }}
            >
              {passport.reliability >= 85
  ? "Profile consistency is high. The projected growth path is based on participation readiness, behavioural indicators and selected development priorities."
  : "Some responses indicate mixed behavioural signals. Additional assessments and competition participation will improve projection accuracy."}
            </div>

<div
  style={{
    background:
      "linear-gradient(135deg,#071226,#0B2A4A)",
    color: "white",
    padding: 24,
    borderRadius: 24,
    marginBottom: 40
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
    TALENT INTELLIGENCE
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "1fr 1fr",
      gap: 20,
      marginTop: 20
    }}
  >

    <div>
      <div
        style={{
          opacity: .7,
          fontSize: 12
        }}
      >
        Future Readiness
      </div>

      <div
        style={{
          fontSize: 34,
          fontWeight: 800
        }}
      >
        {futureReadiness}
      </div>
    </div>

    <div>
      <div
        style={{
          opacity: .7,
          fontSize: 12
        }}
      >
        DNA Confidence
      </div>

      <div
        style={{
          fontSize: 24,
          fontWeight: 700
        }}
      >
        {dnaConfidence}
      </div>
    </div>

    <div>
      <div
        style={{
          opacity: .7,
          fontSize: 12
        }}
      >
        Strongest Skill
      </div>

      <div
        style={{
          fontSize: 22,
          fontWeight: 700
        }}
      >
        {strongestSkill}
      </div>
    </div>

    <div>
      <div
        style={{
          opacity: .7,
          fontSize: 12
        }}
      >
        Development Area
      </div>

      <div
        style={{
          fontSize: 22,
          fontWeight: 700
        }}
      >
        {weakestSkill}
      </div>
    </div>

  </div>

</div>
</div>

);
}
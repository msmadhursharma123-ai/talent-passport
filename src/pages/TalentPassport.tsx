
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

interface Props {
  onStartDNA?: () => void;
}

export default function TalentPassport({
  onStartDNA
}: Props) {

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

     const savedPassport =
  JSON.parse(
    localStorage.getItem(
      "studentPassport"
    ) || "null"
  );

if (savedPassport) {

  setDnaScores({
    creativity:
      savedPassport.normalizedScores
        ?.Creativity || 0,

    communication:
      savedPassport.normalizedScores
        ?.Communication || 0,

    leadership:
      savedPassport.normalizedScores
        ?.Leadership || 0,

    confidence:
      savedPassport.normalizedScores
        ?.Confidence || 0,

    collaboration:
      savedPassport.normalizedScores
        ?.Collaboration || 0,

    criticalThinking:
      savedPassport.normalizedScores
        ?.CriticalThinking || 0,
  });

} else {

  setDnaScores({
    creativity: 0,
    communication: 0,
    leadership: 0,
    confidence: 0,
    collaboration: 0,
    criticalThinking: 0,
  });

}
    };

  loadDNA();

}, []);

if (!passport) {

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "20px",
          textAlign: "center",
          boxShadow:
            "0 8px 30px rgba(0,0,0,0.08)"
        }}
      >
        <h2
          style={{
            color: "#143B73",
            marginBottom: "20px"
          }}
        >
          Talent Passport Not Found
        </h2>

        <p
          style={{
            color: "#666",
            marginBottom: "25px"
          }}
        >
          This student has not completed the
          DNA Assessment yet.
        </p>

        <button
          onClick={() => {

  localStorage.removeItem(
    "studentPassport"
  );

  localStorage.removeItem(
    "talentScores"
  );

  localStorage.removeItem(
    "studentCalibration"
  );

  localStorage.removeItem(
    "studentAnswers"
  );

  onStartDNA?.();

}}
          style={{
            background: "#F4A623",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: 600
          }}
        >
          Complete DNA Assessment
        </button>
      </div>
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
      padding: 30
    }}
  >
    <div
      style={{
        maxWidth: 1600,
        margin: "0 auto"
      }}
    >

      {/* HEADER */}

      <div
        style={{
          background: "#FFF",
          borderRadius: 24,
          padding: 30,
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              color: "#F97316",
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
              fontSize: 38,
              marginBottom: 10
            }}
          >
            Co-Curricular Diagnostic Calibration
          </h1>

          <div
            style={{
              color: "#64748B"
            }}
          >
            Student Profile Generated
          </div>
        </div>

        <div
          style={{
            background: "#FF6B00",
            color: "#FFF",
            padding: 24,
            borderRadius: 20,
            width: 220,
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: 12 }}>
            RELATIVE DNA AVG
          </div>

          <div
            style={{
              fontSize: 52,
              fontWeight: 700
            }}
          >
            {passport.dnaIndex}
          </div>

          <div>/100</div>

          <div
            style={{
              marginTop: 8,
              fontSize: 12
            }}
          >
            Reliability {passport.reliability}%
          </div>
        </div>
      </div>

      {/* MAIN GRID */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          alignItems: "start"
        }}
      >

        {/* LEFT COLUMN */}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24
          }}
        >

          {/* DNA CARD */}

          <div
            style={{
              background: "#FFF",
              borderRadius: 24,
              padding: 24
            }}
          >
            <h2>New User DNA Radar</h2>

            {dimensions.map((item) => (
              <div
                key={item.name}
                style={{
                  marginBottom: 18
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between"
                  }}
                >
                  <span>
                    {item.icon} {item.name}
                  </span>

                  <strong>
                    {item.score}
                  </strong>
                </div>

                <div
                  style={{
                    background: "#E5E7EB",
                    height: 10,
                    borderRadius: 20,
                    marginTop: 6
                  }}
                >
                  <div
                    style={{
                      width: `${item.score}%`,
                      height: "100%",
                      borderRadius: 20,
                      background: item.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* BENCHMARK */}

          <div
            style={{
              background: "#FFF",
              borderRadius: 24,
              padding: 24
            }}
          >
            <h3>Benchmark Analysis</h3>

            {dimensions.map((item) => (
              <div
                key={item.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 10
                }}
              >
                <span>{item.name}</span>

                <strong
                  style={{
                    color:
                      item.benchmark >= 0
                        ? "#00C781"
                        : "#EF4444"
                  }}
                >
                  {item.benchmark >= 0
                    ? `+${item.benchmark}`
                    : item.benchmark}
                </strong>
              </div>
            ))}
          </div>

          {/* SCHOOL POSITION */}

          <div
            style={{
              background: "#FFF",
              borderRadius: 24,
              padding: 24
            }}
          >
            <h3>School Positioning</h3>

            {schoolBenchmarks && (
              <>
                <p>
                  Communication:
                  {" "}
                  {schoolBenchmarks?.communication?.percentile ?? 0}%
                </p>

                <p>
                  Leadership:
                  {" "}
                  {schoolBenchmarks?.leadership?.percentile ?? 0}%
                </p>

                <p>
                  Confidence:
                  {" "}
                  {schoolBenchmarks?.confidence?.percentile ?? 0}%
                </p>
              </>
            )}
          </div>

          {/* RARITY */}

          <div
            style={{
              background: "#FFF",
              borderRadius: 24,
              padding: 24
            }}
          >
            <h3>Rarity Index</h3>

            {rarityData.map((item) => (
              <div
                key={item.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 10
                }}
              >
                <span>{item.name}</span>

                <strong>
  {item.rarity.percentile}th Percentile
</strong>
              </div>
            ))}
          </div>

          {/* PERCENTILES */}

          <div
            style={{
              background: "#FFF",
              borderRadius: 24,
              padding: 24
            }}
          >
            <h3>Percentile Ranking</h3>

            {percentileData &&
             Object.entries(percentileData).map(([key, value]: any) => (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8
                    }}
                  >
                    <span>{key}</span>
                   <strong>{value.percentile}</strong>
                  </div>
                )
              )}
          </div>
        </div>

        {/* RIGHT COLUMN */}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24
          }}
        >

          {/* STRENGTHS */}

          <div
            style={{
              background: "#FFF",
              borderRadius: 24,
              padding: 24
            }}
          >
            <h3>Top Strengths</h3>

            {topStrengths.map((item) => (
              <div
                key={item.name}
                style={{
                  marginBottom: 12
                }}
              >
                <strong>{item.name}</strong>
                <div>{item.score}</div>
              </div>
            ))}
          </div>

          {/* GAPS */}

          <div
            style={{
              background: "#FFF",
              borderRadius: 24,
              padding: 24
            }}
          >
            <h3>Growth Gaps</h3>

            {growthGaps.map((item) => (
              <div
                key={item.name}
                style={{
                  marginBottom: 12
                }}
              >
                <strong>{item.name}</strong>
                <div>{item.score}</div>
              </div>
            ))}
          </div>

          {/* PARTICIPATION */}

          <div
            style={{
              background: "#FFF",
              borderRadius: 24,
              padding: 24
            }}
          >
            <h3>Participation Readiness</h3>

            <div
              style={{
                fontSize: 48,
                fontWeight: 700
              }}
            >
              {passport.participationIndex}/100
            </div>
          </div>

          {/* COMPETITIONS */}

          <div
            style={{
              background: "#FFF",
              borderRadius: 24,
              padding: 24
            }}
          >
            <h3>Recommended Competitions</h3>

            {recommendedCompetitions.map(
              (competition) => (
                <div
                  key={competition.name}
                  style={{
                    marginBottom: 14
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

          {/* PROJECTION */}

          <div
            style={{
              background: "#071A38",
              color: "#FFF",
              borderRadius: 24,
              padding: 24
            }}
          >
            <h3>
              Year-End Projection
            </h3>

            {dimensions.map((item) => {

              const projected =
                item.projected;

              return (
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
                    <span>
                      {item.name}
                    </span>

                    <strong>
                      {item.score}
                      {" → "}
                      {projected}
                    </strong>
                  </div>

                  <div
                    style={{
                      height: 10,
                      background: "#243B60",
                      borderRadius: 20,
                      marginTop: 6
                    }}
                  >
                    <div
                      style={{
                        width: `${projected}%`,
                        height: "100%",
                        background: "#00E5A0",
                        borderRadius: 20
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* TALENT INTELLIGENCE */}

          <div
            style={{
              background:
                "linear-gradient(135deg,#071226,#0B2A4A)",
              color: "#FFF",
              borderRadius: 24,
              padding: 24
            }}
          >
            <h3>
              Talent Intelligence
            </h3>

            <p>
              Future Readiness:
              {" "}
              {futureReadiness}
            </p>

            <p>
              DNA Confidence:
              {" "}
              {dnaConfidence}
            </p>

            <p>
              Strongest Skill:
              {" "}
              {strongestSkill}
            </p>

            <p>
              Development Area:
              {" "}
              {weakestSkill}
            </p>
          </div>

        </div>

      </div>

    </div>
  </div>
);
}
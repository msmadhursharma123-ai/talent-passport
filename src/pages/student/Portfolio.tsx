import { useState } from "react";
import { useEffect } from "react";

import {
  getStudentPerformances,
  getStudentProjects,
  getStudentSkills,
  createPerformanceOtp,
verifyPerformanceOtp
} from "../../data/studentRepository";

import {
  createPerformance,
  uploadPerformanceVideo,
markPerformanceVerified
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

  console.log(
  "PERFORMANCES",
  performances
);

  const [showModal, setShowModal] =
    useState(false);

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
  onClick={() =>
    setShowModal(true)
  }
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
{showModal && (
  <AddPerformanceModal
    onClose={() =>
      setShowModal(false)
    }
  />
)}

    </div>
  );
}
function PerformanceCard({
  item
}: any) {

const [showOtpModal, setShowOtpModal] =
  useState(false);

const [otp, setOtp] =
  useState("");

const [verifying, setVerifying] =
  useState(false);

  async function handleVerifyOtp() {

  try {

    setVerifying(true);

    const result =
      await verifyPerformanceOtp(
        item.student_id,
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

    window.location.reload();

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
  onClick={() => {

    if (
      !item.parent_verified
    ) {
      setShowOtpModal(
        true
      );
    }

  }}
  style={{
    background:
      item.parent_verified
        ? "#DCFCE7"
        : "#FEF3C7",

    color:
      item.parent_verified
        ? "#166534"
        : "#92400E",

    padding: "8px 14px",

    borderRadius: "999px",

    fontWeight: 700,

    cursor:
      item.parent_verified
        ? "default"
        : "pointer"
  }}
>
            {
  item.parent_verified
    ? "✓ VERIFIED"
    : "VERIFY OTP"
}
          </div>
        </div>
      </div>

{
  showOtpModal && (

    <div
      style={{
        position: "fixed",
        inset: 0,
        background:
          "rgba(0,0,0,0.6)",

        display: "flex",

        justifyContent:
          "center",

        alignItems:
          "center",

        zIndex: 9999
      }}
    >

      <div
        style={{
          width: "400px",

          background:
            "#fff",

          padding: "30px",

          borderRadius:
            "20px"
        }}
      >

        <h3>
          Verify Parent OTP
        </h3>

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
            padding: "14px"
          }}
        />

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "20px"
          }}
        >

          <button
            onClick={
              handleVerifyOtp
            }
          >
            {verifying
              ? "Verifying..."
              : "Verify"}
          </button>

          <button
            onClick={() =>
              setShowOtpModal(
                false
              )
            }
          >
            Cancel
          </button>

        </div>

      </div>

    </div>

  )
}

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

  const [file, setFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  async function handleSave() {

    try {

      setLoading(true);

      const profile =
        JSON.parse(
          localStorage.getItem(
            "studentProfile"
          ) || "{}"
        );

      if (!profile?.id) {

        alert(
          "Student not found"
        );

        return;
      }

      let videoUrl = "";

      if (file) {

        const uploaded =
          await uploadPerformanceVideo(
            file
          );

        if (uploaded)
          videoUrl = uploaded;
      }

      await createPerformance({
        student_id:
          profile.id,

        title,

        category,

        venue,

        description,

        video_url:
          videoUrl,

        parent_verified:
          false
      });

      const otp =
  Math.floor(
    100000 +
      Math.random() *
        900000
  ).toString();

await createPerformanceOtp(
  profile.id,
  otp
);

alert(
  `Parent OTP: ${otp}`
);

      alert(
        "Performance Added"
      );

      window.location.reload();

    } catch (err) {

      console.error(err);

      alert(
        "Failed to save"
      );

    } finally {

      setLoading(false);
    }
  }


  
  return (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background:
        "rgba(5,8,22,0.75)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999
    }}
  >
    <div
      style={{
        width: "820px",
        background: "#FFFFFF",
        borderRadius: "30px",
        overflow: "hidden",
        boxShadow:
          "0 25px 60px rgba(0,0,0,0.25)"
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(135deg,#050816,#0A0F2E)",
          padding: "28px 35px",
          color: "white"
        }}
      >
        <div
          style={{
            color: "#F97316",
            fontSize: "12px",
            letterSpacing: "2px"
          }}
        >
          PERFORMANCE REGISTRY NODE
        </div>

        <h2
          style={{
            margin: "10px 0 0",
            fontSize: "32px"
          }}
        >
          ADD LIVE PERFORMANCE
        </h2>
      </div>

      <div
        style={{
          padding: "35px"
        }}
      >
        <div
          style={{
            display: "grid",
            gap: "16px"
          }}
        >
          <input
            placeholder="Performance Title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            style={{
              padding: "16px",
              border:
                "1px solid #E5E7EB",
              borderRadius: "14px",
              fontSize: "16px"
            }}
          />

          <input
            placeholder="Category (Drama, Dance, Music)"
            value={category}
            onChange={(e) =>
              setCategory(
                e.target.value
              )
            }
            style={{
              padding: "16px",
              border:
                "1px solid #E5E7EB",
              borderRadius: "14px",
              fontSize: "16px"
            }}
          />

          <input
            placeholder="Venue"
            value={venue}
            onChange={(e) =>
              setVenue(
                e.target.value
              )
            }
            style={{
              padding: "16px",
              border:
                "1px solid #E5E7EB",
              borderRadius: "14px",
              fontSize: "16px"
            }}
          />

          <textarea
            placeholder="Describe the performance"
            rows={5}
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            style={{
              padding: "16px",
              border:
                "1px solid #E5E7EB",
              borderRadius: "14px",
              fontSize: "16px"
            }}
          />

          <div
            style={{
              border:
                "2px dashed #CBD5E1",
              borderRadius: "18px",
              padding: "25px"
            }}
          >
            <div
              style={{
                marginBottom: "12px",
                fontWeight: 600
              }}
            >
              Upload Performance Video
            </div>

            <input
              type="file"
              accept="video/*"
              onChange={(e) =>
                setFile(
                  e.target.files?.[0] ||
                    null
                )
              }
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent:
              "flex-end",
            gap: "12px",
            marginTop: "30px"
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "#EEF2F7",
              border: "none",
              padding:
                "14px 24px",
              borderRadius: "14px",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              background: "#F97316",
              color: "white",
              border: "none",
              padding:
                "14px 24px",
              borderRadius: "14px",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            {loading
              ? "Saving..."
              : "Save Performance"}
          </button>
        </div>
      </div>
    </div>
  </div>
);
}
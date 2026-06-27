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
    background: "white",
    borderRadius: 28,
    padding: 28,
    marginBottom: 24,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #E2E8F0"
  }}
>
  <div>

    <div
      style={{
        color: "#F97316",
        fontSize: 24,
        letterSpacing: 2,
        fontWeight: 500,
        marginBottom: 10
      }}
    >
      Build Your Own Portfolio
    </div>

    <h1
      style={{
        margin: 0,
        color: "#0F172A",
        fontSize: 42,
        fontWeight: 500,
        lineHeight: 1.2
      }}
    >
      Your Portfolio - Your Gateway 
    </h1>

    <div
      style={{
        marginTop: 10,
        color: "#64748B",
        fontSize: 16
      }}
    >
      Secure access to your complete Talent Passport record.
    </div>

  </div>

  <div
    style={{
      background: "#FF6B00",
      color: "white",
      padding: 24,
      borderRadius: 20,
      minWidth: 180,
      textAlign: "center"
    }}
  >
    <div
      style={{
        fontSize: 11,
        letterSpacing: 1,
        fontWeight: 700,
        marginBottom: 8
      }}
    >
      SYSTEM STATUS
    </div>

    <div
      style={{
        fontSize: 22,
        fontWeight: 800
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
<div
  style={{
    background: "#F8FAFC",
    border:
      "1px solid #E5E7EB",
    borderRadius: "24px",
    padding: "24px",
    marginBottom: "30px"
  }}
>
  <h2
    style={{
      marginTop: 0,
      marginBottom: "20px"
    }}
  >
    🎓 PORTFOLIO CREDIT SUMMARY
  </h2>

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "repeat(4,1fr)",
      gap: "16px"
    }}
  >

    <div
      style={{
        background: "#FFF7ED",
        padding: "20px",
        borderRadius: "18px"
      }}
    >
      <div>
        Total Combined Credits
      </div>

      <h2>
        {totalCredits}
      </h2>
    </div>

    <div
      style={{
        background: "#EFF6FF",
        padding: "20px",
        borderRadius: "18px"
      }}
    >
      <div>
        Performance Credits
      </div>

      <h2>
        {performanceCredits}
      </h2>
    </div>

    <div
      style={{
        background: "#ECFDF5",
        padding: "20px",
        borderRadius: "18px"
      }}
    >
      <div>
        Project Credits
      </div>

      <h2>
        {projectCredits}
      </h2>
    </div>

    <div
      style={{
        background: "#F5F3FF",
        padding: "20px",
        borderRadius: "18px"
      }}
    >
      <div>
        Skill Credits
      </div>

      <h2>
        {skillCredits}
      </h2>
    </div>

  </div>
</div>

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
    </div>
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
            loadPortfolio={
              loadPortfolio
            }
          />
        )
      )}

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

  if (!confirmDelete)
    return;

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

const [editTitle, setEditTitle] =
  useState(item.title);

const [editDescription,
  setEditDescription] =
  useState(item.description);

const [editVenue,
  setEditVenue] =
  useState(item.venue);

  async function handleUpdate() {

  const success =
    await updatePerformance(
      item.id,
      {
        title: editTitle,
        description:
          editDescription,
        venue: editVenue
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

  const [otp, setOtp] =
    useState("");

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

      setShowOtpModal(false);

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
    <div
      style={{
        border:
          "1px solid #E5E7EB",
        borderRadius: "22px",
        padding: "30px",
        marginBottom: "20px"
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
            📍 {item.venue}
          </div>

          <p
            style={{
              color: "#64748B",
              maxWidth: "700px"
            }}
          >
            {item.description}
          </p>

          {item.video_url && (
            <video
              controls
              style={{
                width: "100%",
                maxWidth: "700px",
                borderRadius:
                  "16px",
                marginTop: "16px"
              }}
            >
              <source
                src={item.video_url}
              />
            </video>
          )}

        </div>

        <div
  style={{
    display: "flex",
    gap: "10px",
    alignItems: "center"
  }}
>

  <div
    style={{
      background:
        item.parent_verified
          ? "#DCFCE7"
          : "#FEF3C7",

      color:
        item.parent_verified
          ? "#166534"
          : "#92400E",

      padding:
        "8px 14px",

      borderRadius:
        "999px",

      fontWeight: 700
    }}
  >
    {item.parent_verified
      ? "🟢 Parent Verified"
      : "🟡 Self Reported"}
  </div>

  <button
    onClick={() =>
      setEditing(true)
    }
  >
    ✏️ Edit
  </button>

  <button
    onClick={handleDelete}
  >
    🗑 Delete
  </button>

</div>
      </div>

      {showOtpModal && (

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
              background: "#fff",
              padding: "30px",
              borderRadius: "20px"
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

      )}
    </div>
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
        border: "1px solid #E5E7EB",
        borderRadius: "22px",
        padding: "30px",
        position: "relative"
      }}
    >

      <button
        onClick={handleDelete}
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          border: "none",
          background: "#FEE2E2",
          color: "#DC2626",
          borderRadius: "10px",
          padding: "8px 12px",
          cursor: "pointer"
        }}
      >
        🗑 Delete
      </button>

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
  projects,
  loadPortfolio
}: any) {

  const [showModal, setShowModal] =
    useState(false);

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

        <button
          onClick={() =>
            setShowModal(true)
          }
        >
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
              loadPortfolio={
                loadPortfolio
              }
            />
          )
        )}
      </div>

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
        border: "1px solid #E5E7EB",
        borderRadius: "22px",
        padding: "30px",
        position: "relative"
      }}
    >

      <button
        onClick={handleDelete}
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          border: "none",
          background: "#FEE2E2",
          color: "#DC2626",
          borderRadius: "10px",
          padding: "8px 12px",
          cursor: "pointer"
        }}
      >
        🗑 Delete
      </button>

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
  skills,
  loadPortfolio
}: any) {

  const [showModal, setShowModal] =
    useState(false);

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

        <button
          onClick={() =>
            setShowModal(true)
          }
        >
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
              loadPortfolio={
                loadPortfolio
              }
            />
          )
        )}
      </div>

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

  const [performanceDate,
setPerformanceDate] =
useState("");

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

<input
  type="date"
  value={performanceDate}
  onChange={(e) =>
    setPerformanceDate(
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

  const [projectLink, setProjectLink] =
    useState("");

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

        if (uploaded)
          videoUrl = uploaded;
      }

await createProject({

    title,
    category,
    project_date: projectDate,
    description,
    project_link: projectLink,
    project_video_url: videoUrl,
    parent_verified: false

});



console.log("PROJECT SAVED");

console.log("CALLING ONCLOSE");

onClose();

console.log("ONCLOSE FINISHED");

    } catch (err) {
  console.error(
    "PROJECT ERROR",
    err
  );

  console.error(err);

if (err instanceof Error) {
  alert(err.message);
} else {
  alert("Unknown error");
}
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
          background: "#FFF",
          borderRadius: "30px",
          padding: "35px"
        }}
      >

        <h2>
          📁 ADD PROJECT
        </h2>

        <div
          style={{
            display: "grid",
            gap: "16px"
          }}
        >

          <input
            placeholder="Project Title"
            value={title}
            onChange={(e)=>
              setTitle(
                e.target.value
              )
            }
          />

          <input
            placeholder="Category"
            value={category}
            onChange={(e)=>
              setCategory(
                e.target.value
              )
            }
          />

          <input
            type="date"
            value={projectDate}
            onChange={(e)=>
              setProjectDate(
                e.target.value
              )
            }
          />

          <textarea
            rows={5}
            placeholder="Description"
            value={description}
            onChange={(e)=>
              setDescription(
                e.target.value
              )
            }
          />

          <input
            placeholder="Project Link"
            value={projectLink}
            onChange={(e)=>
              setProjectLink(
                e.target.value
              )
            }
          />

          <input
            type="file"
            accept="video/*"
            onChange={(e)=>
              setFile(
                e.target.files?.[0]
                || null
              )
            }
          />

        </div>

        <div
          style={{
            marginTop:"20px",
            display:"flex",
            gap:"10px",
            justifyContent:
              "flex-end"
          }}
        >
          <button
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
          >
            {loading
              ? "Saving..."
              : "Save Project"}
          </button>
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

        if (uploaded)
          imageUrl = uploaded;
      }

     await createSkill({
  
  skill_name: skillName,
  organization,
  certificate_date: certificateDate,
  description,
  certificate_url: imageUrl,
  parent_verified: false
});

console.log("SKILL SAVED");

console.log("CALLING ONCLOSE");

onClose();

console.log("ONCLOSE FINISHED");

    }catch (err) {
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

  return (
    <div
      style={{
        position:"fixed",
        inset:0,
        background:
          "rgba(5,8,22,0.75)",
        display:"flex",
        justifyContent:
          "center",
        alignItems:
          "center",
        zIndex:9999
      }}
    >
      <div
        style={{
          width:"820px",
          background:"#FFF",
          borderRadius:"30px",
          padding:"35px"
        }}
      >

        <h2>
          ✨ ADD SKILL
        </h2>

        <div
          style={{
            display:"grid",
            gap:"16px"
          }}
        >

          <input
            placeholder="Skill Name"
            value={skillName}
            onChange={(e)=>
              setSkillName(
                e.target.value
              )
            }
          />

          <input
            placeholder="Organization"
            value={organization}
            onChange={(e)=>
              setOrganization(
                e.target.value
              )
            }
          />

          <input
            type="date"
            value={certificateDate}
            onChange={(e)=>
              setCertificateDate(
                e.target.value
              )
            }
          />

          <textarea
            rows={5}
            placeholder="Description"
            value={description}
            onChange={(e)=>
              setDescription(
                e.target.value
              )
            }
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e)=>
              setFile(
                e.target.files?.[0]
                || null
              )
            }
          />

        </div>

        <div
          style={{
            marginTop:"20px",
            display:"flex",
            gap:"10px",
            justifyContent:
              "flex-end"
          }}
        >
          <button
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
          >
            {loading
              ? "Saving..."
              : "Save Skill"}
          </button>
        </div>

      </div>
    </div>
  );
}
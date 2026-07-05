import React, {
  useEffect,
  useState
} from "react";

import {
  createAchievement,
  getStudentAchievements,
  deleteAchievement,
  updateAchievement
} from "../../data/timelineRepository";

import {
  uploadAchievementFile
} from "../../data/timelineStorage";

import {
  requireIdentity
} from "../../services/identityService";

type Achievement = {
  id: string;
  achievement_year: number;
  activity_category: string;
  custom_activity?: string;
  event_name: string;
  location: string;
  organised_by: string;
  judges: string;
  achievement_level: string;
  achievement_type: string;
  description: string;
  certificate_url?: string;
  medal_photo_url?: string;
  award_photo_url?: string;
  verification_status?: string;
};

export default function TimelineV2() {

 const studentIdentity =
  requireIdentity();

const studentId =
  studentIdentity.studentUuid;

  const [achievements,
    setAchievements] =
    useState<
      Achievement[]
    >([]);

  const [activeIndex,
    setActiveIndex] =
    useState(0);

  const [showForm,
    setShowForm] =
    useState(false);

  const [editMode,
    setEditMode] =
    useState(false);

  const [editingId,
    setEditingId] =
    useState("");

  const [saving,
    setSaving] =
    useState(false);

  const [autoPlay,
    setAutoPlay] =
    useState(false);

  const [galleryImage,
    setGalleryImage] =
    useState(0);

    const [selectedImage,
  setSelectedImage] =
  useState(0);

  const [showImageViewer,
  setShowImageViewer] =
  useState(false);

  const [certificateFile,
    setCertificateFile] =
    useState<File | null>(
      null
    );

  const [medalFile,
    setMedalFile] =
    useState<File | null>(
      null
    );

  const [awardFile,
    setAwardFile] =
    useState<File | null>(
      null
    );

    const [searchTerm,
  setSearchTerm] =
  useState("");

const [filterYear,
  setFilterYear] =
  useState("All");

const [filterCategory,
  setFilterCategory] =
  useState("All");

const [filterLevel,
  setFilterLevel] =
  useState("All");

const [selectedGalleryImage,
  setSelectedGalleryImage] =
  useState("");

const [showGalleryModal,
  setShowGalleryModal] =
  useState(false);

const [journeyScore,
  setJourneyScore] =
  useState(0);

  const [form,
    setForm] =
    useState<any>({
      achievement_year: "",
      activity_category: "",
      custom_activity: "",
      event_name: "",
      location: "",
      organised_by: "",
      judges: "",
      achievement_level: "",
      achievement_type: "",
      description: ""
    });

  async function loadData() {

    if (!studentId)
      return;

   const rows =
  await getStudentAchievements();

    const sorted =
      [...rows].sort(
        (
          a: any,
          b: any
        ) =>
          Number(
            a.achievement_year
          ) -
          Number(
            b.achievement_year
          )
      );

    setAchievements(
      sorted
    );

    if (
      sorted.length > 0
    ) {
      setActiveIndex(
        Math.floor(
          sorted.length / 2
        )
      );
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {

    if (
      !autoPlay ||
      achievements.length <
        2
    )
      return;

    const timer =
      setInterval(() => {

        setActiveIndex(
          (
            prev
          ) =>
            (prev + 1) %
            achievements.length
        );

      }, 7000);

    return () =>
      clearInterval(
        timer
      );

  }, [
    autoPlay,
    achievements
  ]);

useEffect(() => {

  if (!autoPlay)
    return;

  const timer =
    setInterval(() => {

      setSelectedImage(
        (prev) => {

          const images = [
            current?.certificate_url,
            current?.medal_photo_url,
            current?.award_photo_url
          ].filter(Boolean);

          if (images.length < 2)
            return 0;

          return (
            prev + 1
          ) % images.length;

        }
      );

    }, 7000);

  return () =>
    clearInterval(timer);

}, [
  autoPlay,
  activeIndex
]);

useEffect(() => {

  setSelectedImage(0);

}, [
  activeIndex
]);

useEffect(() => {

  setGalleryImage(0);

  setSelectedImage(0);

}, [activeIndex]);

  function resetForm() {

    setForm({
      achievement_year:
        "",
      activity_category:
        "",
      custom_activity:
        "",
      event_name:
        "",
      location: "",
      organised_by:
        "",
      judges: "",
      achievement_level:
        "",
      achievement_type:
        "",
      description:
        ""
    });

    setCertificateFile(
      null
    );

    setMedalFile(
      null
    );

    setAwardFile(
      null
    );

    setEditingId("");

    setEditMode(false);
  }
   async function saveAchievement() {

    if (
      !form.achievement_year ||
      !form.activity_category ||
      !form.event_name
    ) {
      alert(
        "Please complete required fields"
      );
      return;
    }

    setSaving(true);

    try {

      let certificateUrl =
        null;

      let medalUrl =
        null;

      let awardUrl =
        null;

      if (
        certificateFile
      ) {

        certificateUrl =
          await uploadAchievementFile(
            "achievement-certificates",
            certificateFile
          );
      }



      if (
        medalFile
      ) {

        medalUrl =
          await uploadAchievementFile(
            "achievement-medals",
            medalFile
          );
      }

      if (
        awardFile
      ) {

        awardUrl =
          await uploadAchievementFile(
            "achievement-awards",
            awardFile
          );
      }

console.log(
  "CERTIFICATE URL:",
  certificateUrl
);

console.log(
  "MEDAL URL:",
  medalUrl
);

console.log(
  "AWARD URL:",
  awardUrl
);

      const hasEvidence =
  certificateFile ||
  medalFile ||
  awardFile ||
  form.certificate_url ||
  form.medal_photo_url ||
  form.award_photo_url;

const verification =
  form.achievement_year &&
  form.activity_category &&
  form.event_name &&
  form.location &&
  form.organised_by &&
  form.achievement_level &&
  form.achievement_type &&
  form.description &&
  hasEvidence
    ? "Verified"
    : "Unverified";

     const payload = {

  student_id:
    studentId,

  ...form,

  activity_category:
    form.activity_category ===
    "Other"
      ? form.custom_activity
      : form.activity_category,

       certificate_url:
  certificateUrl ||
  form.certificate_url,

medal_photo_url:
  medalUrl ||
  form.medal_photo_url,

award_photo_url:
  awardUrl ||
  form.award_photo_url,

        verification_status:
          verification
      };

      if (
        editMode
      ) {

        await updateAchievement(
          editingId,
          payload
        );

      } else {

        await createAchievement(
          payload
        );

      }

      resetForm();

      setShowForm(
        false
      );

      await loadData();

    } catch (
      error
    ) {

      console.error(
        error
      );

      alert(
        "Unable to save achievement"
      );

    } finally {

      setSaving(
        false
      );
    }
  }

  async function removeAchievement(
    id: string
  ) {

    const confirmed =
      window.confirm(
        "Delete this achievement?"
      );

    if (
      !confirmed
    )
      return;

    await deleteAchievement(
      id
    );

    await loadData();
  }

  function editAchievement(
    item: any
  ) {

    setEditMode(
      true
    );

    setEditingId(
      item.id
    );

    setForm({

      achievement_year:
        item.achievement_year,

      activity_category:
        item.activity_category,

      custom_activity:
        item.custom_activity,

      event_name:
        item.event_name,

      location:
        item.location,

      organised_by:
        item.organised_by,

      judges:
        item.judges,

      achievement_level:
        item.achievement_level,

      achievement_type:
        item.achievement_type,

      description:
        item.description,


certificate_url:
  item.certificate_url,

medal_photo_url:
  item.medal_photo_url,

award_photo_url:
  item.award_photo_url
    });

    setShowForm(
      true
    );
  }

  const current =
    achievements[
      activeIndex
    ];

  const previous =
    achievements[
      Math.max(
        activeIndex - 1,
        0
      )
    ];

  const next =
    achievements[
      Math.min(
        activeIndex + 1,
        achievements.length -
          1
      )
    ];



      const filteredAchievements =
  achievements.filter(
    (item: any) => {

      const searchMatch =
        item.event_name
          ?.toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          );

      const yearMatch =
        filterYear ===
          "All" ||
        String(
          item.achievement_year
        ) === filterYear;

      const categoryMatch =
        filterCategory ===
          "All" ||
        item.activity_category ===
          filterCategory;

      const levelMatch =
        filterLevel ===
          "All" ||
        item.achievement_level ===
          filterLevel;

      return (
        searchMatch &&
        yearMatch &&
        categoryMatch &&
        levelMatch
      );
    }
  );

const verifiedCount =
  achievements.filter(
    (a: any) =>
      a.verification_status ===
      "Verified"
  ).length;

const totalCount =
  achievements.length;

const categoriesCount =
  new Set(
    achievements.map(
      (a: any) =>
        a.activity_category
    )
  ).size;

  function calculateJourneyScore() {

  let score = 0;

  achievements.forEach(
    (
      item: any
    ) => {

      score += 10;

      if (
        item.verification_status ===
        "Verified"
      ) {
        score += 10;
      }

      switch (
        item.achievement_level
      ) {

        case "National":
          score += 30;
          break;

        case "State":
          score += 20;
          break;

        case "District":
          score += 10;
          break;

        case "Inter School":
          score += 5;
          break;
      }
    }
  );

  return score;
}

function getCompletionPercentage() {

  const target = 25;

  return Math.min(
    100,
    Math.round(
      (
        achievements.length /
        target
      ) * 100
    )
  );
}
function getHighestLevel() {

  if (
    achievements.some(
      (a: any) =>
        a.achievement_level ===
        "National"
    )
  )
    return "National";

  if (
    achievements.some(
      (a: any) =>
        a.achievement_level ===
        "State"
    )
  )
    return "State";

  if (
    achievements.some(
      (a: any) =>
        a.achievement_level ===
        "District"
    )
  )
    return "District";

  return "School";
}

function getSkillTags() {

  const tags =
    new Set<string>();

  achievements.forEach(
    (
      item: any
    ) => {

      const category =
        (
          item.activity_category ||
          ""
        ).toLowerCase();

      if (
        category.includes(
          "debate"
        )
      ) {

        tags.add(
          "Communication"
        );

        tags.add(
          "Critical Thinking"
        );
      }

      if (
        category.includes(
          "sports"
        )
      ) {

        tags.add(
          "Leadership"
        );

        tags.add(
          "Teamwork"
        );
      }

      if (
        category.includes(
          "drama"
        )
      ) {

        tags.add(
          "Confidence"
        );

        tags.add(
          "Creativity"
        );
      }

      if (
        category.includes(
          "mun"
        )
      ) {

        tags.add(
          "Diplomacy"
        );

        tags.add(
          "Negotiation"
        );
      }

    }
  );

  return Array.from(
    tags
  );
}
       return (
    <div>

      
{/* TIMELINE V5 HERO */}

<div
  style={{
    background: "white",
    borderRadius: 28,
    padding: 28,
    marginBottom: 24,
    border: "1px solid #E2E8F0"
  }}
>

  <div
    style={{
      color: "#FF6B00",
      fontSize: 18,
      letterSpacing: 2,
      fontWeight: 700
    }}
  >
    Showcase Your Achievements 
  </div>

  <h1
    style={{
      marginTop: 10,
      marginBottom: 8,
      color: "#0F172A",
      fontSize: 34,
      fontWeight: 500
    }}
  >
   Bring Your Achievements Here  🏆  

  </h1>

  <div
    style={{
      color: "#000000",
      fontSize: 18
    }}
  >
    Complete achievement history, evidence vault and accredited student record.
  </div>

</div>

{/* TIMELINE CREDIT SUMMARY */}

<div
  style={{
    background: "white",
    borderRadius: 24,
    padding: 20,
    marginBottom: 24
  }}
>

  <div
    style={{
      fontWeight: 700,
      marginBottom: 16
    }}
  >
    🎓 Achievement Credit Summary
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "repeat(4,1fr)",
      gap: 14
    }}
  >

    <div
      style={{
        background: "#E8E1D6",
        padding: 18,
        borderRadius: 16
      }}
    >
      <div>Total Achievements</div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 700
        }}
      >
        {totalCount}
      </div>
    </div>

    <div
      style={{
        background: "#DCE3EF",
        padding: 18,
        borderRadius: 16
      }}
    >
      <div>Achievement Credits</div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 700
        }}
      >
        {totalCount * 10}
      </div>
    </div>

    <div
      style={{
        background: "#D9ECE6",
        padding: 18,
        borderRadius: 16
      }}
    >
      <div>Verified Credits</div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 700
        }}
      >
        {verifiedCount * 10}
      </div>
    </div>

    <div
      style={{
        background: "#E9E5F4",
        padding: 18,
        borderRadius: 16
      }}
    >
      <div>Total Ledger Credits</div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 700
        }}
      >
        {(totalCount * 10) + (verifiedCount * 10)}
      </div>
    </div>

  </div>

</div>

{/* FILTERS */}

<div
  style={{
    background: "white",
    borderRadius: 24,
    padding: 20,
    marginBottom: 30,
    display: "grid",
    gridTemplateColumns:
      "2fr 1fr 1fr 1fr",
    gap: 15
  }}
>

  <input
    placeholder="Search Achievement..."
    value={searchTerm}
    onChange={(e) =>
      setSearchTerm(
        e.target.value
      )
    }
    style={{
      padding: 14,
      borderRadius: 12,
      border:
        "1px solid #E2E8F0"
    }}
  />

  <select
    value={filterYear}
    onChange={(e) =>
      setFilterYear(
        e.target.value
      )
    }
  >
    <option>
      All
    </option>

    {[
      ...new Set(
        achievements.map(
          (a:any)=>
            a.achievement_year
        )
      )
    ].map(
      (year:any)=>(
        <option
          key={year}
        >
          {year}
        </option>
      )
    )}
  </select>

  <select
    value={
      filterCategory
    }
    onChange={(e) =>
      setFilterCategory(
        e.target.value
      )
    }
  >
    <option>
      All
    </option>

    {[
      ...new Set(
        achievements.map(
          (a:any)=>
            a.activity_category
        )
      )
    ].map(
      (category:any)=>(
        <option
          key={
            category
          }
        >
          {category}
        </option>
      )
    )}
  </select>

  <select
    value={
      filterLevel
    }
    onChange={(e) =>
      setFilterLevel(
        e.target.value
      )
    }
  >
    <option>
      All
    </option>

    <option>
      Intra School
    </option>

    <option>
      Inter School
    </option>

    <option>
      District
    </option>

    <option>
      State
    </option>

    <option>
      National
    </option>

  </select>

</div>

      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: 30
        }}
      >
        <div>

          <div
            style={{
              color: "#FF6B00",
              fontWeight: 700,
              letterSpacing: 2,
              fontSize: 12
            }}
          >
            STUDENT JOURNEY ROADMAP
          </div>

          <h1
            style={{
              marginTop: 10,
              color: "#0B2A4A"
            }}
          >
            Achievement Timeline
          </h1>

          <p
            style={{
              color: "#64748B"
            }}
          >
            Navigate through your complete achievement journey.
          </p>

        </div>

        <div
          style={{
            display: "flex",
            gap: 12
          }}
        >

          <button
            onClick={() =>
              setAutoPlay(
                !autoPlay
              )
            }
            style={{
              background:
                autoPlay
                  ? "#22C55E"
                  : "#0B2A4A",
              color: "white",
              border: "none",
              padding:
                "12px 18px",
              borderRadius: 12,
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            {autoPlay
              ? "⏸ Pause Journey"
              : "▶ Auto Play"}
          </button>

          <button
            onClick={() => {

              resetForm();

              setShowForm(
                true
              );
            }}
            style={{
              background:
                "#FF6B00",
              color:
                "white",
              border:
                "none",
              padding:
                "12px 20px",
              borderRadius:
                12,
              fontWeight:
                700,
              cursor:
                "pointer"
            }}
          >
            + Add Achievement
          </button>

        </div>
      </div>

   {/* ROADMAP */}

<div
  style={{
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24
  }}
>

  <div
    style={{
      textAlign: "center",
      marginBottom: 16,
      fontWeight: 700,
      color: "#0F172A",
      letterSpacing: 1
    }}
  >
    TALENT JOURNEY HIGHWAY
  </div>

  <div
    style={{
      position: "relative",
      height: 120,
      overflowX: "auto",
      overflowY: "hidden"
    }}
  >

    <svg
      width={Math.max(
        achievements.length * 180,
        900
      )}
      height="120"
      style={{
        position: "absolute",
        left: 0,
        top: 0
      }}
    >
      <path
        d={achievements
          .map((item, index) => {
            const x =
              100 +
              index * 180;

            const y =
              50;

            return `${
              index === 0
                ? "M"
                : "L"
            } ${x} ${y}`;
          })
          .join(" ")}
        fill="none"
        stroke="#203A63"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>

    {achievements.map(
      (item, index) => {
        const x =
          100 +
          index * 180;

        return (
          <div
            key={item.id}
            onClick={() =>
              setActiveIndex(index)
            }
            style={{
              position: "absolute",
              left: x - 20,
              top: 30,
              cursor: "pointer",
              textAlign: "center",
              width: 90
            }}
          >

            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background:
                  activeIndex ===
                  index
                    ? "#FF6B00"
                    : "#22304A",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                margin:
                  "0 auto",
                fontWeight: 700,
                color: "white",
                transition:
                  "all .4s"
              }}
            >
              {index + 1}
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 12,
                fontWeight: 600,
                color: "#0F172A",
                whiteSpace:
                  "nowrap"
              }}
            >
              {item.event_name}
            </div>

          </div>
        );
      }
    )}

    <div
      style={{
        position: "absolute",
        left:
          100 +
          activeIndex * 180 -
          10,
        top: 2,
        fontSize: 18,
        transition:
          "all .8s ease"
      }}
    >
      🚀
    </div>

  </div>

  <div
    style={{
      display: "flex",
      justifyContent:
        "center",
      gap: 12,
      marginTop: 10
    }}
  >

    <button
      onClick={() =>
        setActiveIndex(
          Math.max(
            activeIndex - 1,
            0
          )
        )
      }
      style={{
        padding:
          "8px 14px",
        borderRadius: 10,
        border:
          "1px solid #E2E8F0",
        background:
          "#FFFFFF",
        cursor: "pointer"
      }}
    >
      ← Previous
    </button>

    <button
      onClick={() =>
        setActiveIndex(
          Math.min(
            activeIndex + 1,
            achievements.length - 1
          )
        )
      }
      style={{
        padding:
          "8px 14px",
        borderRadius: 10,
        border:
          "1px solid #E2E8F0",
        background:
          "#FFFFFF",
        cursor: "pointer"
      }}
    >
      Next →
    </button>

  </div>

</div>

{/* PREVIOUS / CURRENT / NEXT */}

{current && (

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "0.9fr 1.3fr 0.9fr",
      gap: 16,
      marginBottom: 24
    }}
  >

    {/* PREVIOUS */}

    <div
      style={{
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
        borderRadius: 20,
        padding: 18,
        minHeight: 170
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "#64748B",
          letterSpacing: 2
        }}
      >
        PREVIOUS
      </div>

      <h4
        style={{
          marginTop: 12,
          marginBottom: 8,
          color: "#0F172A"
        }}
      >
        {previous?.event_name}
      </h4>

      <div
        style={{
          color: "#475569",
          fontSize: 18
        }}
      >
        {previous?.achievement_level}
      </div>

      <div
        style={{
          marginTop: 8,
          color: "#64748B",
          fontSize: 18
        }}
      >
        {previous?.achievement_year}
      </div>
    </div>

    {/* CURRENT */}

    <div
      style={{
        background: "#D9ECE6",
        border: "1px solid #BFD8D0",
        borderRadius: 20,
        padding: 20,
        minHeight: 170,
        color: "#0F172A"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start"
        }}
      >
        <div>

          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 2,
              color: "#64748B"
            }}
          >
            CURRENT ACHIEVEMENT
          </div>

          <h3
            style={{
              marginTop: 10,
              marginBottom: 0,
              color: "#0F172A"
            }}
          >
            {current.event_name}
          </h3>

        </div>

        <div
          style={{
            background:
              current.verification_status ===
              "Verified"
                ? "#22C55E"
                : "#DC2626",
            color: "white",
            padding: "6px 12px",
            borderRadius: 999,
            fontWeight: 700,
            fontSize: 18
          }}
        >
          {current.verification_status ===
          "Verified"
            ? "✓ VERIFIED"
            : "✕ UNVERIFIED"}
        </div>

      </div>

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns:
            "repeat(2,1fr)",
          gap: 10,
          fontSize: 18
        }}
      >

        <div>
          <strong>Activity:</strong>
          <br />
          {current.activity_category}
        </div>

        <div>
          <strong>Level:</strong>
          <br />
          {current.achievement_level}
        </div>

        <div>
          <strong>Award:</strong>
          <br />
          {current.achievement_type}
        </div>

        <div>
          <strong>Year:</strong>
          <br />
          {current.achievement_year}
        </div>

      </div>

      <div
        style={{
          marginTop: 14,
          fontSize: 18,
          color: "#334155",
          lineHeight: 1.5
        }}
      >
        {current.description}
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 14
        }}
      >

        <button
          onClick={() =>
            editAchievement(
              current
            )
          }
          style={{
            border: "none",
            background: "#0B2A4A",
            color: "white",
            padding: "8px 14px",
            borderRadius: 10,
            cursor: "pointer"
          }}
        >
          ✏ Edit
        </button>

        <button
          onClick={() =>
            removeAchievement(
              current.id
            )
          }
          style={{
            border: "none",
            background: "#DC2626",
            color: "white",
            padding: "8px 14px",
            borderRadius: 10,
            cursor: "pointer"
          }}
        >
          🗑 Delete
        </button>

      </div>

    </div>

    {/* NEXT */}

    <div
      style={{
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
        borderRadius: 20,
        padding: 18,
        minHeight: 170
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "#64748B",
          letterSpacing: 2
        }}
      >
        NEXT
      </div>

      <h4
        style={{
          marginTop: 12,
          marginBottom: 8,
          color: "#0F172A"
        }}
      >
        {next?.event_name}
      </h4>

      <div
        style={{
          color: "#475569",
          fontSize: 18
        }}
      >
        {next?.achievement_level}
      </div>

      <div
        style={{
          marginTop: 8,
          color: "#64748B",
          fontSize: 18
        }}
      >
        {next?.achievement_year}
      </div>

    </div>

  </div>

)}
     {/* EVIDENCE */}

{current && (

<div
  style={{
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 30,
    padding: 30,
    marginBottom: 30
  }}
>

<h2
style={{
marginTop:0,
marginBottom:20,
color:"#0F172A"
}}
>
Achievement Evidence
</h2>

<div
style={{
display:"flex",
gap:16,
flexWrap:"wrap"
}}
>

{current.certificate_url && (

<button
onClick={()=>{
setSelectedGalleryImage(
  current.certificate_url ?? ""
);
setShowGalleryModal(true);
}}
style={{
background:"#F97316",
color:"#FFF",
border:"none",
padding:"12px 18px",
borderRadius:12,
fontWeight:700,
cursor:"pointer"
}}
>
📜 View Certificate
</button>

)}

{current.medal_photo_url && (

<button
onClick={()=>{
setSelectedGalleryImage(
  current.medal_photo_url ?? ""
);
setShowGalleryModal(true);
}}
style={{
background:"#2563EB",
color:"#FFF",
border:"none",
padding:"12px 18px",
borderRadius:12,
fontWeight:700,
cursor:"pointer"
}}
>
🥇 View Medal
</button>

)}

{current.award_photo_url && (

<button
onClick={()=>{
setSelectedGalleryImage(
  current.award_photo_url ?? ""
);
setShowGalleryModal(true);
}}
style={{
background:"#16A34A",
color:"#FFF",
border:"none",
padding:"12px 18px",
borderRadius:12,
fontWeight:700,
cursor:"pointer"
}}
>
🏆 View Award
</button>

)}

{!current.certificate_url &&
!current.medal_photo_url &&
!current.award_photo_url && (

<div
style={{
color:"#64748B",
fontWeight:600
}}
>
No evidence uploaded.
</div>

)}

</div>

</div>

)}

      {/* V4 INSIGHTS */}

<div
  style={{
    width: "100%",
    marginBottom: 24
  }}
>

  {/* INSIGHTS */}

  <div
    style={{
      background: "white",
      borderRadius: 24,
      padding: 24
    }}
  >

    <div
      style={{
        color: "#FF6B00",
        fontWeight: 700,
        fontSize: 12,
        letterSpacing: 2
      }}
    >
      TALENT INSIGHTS
    </div>

    <h2
      style={{
        color: "#0B2A4A"
      }}
    >
      Achievement Intelligence
    </h2>

    <div
      style={{
        marginTop: 20,
        display: "grid",
        gap: 15
      }}
    >

      <div>
        🏆 Highest Level:
        {" "}
        {
          getHighestLevel()
        }
      </div>

      <div>
        📚 Categories Participated:
        {" "}
        {
          categoriesCount
        }
      </div>

      <div>
        ✅ Verified Achievements:
        {" "}
        {
          verifiedCount
        }
      </div>

      <div>
        🎯 Journey Completion:
        {" "}
        {
          getCompletionPercentage()
        }
        %
      </div>

    </div>

  </div>


</div>

       {/* MODAL */}

      {showForm && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20
          }}
        >

          <div
            style={{
              width: "100%",
              maxWidth: 1100,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "white",
              borderRadius: 30,
              padding: 35
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom: 25
              }}
            >

              <div>

                <div
                  style={{
                    color:
                      "#FF6B00",
                    fontSize: 12,
                    letterSpacing: 2,
                    fontWeight: 700
                  }}
                >
                  STUDENT TIMELINE
                </div>

                <h2
                  style={{
                    marginTop: 10,
                    color:
                      "#0B2A4A"
                  }}
                >
                  {editMode
                    ? "Edit Achievement"
                    : "Add Achievement"}
                </h2>

              </div>

              <button
                onClick={() => {
                  resetForm();
                  setShowForm(
                    false
                  );
                }}
                style={{
                  border:
                    "none",
                  background:
                    "#E2E8F0",
                  padding:
                    "10px 16px",
                  borderRadius:
                    10,
                  cursor:
                    "pointer"
                }}
              >
                ✕ Close
              </button>

            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: 18
              }}
            >

              <div>
                <label>
                  Academic Year
                </label>

                <input
                  value={
                    form.achievement_year
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      achievement_year:
                        e.target
                          .value
                    })
                  }
                  style={{
                    width:
                      "100%",
                    padding:
                      14,
                    marginTop:
                      8,
                    borderRadius:
                      12,
                    border:
                      "1px solid #CBD5E1"
                  }}
                />
              </div>

              <div>
                <label>
                  Activity Category
                </label>

                <select
                  value={
                    form.activity_category
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      activity_category:
                        e.target
                          .value
                    })
                  }
                  style={{
                    width:
                      "100%",
                    padding:
                      14,
                    marginTop:
                      8,
                    borderRadius:
                      12
                  }}
                >
                  <option>
                    Select
                  </option>

                  <option>
                    Debate
                  </option>

                  <option>
                    Drama
                  </option>

                  <option>
                    Dance
                  </option>

                  <option>
                    Music
                  </option>

                  <option>
                    Sports
                  </option>

                  <option>
                    Olympiad
                  </option>

                  <option>
                    MUN
                  </option>

                  <option>
                    Quiz
                  </option>

                  <option>
                    Art
                  </option>

                  <option value="Other">
  Other (Custom)
</option>

                </select>

{
  form.activity_category ===
  "Other" && (

    <div
      style={{
        marginTop: 15
      }}
    >

      <label>
        Custom Activity
      </label>

      <input
        value={
          form.custom_activity
        }
        onChange={(e) =>
          setForm({
            ...form,
            custom_activity:
              e.target
                .value
          })
        }
        placeholder="Chess, Coding, Robotics, Photography..."
        style={{
          width: "100%",
          padding: 14,
          marginTop: 8,
          borderRadius: 12,
          border:
            "1px solid #CBD5E1"
        }}
      />

    </div>

  )
}

              </div>

              <div>
                <label>
                  Event Name
                </label>

                <input
                  value={
                    form.event_name
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      event_name:
                        e.target
                          .value
                    })
                  }
                  style={{
                    width:
                      "100%",
                    padding:
                      14,
                    marginTop:
                      8,
                    borderRadius:
                      12
                  }}
                />
              </div>

              <div>
                <label>
                  Location
                </label>

                <input
                  value={
                    form.location
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      location:
                        e.target
                          .value
                    })
                  }
                  style={{
                    width:
                      "100%",
                    padding:
                      14,
                    marginTop:
                      8,
                    borderRadius:
                      12
                  }}
                />
              </div>

              <div>
                <label>
                  Organised By
                </label>

                <input
                  value={
                    form.organised_by
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      organised_by:
                        e.target
                          .value
                    })
                  }
                  style={{
                    width:
                      "100%",
                    padding:
                      14,
                    marginTop:
                      8,
                    borderRadius:
                      12
                  }}
                />
              </div>

              <div>
                <label>
                  Judges
                </label>

                <input
                  value={
                    form.judges
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      judges:
                        e.target
                          .value
                    })
                  }
                  style={{
                    width:
                      "100%",
                    padding:
                      14,
                    marginTop:
                      8,
                    borderRadius:
                      12
                  }}
                />
              </div>

              <div>
                <label>
                  Achievement Level
                </label>

                <select
                  value={
                    form.achievement_level
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      achievement_level:
                        e.target
                          .value
                    })
                  }
                  style={{
                    width:
                      "100%",
                    padding:
                      14,
                    marginTop:
                      8,
                    borderRadius:
                      12
                  }}
                >
                  <option>
                    Select
                  </option>

                  <option>
                    Intra School
                  </option>

                  <option>
                    Inter School
                  </option>

                  <option>
                    District
                  </option>

                  <option>
                    State
                  </option>

                  <option>
                    National
                  </option>

                </select>
              </div>

              <div>
                <label>
                  Award Won
                </label>

                <input
                  value={
                    form.achievement_type
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      achievement_type:
                        e.target
                          .value
                    })
                  }
                  style={{
                    width:
                      "100%",
                    padding:
                      14,
                    marginTop:
                      8,
                    borderRadius:
                      12
                  }}
                />
              </div>

            </div>

            <div
              style={{
                marginTop: 20
              }}
            >

              <label>
                Performance Description
              </label>

              <textarea
                value={
                  form.description
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    description:
                      e.target
                        .value
                  })
                }
                style={{
                  width:
                    "100%",
                  minHeight:
                    140,
                  padding:
                    14,
                  marginTop:
                    8,
                  borderRadius:
                    12
                }}
              />

            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr 1fr",
                gap: 18,
                marginTop: 25
              }}
            >

              <div>

                <label>
                  Certificate
                </label>

                <input
                  type="file"
                  onChange={(e) =>
                    setCertificateFile(
                      e.target
                        .files?.[0] ||
                        null
                    )
                  }
                />

              </div>

              <div>

                <label>
                  Medal Photo
                </label>

                <input
                  type="file"
                  onChange={(e) =>
                    setMedalFile(
                      e.target
                        .files?.[0] ||
                        null
                    )
                  }
                />

              </div>

              <div>

                <label>
                  Award Photograph
                </label>

                <input
                  type="file"
                  onChange={(e) =>
                    setAwardFile(
                      e.target
                        .files?.[0] ||
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
                gap: 12,
                marginTop: 30
              }}
            >

              <button
                onClick={() => {
                  resetForm();
                  setShowForm(
                    false
                  );
                }}
                style={{
                  padding:
                    "12px 18px",
                  borderRadius:
                    12,
                  border:
                    "1px solid #CBD5E1"
                }}
              >
                Cancel
              </button>

              <button
                onClick={
                  saveAchievement
                }
                disabled={
                  saving
                }
                style={{
                  background:
                    "#FF6B00",
                  color:
                    "white",
                  border:
                    "none",
                  padding:
                    "12px 22px",
                  borderRadius:
                    12,
                  fontWeight:
                    700,
                  cursor:
                    "pointer"
                }}
              >
                {saving
                  ? "Saving..."
                  : editMode
                  ? "Update Achievement"
                  : "Save Achievement"}
              </button>

            </div>

          </div>

        </div>

      )}
{showGalleryModal && (

<div
  onClick={() => setShowGalleryModal(false)}
  style={{
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.92)",
    zIndex: 99999,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 30
  }}
>

  <img
    src={selectedGalleryImage}
    alt="Achievement Evidence"
    style={{
      maxWidth: "95%",
      maxHeight: "90%",
      borderRadius: 20,
      objectFit: "contain"
    }}
  />

  <button
    onClick={(e) => {
      e.stopPropagation();
      setShowGalleryModal(false);
    }}
    style={{
      position: "absolute",
      top: 20,
      right: 20,
      background: "#FF6B00",
      color: "#FFF",
      border: "none",
      padding: "12px 18px",
      borderRadius: 12,
      cursor: "pointer",
      fontWeight: 700
    }}
  >
    ✕ Close
  </button>

</div>

)}
<style>
  {`
    @keyframes slideGallery {
      from {
        opacity: 0;
        transform:
          translateX(80px);
      }

      to {
        opacity: 1;
        transform:
          translateX(0);
      }
    }
  `}
</style>
    </div>
  );
}
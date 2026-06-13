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

  const profile = JSON.parse(
    localStorage.getItem(
      "studentProfile"
    ) || "{}"
  );

  const studentId =
    profile?.id;

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
      await getStudentAchievements(
        studentId
      );

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

  const gallery =
  
    current
      ? [
          current.certificate_url,
          current.medal_photo_url,
          current.award_photo_url
        ].filter(
          Boolean
        )
      : [];

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
{/* V4 PREMIUM DASHBOARD */}

<div
  style={{
    background:
      "linear-gradient(135deg,#071226,#0B2A4A)",
    padding: 30,
    borderRadius: 30,
    marginBottom: 30,
    color: "white"
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
          color: "#FF6B00",
          fontWeight: 700,
          letterSpacing: 2,
          fontSize: 12
        }}
      >
        TALENT PASSPORT
      </div>

      <h1
        style={{
          marginTop: 12,
          marginBottom: 0
        }}
      >
        Talent Journey Intelligence
      </h1>

    </div>

    <div
      style={{
        textAlign: "right"
      }}
    >

      <div
        style={{
          fontSize: 12,
          opacity: .7
        }}
      >
        Journey Score
      </div>

      <div
        style={{
          fontSize: 42,
          fontWeight: 800
        }}
      >
        {
          calculateJourneyScore()
        }
      </div>

    </div>

  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "repeat(4,1fr)",
      gap: 20
    }}
  >

    <div
      style={{
        background:
          "rgba(255,255,255,.08)",
        padding: 20,
        borderRadius: 20
      }}
    >
      <div
        style={{
          fontSize: 12,
          opacity: .7
        }}
      >
        Total Achievements
      </div>

      <h2>
        {totalCount}
      </h2>
    </div>

    <div
      style={{
        background:
          "rgba(255,255,255,.08)",
        padding: 20,
        borderRadius: 20
      }}
    >
      <div
        style={{
          fontSize: 12,
          opacity: .7
        }}
      >
        Verified
      </div>

      <h2>
        {verifiedCount}
      </h2>
    </div>

    <div
      style={{
        background:
          "rgba(255,255,255,.08)",
        padding: 20,
        borderRadius: 20
      }}
    >
      <div
        style={{
          fontSize: 12,
          opacity: .7
        }}
      >
        Categories
      </div>

      <h2>
        {categoriesCount}
      </h2>
    </div>

    <div
      style={{
        background:
          "rgba(255,255,255,.08)",
        padding: 20,
        borderRadius: 20
      }}
    >
      <div
        style={{
          fontSize: 12,
          opacity: .7
        }}
      >
        Completion
      </div>

      <h2>
        {
          getCompletionPercentage()
        }
        %
      </h2>
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
    background: "#071226",
    borderRadius: 30,
    padding: 40,
    color: "white",
    marginBottom: 30
  }}
>
  <div
    style={{
      textAlign: "center",
      marginBottom: 30,
      fontWeight: 700,
      letterSpacing: 2
    }}
  >
    TALENT JOURNEY HIGHWAY
  </div>

  <div
    style={{
      position: "relative",
      height: 260,
      overflowX: "auto",
      overflowY: "hidden"
    }}
  >
    <svg
      width={Math.max(
        achievements.length * 220,
        1200
      )}
      height="260"
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
              120 +
              index * 220;

            const y =
              index % 2 === 0
                ? 90
                : 180;

            return `${
              index === 0
                ? "M"
                : "L"
            } ${x} ${y}`;
          })
          .join(" ")}
        fill="none"
        stroke="#203A63"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>

    {achievements.map(
      (item, index) => {
        const x =
          120 +
          index * 220;

        const y =
          index % 2 === 0
            ? 90
            : 180;

        return (
          <div
            key={item.id}
            onClick={() =>
              setActiveIndex(index)
            }
            style={{
              position: "absolute",
              left: x - 35,
              top: y - 35,
              cursor: "pointer",
              textAlign: "center",
              width: 120
            }}
          >
            <div
              style={{
                width: 70,
                height: 70,
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
                transition:
                  "all .4s"
              }}
            >
              {index + 1}
            </div>

            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                fontWeight: 600
              }}
            >
              {item.event_name}
            </div>

            <div
              style={{
                fontSize: 11,
                opacity: 0.7
              }}
            >
              {
                item.achievement_year
              }
            </div>
          </div>
        );
      }
    )}

    <div
      style={{
        position: "absolute",
        left:
          120 +
          activeIndex * 220 -
          15,
        top:
          activeIndex % 2 === 0
            ? 35
            : 125,
        fontSize: 30,
        transition:
          "all 1s ease"
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
      gap: 15,
      marginTop: 25
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
          "10px 18px",
        borderRadius: 12,
        border: "none",
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
          "10px 18px",
        borderRadius: 12,
        border: "none",
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
            gridTemplateColumns:
              "1fr 1.2fr 1fr",
            gap: 20,
            marginBottom: 30
          }}
        >

          {/* PREVIOUS */}

          <div
            style={{
              background:
                "#E2E8F0",
              borderRadius: 24,
              padding: 24
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#64748B",
                letterSpacing: 2
              }}
            >
              PREVIOUS
            </div>

            <h3>
              {
                previous?.event_name
              }
            </h3>

            <div>
              {
                previous?.achievement_level
              }
            </div>

            <div
              style={{
                marginTop: 10
              }}
            >
              {
                previous?.achievement_year
              }
            </div>
          </div>

          {/* CURRENT */}

         <div
  style={{
    background:
      "#FF6B00",
    borderRadius: 24,
    padding: 28,
    color: "white",

    transition:
      "all 0.8s ease",

    transform:
      "translateX(0)",

    animation:
      "fadeSlide 0.8s ease"
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

                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: 2
                  }}
                >
                  CURRENT ACHIEVEMENT
                </div>

                <h2
                  style={{
                    marginTop: 12
                  }}
                >
                  {
                    current.event_name
                  }
                </h2>

              </div>

              <div>

               <div
  style={{
    background:
      current.verification_status ===
      "Verified"
        ? "#22C55E"
        : "#DC2626",
    padding: "8px 14px",
    borderRadius: 999,
    fontWeight: 700
  }}
>
  {current.verification_status ===
  "Verified"
    ? "✓ VERIFIED"
    : "✕ UNVERIFIED"}
</div>

              </div>
            </div>

            <div
              style={{
                marginTop: 20,
                display: "grid",
                gap: 10
              }}
            >

              <div>
                <strong>
                  Activity:
                </strong>{" "}
                {
                  current.activity_category
                }
              </div>

              <div>
                <strong>
                  Level:
                </strong>{" "}
                {
                  current.achievement_level
                }
              </div>

              <div>
                <strong>
                  Award:
                </strong>{" "}
                {
                  current.achievement_type
                }
              </div>

              <div>
                <strong>
                  Organised By:
                </strong>{" "}
                {
                  current.organised_by
                }
              </div>

              <div>
                <strong>
                  Judges:
                </strong>{" "}
                {
                  current.judges
                }
              </div>

              <div>
                <strong>
                  Location:
                </strong>{" "}
                {
                  current.location
                }
              </div>

              <div>
                <strong>
                  Year:
                </strong>{" "}
                {
                  current.achievement_year
                }
              </div>

            </div>

            <p
              style={{
                marginTop: 20,
                lineHeight: 1.8
              }}
            >
              {
                current.description
              }
            </p>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 20
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
                  background:
                    "#0B2A4A",
                  color:
                    "white",
                  padding:
                    "10px 16px",
                  borderRadius:
                    10,
                  cursor:
                    "pointer"
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
                  background:
                    "#DC2626",
                  color:
                    "white",
                  padding:
                    "10px 16px",
                  borderRadius:
                    10,
                  cursor:
                    "pointer"
                }}
              >
                🗑 Delete
              </button>

            </div>

          </div>

          {/* NEXT */}

          <div
            style={{
              background:
                "#E2E8F0",
              borderRadius: 24,
              padding: 24
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#64748B",
                letterSpacing: 2
              }}
            >
              NEXT
            </div>

            <h3>
              {next?.event_name}
            </h3>

            <div>
              {
                next?.achievement_level
              }
            </div>

            <div
              style={{
                marginTop: 10
              }}
            >
              {
                next?.achievement_year
              }
            </div>

          </div>

        </div>

      )}

      {/* GALLERY */}

      {current && (

        <div
          style={{
            background:
              "#071226",
            borderRadius: 30,
            padding: 30,
            color: "white",
            marginBottom: 30
          }}
        >

          <h2>
            Achievement Gallery
          </h2>

          <div
            style={{
              marginTop: 20
            }}
          >

            {
  gallery.length > 0 ? (

<>

<div
  style={{
    color: "red",
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 20
  }}
>
  Gallery Count: {gallery.length}
</div>

    <img
  src={
    gallery[
      selectedImage
    ]
  }
  onClick={() =>
  setShowImageViewer(
    true
  )
}
  alt=""
  style={{
    width: "100%",
    maxHeight: 500,
    objectFit: "cover",
    borderRadius: 20,
    cursor: "pointer"
  }}
/>

<div
  style={{
    display: "flex",
    gap: 12,
    marginTop: 20,
    flexWrap: "wrap"
  }}
>

  {gallery.map(
    (
      image,
      index
    ) => (

      <img
        key={index}
        src={image}
        onClick={() =>
          setSelectedImage(
            index
          )
        }
        style={{
          width: 120,
          height: 80,
          objectFit: "cover",
          borderRadius: 12,
          cursor: "pointer",
          border:
            selectedImage ===
            index
              ? "3px solid #FF6B00"
              : "2px solid transparent"
        }}
      />

    )
  )}

</div>
</>

  ) : (

    <div
      style={{
        height: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border:
          "2px dashed rgba(255,255,255,.2)",
        borderRadius: 20,
        color: "white",
        fontSize: 18
      }}
    >
      No Achievement Evidence Uploaded Yet
    </div>

  )
}
            

          </div>

        </div>

      )}

      {/* V4 INSIGHTS */}

<div
  style={{
    display: "grid",
    gridTemplateColumns:
      "1.2fr 1fr",
    gap: 24,
    marginBottom: 30
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

  {/* SKILLS */}

  <div
    style={{
      background:
        "#071226",
      color: "white",
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
      TALENT DNA
    </div>

    <h2>
      Skill Tags
    </h2>

    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        marginTop: 20
      }}
    >

      {
     getSkillTags().map(
  (
    tag: string
  ) => (

            <div
              key={tag}
              style={{
                background:
                  "#FF6B00",
                padding:
                  "8px 14px",
                borderRadius:
                  999,
                fontSize: 13,
                fontWeight: 600
              }}
            >
              {tag}
            </div>

          )
        )
      }

    </div>

  </div>

</div>
{/* V4 DNA SCOREBOARD */}

<div
  style={{
    background:
      "linear-gradient(135deg,#071226,#0B2A4A)",
    color: "white",
    padding: 30,
    borderRadius: 30,
    marginBottom: 30
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
    STUDENT POTENTIAL DNA
  </div>

  <h2>
    Growth Indicators
  </h2>

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "repeat(5,1fr)",
      gap: 20,
      marginTop: 25
    }}
  >

    {[
      {
        name:
          "Communication",
        value:
          Math.min(
            100,
            totalCount *
              8
          )
      },

      {
        name:
          "Leadership",
        value:
          Math.min(
            100,
            verifiedCount *
              10
          )
      },

      {
        name:
          "Confidence",
        value:
          Math.min(
            100,
            totalCount *
              7
          )
      },

      {
        name:
          "Collaboration",
        value:
          Math.min(
            100,
            categoriesCount *
              12
          )
      },

      {
        name:
          "Critical Thinking",
        value:
          Math.min(
            100,
            totalCount *
              6
          )
      }
    ].map(
      (
        item
      ) => (

        <div
          key={
            item.name
          }
          style={{
            background:
              "rgba(255,255,255,.08)",
            padding:
              20,
            borderRadius:
              20
          }}
        >

          <div
            style={{
              fontSize: 13,
              opacity: .8
            }}
          >
            {
              item.name
            }
          </div>

          <div
            style={{
              fontSize: 32,
              fontWeight:
                800,
              marginTop:
                10
            }}
          >
            {
              item.value
            }
          </div>

        </div>

      )
    )}

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
{showImageViewer &&
 current &&
 gallery.length > 0 && (

  <div
    onClick={() =>
      setShowImageViewer(
        false
      )
    }
    style={{
      position: "fixed",
      inset: 0,
      background:
        "rgba(0,0,0,.92)",
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 30
    }}
  >

<img
  src={
    gallery[
      selectedImage
    ]
  }
  alt=""
  style={{
    maxWidth: "95%",
    maxHeight: "90%",
    borderRadius: 20
  }}
/>

    <button
      onClick={(e) => {
        e.stopPropagation();

        setShowImageViewer(
          false
        );
      }}
      style={{
        position:
          "absolute",
        top: 20,
        right: 20,
        background:
          "#FF6B00",
        color: "white",
        border: "none",
        padding:
          "12px 18px",
        borderRadius: 12,
        cursor: "pointer"
      }}
    >
      Close
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
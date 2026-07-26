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

import TimelineHero from "./TimelineV3/components/TimelineHero";
import TimelineFilters from "./TimelineV3/components/TimelineFilters";
import JourneyHighway from "./TimelineV3/components/JourneyHighway";
import JourneySnapshot from "./TimelineV3/components/JourneySnapshot";
import EvidenceVault from "./TimelineV3/components/EvidenceVault";
import AchievementAnalytics from "./TimelineV3/components/AchievementAnalytics";
import AchievementModal from "./TimelineV3/components/AchievementModal";

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

      
<TimelineHero
  totalCount={totalCount}
  verifiedCount={verifiedCount}
/>

<TimelineFilters
  searchTerm={searchTerm}
  setSearchTerm={setSearchTerm}
  filterYear={filterYear}
  setFilterYear={setFilterYear}
  filterCategory={filterCategory}
  setFilterCategory={setFilterCategory}
  filterLevel={filterLevel}
  setFilterLevel={setFilterLevel}
  achievements={achievements}
  onAddAchievement={() => {
    resetForm();
    setShowForm(true);
  }}
/>

{/* ============================== */}
{/* STUDENT JOURNEY HEADER */}
{/* ============================== */}
<JourneyHighway
  achievements={achievements}
  activeIndex={activeIndex}
  setActiveIndex={setActiveIndex}
/>

<JourneySnapshot
  previous={previous}
  current={current}
  next={next}
  editAchievement={editAchievement}
  removeAchievement={removeAchievement}
/>

  {/* ============================== */}
{/* ACHIEVEMENT EVIDENCE */}
{/* ============================== */}

<EvidenceVault
  current={current}
  onViewCertificate={() => {
    if (!current?.certificate_url) {
      return;
    }

    setSelectedGalleryImage(
      current.certificate_url
    );

    setShowGalleryModal(true);
  }}
  onViewMedal={() => {
    if (!current?.medal_photo_url) {
      return;
    }

    setSelectedGalleryImage(
      current.medal_photo_url
    );

    setShowGalleryModal(true);
  }}
  onViewAward={() => {
    if (!current?.award_photo_url) {
      return;
    }

    setSelectedGalleryImage(
      current.award_photo_url
    );

    setShowGalleryModal(true);
  }}
/>

{/* ============================== */}
{/* ACHIEVEMENT INTELLIGENCE */}
{/* ============================== */}

<AchievementAnalytics
  highestLevel={getHighestLevel()}
  categoriesCount={categoriesCount}
  verifiedCount={verifiedCount}
  completionPercentage={getCompletionPercentage()}
  totalCount={totalCount}
/>

    {/* ============================== */}
{/* ADD / EDIT ACHIEVEMENT MODAL */}
{/* ============================== */}

<AchievementModal
  show={showForm}
  editMode={editMode}
  saving={saving}
  form={form}
  setForm={setForm}
  setCertificateFile={setCertificateFile}
  setMedalFile={setMedalFile}
  setAwardFile={setAwardFile}
  onSave={saveAchievement}
  onClose={() => {
    resetForm();
    setShowForm(false);
  }}
/>
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
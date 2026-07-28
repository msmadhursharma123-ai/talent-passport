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
  <div className="timeline-responsive-page">

    <div className="timeline-responsive-hero">
      <TimelineHero
        totalCount={totalCount}
        verifiedCount={verifiedCount}
      />
    </div>

    <div className="timeline-responsive-filters">
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
    </div>

    {/* ============================== */}
    {/* STUDENT JOURNEY HEADER */}
    {/* ============================== */}

    <div className="timeline-responsive-highway">
      <JourneyHighway
        achievements={achievements}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
      />
    </div>

    <div className="timeline-responsive-snapshot">
      <JourneySnapshot
        previous={previous}
        current={current}
        next={next}
        editAchievement={editAchievement}
        removeAchievement={removeAchievement}
      />
    </div>

    {/* ============================== */}
    {/* ACHIEVEMENT EVIDENCE */}
    {/* ============================== */}

    <div className="timeline-responsive-evidence">
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
    </div>

    {/* ============================== */}
    {/* ACHIEVEMENT INTELLIGENCE */}
    {/* ============================== */}

    <div className="timeline-responsive-analytics">
      <AchievementAnalytics
        highestLevel={getHighestLevel()}
        categoriesCount={categoriesCount}
        verifiedCount={verifiedCount}
        completionPercentage={getCompletionPercentage()}
        totalCount={totalCount}
      />
    </div>

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

/* =========================================================
   TIMELINE RESPONSIVE MASTER
   DESKTOP > 1024px UNTOUCHED

   This is the final responsive authority for:
   Hero
   Filters
   Highway
   Journey Snapshot
   Evidence Vault
   Achievement Intelligence
========================================================= */

@keyframes slideGallery {

  from {
    opacity: 0;
    transform: translateX(80px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }

}


/* =========================================================
   TABLET
   <= 1024px
========================================================= */

@media (max-width: 1024px) {

  .timeline-responsive-page {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
    overflow-x: hidden;
  }


  .timeline-responsive-hero,
  .timeline-responsive-filters,
  .timeline-responsive-highway,
  .timeline-responsive-snapshot,
  .timeline-responsive-evidence,
  .timeline-responsive-analytics {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }


  /* =====================================================
     GLOBAL TABLET TYPOGRAPHY
  ===================================================== */

  .timeline-responsive-page h1 {
    font-size: 34px !important;
    line-height: 1.08 !important;
    letter-spacing: -0.7px !important;
  }

  .timeline-responsive-page h2 {
    font-size: 23px !important;
    line-height: 1.18 !important;
  }

  .timeline-responsive-page h3 {
    font-size: 19px !important;
    line-height: 1.2 !important;
  }

  .timeline-responsive-page h4 {
    font-size: 16px !important;
    line-height: 1.25 !important;
  }

  .timeline-responsive-page p {
    font-size: 14px !important;
    line-height: 1.45 !important;
  }


  .timeline-responsive-page button,
  .timeline-responsive-page input,
  .timeline-responsive-page select,
  .timeline-responsive-page textarea {
    font-size: 14px !important;
    box-sizing: border-box;
  }


  .timeline-responsive-page img {
    max-width: 100%;
  }


  /* =====================================================
     EVIDENCE VAULT — TABLET OVERRIDE
  ===================================================== */

  .timeline-responsive-page .evidence-vault {
    padding: 24px !important;
    margin-bottom: 20px !important;
    border-radius: 24px !important;
  }

  .timeline-responsive-page .evidence-vault-header {
    gap: 16px !important;
    margin-bottom: 20px !important;
  }

  .timeline-responsive-page .evidence-vault-eyebrow {
    font-size: 11px !important;
    letter-spacing: 1.7px !important;
    margin-bottom: 7px !important;
  }

  .timeline-responsive-page .evidence-vault-title {
    font-size: 24px !important;
    line-height: 1.2 !important;
  }

  .timeline-responsive-page .evidence-vault-description {
    margin-top: 6px !important;
    font-size: 14px !important;
    line-height: 1.45 !important;
  }

  .timeline-responsive-page .evidence-vault-header-icon {
    width: 46px !important;
    height: 46px !important;
    border-radius: 14px !important;
    font-size: 21px !important;
  }

  .timeline-responsive-page .evidence-vault-grid {
    gap: 14px !important;
  }

  .timeline-responsive-page .evidence-card {
    padding: 18px !important;
    border-radius: 18px !important;
    min-height: 205px !important;
  }

  .timeline-responsive-page .evidence-card-icon {
    width: 43px !important;
    height: 43px !important;
    border-radius: 13px !important;
    font-size: 20px !important;
  }

  .timeline-responsive-page .evidence-card-status {
    padding: 5px 8px !important;
    font-size: 9px !important;
  }

  .timeline-responsive-page .evidence-card-eyebrow {
    font-size: 10px !important;
    letter-spacing: 1.2px !important;
  }

  .timeline-responsive-page .evidence-card-title {
    font-size: 17px !important;
  }

  .timeline-responsive-page .evidence-card-description {
    font-size: 12px !important;
    line-height: 1.45 !important;
  }

  .timeline-responsive-page .evidence-card-button {
    padding: 10px 12px !important;
    font-size: 12px !important;
  }


  /* =====================================================
     ACHIEVEMENT INTELLIGENCE — TABLET
  ===================================================== */

  .timeline-responsive-page .achievement-analytics {
    padding: 24px !important;
    margin-bottom: 20px !important;
    border-radius: 24px !important;
  }

  .timeline-responsive-page .achievement-analytics-header {
    gap: 16px !important;
    margin-bottom: 20px !important;
  }

  .timeline-responsive-page .achievement-analytics-eyebrow {
    font-size: 11px !important;
    letter-spacing: 1.7px !important;
    margin-bottom: 7px !important;
  }

  .timeline-responsive-page .achievement-analytics-title {
    font-size: 24px !important;
    line-height: 1.2 !important;
  }

  .timeline-responsive-page .achievement-analytics-description {
    font-size: 14px !important;
    line-height: 1.45 !important;
  }

  .timeline-responsive-page .achievement-analytics-header-icon {
    width: 46px !important;
    height: 46px !important;
    border-radius: 14px !important;
    font-size: 21px !important;
  }

  .timeline-responsive-page .achievement-analytics-grid {
    gap: 13px !important;
  }

  .timeline-responsive-page .achievement-insight-card,
  .timeline-responsive-page .achievement-completion-card {
    min-height: 135px !important;
    padding: 16px !important;
    border-radius: 17px !important;
  }

  .timeline-responsive-page .achievement-insight-eyebrow,
  .timeline-responsive-page .achievement-completion-eyebrow {
    font-size: 9px !important;
    letter-spacing: 1px !important;
  }

  .timeline-responsive-page .achievement-insight-title,
  .timeline-responsive-page .achievement-completion-title {
    font-size: 12px !important;
  }

  .timeline-responsive-page .achievement-insight-icon,
  .timeline-responsive-page .achievement-completion-icon {
    width: 35px !important;
    height: 35px !important;
    flex-basis: 35px !important;
    border-radius: 10px !important;
    font-size: 16px !important;
  }

  .timeline-responsive-page .achievement-insight-value,
  .timeline-responsive-page .achievement-completion-number {
    font-size: 22px !important;
  }

  .timeline-responsive-page .achievement-completion-percent {
    font-size: 11px !important;
  }

}


/* =========================================================
   MOBILE
   <= 768px
========================================================= */

@media (max-width: 768px) {

  .timeline-responsive-page {
    width: 100%;
    max-width: 100%;
    padding: 0 !important;
    overflow-x: hidden;
    box-sizing: border-box;
  }


  .timeline-responsive-hero,
  .timeline-responsive-filters,
  .timeline-responsive-highway,
  .timeline-responsive-snapshot,
  .timeline-responsive-evidence,
  .timeline-responsive-analytics {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }


  /* IMPORTANT:
     Do not hide content from the child cards.
  */

  .timeline-responsive-hero,
  .timeline-responsive-filters,
  .timeline-responsive-highway,
  .timeline-responsive-snapshot,
  .timeline-responsive-evidence,
  .timeline-responsive-analytics {
    overflow: visible;
  }


  /* =====================================================
     PAGE RHYTHM
  ===================================================== */

  .timeline-responsive-hero,
  .timeline-responsive-filters,
  .timeline-responsive-highway,
  .timeline-responsive-snapshot,
  .timeline-responsive-evidence,
  .timeline-responsive-analytics {
    margin-bottom: 12px;
  }


  /* =====================================================
     GLOBAL MOBILE TYPOGRAPHY
  ===================================================== */

  .timeline-responsive-page h1 {
    font-size: 25px !important;
    line-height: 1.12 !important;
    letter-spacing: -0.45px !important;
  }

  .timeline-responsive-page h2 {
    font-size: 20px !important;
    line-height: 1.2 !important;
  }

  .timeline-responsive-page h3 {
    font-size: 18px !important;
    line-height: 1.2 !important;
  }

  .timeline-responsive-page h4 {
    font-size: 15px !important;
    line-height: 1.25 !important;
  }

  .timeline-responsive-page p {
    font-size: 12px !important;
    line-height: 1.45 !important;
  }

  .timeline-responsive-page span,
  .timeline-responsive-page strong,
  .timeline-responsive-page label {
    line-height: 1.3;
  }


  /* =====================================================
     CONTROLS
  ===================================================== */

  .timeline-responsive-page input,
  .timeline-responsive-page select,
  .timeline-responsive-page textarea {
    max-width: 100% !important;
    font-size: 13px !important;
    box-sizing: border-box;
  }

  .timeline-responsive-page button {
    max-width: 100%;
    font-size: 13px !important;
    box-sizing: border-box;
  }

  .timeline-responsive-filters input,
  .timeline-responsive-filters select {
    font-size: 13px !important;
  }

  .timeline-responsive-filters button {
    font-size: 13px !important;
    font-weight: 800 !important;
  }


  /* =====================================================
     JOURNEY SNAPSHOT

     Current Achievement
     Previous Milestone
     Upcoming Goal

     JourneySnapshot currently uses inline div typography,
     so the global h1/h2 rules cannot affect it.

     These rules scale ALL textual divs in this module.
  ===================================================== */

  .timeline-responsive-page
  .timeline-responsive-snapshot
  > div {
    gap: 12px !important;
    margin-bottom: 12px !important;
  }

  .timeline-responsive-page
  .timeline-responsive-snapshot
  > div
  > div {
    min-width: 0 !important;
  }


  /* All normal snapshot text */

  .timeline-responsive-page
  .timeline-responsive-snapshot
  div {
    line-height: 1.35;
  }


  /* Buttons */

  .timeline-responsive-page
  .timeline-responsive-snapshot
  button {
    font-size: 13px !important;
  }


  /* =====================================================
     EVIDENCE VAULT — MOBILE

     Override child component's tiny responsive values.
  ===================================================== */

  .timeline-responsive-page .evidence-vault {
    width: 100% !important;
    max-width: 100% !important;

    padding: 20px !important;
    margin-bottom: 12px !important;

    border-radius: 22px !important;

    box-sizing: border-box;
  }

  .timeline-responsive-page .evidence-vault-header {
    gap: 12px !important;
    margin-bottom: 18px !important;
  }

  .timeline-responsive-page .evidence-vault-header-copy {
    flex: 1 1 auto;
    min-width: 0;
  }

  .timeline-responsive-page .evidence-vault-eyebrow {
    font-size: 10px !important;
    letter-spacing: 1.6px !important;
    margin-bottom: 6px !important;
  }

  .timeline-responsive-page .evidence-vault-title {
    font-size: 22px !important;
    line-height: 1.15 !important;
  }

  .timeline-responsive-page .evidence-vault-description {
    margin-top: 6px !important;

    font-size: 13px !important;
    line-height: 1.4 !important;
  }

  .timeline-responsive-page .evidence-vault-header-icon {
    width: 44px !important;
    height: 44px !important;

    flex: 0 0 44px;

    border-radius: 13px !important;

    font-size: 20px !important;
  }


  /* 2 COLUMN STRUCTURE
     Certificate = full row
     Medal + Award = second row
  */

  .timeline-responsive-page .evidence-vault-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr)) !important;

    gap: 10px !important;
  }

  .timeline-responsive-page
  .evidence-card:first-child {
    grid-column: 1 / -1;
  }


  /* STANDARD CARDS */

  .timeline-responsive-page .evidence-card {
    min-width: 0 !important;
    min-height: 0 !important;

    padding: 14px !important;

    border-radius: 16px !important;
  }


  /* CERTIFICATE HORIZONTAL CARD */

  .timeline-responsive-page
  .evidence-card:first-child {
    display: grid !important;

    grid-template-columns:
      auto minmax(0, 1fr) auto !important;

    column-gap: 12px !important;
    row-gap: 4px !important;

    align-items: center !important;
  }

  .timeline-responsive-page
  .evidence-card:first-child
  .evidence-card-top {
    grid-column: 1;
    grid-row: 1 / span 3;

    margin: 0 !important;
  }

  .timeline-responsive-page
  .evidence-card:first-child
  .evidence-card-status {
    display: none !important;
  }

  .timeline-responsive-page
  .evidence-card:first-child
  .evidence-card-eyebrow {
    grid-column: 2;
    grid-row: 1;

    margin: 0 !important;
  }

  .timeline-responsive-page
  .evidence-card:first-child
  .evidence-card-title {
    grid-column: 2;
    grid-row: 2;

    margin: 0 !important;
  }

  .timeline-responsive-page
  .evidence-card:first-child
  .evidence-card-description {
    grid-column: 2;
    grid-row: 3;

    margin: 0 !important;
  }

  .timeline-responsive-page
  .evidence-card:first-child
  .evidence-card-button {
    grid-column: 3;
    grid-row: 1 / span 3;

    width: auto !important;

    margin: 0 !important;

    padding: 10px 12px !important;

    white-space: nowrap;
  }


  /* CARD TOP */

  .timeline-responsive-page .evidence-card-top {
    gap: 7px !important;
    margin-bottom: 10px !important;
  }

  .timeline-responsive-page .evidence-card-icon {
    width: 38px !important;
    height: 38px !important;

    border-radius: 11px !important;

    font-size: 18px !important;
  }

  .timeline-responsive-page .evidence-card-status {
    padding: 4px 7px !important;

    font-size: 8px !important;
    letter-spacing: .3px !important;
  }


  /* CARD TEXT */

  .timeline-responsive-page .evidence-card-eyebrow {
    font-size: 9px !important;
    letter-spacing: 1px !important;

    margin-bottom: 5px !important;
  }

  .timeline-responsive-page .evidence-card-title {
    font-size: 16px !important;
    line-height: 1.2 !important;

    margin-bottom: 6px !important;
  }

  .timeline-responsive-page .evidence-card-description {
    font-size: 11px !important;
    line-height: 1.4 !important;

    margin-bottom: 12px !important;
  }

  .timeline-responsive-page .evidence-card-button {
    padding: 10px 8px !important;

    border-radius: 10px !important;

    font-size: 11px !important;
  }


  /* =====================================================
     ACHIEVEMENT INTELLIGENCE — MOBILE
  ===================================================== */

  .timeline-responsive-page .achievement-analytics {
    width: 100% !important;
    max-width: 100% !important;

    box-sizing: border-box;

    padding: 20px !important;
    margin-bottom: 12px !important;

    border-radius: 22px !important;
  }

  .timeline-responsive-page .achievement-analytics-header {
    gap: 12px !important;
    margin-bottom: 18px !important;
  }

  .timeline-responsive-page
  .achievement-analytics-header-copy {
    flex: 1 1 auto;
    min-width: 0;
  }

  .timeline-responsive-page
  .achievement-analytics-eyebrow {
    font-size: 10px !important;
    letter-spacing: 1.6px !important;
    margin-bottom: 6px !important;
  }

  .timeline-responsive-page
  .achievement-analytics-title {
    font-size: 22px !important;
    line-height: 1.15 !important;
  }

  .timeline-responsive-page
  .achievement-analytics-description {
    margin-top: 5px !important;

    font-size: 12px !important;
    line-height: 1.4 !important;
  }

  .timeline-responsive-page
  .achievement-analytics-header-icon {
    width: 44px !important;
    height: 44px !important;

    flex: 0 0 44px;

    border-radius: 13px !important;

    font-size: 20px !important;
  }


  /* 2 × 2 GRID */

  .timeline-responsive-page
  .achievement-analytics-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr)) !important;

    gap: 10px !important;
  }

  .timeline-responsive-page
  .achievement-insight-card,
  .timeline-responsive-page
  .achievement-completion-card {
    min-width: 0 !important;
    min-height: 110px !important;

    padding: 13px !important;

    border-radius: 15px !important;
  }

  .timeline-responsive-page
  .achievement-insight-card-top,
  .timeline-responsive-page
  .achievement-completion-card-top {
    gap: 7px !important;
  }

  .timeline-responsive-page
  .achievement-insight-copy,
  .timeline-responsive-page
  .achievement-completion-copy {
    min-width: 0;
  }

  .timeline-responsive-page
  .achievement-insight-eyebrow,
  .timeline-responsive-page
  .achievement-completion-eyebrow {
    margin-bottom: 4px !important;

    font-size: 8px !important;
    letter-spacing: .8px !important;

    line-height: 1.2 !important;
  }

  .timeline-responsive-page
  .achievement-insight-title,
  .timeline-responsive-page
  .achievement-completion-title {
    font-size: 11px !important;
    line-height: 1.25 !important;
  }

  .timeline-responsive-page
  .achievement-insight-icon,
  .timeline-responsive-page
  .achievement-completion-icon {
    width: 32px !important;
    height: 32px !important;

    flex: 0 0 32px;

    border-radius: 9px !important;

    font-size: 15px !important;
  }

  .timeline-responsive-page
  .achievement-insight-value {
    margin-top: 11px !important;

    font-size: 19px !important;
    line-height: 1.08 !important;

    overflow-wrap: anywhere;
  }

  .timeline-responsive-page
  .achievement-completion-content {
    margin-top: 11px !important;
  }

  .timeline-responsive-page
  .achievement-completion-value {
    gap: 3px !important;
    margin-bottom: 8px !important;
  }

  .timeline-responsive-page
  .achievement-completion-number {
    font-size: 19px !important;
  }

  .timeline-responsive-page
  .achievement-completion-percent {
    font-size: 10px !important;
  }

  .timeline-responsive-page
  .achievement-completion-track {
    height: 5px !important;
  }


  /* =====================================================
     GRID + FLEX SAFETY
  ===================================================== */

  .timeline-responsive-page
  [style*="grid-template-columns"] {
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .timeline-responsive-page
  [style*="display: flex"] {
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }


  /* =====================================================
     TEXT SAFETY
  ===================================================== */

  .timeline-responsive-page h1,
  .timeline-responsive-page h2,
  .timeline-responsive-page h3,
  .timeline-responsive-page h4,
  .timeline-responsive-page p,
  .timeline-responsive-page span,
  .timeline-responsive-page strong {
    max-width: 100%;
    overflow-wrap: break-word;
  }

}


/* =========================================================
   PHONE
   <= 520px
========================================================= */

@media (max-width: 520px) {

  .timeline-responsive-hero,
  .timeline-responsive-filters,
  .timeline-responsive-highway,
  .timeline-responsive-snapshot,
  .timeline-responsive-evidence,
  .timeline-responsive-analytics {
    margin-bottom: 10px;
  }


  /* =====================================================
     PAGE TYPOGRAPHY

     Do not crush text as the old Timeline CSS did.
  ===================================================== */

  .timeline-responsive-page h1 {
    font-size: 23px !important;
    line-height: 1.12 !important;
  }

  .timeline-responsive-page h2 {
    font-size: 19px !important;
    line-height: 1.2 !important;
  }

  .timeline-responsive-page h3 {
    font-size: 18px !important;
  }

  .timeline-responsive-page h4 {
    font-size: 14px !important;
  }

  .timeline-responsive-page p {
    font-size: 11px !important;
    line-height: 1.4 !important;
  }


  .timeline-responsive-page input,
  .timeline-responsive-page select,
  .timeline-responsive-page textarea,
  .timeline-responsive-page button {
    font-size: 12px !important;
  }


  /* =====================================================
     EVIDENCE VAULT — PHONE
  ===================================================== */

  .timeline-responsive-page .evidence-vault {
    padding: 16px !important;
    border-radius: 18px !important;
  }

  .timeline-responsive-page .evidence-vault-header {
    margin-bottom: 15px !important;
  }

  .timeline-responsive-page .evidence-vault-eyebrow {
    font-size: 9px !important;
  }

  .timeline-responsive-page .evidence-vault-title {
    font-size: 20px !important;
  }

  .timeline-responsive-page .evidence-vault-description {
    font-size: 11px !important;
  }

  .timeline-responsive-page .evidence-vault-header-icon {
    width: 40px !important;
    height: 40px !important;
    flex-basis: 40px !important;
    font-size: 18px !important;
  }

  .timeline-responsive-page .evidence-vault-grid {
    gap: 8px !important;
  }

  .timeline-responsive-page .evidence-card {
    padding: 12px !important;
  }

  .timeline-responsive-page .evidence-card-icon {
    width: 34px !important;
    height: 34px !important;
    font-size: 16px !important;
  }

  .timeline-responsive-page .evidence-card-eyebrow {
    font-size: 8px !important;
  }

  .timeline-responsive-page .evidence-card-title {
    font-size: 14px !important;
  }

  .timeline-responsive-page .evidence-card-description {
    font-size: 9.5px !important;
  }

  .timeline-responsive-page .evidence-card-button {
    font-size: 10px !important;
  }


  /* =====================================================
     ACHIEVEMENT INTELLIGENCE — PHONE
  ===================================================== */

  .timeline-responsive-page .achievement-analytics {
    padding: 16px !important;
    border-radius: 18px !important;
  }

  .timeline-responsive-page
  .achievement-analytics-header {
    margin-bottom: 15px !important;
  }

  .timeline-responsive-page
  .achievement-analytics-eyebrow {
    font-size: 9px !important;
  }

  .timeline-responsive-page
  .achievement-analytics-title {
    font-size: 20px !important;
  }

  .timeline-responsive-page
  .achievement-analytics-header-icon {
    width: 40px !important;
    height: 40px !important;
    flex-basis: 40px !important;
    font-size: 18px !important;
  }

  .timeline-responsive-page
  .achievement-analytics-grid {
    gap: 8px !important;
  }

  .timeline-responsive-page
  .achievement-insight-card,
  .timeline-responsive-page
  .achievement-completion-card {
    min-height: 104px !important;
    padding: 11px !important;
    border-radius: 13px !important;
  }

  .timeline-responsive-page
  .achievement-insight-eyebrow,
  .timeline-responsive-page
  .achievement-completion-eyebrow {
    font-size: 7px !important;
  }

  .timeline-responsive-page
  .achievement-insight-title,
  .timeline-responsive-page
  .achievement-completion-title {
    font-size: 10px !important;
  }

  .timeline-responsive-page
  .achievement-insight-icon,
  .timeline-responsive-page
  .achievement-completion-icon {
    width: 29px !important;
    height: 29px !important;
    flex-basis: 29px !important;
    font-size: 13px !important;
  }

  .timeline-responsive-page
  .achievement-insight-value,
  .timeline-responsive-page
  .achievement-completion-number {
    font-size: 17px !important;
  }

}


/* =========================================================
   390 / 400px PHONE
   <= 420px
========================================================= */

@media (max-width: 420px) {

  .timeline-responsive-hero,
  .timeline-responsive-filters,
  .timeline-responsive-highway,
  .timeline-responsive-snapshot,
  .timeline-responsive-evidence,
  .timeline-responsive-analytics {
    margin-bottom: 9px;
  }


  /* =====================================================
     GLOBAL HIERARCHY
  ===================================================== */

  .timeline-responsive-page h1 {
    font-size: 22px !important;
    line-height: 1.12 !important;
    letter-spacing: -0.35px !important;
  }

  .timeline-responsive-page h2 {
    font-size: 18px !important;
  }

  .timeline-responsive-page h3 {
    font-size: 17px !important;
  }

  .timeline-responsive-page h4 {
    font-size: 13.5px !important;
  }

  .timeline-responsive-page p {
    font-size: 10.5px !important;
    line-height: 1.4 !important;
  }


  .timeline-responsive-page input,
  .timeline-responsive-page select,
  .timeline-responsive-page textarea,
  .timeline-responsive-page button {
    font-size: 12px !important;
  }


  /* =====================================================
     EVIDENCE VAULT

     Keep Portfolio-like typography even at 390px.
  ===================================================== */

  .timeline-responsive-page .evidence-vault {
    padding: 14px !important;
    margin-bottom: 9px !important;

    border-radius: 17px !important;
  }

  .timeline-responsive-page .evidence-vault-header {
    gap: 9px !important;
    margin-bottom: 13px !important;
  }

  .timeline-responsive-page .evidence-vault-eyebrow {
    font-size: 8px !important;
    letter-spacing: 1.2px !important;
    margin-bottom: 4px !important;
  }

  .timeline-responsive-page .evidence-vault-title {
    font-size: 19px !important;
    line-height: 1.15 !important;
  }

  .timeline-responsive-page .evidence-vault-description {
    margin-top: 4px !important;

    font-size: 10.5px !important;
    line-height: 1.35 !important;
  }

  .timeline-responsive-page .evidence-vault-header-icon {
    width: 38px !important;
    height: 38px !important;

    flex-basis: 38px !important;

    border-radius: 11px !important;

    font-size: 17px !important;
  }

  .timeline-responsive-page .evidence-vault-grid {
    gap: 7px !important;
  }

  .timeline-responsive-page .evidence-card {
    padding: 10px !important;
    border-radius: 12px !important;
  }

  .timeline-responsive-page .evidence-card-icon {
    width: 32px !important;
    height: 32px !important;

    border-radius: 9px !important;

    font-size: 15px !important;
  }

  .timeline-responsive-page .evidence-card-status {
    padding: 3px 5px !important;
    font-size: 7px !important;
  }

  .timeline-responsive-page .evidence-card-eyebrow {
    font-size: 7.5px !important;
    letter-spacing: .7px !important;
  }

  .timeline-responsive-page .evidence-card-title {
    font-size: 13px !important;
  }

  .timeline-responsive-page .evidence-card-description {
    font-size: 9px !important;
    line-height: 1.35 !important;
  }

  .timeline-responsive-page .evidence-card-button {
    padding: 8px 6px !important;

    font-size: 9.5px !important;
  }

  .timeline-responsive-page
  .evidence-card:first-child
  .evidence-card-button {
    padding: 8px 9px !important;
  }


  /* =====================================================
     ACHIEVEMENT INTELLIGENCE
  ===================================================== */

  .timeline-responsive-page .achievement-analytics {
    padding: 14px !important;
    margin-bottom: 9px !important;

    border-radius: 17px !important;
  }

  .timeline-responsive-page
  .achievement-analytics-header {
    gap: 9px !important;
    margin-bottom: 13px !important;
  }

  .timeline-responsive-page
  .achievement-analytics-eyebrow {
    font-size: 8px !important;
    letter-spacing: 1.2px !important;
    margin-bottom: 4px !important;
  }

  .timeline-responsive-page
  .achievement-analytics-title {
    font-size: 19px !important;
    line-height: 1.15 !important;
  }

  .timeline-responsive-page
  .achievement-analytics-description {
    font-size: 10px !important;
  }

  .timeline-responsive-page
  .achievement-analytics-header-icon {
    width: 38px !important;
    height: 38px !important;

    flex-basis: 38px !important;

    font-size: 17px !important;
  }

  .timeline-responsive-page
  .achievement-analytics-grid {
    gap: 7px !important;
  }

  .timeline-responsive-page
  .achievement-insight-card,
  .timeline-responsive-page
  .achievement-completion-card {
    min-height: 98px !important;

    padding: 10px !important;

    border-radius: 12px !important;
  }

  .timeline-responsive-page
  .achievement-insight-card-top,
  .timeline-responsive-page
  .achievement-completion-card-top {
    gap: 5px !important;
  }

  .timeline-responsive-page
  .achievement-insight-eyebrow,
  .timeline-responsive-page
  .achievement-completion-eyebrow {
    font-size: 6.5px !important;
    letter-spacing: .55px !important;
  }

  .timeline-responsive-page
  .achievement-insight-title,
  .timeline-responsive-page
  .achievement-completion-title {
    font-size: 9.5px !important;
  }

  .timeline-responsive-page
  .achievement-insight-icon,
  .timeline-responsive-page
  .achievement-completion-icon {
    width: 27px !important;
    height: 27px !important;

    flex-basis: 27px !important;

    border-radius: 8px !important;

    font-size: 12px !important;
  }

  .timeline-responsive-page
  .achievement-insight-value {
    margin-top: 8px !important;

    font-size: 16px !important;
  }

  .timeline-responsive-page
  .achievement-completion-content {
    margin-top: 8px !important;
  }

  .timeline-responsive-page
  .achievement-completion-number {
    font-size: 16px !important;
  }

  .timeline-responsive-page
  .achievement-completion-percent {
    font-size: 9px !important;
  }

  .timeline-responsive-page
  .achievement-completion-value {
    margin-bottom: 6px !important;
  }

  .timeline-responsive-page
  .achievement-completion-track {
    height: 4px !important;
  }

}


/* =========================================================
   VERY SMALL PHONE
   <= 360px
========================================================= */

@media (max-width: 360px) {

  .timeline-responsive-page h1 {
    font-size: 20px !important;
  }

  .timeline-responsive-page h2 {
    font-size: 17px !important;
  }

  .timeline-responsive-page h3 {
    font-size: 16px !important;
  }

  .timeline-responsive-page h4 {
    font-size: 13px !important;
  }

  .timeline-responsive-page p {
    font-size: 10px !important;
  }


  .timeline-responsive-page
  .evidence-vault-title,
  .timeline-responsive-page
  .achievement-analytics-title {
    font-size: 18px !important;
  }


  .timeline-responsive-page
  .evidence-card-title {
    font-size: 12px !important;
  }


  .timeline-responsive-page
  .achievement-insight-value,
  .timeline-responsive-page
  .achievement-completion-number {
    font-size: 15px !important;
  }

}

`}
</style>
    </div>
  );
}
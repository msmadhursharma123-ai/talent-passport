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

      }, 3500);

    return () =>
      clearInterval(
        timer
      );

  }, [
    autoPlay,
    achievements
  ]);

  useEffect(() => {

    const timer =
      setInterval(() => {

        setGalleryImage(
          (
            prev
          ) =>
            prev + 1
        );

      }, 2500);

    return () =>
      clearInterval(
        timer
      );

  }, []);

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

      const verification =
        form.location &&
        form.organised_by &&
        form.judges &&
        form.description
          ? "Verified"
          : "Unverified";

      const payload = {

        student_id:
          studentId,

        ...form,

        certificate_url:
          certificateUrl,

        medal_photo_url:
          medalUrl,

        award_photo_url:
          awardUrl,

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
        item.description
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
       return (
    <div>

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
          background:
            "#071226",
          borderRadius: 30,
          padding: 40,
          color: "white",
          marginBottom: 30
        }}
      >

        <div
          style={{
            textAlign:
              "center",
            marginBottom:
              40,
            fontWeight:
              700,
            letterSpacing:
              2
          }}
        >
          TALENT JOURNEY HIGHWAY
        </div>

        <div
          style={{
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "space-between",
            gap: 10,
            overflowX:
              "auto"
          }}
        >

          {achievements.map(
            (
              item,
              index
            ) => (

              <React.Fragment
                key={
                  item.id
                }
              >

                <div
                  onClick={() =>
                    setActiveIndex(
                      index
                    )
                  }
                  style={{
                    minWidth:
                      70,
                    cursor:
                      "pointer",
                    textAlign:
                      "center"
                  }}
                >

                  <div
                    style={{
                      width:
                        60,
                      height:
                        60,
                      borderRadius:
                        "50%",
                      background:
                        activeIndex ===
                        index
                          ? "#FF6B00"
                          : "#22304A",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      margin:
                        "0 auto",
                      fontWeight:
                        700
                    }}
                  >
                    C
                    {index +
                      1}
                  </div>

                  <div
                    style={{
                      marginTop:
                        10,
                      fontSize:
                        12
                    }}
                  >
                    {
                      item.achievement_year
                    }
                  </div>

                </div>

                {index !==
                  achievements.length -
                    1 && (

                  <div
                    style={{
                      flex: 1,
                      height: 4,
                      background:
                        "#22304A"
                    }}
                  />

                )}

              </React.Fragment>

            )
          )}

        </div>

        <div
          style={{
            display:
              "flex",
            justifyContent:
              "center",
            gap: 15,
            marginTop:
              35
          }}
        >

          <button
            onClick={() =>
              setActiveIndex(
                Math.max(
                  activeIndex -
                    1,
                  0
                )
              )
            }
            style={{
              padding:
                "10px 18px",
              borderRadius:
                12,
              border:
                "none",
              cursor:
                "pointer"
            }}
          >
            ← Previous
          </button>

          <button
            onClick={() =>
              setActiveIndex(
                Math.min(
                  activeIndex +
                    1,
                  achievements.length -
                    1
                )
              )
            }
            style={{
              padding:
                "10px 18px",
              borderRadius:
                12,
              border:
                "none",
              cursor:
                "pointer"
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
              color: "white"
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

                {current.verification_status ===
                "Verified"
                  ? "✅ Verified"
                  : "⚠️ Unverified"}

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

      {current &&
        gallery.length >
          0 && (

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

            <img
              src={
                gallery[
                  galleryImage %
                    gallery.length
                ]
              }
              alt=""
              style={{
                width: "100%",
                maxHeight: 500,
                objectFit:
                  "cover",
                borderRadius: 20
              }}
            />

          </div>

        </div>

      )}
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

                  <option>
                    Other
                  </option>

                </select>

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

    </div>
  );
}
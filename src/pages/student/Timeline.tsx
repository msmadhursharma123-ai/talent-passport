import React, {
  useEffect,
  useState
} from "react";

import {
  createAchievement,
  getStudentAchievements
} from "../../data/timelineRepository";

import {
  uploadAchievementFile
} from "../../data/timelineStorage";

export default function Timeline() {

  const [showForm, setShowForm] =
    useState(false);

  const [achievements, setAchievements] =
    useState<any[]>([]);

  const [saving, setSaving] =
    useState(false);

  const [certificateFile,
    setCertificateFile] =
    useState<File | null>(null);

  const [medalFile,
    setMedalFile] =
    useState<File | null>(null);

  const [awardFile,
    setAwardFile] =
    useState<File | null>(null);

  const profile = JSON.parse(
    localStorage.getItem(
      "studentProfile"
    ) || "{}"
  );

  const studentId =
    profile?.id;

  const [form, setForm] =
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

    if (!studentId) return;

    const rows =
      await getStudentAchievements(
        studentId
      );

    setAchievements(rows);
  }

  useEffect(() => {
    loadData();
  }, []);

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

      const verification =
        form.location &&
        form.organised_by &&
        form.judges &&
        form.description
          ? "Verified"
          : "Unverified";

      const certificateUrl =
        certificateFile
          ? await uploadAchievementFile(
              "achievement-certificates",
              certificateFile
            )
          : null;

      const medalUrl =
        medalFile
          ? await uploadAchievementFile(
              "achievement-medals",
              medalFile
            )
          : null;

      const awardUrl =
        awardFile
          ? await uploadAchievementFile(
              "achievement-awards",
              awardFile
            )
          : null;

      await createAchievement({

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
      });

      setShowForm(false);

      setForm({
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

      setCertificateFile(null);
      setMedalFile(null);
      setAwardFile(null);

      await loadData();

    } finally {

      setSaving(false);

    }
  }

  return (
    <div>

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
              marginTop: 8
            }}
          >
            Achievement Timeline
          </h1>

        </div>

        <button
          onClick={() =>
            setShowForm(true)
          }
          style={{
            background:
              "#FF6B00",
            color: "white",
            border: "none",
            borderRadius: 14,
            padding:
              "14px 24px",
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          + Add Achievement
        </button>

      </div>

{/* CREDIT SUMMARY */}

<div
  style={{
    background: "#FFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 25
  }}
>
  <div
    style={{
      fontWeight: 700,
      marginBottom: 18
    }}
  >
    🎓 Achievement Credit Summary
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "repeat(4,1fr)",
      gap: 15
    }}
  >
    <div
      style={{
        background: "#E8E1D6",
        borderRadius: 16,
        padding: 18
      }}
    >
      <div>Total Credits</div>
      <h2>
        {achievements.length * 25}
      </h2>
    </div>

    <div
      style={{
        background: "#DCE3EF",
        borderRadius: 16,
        padding: 18
      }}
    >
      <div>Achievements</div>
      <h2>
        {achievements.length}
      </h2>
    </div>

    <div
      style={{
        background: "#D9ECE6",
        borderRadius: 16,
        padding: 18
      }}
    >
      <div>Verified</div>
      <h2>
        {
          achievements.filter(
            (a) =>
              a.verification_status ===
              "Verified"
          ).length
        }
      </h2>
    </div>

    <div
      style={{
        background: "#E8E7F7",
        borderRadius: 16,
        padding: 18
      }}
    >
      <div>Categories</div>
      <h2>
        {
          new Set(
            achievements.map(
              (a) =>
                a.activity_category
            )
          ).size
        }
      </h2>
    </div>
  </div>
</div>

      {showForm && (

  <div
    onClick={() =>
      setShowForm(false)
    }
    style={{
      position: "fixed",
      inset: 0,
      background:
        "rgba(0,0,0,0.65)",
      zIndex: 9999,
      display: "flex",
      justifyContent:
        "center",
      alignItems: "center",
      padding: 30
    }}
  >

    <div
      onClick={(e) =>
        e.stopPropagation()
      }
      style={{
        background: "#FFF",
        width: "100%",
        maxWidth: 900,
        maxHeight: "90vh",
        overflowY: "auto",
        borderRadius: 24,
        padding: 30,
        color: "#0F172A",
        position: "relative"
      }}
    >

          <div
  style={{
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 20
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
      ACHIEVEMENT SUBMISSION
    </div>

    <h2
      style={{
        marginTop: 8,
        marginBottom: 0
      }}
    >
      Add Achievement
    </h2>

  </div>

  <button
    onClick={() =>
      setShowForm(false)
    }
    style={{
      background: "#F1F5F9",
      border: "none",
      borderRadius: 12,
      width: 40,
      height: 40,
      cursor: "pointer",
      fontSize: 18
    }}
  >
    ✕
  </button>

</div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: 15
            }}
          >

            <input
              placeholder="Year"
              onChange={(e) =>
                setForm({
                  ...form,
                  achievement_year:
                    e.target.value
                })
              }
            />

            <select
              onChange={(e) =>
                setForm({
                  ...form,
                  activity_category:
                    e.target.value
                })
              }
            >
              <option>
                Select Activity
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

            </select>

            <input
              placeholder="Event Name"
              onChange={(e) =>
                setForm({
                  ...form,
                  event_name:
                    e.target.value
                })
              }
            />

            <input
              placeholder="Location"
              onChange={(e) =>
                setForm({
                  ...form,
                  location:
                    e.target.value
                })
              }
            />

            <input
              placeholder="Organised By"
              onChange={(e) =>
                setForm({
                  ...form,
                  organised_by:
                    e.target.value
                })
              }
            />

            <input
              placeholder="Judges"
              onChange={(e) =>
                setForm({
                  ...form,
                  judges:
                    e.target.value
                })
              }
            />

            <select
              onChange={(e) =>
                setForm({
                  ...form,
                  achievement_level:
                    e.target.value
                })
              }
            >
              <option>
                Level
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

            <input
              placeholder="Award Won"
              onChange={(e) =>
                setForm({
                  ...form,
                  achievement_type:
                    e.target.value
                })
              }
            />

          </div>

          <div
            style={{
              marginTop: 20,
              display: "grid",
              gap: 15
            }}
          >

            <div>

              <div>
                Certificate
              </div>

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

              <div>
                Medal / Trophy Photo
              </div>

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

              <div>
                Award Receiving Photo
              </div>

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

          <textarea
            placeholder="Description"
            style={{
              width: "100%",
              minHeight: 120,
              marginTop: 20
            }}
            onChange={(e) =>
              setForm({
                ...form,
                description:
                  e.target.value
              })
            }
          />

           <button
            onClick={
              saveAchievement
            }
            disabled={saving}
            style={{
              marginTop: 20,
              background:
                "#FF6B00",
              color: "white",
              border: "none",
              borderRadius: 12,
              padding:
                "12px 24px",
              fontWeight: 700
            }}
          >
            {saving
              ? "Saving..."
              : "Save Achievement"}
          </button>

        </div>

      </div>

    )}

     <div
  style={{
    display: "grid",
    gap: 18
  }}
>

  {achievements.map(
    (item: any) => (

      <div
        key={item.id}
        style={{
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: 24,
          padding: 24
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
                fontSize: 12,
                color: "#F97316",
                fontWeight: 700,
                letterSpacing: 1
              }}
            >
              ACHIEVEMENT
            </div>

            <h3
              style={{
                marginTop: 8,
                marginBottom: 6,
                color: "#0F172A"
              }}
            >
              {item.event_name}
            </h3>

            <div
              style={{
                color: "#64748B",
                fontSize: 14
              }}
            >
              {item.activity_category}
            </div>

          </div>

          {item.verification_status ===
          "Verified" ? (

            <div
              style={{
                background: "#DCFCE7",
                color: "#166534",
                padding: "8px 14px",
                borderRadius: 999,
                fontWeight: 600,
                fontSize: 13
              }}
            >
              ✓ Verified
            </div>

          ) : (

            <div
              style={{
                background: "#FEF3C7",
                color: "#92400E",
                padding: "8px 14px",
                borderRadius: 999,
                fontWeight: 600,
                fontSize: 13
              }}
            >
              Pending
            </div>

          )}

        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3,1fr)",
            gap: 12,
            marginTop: 18
          }}
        >

          <div
            style={{
              background: "#F8FAFC",
              borderRadius: 14,
              padding: 12
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "#64748B"
              }}
            >
              Award
            </div>

            <div
              style={{
                fontWeight: 600
              }}
            >
              {item.achievement_type}
            </div>
          </div>

          <div
            style={{
              background: "#F8FAFC",
              borderRadius: 14,
              padding: 12
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "#64748B"
              }}
            >
              Level
            </div>

            <div
              style={{
                fontWeight: 600
              }}
            >
              {item.achievement_level}
            </div>
          </div>

          <div
            style={{
              background: "#F8FAFC",
              borderRadius: 14,
              padding: 12
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "#64748B"
              }}
            >
              Year
            </div>

            <div
              style={{
                fontWeight: 600
              }}
            >
              {item.achievement_year}
            </div>
          </div>

        </div>

        {item.description && (

          <div
            style={{
              marginTop: 18,
              color: "#475569",
              lineHeight: 1.6
            }}
          >
            {item.description}
          </div>

        )}

        {(item.certificate_url ||
          item.medal_photo_url ||
          item.award_photo_url) && (

          <div
            style={{
              display: "flex",
              gap: 12,
              overflowX: "auto",
              marginTop: 20
            }}
          >

            {item.certificate_url && (
              <img
                src={item.certificate_url}
                alt=""
                style={{
                  width: 180,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 14
                }}
              />
            )}

            {item.medal_photo_url && (
              <img
                src={item.medal_photo_url}
                alt=""
                style={{
                  width: 180,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 14
                }}
              />
            )}

            {item.award_photo_url && (
              <img
                src={item.award_photo_url}
                alt=""
                style={{
                  width: 180,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 14
                }}
              />
            )}

          </div>

        )}

      </div>

    )
  )}

</div>

    </div>
  );
}
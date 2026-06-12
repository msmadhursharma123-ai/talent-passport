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

      {showForm && (

        <div
          style={{
            background:
              "#071226",
            color: "white",
            padding: 30,
            borderRadius: 24,
            marginBottom: 30
          }}
        >

          <h2>
            Add Achievement
          </h2>

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

      )}

      <div
        style={{
          display: "grid",
          gap: 20
        }}
      >
        {achievements.map(
          (item: any) => (

            <div
              key={item.id}
              style={{
                background:
                  "#071226",
                color: "white",
                borderRadius: 24,
                padding: 25
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center"
                }}
              >

                <div>

                  <h2>
                    {item.event_name}
                  </h2>

                  <div>
                    {item.activity_category}
                  </div>

                </div>

                <div>

                  {item.verification_status ===
                  "Verified"
                    ? "✅ Verified"
                    : "⚠️ Unverified"}

                </div>

              </div>

              <div
                style={{
                  marginTop: 15
                }}
              >
                <strong>
                  {item.achievement_type}
                </strong>
              </div>

              <div>
                {item.achievement_level}
              </div>

              <div>
                {item.achievement_year}
              </div>

              <p
                style={{
                  marginTop: 15
                }}
              >
                {item.description}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 15,
                  marginTop: 20,
                  flexWrap: "wrap"
                }}
              >

                {item.certificate_url && (
                  <img
                    src={
                      item.certificate_url
                    }
                    alt=""
                    style={{
                      width: 180,
                      height: 120,
                      objectFit:
                        "cover",
                      borderRadius: 12
                    }}
                  />
                )}

                {item.medal_photo_url && (
                  <img
                    src={
                      item.medal_photo_url
                    }
                    alt=""
                    style={{
                      width: 180,
                      height: 120,
                      objectFit:
                        "cover",
                      borderRadius: 12
                    }}
                  />
                )}

                {item.award_photo_url && (
                  <img
                    src={
                      item.award_photo_url
                    }
                    alt=""
                    style={{
                      width: 180,
                      height: 120,
                      objectFit:
                        "cover",
                      borderRadius: 12
                    }}
                  />
                )}

              </div>

            </div>

          )
        )}
      </div>

    </div>
  );
}
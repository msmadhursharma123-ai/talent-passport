import React from "react";

export type AchievementForm = {
  achievement_year: string | number;
  activity_category: string;
  custom_activity: string;
  event_name: string;
  location: string;
  organised_by: string;
  judges: string;
  achievement_level: string;
  achievement_type: string;
  description: string;
};

interface AchievementModalProps {
  show: boolean;
  editMode: boolean;
  saving: boolean;

  form: AchievementForm;

  setForm: React.Dispatch<
    React.SetStateAction<AchievementForm>
  >;

  setCertificateFile: React.Dispatch<
    React.SetStateAction<File | null>
  >;

  setMedalFile: React.Dispatch<
    React.SetStateAction<File | null>
  >;

  setAwardFile: React.Dispatch<
    React.SetStateAction<File | null>
  >;

  onSave: () => void;
  onClose: () => void;
}

export default function AchievementModal({
  show,
  editMode,
  saving,
  form,
  setForm,
  setCertificateFile,
  setMedalFile,
  setAwardFile,
  onSave,
  onClose,
}: AchievementModalProps) {
  if (!show) return null;

  function updateField<K extends keyof AchievementForm>(
    key: K,
    value: AchievementForm[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(7,20,45,.78)",
        backdropFilter: "blur(7px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 28,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 960,
          maxHeight: "92vh",
          overflowY: "auto",
          background: "#FFFFFF",
          borderRadius: 28,
          boxShadow:
            "0 30px 80px rgba(15,23,42,.32)",
        }}
      >
        {/* ================= HEADER ================= */}

        <div
          style={{
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(135deg,#07142D,#16335B,#244B84)",
            padding: "28px 32px",
            color: "#FFFFFF",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 190,
              height: 190,
              borderRadius: "50%",
              right: -55,
              top: -105,
              background: "rgba(255,255,255,.055)",
            }}
          />

          <div
            style={{
              position: "absolute",
              width: 130,
              height: 130,
              borderRadius: "50%",
              right: 120,
              bottom: -95,
              background: "rgba(249,115,22,.12)",
            }}
          />

          <div
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 24,
            }}
          >
            <div>
              <div
                style={{
                  color: "#FDBA74",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                Achievement Ledger
              </div>

              <h2
                style={{
                  margin: "8px 0 0",
                  fontSize: 28,
                  fontWeight: 800,
                }}
              >
                {editMode
                  ? "Edit Achievement"
                  : "Add Achievement"}
              </h2>

              <div
                style={{
                  marginTop: 7,
                  color: "#CBD5E1",
                  fontSize: 13,
                }}
              >
                Record the milestone and attach
                supporting evidence.
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,.14)",
                background: "rgba(255,255,255,.10)",
                color: "#FFFFFF",
                fontSize: 18,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ================= FORM ================= */}

        <div style={{ padding: 32 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              gap: 20,
            }}
          >
            <Field label="Academic Year">
              <input
                type="number"
                value={form.achievement_year}
           onChange={(e) =>
  updateField(
    "achievement_year",
    e.target.value
  )
}
                style={inputStyle}
              />
            </Field>

            <Field label="Activity Category">
              <>
                <select
                  value={form.activity_category}
                  onChange={(e) =>
                    updateField(
                      "activity_category",
                      e.target.value
                    )
                  }
                  style={inputStyle}
                >
                  <option value="">
                    Select Category
                  </option>
                  <option value="Debate">Debate</option>
                  <option value="Drama">Drama</option>
                  <option value="Dance">Dance</option>
                  <option value="Music">Music</option>
                  <option value="Sports">Sports</option>
                  <option value="Olympiad">
                    Olympiad
                  </option>
                  <option value="MUN">MUN</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Art">Art</option>
                  <option value="Other">
                    Other (Custom)
                  </option>
                </select>

                {form.activity_category === "Other" && (
                  <input
                    placeholder="Chess, Coding, Robotics..."
                    value={form.custom_activity}
                    onChange={(e) =>
                      updateField(
                        "custom_activity",
                        e.target.value
                      )
                    }
                    style={{
                      ...inputStyle,
                      marginTop: 10,
                    }}
                  />
                )}
              </>
            </Field>

            <Field label="Event Name">
              <input
                value={form.event_name}
                onChange={(e) =>
                  updateField(
                    "event_name",
                    e.target.value
                  )
                }
                style={inputStyle}
              />
            </Field>

            <Field label="Location">
              <input
                value={form.location}
                onChange={(e) =>
                  updateField(
                    "location",
                    e.target.value
                  )
                }
                style={inputStyle}
              />
            </Field>

            <Field label="Organised By">
              <input
                value={form.organised_by}
                onChange={(e) =>
                  updateField(
                    "organised_by",
                    e.target.value
                  )
                }
                style={inputStyle}
              />
            </Field>

            <Field label="Judges">
              <input
                value={form.judges}
                onChange={(e) =>
                  updateField(
                    "judges",
                    e.target.value
                  )
                }
                style={inputStyle}
              />
            </Field>

            <Field label="Achievement Level">
              <select
                value={form.achievement_level}
                onChange={(e) =>
                  updateField(
                    "achievement_level",
                    e.target.value
                  )
                }
                style={inputStyle}
              >
                <option value="">
                  Select Level
                </option>
                <option value="Intra School">
                  Intra School
                </option>
                <option value="Inter School">
                  Inter School
                </option>
                <option value="District">
                  District
                </option>
                <option value="State">State</option>
                <option value="National">
                  National
                </option>
              </select>
            </Field>

            <Field label="Award Won">
              <input
                value={form.achievement_type}
                onChange={(e) =>
                  updateField(
                    "achievement_type",
                    e.target.value
                  )
                }
                style={inputStyle}
              />
            </Field>
          </div>

          {/* ================= DESCRIPTION ================= */}

          <div style={{ marginTop: 24 }}>
            <Field label="Performance Description">
              <textarea
                value={form.description}
                onChange={(e) =>
                  updateField(
                    "description",
                    e.target.value
                  )
                }
                placeholder="Describe the achievement, learning, experience and outcome..."
                style={{
                  ...inputStyle,
                  minHeight: 125,
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </Field>
          </div>

          {/* ================= EVIDENCE UPLOADS ================= */}

          <div style={{ marginTop: 28 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "#F97316",
                marginBottom: 16,
              }}
            >
              Evidence Uploads
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3,1fr)",
                gap: 16,
              }}
            >
              <UploadCard
                icon="📜"
                title="Certificate"
                onChange={setCertificateFile}
              />

              <UploadCard
                icon="🥇"
                title="Medal"
                onChange={setMedalFile}
              />

              <UploadCard
                icon="🏆"
                title="Award"
                onChange={setAwardFile}
              />
            </div>
          </div>

          {/* ================= ACTIONS ================= */}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 20,
              marginTop: 30,
              paddingTop: 24,
              borderTop: "1px solid #E2E8F0",
            }}
          >
            <div
              style={{
                color: "#64748B",
                fontSize: 12,
              }}
            >
              Add accurate details and supporting
              evidence to your achievement record.
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "12px 22px",
                  borderRadius: 12,
                  border: "1px solid #CBD5E1",
                  background: "#FFFFFF",
                  color: "#334155",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                style={{
                  padding: "12px 24px",
                  borderRadius: 12,
                  border: "none",
                  background: saving
                    ? "#FDBA74"
                    : "linear-gradient(135deg,#F97316,#FB923C)",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                  boxShadow:
                    "0 10px 24px rgba(249,115,22,.20)",
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
      </div>
    </div>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          color: "#334155",
          fontSize: 12,
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        {label}
      </div>

      {children}
    </div>
  );
}

/* =========================================================
   UPLOAD CARD
========================================================= */

function UploadCard({
  icon,
  title,
  onChange,
}: {
  icon: string;
  title: string;
  onChange: React.Dispatch<
    React.SetStateAction<File | null>
  >;
}) {
  return (
    <label
      style={{
        minHeight: 135,
        border: "1.5px dashed #CBD5E1",
        borderRadius: 18,
        padding: 18,
        background: "#F8FAFC",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          fontSize: 27,
          marginBottom: 8,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          color: "#0F172A",
          fontWeight: 800,
          fontSize: 14,
        }}
      >
        {title}
      </div>

      <div
        style={{
          color: "#94A3B8",
          fontSize: 11,
          marginTop: 5,
        }}
      >
        Click to upload evidence
      </div>

      <input
        type="file"
        accept="image/*"
        hidden
        onChange={(e) =>
          onChange(
            e.target.files?.[0] ?? null
          )
        }
      />
    </label>
  );
}

/* =========================================================
   SHARED INPUT STYLE
========================================================= */

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 15px",
  borderRadius: 13,
  border: "1px solid #CBD5E1",
  background: "#F8FAFC",
  color: "#0F172A",
  fontSize: 14,
  outline: "none",
};
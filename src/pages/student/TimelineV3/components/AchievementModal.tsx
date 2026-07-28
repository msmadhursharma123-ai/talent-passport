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
      className="achievement-modal-overlay"
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
        className="achievement-modal"
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
          className="achievement-modal-header"
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
            className="achievement-modal-circle-one"
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
            className="achievement-modal-circle-two"
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
            className="achievement-modal-header-inner"
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 24,
            }}
          >
            <div className="achievement-modal-header-copy">
              <div
                className="achievement-modal-eyebrow"
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
                className="achievement-modal-title"
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
                className="achievement-modal-subtitle"
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
              className="achievement-modal-close"
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

        <div
          className="achievement-modal-body"
          style={{ padding: 32 }}
        >
          <div
            className="achievement-modal-form-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              gap: 20,
            }}
          >
            <Field label="Academic Year">
              <input
                className="achievement-modal-input"
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
                  className="achievement-modal-input"
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
                    className="achievement-modal-input achievement-modal-custom-input"
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
                className="achievement-modal-input"
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
                className="achievement-modal-input"
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
                className="achievement-modal-input"
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
                className="achievement-modal-input"
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
                className="achievement-modal-input"
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
                className="achievement-modal-input"
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

          <div
            className="achievement-modal-description-section"
            style={{ marginTop: 24 }}
          >
            <Field label="Performance Description">
              <textarea
                className="achievement-modal-input achievement-modal-textarea"
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

          <div
            className="achievement-modal-evidence"
            style={{ marginTop: 28 }}
          >
            <div
              className="achievement-modal-section-label"
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
              className="achievement-modal-upload-grid"
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
            className="achievement-modal-footer"
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
              className="achievement-modal-footer-copy"
              style={{
                color: "#64748B",
                fontSize: 12,
              }}
            >
              Add accurate details and supporting
              evidence to your achievement record.
            </div>

            <div
              className="achievement-modal-actions"
              style={{
                display: "flex",
                gap: 12,
                flexShrink: 0,
              }}
            >
              <button
                className="achievement-modal-cancel"
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
                className="achievement-modal-save"
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

      <style>{`

        /* =====================================================
           TABLET
           DESKTOP > 1024px UNTOUCHED
        ===================================================== */

        @media (max-width: 1024px) {

          .achievement-modal-overlay {
            padding: 20px !important;
          }

          .achievement-modal {
            max-width: 780px !important;
            max-height: 94vh !important;
            border-radius: 21px !important;
          }

          .achievement-modal-header {
            padding: 20px 23px !important;
          }

          .achievement-modal-header-inner {
            gap: 16px !important;
          }

          .achievement-modal-eyebrow {
            font-size: 9px !important;
            letter-spacing: 1.5px !important;
          }

          .achievement-modal-title {
            margin-top: 6px !important;
            font-size: 21px !important;
          }

          .achievement-modal-subtitle {
            margin-top: 5px !important;
            font-size: 11px !important;
          }

          .achievement-modal-close {
            width: 36px !important;
            height: 36px !important;
            border-radius: 10px !important;
            font-size: 15px !important;
          }

          .achievement-modal-body {
            padding: 22px !important;
          }

          .achievement-modal-form-grid {
            gap: 14px !important;
          }

          .achievement-modal-field-label {
            margin-bottom: 6px !important;
            font-size: 10.5px !important;
          }

          .achievement-modal-input {
            padding: 10px 12px !important;
            border-radius: 10px !important;
            font-size: 12px !important;
          }

          .achievement-modal-custom-input {
            margin-top: 7px !important;
          }

          .achievement-modal-description-section {
            margin-top: 17px !important;
          }

          .achievement-modal-textarea {
            min-height: 90px !important;
          }

          .achievement-modal-evidence {
            margin-top: 19px !important;
          }

          .achievement-modal-section-label {
            margin-bottom: 11px !important;
            font-size: 9px !important;
            letter-spacing: 1.5px !important;
          }

          .achievement-modal-upload-grid {
            gap: 10px !important;
          }

          .achievement-upload-card {
            min-height: 100px !important;
            padding: 12px !important;
            border-radius: 13px !important;
          }

          .achievement-upload-icon {
            margin-bottom: 5px !important;
            font-size: 21px !important;
          }

          .achievement-upload-title {
            font-size: 11.5px !important;
          }

          .achievement-upload-copy {
            margin-top: 3px !important;
            font-size: 9px !important;
          }

          .achievement-modal-footer {
            gap: 14px !important;
            margin-top: 20px !important;
            padding-top: 16px !important;
          }

          .achievement-modal-footer-copy {
            font-size: 10px !important;
          }

          .achievement-modal-actions {
            gap: 8px !important;
          }

          .achievement-modal-cancel,
          .achievement-modal-save {
            padding: 9px 15px !important;
            border-radius: 9px !important;
            font-size: 11px !important;
          }
        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 768px) {

          .achievement-modal-overlay {
            padding: 8px !important;

            align-items: center !important;

            box-sizing: border-box;
          }

          .achievement-modal {
            width: 100% !important;
            max-width: 100% !important;

            max-height: calc(100dvh - 16px) !important;

            border-radius: 16px !important;

            overflow-y: auto !important;

            -webkit-overflow-scrolling: touch;
          }


          /* ================= HEADER ================= */

          .achievement-modal-header {
            padding: 14px 15px !important;
          }

          .achievement-modal-header-inner {
            gap: 9px !important;
          }

          .achievement-modal-header-copy {
            flex: 1 1 auto;
            min-width: 0;
          }

          .achievement-modal-eyebrow {
            font-size: 7px !important;
            letter-spacing: 1px !important;
          }

          .achievement-modal-title {
            margin-top: 4px !important;

            font-size: 17px !important;
            line-height: 1.15 !important;
          }

          .achievement-modal-subtitle {
            margin-top: 4px !important;

            font-size: 9px !important;
            line-height: 1.3 !important;
          }

          .achievement-modal-close {
            width: 31px !important;
            height: 31px !important;

            flex: 0 0 31px;

            border-radius: 9px !important;

            font-size: 13px !important;
          }

          .achievement-modal-circle-one {
            width: 110px !important;
            height: 110px !important;

            right: -40px !important;
            top: -60px !important;
          }

          .achievement-modal-circle-two {
            width: 75px !important;
            height: 75px !important;

            right: 70px !important;
            bottom: -55px !important;
          }


          /* ================= BODY ================= */

          .achievement-modal-body {
            padding: 13px !important;
          }


          /*
             Form becomes one clean column.

             This is much safer for text entry,
             selects and the phone keyboard.
          */

          .achievement-modal-form-grid {
            grid-template-columns:
              minmax(0, 1fr) !important;

            gap: 9px !important;
          }

          .achievement-modal-field-label {
            margin-bottom: 4px !important;

            font-size: 9px !important;
          }

          .achievement-modal-input {
            min-height: 36px;

            padding: 8px 9px !important;

            border-radius: 8px !important;

            font-size: 11px !important;
          }

          .achievement-modal-custom-input {
            margin-top: 5px !important;
          }


          /* ================= DESCRIPTION ================= */

          .achievement-modal-description-section {
            margin-top: 10px !important;
          }

          .achievement-modal-textarea {
            min-height: 72px !important;

            line-height: 1.35;
          }


          /* ================= UPLOADS ================= */

          .achievement-modal-evidence {
            margin-top: 13px !important;
          }

          .achievement-modal-section-label {
            margin-bottom: 7px !important;

            font-size: 7.5px !important;
            letter-spacing: 1px !important;
          }

          .achievement-modal-upload-grid {
            grid-template-columns:
              repeat(3, minmax(0, 1fr)) !important;

            gap: 5px !important;
          }

          .achievement-upload-card {
            min-width: 0 !important;
            min-height: 76px !important;

            padding: 7px 4px !important;

            border-radius: 9px !important;
          }

          .achievement-upload-icon {
            margin-bottom: 3px !important;

            font-size: 17px !important;
          }

          .achievement-upload-title {
            font-size: 9px !important;
          }

          .achievement-upload-copy {
            margin-top: 2px !important;

            font-size: 6.5px !important;
            line-height: 1.2 !important;
          }


          /* ================= FOOTER ================= */

          .achievement-modal-footer {
            display: block !important;

            margin-top: 13px !important;
            padding-top: 11px !important;
          }

          .achievement-modal-footer-copy {
            margin-bottom: 8px;

            font-size: 8px !important;
            line-height: 1.3;
          }

          .achievement-modal-actions {
            width: 100%;

            display: grid !important;
            grid-template-columns:
              minmax(0, .8fr)
              minmax(0, 1.2fr) !important;

            gap: 6px !important;
          }

          .achievement-modal-cancel,
          .achievement-modal-save {
            width: 100%;

            padding: 8px 7px !important;

            border-radius: 8px !important;

            font-size: 9.5px !important;
          }
        }


        /* =====================================================
           520px
        ===================================================== */

        @media (max-width: 520px) {

          .achievement-modal-overlay {
            padding: 6px !important;
          }

          .achievement-modal {
            max-height: calc(100dvh - 12px) !important;
            border-radius: 14px !important;
          }

          .achievement-modal-header {
            padding: 12px 13px !important;
          }

          .achievement-modal-title {
            font-size: 16px !important;
          }

          .achievement-modal-body {
            padding: 11px !important;
          }

          .achievement-modal-form-grid {
            gap: 8px !important;
          }

          .achievement-modal-input {
            min-height: 34px;
            padding: 7px 8px !important;
            font-size: 10.5px !important;
          }

          .achievement-modal-upload-grid {
            gap: 4px !important;
          }

          .achievement-upload-card {
            min-height: 70px !important;
          }
        }


        /* =====================================================
           390px / 400px
        ===================================================== */

        @media (max-width: 420px) {

          .achievement-modal-overlay {
            padding: 5px !important;
          }

          .achievement-modal {
            max-height: calc(100dvh - 10px) !important;

            border-radius: 13px !important;
          }

          .achievement-modal-header {
            padding: 11px 12px !important;
          }

          .achievement-modal-eyebrow {
            font-size: 6.5px !important;
          }

          .achievement-modal-title {
            font-size: 15px !important;
          }

          .achievement-modal-subtitle {
            font-size: 8px !important;
          }

          .achievement-modal-close {
            width: 29px !important;
            height: 29px !important;

            flex-basis: 29px;

            font-size: 12px !important;
          }

          .achievement-modal-body {
            padding: 10px !important;
          }

          .achievement-modal-field-label {
            font-size: 8.5px !important;
          }

          .achievement-modal-input {
            min-height: 33px;

            padding: 7px 8px !important;

            font-size: 10px !important;
          }

          .achievement-modal-textarea {
            min-height: 65px !important;
          }

          .achievement-modal-section-label {
            font-size: 7px !important;
          }

          .achievement-upload-card {
            min-height: 65px !important;

            padding: 6px 3px !important;

            border-radius: 8px !important;
          }

          .achievement-upload-icon {
            font-size: 15px !important;
          }

          .achievement-upload-title {
            font-size: 8px !important;
          }

          .achievement-upload-copy {
            font-size: 6px !important;
          }

          .achievement-modal-footer {
            margin-top: 11px !important;
            padding-top: 9px !important;
          }

          .achievement-modal-footer-copy {
            font-size: 7.5px !important;
          }

          .achievement-modal-cancel,
          .achievement-modal-save {
            padding: 7px 5px !important;

            font-size: 9px !important;
          }
        }

      `}</style>
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
    <div className="achievement-modal-field">
      <div
        className="achievement-modal-field-label"
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
      className="achievement-upload-card"
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
        className="achievement-upload-icon"
        style={{
          fontSize: 27,
          marginBottom: 8,
        }}
      >
        {icon}
      </div>

      <div
        className="achievement-upload-title"
        style={{
          color: "#0F172A",
          fontWeight: 800,
          fontSize: 14,
        }}
      >
        {title}
      </div>

      <div
        className="achievement-upload-copy"
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
import React, { useEffect, useState } from "react";

import {
  fetchLeadActivity,
  updateLeadNotes,
  updateLeadFollowup,
  logLeadCall,
  logLeadWhatsapp,
  logLeadCounselling,
  logLeadAdmission,
} from "../../data/partnerMarketplaceRepository";

interface Props {
  lead: any;
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function LeadCRMDrawer({
  lead,
  open,
  onClose,
  onRefresh,
}: Props) {
  const [notes, setNotes] = useState("");
  const [followupDate, setFollowupDate] = useState("");
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (!lead) return;

    setNotes(lead.notes || "");
    setFollowupDate(lead.next_followup_date || "");

    loadActivities();
  }, [lead]);

  async function loadActivities() {
    if (!lead) return;

    const data = await fetchLeadActivity(lead.id);

    setActivities(data || []);
  }

  async function saveNotes() {
    await updateLeadNotes(lead.id, notes);

    await loadActivities();

    onRefresh();

    alert("Notes Saved");
  }

  async function saveFollowup() {
    await updateLeadFollowup(lead.id, followupDate);

    await loadActivities();

    onRefresh();

    alert("Follow Up Saved");
  }

  async function handleCall() {
    await logLeadCall(lead.id);

    await loadActivities();

    onRefresh();
  }

  async function handleWhatsapp() {
    await logLeadWhatsapp(lead.id);

    await loadActivities();

    onRefresh();
  }

  async function handleCounselling() {
    await logLeadCounselling(lead.id);

    await loadActivities();

    onRefresh();
  }

  async function handleAdmission() {
    await logLeadAdmission(lead.id);

    await loadActivities();

    onRefresh();
  }

  if (!open || !lead) return null;

  const statusText = String(lead.status || "Lead")
    .replace(/_/g, " ")
    .trim();

  const sourceText = String(lead.lead_source || "Partner CRM")
    .replace(/_/g, " ")
    .trim();

  return (
    <div className="lead-crm-overlay">
      <aside className="lead-crm-drawer">
        {/* =========================================
            HERO / DRAWER HEADER
        ========================================== */}

        <section className="lead-crm-hero">
          <div className="lead-crm-hero-circle lead-crm-hero-circle-one" />
          <div className="lead-crm-hero-circle lead-crm-hero-circle-two" />

          <div className="lead-crm-hero-content">
            <div className="lead-crm-eyebrow">PARTNER CRM</div>

            <h2 className="lead-crm-title">Lead Profile</h2>

            <p className="lead-crm-subtitle">
              Review student information, manage follow-ups and keep every CRM
              interaction in one place.
            </p>

            <div className="lead-crm-hero-badges">
              <span className="lead-crm-badge lead-crm-badge-orange">
                {sourceText}
              </span>

              <span className="lead-crm-badge lead-crm-badge-blue">
                CRM LEAD
              </span>
            </div>
          </div>

          <div className="lead-crm-hero-mark" aria-hidden="true">
            <div className="lead-crm-hero-mark-icon">◇</div>
            <div className="lead-crm-hero-mark-label">LEAD CRM</div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="lead-crm-close"
            aria-label="Close lead profile"
          >
            ×
          </button>
        </section>

        {/* =========================================
            LEAD SNAPSHOT
        ========================================== */}

        <section className="lead-crm-section">
          <SectionHeading
            eyebrow="LEAD INTELLIGENCE"
            title="Student Snapshot"
            description="Key information attached to this CRM opportunity."
            sideLabel="PARTNER CRM RECORD"
          />

          <div className="lead-crm-info-grid">
            <InfoCard
              tone="orange"
              icon="M"
              label="Student"
              value={lead.student_name}
            />

            <InfoCard
              tone="blue"
              icon="⌂"
              label="School"
              value={lead.school_name}
            />

            <InfoCard
              tone="green"
              icon="☎"
              label="Phone"
              value={lead.phone || "-"}
            />

            <InfoCard
              tone="purple"
              icon="@"
              label="Email"
              value={lead.email || "-"}
            />

            <InfoCard
              tone="orange"
              icon="↗"
              label="Lead Source"
              value={lead.lead_source}
            />

            <InfoCard
              tone="blue"
              icon="◇"
              label="Request Type"
              value={lead.request_type}
            />

            <InfoCard
              tone="green"
              icon="✓"
              label="Current Status"
              value={lead.status}
              status
            />

            <InfoCard
              tone="purple"
              icon="#"
              label="Class"
              value={lead.class_name || "-"}
            />
          </div>
        </section>

        {/* =========================================
            NOTES
        ========================================== */}

        <section className="lead-crm-section lead-crm-section-accent">
          <SectionHeading
            eyebrow="CRM NOTES"
            title="Lead Notes"
            description="Keep important context, conversations and observations attached to this lead."
          />

          <div className="lead-crm-editor">
            <div className="lead-crm-editor-top">
              <div>
                <div className="lead-crm-field-label">WORKING NOTES</div>
                <div className="lead-crm-field-helper">
                  Add information useful for future follow-ups.
                </div>
              </div>

              <div className="lead-crm-editor-icon">✎</div>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className="lead-crm-textarea"
              placeholder="Add notes about this student, conversation or opportunity..."
            />

            <div className="lead-crm-editor-actions">
              <button
                type="button"
                onClick={saveNotes}
                className="lead-crm-primary-button"
              >
                Save Notes
              </button>
            </div>
          </div>
        </section>

        {/* =========================================
            FOLLOW UP + QUICK ACTIONS
        ========================================== */}

        <section className="lead-crm-section">
          <SectionHeading
            eyebrow="CRM ACTION CENTRE"
            title="Follow Up & Quick Actions"
            description="Schedule the next touchpoint or record an interaction with this lead."
          />

          <div className="lead-crm-action-layout">
            {/* FOLLOW UP */}

            <div className="lead-crm-action-panel lead-crm-followup-panel">
              <div className="lead-crm-action-panel-heading">
                <div className="lead-crm-action-icon orange">⌁</div>

                <div>
                  <div className="lead-crm-action-kicker">
                    NEXT TOUCHPOINT
                  </div>

                  <h3>Schedule Follow Up</h3>
                </div>
              </div>

              <p className="lead-crm-action-description">
                Set the next date for reconnecting with this student lead.
              </p>

              <div className="lead-crm-followup-row">
                <input
                  type="date"
                  value={followupDate}
                  onChange={(e) => setFollowupDate(e.target.value)}
                  className="lead-crm-date-input"
                />

                <button
                  type="button"
                  onClick={saveFollowup}
                  className="lead-crm-primary-button"
                >
                  Save Follow Up
                </button>
              </div>
            </div>

            {/* QUICK ACTIONS */}

            <div className="lead-crm-action-panel lead-crm-quick-panel">
              <div className="lead-crm-action-panel-heading">
                <div className="lead-crm-action-icon blue">✦</div>

                <div>
                  <div className="lead-crm-action-kicker">
                    ENGAGEMENT DESK
                  </div>

                  <h3>Quick Actions</h3>
                </div>
              </div>

              <p className="lead-crm-action-description">
                Record the next CRM interaction without leaving the lead
                profile.
              </p>

              <div className="lead-crm-quick-grid">
                <button
                  type="button"
                  onClick={handleCall}
                  className="lead-crm-quick-button call"
                >
                  <span className="lead-crm-quick-icon">☎</span>

                  <span>
                    <strong>Log Call</strong>
                    <small>Record call</small>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsapp}
                  className="lead-crm-quick-button whatsapp"
                >
                  <span className="lead-crm-quick-icon">●</span>

                  <span>
                    <strong>WhatsApp</strong>
                    <small>Record chat</small>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleCounselling}
                  className="lead-crm-quick-button counselling"
                >
                  <span className="lead-crm-quick-icon">◆</span>

                  <span>
                    <strong>Counselling</strong>
                    <small>Record session</small>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleAdmission}
                  className="lead-crm-quick-button admission"
                >
                  <span className="lead-crm-quick-icon">★</span>

                  <span>
                    <strong>Admission</strong>
                    <small>Record outcome</small>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            ACTIVITY TIMELINE
        ========================================== */}

        <section className="lead-crm-section lead-crm-timeline-section">
          <SectionHeading
            eyebrow="CRM JOURNEY"
            title="Activity Timeline"
            description="A chronological record of activity and engagement for this lead."
            sideLabel={`${activities.length} ${
              activities.length === 1 ? "ACTIVITY" : "ACTIVITIES"
            }`}
          />

          {activities.length === 0 ? (
            <div className="lead-crm-empty">
              <div className="lead-crm-empty-icon">◇</div>

              <h3>No CRM activity yet</h3>

              <p>
                Calls, notes, follow-ups and other CRM actions will appear here
                as the lead progresses.
              </p>
            </div>
          ) : (
            <div className="lead-crm-timeline">
              {activities.map((activity: any) => {
                let icon = "✎";
                let tone = "neutral";

                if (activity.activity_type === "call") {
                  icon = "☎";
                  tone = "blue";
                }

                if (activity.activity_type === "whatsapp") {
                  icon = "●";
                  tone = "green";
                }

                if (activity.activity_type === "counselling") {
                  icon = "◆";
                  tone = "purple";
                }

                if (activity.activity_type === "admission") {
                  icon = "★";
                  tone = "orange";
                }

                if (activity.activity_type === "notes") {
                  icon = "✎";
                  tone = "blue";
                }

                if (activity.activity_type === "followup") {
                  icon = "⌁";
                  tone = "orange";
                }

                if (activity.activity_type === "status_change") {
                  icon = "↻";
                  tone = "neutral";
                }

                return (
                  <div
                    key={activity.id}
                    className={`lead-crm-timeline-item ${tone}`}
                  >
                    <div
                      className={`lead-crm-timeline-icon ${tone}`}
                    >
                      {icon}
                    </div>

                    <div className="lead-crm-timeline-content">
                      <div className="lead-crm-timeline-top">
                        <div className="lead-crm-timeline-type">
                          {String(activity.activity_type || "activity")
                            .replace(/_/g, " ")
                            .toUpperCase()}
                        </div>

                        <div className="lead-crm-timeline-date">
                          {new Date(activity.created_at).toLocaleString()}
                        </div>
                      </div>

                      <div className="lead-crm-timeline-note">
                        {activity.activity_note}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="lead-crm-bottom-space" />

        <style>{`
          /* =========================================
             DRAWER SHELL
          ========================================== */

          .lead-crm-overlay {
            position: fixed;
            inset: 0;
            z-index: 50;
            background: rgba(15, 23, 42, 0.48);
            backdrop-filter: blur(3px);
            -webkit-backdrop-filter: blur(3px);

            display: flex;
            justify-content: flex-end;

            font-family:
              Inter,
              ui-sans-serif,
              system-ui,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;
          }

          .lead-crm-drawer {
            width: min(900px, 94vw);
            height: 100%;
            overflow-y: auto;
            overflow-x: hidden;

            box-sizing: border-box;

            padding: 18px;

            background:
              linear-gradient(
                180deg,
                #f8fafc 0%,
                #f7f9fc 100%
              );

            box-shadow:
              -24px 0 60px rgba(15, 23, 42, 0.16);

            color: #0f172a;
          }


          /* =========================================
             HERO
          ========================================== */

          .lead-crm-hero {
            min-height: 180px;

            position: relative;
            overflow: hidden;

            display: flex;
            align-items: center;

            box-sizing: border-box;

            padding: 30px 132px 30px 30px;

            background:
              linear-gradient(
                135deg,
                #ffffff 0%,
                #fffdfa 72%,
                #fff8f1 100%
              );

            border: 1px solid #dbe4ef;
            border-radius: 22px;

            box-shadow:
              0 10px 28px rgba(15, 23, 42, 0.045);
          }

          .lead-crm-hero-content {
            position: relative;
            z-index: 2;

            max-width: 620px;
          }

          .lead-crm-eyebrow {
            color: #f97316;

            font-size: 11px;
            font-weight: 900;

            letter-spacing: 2px;
            line-height: 1.2;

            text-transform: uppercase;
          }

          .lead-crm-title {
            margin: 9px 0 0;

            color: #0f172a;

            font-size: 34px;
            line-height: 1.05;
            font-weight: 850;

            letter-spacing: -1.2px;
          }

          .lead-crm-subtitle {
            max-width: 570px;

            margin: 12px 0 0;

            color: #64748b;

            font-size: 14px;
            line-height: 1.6;
            font-weight: 500;
          }

          .lead-crm-hero-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;

            margin-top: 17px;
          }

          .lead-crm-badge {
            display: inline-flex;
            align-items: center;

            min-height: 29px;

            box-sizing: border-box;

            padding: 6px 11px;

            border-radius: 999px;

            font-size: 10px;
            font-weight: 850;

            letter-spacing: 0.25px;

            text-transform: uppercase;
          }

          .lead-crm-badge-orange {
            color: #ea580c;

            background: #fff7ed;
            border: 1px solid #fdba74;
          }

          .lead-crm-badge-blue {
            color: #1d4ed8;

            background: #eff6ff;
            border: 1px solid #bfdbfe;
          }

          .lead-crm-hero-mark {
            position: absolute;
            z-index: 2;

            right: 28px;
            top: 50%;

            width: 82px;
            height: 82px;

            transform: translateY(-50%);

            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            background:
              linear-gradient(
                145deg,
                #fff9f2 0%,
                #ffffff 100%
              );

            border: 1px solid #fdba74;
            border-radius: 20px;

            box-shadow:
              0 8px 22px rgba(249, 115, 22, 0.07);
          }

          .lead-crm-hero-mark-icon {
            color: #0f172a;

            font-size: 29px;
            line-height: 1;
            font-weight: 800;
          }

          .lead-crm-hero-mark-label {
            margin-top: 8px;

            color: #f97316;

            font-size: 8px;
            font-weight: 900;

            letter-spacing: 1.2px;

            text-align: center;
          }

          .lead-crm-close {
            position: absolute;
            z-index: 5;

            right: 13px;
            top: 12px;

            width: 34px;
            height: 34px;

            padding: 0;

            display: flex;
            align-items: center;
            justify-content: center;

            color: #475569;
            background: rgba(255, 255, 255, 0.86);

            border: 1px solid #e2e8f0;
            border-radius: 10px;

            font-size: 21px;
            font-weight: 500;
            line-height: 1;

            cursor: pointer;

            transition:
              transform 0.18s ease,
              border-color 0.18s ease,
              color 0.18s ease,
              background 0.18s ease;
          }

          .lead-crm-close:hover {
            color: #dc2626;
            background: #fff7f7;
            border-color: #fecaca;

            transform: translateY(-1px);
          }

          .lead-crm-hero-circle {
            position: absolute;

            border-radius: 50%;

            pointer-events: none;
          }

          .lead-crm-hero-circle-one {
            width: 170px;
            height: 170px;

            right: -45px;
            top: -62px;

            background: rgba(249, 115, 22, 0.06);
          }

          .lead-crm-hero-circle-two {
            width: 135px;
            height: 135px;

            right: 115px;
            bottom: -95px;

            background: rgba(59, 130, 246, 0.055);
          }


          /* =========================================
             COMMON SECTION
          ========================================== */

          .lead-crm-section {
            position: relative;
            overflow: hidden;

            box-sizing: border-box;

            margin-top: 16px;
            padding: 24px;

            background: #ffffff;

            border: 1px solid #dbe4ef;
            border-radius: 20px;

            box-shadow:
              0 8px 24px rgba(15, 23, 42, 0.035);
          }

          .lead-crm-section-accent {
            background:
              linear-gradient(
                135deg,
                #ffffff 0%,
                #fffdfa 100%
              );
          }

          .lead-crm-section-heading {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;

            gap: 20px;

            margin-bottom: 19px;
          }

          .lead-crm-section-heading-main {
            min-width: 0;
          }

          .lead-crm-section-eyebrow {
            color: #f97316;

            font-size: 10px;
            font-weight: 900;

            line-height: 1.2;

            letter-spacing: 1.7px;

            text-transform: uppercase;
          }

          .lead-crm-section-title {
            margin: 7px 0 0;

            color: #0f172a;

            font-size: 22px;
            line-height: 1.15;
            font-weight: 850;

            letter-spacing: -0.5px;
          }

          .lead-crm-section-description {
            margin: 7px 0 0;

            color: #64748b;

            font-size: 13px;
            line-height: 1.5;
            font-weight: 500;
          }

          .lead-crm-section-side-label {
            flex-shrink: 0;

            color: #94a3b8;

            font-size: 9px;
            font-weight: 850;

            letter-spacing: 1px;

            text-transform: uppercase;
          }


          /* =========================================
             SNAPSHOT
          ========================================== */

          .lead-crm-info-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));

            gap: 10px;
          }

          .lead-crm-info-card {
            position: relative;
            overflow: hidden;

            min-height: 104px;

            box-sizing: border-box;

            padding: 15px;

            border-radius: 15px;

            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .lead-crm-info-card::after {
            content: "";

            position: absolute;

            width: 76px;
            height: 76px;

            right: -25px;
            top: -28px;

            border-radius: 50%;

            background: var(--card-orb);
          }

          .lead-crm-info-card.orange {
            --card-orb: rgba(249, 115, 22, 0.09);

            background:
              linear-gradient(
                135deg,
                #fff9f3 0%,
                #fffdf9 100%
              );

            border: 1px solid #fed7aa;
          }

          .lead-crm-info-card.blue {
            --card-orb: rgba(37, 99, 235, 0.08);

            background:
              linear-gradient(
                135deg,
                #eff6ff 0%,
                #f8fbff 100%
              );

            border: 1px solid #bfdbfe;
          }

          .lead-crm-info-card.green {
            --card-orb: rgba(22, 163, 74, 0.08);

            background:
              linear-gradient(
                135deg,
                #ecfdf5 0%,
                #f7fffb 100%
              );

            border: 1px solid #bbf7d0;
          }

          .lead-crm-info-card.purple {
            --card-orb: rgba(124, 58, 237, 0.08);

            background:
              linear-gradient(
                135deg,
                #faf5ff 0%,
                #fdfaff 100%
              );

            border: 1px solid #e9d5ff;
          }

          .lead-crm-info-top {
            position: relative;
            z-index: 2;

            display: flex;
            justify-content: space-between;
            align-items: center;

            gap: 8px;
          }

          .lead-crm-info-label {
            color: #64748b;

            font-size: 9px;
            line-height: 1.2;
            font-weight: 850;

            letter-spacing: 0.9px;

            text-transform: uppercase;
          }

          .lead-crm-info-icon {
            width: 27px;
            height: 27px;

            flex-shrink: 0;

            display: flex;
            align-items: center;
            justify-content: center;

            background: rgba(255, 255, 255, 0.84);

            border: 1px solid rgba(203, 213, 225, 0.75);
            border-radius: 8px;

            color: #0f172a;

            font-size: 12px;
            font-weight: 850;
          }

          .lead-crm-info-value {
            position: relative;
            z-index: 2;

            margin-top: 13px;

            color: #0f172a;

            font-size: 14px;
            line-height: 1.3;
            font-weight: 750;

            word-break: break-word;
          }

          .lead-crm-info-value.status {
            color: #15803d;

            text-transform: capitalize;
          }


          /* =========================================
             NOTES
          ========================================== */

          .lead-crm-editor {
            box-sizing: border-box;

            padding: 17px;

            background:
              linear-gradient(
                135deg,
                #fffaf5 0%,
                #ffffff 70%
              );

            border: 1px solid #fed7aa;
            border-radius: 16px;
          }

          .lead-crm-editor-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;

            gap: 15px;
          }

          .lead-crm-field-label {
            color: #c2410c;

            font-size: 10px;
            font-weight: 900;

            letter-spacing: 1px;

            text-transform: uppercase;
          }

          .lead-crm-field-helper {
            margin-top: 5px;

            color: #64748b;

            font-size: 12px;
            line-height: 1.45;
          }

          .lead-crm-editor-icon {
            width: 35px;
            height: 35px;

            flex-shrink: 0;

            display: flex;
            align-items: center;
            justify-content: center;

            color: #f97316;
            background: #fff7ed;

            border: 1px solid #fed7aa;
            border-radius: 10px;

            font-size: 17px;
            font-weight: 800;
          }

          .lead-crm-textarea {
            width: 100%;
            min-height: 125px;

            resize: vertical;

            box-sizing: border-box;

            margin-top: 14px;
            padding: 14px 15px;

            color: #0f172a;
            background: #ffffff;

            border: 1px solid #cbd5e1;
            border-radius: 12px;

            outline: none;

            font-family: inherit;
            font-size: 14px;
            line-height: 1.55;

            transition:
              border-color 0.18s ease,
              box-shadow 0.18s ease;
          }

          .lead-crm-textarea::placeholder {
            color: #94a3b8;
          }

          .lead-crm-textarea:focus {
            border-color: #fb923c;

            box-shadow:
              0 0 0 3px rgba(249, 115, 22, 0.09);
          }

          .lead-crm-editor-actions {
            display: flex;
            justify-content: flex-end;

            margin-top: 12px;
          }

          .lead-crm-primary-button {
            min-height: 40px;

            box-sizing: border-box;

            padding: 10px 16px;

            color: #ffffff;
            background:
              linear-gradient(
                135deg,
                #f97316 0%,
                #fb7c24 100%
              );

            border: 1px solid #f97316;
            border-radius: 10px;

            box-shadow:
              0 6px 15px rgba(249, 115, 22, 0.15);

            font-family: inherit;
            font-size: 12px;
            font-weight: 800;

            cursor: pointer;

            transition:
              transform 0.18s ease,
              box-shadow 0.18s ease,
              background 0.18s ease;
          }

          .lead-crm-primary-button:hover {
            transform: translateY(-1px);

            box-shadow:
              0 8px 20px rgba(249, 115, 22, 0.22);
          }


          /* =========================================
             ACTION CENTRE
          ========================================== */

          .lead-crm-action-layout {
            display: grid;
            grid-template-columns:
              minmax(0, 0.85fr)
              minmax(0, 1.15fr);

            gap: 12px;
          }

          .lead-crm-action-panel {
            box-sizing: border-box;

            padding: 17px;

            border-radius: 16px;
          }

          .lead-crm-followup-panel {
            background:
              linear-gradient(
                135deg,
                #fff9f2 0%,
                #fffdf9 100%
              );

            border: 1px solid #fed7aa;
          }

          .lead-crm-quick-panel {
            background:
              linear-gradient(
                135deg,
                #eff6ff 0%,
                #fafcff 100%
              );

            border: 1px solid #bfdbfe;
          }

          .lead-crm-action-panel-heading {
            display: flex;
            align-items: center;

            gap: 11px;
          }

          .lead-crm-action-icon {
            width: 39px;
            height: 39px;

            flex-shrink: 0;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 11px;

            font-size: 17px;
            font-weight: 850;
          }

          .lead-crm-action-icon.orange {
            color: #ea580c;
            background: #fff7ed;

            border: 1px solid #fdba74;
          }

          .lead-crm-action-icon.blue {
            color: #1d4ed8;
            background: #eff6ff;

            border: 1px solid #bfdbfe;
          }

          .lead-crm-action-kicker {
            color: #64748b;

            font-size: 8px;
            font-weight: 900;

            letter-spacing: 1px;

            text-transform: uppercase;
          }

          .lead-crm-action-panel h3 {
            margin: 3px 0 0;

            color: #0f172a;

            font-size: 16px;
            line-height: 1.2;
            font-weight: 800;
          }

          .lead-crm-action-description {
            margin: 12px 0 0;

            color: #64748b;

            font-size: 12px;
            line-height: 1.5;
          }

          .lead-crm-followup-row {
            display: flex;
            align-items: stretch;

            gap: 8px;

            margin-top: 16px;
          }

          .lead-crm-date-input {
            min-width: 0;
            flex: 1;

            box-sizing: border-box;

            padding: 9px 11px;

            color: #334155;
            background: #ffffff;

            border: 1px solid #cbd5e1;
            border-radius: 10px;

            outline: none;

            font-family: inherit;
            font-size: 12px;
            font-weight: 600;
          }

          .lead-crm-date-input:focus {
            border-color: #fb923c;

            box-shadow:
              0 0 0 3px rgba(249, 115, 22, 0.08);
          }

          .lead-crm-quick-grid {
            display: grid;
            grid-template-columns:
              repeat(2, minmax(0, 1fr));

            gap: 8px;

            margin-top: 16px;
          }

          .lead-crm-quick-button {
            min-width: 0;

            display: flex;
            align-items: center;

            gap: 9px;

            box-sizing: border-box;

            padding: 10px;

            background: rgba(255, 255, 255, 0.82);

            border-radius: 10px;

            text-align: left;

            font-family: inherit;

            cursor: pointer;

            transition:
              transform 0.18s ease,
              box-shadow 0.18s ease,
              background 0.18s ease;
          }

          .lead-crm-quick-button:hover {
            transform: translateY(-1px);

            background: #ffffff;

            box-shadow:
              0 5px 14px rgba(15, 23, 42, 0.06);
          }

          .lead-crm-quick-button.call {
            color: #0f172a;
            border: 1px solid #cbd5e1;
          }

          .lead-crm-quick-button.whatsapp {
            color: #15803d;
            border: 1px solid #bbf7d0;
          }

          .lead-crm-quick-button.counselling {
            color: #7e22ce;
            border: 1px solid #e9d5ff;
          }

          .lead-crm-quick-button.admission {
            color: #ea580c;
            border: 1px solid #fed7aa;
          }

          .lead-crm-quick-icon {
            width: 29px;
            height: 29px;

            flex-shrink: 0;

            display: flex;
            align-items: center;
            justify-content: center;

            background: #ffffff;

            border: 1px solid currentColor;
            border-radius: 8px;

            font-size: 11px;
            font-weight: 900;
          }

          .lead-crm-quick-button > span:last-child {
            min-width: 0;

            display: flex;
            flex-direction: column;
          }

          .lead-crm-quick-button strong {
            font-size: 11px;
            line-height: 1.25;
            font-weight: 800;
          }

          .lead-crm-quick-button small {
            margin-top: 2px;

            color: #94a3b8;

            font-size: 8px;
            line-height: 1.2;
            font-weight: 650;
          }


          /* =========================================
             ACTIVITY TIMELINE
          ========================================== */

          .lead-crm-timeline-section {
            background:
              linear-gradient(
                135deg,
                #ffffff 0%,
                #fffdfa 100%
              );
          }

          .lead-crm-empty {
            min-height: 145px;

            box-sizing: border-box;

            padding: 25px;

            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            text-align: center;

            background:
              linear-gradient(
                135deg,
                #f8fafc 0%,
                #ffffff 100%
              );

            border: 1px dashed #cbd5e1;
            border-radius: 15px;
          }

          .lead-crm-empty-icon {
            width: 39px;
            height: 39px;

            display: flex;
            align-items: center;
            justify-content: center;

            color: #f97316;
            background: #fff7ed;

            border: 1px solid #fed7aa;
            border-radius: 11px;

            font-size: 19px;
            font-weight: 850;
          }

          .lead-crm-empty h3 {
            margin: 11px 0 0;

            color: #0f172a;

            font-size: 15px;
            font-weight: 800;
          }

          .lead-crm-empty p {
            max-width: 430px;

            margin: 6px 0 0;

            color: #64748b;

            font-size: 11px;
            line-height: 1.5;
          }

          .lead-crm-timeline {
            display: flex;
            flex-direction: column;

            gap: 9px;
          }

          .lead-crm-timeline-item {
            position: relative;

            display: flex;
            align-items: flex-start;

            gap: 11px;

            box-sizing: border-box;

            padding: 12px;

            border-radius: 13px;
          }

          .lead-crm-timeline-item.blue {
            background: #f4f8ff;
            border: 1px solid #bfdbfe;
          }

          .lead-crm-timeline-item.green {
            background: #f1fdf6;
            border: 1px solid #bbf7d0;
          }

          .lead-crm-timeline-item.purple {
            background: #fbf7ff;
            border: 1px solid #e9d5ff;
          }

          .lead-crm-timeline-item.orange {
            background: #fff9f3;
            border: 1px solid #fed7aa;
          }

          .lead-crm-timeline-item.neutral {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
          }

          .lead-crm-timeline-icon {
            width: 34px;
            height: 34px;

            flex-shrink: 0;

            display: flex;
            align-items: center;
            justify-content: center;

            background: #ffffff;

            border-radius: 9px;

            font-size: 13px;
            font-weight: 900;
          }

          .lead-crm-timeline-icon.blue {
            color: #2563eb;
            border: 1px solid #bfdbfe;
          }

          .lead-crm-timeline-icon.green {
            color: #16a34a;
            border: 1px solid #bbf7d0;
          }

          .lead-crm-timeline-icon.purple {
            color: #7c3aed;
            border: 1px solid #e9d5ff;
          }

          .lead-crm-timeline-icon.orange {
            color: #f97316;
            border: 1px solid #fed7aa;
          }

          .lead-crm-timeline-icon.neutral {
            color: #475569;
            border: 1px solid #cbd5e1;
          }

          .lead-crm-timeline-content {
            min-width: 0;
            flex: 1;
          }

          .lead-crm-timeline-top {
            display: flex;
            justify-content: space-between;
            align-items: center;

            gap: 12px;
          }

          .lead-crm-timeline-type {
            color: #64748b;

            font-size: 8px;
            font-weight: 900;

            letter-spacing: 1px;
          }

          .lead-crm-timeline-date {
            flex-shrink: 0;

            color: #94a3b8;

            font-size: 9px;
            font-weight: 650;
          }

          .lead-crm-timeline-note {
            margin-top: 5px;

            color: #334155;

            font-size: 12px;
            line-height: 1.45;
            font-weight: 650;

            word-break: break-word;
          }

          .lead-crm-bottom-space {
            height: 4px;
          }


          /* =========================================
             TABLET
          ========================================== */

          @media (max-width: 1024px) {
            .lead-crm-drawer {
              width: min(820px, 96vw);

              padding: 15px;
            }

            .lead-crm-hero {
              min-height: 165px;

              padding:
                25px
                118px
                25px
                24px;
            }

            .lead-crm-title {
              font-size: 30px;
            }

            .lead-crm-hero-mark {
              right: 22px;

              width: 76px;
              height: 76px;
            }

            .lead-crm-section {
              padding: 21px;
            }

            .lead-crm-info-grid {
              grid-template-columns:
                repeat(2, minmax(0, 1fr));
            }

            .lead-crm-info-card {
              min-height: 98px;
            }

            .lead-crm-action-layout {
              grid-template-columns: 1fr;
            }

            .lead-crm-quick-grid {
              grid-template-columns:
                repeat(4, minmax(0, 1fr));
            }

            .lead-crm-quick-button {
              flex-direction: column;
              align-items: flex-start;

              min-height: 82px;
            }
          }


          /* =========================================
             MOBILE
          ========================================== */

          @media (max-width: 600px) {
            .lead-crm-overlay {
              background: rgba(15, 23, 42, 0.42);
            }

            .lead-crm-drawer {
              width: 100vw;
              max-width: none;

              padding: 10px;

              box-shadow: none;
            }

            .lead-crm-hero {
              min-height: 170px;

              padding:
                23px
                72px
                21px
                19px;

              border-radius: 18px;
            }

            .lead-crm-eyebrow {
              font-size: 9px;
              letter-spacing: 1.5px;
            }

            .lead-crm-title {
              margin-top: 7px;

              font-size: 27px;
              letter-spacing: -0.8px;
            }

            .lead-crm-subtitle {
              margin-top: 9px;

              font-size: 12px;
              line-height: 1.5;
            }

            .lead-crm-hero-badges {
              gap: 6px;

              margin-top: 13px;
            }

            .lead-crm-badge {
              min-height: 25px;

              padding: 5px 8px;

              font-size: 8px;
            }

            .lead-crm-hero-mark {
              right: 12px;
              top: 69px;

              width: 52px;
              height: 58px;

              transform: none;

              border-radius: 14px;
            }

            .lead-crm-hero-mark-icon {
              font-size: 20px;
            }

            .lead-crm-hero-mark-label {
              margin-top: 4px;

              font-size: 6px;
              letter-spacing: 0.6px;
            }

            .lead-crm-close {
              right: 10px;
              top: 10px;

              width: 31px;
              height: 31px;

              border-radius: 9px;

              font-size: 19px;
            }

            .lead-crm-hero-circle-one {
              width: 125px;
              height: 125px;

              right: -47px;
              top: -40px;
            }

            .lead-crm-hero-circle-two {
              width: 100px;
              height: 100px;

              right: 55px;
              bottom: -72px;
            }


            /* SECTIONS */

            .lead-crm-section {
              margin-top: 10px;

              padding: 17px;

              border-radius: 17px;
            }

            .lead-crm-section-heading {
              display: block;

              margin-bottom: 15px;
            }

            .lead-crm-section-eyebrow {
              font-size: 9px;
              letter-spacing: 1.4px;
            }

            .lead-crm-section-title {
              margin-top: 6px;

              font-size: 20px;
            }

            .lead-crm-section-description {
              margin-top: 6px;

              font-size: 12px;
              line-height: 1.45;
            }

            .lead-crm-section-side-label {
              display: inline-flex;

              margin-top: 9px;

              padding: 5px 8px;

              color: #1d4ed8;
              background: #eff6ff;

              border: 1px solid #bfdbfe;
              border-radius: 999px;

              font-size: 7px;
            }


            /* INFO CARDS */

            .lead-crm-info-grid {
              grid-template-columns:
                repeat(2, minmax(0, 1fr));

              gap: 8px;
            }

            .lead-crm-info-card {
              min-height: 94px;

              padding: 12px;

              border-radius: 13px;
            }

            .lead-crm-info-label {
              font-size: 8px;
              letter-spacing: 0.65px;
            }

            .lead-crm-info-icon {
              width: 24px;
              height: 24px;

              font-size: 10px;
            }

            .lead-crm-info-value {
              margin-top: 11px;

              font-size: 12px;
            }


            /* NOTES */

            .lead-crm-editor {
              padding: 13px;

              border-radius: 14px;
            }

            .lead-crm-field-label {
              font-size: 9px;
            }

            .lead-crm-field-helper {
              font-size: 10px;
            }

            .lead-crm-editor-icon {
              width: 31px;
              height: 31px;

              font-size: 14px;
            }

            .lead-crm-textarea {
              min-height: 110px;

              margin-top: 12px;
              padding: 12px;

              border-radius: 10px;

              font-size: 13px;
            }

            .lead-crm-editor-actions {
              margin-top: 9px;
            }

            .lead-crm-primary-button {
              min-height: 38px;

              padding: 9px 13px;

              font-size: 11px;
            }


            /* ACTION CENTRE */

            .lead-crm-action-layout {
              gap: 9px;
            }

            .lead-crm-action-panel {
              padding: 14px;

              border-radius: 14px;
            }

            .lead-crm-action-icon {
              width: 34px;
              height: 34px;

              font-size: 14px;
            }

            .lead-crm-action-panel h3 {
              font-size: 15px;
            }

            .lead-crm-action-description {
              margin-top: 9px;

              font-size: 11px;
            }

            .lead-crm-followup-row {
              margin-top: 12px;

              flex-direction: column;
            }

            .lead-crm-date-input {
              width: 100%;
              min-height: 40px;

              font-size: 12px;
            }

            .lead-crm-followup-row .lead-crm-primary-button {
              width: 100%;
            }

            .lead-crm-quick-grid {
              grid-template-columns:
                repeat(2, minmax(0, 1fr));

              gap: 7px;

              margin-top: 12px;
            }

            .lead-crm-quick-button {
              min-height: 70px;

              padding: 9px;

              flex-direction: row;
              align-items: center;

              gap: 7px;
            }

            .lead-crm-quick-icon {
              width: 26px;
              height: 26px;

              font-size: 9px;
            }

            .lead-crm-quick-button strong {
              font-size: 10px;
            }

            .lead-crm-quick-button small {
              font-size: 7px;
            }


            /* TIMELINE */

            .lead-crm-empty {
              min-height: 135px;

              padding: 20px 14px;
            }

            .lead-crm-timeline-item {
              padding: 10px;

              gap: 9px;
            }

            .lead-crm-timeline-icon {
              width: 31px;
              height: 31px;

              font-size: 11px;
            }

            .lead-crm-timeline-top {
              align-items: flex-start;
              flex-direction: column;

              gap: 3px;
            }

            .lead-crm-timeline-date {
              font-size: 8px;
            }

            .lead-crm-timeline-note {
              font-size: 11px;
            }
          }


          /* =========================================
             VERY SMALL MOBILE
          ========================================== */

          @media (max-width: 390px) {
            .lead-crm-drawer {
              padding: 8px;
            }

            .lead-crm-hero {
              padding:
                20px
                60px
                19px
                16px;
            }

            .lead-crm-title {
              font-size: 24px;
            }

            .lead-crm-hero-mark {
              width: 45px;
              height: 52px;
            }

            .lead-crm-section {
              padding: 14px;
            }

            .lead-crm-info-grid {
              grid-template-columns: 1fr;
            }

            .lead-crm-info-card {
              min-height: 82px;
            }

            .lead-crm-info-value {
              font-size: 13px;
            }

            .lead-crm-quick-grid {
              grid-template-columns: 1fr;
            }

            .lead-crm-quick-button {
              min-height: 54px;
            }
          }

        `}</style>
      </aside>
    </div>
  );
}


/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  eyebrow,
  title,
  description,
  sideLabel,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  sideLabel?: string;
}) {
  return (
    <div className="lead-crm-section-heading">
      <div className="lead-crm-section-heading-main">
        <div className="lead-crm-section-eyebrow">
          {eyebrow}
        </div>

        <h3 className="lead-crm-section-title">
          {title}
        </h3>

        {description && (
          <p className="lead-crm-section-description">
            {description}
          </p>
        )}
      </div>

      {sideLabel && (
        <div className="lead-crm-section-side-label">
          {sideLabel}
        </div>
      )}
    </div>
  );
}


/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
  label,
  value,
  icon,
  tone = "orange",
  status = false,
}: {
  label: string;
  value: any;
  icon: string;
  tone?: "orange" | "blue" | "green" | "purple";
  status?: boolean;
}) {
  return (
    <div className={`lead-crm-info-card ${tone}`}>
      <div className="lead-crm-info-top">
        <div className="lead-crm-info-label">
          {label}
        </div>

        <div className="lead-crm-info-icon">
          {icon}
        </div>
      </div>

      <div
        className={`lead-crm-info-value ${
          status ? "status" : ""
        }`}
      >
        {value || "-"}
      </div>
    </div>
  );
}
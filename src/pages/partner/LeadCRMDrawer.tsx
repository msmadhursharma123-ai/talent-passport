import React, { useEffect, useState } from "react";

import {
  fetchLeadActivity,
  updateLeadNotes,
  updateLeadFollowup,
  logLeadCall,
  logLeadWhatsapp,
  logLeadCounselling,
  logLeadAdmission
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
  onRefresh
}: Props) {

  const [notes, setNotes] =
    useState("");

  const [followupDate, setFollowupDate] =
    useState("");

  const [activities, setActivities] =
    useState<any[]>([]);

  useEffect(() => {

    if (!lead) return;

    setNotes(
      lead.notes || ""
    );

    setFollowupDate(
      lead.next_followup_date || ""
    );

    loadActivities();

  }, [lead]);

  async function loadActivities() {

    if (!lead) return;

    const data =
      await fetchLeadActivity(
        lead.id
      );

    setActivities(
      data || []
    );
  }

  async function saveNotes() {

 await updateLeadNotes(
  lead.id,
  notes
);

await loadActivities();

onRefresh();

alert(
  "Notes Saved"
);
  }

  async function saveFollowup() {

   await updateLeadFollowup(
  lead.id,
  followupDate
);

await loadActivities();

onRefresh();

alert(
  "Follow Up Saved"
);
  }

  async function handleCall() {

    await logLeadCall(
  lead.id
);

await loadActivities();

onRefresh();
  }

  async function handleWhatsapp() {

  await logLeadWhatsapp(
  lead.id
);

await loadActivities();

onRefresh();
  }

  async function handleCounselling() {

   await logLeadCounselling(
  lead.id
);

await loadActivities();

onRefresh();
  }

  async function handleAdmission() {

 await logLeadAdmission(
  lead.id
);

await loadActivities();

onRefresh();
  }

  if (!open || !lead)
    return null;

  return (

    <div
      className="
        fixed
        inset-0
        z-50
        bg-black/40
        flex
        justify-end
      "
    >

      <div
        className="
          w-[900px]
          h-full
          bg-white
          overflow-y-auto
          p-6
        "
      >

        <div
          className="
            flex
            justify-between
            items-center
            border-b
            pb-4
          "
        >

          <div>

            <div
              className="
                text-xs
                uppercase
                tracking-wider
                text-gray-500
              "
            >
              Partner CRM
            </div>

            <h2
              className="
                text-2xl
                font-bold
              "
            >
              Lead Profile
            </h2>

          </div>

          <button
            onClick={onClose}
            className="
              text-xl
              font-bold
            "
          >
            ✕
          </button>

        </div>

        <div
          className="
            mt-6
            grid
            grid-cols-2
            gap-4
          "
        >

          <InfoCard
            label="Student"
            value={lead.student_name}
          />

          <InfoCard
            label="School"
            value={lead.school_name}
          />

          <InfoCard
            label="Phone"
            value={lead.phone || "-"}
          />

          <InfoCard
            label="Email"
            value={lead.email || "-"}
          />

          <InfoCard
            label="Lead Source"
            value={lead.lead_source}
          />

          <InfoCard
            label="Request Type"
            value={lead.request_type}
          />

          <InfoCard
            label="Current Status"
            value={lead.status}
          />

          <InfoCard
            label="Class"
            value={lead.class_name || "-"}
          />

        </div>

        <div
          className="
  mt-8
  border
  rounded-xl
  p-4
  min-h-[450px]
"
        >

          <h3
            className="
              font-bold
              text-lg
            "
          >
            Notes
          </h3>

          <textarea
            value={notes}
            onChange={(e) =>
              setNotes(
                e.target.value
              )
            }
            rows={5}
            className="
              w-full
              border
              rounded
              p-3
              mt-3
            "
          />

          <button
            onClick={saveNotes}
            className="
              mt-3
              px-4
              py-2
              bg-blue-600
              text-white
              rounded
            "
          >
            Save Notes
          </button>

        </div>

        <div
          className="
            mt-6
            border
            rounded-xl
            p-4
          "
        >

          <h3
            className="
              font-bold
              text-lg
            "
          >
            Follow Up
          </h3>

          <div
            className="
              flex
              gap-3
              items-center
              mt-3
            "
          >

            <input
              type="date"
              value={followupDate}
              onChange={(e) =>
                setFollowupDate(
                  e.target.value
                )
              }
              className="
                border
                rounded
                p-2
              "
            />

            <button
              onClick={saveFollowup}
              className="
                px-4
                py-2
                bg-green-600
                text-white
                rounded
              "
            >
              Save Follow Up
            </button>

          </div>

        </div>

        <div
          className="
            mt-6
            border
            rounded-xl
            p-4
          "
        >

          <h3
            className="
              font-bold
              text-lg
            "
          >
            Quick Actions
          </h3>

          <div
            className="
              flex
              gap-3
              mt-4
              flex-wrap
            "
          >

            <button
              onClick={handleCall}
              className="
                px-4
                py-2
                bg-slate-800
                text-white
                rounded
              "
            >
              📞 Log Call
            </button>

            <button
              onClick={handleWhatsapp}
              className="
                px-4
                py-2
                bg-green-600
                text-white
                rounded
              "
            >
              💬 WhatsApp
            </button>

            <button
              onClick={handleCounselling}
              className="
                px-4
                py-2
                bg-purple-600
                text-white
                rounded
              "
            >
              🎓 Counselling
            </button>

            <button
              onClick={handleAdmission}
              className="
                px-4
                py-2
                bg-orange-600
                text-white
                rounded
              "
            >
              🏆 Admission
            </button>

          </div>

        </div>

        <div
          className="
            mt-8
            border
            rounded-xl
            p-4
          "
        >

          <h3
            className="
              text-lg
              font-bold
              mb-4
            "
          >
            Activity Timeline
          </h3>

          {activities.length === 0 && (

            <div
              className="
                border
                rounded-lg
                p-4
                text-gray-500
              "
            >
              No CRM activity yet.
            </div>

          )}

          <div
            className="
              space-y-4
            "
          >

            {activities.map(
              (activity: any) => {

                let icon = "📝";
                let bg = "#F8FAFC";

                if (
                  activity.activity_type === "call"
                ) {
                  icon = "📞";
                  bg = "#DBEAFE";
                }

                if (
                  activity.activity_type === "whatsapp"
                ) {
                  icon = "💬";
                  bg = "#DCFCE7";
                }

                if (
                  activity.activity_type === "counselling"
                ) {
                  icon = "🎓";
                  bg = "#F3E8FF";
                }

                if (
                  activity.activity_type === "admission"
                ) {
                  icon = "🏆";
                  bg = "#FEF3C7";
                }

                if (
  activity.activity_type ===
  "notes"
) {

  icon = "📝";
  bg = "#E0F2FE";

}

if (
  activity.activity_type ===
  "followup"
) {

  icon = "📅";
  bg = "#FEF3C7";

}

if (
  activity.activity_type ===
  "status_change"
) {

  icon = "🔄";
  bg = "#F1F5F9";

}

                return (

                  <div
                    key={activity.id}
                    style={{
                      background: bg,
                      borderRadius: "12px",
                      padding: "14px"
                    }}
                  >

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between"
                      }}
                    >

                      <div
                        style={{
                          fontWeight: 600
                        }}
                      >
                        {icon}{" "}
                        {activity.activity_note}
                      </div>

                      <div
                        style={{
                          fontSize: "12px",
                          color: "#64748B"
                        }}
                      >
                        {
                          new Date(
                            activity.created_at
                          ).toLocaleString()
                        }
                      </div>

                    </div>

                  </div>

                );

              }
            )}

          </div>

        </div>

      </div>

    </div>

  );

}

function InfoCard({
  label,
  value
}: any) {

  return (

    <div
      className="
        border
        rounded-lg
        p-3
      "
    >

      <div
        className="
          text-sm
          text-gray-500
        "
      >
        {label}
      </div>

      <div
        className="
          font-semibold
          mt-1
        "
      >
        {value}
      </div>

    </div>

  );

}
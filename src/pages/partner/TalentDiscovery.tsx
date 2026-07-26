import React, {
  useEffect,
  useState,
} from "react";

import {
    requirePartnerIdentity,
} from "../../services/identityService";

import {

  fetchAllocatedStudents,

  fetchPartnerScholarshipOffers,

  fetchPartnerWorkshopOffers,

  fetchPartnerContactRequests,

  createScholarshipOffer,

  createWorkshopOffer,

  createContactRequest,

  fetchPartnerPipeline,

  discardScholarshipOffer,

  discardWorkshopOffer,

  discardContactRequest,

  resendScholarshipOffer,

  resendWorkshopOffer,

  resendContactRequest,

  updateOffer

} from "../../data/partnerMarketplaceRepository";

interface StudentRecord {

  id?: string;

  student_id: string;

  student_uuid?: string;

partner_uuid?: string;

  student_name: string;

  school_name: string;

class_name: string;

email: string;

phone: string;

event_name?: string;

  pathway?: string;

  communication_score?: number;
  leadership_score?: number;
  critical_thinking_score?: number;
  collaboration_score?: number;
  confidence_score?: number;

  overall_score?: number;
}

function Card({
  title,
  value
}: {
  title: string;
  value: any;
}) {

  return (

    <div
      style={{
        position: "relative",
        overflow: "hidden",
        border: "1px solid #E2E8F0",
        borderRadius: "16px",
        padding: "16px",
        background:
          "linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)",
        minHeight: "68px"
      }}
    >

      <div
        style={{
          fontSize: "9px",
          fontWeight: 800,
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: "#64748B",
          marginBottom: "7px"
        }}
      >
        {title}
      </div>

      <div
        style={{
          color: "#0F172A",
          fontSize: "13px",
          fontWeight: 750,
          lineHeight: 1.45,
          wordBreak: "break-word"
        }}
      >
        {value || "-"}
      </div>

    </div>

  );
}



export default function TalentDiscovery() {

  /*
  -------------------------------------------------------
  IdentityService
  -------------------------------------------------------

  TalentDiscovery no longer accesses localStorage.

  Identity is resolved once from the application's
  central IdentityService and reused everywhere
  in this page.

  -------------------------------------------------------
  */

const partnerIdentity =
    requirePartnerIdentity();

const rawPartnerId = partnerIdentity.partnerId;

if (!rawPartnerId) {
  throw new Error(
    "Partner identity is missing."
  );
}

const partnerId: string = rawPartnerId;

const partnerName =
  partnerIdentity.partnerName ?? "";

const [selectedStudent, setSelectedStudent] =
  useState<StudentRecord | null>(null);

const [showScholarshipDialog, setShowScholarshipDialog] =
  useState(false);

const [showWorkshopDialog, setShowWorkshopDialog] =
  useState(false);

const [showContactDialog, setShowContactDialog] =
  useState(false);

  const [viewOffer, setViewOffer] =
useState<any>(null);

const [editOffer, setEditOffer] =
useState<any>(null);

const [
  scholarshipTitle,
  setScholarshipTitle
] = useState("");

const [
  scholarshipDescription,
  setScholarshipDescription
] = useState("");

const [
  scholarshipType,
  setScholarshipType
] = useState("");

const [
  scholarshipValue,
  setScholarshipValue
] = useState("");

const [
  workshopTitle,
  setWorkshopTitle
] = useState("");

const [
  workshopDescription,
  setWorkshopDescription
] = useState("");

const [
  workshopDate,
  setWorkshopDate
] = useState("");

const [
  workshopMode,
  setWorkshopMode
] = useState("");

 const [
  contactMessage,
  setContactMessage
] = useState("");

const [offerSuccess,
  setOfferSuccess] =
  useState("");



  const [students,
    setStudents] =
    useState<StudentRecord[]>([]);

  const [filteredStudents,
    setFilteredStudents] =
    useState<StudentRecord[]>([]);

  const [schoolFilter,
    setSchoolFilter] =
    useState("All");

  const [classFilter,
    setClassFilter] =
    useState("All");

  const [scoreFilter,
    setScoreFilter] =
    useState(0);

const [eventFilter,
setEventFilter] =
useState("All");

const [searchText,
setSearchText] =
useState("");

const [scholarshipOffers,
setScholarshipOffers] =
useState<any[]>([]);

const [workshopOffers,
setWorkshopOffers] =
useState<any[]>([]);

const [contactRequests,
setContactRequests] =
useState<any[]>([]);

const [
  pipeline,
  setPipeline
] =
useState<any[]>([]);

const [
  activePipelineTab,
  setActivePipelineTab
] =
useState("All");

const [
  selectedOffer,
  setSelectedOffer
] =
useState<any>(null);

const [
  showViewDialog,
  setShowViewDialog
] =
useState(false); 

const [
  showEditDialog,
  setShowEditDialog
] =
useState(false);

function showSuccessMessage(
  message: string
): void {

  setOfferSuccess(message);

  window.setTimeout(() => {

    setOfferSuccess("");

  }, 3000);

}

async function saveScholarship() {

  if (!selectedStudent) return;

  const resolvedStudentId =
    selectedStudent.student_id;

  const resolvedPartnerUuid =
    selectedStudent.partner_uuid ??
    partnerIdentity.partnerUuid;

  const result =
  await createScholarshipOffer({

    partner_id:
      partnerId,

    partner_uuid:
      resolvedPartnerUuid,

    partner_name:
      partnerName,

    student_id:
      resolvedStudentId,

    student_name:
      selectedStudent.student_name,

    school_name:
      selectedStudent.school_name,

  email:
  selectedStudent.email,

    phone:
      selectedStudent.phone,

    class_name:
      selectedStudent.class_name,

    offer_title:
      scholarshipTitle,

    offer_description:
      scholarshipDescription,

    scholarship_type:
      scholarshipType,

    scholarship_value:
      scholarshipValue,

    status:
      "pending"

  });

  if (!result) {

    alert(
      "Failed to save scholarship"
    );

    return;

  }

  setScholarshipTitle("");
  setScholarshipDescription("");
  setScholarshipType("");
  setScholarshipValue("");

  setShowScholarshipDialog(false);

  showSuccessMessage(
    "Scholarship sent successfully"
  );

}

async function saveWorkshop() {

  if (!selectedStudent) return;

  const resolvedStudentId =
    selectedStudent.student_id;

  const resolvedPartnerUuid =
    selectedStudent.partner_uuid ??
    partnerIdentity.partnerUuid;

  const result =
  await createWorkshopOffer({

    partner_id:
      partnerId,

    partner_uuid:
      resolvedPartnerUuid,

    partner_name:
      partnerName,

    student_id:
      resolvedStudentId,

    student_name:
      selectedStudent.student_name,

    school_name:
      selectedStudent.school_name,

  email:
  selectedStudent.email,

    phone:
      selectedStudent.phone,

    class_name:
      selectedStudent.class_name,

    workshop_title:
      workshopTitle,

    workshop_description:
      workshopDescription,

    workshop_date:
      workshopDate,

    workshop_mode:
      workshopMode,

    status:
      "pending"

  });

  if (!result) {

    alert(
      "Failed to save workshop"
    );

    return;

  }

  setWorkshopTitle("");
  setWorkshopDescription("");
  setWorkshopDate("");
  setWorkshopMode("");

  setShowWorkshopDialog(false);

  showSuccessMessage(
    "Workshop invitation sent"
  );

}

async function saveContactRequest() {

  if (!selectedStudent) return;

  const resolvedStudentId =
    selectedStudent.student_id;

  const resolvedPartnerUuid =
    selectedStudent.partner_uuid ??
    partnerIdentity.partnerUuid;

  const result =
  await createContactRequest({

    partner_id:
      partnerId,

    partner_uuid:
      resolvedPartnerUuid,

    partner_name:
      partnerName,

    student_id:
      resolvedStudentId,

    student_name:
      selectedStudent.student_name,

    school_name:
      selectedStudent.school_name,

    email:
  selectedStudent.email,

    phone:
      selectedStudent.phone,

    class_name:
      selectedStudent.class_name,

    request_reason:
      contactMessage,

    status:
      "pending"

  });

  if (!result) {

    alert(
      "Failed to save request"
    );

    return;

  }

  if (!selectedStudent.id) {

    alert(
      "Lead ID not found"
    );

    return;

  }

  await updateOffer(

    "partner_student_leads",

    selectedStudent.id,

    {

      contact_request_sent: true,

      updated_at:
        new Date().toISOString()

    }

  );

  setContactMessage("");

  setShowContactDialog(false);

  showSuccessMessage(
    "Contact request sent"
  );

}



useEffect(() => {

  async function initializePage() {

    await Promise.all([
      loadStudents(),
      loadPipeline(),
      loadPartnerActivity()
    ]);

  }

  initializePage();

}, []);

  useEffect(() => {

    let results =
      [...students];

    if (
      schoolFilter !== "All"
    ) {
      results =
        results.filter(
          s =>
            s.school_name ===
            schoolFilter
        );
    }

   if (
  classFilter !== "All"
) {
  results =
    results.filter(
      s =>
        String(
          s.class_name
        ) === classFilter
    );
}

if (
  eventFilter !== "All"
) {

  console.log(
    "Selected Event:",
    eventFilter
  );

  console.log(
    "Student Events:",
    results.map(
      s => s.event_name
    )
  );

  results =
    results.filter(
      s =>
        String(
          s.event_name
        ).trim()
        ===
        String(
          eventFilter
        ).trim()
    );
}

if (
  searchText.trim()
) {
  results =
    results.filter(
      s =>
        String(
  s.student_name || ""
)
  .toLowerCase()
  .trim()
  .includes(
    searchText
      .toLowerCase()
      .trim()
  )
    );
}

results =
  results.filter(
    s =>
      (s.overall_score || 0)
      >= scoreFilter
  );

setFilteredStudents(
  results
);

    setFilteredStudents(
      results
    );

}, [
  students,
  schoolFilter,
  classFilter,
  eventFilter,
  searchText,
  scoreFilter
]);

/* ============================================================
   FILTER OPTION HELPERS
============================================================ */

function getUniqueSchools(
  students: StudentRecord[]
): string[] {

  return Array.from(

    new Set(

      students

        .map(

          student => student.school_name

        )

        .filter(Boolean)

    )

  );

}

function getUniqueClasses(
  students: StudentRecord[]
): string[] {

  return Array.from(

    new Set(

      students

        .map(

          student =>

            String(student.class_name)

        )

        .filter(Boolean)

    )

  );

}

function getUniqueEvents(
  students: StudentRecord[]
): string[] {

  return Array.from(

    new Set(

      students

        .map(

          student => student.event_name

        )

        .filter(Boolean)

    )

  ) as string[];

}

/* ============================================================
   ERROR LOGGER
============================================================ */

function logError(
  context: string,
  error: unknown
): void {

  console.error(
    context,
    error
  );

}

/* ============================================================
   LOAD ALLOCATED STUDENTS
============================================================ */

async function loadStudents(): Promise<void> {

  try {

    const allocatedStudents =

      await fetchAllocatedStudents(

        partnerId

      );

    setStudents(

      allocatedStudents ?? []

    );

  } catch (error) {

   logError(
  "LOAD STUDENTS ERROR",
  error
);

    setStudents([]);

  }

}

/* ============================================================
   LOAD PARTNER PIPELINE
============================================================ */

async function loadPipeline(): Promise<void> {

  try {

    const pipelineData =

      await fetchPartnerPipeline(

        partnerId

      );

    setPipeline(

      pipelineData ?? []

    );

  } catch (error) {

    logError(
  "LOAD PIPELINE ERROR",
  error
);

    setPipeline([]);

  }

}

/* ============================================================
   RESEND OFFER
============================================================ */

async function resendOffer(
  item: any
): Promise<void> {

  switch (item.type) {

    case "Scholarship":
      await resendScholarshipOffer(item.id);
      break;

    case "Workshop":
      await resendWorkshopOffer(item.id);
      break;

    case "Contact":
      await resendContactRequest(item.id);
      break;

    default:
      return;
  }

  await loadPipeline();
}

/* ============================================================
   DISCARD OFFER
============================================================ */

async function discardOffer(
  item: any
): Promise<void> {

  switch (item.type) {

    case "Scholarship":
      await discardScholarshipOffer(item.id);
      break;

    case "Workshop":
      await discardWorkshopOffer(item.id);
      break;

    case "Contact":
      await discardContactRequest(item.id);
      break;

    default:
      return;
  }

  await loadPipeline();

}




async function saveOfferChanges() {

  if (!editOffer)
    return;

  let tableName = "";
  let payload: any = {};

  if (
    editOffer.type ===
    "Scholarship"
  ) {

    tableName =
      "partner_scholarship_offers";

    payload = {
      offer_title:
        editOffer.offer_title,
      offer_description:
        editOffer.offer_description,
      scholarship_type:
        editOffer.scholarship_type,
      scholarship_value:
        editOffer.scholarship_value
    };
  }

  if (
    editOffer.type ===
    "Workshop"
  ) {

    tableName =
      "partner_workshop_offers";

    payload = {
      workshop_title:
        editOffer.workshop_title,
      workshop_description:
        editOffer.workshop_description,
      workshop_date:
        editOffer.workshop_date,
      workshop_mode:
        editOffer.workshop_mode
    };
  }

  if (
    editOffer.type ===
    "Contact"
  ) {

    tableName =
      "partner_contact_requests";

    payload = {
      request_reason:
        editOffer.request_reason
    };
  }

  const result =
    await updateOffer(
      tableName,
      editOffer.id,
      payload
    );

  console.log(
    "UPDATE RESULT",
    result
  );

  if (
    result?.error
  ) {

    alert(
      JSON.stringify(
        result.error
      )
    );

    return;
  }

  alert(
    "Offer Updated Successfully"
  );

  setEditOffer(null);

  await loadPipeline();
}

/* ============================================================
   LOAD PARTNER ACTIVITY
============================================================ */

async function loadPartnerActivity(): Promise<void> {

  try {

    const [

      scholarshipOffers,

      workshopOffers,

      contactRequests

    ] = await Promise.all([

      fetchPartnerScholarshipOffers(

        partnerId

      ),

      fetchPartnerWorkshopOffers(

        partnerId

      ),

      fetchPartnerContactRequests(

        partnerId

      )

    ]);

    setScholarshipOffers(

      scholarshipOffers ?? []

    );

    setWorkshopOffers(

      workshopOffers ?? []

    );

    setContactRequests(

      contactRequests ?? []

    );

  } catch (error) {

    logError(
      "LOAD PARTNER ACTIVITY ERROR",
      error
    );

    setScholarshipOffers([]);

    setWorkshopOffers([]);

    setContactRequests([]);

}

}

const schools =
  getUniqueSchools(
    students
  );

const classes =
  getUniqueClasses(
    students
  );

const events =
  getUniqueEvents(
    students
  );

    return (

    <div
      style={{
        width: "95%",
        maxWidth: "1600px",
        margin: "0 auto",
        padding: "24px",
        boxSizing: "border-box"
      }}
    >

      {/* =========================================================
          TALENT DISCOVERY HERO
         ========================================================= */}

      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #FFFFFF 0%, #FFFCF8 55%, #F7FAFF 100%)",
          borderRadius: "28px",
          border: "1px solid #DCE4EE",
          boxShadow:
            "0 12px 34px rgba(15, 23, 42, 0.06)",
          padding: "34px 38px",
          marginBottom: "20px",
          minHeight: "165px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "30px"
        }}
      >

        <div
          style={{
            position: "absolute",
            width: "330px",
            height: "330px",
            borderRadius: "50%",
            right: "-105px",
            top: "-175px",
            background:
              "rgba(249, 115, 22, 0.065)",
            pointerEvents: "none"
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "240px",
            height: "240px",
            borderRadius: "50%",
            right: "150px",
            bottom: "-180px",
            background:
              "rgba(59, 130, 246, 0.055)",
            pointerEvents: "none"
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "115px",
            height: "115px",
            borderRadius: "50%",
            right: "92px",
            top: "22px",
            background:
              "rgba(255, 237, 213, 0.55)",
            pointerEvents: "none"
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "850px"
          }}
        >

          <div
            style={{
              color: "#F97316",
              fontSize: "12px",
              letterSpacing: "2.4px",
              fontWeight: 800,
              textTransform: "uppercase",
              marginBottom: "12px"
            }}
          >
            ALLOCATED TALENT POOL
          </div>

          <h1
            style={{
              margin: 0,
              color: "#0F172A",
              fontSize: "40px",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-1px"
            }}
          >
            Discover Allocated Talent
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              color: "#64748B",
              fontSize: "15px",
              lineHeight: 1.65,
              maxWidth: "760px"
            }}
          >
            Explore students allocated by Talent Passport and
            create meaningful opportunities through scholarships,
            workshops and consent-based contact requests.
          </p>

          <div
            style={{
              display: "flex",
              gap: "9px",
              flexWrap: "wrap",
              marginTop: "17px"
            }}
          >

            <div
              style={{
                padding: "7px 11px",
                borderRadius: "999px",
                background: "#FFF7ED",
                border: "1px solid #FED7AA",
                color: "#C2410C",
                fontSize: "13px",
                fontWeight: 800
              }}
            >
              {students.length} ALLOCATED STUDENTS
            </div>

            <div
              style={{
                padding: "7px 11px",
                borderRadius: "999px",
                background: "#EFF6FF",
                border: "1px solid #BFDBFE",
                color: "#1D4ED8",
                fontSize: "13px",
                fontWeight: 800
              }}
            >
              CONSENT-BASED ENGAGEMENT
            </div>

          </div>

        </div>

        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "128px",
            height: "128px",
            borderRadius: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(145deg, #FFF7ED, #FFFFFF)",
            border: "1px solid #FED7AA",
            boxShadow:
              "0 12px 30px rgba(249,115,22,.10)",
            flexShrink: 0
          }}
        >

          <div style={{ textAlign: "center" }}>

            <div
              style={{
                fontSize: "39px",
                lineHeight: 1
              }}
            >
              ✦
            </div>

            <div
              style={{
                marginTop: "9px",
                color: "#F97316",
                fontSize: "12px",
                fontWeight: 900,
                letterSpacing: "1.4px"
              }}
            >
              TALENT DISCOVERY
            </div>

          </div>

        </div>

      </div>


      {/* =========================================================
          MARKETPLACE INTELLIGENCE
         ========================================================= */}

      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "24px",
          padding: "24px",
          marginBottom: "20px",
          boxShadow:
            "0 8px 24px rgba(15,23,42,.035)"
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "20px",
            marginBottom: "20px"
          }}
        >

          <div>

            <div
              style={{
                color: "#F97316",
                fontSize: "13px",
                fontWeight: 800,
                letterSpacing: "1.8px",
                textTransform: "uppercase",
                marginBottom: "7px"
              }}
            >
              MARKETPLACE INTELLIGENCE
            </div>

            <h2
              style={{
                margin: 0,
                color: "#0F172A",
                fontSize: "24px",
                fontWeight: 800
              }}
            >
              Marketplace Performance
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#64748B",
                fontSize: "16px"
              }}
            >
              Track your outreach activity and student responses
              across the Talent Passport marketplace.
            </p>

          </div>

          <div
            style={{
              color: "#94A3B8",
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: ".8px",
              whiteSpace: "nowrap"
            }}
          >
            PARTNER OPPORTUNITY LEDGER
          </div>

        </div>


        {/* KPI CARDS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0,1fr))",
            gap: "14px"
          }}
        >

          <MetricCard
            label="Scholarships Offered"
            value={scholarshipOffers.length}
            description="Scholarship opportunities shared"
            tone="orange"
          />

          <MetricCard
            label="Workshops Offered"
            value={workshopOffers.length}
            description="Workshop invitations created"
            tone="blue"
          />

          <MetricCard
            label="Contacts Requested"
            value={contactRequests.length}
            description="Consent-based contact requests"
            tone="green"
          />

          <MetricCard
            label="Pending"
            value={
              [
                ...scholarshipOffers,
                ...workshopOffers,
                ...contactRequests
              ].filter(
                x => x.status === "pending"
              ).length
            }
            description="Awaiting student response"
            tone="yellow"
          />

          <MetricCard
            label="Accepted"
            value={
              [
                ...scholarshipOffers,
                ...workshopOffers,
                ...contactRequests
              ].filter(
                x => x.status === "accepted"
              ).length
            }
            description="Opportunities accepted"
            tone="green"
          />

          <MetricCard
            label="Rejected"
            value={
              [
                ...scholarshipOffers,
                ...workshopOffers,
                ...contactRequests
              ].filter(
                x => x.status === "rejected"
              ).length
            }
            description="Opportunities declined"
            tone="red"
          />

        </div>

      </div>


      {/* =========================================================
          OFFER MANAGEMENT
         ========================================================= */}

      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "24px",
          marginBottom: "20px",
          overflow: "hidden",
          boxShadow:
            "0 8px 24px rgba(15,23,42,.035)"
        }}
      >

        <div
          style={{
            position: "relative",
            overflow: "hidden",
            padding: "24px",
            borderBottom: "1px solid #E2E8F0",
            background:
              "linear-gradient(135deg,#FFFFFF 0%,#FFFCF8 100%)"
          }}
        >

          <div
            style={{
              position: "absolute",
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              right: "-50px",
              top: "-90px",
              background:
                "rgba(249,115,22,.055)"
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1
            }}
          >

            <div
              style={{
                color: "#F97316",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "1.5px",
                marginBottom: "6px"
              }}
            >
              OPPORTUNITY PIPELINE
            </div>

            <h2
              style={{
                margin: 0,
                color: "#0F172A",
                fontSize: "23px",
                fontWeight: 800
              }}
            >
              Offer Management
            </h2>

            <p
              style={{
                margin: "5px 0 17px",
                color: "#64748B",
                fontSize: "15px"
              }}
            >
              Review and manage scholarships, workshops and
              contact requests already sent.
            </p>

            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap"
              }}
            >

              {[
                "All",
                "Scholarship",
                "Workshop",
                "Contact"
              ].map(tab => {

                const active =
                  activePipelineTab === tab;

                return (

                  <button
                    key={tab}
                    onClick={() =>
                      setActivePipelineTab(tab)
                    }
                    style={{
                      padding: "9px 15px",
                      border:
                        active
                          ? "1px solid #F97316"
                          : "1px solid #E2E8F0",
                      borderRadius: "10px",
                      cursor: "pointer",
                      background:
                        active
                          ? "#FFF7ED"
                          : "#FFFFFF",
                      color:
                        active
                          ? "#EA580C"
                          : "#475569",
                      fontWeight: 750,
                      fontSize: "14px",
                      boxShadow:
                        active
                          ? "0 4px 12px rgba(249,115,22,.08)"
                          : "none"
                    }}
                  >
                    {tab}
                  </button>

                );

              })}

            </div>

          </div>

        </div>


        <div
          style={{
            overflowX: "auto"
          }}
        >

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "760px"
            }}
          >

            <thead>

              <tr
                style={{
                  background: "#F8FAFC"
                }}
              >

                {[
                  "Type",
                  "Student",
                  "School",
                  "Status",
                  "Actions"
                ].map(label => (

                  <th
                    key={label}
                    style={{
                      padding: "13px 18px",
                      textAlign: "left",
                      color: "#64748B",
                      fontSize: "12px",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      fontWeight: 800,
                      borderBottom:
                        "1px solid #E2E8F0"
                    }}
                  >
                    {label}
                  </th>

                ))}

              </tr>

            </thead>

            <tbody>

              {pipeline

                .filter(
                  item =>
                    activePipelineTab === "All" ||
                    item.type === activePipelineTab
                )

                .map(item => (

                  <tr
                    key={item.id}
                    style={{
                      borderBottom:
                        "1px solid #F1F5F9"
                    }}
                  >

                    <td
                      style={{
                        padding: "15px 18px"
                      }}
                    >
                      <TypeBadge
                        type={item.type}
                      />
                    </td>

                    <td
                      style={{
                        padding: "15px 18px",
                        color: "#0F172A",
                        fontSize: "15px",
                        fontWeight: 750
                      }}
                    >
                      {item.student_name}
                    </td>

                    <td
                      style={{
                        padding: "15px 18px",
                        color: "#475569",
                        fontSize: "15px"
                      }}
                    >
                      {item.school_name}
                    </td>

                    <td
                      style={{
                        padding: "15px 18px"
                      }}
                    >
                      <StatusBadge
                        status={item.status}
                      />
                    </td>

                    <td
                      style={{
                        padding: "15px 18px"
                      }}
                    >

                      <div
                        style={{
                          display: "flex",
                          gap: "7px",
                          flexWrap: "wrap"
                        }}
                      >

                        <ActionButton
                          label="View"
                          onClick={() => {
                            setViewOffer(item);
                          }}
                        />

                        <ActionButton
                          label="Edit"
                          onClick={() => {
                            setEditOffer(item);
                          }}
                        />

                        <ActionButton
                          label="Send Again"
                          onClick={() =>
                            resendOffer(item)
                          }
                        />

                        <ActionButton
                          label="Discard"
                          danger
                          onClick={() =>
                            discardOffer(item)
                          }
                        />

                      </div>

                    </td>

                  </tr>

                ))}

            </tbody>

          </table>

        </div>

      </div>


      {/* =========================================================
          TALENT FILTERS
         ========================================================= */}

      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "24px",
          padding: "24px",
          marginBottom: "20px",
          boxShadow:
            "0 8px 24px rgba(15,23,42,.035)"
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "20px",
            marginBottom: "18px"
          }}
        >

          <div>

            <div
              style={{
                color: "#2563EB",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "1.5px",
                marginBottom: "6px"
              }}
            >
              TALENT EXPLORER
            </div>

            <h2
              style={{
                margin: 0,
                color: "#0F172A",
                fontSize: "23px",
                fontWeight: 800
              }}
            >
              Find the Right Students
            </h2>

            <p
              style={{
                margin: "5px 0 0",
                color: "#64748B",
                fontSize: "15px"
              }}
            >
              Refine your allocated talent pool using school,
              class, event, student and score filters.
            </p>

          </div>

          <div
            style={{
              padding: "7px 11px",
              borderRadius: "999px",
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              color: "#1D4ED8",
              fontSize: "13px",
              fontWeight: 800
            }}
          >
            {filteredStudents.length} RESULTS
          </div>

        </div>


        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(5, minmax(0,1fr))",
            gap: "12px"
          }}
        >

          <FilterField label="School">

            <select
              value={schoolFilter}
              onChange={(e) =>
                setSchoolFilter(
                  e.target.value
                )
              }
              style={fieldStyle}
            >

              <option>All</option>

              {schools.map(
                school => (
                  <option key={school}>
                    {school}
                  </option>
                )
              )}

            </select>

          </FilterField>


          <FilterField label="Class">

            <select
              value={classFilter}
              onChange={(e) =>
                setClassFilter(
                  e.target.value
                )
              }
              style={fieldStyle}
            >

              <option>All</option>

              {classes.map(
                cls => (
                  <option key={cls}>
                    {cls}
                  </option>
                )
              )}

            </select>

          </FilterField>


          <FilterField label="Event">

            <select
              value={eventFilter}
              onChange={(e) =>
                setEventFilter(
                  e.target.value
                )
              }
              style={fieldStyle}
            >

              <option>All</option>

              {events.map(
                event => (
                  <option key={event}>
                    {event}
                  </option>
                )
              )}

            </select>

          </FilterField>


          <FilterField label="Search Student">

            <input
              value={searchText}
              onChange={(e) =>
                setSearchText(
                  e.target.value
                )
              }
              placeholder="Student Name"
              style={fieldStyle}
            />

          </FilterField>


          <FilterField label="Minimum Score">

            <input
              type="number"
              value={scoreFilter}
              onChange={(e) =>
                setScoreFilter(
                  Number(
                    e.target.value
                  )
                )
              }
              style={fieldStyle}
            />

          </FilterField>

        </div>

      </div>


      {/* =========================================================
          SUCCESS MESSAGE
         ========================================================= */}

      {offerSuccess && (

        <div
          style={{
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(135deg,#ECFDF5,#F7FFFB)",
            border: "1px solid #A7F3D0",
            color: "#065F46",
            padding: "15px 18px",
            borderRadius: "16px",
            marginBottom: "20px",
            fontWeight: 700,
            fontSize: "15px",
            boxShadow:
              "0 6px 18px rgba(16,185,129,.06)"
          }}
        >
          ✓ {offerSuccess}
        </div>

      )}


      {/* =========================================================
          ALLOCATED STUDENTS
         ========================================================= */}

      <div
        style={{
          marginBottom: "18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "20px"
        }}
      >

        <div>

          <div
            style={{
              color: "#F97316",
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "1.5px",
              marginBottom: "6px"
            }}
          >
            ALLOCATED TALENT
          </div>

          <h2
            style={{
              margin: 0,
              color: "#0F172A",
              fontSize: "25px",
              fontWeight: 800
            }}
          >
            Student Opportunity Cards
          </h2>

          <p
            style={{
              margin: "5px 0 0",
              color: "#64748B",
              fontSize: "15px"
            }}
          >
            Review student profiles and initiate approved
            marketplace opportunities.
          </p>

        </div>

      </div>


      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2, minmax(0,1fr))",
          gap: "18px"
        }}
      >

        {filteredStudents.map(
          (student) => (

            <div
              key={student.student_id}
              style={{
                position: "relative",
                overflow: "hidden",
                background:
                  "linear-gradient(145deg,#FFFFFF 0%,#FFFCF8 100%)",
                border: "1px solid #E2E8F0",
                borderRadius: "24px",
                padding: "22px",
                boxShadow:
                  "0 8px 24px rgba(15,23,42,.04)"
              }}
            >

              <div
                style={{
                  position: "absolute",
                  width: "145px",
                  height: "145px",
                  borderRadius: "50%",
                  right: "-55px",
                  top: "-70px",
                  background:
                    "rgba(249,115,22,.055)",
                  pointerEvents: "none"
                }}
              />

              <div
                style={{
                  position: "relative",
                  zIndex: 1
                }}
              >

                {/* STUDENT HEADER */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent:
                      "space-between",
                    gap: "15px",
                    marginBottom: "18px"
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px"
                    }}
                  >

                    <div
                      style={{
                        width: "46px",
                        height: "46px",
                        borderRadius: "15px",
                        background: "#FFF7ED",
                        border:
                          "1px solid #FED7AA",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#F97316",
                        fontSize: "20px",
                        fontWeight: 900,
                        flexShrink: 0
                      }}
                    >
                      {student.student_name
                        ?.charAt(0)
                        .toUpperCase() || "S"}
                    </div>

                    <div>

                      <div
                        style={{
                          color: "#F97316",
                          fontSize: "11px",
                          fontWeight: 800,
                          letterSpacing: "1.3px",
                          marginBottom: "4px"
                        }}
                      >
                        ALLOCATED STUDENT
                      </div>

                      <h2
                        style={{
                          margin: 0,
                          color: "#0F172A",
                          fontSize: "22px",
                          fontWeight: 800
                        }}
                      >
                        {student.student_name}
                      </h2>

                    </div>

                  </div>


                  <div
                    style={{
                      minWidth: "65px",
                      borderRadius: "14px",
                      padding: "9px 11px",
                      background: "#EFF6FF",
                      border:
                        "1px solid #BFDBFE",
                      textAlign: "center"
                    }}
                  >

                    <div
                      style={{
                        color: "#1D4ED8",
                        fontSize: "11px",
                        fontWeight: 800,
                        letterSpacing: ".7px"
                      }}
                    >
                      SCORE
                    </div>

                    <div
                      style={{
                        marginTop: "3px",
                        color: "#2563EB",
                        fontSize: "25px",
                        lineHeight: 1,
                        fontWeight: 900
                      }}
                    >
                      {student.overall_score || 0}
                    </div>

                  </div>

                </div>


                {/* STUDENT INFORMATION */}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(2,minmax(0,1fr))",
                    gap: "9px"
                  }}
                >

                  <InfoCard
                    label="School"
                    value={student.school_name}
                  />

                  <InfoCard
                    label="Class"
                    value={student.class_name}
                  />

                  <InfoCard
                    label="Event"
                    value={
                      student.event_name ||
                      "-"
                    }
                  />

                  <InfoCard
                    label="Pathway"
                    value={
                      student.pathway ||
                      "-"
                    }
                  />

                </div>


                {/* ACTIONS */}

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "17px",
                    flexWrap: "wrap"
                  }}
                >

                  <button
                    onClick={() => {
                      setSelectedStudent(student);
                      setShowScholarshipDialog(true);
                    }}
                    style={{
                      background: "#F97316",
                      color: "#FFFFFF",
                      border:
                        "1px solid #F97316",
                      padding: "10px 14px",
                      borderRadius: "11px",
                      cursor: "pointer",
                      fontWeight: 750,
                      fontSize: "14px",
                      boxShadow:
                        "0 5px 12px rgba(249,115,22,.14)"
                    }}
                  >
                    + Offer Scholarship
                  </button>

                  <button
                    onClick={() => {
                      setSelectedStudent(student);
                      setShowWorkshopDialog(true);
                    }}
                    style={{
                      background: "#143B73",
                      color: "#FFFFFF",
                      border:
                        "1px solid #143B73",
                      padding: "10px 14px",
                      borderRadius: "11px",
                      cursor: "pointer",
                      fontWeight: 750,
                      fontSize: "14px"
                    }}
                  >
                    + Offer Workshop
                  </button>

                  <button
                    onClick={() => {
                      setSelectedStudent(student);
                      setShowContactDialog(true);
                    }}
                    style={{
                      background: "#FFFFFF",
                      color: "#334155",
                      border:
                        "1px solid #CBD5E1",
                      padding: "10px 14px",
                      borderRadius: "11px",
                      cursor: "pointer",
                      fontWeight: 750,
                      fontSize: "14px"
                    }}
                  >
                    Request Contact
                  </button>

                </div>

              </div>

            </div>

          )
        )}

      </div>


      {/* =========================================================
          SCHOLARSHIP DIALOG
         ========================================================= */}

      {showScholarshipDialog &&
        selectedStudent && (

          <ModalShell>

            <ModalCard>

              <ModalHeader
                eyebrow="SCHOLARSHIP OPPORTUNITY"
                title="Offer Scholarship"
                description={`Create a scholarship opportunity for ${selectedStudent.student_name}.`}
                onClose={() =>
                  setShowScholarshipDialog(false)
                }
              />

              <div
                style={{
                  padding: "22px"
                }}
              >

                <StudentContext
                  student={selectedStudent}
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: "12px",
                    marginTop: "18px"
                  }}
                >

                  <input
                    placeholder="Scholarship Title"
                    value={scholarshipTitle}
                    onChange={(e) =>
                      setScholarshipTitle(
                        e.target.value
                      )
                    }
                    style={dialogFieldStyle}
                  />

                  <input
                    placeholder="Scholarship Type"
                    value={scholarshipType}
                    onChange={(e) =>
                      setScholarshipType(
                        e.target.value
                      )
                    }
                    style={dialogFieldStyle}
                  />

                </div>

                <input
                  placeholder="Scholarship Value"
                  value={scholarshipValue}
                  onChange={(e) =>
                    setScholarshipValue(
                      e.target.value
                    )
                  }
                  style={{
                    ...dialogFieldStyle,
                    marginTop: "12px"
                  }}
                />

                <textarea
                  placeholder="Scholarship Description"
                  value={scholarshipDescription}
                  onChange={(e) =>
                    setScholarshipDescription(
                      e.target.value
                    )
                  }
                  style={{
                    ...dialogFieldStyle,
                    minHeight: "130px",
                    marginTop: "12px",
                    resize: "vertical"
                  }}
                />

                <ModalActions
                  onCancel={() =>
                    setShowScholarshipDialog(false)
                  }
                  onConfirm={saveScholarship}
                  confirmLabel="Send Offer"
                  tone="orange"
                />

              </div>

            </ModalCard>

          </ModalShell>

        )}


      {/* =========================================================
          WORKSHOP DIALOG
         ========================================================= */}

      {showWorkshopDialog &&
        selectedStudent && (

          <ModalShell>

            <ModalCard>

              <ModalHeader
                eyebrow="LEARNING OPPORTUNITY"
                title="Offer Workshop"
                description={`Invite ${selectedStudent.student_name} to a workshop opportunity.`}
                onClose={() =>
                  setShowWorkshopDialog(false)
                }
              />

              <div
                style={{
                  padding: "22px"
                }}
              >

                <StudentContext
                  student={selectedStudent}
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: "12px",
                    marginTop: "18px"
                  }}
                >

                  <input
                    placeholder="Workshop Title"
                    value={workshopTitle}
                    onChange={(e) =>
                      setWorkshopTitle(
                        e.target.value
                      )
                    }
                    style={dialogFieldStyle}
                  />

                  <input
                    placeholder="Workshop Date"
                    value={workshopDate}
                    onChange={(e) =>
                      setWorkshopDate(
                        e.target.value
                      )
                    }
                    style={dialogFieldStyle}
                  />

                </div>

                <input
                  placeholder="Mode (Online / Offline)"
                  value={workshopMode}
                  onChange={(e) =>
                    setWorkshopMode(
                      e.target.value
                    )
                  }
                  style={{
                    ...dialogFieldStyle,
                    marginTop: "12px"
                  }}
                />

                <textarea
                  placeholder="Workshop Description"
                  value={workshopDescription}
                  onChange={(e) =>
                    setWorkshopDescription(
                      e.target.value
                    )
                  }
                  style={{
                    ...dialogFieldStyle,
                    minHeight: "130px",
                    marginTop: "12px",
                    resize: "vertical"
                  }}
                />

                <ModalActions
                  onCancel={() =>
                    setShowWorkshopDialog(false)
                  }
                  onConfirm={saveWorkshop}
                  confirmLabel="Send Workshop"
                  tone="blue"
                />

              </div>

            </ModalCard>

          </ModalShell>

        )}


      {/* =========================================================
          CONTACT DIALOG
         ========================================================= */}

      {showContactDialog &&
        selectedStudent && (

          <ModalShell>

            <ModalCard>

              <ModalHeader
                eyebrow="CONSENT-BASED CONTACT"
                title="Request Parent Contact"
                description={`Submit a contact request for ${selectedStudent.student_name}.`}
                onClose={() =>
                  setShowContactDialog(false)
                }
              />

              <div
                style={{
                  padding: "22px"
                }}
              >

                <StudentContext
                  student={selectedStudent}
                />

                <textarea
                  placeholder="Reason for contact request"
                  value={contactMessage}
                  onChange={(e) =>
                    setContactMessage(
                      e.target.value
                    )
                  }
                  style={{
                    ...dialogFieldStyle,
                    minHeight: "140px",
                    marginTop: "18px",
                    resize: "vertical"
                  }}
                />

                <ModalActions
                  onCancel={() =>
                    setShowContactDialog(false)
                  }
                  onConfirm={saveContactRequest}
                  confirmLabel="Send Request"
                  tone="orange"
                />

              </div>

            </ModalCard>

          </ModalShell>

        )}


      {/* =========================================================
          VIEW OFFER DIALOG
         ========================================================= */}

      {viewOffer && (

        <ModalShell>

          <div
            style={{
              width: "min(900px, calc(100vw - 40px))",
              maxHeight: "88vh",
              overflowY: "auto",
              background: "#FFFFFF",
              borderRadius: "26px",
              border: "1px solid #E2E8F0",
              boxShadow:
                "0 28px 80px rgba(15,23,42,.20)"
            }}
          >

            <ModalHeader
              eyebrow="OPPORTUNITY DETAILS"
              title="Offer Details"
              description="Review the complete opportunity record."
              onClose={() =>
                setViewOffer(null)
              }
            />

            <div
              style={{
                padding: "22px"
              }}
            >

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "12px"
                }}
              >

                <Card
                  title="Offer Type"
                  value={viewOffer.type}
                />

                <Card
                  title="Status"
                  value={viewOffer.status}
                />

                <Card
                  title="Student"
                  value={viewOffer.student_name}
                />

                <Card
                  title="School"
                  value={viewOffer.school_name}
                />

                <Card
                  title="Created"
                  value={
                    new Date(
                      viewOffer.created_at
                    ).toLocaleDateString()
                  }
                />

                <Card
                  title="Last Updated"
                  value={
                    viewOffer.updated_at
                      ? new Date(
                          viewOffer.updated_at
                        ).toLocaleDateString()
                      : "-"
                  }
                />

              </div>


              <div
                style={{
                  marginTop: "18px"
                }}
              >

                <div
                  style={{
                    color: "#64748B",
                    fontSize: "12px",
                    fontWeight: 800,
                    letterSpacing: "1px",
                    marginBottom: "7px"
                  }}
                >
                  OFFER TITLE
                </div>

                <div
                  style={{
                    background: "#F8FAFC",
                    border:
                      "1px solid #E2E8F0",
                    borderRadius: "14px",
                    padding: "14px",
                    color: "#0F172A",
                    fontSize: "16px",
                    fontWeight: 700
                  }}
                >
                  {
                    viewOffer.offer_title ||
                    viewOffer.workshop_title ||
                    "Contact Request"
                  }
                </div>


                <div
                  style={{
                    color: "#64748B",
                    fontSize: "12px",
                    fontWeight: 800,
                    letterSpacing: "1px",
                    margin:
                      "18px 0 7px"
                  }}
                >
                  DESCRIPTION
                </div>

                <div
                  style={{
                    background: "#F8FAFC",
                    border:
                      "1px solid #E2E8F0",
                    borderRadius: "14px",
                    padding: "14px",
                    color: "#475569",
                    fontSize: "15px",
                    lineHeight: 1.6,
                    minHeight: "70px"
                  }}
                >
                  {
                    viewOffer.offer_description ||
                    viewOffer.workshop_description ||
                    viewOffer.request_reason ||
                    "-"
                  }
                </div>

              </div>

            </div>

          </div>

        </ModalShell>

      )}


      {/* =========================================================
          EDIT OFFER DIALOG
         ========================================================= */}

      {editOffer && (

        <ModalShell>

          <div
            style={{
              width: "min(850px, calc(100vw - 40px))",
              maxHeight: "88vh",
              overflowY: "auto",
              background: "#FFFFFF",
              borderRadius: "26px",
              border: "1px solid #E2E8F0",
              boxShadow:
                "0 28px 80px rgba(15,23,42,.20)"
            }}
          >

            <ModalHeader
              eyebrow="OPPORTUNITY MANAGEMENT"
              title="Edit Offer"
              description="Update the information attached to this opportunity."
              onClose={() =>
                setEditOffer(null)
              }
            />

            <div
              style={{
                padding: "22px"
              }}
            >

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "12px"
                }}
              >

                <input
                  value={
                    editOffer.offer_title ||
                    editOffer.workshop_title ||
                    ""
                  }
                  onChange={(e) =>
                    setEditOffer({
                      ...editOffer,
                      offer_title:
                        e.target.value
                    })
                  }
                  placeholder="Offer Title"
                  style={dialogFieldStyle}
                />

                <input
                  value={
                    editOffer.scholarship_value ||
                    ""
                  }
                  onChange={(e) =>
                    setEditOffer({
                      ...editOffer,
                      scholarship_value:
                        e.target.value
                    })
                  }
                  placeholder="Value"
                  style={dialogFieldStyle}
                />

                <input
                  value={
                    editOffer.scholarship_type ||
                    ""
                  }
                  onChange={(e) =>
                    setEditOffer({
                      ...editOffer,
                      scholarship_type:
                        e.target.value
                    })
                  }
                  placeholder="Type"
                  style={dialogFieldStyle}
                />

                <input
                  value={
                    editOffer.workshop_date ||
                    ""
                  }
                  onChange={(e) =>
                    setEditOffer({
                      ...editOffer,
                      workshop_date:
                        e.target.value
                    })
                  }
                  placeholder="Workshop Date"
                  style={dialogFieldStyle}
                />

                <input
                  value={
                    editOffer.workshop_mode ||
                    ""
                  }
                  onChange={(e) =>
                    setEditOffer({
                      ...editOffer,
                      workshop_mode:
                        e.target.value
                    })
                  }
                  placeholder="Workshop Mode"
                  style={dialogFieldStyle}
                />

              </div>

              <textarea
                value={
                  editOffer.offer_description ||
                  editOffer.workshop_description ||
                  editOffer.request_reason ||
                  ""
                }
                onChange={(e) =>
                  setEditOffer({
                    ...editOffer,
                    offer_description:
                      e.target.value
                  })
                }
                rows={6}
                placeholder="Description"
                style={{
                  ...dialogFieldStyle,
                  width: "100%",
                  marginTop: "12px",
                  resize: "vertical"
                }}
              />

              <ModalActions
                onCancel={() =>
                  setEditOffer(null)
                }
                onConfirm={async () => {

                  console.log(
                    "EDIT OFFER BEFORE SAVE",
                    editOffer
                  );

                  await saveOfferChanges();

                }}
                confirmLabel="Save Changes"
                tone="blue"
              />

            </div>

          </div>

        </ModalShell>

      )}

    </div>

  );
}

function InfoCard({
  label,
  value
}: any) {

  return (

    <div
      style={{
        background:
          "linear-gradient(145deg,#F8FAFC,#FFFFFF)",
        border:
          "1px solid #E2E8F0",
        borderRadius: "13px",
        padding: "12px"
      }}
    >

      <div
        style={{
          fontSize: "11px",
          color: "#64748B",
          fontWeight: 800,
          letterSpacing: ".8px",
          textTransform: "uppercase",
          marginBottom: "5px"
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#0F172A",
          fontSize: "14px",
          fontWeight: 700,
          lineHeight: 1.4,
          wordBreak: "break-word"
        }}
      >
        {value || "-"}
      </div>

    </div>

  );
}


/* =========================================================
   MARKETPLACE KPI CARD
   ========================================================= */

function MetricCard({
  label,
  value,
  description,
  tone
}: {
  label: string;
  value: any;
  description: string;
  tone:
    | "orange"
    | "blue"
    | "green"
    | "yellow"
    | "red";
}) {

  const palettes = {

    orange: {
      background:
        "linear-gradient(135deg,#FFF7ED,#FFFBF5)",
      border: "#FED7AA",
      label: "#9A3412",
      value: "#F97316",
      circle:
        "rgba(249,115,22,.08)"
    },

    blue: {
      background:
        "linear-gradient(135deg,#EFF6FF,#F8FBFF)",
      border: "#BFDBFE",
      label: "#1E40AF",
      value: "#2563EB",
      circle:
        "rgba(37,99,235,.07)"
    },

    green: {
      background:
        "linear-gradient(135deg,#ECFDF5,#F7FFFB)",
      border: "#BBF7D0",
      label: "#166534",
      value: "#16A34A",
      circle:
        "rgba(22,163,74,.07)"
    },

    yellow: {
      background:
        "linear-gradient(135deg,#FEFCE8,#FFFDF4)",
      border: "#FDE68A",
      label: "#854D0E",
      value: "#CA8A04",
      circle:
        "rgba(202,138,4,.07)"
    },

    red: {
      background:
        "linear-gradient(135deg,#FEF2F2,#FFF9F9)",
      border: "#FECACA",
      label: "#991B1B",
      value: "#DC2626",
      circle:
        "rgba(220,38,38,.06)"
    }

  };

  const palette =
    palettes[tone];

  return (

    <div
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "108px",
        borderRadius: "18px",
        padding: "17px",
        background:
          palette.background,
        border:
          `1px solid ${palette.border}`
      }}
    >

      <div
        style={{
          position: "absolute",
          width: "88px",
          height: "88px",
          borderRadius: "50%",
          right: "-28px",
          top: "-34px",
          background:
            palette.circle
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1
        }}
      >

        <div
          style={{
            color:
              palette.label,
            fontSize: "12px",
            fontWeight: 850,
            letterSpacing: ".65px",
            textTransform: "uppercase"
          }}
        >
          {label}
        </div>

        <div
          style={{
            color:
              palette.value,
            fontSize: "33px",
            fontWeight: 900,
            lineHeight: 1,
            marginTop: "9px"
          }}
        >
          {value}
        </div>

        <div
          style={{
            color: "#475569",
            fontSize: "13px",
            fontWeight: 600,
            marginTop: "7px"
          }}
        >
          {description}
        </div>

      </div>

    </div>

  );
}


/* =========================================================
   FILTER FIELD
   ========================================================= */

function FilterField({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {

  return (

    <div>

      <label
        style={{
          display: "block",
          color: "#475569",
          fontSize: "12px",
          fontWeight: 800,
          letterSpacing: ".7px",
          textTransform: "uppercase",
          marginBottom: "7px"
        }}
      >
        {label}
      </label>

      {children}

    </div>

  );
}


const fieldStyle:
  React.CSSProperties = {

    width: "100%",
    height: "42px",
    padding: "0 12px",
    borderRadius: "11px",
    border: "1px solid #CBD5E1",
    background: "#FFFFFF",
    color: "#0F172A",
    fontSize: "14px",
    fontWeight: 600,
    outline: "none",
    boxSizing: "border-box"

  };


const dialogFieldStyle:
  React.CSSProperties = {

    width: "100%",
    padding: "11px 12px",
    borderRadius: "11px",
    border: "1px solid #CBD5E1",
    background: "#FFFFFF",
    color: "#0F172A",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box"

  };


/* =========================================================
   PIPELINE TYPE BADGE
   ========================================================= */

function TypeBadge({
  type
}: {
  type: string;
}) {

  const config: any = {

    Scholarship: {
      bg: "#FFF7ED",
      border: "#FED7AA",
      color: "#C2410C"
    },

    Workshop: {
      bg: "#EFF6FF",
      border: "#BFDBFE",
      color: "#1D4ED8"
    },

    Contact: {
      bg: "#ECFDF5",
      border: "#BBF7D0",
      color: "#15803D"
    }

  };

  const style =
    config[type] || {
      bg: "#F8FAFC",
      border: "#E2E8F0",
      color: "#475569"
    };

  return (

    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "5px 9px",
        borderRadius: "999px",
        background: style.bg,
        border:
          `1px solid ${style.border}`,
        color: style.color,
        fontSize: "12px",
        fontWeight: 800
      }}
    >
      {type}
    </span>

  );
}


/* =========================================================
   STATUS BADGE
   ========================================================= */

function StatusBadge({
  status
}: {
  status: string;
}) {

  const normalized =
    String(status || "")
      .toLowerCase();

  let style = {
    bg: "#F8FAFC",
    border: "#E2E8F0",
    color: "#475569"
  };

  if (
    normalized === "pending"
  ) {
    style = {
      bg: "#FEFCE8",
      border: "#FDE68A",
      color: "#A16207"
    };
  }

  if (
    normalized === "accepted"
  ) {
    style = {
      bg: "#ECFDF5",
      border: "#BBF7D0",
      color: "#15803D"
    };
  }

  if (
    normalized === "rejected"
  ) {
    style = {
      bg: "#FEF2F2",
      border: "#FECACA",
      color: "#B91C1C"
    };
  }

  return (

    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "5px 9px",
        borderRadius: "999px",
        background: style.bg,
        border:
          `1px solid ${style.border}`,
        color: style.color,
        fontSize: "12px",
        fontWeight: 800,
        textTransform: "capitalize"
      }}
    >
      {status || "-"}
    </span>

  );
}


/* =========================================================
   TABLE ACTION BUTTON
   ========================================================= */

function ActionButton({
  label,
  onClick,
  danger = false
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {

  return (

    <button
      onClick={onClick}
      style={{
        border:
          danger
            ? "1px solid #FECACA"
            : "1px solid #E2E8F0",
        background:
          danger
            ? "#FEF2F2"
            : "#FFFFFF",
        color:
          danger
            ? "#B91C1C"
            : "#334155",
        borderRadius: "8px",
        padding: "7px 10px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: 750
      }}
    >
      {label}
    </button>

  );
}


/* =========================================================
   MODAL SHELL
   ========================================================= */

function ModalShell({
  children
}: {
  children: React.ReactNode;
}) {

  return (

    <div
      style={{
        position: "fixed",
        inset: 0,
        background:
          "rgba(15,23,42,.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        zIndex: 9999
      }}
    >
      {children}
    </div>

  );
}


function ModalCard({
  children
}: {
  children: React.ReactNode;
}) {

  return (

    <div
      style={{
        width:
          "min(650px, calc(100vw - 40px))",
        maxHeight: "88vh",
        overflowY: "auto",
        background: "#FFFFFF",
        borderRadius: "26px",
        border: "1px solid #E2E8F0",
        boxShadow:
          "0 28px 80px rgba(15,23,42,.20)"
      }}
    >
      {children}
    </div>

  );
}


/* =========================================================
   MODAL HEADER
   ========================================================= */

function ModalHeader({
  eyebrow,
  title,
  description,
  onClose
}: {
  eyebrow: string;
  title: string;
  description: string;
  onClose: () => void;
}) {

  return (

    <div
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "22px",
        borderBottom:
          "1px solid #E2E8F0",
        background:
          "linear-gradient(135deg,#FFFFFF,#FFF9F3)"
      }}
    >

      <div
        style={{
          position: "absolute",
          width: "140px",
          height: "140px",
          borderRadius: "50%",
          right: "-50px",
          top: "-75px",
          background:
            "rgba(249,115,22,.07)"
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px"
        }}
      >

        <div>

          <div
            style={{
              color: "#F97316",
              fontSize: "11px",
              fontWeight: 850,
              letterSpacing: "1.4px",
              marginBottom: "6px"
            }}
          >
            {eyebrow}
          </div>

          <h2
            style={{
              margin: 0,
              color: "#0F172A",
              fontSize: "24px",
              fontWeight: 800
            }}
          >
            {title}
          </h2>

          <p
            style={{
              margin: "5px 0 0",
              color: "#64748B",
              fontSize: "14px",
              lineHeight: 1.5
            }}
          >
            {description}
          </p>

        </div>

        <button
          onClick={onClose}
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "10px",
            border:
              "1px solid #E2E8F0",
            background: "#FFFFFF",
            color: "#64748B",
            cursor: "pointer",
            fontWeight: 800,
            flexShrink: 0
          }}
        >
          ×
        </button>

      </div>

    </div>

  );
}


/* =========================================================
   STUDENT CONTEXT IN MODAL
   ========================================================= */

function StudentContext({
  student
}: {
  student: StudentRecord;
}) {

  return (

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "11px",
        padding: "12px",
        borderRadius: "14px",
        background: "#F8FAFC",
        border: "1px solid #E2E8F0"
      }}
    >

      <div
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "12px",
          background: "#FFF7ED",
          border: "1px solid #FED7AA",
          color: "#F97316",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          flexShrink: 0
        }}
      >
        {student.student_name
          ?.charAt(0)
          .toUpperCase() || "S"}
      </div>

      <div>

        <div
          style={{
            color: "#0F172A",
            fontSize: "15px",
            fontWeight: 800
          }}
        >
          {student.student_name}
        </div>

        <div
          style={{
            marginTop: "2px",
            color: "#64748B",
            fontSize: "13px"
          }}
        >
          {student.school_name}
          {" • "}
          Class {student.class_name}
        </div>

      </div>

    </div>

  );
}


/* =========================================================
   MODAL ACTIONS
   ========================================================= */

function ModalActions({
  onCancel,
  onConfirm,
  confirmLabel,
  tone
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  tone:
    | "orange"
    | "blue";
}) {

  const primary =
    tone === "orange"
      ? "#F97316"
      : "#143B73";

  return (

    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "9px",
        marginTop: "18px",
        paddingTop: "17px",
        borderTop:
          "1px solid #F1F5F9"
      }}
    >

      <button
        onClick={onCancel}
        style={{
          padding: "9px 14px",
          borderRadius: "10px",
          border:
            "1px solid #CBD5E1",
          background: "#FFFFFF",
          color: "#475569",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: 750
        }}
      >
        Cancel
      </button>

      <button
        onClick={onConfirm}
        style={{
          padding: "9px 15px",
          borderRadius: "10px",
          border:
            `1px solid ${primary}`,
          background: primary,
          color: "#FFFFFF",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: 750,
          boxShadow:
            tone === "orange"
              ? "0 5px 14px rgba(249,115,22,.14)"
              : "0 5px 14px rgba(20,59,115,.12)"
        }}
      >
        {confirmLabel}
      </button>

    </div>

  );
}
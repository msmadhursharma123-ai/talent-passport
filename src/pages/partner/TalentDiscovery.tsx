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
}:{
 title:string;
 value:any;
}){

 return(

<div
 style={{
   border:"1px solid #E5E7EB",
   borderRadius:"12px",
   padding:"16px"
 }}
>

<div
 style={{
   color:"#64748B",
   marginBottom:"8px"
 }}
>
 {title}
</div>

<div
 style={{
   fontWeight:700
 }}
>
 {value}
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

    <div>

      {/* HEADER */}

      <div
        style={{
          background:
            "linear-gradient(135deg,#0F172A,#1E293B)",
          color: "white",
          padding: "40px",
          borderRadius: "24px",
          marginBottom: "25px"
        }}
      >

        <div
          style={{
            color: "#F4A623",
            letterSpacing: 2,
            fontWeight: 700,
            marginBottom: 10
          }}
        >
          ALLOCATED TALENT POOL
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 42
          }}
        >
          Allocated Talent Pool
        </h1>

        <p
          style={{
            color: "#CBD5E1",
            marginTop: 12
          }}
        >
          Students allocated by Talent Passport.
Reach out through scholarships,
workshops or contact requests.
Students move to CRM only after consent.
        </p>

      </div>

      

{/* PARTNER DASHBOARD */}

<div
  style={{
    background: "white",
    borderRadius: "24px",
    padding: "30px",
    marginBottom: "30px",
    border: "1px solid #E5E7EB",
    boxShadow:
      "0 4px 12px rgba(0,0,0,0.04)"
  }}
>

  <div
    style={{
      color: "#F97316",
      fontWeight: 700,
      letterSpacing: 2,
      fontSize: 12,
      marginBottom: 10
    }}
  >
    PARTNER DASHBOARD
  </div>

  <h2
    style={{
      marginTop: 0,
      marginBottom: 25
    }}
  >
    Marketplace Performance
  </h2>

  {/* KPI CARDS */}

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "repeat(6,1fr)",
      gap: "16px",
      marginBottom: "30px"
    }}
  >

    <div
      style={{
        background:"#FFF7ED",
        border:"1px solid #FED7AA",
        borderRadius:"18px",
        padding:"20px"
      }}
    >
      <div>Scholarships Offered</div>

      <div
        style={{
          fontSize:"34px",
          fontWeight:700,
          color:"#EA580C"
        }}
      >
        {scholarshipOffers.length}
      </div>
    </div>

    <div
      style={{
        background:"#EFF6FF",
        border:"1px solid #BFDBFE",
        borderRadius:"18px",
        padding:"20px"
      }}
    >
      <div>Workshops Offered</div>

      <div
        style={{
          fontSize:"34px",
          fontWeight:700,
          color:"#2563EB"
        }}
      >
        {workshopOffers.length}
      </div>
    </div>

    <div
      style={{
        background:"#ECFDF5",
        border:"1px solid #A7F3D0",
        borderRadius:"18px",
        padding:"20px"
      }}
    >
      <div>Contacts Requested</div>

      <div
        style={{
          fontSize:"34px",
          fontWeight:700,
          color:"#059669"
        }}
      >
        {contactRequests.length}
      </div>
    </div>

    <div
      style={{
        background:"#FEFCE8",
        border:"1px solid #FDE68A",
        borderRadius:"18px",
        padding:"20px"
      }}
    >
      <div>Pending</div>

      <div
        style={{
          fontSize:"34px",
          fontWeight:700,
          color:"#CA8A04"
        }}
      >
        {
          [
            ...scholarshipOffers,
            ...workshopOffers,
            ...contactRequests
          ].filter(
            x => x.status === "pending"
          ).length
        }
      </div>
    </div>

    <div
      style={{
        background:"#ECFDF5",
        border:"1px solid #A7F3D0",
        borderRadius:"18px",
        padding:"20px"
      }}
    >
      <div>Accepted</div>

      <div
        style={{
          fontSize:"34px",
          fontWeight:700,
          color:"#16A34A"
        }}
      >
        {
          [
            ...scholarshipOffers,
            ...workshopOffers,
            ...contactRequests
          ].filter(
            x => x.status === "accepted"
          ).length
        }
      </div>
    </div>

    <div
      style={{
        background:"#FEF2F2",
        border:"1px solid #FECACA",
        borderRadius:"18px",
        padding:"20px"
      }}
    >
      <div>Rejected</div>

      <div
        style={{
          fontSize:"34px",
          fontWeight:700,
          color:"#DC2626"
        }}
      >
        {
          [
            ...scholarshipOffers,
            ...workshopOffers,
            ...contactRequests
          ].filter(
            x => x.status === "rejected"
          ).length
        }
      </div>
    </div>

  </div>

  {/* OFFER MANAGEMENT */}

<div
  style={{
    background:"#fff",
    border:"1px solid #E5E7EB",
    borderRadius:"20px",
    overflow:"hidden"
  }}
>

  <div
    style={{
      padding:"20px",
      borderBottom:
        "1px solid #E5E7EB"
    }}
  >

    <h3
      style={{
        margin:0,
        marginBottom:"15px"
      }}
    >
      Offer Management
    </h3>

    <div
      style={{
        display:"flex",
        gap:"10px"
      }}
    >

      {[
        "All",
        "Scholarship",
        "Workshop",
        "Contact"
      ].map(tab => (

        <button
          key={tab}
          onClick={() =>
            setActivePipelineTab(tab)
          }
          style={{
            padding:"10px 16px",
            border:"none",
            borderRadius:"10px",
            cursor:"pointer",
            background:
              activePipelineTab === tab
                ? "#143B73"
                : "#F3F4F6",
            color:
              activePipelineTab === tab
                ? "white"
                : "#111827",
            fontWeight:600
          }}
        >
          {tab}
        </button>

      ))}

    </div>

  </div>

  <table
    style={{
      width:"100%",
      borderCollapse:"collapse"
    }}
  >

    <thead>

      <tr>

        <th
          style={{
            padding:"14px",
            textAlign:"left"
          }}
        >
          Type
        </th>

        <th
          style={{
            padding:"14px",
            textAlign:"left"
          }}
        >
          Student
        </th>

        <th
          style={{
            padding:"14px",
            textAlign:"left"
          }}
        >
          School
        </th>

        <th
          style={{
            padding:"14px",
            textAlign:"left"
          }}
        >
          Status
        </th>

        <th
          style={{
            padding:"14px",
            textAlign:"left"
          }}
        >
          Actions
        </th>

      </tr>

    </thead>

    <tbody>

      {pipeline

        .filter(
          item =>
            activePipelineTab === "All"
            ||
            item.type === activePipelineTab
        )

        .map(item => (

          <tr
            key={item.id}
          >

            <td
              style={{
                padding:"14px"
              }}
            >
              {item.type}
            </td>

            <td
              style={{
                padding:"14px"
              }}
            >
              {item.student_name}
            </td>

            <td
              style={{
                padding:"14px"
              }}
            >
              {item.school_name}
            </td>

            <td
              style={{
                padding:"14px"
              }}
            >
              {item.status}
            </td>

            <td
              style={{
                padding:"14px"
              }}
            >

              <div
                style={{
                  display:"flex",
                  gap:"8px",
                  flexWrap:"wrap"
                }}
              >

                <button
  onClick={() => {
    setViewOffer(item);
  }}
>
  View
</button>

<button
  onClick={() => {
    setEditOffer(item);
  }}
>
  Edit
</button>

                <button
  onClick={() => resendOffer(item)}
>
  Send Again
</button>

                <button
                  style={{
                    color:"red"
                  }}
                onClick={() => discardOffer(item)}
                >
                  Discard
                </button>

              </div>

            </td>

          </tr>

      ))}

    </tbody>

  </table>

</div>



</div>

{/* FILTERS */}

     <div
  style={{
    background: "white",
    borderRadius: "24px",
    padding: "25px",
    marginBottom: "25px",
    display: "grid",
    gridTemplateColumns:
      "repeat(5,1fr)",
    gap: "20px"
  }}
>

  {/* School */}

  <div>
    <label>School</label>

    <select
      value={schoolFilter}
      onChange={(e)=>
        setSchoolFilter(
          e.target.value
        )
      }
      style={{
        width:"100%",
        padding:12,
        marginTop:8
      }}
    >
      <option>All</option>

      {schools.map(
        school => (
          <option
            key={school}
          >
            {school}
          </option>
        )
      )}
    </select>
  </div>

  {/* Class */}

  <div>
    <label>Class</label>

    <select
      value={classFilter}
      onChange={(e)=>
        setClassFilter(
          e.target.value
        )
      }
      style={{
        width:"100%",
        padding:12,
        marginTop:8
      }}
    >
      <option>All</option>

      {classes.map(
        cls => (
          <option
            key={cls}
          >
            {cls}
          </option>
        )
      )}
    </select>
  </div>

  {/* Event */}

  <div>
    <label>Event</label>

    <select
      value={eventFilter}
      onChange={(e)=>
        setEventFilter(
          e.target.value
        )
      }
      style={{
        width:"100%",
        padding:12,
        marginTop:8
      }}
    >
      <option>All</option>

      {events.map(
        event => (
          <option
            key={event}
          >
            {event}
          </option>
        )
      )}
    </select>
  </div>

  {/* Search */}

  <div>
    <label>
      Search Student
    </label>

    <input
      value={searchText}
      onChange={(e)=>
        setSearchText(
          e.target.value
        )
      }
      placeholder="Student Name"
      style={{
        width:"100%",
        padding:12,
        marginTop:8
      }}
    />
  </div>

  {/* Score */}

  <div>
    <label>
      Minimum Score
    </label>

    <input
      type="number"
      value={scoreFilter}
      onChange={(e)=>
        setScoreFilter(
          Number(
            e.target.value
          )
        )
      }
      style={{
        width:"100%",
        padding:12,
        marginTop:8
      }}
    />
  </div>

</div>

      {/* STUDENTS */}

{offerSuccess && (

<div
  style={{
    background:"#ECFDF5",
    border:"1px solid #10B981",
    color:"#065F46",
    padding:"16px",
    borderRadius:"16px",
    marginBottom:"20px",
    fontWeight:600
  }}
>
  {offerSuccess}
</div>

)}

      <div
        style={{
          display:"grid",
          gridTemplateColumns:
          "repeat(2,1fr)",
          gap:"20px"
        }}
      >

console.log(
    "FILTERED STUDENTS",
    filteredStudents
);

        {filteredStudents.map((student, index) => {

  console.log(
    "CARD",
    index,
    student.id,
    student.student_id
  );

  return (

            <div
              key={
                student.student_id
              }
              style={{
                background:"white",
                borderRadius:"24px",
                padding:"25px"
              }}
            >

              <h2
                style={{
                  marginTop:0,
                  color:"#143B73"
                }}
              >
                {
                  student.student_name
                }
              </h2>

              <p>
                <strong>
                  School:
                </strong>
                {" "}
                {
                  student.school_name
                }
              </p>

              <p>
                <strong>
                  Class:
                </strong>
                {" "}
                {
                  student.class_name
                }
              </p>

              <p>
                <strong>
                  Event:
                </strong>
                {" "}
                {
                  student.event_name ||
                  "-"
                }
              </p>

              <p>
                <strong>
                  Pathway:
                </strong>
                {" "}
                {
                  student.pathway ||
                  "-"
                }
              </p>

              <p>
                <strong>
                  Score:
                </strong>
                {" "}
                {
                  student.overall_score ||
                  0
                }
              </p>

              <div
  style={{
    display: "flex",
    gap: "10px",
    marginTop: "20px",
    flexWrap: "wrap"
  }}
>

  <button
    onClick={() => {
      setSelectedStudent(student);
      setShowScholarshipDialog(true);
    }}
    style={{
      background:"#FF6B00",
      color:"white",
      border:"none",
      padding:"10px 16px",
      borderRadius:"12px",
      cursor:"pointer",
      fontWeight:600
    }}
  >
    Offer Scholarship
  </button>

  <button
    onClick={() => {
      setSelectedStudent(student);
      setShowWorkshopDialog(true);
    }}
    style={{
      background:"#143B73",
      color:"white",
      border:"none",
      padding:"10px 16px",
      borderRadius:"12px",
      cursor:"pointer",
      fontWeight:600
    }}
  >
    Offer Workshop
  </button>

  <button
    onClick={() => {
      setSelectedStudent(student);
      setShowContactDialog(true);
    }}
    style={{
      background:"#F3F4F6",
      color:"#111827",
      border:"1px solid #E5E7EB",
      padding:"10px 16px",
      borderRadius:"12px",
      cursor:"pointer",
      fontWeight:600
    }}
  >
    Request Contact
  </button>

</div>

                        </div>

          );

        })}


      </div>

{showScholarshipDialog &&
selectedStudent && (

<div
  style={{
    position:"fixed",
    inset:0,
    background:"rgba(0,0,0,0.45)",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    zIndex:1000
  }}
>

<div
  style={{
    background:"white",
    width:"650px",
    borderRadius:"24px",
    padding:"32px"
  }}
>

<h2>
Offer Scholarship
</h2>

<p>
Student:
{" "}
<b>
{selectedStudent.student_name}
</b>
</p>

<input
  placeholder="Scholarship Title"
  value={scholarshipTitle}
  onChange={(e)=>
    setScholarshipTitle(
      e.target.value
    )
  }
  style={{
    width:"100%",
    padding:"12px",
    marginBottom:"12px"
  }}
/>

<input
  placeholder="Scholarship Type"
  value={scholarshipType}
  onChange={(e)=>
    setScholarshipType(
      e.target.value
    )
  }
  style={{
    width:"100%",
    padding:"12px",
    marginBottom:"12px"
  }}
/>

<input
  placeholder="Scholarship Value"
  value={scholarshipValue}
  onChange={(e)=>
    setScholarshipValue(
      e.target.value
    )
  }
  style={{
    width:"100%",
    padding:"12px",
    marginBottom:"12px"
  }}
/>

<textarea
  placeholder="Scholarship Description"
  value={scholarshipDescription}
  onChange={(e)=>
    setScholarshipDescription(
      e.target.value
    )
  }
  style={{
    width:"100%",
    minHeight:"140px",
    padding:"12px"
  }}
/>

<div
  style={{
    display:"flex",
    justifyContent:"flex-end",
    gap:"12px",
    marginTop:"20px"
  }}
>

<button
  onClick={() =>
    setShowScholarshipDialog(
      false
    )
  }
>
Cancel
</button>

<button
  onClick={saveScholarship}
>
Send Offer
</button>

</div>

</div>

</div>

)}


{/* WORKSHOP DIALOG */}

{showWorkshopDialog &&
selectedStudent && (

<div
  style={{
    position:"fixed",
    inset:0,
    background:"rgba(0,0,0,0.45)",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    zIndex:1000
  }}
>

<div
  style={{
    background:"white",
    width:"650px",
    borderRadius:"24px",
    padding:"32px"
  }}
>

<h2>
Offer Workshop
</h2>

<p>
Student:
{" "}
<b>
{selectedStudent.student_name}
</b>
</p>

<input
  placeholder="Workshop Title"
  value={workshopTitle}
  onChange={(e)=>
    setWorkshopTitle(
      e.target.value
    )
  }
  style={{
    width:"100%",
    padding:"12px",
    marginBottom:"12px"
  }}
/>

<input
  placeholder="Workshop Date"
  value={workshopDate}
  onChange={(e)=>
    setWorkshopDate(
      e.target.value
    )
  }
  style={{
    width:"100%",
    padding:"12px",
    marginBottom:"12px"
  }}
/>

<input
  placeholder="Mode (Online / Offline)"
  value={workshopMode}
  onChange={(e)=>
    setWorkshopMode(
      e.target.value
    )
  }
  style={{
    width:"100%",
    padding:"12px",
    marginBottom:"12px"
  }}
/>

<textarea
  placeholder="Workshop Description"
  value={workshopDescription}
  onChange={(e)=>
    setWorkshopDescription(
      e.target.value
    )
  }
  style={{
    width:"100%",
    minHeight:"140px",
    padding:"12px"
  }}
/>

<div
  style={{
    display:"flex",
    justifyContent:"flex-end",
    gap:"12px",
    marginTop:"20px"
  }}
>

<button
  onClick={() =>
    setShowWorkshopDialog(false)
  }
>
Cancel
</button>

<button
  onClick={saveWorkshop}
>
Send Workshop
</button>

</div>

</div>

</div>

)}

{/* CONTACT DIALOG */}

{showContactDialog &&
selectedStudent && (

<div
  style={{
    position:"fixed",
    inset:0,
    background:"rgba(0,0,0,0.45)",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    zIndex:1000
  }}
>

<div
  style={{
    background:"white",
    width:"650px",
    borderRadius:"24px",
    padding:"32px"
  }}
>

<h2>
Request Parent Contact
</h2>

<p>
Student:
{" "}
<b>
{selectedStudent.student_name}
</b>
</p>

<textarea
  placeholder="Reason for contact request"
  value={contactMessage}
  onChange={(e)=>
    setContactMessage(
      e.target.value
    )
  }
  style={{
    width:"100%",
    minHeight:"140px",
    padding:"12px"
  }}
/>

<div
  style={{
    display:"flex",
    justifyContent:"flex-end",
    gap:"12px",
    marginTop:"20px"
  }}
>

<button
  onClick={() =>
    setShowContactDialog(false)
  }
>
Cancel
</button>

<button
  onClick={saveContactRequest}
>
Send Request
</button>

</div>

</div>

</div>

)}

{/* VIEW OFFER DIALOG */}

{viewOffer && (

<div
  style={{
    position:"fixed",
    inset:0,
    background:"rgba(0,0,0,.55)",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    zIndex:9999
  }}
>

<div
  style={{
    width:"900px",
    background:"white",
    borderRadius:"24px",
    padding:"32px"
  }}
>

<div
  style={{
    display:"flex",
    justifyContent:"space-between",
    marginBottom:"25px"
  }}
>
  <h2>
    Offer Details
  </h2>

  <button
    onClick={() =>
      setViewOffer(null)
    }
  >
    Close
  </button>
</div>

<div
  style={{
    display:"grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap:"20px"
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
   marginTop:"25px"
 }}
>

<h3>
Offer Title
</h3>

<div className="tp-box">
{
viewOffer.offer_title ||
viewOffer.workshop_title ||
"Contact Request"
}
</div>

<h3>
Description
</h3>

<div className="tp-box">
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

)}

{/* EDIT OFFER DIALOG */}

{editOffer && (

<div
 style={{
   position:"fixed",
   inset:0,
   background:"rgba(0,0,0,.55)",
   display:"flex",
   justifyContent:"center",
   alignItems:"center",
   zIndex:9999
 }}
>

<div
 style={{
   width:"850px",
   background:"white",
   borderRadius:"24px",
   padding:"32px"
 }}
>

<h2>
Edit Offer
</h2>

<div
 style={{
   display:"grid",
   gridTemplateColumns:
   "1fr 1fr",
   gap:"20px"
 }}
>

<input
 value={
   editOffer.offer_title ||
   editOffer.workshop_title ||
   ""
 }
 onChange={(e)=>
 setEditOffer({
   ...editOffer,
   offer_title:
   e.target.value
 })
 }
/>

<input
 value={
   editOffer.scholarship_value ||
   ""
 }
 onChange={(e)=>
 setEditOffer({
   ...editOffer,
   scholarship_value:
   e.target.value
 })
 }
 placeholder="Value"
/>

<input
 value={
   editOffer.scholarship_type ||
   ""
 }
 onChange={(e)=>
 setEditOffer({
   ...editOffer,
   scholarship_type:
   e.target.value
 })
 }
 placeholder="Type"
/>

<input
 value={
   editOffer.workshop_date ||
   ""
 }
 onChange={(e)=>
 setEditOffer({
   ...editOffer,
   workshop_date:
   e.target.value
 })
 }
/>

<input
 value={
   editOffer.workshop_mode ||
   ""
 }
 onChange={(e)=>
 setEditOffer({
   ...editOffer,
   workshop_mode:
   e.target.value
 })
 }
/>

</div>

<textarea
 value={
   editOffer.offer_description ||
   editOffer.workshop_description ||
   editOffer.request_reason ||
   ""
 }
 onChange={(e)=>
 setEditOffer({
   ...editOffer,
   offer_description:
   e.target.value
 })
 }
 rows={6}
 style={{
   width:"100%",
   marginTop:"20px"
 }}
/>

<div
 style={{
   display:"flex",
   justifyContent:"flex-end",
   gap:"12px",
   marginTop:"20px"
 }}
>

<button
 onClick={() =>
 setEditOffer(null)
 }
>
 Cancel
</button>

<button
  onClick={async () => {

    console.log(
      "EDIT OFFER BEFORE SAVE",
      editOffer
    );

    await saveOfferChanges();

  }}
>
  Save Changes
</button>

</div>

</div>

</div>

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
        background:"#F8FAFC",
        border:
          "1px solid #E2E8F0",
        borderRadius:"14px",
        padding:"16px"
      }}
    >

      <div
        style={{
          fontSize:"12px",
          color:"#64748B",
          marginBottom:"6px"
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontWeight:600
        }}
      >
        {value || "-"}
      </div>

    </div>

  );

}
import React,
{
  useEffect,
  useState
}
from "react";

import {
  fetchStudentsMaster,
  fetchTalentPassportScores
}
from "../../supabaseClient";

import {
  fetchPartnerScholarshipOffers,
  fetchPartnerWorkshopOffers,
  fetchPartnerContactRequests
}
from "../../data/partnerMarketplaceRepository";

import {
  createScholarshipOffer,
  createWorkshopOffer,
  createContactRequest
}
from "../../data/partnerMarketplaceRepository";

interface StudentRecord {
  student_id: string;
  student_name: string;
  school_name: string;
  class_name: string;

  event_name?: string;
  pathway?: string;

  communication_score?: number;
  leadership_score?: number;
  critical_thinking_score?: number;
  collaboration_score?: number;
  confidence_score?: number;

  overall_score?: number;
}

export default function TalentDiscovery() {

const [selectedStudent, setSelectedStudent] =
  useState<StudentRecord | null>(null);

const [showScholarshipDialog, setShowScholarshipDialog] =
  useState(false);

const [showWorkshopDialog, setShowWorkshopDialog] =
  useState(false);

const [showContactDialog, setShowContactDialog] =
  useState(false);

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

async function saveScholarship() {

  if (!selectedStudent) return;

  const result =
    await createScholarshipOffer({

      partner_id:
        "partner_demo",

      partner_name:
        "Talent Partner",

      student_id:
        selectedStudent.student_id,

      student_name:
        selectedStudent.student_name,

      school_name:
        selectedStudent.school_name,

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

  setOfferSuccess(
    "Scholarship sent successfully"
  );

  setTimeout(() => {
    setOfferSuccess("");
  }, 3000);
}

async function saveWorkshop() {

  if (!selectedStudent) return;

  const result =
    await createWorkshopOffer({

      partner_id:
        "partner_demo",

      partner_name:
        "Talent Partner",

      student_id:
        selectedStudent.student_id,

      student_name:
        selectedStudent.student_name,

      school_name:
        selectedStudent.school_name,

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

  setOfferSuccess(
    "Workshop invitation sent"
  );

  setTimeout(() => {
    setOfferSuccess("");
  }, 3000);
}


async function saveContactRequest() {

  if (!selectedStudent) return;

  const result =
    await createContactRequest({

      partner_id:
        "partner_demo",

      partner_name:
        "Talent Partner",

      student_id:
        selectedStudent.student_id,

      student_name:
        selectedStudent.student_name,

      school_name:
        selectedStudent.school_name,

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

  setContactMessage("");

  setShowContactDialog(false);

  setOfferSuccess(
    "Contact request sent"
  );

  setTimeout(() => {
    setOfferSuccess("");
  }, 3000);
}



  useEffect(() => {

  loadStudents();

  loadPartnerActivity();

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

  async function
  loadStudents() {

    const studentData =
      await fetchStudentsMaster();

    const scoreData =
      await fetchTalentPassportScores();

    const merged =
      studentData.map(
        (student: any) => {

          const score: any =
  scoreData.find(
    (s: any) =>
      s.student_id ===
      student.student_id
  ) || {};




return {
  ...student,

  event_name:
    score.event_name || "",

  pathway:
    score.pathway || "",

  communication_score:
    score.communication_score || 0,

  leadership_score:
    score.leadership_score || 0,

  critical_thinking_score:
    score.critical_thinking_score || 0,

  collaboration_score:
    score.collaboration_score || 0,

  confidence_score:
    score.confidence_score || 0,

  overall_score:
    score.overall_score || 0
};
        }
      );

    setStudents(
      merged
    );
  }

async function
loadPartnerActivity() {

  const scholarships =
    await fetchPartnerScholarshipOffers(
      "partner_demo"
    );

  const workshops =
    await fetchPartnerWorkshopOffers(
      "partner_demo"
    );

  const contacts =
    await fetchPartnerContactRequests(
      "partner_demo"
    );

  setScholarshipOffers(
    scholarships || []
  );

  setWorkshopOffers(
    workshops || []
  );

  setContactRequests(
    contacts || []
  );
}

  const schools =
    Array.from(
      new Set(
        students.map(
          s => s.school_name
        )
      )
    );

  const classes =
    Array.from(
      new Set(
        students.map(
          s =>
            String(
              s.class_name
            )
        )
      )
    );

    const events =
  Array.from(
    new Set(
      students
        .map(
          s =>
            s.event_name
        )
        .filter(Boolean)
    )
  );

  console.log("EVENTS", events);

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
          TALENT MARKETPLACE
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 42
          }}
        >
          Discover Students
        </h1>

        <p
          style={{
            color: "#CBD5E1",
            marginTop: 12
          }}
        >
          Find talented students,
          offer workshops,
          scholarships and
          learning opportunities.
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

  {/* PARTNER PIPELINE */}

  <div
    style={{
      border:"1px solid #E5E7EB",
      borderRadius:"20px",
      overflow:"hidden"
    }}
  >

    <div
      style={{
        padding:"18px 24px",
        borderBottom:
          "1px solid #E5E7EB",
        background:"#F8FAFC",
        fontWeight:700,
        fontSize:"18px"
      }}
    >
      Partner Pipeline
    </div>

    <table
      style={{
        width:"100%",
        borderCollapse:"collapse"
      }}
    >

      <thead>

        <tr>

          <th style={{
            padding:"14px",
            textAlign:"left",
            borderBottom:"1px solid #E5E7EB"
          }}>
            Type
          </th>

          <th style={{
            padding:"14px",
            textAlign:"left",
            borderBottom:"1px solid #E5E7EB"
          }}>
            Student
          </th>

          <th style={{
            padding:"14px",
            textAlign:"left",
            borderBottom:"1px solid #E5E7EB"
          }}>
            School
          </th>

          <th style={{
            padding:"14px",
            textAlign:"left",
            borderBottom:"1px solid #E5E7EB"
          }}>
            Status
          </th>

        </tr>

      </thead>

      <tbody>

        {[
          ...scholarshipOffers.map(
            x => ({
              type:"Scholarship",
              student:x.student_name,
              school:x.school_name,
              status:x.status
            })
          ),

          ...workshopOffers.map(
            x => ({
              type:"Workshop",
              student:x.student_name,
              school:x.school_name,
              status:x.status
            })
          ),

          ...contactRequests.map(
            x => ({
              type:"Contact",
              student:x.student_name,
              school:x.school_name,
              status:x.status
            })
          )

        ].map(
          (row,index)=>(
            <tr key={index}>

              <td style={{
                padding:"14px",
                borderBottom:"1px solid #F3F4F6"
              }}>
                {row.type}
              </td>

              <td style={{
                padding:"14px",
                borderBottom:"1px solid #F3F4F6"
              }}>
                {row.student}
              </td>

              <td style={{
                padding:"14px",
                borderBottom:"1px solid #F3F4F6"
              }}>
                {row.school}
              </td>

              <td style={{
                padding:"14px",
                borderBottom:"1px solid #F3F4F6"
              }}>

                <span
                  style={{
                    padding:"6px 12px",
                    borderRadius:"999px",
                    background:
                      row.status === "accepted"
                      ? "#DCFCE7"
                      : row.status === "rejected"
                      ? "#FEE2E2"
                      : "#FEF3C7",
                    color:
                      row.status === "accepted"
                      ? "#166534"
                      : row.status === "rejected"
                      ? "#991B1B"
                      : "#92400E",
                    fontWeight:600
                  }}
                >
                  {row.status}
                </span>

              </td>

            </tr>
          )
        )}

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

        {filteredStudents.map(
          student => (

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

          )
        )}

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

    </div>

  );
}
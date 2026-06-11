import jsPDF from "jspdf";
import { useEffect, useState } from "react";
import {
  fetchAllSubmissions,
  deleteSubmission,
  evaluateSubmission,
  getEvaluationBySubmissionId
} from "../supabaseClient";

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [evaluatedIds, setEvaluatedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [pathwayFilter, setPathwayFilter] = useState("All");
const [selectedEvaluation, setSelectedEvaluation] =
  useState<any>(null);
  useEffect(() => {
    fetchSubmissions();
  }, []);

 async function fetchSubmissions() {
  const result = await fetchAllSubmissions();

  setSubmissions(result.submissions || []);
}
function exportCSV() {
  alert("CSV Export Working");
}
function downloadPDF() {
    if (!selectedEvaluation) return;

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text(
      "Talent Passport Evaluation Report",
      20,
      20
    );

    doc.setFontSize(12);

    doc.text(
      `Pathway: ${selectedEvaluation.pathway}`,
      20,
      40
    );

    doc.text(
      `Event: ${selectedEvaluation.event_name}`,
      20,
      50
    );

    doc.text(
      `Communication: ${selectedEvaluation.metric_1_score}`,
      20,
      70
    );

    doc.text(
      `Confidence: ${selectedEvaluation.metric_2_score}`,
      20,
      80
    );

    doc.text(
      `Leadership: ${selectedEvaluation.metric_3_score}`,
      20,
      90
    );

    doc.text(
      `Critical Thinking: ${selectedEvaluation.metric_4_score}`,
      20,
      100
    );

    doc.text(
      `Collaboration: ${selectedEvaluation.metric_5_score}`,
      20,
      110
    );

    doc.text(
      `Overall Score: ${selectedEvaluation.overall_score}`,
      20,
      130
    );

    const feedback = doc.splitTextToSize(
      selectedEvaluation.ai_feedback,
      170
    );

    doc.text(feedback, 20, 150);

    doc.save("TalentPassportReport.pdf");
  }
const filteredSubmissions = submissions.filter((item) => {
  const searchMatch =
    item.student_name
      ?.toLowerCase()
      .includes(search.toLowerCase());

  const pathwayMatch =
    pathwayFilter === "All" ||
    item.pathway === pathwayFilter;

  return searchMatch && pathwayMatch;
});
 return (
  <div
    style={{
      padding: "30px",
      fontFamily: "Arial",
background:
  "radial-gradient(circle at top left, #0B2A4A 0%, #163A63 45%, #2A5A8E 100%)",

      backgroundImage: `
        linear-gradient(
          rgba(255,255,255,0.03) 1px,
          transparent 1px
        ),
        linear-gradient(
          90deg,
          rgba(255,255,255,0.03) 1px,
          transparent 1px
        )
      `,

      backgroundSize: "80px 80px",

      minHeight: "100vh"
    }}
  >
    <div
  style={{
    marginBottom: "30px"
  }}
>
  <h1
    style={{
      color: "#ffffff",
fontWeight: "700",
letterSpacing: "-1px",
      fontSize: "34px",
      marginBottom: "5px"
    }}
  >
    Talent Passport Admin Dashboard
  </h1>

 <p
  style={{
    color: "#ffffff",
    marginTop: 0,
    fontSize: "16px"
  }}
>
    Competition Submission Management Portal
  </p>
</div>
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    marginBottom: "25px"
  }}
>
  <div
    style={{
      background: "#0B2A4A",
      color: "white",
      padding: "10px",
      borderRadius: "12px"
    }}
  >
    <div>Total Submissions</div>
    <h2
  style={{
    fontSize: "34px",
    marginTop: "10px"
  }}
>
  {submissions.length}
</h2>
  </div>

  <div
    style={{
      background: "linear-gradient(135deg,#163A63,#214C81)",
      color: "white",
      padding: "10px",
      borderRadius: "12px"
    }}
  >
    <div>Communication</div>
    <h2
  style={{
    fontSize: "34px",
    marginTop: "10px"
  }}
>
      {submissions.filter(
        (x) => x.pathway === "Communication"
      ).length}
    </h2>
  </div>

  <div
    style={{
      background: "linear-gradient(135deg,#163A63,#214C81)",
      color: "white",
      padding: "10px",
      borderRadius: "12px"
    }}
  >
    <div>Problem Solving</div>
    <h2
  style={{
    fontSize: "34px",
    marginTop: "10px"
  }}
>
      {submissions.filter(
        (x) => x.pathway === "Problem Solving"
      ).length}
    </h2>
  </div>

  <div
    style={{
      background: "linear-gradient(135deg,#F5A623,#FFBF47)",
color:"#0B2A4A",
      padding: "10px",
      borderRadius: "12px"
    }}
  >
    <div>Creative Expression</div>
    <h2>
      {submissions.filter(
        (x) => x.pathway === "Creative Expression"
      ).length}
    </h2>
  </div>
</div>
    <input
      type="text"
      placeholder="Search student..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      style={{
        background:"#ffffff",
border:"2px solid #F5A623",
borderRadius:"10px",
        padding: "10px",
        width: "300px",
        marginBottom: "20px",
      }}
    /><select
  value={pathwayFilter}
  onChange={(e) =>
    setPathwayFilter(e.target.value)
  }
  style={{
    background:"#ffffff",
border:"2px solid #F5A623",
borderRadius:"10px",
color:"#0B2A4A",
    padding: "10px",
    marginLeft: "10px",
  }}
>
  <option>All</option>
  <option>Communication</option>
  <option>Problem Solving</option>
  <option>Creative Expression</option>
  <option>Team Event</option>
</select>
<button
  onClick={exportCSV}
  style={{
    padding: "10px",
    background:"linear-gradient(135deg,#F5A623,#FFBF47)",
color:"#0B2A4A",
fontWeight:"600",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  }}
>
  Export CSV
</button>
    <h3>Total Submissions: {filteredSubmissions.length}</h3>

    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        background: "#ffffff",
      }}
    >
      <thead>
        <tr style={{ background: "#0B2A4A", color: "white" }}>
          <th style={{ padding: "12px" }}>Name</th>
<th>Email</th>
<th>Pathway</th>
<th>Event</th>
<th>Date</th>
<th>Video</th>
<th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {filteredSubmissions.map((item, index) => (
          <tr
            key={index}
            style={{
                background:"#ffffff",
              borderBottom: "1px solid #ddd",
            }}
          >
            <td style={{ padding: "12px" }}>
              {item.student_name}
            </td>

            <td>{item.student_email}</td>

            <td>{item.pathway}</td>

<td>{item.event_name}</td>

<td>
  {item.created_at
    ? new Date(item.created_at).toLocaleDateString()
    : "-"}
</td>

<td>
              <a
  href={item.video_url}
  target="_blank"
  rel="noreferrer"
  style={{
    background: "#2563eb",
    color: "white",
    padding: "8px 12px",
    borderRadius: "6px",
    textDecoration: "none",
    fontSize: "14px"
  }}
>
  View Video
</a>


<a
  href={item.video_url}
  download
  style={{
  background: "#16a34a",
  color: "white",
  padding: "8px 12px",
  borderRadius: "6px",
  textDecoration: "none",
  fontSize: "14px",
  marginLeft: "8px"
    
  }}
>
  Download
</a>
            </td>
         <td>

<button
  style={{
    background: "#7c3aed",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    marginRight: "8px"
  }}
onClick={async () => {

  const result = await evaluateSubmission(item.id);

  if (result.error) {
    alert(result.error);
    return;
  }

  const evaluation: any =
  await getEvaluationBySubmissionId(
    item.id
  );

  if (evaluation.data) {
    setSelectedEvaluation(
      evaluation.data
    );
  }

}}
>
  AI Evaluate
</button>
<button
  style={{
    background: "#0ea5e9",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    marginRight: "8px"
  }}
  onClick={async () => {

    alert(
      "Transcript generation will be connected next"
    );

  }}
>
  Generate Transcript
</button>
<button
  style={{
    background: "#16a34a",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    marginRight: "8px"
  }}
  onClick={async () => {

    console.log("Submission ID", item.id);

const result =
  await getEvaluationBySubmissionId(
    item.id
  );

console.log(result);

    if (result.error) {
      alert("No evaluation found");
      return;
    }

    console.log("Evaluation Data", result.data);

setSelectedEvaluation(result.data);
  }}
>
  View Evaluation
</button>
  <button
    style={{
      background: "#dc2626",
      color: "white",
      border: "none",
      padding: "8px 12px",
      borderRadius: "6px",
      cursor: "pointer"
    }}
    onClick={async () => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this submission?"
  );

  if (!confirmed) return;

  const result = await deleteSubmission(item.id);

  if (result.error) {
    alert("Delete failed");
    return;
  }

  fetchSubmissions();
}}
  >
    Delete
  </button>
</td>
          </tr>
        ))}
      </tbody>
 </table>

{selectedEvaluation && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999
    }}
  >
    <div
      style={{
        background: "white",
        padding: "30px",
        borderRadius: "12px",
        width: "600px",
        maxHeight: "80vh",
        overflowY: "auto"
      }}
    >
      <h2>AI Evaluation Report</h2>

      <p>
        <strong>Pathway:</strong>{" "}
        {selectedEvaluation.pathway}
      </p>

      <p>
        <strong>Event:</strong>{" "}
        {selectedEvaluation.event_name}
      </p>

      <hr />

      <p>
        <strong>
          {selectedEvaluation.metric_1_name}
        </strong>
        : {selectedEvaluation.metric_1_score}
      </p>

      <p>
        <strong>
          {selectedEvaluation.metric_2_name}
        </strong>
        : {selectedEvaluation.metric_2_score}
      </p>

      <p>
        <strong>
          {selectedEvaluation.metric_3_name}
        </strong>
        : {selectedEvaluation.metric_3_score}
      </p>

      <p>
        <strong>
          {selectedEvaluation.metric_4_name}
        </strong>
        : {selectedEvaluation.metric_4_score}
      </p>

      <p>
        <strong>
          {selectedEvaluation.metric_5_name}
        </strong>
        : {selectedEvaluation.metric_5_score}
      </p>

      <hr />

      <h3>
        Overall Score:
        {" "}
        {selectedEvaluation.overall_score}
      </h3>

      <p>
        <strong>AI Feedback:</strong>
      </p>

      <p>
        {selectedEvaluation.ai_feedback}
      </p>
<button
  onClick={downloadPDF}
  style={{
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    marginRight: "10px"
  }}
>
  Download PDF
</button>
      <button
        onClick={() =>
          setSelectedEvaluation(null)
        }
        style={{
          background: "#dc2626",
          color: "white",
          border: "none",
          padding: "10px 15px",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        Close
      </button>
    </div>
  </div>
)}

</div>
);
}
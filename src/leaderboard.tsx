import { useEffect, useState } from "react";
import { getSupabaseClient } from "./supabaseClient";

export default function Leaderboard() {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedSchool, setSelectedSchool] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    const supabase = getSupabaseClient();

    if (!supabase) return;

    const { data, error } = await supabase
      .from("evaluations")
      .select(`
        *,
        submissions (
          student_name,
          student_email,
          class_name,
          school_name
        )
      `)
      .order("overall_score", { ascending: false });

    console.log("DATA", data);
    console.log("ERROR", error);

    setEvaluations(data || []);
  }

  const filteredData = evaluations.filter((item) => {
    const classMatch =
      selectedClass === "All" ||
      item.submissions?.class_name === selectedClass;

    const schoolMatch =
      selectedSchool === "All" ||
      item.submissions?.school_name === selectedSchool;

    const studentMatch =
      item.submissions?.student_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) || false;

    return classMatch && schoolMatch && studentMatch;
  });

  return (
    <div style={{ padding: "30px" }}>
      <h1>Talent Passport Leaderboard</h1>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "20px",
          alignItems: "end",
        }}
      >
        <div>
          <label>Class</label>
          <br />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option>All</option>
            <option>12</option>
            <option>11</option>
            <option>10</option>
            <option>9</option>
            <option>8</option>
            <option>7</option>
            <option>6</option>
          </select>
        </div>

        <div>
          <label>School</label>
          <br />
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
          >
            <option>All</option>

            {[
              ...new Set(
                evaluations.map(
                  (item) => item.submissions?.school_name
                )
              ),
            ]
              .filter(Boolean)
              .map((school: any) => (
                <option key={school}>{school}</option>
              ))}
          </select>
        </div>

        <div>
          <label>Search Student</label>
          <br />
          <input
            type="text"
            placeholder="Search Student"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "white",
        }}
      >
        <thead>
          <tr
            style={{
              background: "#0B2A4A",
              color: "white",
            }}
          >
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>
              Rank
            </th>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>
              Student
            </th>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>
              School
            </th>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>
              Class
            </th>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>
              Event
            </th>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>
              Overall Score
            </th>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>
              Medal
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredData
            .sort((a, b) => b.overall_score - a.overall_score)
            .map((item, index) => (
              <tr key={index}>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {index + 1}
                </td>

                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {item.submissions?.student_name}
                </td>

                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {item.submissions?.school_name}
                </td>

                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {item.submissions?.class_name}
                </td>

                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {item.event_name}
                </td>

                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {item.overall_score}
                </td>

                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {index === 0
                    ? "🥇 Gold"
                    : index === 1
                    ? "🥈 Silver"
                    : index === 2
                    ? "🥉 Bronze"
                    : "-"}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
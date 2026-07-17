export default function MyClassroomPage() {
  return (
    <div
      style={{
        padding: 32,
        background: "#F6F6F3",
        minHeight: "100%",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          background: "#04122F",
          borderRadius: 28,
          padding: 30,
          color: "white",
          marginBottom: 28,
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#F59E0B",
            fontWeight: 700,
            letterSpacing: 2,
            fontSize: 13,
          }}
        >
          CLASSROOM HISTORY ENGINE
        </p>

        <h1
          style={{
            marginTop: 12,
            marginBottom: 12,
            fontSize: 34,
          }}
        >
          MY CLASSROOM
        </h1>

        <p
          style={{
            margin: 0,
            color: "#D1D5DB",
            lineHeight: 1.8,
          }}
        >
          Review your complete classroom
          teaching history across the
          academic session.
        </p>
      </div>

      {/* FILTERS */}

      <div style={cardStyle}>
        <h2>Filters</h2>

        <div
          style={{
            display: "flex",
            gap: 18,
            flexWrap: "wrap",
          }}
        >
          <select style={dropdownStyle}>
            <option>Select Class</option>
          </select>

          <select style={dropdownStyle}>
            <option>Select Subject</option>
          </select>

          <select style={dropdownStyle}>
            <option>Select Month</option>
          </select>
        </div>
      </div>

      {/* CLASS INFO */}

      <div
        style={{
          ...cardStyle,
          marginTop: 30,
        }}
      >
        <h2>
          Assigned Classroom Information
        </h2>

        <p>Class : 10 B</p>

        <p>Subject : Physics</p>

        <p>Academic Session : 2026-27</p>
      </div>

      {/* TIMELINE */}

      <div
        style={{
          ...cardStyle,
          marginTop: 30,
        }}
      >
        <h2>
          Monthly Teaching Timeline
        </h2>

        {Array.from({ length: 15 }).map(
          (_, index) => (
            <TimelineCard
              key={index}
              date={`${index + 1} July`}
              topic="Parts of Speech"
              status="Lecture Conducted"
            />
          )
        )}
      </div>

      {/* MONTHLY SUMMARY */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4,1fr)",
          gap: 20,
          marginTop: 30,
        }}
      >
        <SummaryCard
          title="Lectures"
          value="24"
        />

        <SummaryCard
          title="Homework"
          value="18"
        />

        <SummaryCard
          title="Activities"
          value="12"
        />

        <SummaryCard
          title="Average Response"
          value="92%"
        />
      </div>

      {/* TOPICS */}

      <div
        style={{
          ...cardStyle,
          marginTop: 30,
        }}
      >
        <h2>
          Most Taught Topics
        </h2>

        <ul>
          <li>Fractions</li>
          <li>Photosynthesis</li>
          <li>Coordinate Geometry</li>
        </ul>
      </div>

      {/* COMPLETED TOPICS */}

      <div
        style={{
          ...cardStyle,
          marginTop: 30,
        }}
      >
        <h2>
          Completed Topics
        </h2>

        <ul>
          <li>Chapter 1</li>
          <li>Chapter 2</li>
          <li>Chapter 3</li>
        </ul>
      </div>

      {/* PARENT FEEDBACK */}

      <div
        style={{
          ...cardStyle,
          marginTop: 30,
          background: "#FFF7ED",
        }}
      >
        <h2>
          Parent Feedback Summary
        </h2>

        <p>
          Parents reported improved
          comprehension in classroom
          discussions during this month.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------ */

function TimelineCard(props: any) {
  return (
    <div
      style={{
        background: "#F8FAFC",
        padding: 18,
        borderRadius: 16,
        marginBottom: 14,
      }}
    >
      <h3>{props.date}</h3>

      <p>Topic : {props.topic}</p>

      <p>Status : {props.status}</p>
    </div>
  );
}

/* ------------------------------------------------ */

function SummaryCard(props: any) {
  return (
    <div style={cardStyle}>
      <h1>{props.value}</h1>

      <p>{props.title}</p>
    </div>
  );
}

/* ------------------------------------------------ */

const cardStyle = {
  background: "white",
  padding: 30,
  borderRadius: 24,
  boxShadow:
    "0px 10px 25px rgba(0,0,0,0.05)",
} as const;

const dropdownStyle = {
  padding: "14px",
  minWidth: "220px",
  borderRadius: "14px",
  border:
    "1px solid #CBD5E1",
} as const;
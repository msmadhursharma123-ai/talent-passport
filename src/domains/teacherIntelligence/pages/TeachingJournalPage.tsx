export default function TeachingJournalPage() {
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
          CLASSROOM ANALYTICS ENGINE
        </p>

        <h1
          style={{
            marginTop: 12,
            marginBottom: 12,
            fontSize: 34,
          }}
        >
          TEACHING JOURNAL
        </h1>

        <p
          style={{
            margin: 0,
            color: "#D1D5DB",
            lineHeight: 1.8,
          }}
        >
          Review class health, comprehension
          trends and teaching effectiveness
          month on month.
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
            <option>
              Select Class
            </option>
          </select>

          <select style={dropdownStyle}>
            <option>
              Select Month
            </option>
          </select>

          <select style={dropdownStyle}>
            <option>
              Select Week
            </option>
          </select>
        </div>
      </div>

      {/* MONTHLY CALENDAR */}

      <div style={cardStyle}>
        <h2>
          Monthly Classroom Calendar
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(7,1fr)",
            gap: 12,
            marginTop: 20,
          }}
        >
          {Array.from({ length: 31 }).map(
            (_, index) => (
              <div
                key={index}
                style={calendarBox}
              >
                {index + 1}
              </div>
            )
          )}
        </div>
      </div>

      {/* CLASS HEALTH */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3,1fr)",
          gap: 20,
          marginTop: 30,
        }}
      >
        <AnalyticsCard
          title="Comprehension"
          value="92%"
        />

        <AnalyticsCard
          title="Engagement"
          value="88%"
        />

        <AnalyticsCard
          title="Satisfaction"
          value="94%"
        />
      </div>

      {/* MONTHLY INSIGHTS */}

      <div
        style={{
          ...cardStyle,
          marginTop: 30,
        }}
      >
        <h2>
          Monthly Insights
        </h2>

        <ul
          style={{
            lineHeight: 2,
          }}
        >
          <li>
            Most Difficult Topic :
            Photosynthesis
          </li>

          <li>
            Most Common Doubt :
            Coordinate Geometry
          </li>

          <li>
            Best Performing Lesson :
            Fractions
          </li>

          <li>
            Lowest Engagement Lesson :
            Algebra
          </li>
        </ul>
      </div>

      {/* WEEKLY ANALYTICS */}

      <div
        style={{
          ...cardStyle,
          marginTop: 30,
        }}
      >
        <h2>
          Weekly Analytics
        </h2>

        <WeeklyCard
          week="Week 1"
          score="89%"
        />

        <WeeklyCard
          week="Week 2"
          score="91%"
        />

        <WeeklyCard
          week="Week 3"
          score="95%"
        />

        <WeeklyCard
          week="Week 4"
          score="86%"
        />
      </div>

      {/* AI RECOMMENDATION */}

      <div
        style={{
          ...cardStyle,
          marginTop: 30,
          background: "#FFF7ED",
        }}
      >
        <h2>
          Tomorrow's Teaching Recommendation
        </h2>

        <p>
          Revise Photosynthesis for
          the first 10 minutes before
          introducing the next topic.
        </p>
      </div>
    </div>
  );
}

/* -------------------------------- */

function AnalyticsCard(props: any) {
  return (
    <div style={cardStyle}>
      <h1
        style={{
          margin: 0,
          color: "#04122F",
        }}
      >
        {props.value}
      </h1>

      <p>
        {props.title}
      </p>
    </div>
  );
}

/* -------------------------------- */

function WeeklyCard(props: any) {
  return (
    <div
      style={{
        background: "#F8FAFC",
        padding: 18,
        borderRadius: 16,
        marginBottom: 14,
      }}
    >
      <h3
        style={{
          marginTop: 0,
        }}
      >
        {props.week}
      </h3>

      <p>
        Average Response :
        {" "}
        {props.score}
      </p>
    </div>
  );
}

/* -------------------------------- */

const cardStyle = {
  background: "white",
  padding: 30,
  borderRadius: 24,
  boxShadow:
    "0px 10px 25px rgba(0,0,0,0.05)",
} as const;

/* -------------------------------- */

const dropdownStyle = {
  padding: "14px",
  minWidth: "220px",
  borderRadius: "14px",
  border:
    "1px solid #CBD5E1",
} as const;

/* -------------------------------- */

const calendarBox = {
  background: "#F8FAFC",
  padding: 18,
  borderRadius: 14,
  textAlign: "center" as const,
  fontWeight: 700,
};
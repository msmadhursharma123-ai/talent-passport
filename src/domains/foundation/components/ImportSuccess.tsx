interface ImportSuccessProps {
  board: string;
  academicYear: string;
}

export default function ImportSuccess({
  board,
  academicYear,
}: ImportSuccessProps) {
  return (
    <div style={cardStyle}>
      <h2 style={headingStyle}>
        Curriculum Import Successful
      </h2>

      <SuccessItem
        label="Board"
        value={board || "Not Available"}
      />

      <SuccessItem
        label="Academic Year"
        value={
          academicYear || "Not Available"
        }
      />

      <hr style={dividerStyle} />

      <h3 style={subHeadingStyle}>
        Academic Structure Created
      </h3>

      <SuccessItem
        label="Classes"
        value="0"
      />

      <SuccessItem
        label="Subjects"
        value="0"
      />

      <SuccessItem
        label="Chapters"
        value="0"
      />

      <SuccessItem
        label="Topics"
        value="0"
      />

      <SuccessItem
        label="Sub Topics"
        value="0"
      />

      <hr style={dividerStyle} />

      <p style={successTextStyle}>
        Academic Master Layer updated
        successfully.
      </p>

      <p style={readyTextStyle}>
        Ready for Academic Explorer,
        Teacher Assignment, School Portal,
        Teacher Portal and Student Portal.
      </p>
    </div>
  );
}

/* ============================================================
    SUCCESS ITEM
============================================================ */

interface SuccessItemProps {
  label: string;
  value: string;
}

function SuccessItem({
  label,
  value,
}: SuccessItemProps) {
  return (
    <div style={rowStyle}>
      <span>{label}</span>

      <strong>{value}</strong>
    </div>
  );
}

/* ============================================================
    STYLES
============================================================ */

const cardStyle: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: "16px",
  padding: "24px",
};

const headingStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 700,
  marginBottom: "20px",
};

const subHeadingStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 600,
  marginBottom: "12px",
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px 0",
};

const dividerStyle: React.CSSProperties = {
  margin: "20px 0",
};

const successTextStyle: React.CSSProperties = {
  color: "#16A34A",
  fontWeight: 700,
};

const readyTextStyle: React.CSSProperties = {
  marginTop: "12px",
  color: "#6B7280",
};
interface ImportPreviewProps {
  board: string;
  academicYear: string;
}

export default function ImportPreview({
  board,
  academicYear,
}: ImportPreviewProps) {
  return (
    <div style={cardStyle}>
      <h2 style={headingStyle}>
        Import Preview
      </h2>

      <PreviewItem
        label="Board"
        value={board || "Not Selected"}
      />

      <PreviewItem
        label="Academic Year"
        value={
          academicYear || "Not Selected"
        }
      />

      <hr style={dividerStyle} />

      <h3 style={subHeadingStyle}>
        Curriculum Summary
      </h3>

      <SummaryItem
        title="Classes"
        value="0"
      />

      <SummaryItem
        title="Sections"
        value="0"
      />

      <SummaryItem
        title="Subjects"
        value="0"
      />

      <SummaryItem
        title="Chapters"
        value="0"
      />

      <SummaryItem
        title="Topics"
        value="0"
      />

      <SummaryItem
        title="Sub Topics"
        value="0"
      />

      <hr style={dividerStyle} />

      <p style={statusStyle}>
        Ready for Curriculum Validation.
      </p>
    </div>
  );
}

/* ============================================================
    PREVIEW ITEM
============================================================ */

interface PreviewItemProps {
  label: string;
  value: string;
}

function PreviewItem({
  label,
  value,
}: PreviewItemProps) {
  return (
    <div style={rowStyle}>
      <strong>{label}</strong>

      <span>{value}</span>
    </div>
  );
}

/* ============================================================
    SUMMARY ITEM
============================================================ */

interface SummaryItemProps {
  title: string;
  value: string;
}

function SummaryItem({
  title,
  value,
}: SummaryItemProps) {
  return (
    <div style={rowStyle}>
      <span>{title}</span>

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
  padding: "8px 0",
};

const dividerStyle: React.CSSProperties = {
  margin: "20px 0",
};

const statusStyle: React.CSSProperties = {
  color: "#16A34A",
  fontWeight: 600,
};
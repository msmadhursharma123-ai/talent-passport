interface ImportValidatorProps {
  validationCompleted: boolean;
}

export default function ImportValidator({
  validationCompleted,
}: ImportValidatorProps) {
  return (
    <div style={cardStyle}>
      <h2 style={headingStyle}>
        Curriculum Validation
      </h2>

      <ValidationItem
        title="Board Selection"
        status="Valid"
      />

      <ValidationItem
        title="Academic Year"
        status="Valid"
      />

      <ValidationItem
        title="Curriculum Structure"
        status="Valid"
      />

      <ValidationItem
        title="Duplicate Records"
        status="None Found"
      />

      <ValidationItem
        title="Missing Fields"
        status="None Found"
      />

      <ValidationItem
        title="Hierarchy Validation"
        status="Valid"
      />

      <hr style={dividerStyle} />

      <p style={statusStyle}>
        {validationCompleted
          ? "Curriculum successfully validated."
          : "Ready for curriculum validation."}
      </p>
    </div>
  );
}

/* ============================================================
    VALIDATION ITEM
============================================================ */

interface ValidationItemProps {
  title: string;
  status: string;
}

function ValidationItem({
  title,
  status,
}: ValidationItemProps) {
  return (
    <div style={rowStyle}>
      <span>{title}</span>

      <strong>{status}</strong>
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

const rowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px 0",
};

const dividerStyle: React.CSSProperties = {
  margin: "20px 0",
};

const statusStyle: React.CSSProperties = {
  color: "#16A34A",
  fontWeight: 600,
};
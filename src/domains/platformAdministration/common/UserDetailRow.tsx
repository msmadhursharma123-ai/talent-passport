interface UserDetailRowProps {

  label: string;

  value?: React.ReactNode;

}

export default function UserDetailRow({

  label,

  value,

}: UserDetailRowProps) {

  return (

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 20,
        padding: "12px 0",
        borderBottom: "1px solid #EEF2F7",
      }}
    >

      <span
        style={{
          color: "#64748B",
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        {label}
      </span>

      <span
        style={{
          color: "#0F172A",
          fontSize: 14,
          fontWeight: 600,
          textAlign: "right",
          wordBreak: "break-word",
        }}
      >
        {value ?? "-"}
      </span>

    </div>

  );

}
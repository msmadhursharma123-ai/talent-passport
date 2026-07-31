import type { ReactNode } from "react";

interface ExecutiveDetailDrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function ExecutiveDetailDrawer({
  open,
  title,
  onClose,
  children,
}: ExecutiveDetailDrawerProps) {
  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15,23,42,0.45)",
          zIndex: 1000,
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "900px",
          maxWidth: "95vw",
          height: "100vh",
          background: "#FFFFFF",
          borderLeft: "1px solid #DCE5F0",
          boxShadow: "-8px 0 30px rgba(15,23,42,0.15)",
          zIndex: 1001,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "22px 28px",
            borderBottom: "1px solid #E5E7EB",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#0B1F3A",
              }}
            >
              {title}
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 14,
                color: "#66758D",
              }}
            >
              Executive Intelligence Details
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 28,
              color: "#66758D",
              padding: 0,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 24,
            background: "linear-gradient(180deg,#F8FAFD,#F3F6FA)",
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
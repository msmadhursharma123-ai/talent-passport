import React from "react";
import { PlatformUser } from "../types/platformUser";

interface UserDetailsDrawerProps {
  open: boolean;
  user: PlatformUser | null;

  onClose: () => void;

  onEdit?: (user: PlatformUser) => void;
  onResetPassword?: (user: PlatformUser) => void;
  onSuspend?: (user: PlatformUser) => void;
  onActivate?: (user: PlatformUser) => void;
  onArchive?: (user: PlatformUser) => void;
  onDelete?: (user: PlatformUser) => void;
}

export default function UserDetailsDrawer({
  open,
  user,

  onClose,

  onEdit,
  onResetPassword,
  onSuspend,
  onActivate,
  onArchive,
  onDelete,
}: UserDetailsDrawerProps) {
  if (!open || !user) {
    return null;
  }

  return (
    <div style={overlayStyle}>
      <aside style={drawerStyle}>
        <div style={headerStyle}>
          <div>
            <h2 style={titleStyle}>
              User Details
            </h2>

            <p style={subtitleStyle}>
              Universal Identity Profile
            </p>
          </div>

          <button
            style={closeButtonStyle}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div style={scrollStyle}>

          {/* ===================================================== */}
          {/* HERO */}
          {/* ===================================================== */}

          <section style={heroCardStyle}>
            <div style={avatarStyle}>
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div style={{ flex: 1 }}>
              <h3 style={nameStyle}>
                {user.name}
              </h3>

              <div style={badgeRowStyle}>
                <span
                  style={{
                    ...roleBadgeStyle,
                  }}
                >
                  {user.role}
                </span>

                <span
                  style={{
                    ...statusBadgeStyle,
                    ...(user.status === "active"
                      ? activeStatusStyle
                      : user.status === "pending"
                      ? pendingStatusStyle
                      : user.status === "suspended"
                      ? suspendedStatusStyle
                      : archivedStatusStyle),
                  }}
                >
                  {user.status}
                </span>
              </div>
            </div>
          </section>

          {/* ===================================================== */}
          {/* IDENTITY */}
          {/* ===================================================== */}

          <Section title="Identity Information">

            <InfoRow
              label="Full Name"
              value={user.name}
            />

            <InfoRow
              label="Email"
              value={user.email}
            />

            <InfoRow
              label="Phone"
              value={(user as any).phone ?? "-"}
            />

            <InfoRow
              label="Gender"
              value={(user as any).gender ?? "-"}
            />

            <InfoRow
              label="Date of Birth"
              value={(user as any).dateOfBirth ?? "-"}
            />

          </Section>

          {/* ===================================================== */}
          {/* ORGANIZATION */}
          {/* ===================================================== */}

          <Section title="Organization">

            <InfoRow
              label="Organization"
              value={user.organization ?? "-"}
            />

            <InfoRow
              label="School"
              value={(user as any).school ?? "-"}
            />

            <InfoRow
              label="Department"
              value={(user as any).department ?? "-"}
            />

            <InfoRow
              label="Class"
              value={(user as any).className ?? "-"}
            />

            <InfoRow
              label="Section"
              value={(user as any).section ?? "-"}
            />

          </Section>

                    {/* ===================================================== */}
          {/* PLATFORM */}
          {/* ===================================================== */}

          <Section title="Platform Information">

            <InfoRow
              label="User ID"
              value={user.id}
            />

            <InfoRow
              label="Created At"
              value={(user as any).createdAt ?? "-"}
            />

            <InfoRow
              label="Last Login"
              value={user.lastLogin ?? "-"}
            />

            <InfoRow
              label="Last Activity"
              value={(user as any).lastActivity ?? "-"}
            />

          </Section>

          {/* ===================================================== */}
          {/* QUICK ACTIONS */}
          {/* ===================================================== */}

          <Section title="Quick Actions">

            <div style={actionsGridStyle}>

              <ActionButton
                label="✏ Edit User"
                color="#143B73"
                onClick={() => onEdit?.(user)}
              />

              <ActionButton
                label="🔑 Reset Password"
                color="#7C3AED"
                onClick={() =>
                  onResetPassword?.(user)
                }
              />

              <ActionButton
                label="⏸ Suspend"
                color="#EA580C"
                onClick={() =>
                  onSuspend?.(user)
                }
              />

              <ActionButton
                label="▶ Activate"
                color="#16A34A"
                onClick={() =>
                  onActivate?.(user)
                }
              />

              <ActionButton
                label="📦 Archive"
                color="#475569"
                onClick={() =>
                  onArchive?.(user)
                }
              />

              <ActionButton
                label="🗑 Delete"
                color="#DC2626"
                onClick={() =>
                  onDelete?.(user)
                }
              />

            </div>

          </Section>

          {/* ===================================================== */}
          {/* RECENT ACTIVITY */}
          {/* ===================================================== */}

          <Section title="Recent Activity">

            <div style={timelineStyle}>

              <div style={timelineItemStyle}>
                <div style={timelineDotStyle} />

                <div>
                  <strong>
                    User profile loaded
                  </strong>

                  <div style={timelineDateStyle}>
                    Just now
                  </div>
                </div>
              </div>

              <div style={timelineItemStyle}>
                <div style={timelineDotStyle} />

                <div>
                  <strong>
                    Last login
                  </strong>

                  <div style={timelineDateStyle}>
                    {user.lastLogin ?? "-"}
                  </div>
                </div>
              </div>

              <div style={timelineItemStyle}>
                <div style={timelineDotStyle} />

                <div>
                  <strong>
                    Status
                  </strong>

                  <div style={timelineDateStyle}>
                    {user.status}
                  </div>
                </div>
              </div>

            </div>

          </Section>

        </div>
      </aside>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={sectionStyle}>
      <h3 style={sectionTitleStyle}>
        {title}
      </h3>

      <div style={sectionBodyStyle}>
        {children}
      </div>
    </section>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div style={infoRowStyle}>
      <span style={infoLabelStyle}>
        {label}
      </span>

      <strong style={infoValueStyle}>
        {value}
      </strong>
    </div>
  );
}

interface ActionButtonProps {
  label: string;
  color: string;
  onClick?: () => void;
}

function ActionButton({
  label,
  color,
  onClick,
}: ActionButtonProps) {
  return (
    <button
      style={{
        ...actionButtonStyle,
        background: color,
      }}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

/* ======================================================== */
/* STYLES */
/* ======================================================== */

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,.35)",
  display: "flex",
  justifyContent: "flex-end",
  zIndex: 9999,
};

const drawerStyle: React.CSSProperties = {
  width: 520,
  height: "100vh",
  background: "#FFFFFF",
  display: "flex",
  flexDirection: "column",
  boxShadow: "-12px 0 40px rgba(0,0,0,.15)",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 24,
  borderBottom: "1px solid #E5E7EB",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: "#143B73",
  fontSize: 26,
  fontWeight: 800,
};

const subtitleStyle: React.CSSProperties = {
  marginTop: 4,
  color: "#64748B",
  fontSize: 14,
};

const closeButtonStyle: React.CSSProperties = {
  width: 38,
  height: 38,
  border: "none",
  borderRadius: 10,
  background: "#F1F5F9",
  cursor: "pointer",
  fontSize: 18,
};

const scrollStyle: React.CSSProperties = {
  overflowY: "auto",
  flex: 1,
  padding: 24,
};

const heroCardStyle: React.CSSProperties = {
  display: "flex",
  gap: 20,
  alignItems: "center",
  background: "#F8FAFC",
  borderRadius: 18,
  padding: 22,
  marginBottom: 28,
};

const avatarStyle: React.CSSProperties = {
  width: 72,
  height: 72,
  borderRadius: "50%",
  background: "#143B73",
  color: "#FFFFFF",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontWeight: 800,
  fontSize: 30,
};

const nameStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 24,
  color: "#0F172A",
};

const badgeRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: 10,
  flexWrap: "wrap",
};

const roleBadgeStyle: React.CSSProperties = {
  background: "#DBEAFE",
  color: "#1D4ED8",
  padding: "6px 12px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
};

const statusBadgeStyle: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
};

const activeStatusStyle: React.CSSProperties = {
  background: "#DCFCE7",
  color: "#15803D",
};

const pendingStatusStyle: React.CSSProperties = {
  background: "#FEF3C7",
  color: "#B45309",
};

const suspendedStatusStyle: React.CSSProperties = {
  background: "#FEE2E2",
  color: "#B91C1C",
};

const archivedStatusStyle: React.CSSProperties = {
  background: "#E5E7EB",
  color: "#475569",
};

const sectionStyle: React.CSSProperties = {
  marginBottom: 28,
};

const sectionTitleStyle: React.CSSProperties = {
  margin: "0 0 14px",
  fontSize: 16,
  color: "#143B73",
  fontWeight: 700,
};

const sectionBodyStyle: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: 14,
  overflow: "hidden",
};

const infoRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 18px",
  borderBottom: "1px solid #F1F5F9",
};

const infoLabelStyle: React.CSSProperties = {
  color: "#64748B",
  fontWeight: 600,
};

const infoValueStyle: React.CSSProperties = {
  color: "#0F172A",
};

const actionsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2,minmax(0,1fr))",
  gap: 12,
  padding: 18,
};

const actionButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: 10,
  color: "#FFFFFF",
  padding: "12px 14px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 13,
};

const timelineStyle: React.CSSProperties = {
  padding: 18,
};

const timelineItemStyle: React.CSSProperties = {
  display: "flex",
  gap: 14,
  alignItems: "flex-start",
  marginBottom: 18,
};

const timelineDotStyle: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: "50%",
  background: "#143B73",
  marginTop: 6,
};

const timelineDateStyle: React.CSSProperties = {
  marginTop: 4,
  color: "#64748B",
  fontSize: 13,
};
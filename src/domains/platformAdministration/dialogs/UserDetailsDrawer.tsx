import { PlatformUser } from "../types/platformUser";

import UserDetailSection from "../common/UserDetailSection";
import UserDetailRow from "../common/UserDetailRow";

interface UserDetailsDrawerProps {
  open: boolean;

  user: PlatformUser | null;

  onClose: () => void;

  onSuspend: () => void;

  onActivate: () => void;

  onArchive: () => void;

  onEdit: () => void;

  onDelete: () => void;

  onResetPassword: () => void;
}

/* ======================================================

    UNIVERSAL USER DETAILS DRAWER

    Used By

    • Universal Registry

    • Student Registry

    • Teacher Registry

    • Parent Registry

    • Partner Registry

    • School Registry

    • Platform Admin Registry

====================================================== */

export default function UserDetailsDrawer({

  open,

  user,

  onClose,

  onSuspend,

  onActivate,

  onArchive,

  onEdit,

  onDelete,

  onResetPassword,

}: UserDetailsDrawerProps) {

  if (!open || !user) {

    return null;

  }

interface DrawerHeaderProps {

  user: PlatformUser;

  onClose: () => void;

}

function DrawerHeader({

  user,

  onClose,

}: DrawerHeaderProps) {

  return (

    <div

      style={{

        display: "flex",

        justifyContent: "space-between",

        alignItems: "center",

        padding: "24px",

background: "#FFFFFF",

position: "sticky",

top: 0,

zIndex: 5,

borderBottom: "1px solid #CBD5E1",

      }}

    >

      <div>

      <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 16,
  }}
>

  <div
    style={{
      width: 64,
      height: 64,
      borderRadius: "50%",
      background: "#143B73",
      color: "#FFFFFF",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 24,
      fontWeight: 700,
      overflow: "hidden",
    }}
  >

    {user.avatarUrl ? (

      <img
        src={user.avatarUrl}
        alt={user.name}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

    ) : (

      user.name
        ?.charAt(0)
        ?.toUpperCase()

    )}

  </div>

  <div>

    <h2
      style={{
        margin: 0,
        color: "#143B73",
        fontSize: 24,
        fontWeight: 700,
      }}
    >
      {user.name}
    </h2>

    <div
      style={{
        marginTop: 6,
        display: "flex",
        gap: 8,
        alignItems: "center",
        color: "#64748B",
        fontSize: 14,
      }}
    >

      <span>

        {user.role}

      </span>

      <span>•</span>

      <span
    style={{
        padding: "4px 10px",
        borderRadius: 999,
        background:
            user.status === "active"
                ? "#DCFCE7"
                : user.status === "suspended"
                ? "#FEE2E2"
                : "#E5E7EB",
        color:
            user.status === "active"
                ? "#15803D"
                : user.status === "suspended"
                ? "#B91C1C"
                : "#475569",
        fontWeight: 600,
    }}
>

    {user.status}

</span>

    </div>

  </div>

</div>

      </div>

      <button

        onClick={onClose}

        style={{

          border: "none",

          background: "transparent",

          cursor: "pointer",

          fontSize: 28,

          color: "#64748B",

        }}

      >

        ✕

      </button>

    </div>

  );

}

const overlayStyle: React.CSSProperties = {

  position: "fixed",

  inset: 0,

  background: "rgba(15,23,42,.50)",

  backdropFilter: "blur(2px)",

  zIndex: 999,

};

const drawerStyle: React.CSSProperties = {

  position: "fixed",

  top: 0,

  right: 0,

  width: "min(820px,100vw)",

  height: "100vh",

  background: "#F8FAFC",

  overflowY: "auto",

  boxShadow:

    "-18px 0 50px rgba(15,23,42,.20)",

  display: "flex",

  flexDirection: "column",

  zIndex: 1000,

};

const bodyStyle: React.CSSProperties = {

  padding: 24,

  display: "flex",

  flexDirection: "column",

  gap: 24,

};

  return (

    <>

      <div

        style={overlayStyle}

        onClick={onClose}

      />

      <aside

        style={drawerStyle}

      >

        <DrawerHeader

          user={user}

          onClose={onClose}

        />

        <div

          style={bodyStyle}

        >

                  <UserDetailSection

            title="Personal Information"

          >

            <UserDetailRow

              label="Full Name"

              value={user.name}

            />

            <UserDetailRow

              label="Email"

              value={user.email}

            />

            <UserDetailRow

              label="Phone"

              value={user.phone}

            />

           </UserDetailSection>

       <UserDetailSection

    title="Platform Information"

>

    <UserDetailRow
        label="Role"
        value={user.role}
    />

    <UserDetailRow
        label="Status"
        value={user.status}
    />

    <UserDetailRow
        label="Organization"
        value={user.organization ?? "-"}
    />

    <UserDetailRow
        label="Profile Completion"
        value="Coming Soon"
    />

</UserDetailSection>

{/* ======================================================
    ROLE INFORMATION
====================================================== */}

<UserDetailSection
    title="Role Information"
>

    {user.role === "student" && (

        <>

            <UserDetailRow
                label="School"
                value="Coming Soon"
            />

            <UserDetailRow
                label="Class"
                value="Coming Soon"
            />

            <UserDetailRow
                label="Talent Passport"
                value="Coming Soon"
            />

        </>

    )}

    {user.role === "teacher" && (

        <>

            <UserDetailRow
                label="Department"
                value="Coming Soon"
            />

            <UserDetailRow
                label="Subject"
                value="Coming Soon"
            />

            <UserDetailRow
                label="Designation"
                value="Coming Soon"
            />

        </>

    )}

    {user.role === "parent" && (

        <>

            <UserDetailRow
                label="Children"
                value="Coming Soon"
            />

        </>

    )}

    {user.role === "partner" && (

        <>

            <UserDetailRow
                label="Category"
                value="Coming Soon"
            />

            <UserDetailRow
                label="Specialization"
                value="Coming Soon"
            />

        </>

    )}

    {user.role === "school_admin" && (

        <>

            <UserDetailRow
                label="School"
                value="Coming Soon"
            />

            <UserDetailRow
                label="Designation"
                value="Coming Soon"
            />

        </>

    )}

    {user.role === "platform_admin" && (

        <>

            <UserDetailRow
                label="Department"
                value="Coming Soon"
            />

            <UserDetailRow
                label="Access Level"
                value="Coming Soon"
            />

        </>

    )}

</UserDetailSection>

          <UserDetailSection

  title="System Information"

>

  <UserDetailRow

    label="User ID"

    value={user.id}

  />

  <UserDetailRow

    label="Created"

    value={user.createdAt}

  />

  <UserDetailRow

    label="Updated"

    value={user.updatedAt}

  />

  <UserDetailRow

    label="Last Login"

    value={user.lastLogin}

  />

<UserDetailRow

  label="Avatar"

value={
    user.avatarUrl
        ? "Uploaded"
        : "Not Uploaded"
}

/>

</UserDetailSection>

<UserDetailSection

  title="Activity"

>

  <UserDetailRow

    label="Recent Activity"

    value="Activity Timeline will be available soon."

  />

</UserDetailSection>

<UserDetailSection

    title="Account Actions"

>

    <div
        style={{
           display: "grid",

gridTemplateColumns:

    "repeat(auto-fit,minmax(170px,1fr))",

gap: 12,
            marginTop: 8,
        }}
    >

        <button
            style={primaryButtonStyle}
            onClick={onEdit}
        >
            Edit User
        </button>

        {user.status === "active" ? (

            <button
                style={warningButtonStyle}
                onClick={onSuspend}
            >
                Suspend User
            </button>

        ) : (

            <button
                style={successButtonStyle}
                onClick={onActivate}
            >
                Activate User
            </button>

        )}

        <button
            style={secondaryButtonStyle}
            onClick={onArchive}
        >
            Archive User
        </button>

        <button
            style={secondaryButtonStyle}
            onClick={onResetPassword}
        >
            Reset Password
        </button>

        <button
            style={dangerButtonStyle}
            onClick={onDelete}
        >
            Delete User
        </button>

    </div>

</UserDetailSection>


        </div>

      </aside>

    </>

  );

}

const primaryButtonStyle: React.CSSProperties = {
    padding: "12px 18px",
    background: "#143B73",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
};

const successButtonStyle: React.CSSProperties = {
    padding: "12px 18px",
    background: "#16A34A",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
};

const warningButtonStyle: React.CSSProperties = {
    padding: "12px 18px",
    background: "#F59E0B",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
};

const secondaryButtonStyle: React.CSSProperties = {
    padding: "12px 18px",
    background: "#E2E8F0",
    color: "#1E293B",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
};

const dangerButtonStyle: React.CSSProperties = {
   padding: "12px 18px",
    background: "#B91C1C",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
};
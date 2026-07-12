import React, {

  useEffect,

  useMemo,

  useRef,

  useState,

} from "react";

/* ======================================================

    UNIVERSAL USER ACTION MENU

    Used By

    • Universal Registry

    • Student Registry

    • Teacher Registry

    • Parent Registry

    • Partner Registry

    • School Admin Registry

    • Platform Admin Registry

====================================================== */

export interface UserActionMenuProps {

  disabled?: boolean;

  onView: () => void;

  onEdit: () => void;

  onResetPassword: () => void;

  onAssignRole: () => void;

  onAssignSchool: () => void;

  onAssignOrganization: () => void;

  onSuspend: () => void;

  onActivate: () => void;

  onArchive: () => void;

  onDelete: () => void;
}

interface MenuAction {

  id: string;

  label: string;

  onClick: () => void;

  danger?: boolean;

  visible?: boolean;

  disabled?: boolean;

}

type MenuEntry =

  | MenuAction

  | "divider";

export default function UserActionMenu({

  disabled = false,

  onView,

  onEdit,

  onResetPassword,

  onAssignRole,

  onAssignSchool,

  onAssignOrganization,

  onSuspend,

  onActivate,

  onArchive,

  onDelete,

}: UserActionMenuProps) {

  const [

    open,

    setOpen,

  ] = useState(false);

  const menuRef =

    useRef<HTMLDivElement>(null);

  useEffect(() => {

    function handleClick(

      event: MouseEvent,

    ) {

      if (

        menuRef.current &&

        !menuRef.current.contains(

          event.target as Node,

        )

      ) {

        setOpen(false);

      }

    }

    document.addEventListener(

      "mousedown",

      handleClick,

    );

    return () =>

      document.removeEventListener(

        "mousedown",

        handleClick,

      );

  }, []);

  const menuDisabled =

    useMemo(

      () => disabled,

      [disabled],

    );

  function action(

  callback: () => void,

) {

  if (

    menuDisabled

  ) {

    return;

  }

  callback();

  setOpen(false);

}




const actions: MenuEntry[] = [

  {
    id: "view",
    label: "👁 View",
    onClick: onView,
  },

  {
    id: "edit",
    label: "✏ Edit",
    onClick: onEdit,
  },

  "divider",

  {
    id: "reset-password",
    label: "🔑 Reset Password",
    onClick: onResetPassword,
  },

  {
    id: "assign-role",
    label: "🎓 Assign Role",
    onClick: onAssignRole,
  },

  {
    id: "assign-school",
    label: "🏫 Assign School",
    onClick: onAssignSchool,
  },

  {
    id: "assign-organization",
    label: "🏢 Assign Organization",
    onClick: onAssignOrganization,
  },

  "divider",

  {
    id: "suspend",
    label: "⏸ Suspend",
    onClick: onSuspend,
  },

  {
    id: "activate",
    label: "▶ Activate",
    onClick: onActivate,
  },

  {
    id: "archive",
    label: "📦 Archive",
    onClick: onArchive,
  },

  "divider",

  {
    id: "delete",
    label: "🗑 Delete",
    onClick: onDelete,
    danger: true,
  },

];

  return (
    <div
      ref={menuRef}
      style={containerStyle}
    >
      <button

  disabled={menuDisabled}

  style={{

    ...triggerStyle,

    opacity:

      menuDisabled

        ? 0.45

        : 1,

  }}

  onClick={() =>

    setOpen(

      (v) => !v,

    )

  }

>
        ⋮
      </button>

     {open && (

  <div style={menuStyle}>

{actions

  .filter((item) => {

    if (item === "divider") {

      return true;

    }

    return item.visible !== false;

  })

  .map((item, index) => {

    if (item === "divider") {

      return <Divider key={index} />;

    }

    return (

      <MenuItem

        key={item.id}

        label={item.label}

        danger={item.danger}

        disabled={item.disabled}

        onClick={() =>

          action(item.onClick)

        }

      />

    );

  })}

  </div>

)}
    </div>
  );
}

interface MenuItemProps {

  label: string;

  onClick: () => void;

  danger?: boolean;

  disabled?: boolean;

}

function MenuItem({

  label,

  onClick,

  danger,

  disabled = false,

}: MenuItemProps) {
  return (
<button

  disabled={disabled}

  style={{

    ...itemStyle,

    ...(danger ? dangerStyle : {}),

    opacity: disabled ? 0.45 : 1,

    cursor: disabled

      ? "not-allowed"

      : "pointer",

  }}

  onClick={onClick}

>
      {label}
    </button>
  );
}

/* ======================================================

    REUSABLE MENU COMPONENTS

====================================================== */

function Divider() {
  return <div style={dividerStyle} />;
}

/* ================================================= */

const containerStyle: React.CSSProperties = {
  position: "relative",
  display: "inline-block",
};

const triggerStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 8,
  border: "1px solid #CBD5E1",
  background: "#FFFFFF",
  cursor: "pointer",
  fontSize: 18,
  fontWeight: 700,
};

const menuStyle: React.CSSProperties = {
  position: "absolute",
  right: 0,
  top: 42,
  minWidth: 240,
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 12,
  boxShadow: "0 10px 30px rgba(15,23,42,.15)",
  overflow: "hidden",
  zIndex: 999,
};

const itemStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  border: "none",
  background: "#FFFFFF",
  cursor: "pointer",
  textAlign: "left",
  fontSize: 14,
};

const dangerStyle: React.CSSProperties = {
  color: "#DC2626",
  fontWeight: 600,
};

const dividerStyle: React.CSSProperties = {
  height: 1,
  background: "#E5E7EB",
};
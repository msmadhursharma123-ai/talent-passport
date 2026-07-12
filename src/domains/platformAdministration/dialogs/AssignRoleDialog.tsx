import {
  useEffect,
  useState,
} from "react";

import { PlatformUser } from "../types/platformUser";

import UserDialogHeader from "../common/UserDialogHeader";
import UserDialogFooter from "../common/UserDialogFooter";
import UserDialogBody from "../common/UserDialogBody";

import UserFormCard from "../common/UserFormCard";
import UserFormTitle from "../common/UserFormTitle";
import UserFormRow from "../common/UserFormRow";
import UserTextField from "../common/UserTextField";

import FoundationRoleSelect
from "../common/foundation/FoundationRoleSelect";

import {
  dialogStyle,
  overlayStyle,
} from "../common/styles/dialogStyles";

/* ======================================================

    UNIVERSAL ASSIGN ROLE DIALOG

    Used By

    • Universal Registry
    • Student Registry
    • Teacher Registry
    • Parent Registry
    • Partner Registry
    • School Admin Registry
    • Platform Admin Registry

====================================================== */

/* ======================================================

    ASSIGN ROLE DIALOG

    Layer 5

    Connected To

    • Universal User Registry

    • UserRegistryViewModel

    • PlatformAdministrationService

    • PlatformUserRepository

====================================================== */

interface AssignRoleDialogProps {

  open: boolean;

  user: PlatformUser | null;

  loading?: boolean;

  onClose: () => void;

  onAssign?: (

    userId: string,

    role: string,

    reason: string,

    notifyUser: boolean,

  ) => Promise<void> | void;
}

export default function AssignRoleDialog({

  open,

  user,

  loading = false,

  onClose,

  onAssign,

}: AssignRoleDialogProps) {

  /* ======================================================
      STATE
  ====================================================== */

  const [
    role,
    setRole,
  ] = useState("");

  const [
    reason,
    setReason,
  ] = useState("");

  const [
    notifyUser,
    setNotifyUser,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(loading);

  /* ======================================================
      EFFECTS
  ====================================================== */

  useEffect(() => {

    setSaving(loading);

  }, [
    loading,
  ]);

  useEffect(() => {

    if (

      open &&

      user

    ) {

      setRole(user.role);

      setReason("");

      setNotifyUser(true);

    }

  }, [

    open,

    user,

  ]);

  if (

    !open ||

    !user

  ) {

    return null;

  }

  /* ======================================================
      COMPUTED VALUES
  ====================================================== */

  const dialogTitle =
    `Assign Role`;

  const dialogSubtitle =
    `Change ${user.name}'s platform role.`;

  const roleChanged =

    role.trim() !== "" &&

    role !== user.role;

  const assignButtonDisabled =

    !roleChanged ||

    saving;

  /* ======================================================
      HANDLERS
  ====================================================== */

  async function handleAssign() {

    if (

      !user ||

      assignButtonDisabled

    ) {

      return;

    }

    try {

      setSaving(true);

      await onAssign?.(

        user.id,

        role,

        reason,

        notifyUser,

      );

      setRole(user.role);

      setReason("");

      setNotifyUser(true);

      handleCancel();

    }

    catch (error) {

      console.error(

        "Assign Role Failed",

        error,

      );

    }

    finally {

      setSaving(false);

    }

  }

  function handleCancel() {

    if (

      saving

    ) {

      return;

    }

    setRole(

      user.role,

    );

    setReason("");

    setNotifyUser(true);

    onClose();

  }

  /* ======================================================

      ASSIGN ROLE PIPELINE

      ViewModel

          ↓

      PlatformAdministrationService

          ↓

      PlatformUserRepository

  ====================================================== */

    return (
    <div style={overlayStyle}>
      <div style={dialogStyle}>
        <UserDialogHeader
          title={dialogTitle}
          subtitle={dialogSubtitle}
          onClose={handleCancel}
        />

        <UserDialogBody>
          <UserFormCard>
            <UserFormTitle>
              Current User
            </UserFormTitle>

            <UserFormRow>
              <UserTextField
                label="User Name"
                value={user.name}
                disabled
              />

              <UserTextField
                label="Email"
                value={user.email}
                disabled
              />
            </UserFormRow>

            <UserFormRow>
              <UserTextField
                label="Current Role"
                value={user.role}
                disabled
              />

              <UserTextField
                label="Status"
                value={user.status}
                disabled
              />
            </UserFormRow>
          </UserFormCard>

          <UserFormCard>
            <UserFormTitle>
              New Role Assignment
            </UserFormTitle>

            <UserFormRow>
              <FoundationRoleSelect
                value={role}
                disabled={saving}
                onChange={setRole}
              />
            </UserFormRow>
          </UserFormCard>

          <UserFormCard>
            <UserFormTitle>
              Assignment Details
            </UserFormTitle>

            <UserTextField
              label="Reason (Optional)"
              value={reason}
              disabled={saving}
              placeholder="Enter the reason for changing this user's role..."
              onChange={(e) =>
                setReason(
                  e.target.value,
                )
              }
            />
          </UserFormCard>

          <UserFormCard>
            <UserFormTitle>
              Notification
            </UserFormTitle>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <input
                  type="checkbox"
                  checked={notifyUser}
                  disabled={saving}
                  onChange={(e) =>
                    setNotifyUser(
                      e.target.checked,
                    )
                  }
                />

                Notify the user about this
                role assignment.
              </label>
            </div>
          </UserFormCard>

          <UserFormCard>
            <UserFormTitle>
              Assignment Information
            </UserFormTitle>

            <div
              style={{
                background: "#EEF6FF",
                border: "1px solid #93C5FD",
                color: "#1E3A8A",
                padding: 16,
                borderRadius: 10,
                lineHeight: 1.6,
              }}
            >
              <strong>
                Platform Role Assignment
              </strong>

              <br />

              Changing the user's role updates
              platform permissions and determines
              which Platform Administration modules
              and portal experiences are available
              after the next login.
            </div>
          </UserFormCard>
        </UserDialogBody>

        <UserDialogFooter
          saving={saving}
          saveLabel="Assign Role"
          saveDisabled={assignButtonDisabled}
          onCancel={handleCancel}
          onSave={handleAssign}
        />
      </div>
    </div>
  );
}
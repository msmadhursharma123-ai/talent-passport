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

import {
  dialogStyle,
  overlayStyle,
} from "../common/styles/dialogStyles";

/* ======================================================

    UNIVERSAL ARCHIVE USER DIALOG

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

    ARCHIVE USER DIALOG

    Layer 5

    Connected To

    • Universal User Registry

    • UserRegistryViewModel

    • PlatformAdministrationService

    • PlatformUserRepository

====================================================== */

interface ArchiveUserDialogProps {

  open: boolean;

  user: PlatformUser | null;

  loading?: boolean;

  onClose: () => void;

  onArchive?: (
    userId: string,
    reason: string,
    notifyUser: boolean,
  ) => Promise<void> | void;
}

export default function ArchiveUserDialog({

  open,

  user,

  loading = false,

  onClose,

  onArchive,

}: ArchiveUserDialogProps) {

  /* ======================================================
      STATE
  ====================================================== */

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

    if (open) {

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
    user
      ? `Archive ${user.name}`
      : "Archive User";

  const dialogSubtitle =
    user
      ? `Archive ${user.name}'s platform account. Archived users can be restored later.`
      : "Archive platform user.";

  const archiveButtonDisabled =

    !reason.trim() ||

    saving;

  const canNotifyUser =

    !saving;

  /* ======================================================
      HANDLERS
  ====================================================== */

  async function handleArchive() {

    if (

      !user ||

      archiveButtonDisabled

    ) {

      return;

    }

    try {

      setSaving(true);

      await onArchive?.(

        user.id,

        reason,

        canNotifyUser
          ? notifyUser
          : false,

      );

      setReason("");

      setNotifyUser(true);

      handleCancel();

    } catch (error) {

      console.error(

        "Archive User Failed",

        error,

      );

    } finally {

      setSaving(false);

    }

  }

  function handleCancel() {

    if (

      saving

    ) {

      return;

    }

    setReason("");

    setNotifyUser(true);

    onClose();

  }

  /* ======================================================

      ARCHIVE PIPELINE

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
              User Information
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
                label="Role"
                value={user.role}
                disabled
              />

              <UserTextField
                label="Current Status"
                value={user.status}
                disabled
              />
            </UserFormRow>
          </UserFormCard>

          <UserFormCard>
            <UserFormTitle>
              Archive Information
            </UserFormTitle>

            <div
              style={{
                background: "#FEF3C7",
                border: "1px solid #FCD34D",
                color: "#92400E",
                padding: 16,
                borderRadius: 10,
                lineHeight: 1.6,
              }}
            >
              <strong>
                Archive User Account
              </strong>

              <br />

              Archiving this user removes the account from active
              platform usage while preserving historical records.
              The account can be restored later by a Platform
              Administrator.
            </div>
          </UserFormCard>

          <UserFormCard>
            <UserFormTitle>
              Archive Details
            </UserFormTitle>

            <UserTextField
              label="Reason for Archive"
              value={reason}
              disabled={saving}
              placeholder="Enter the reason for archiving this user..."
              onChange={(e) =>
                setReason(
                  e.target.value,
                )
              }
            />
          </UserFormCard>

          <UserFormCard>
            <UserFormTitle>
              Email Notification
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
                  disabled={saving}
                  checked={notifyUser}
                  onChange={(e) =>
                    setNotifyUser(
                      e.target.checked,
                    )
                  }
                />

                {" "}

                Notify user by email that the account
                has been archived.
              </label>
            </div>
          </UserFormCard>
        </UserDialogBody>

        <UserDialogFooter
          saving={saving}
          saveLabel="Archive User"
          saveDisabled={archiveButtonDisabled}
          onCancel={handleCancel}
          onSave={handleArchive}
        />
      </div>
    </div>
  );
}
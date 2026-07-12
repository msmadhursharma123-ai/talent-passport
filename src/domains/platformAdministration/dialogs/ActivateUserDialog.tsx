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

    UNIVERSAL ACTIVATE USER DIALOG

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

    ACTIVATE USER DIALOG

    Layer 5

    Connected To

    • Universal User Registry

    • UserRegistryViewModel

    • PlatformAdministrationService

    • PlatformUserRepository

====================================================== */

interface ActivateUserDialogProps {

  open: boolean;

  user: PlatformUser | null;

  loading?: boolean;

  onClose: () => void;

  onActivate?: (
    userId: string,
    notifyUser: boolean,
  ) => Promise<void> | void;
}

export default function ActivateUserDialog({

  open,

  user,

  loading = false,

  onClose,

  onActivate,

}: ActivateUserDialogProps) {

  /* ======================================================
      STATE
  ====================================================== */

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
      ? `Activate ${user.name}`
      : "Activate User";

  const dialogSubtitle =
    user
      ? `Restore ${user.name}'s access to the Talent Passport Platform.`
      : "Restore platform access.";

  const activateButtonDisabled =
    saving;

  const canNotifyUser =
    !saving;

  /* ======================================================
      HANDLERS
  ====================================================== */

  async function handleActivate() {

    if (

      !user ||

      activateButtonDisabled

    ) {

      return;

    }

    try {

      setSaving(true);

      await onActivate?.(

        user.id,

        canNotifyUser
          ? notifyUser
          : false,

      );

      setNotifyUser(true);

      handleCancel();

    } catch (error) {

      console.error(

        "Activate User Failed",

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

    setNotifyUser(true);

    onClose();

  }

  /* ======================================================
      ACTIVATE PIPELINE

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
              Activation Details
            </UserFormTitle>

            <div
              style={{
                background: "#ECFDF5",
                border: "1px solid #6EE7B7",
                color: "#065F46",
                padding: 16,
                borderRadius: 10,
                lineHeight: 1.6,
              }}
            >
              <strong>
                Restore Platform Access
              </strong>

              <br />

              Activating this user will immediately restore
              access to the Talent Passport Platform and allow
              the user to sign in again.
            </div>
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

                Notify user by email that
                platform access has been restored.
              </label>
            </div>
          </UserFormCard>
        </UserDialogBody>

        <UserDialogFooter
          saving={saving}
          saveLabel="Activate User"
          saveDisabled={activateButtonDisabled}
          onCancel={handleCancel}
          onSave={handleActivate}
        />
      </div>
    </div>
  );
}
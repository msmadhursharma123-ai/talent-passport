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
import UserPrimaryButton from "../common/UserPrimaryButton";

import {
  dialogStyle,
  overlayStyle,
} from "../common/styles/dialogStyles";

/* ======================================================

    UNIVERSAL RESET PASSWORD DIALOG

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

    RESET PASSWORD DIALOG

    Layer 5

    Connected To

    • Universal User Registry

    • UserRegistryViewModel

    • PlatformAdministrationService

    • PlatformUserRepository

====================================================== */

interface ResetPasswordDialogProps {

  open: boolean;

  user: PlatformUser | null;

  loading?: boolean;

  onClose: () => void;

  onReset?: (

    userId: string,

    password: string,

    forceChange: boolean,

    sendEmail: boolean,

  ) => Promise<void> | void;
}

export default function ResetPasswordDialog({

  open,

  user,

  loading = false,

  onClose,

  onReset,

}: ResetPasswordDialogProps) {

  /* ======================================================
      STATE
  ====================================================== */

  const [
    tempPassword,
    setTempPassword,
  ] = useState("");

  const [
    forceChange,
    setForceChange,
  ] = useState(true);

  const [
    sendEmail,
    setSendEmail,
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

      setTempPassword("");

      setForceChange(true);

      setSendEmail(true);

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
      ? `Reset Password for ${user.name}`
      : "Reset Password";

  const dialogSubtitle =
    "Generate and assign a temporary password.";

  const resetButtonDisabled =

    !tempPassword.trim() ||

    saving;

  /* ======================================================
      HELPERS
  ====================================================== */

  function generatePassword() {

    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

    let password = "";

    for (

      let i = 0;

      i < 10;

      i++

    ) {

      password += chars.charAt(

        Math.floor(

          Math.random() * chars.length,

        ),

      );

    }

    setTempPassword(password);

  }

  /* ======================================================
      HANDLERS
  ====================================================== */

  async function handleReset() {

    if (

      !user ||

      resetButtonDisabled

    ) {

      return;

    }

    try {

      setSaving(true);

      await onReset?.(

        user.id,

        tempPassword,

        forceChange,

        sendEmail,

      );

      setTempPassword("");

      setForceChange(true);

      setSendEmail(true);

      handleCancel();

    } catch (error) {

      console.error(

        "Reset Password Failed",

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

    setTempPassword("");

    setForceChange(true);

    setSendEmail(true);

    onClose();

  }

  /* ======================================================

      RESET PASSWORD PIPELINE

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
              Temporary Password
            </UserFormTitle>

            <UserFormRow>
              <UserTextField
                label="Password"
                value={tempPassword}
                disabled={saving}
                placeholder="Generate or enter a temporary password"
                onChange={(e) =>
                  setTempPassword(
                    e.target.value,
                  )
                }
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                }}
              >
                <UserPrimaryButton
                  onClick={generatePassword}
                  disabled={saving}
                >
                  Generate
                </UserPrimaryButton>
              </div>
            </UserFormRow>
          </UserFormCard>

          <UserFormCard>
            <UserFormTitle>
              Reset Options
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
                  checked={forceChange}
                  disabled={saving}
                  onChange={(e) =>
                    setForceChange(
                      e.target.checked,
                    )
                  }
                />

                Force password change on next login
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <input
                  type="checkbox"
                  checked={sendEmail}
                  disabled={saving}
                  onChange={(e) =>
                    setSendEmail(
                      e.target.checked,
                    )
                  }
                />

                Send password reset email
              </label>
            </div>
          </UserFormCard>

          <UserFormCard>
            <UserFormTitle>
              Security Information
            </UserFormTitle>

            <div
              style={{
                background: "#EFF6FF",
                border: "1px solid #93C5FD",
                color: "#1E3A8A",
                padding: 16,
                borderRadius: 10,
                lineHeight: 1.6,
              }}
            >
              <strong>
                Password Reset
              </strong>

              <br />

              A temporary password will be assigned to the user.
              If "Force password change" is enabled, the user must
              create a new password during the next successful sign-in.
            </div>
          </UserFormCard>
        </UserDialogBody>

        <UserDialogFooter
          saving={saving}
          saveLabel="Reset Password"
          saveDisabled={resetButtonDisabled}
          onCancel={handleCancel}
          onSave={handleReset}
        />
      </div>
    </div>
  );
}
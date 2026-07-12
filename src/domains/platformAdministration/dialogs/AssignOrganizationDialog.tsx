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

import FoundationOrganizationSelect
from "../common/foundation/FoundationOrganizationSelect";

import {
  dialogStyle,
  overlayStyle,
} from "../common/styles/dialogStyles";

/* ======================================================

    UNIVERSAL ASSIGN ORGANIZATION DIALOG

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

    ASSIGN ORGANIZATION DIALOG

    Layer 5

    Connected To

    • Universal User Registry

    • UserRegistryViewModel

    • PlatformAdministrationService

    • PlatformUserRepository

====================================================== */

interface AssignOrganizationDialogProps {

  open: boolean;

  user: PlatformUser | null;

  loading?: boolean;

  onClose: () => void;

  onAssign?: (

    userId: string,

    organization: string,

    reason: string,

    notifyUser: boolean,

  ) => Promise<void> | void;
}

export default function AssignOrganizationDialog({

  open,

  user,

  loading = false,

  onClose,

  onAssign,

}: AssignOrganizationDialogProps) {

  /* ======================================================
      STATE
  ====================================================== */

  const [
    organization,
    setOrganization,
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

      setOrganization(

        user.organization ?? "",

      );

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
    "Assign Organization";

  const dialogSubtitle =
    `Assign or change ${user.name}'s organization.`;

  const organizationChanged =

    organization.trim() !== "" &&

    organization !== (

      user.organization ?? ""

    );

  const assignButtonDisabled =

    !organizationChanged ||

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

        organization,

        reason,

        notifyUser,

      );

      setOrganization(

        user.organization ?? "",

      );

      setReason("");

      setNotifyUser(true);

      handleCancel();

    }

    catch (error) {

      console.error(

        "Assign Organization Failed",

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

    setOrganization(

      user?.organization ?? "",

    );

    setReason("");

    setNotifyUser(true);

    onClose();

  }

  /* ======================================================

      ASSIGN ORGANIZATION PIPELINE

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
                label="Current Organization"
                value={user.organization ?? ""}
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
              New Organization Assignment
            </UserFormTitle>

            <UserFormRow>
              <FoundationOrganizationSelect
                value={organization}
                disabled={saving}
                onChange={setOrganization}
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
              placeholder="Enter the reason for changing this user's organization..."
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
                organization assignment.
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
                Organization Assignment
              </strong>

              <br />

              Assigning a new organization updates the
              user's primary organization across the
              Platform Administration module and
              determines which organization-specific
              permissions, workflows and reporting
              become available.
            </div>
          </UserFormCard>
        </UserDialogBody>

        <UserDialogFooter
          saving={saving}
          saveLabel="Assign Organization"
          saveDisabled={assignButtonDisabled}
          onCancel={handleCancel}
          onSave={handleAssign}
        />
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";

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

    UNIVERSAL DELETE USER DIALOG

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

    DELETE USER DIALOG

    Layer 5

    Connected To

    • Universal User Registry

    • UserRegistryViewModel

    • PlatformAdministrationService

    • PlatformUserRepository

    • Students

    • Teachers

    • Parents

    • Partners

    • School Admins

    • Platform Admins

====================================================== */

interface DeleteUserDialogProps {

  open: boolean;

  user: PlatformUser | null;

  loading?: boolean;

  onClose: () => void;

  onDelete?: (

    userId: string,

    notifyUser: boolean,

  ) => Promise<void> | void;

}

export default function DeleteUserDialog({

  open,

  user,

  loading = false,

  onClose,

  onDelete,

}: DeleteUserDialogProps) {

  const [

    confirmation,

    setConfirmation,

  ] = useState("");

  const [

    notifyUser,

    setNotifyUser,

  ] = useState(false);

  const [

    saving,

    setSaving,

  ] = useState(loading);

  useEffect(() => {

    setSaving(

      loading,

    );

  }, [

    loading,

  ]);

  useEffect(() => {

    if (

      open

    ) {

      setConfirmation("");

      setNotifyUser(false);

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

    const canDelete =

    confirmation.trim() ===

    "DELETE";

  const deleteButtonDisabled =

    !canDelete ||

    saving;

const requiresConfirmation =

    confirmation.trim() !==

    "DELETE";

const canNotifyUser =

    !saving;

 const dialogTitle =

    user

        ? `Delete ${user.name}`

        : "Delete User";

const dialogSubtitle =

    user

        ? `This will permanently delete ${user.name}'s account and associated platform access.`

        : "This action cannot be undone.";

  async function handleDelete() {

    if (

      deleteButtonDisabled ||

      !user

    ) {

      return;

    }

    try {

      setSaving(true);

   await onDelete?.(

    user.id,

    canNotifyUser

        ? notifyUser

        : false,

);

setConfirmation("");

setNotifyUser(false);

handleCancel();

    } catch (error) {

      console.error(

        "Delete User Failed",

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

    setConfirmation("");

    setNotifyUser(false);

    onClose();

  }

/* ======================================================

    DELETE PIPELINE

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

              Permanent Deletion

            </UserFormTitle>

            <div

              style={{

                background: "#FEF2F2",

                border: "1px solid #FCA5A5",

                color: "#991B1B",

                padding: 16,

                borderRadius: 10,

                lineHeight: 1.6,

              }}

            >

              <strong>

                This action is permanent.

              </strong>

              <br />

              Deleting this user will permanently remove the platform account.

              This action cannot be undone.

            </div>

          </UserFormCard>

          <UserFormCard>

            <UserFormTitle>

              Confirmation

            </UserFormTitle>

            <UserTextField

  disabled={saving}

              label='Type "DELETE" to continue'

              value={confirmation}

              placeholder="DELETE"

              onChange={(e)=>

                setConfirmation(

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

  disabled={saving}

  type="checkbox"

                  checked={notifyUser}

                  onChange={(e)=>

                    setNotifyUser(

                      e.target.checked,

                    )

                  }

                />

                {" "}

                Notify user by email before deleting the account

              </label>

            </div>

          </UserFormCard>

                </UserDialogBody>

  <UserDialogFooter

  saving={saving}

  saveLabel="Delete User"

  saveDisabled={

    deleteButtonDisabled ||

    requiresConfirmation

}

  onCancel={handleCancel}

  onSave={handleDelete}

/>

      </div>

    </div>

  );

}
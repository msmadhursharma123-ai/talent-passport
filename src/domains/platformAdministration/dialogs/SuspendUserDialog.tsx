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

interface SuspendUserDialogProps {

  open: boolean;

  user: PlatformUser | null;

  loading?: boolean;

  onClose: () => void;

  onSuspend?: (

    userId: string,

    reason: string,

    notifyUser: boolean,

  ) => Promise<void> | void;

}

export default function SuspendUserDialog({

  open,

  user,

  loading = false,

  onClose,

  onSuspend,

}: SuspendUserDialogProps) {

  const [reason, setReason] =

    useState("");

  const [notifyUser, setNotifyUser] =

    useState(true);

const [saving, setSaving] =
    useState(loading);

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

        setReason("");

        setNotifyUser(true);

    }

}, [

    open,

    user,

]);

  if (!open || !user) {

    return null;

  }

  const canSuspend =

    reason.trim().length > 0;

const dialogTitle =

    "Suspend User";

const dialogSubtitle =

    user

        ? `Suspend ${user.name} from accessing the platform.`

        : "Suspend platform access.";

  async function handleSuspend() {

if (

    !user ||

    !reason.trim() ||

    saving

) {

    return;

}

    try {

      setSaving(true);

await onSuspend?.(

    user.id,

    reason,

    notifyUser,

);

setReason("");

setNotifyUser(true);

onClose();

    } finally {

      setSaving(false);

    }

  }

/* ======================================================

    SUSPEND PIPELINE

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

          onClose={() => {

    if (

        saving

    ) {

        return;

    }

    onClose();

}}

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

                label="Status"

                value={user.status}

                disabled

              />

            </UserFormRow>

          </UserFormCard>

          <UserFormCard>

            <UserFormTitle>

              Suspension Details

            </UserFormTitle>

            <UserTextField

disabled={saving}

              label="Reason for Suspension"

              value={reason}

              placeholder="Enter the reason for suspending this user..."

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

disabled={saving}

type="checkbox"

                  checked={notifyUser}

                  onChange={(e) =>

                    setNotifyUser(

                      e.target.checked,

                    )

                  }

                />

                {" "}

                Notify user by email about the suspension

              </label>

            </div>

          </UserFormCard>

               </UserDialogBody>

        <UserDialogFooter

          saving={saving}

          saveLabel="Suspend User"

 saveDisabled={

    !canSuspend ||

    saving

}

          onCancel={onClose}

          onSave={handleSuspend}

        />

      </div>

    </div>

  );

}
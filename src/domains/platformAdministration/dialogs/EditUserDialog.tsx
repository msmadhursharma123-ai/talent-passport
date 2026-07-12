import { useEffect, useState } from "react";

import UserDialogHeader from "../common/UserDialogHeader";
import UserDialogFooter from "../common/UserDialogFooter";

import UserDialogBody from "../common/UserDialogBody";
import UserScrollableContent from "../common/UserScrollableContent";

import UserForm from "../common/UserForm";
import UserFormCard from "../common/UserFormCard";
import UserFormTitle from "../common/UserFormTitle";
import UserFormRow from "../common/UserFormRow";

import UserTextField from "../common/UserTextField";
import UserSelect from "../common/UserSelect";

import UserAvatarPicker from "../common/UserAvatarPicker";

import FoundationOrganizationSelect
from "../common/foundation/FoundationOrganizationSelect";

import FoundationSchoolSelect
from "../common/foundation/FoundationSchoolSelect";

import FoundationClassSelect
from "../common/foundation/FoundationClassSelect";

import FoundationSectionSelect
from "../common/foundation/FoundationSectionSelect";

import FoundationSubjectSelect
from "../common/foundation/FoundationSubjectSelect";

import FoundationRoleSelect
from "../common/foundation/FoundationRoleSelect";

import {
  dialogStyle,
  overlayStyle,
} from "../common/styles/dialogStyles";

import { PlatformUser }
from "../types/platformUser";

interface EditUserDialogProps {

  open: boolean;

  user: PlatformUser | null;

  loading?: boolean;

  onClose: () => void;

onSave?: (
    userId: string,
    form: UserFormData,
) => Promise<void> | void;

  onDelete?: () => Promise<void> | void;

  onResetPassword?: () => Promise<void> | void;

}

/* ======================================================

    EDIT USER FORM MODEL

    Shared By

    • Universal User Registry

    • Student Registry

    • Teacher Registry

    • Parent Registry

    • Partner Registry

    • School Admin Registry

    • Platform Admin Registry

====================================================== */

interface UserFormData {

  firstName: string;
  lastName: string;

  email: string;
  phone: string;

  gender: string;
  dateOfBirth: string;

  avatar?: File | null;

  role: string;
  status: string;

  organization: string;
  school: string;
  className: string;
  section: string;
  subject: string;

  employeeId: string;
  designation: string;

  parentOccupation: string;
  relationship: string;

  companyName: string;
  partnerCategory: string;

  permissionGroup: string;

  notes: string;

}

const EMPTY_FORM: UserFormData = {

  firstName: "",
  lastName: "",

  email: "",
  phone: "",

  gender: "",
  dateOfBirth: "",

  avatar: null,

  role: "",
  status: "Active",

  organization: "",
  school: "",
  className: "",
  section: "",
  subject: "",

  employeeId: "",
  designation: "",

  parentOccupation: "",
  relationship: "",

  companyName: "",
  partnerCategory: "",

  permissionGroup: "",

  notes: "",

};

/* ======================================================

    UNIVERSAL EDIT USER DIALOG

    Used By

    • Universal User Registry

    • Student Registry

    • Teacher Registry

    • Parent Registry

    • Partner Registry

    • School Registry

    • Platform Admin Registry

====================================================== */

export default function EditUserDialog({

  open,

  user,

  loading = false,

  onClose,

  onSave,

  onDelete,

  onResetPassword,

}: EditUserDialogProps) {

  const [saving, setSaving] =
    useState(loading);

  const [form, setForm] =
    useState<UserFormData>(
      EMPTY_FORM,
    );

useEffect(() => {

  setSaving(loading);

}, [loading]);

  useEffect(() => {

    if (!user) {

      setForm(EMPTY_FORM);

      return;

    }

    setForm({

      ...EMPTY_FORM,

      ...user,

    });

  }, [

    open,

    user,

]);

  if (!open) {

    return null;

  }

  function updateField(

    field: keyof UserFormData,

    value: any,

  ) {

    setForm((previous) => ({

      ...previous,

      [field]: value,

    }));

  }

    const isFormValid =

    form.firstName.trim() !== "" &&

    form.lastName.trim() !== "" &&

    form.email.trim() !== "" &&

    form.role.trim() !== "" &&

    form.organization.trim() !== "";

const hasChanges =

    JSON.stringify(form) !==

    JSON.stringify({

        ...EMPTY_FORM,

        ...user,

    });

const canDelete =

    !!user;

const canResetPassword =

    !!user;

async function handleDelete() {

    if (

        !canDelete ||

        saving

    ) {

        return;

    }

    await onDelete?.();

}

const actionsEnabled =

    !!user &&

    !saving;

async function handleResetPassword() {

    if (

        !canResetPassword ||

        saving

    ) {

        return;

    }

    await onResetPassword?.();

}

  async function handleSave() {

if (

    !user ||

    !isFormValid ||

    saving

) {

    return;

}

    try {

      setSaving(true);

await onSave?.(

    user.id,

    form,

);

setForm(

    EMPTY_FORM,

);

setSaving(false);

handleClose();

    } finally {

      setSaving(false);

    }

  }

  function handleClose() {

if (saving) {

    return;

}

    if (user) {

setForm({

    ...EMPTY_FORM,

    ...user,

    role:

        user.role ?? "",

    status:

        user.status ?? "Active",

    organization:

        user.organization ?? "",

});

    } else {

      setForm(EMPTY_FORM);

    }

    onClose();

  }

  return (

    <div style={overlayStyle}>

      <div style={dialogStyle}>

        <UserDialogHeader

          title="Edit User"

          subtitle={
    user
        ? `Editing ${user.name}`
        : "Update platform user"
}

          onClose={handleClose}

        />

        <UserScrollableContent>

          <UserDialogBody>

            <UserForm>

              <PersonalInformationSection

                form={form}

                updateField={updateField}

              />

              <AccountInformationSection

                form={form}

                updateField={updateField}

              />

              <FoundationInformationSection

                form={form}

                updateField={updateField}

              />

              <RoleSpecificSection

                form={form}

                updateField={updateField}

              />

              <NotesSection

                form={form}

                updateField={updateField}

              />

            </UserForm>

          </UserDialogBody>

        </UserScrollableContent>

        <UserDialogFooter

    saving={saving}

    saveLabel="Save Changes"

 saveDisabled={

    !isFormValid ||

    !hasChanges ||

    saving

}

    onCancel={handleClose}

    onSave={handleSave}

/>

      </div>

    </div>

  );

}

interface SectionProps {

  form: UserFormData;

  updateField: (

    field: keyof UserFormData,

    value: any,

  ) => void;

}

function PersonalInformationSection({

  form,

  updateField,

}: SectionProps) {

  return (

    <UserFormCard>

      <UserFormTitle>

        Personal Information

      </UserFormTitle>

      <UserAvatarPicker

        onSelect={(file) =>

          updateField(
            "avatar",
            file,
          )

        }

      />

      <UserFormRow>

        <UserTextField

          label="First Name"

          value={form.firstName}

          placeholder="Enter first name"

          onChange={(e) =>

            updateField(
              "firstName",
              e.target.value,
            )

          }

        />

        <UserTextField

          label="Last Name"

          value={form.lastName}

          placeholder="Enter last name"

          onChange={(e) =>

            updateField(
              "lastName",
              e.target.value,
            )

          }

        />

      </UserFormRow>

      <UserFormRow>

        <UserTextField

          label="Email"

          type="email"

          value={form.email}

          placeholder="Email"

          onChange={(e) =>

            updateField(
              "email",
              e.target.value,
            )

          }

        />

        <UserTextField

          label="Phone"

          value={form.phone}

          placeholder="Phone"

          onChange={(e) =>

            updateField(
              "phone",
              e.target.value,
            )

          }

        />

      </UserFormRow>

      <UserFormRow>

        <UserSelect

          label="Gender"

          value={form.gender}

          onChange={(e) =>

            updateField(
              "gender",
              e.target.value,
            )

          }

        >

          <option value="">

            Select Gender

          </option>

          <option value="Male">

            Male

          </option>

          <option value="Female">

            Female

          </option>

          <option value="Other">

            Other

          </option>

        </UserSelect>

        <UserTextField

          label="Date of Birth"

          type="date"

          value={form.dateOfBirth}

          onChange={(e) =>

            updateField(
              "dateOfBirth",
              e.target.value,
            )

          }

        />

      </UserFormRow>

    </UserFormCard>

  );

}

function AccountInformationSection({

  form,

  updateField,

}: SectionProps) {

  return (

    <UserFormCard>

      <UserFormTitle>

        Account Information

      </UserFormTitle>

      <UserFormRow>

        <FoundationRoleSelect

          value={form.role}

          onChange={(value) =>

            updateField(
              "role",
              value,
            )

          }

        />

        <UserSelect

          label="Status"

          value={form.status}

          onChange={(e) =>

            updateField(
              "status",
              e.target.value,
            )

          }

        >

          <option value="Active">

            Active

          </option>

          <option value="Pending">

            Pending

          </option>

          <option value="Suspended">

            Suspended

          </option>

          <option value="Archived">

            Archived

          </option>

        </UserSelect>

      </UserFormRow>

    </UserFormCard>

  );

}

function FoundationInformationSection({

  form,

  updateField,

}: SectionProps) {

  return (

    <UserFormCard>

      <UserFormTitle>

        Foundation Information

      </UserFormTitle>

      <UserFormRow>

        <FoundationOrganizationSelect

          value={form.organization}

          onChange={(value) =>

            updateField(
              "organization",
              value,
            )

          }

        />

        <FoundationSchoolSelect

          value={form.school}

          onChange={(value) =>

            updateField(
              "school",
              value,
            )

          }

        />

      </UserFormRow>

      <UserFormRow>

        <FoundationClassSelect

          value={form.className}

          onChange={(value) =>

            updateField(
              "className",
              value,
            )

          }

        />

        <FoundationSectionSelect

          value={form.section}

          onChange={(value) =>

            updateField(
              "section",
              value,
            )

          }

        />

      </UserFormRow>

      <UserFormRow>

        <FoundationSubjectSelect

          value={form.subject}

          onChange={(value) =>

            updateField(
              "subject",
              value,
            )

          }

        />

      </UserFormRow>

    </UserFormCard>

  );

}

function RoleSpecificSection({

  form,

  updateField,

}: SectionProps) {

  if (!form.role) {

    return null;

  }

  return (

    <UserFormCard>

      <UserFormTitle>

        Role Specific Information

      </UserFormTitle>

      {form.role === "teacher" && (

        <UserFormRow>

          <UserTextField

            label="Employee ID"

            value={form.employeeId}

            placeholder="Employee ID"

            onChange={(e) =>

              updateField(
                "employeeId",
                e.target.value,
              )

            }

          />

          <UserTextField

            label="Designation"

            value={form.designation}

            placeholder="Designation"

            onChange={(e) =>

              updateField(
                "designation",
                e.target.value,
              )

            }

          />

        </UserFormRow>

      )}

      {form.role === "parent" && (

        <UserFormRow>

          <UserTextField

            label="Occupation"

            value={form.parentOccupation}

            placeholder="Occupation"

            onChange={(e) =>

              updateField(
                "parentOccupation",
                e.target.value,
              )

            }

          />

          <UserTextField

            label="Relationship"

            value={form.relationship}

            placeholder="Father / Mother / Guardian"

            onChange={(e) =>

              updateField(
                "relationship",
                e.target.value,
              )

            }

          />

        </UserFormRow>

      )}

      {form.role === "partner" && (

        <UserFormRow>

          <UserTextField

            label="Company Name"

            value={form.companyName}

            placeholder="Company Name"

            onChange={(e) =>

              updateField(
                "companyName",
                e.target.value,
              )

            }

          />

          <UserTextField

            label="Partner Category"

            value={form.partnerCategory}

            placeholder="Academy / NGO / Corporate"

            onChange={(e) =>

              updateField(
                "partnerCategory",
                e.target.value,
              )

            }

          />

        </UserFormRow>

      )}

      {(form.role === "platform-admin" ||

        form.role === "foundation-admin") && (

        <UserFormRow>

          <UserTextField

            label="Permission Group"

            value={form.permissionGroup}

            placeholder="Permission Group"

            onChange={(e) =>

              updateField(
                "permissionGroup",
                e.target.value,
              )

            }

          />

        </UserFormRow>

      )}

    </UserFormCard>

  );

}

function NotesSection({

  form,

  updateField,

}: SectionProps) {

  return (

    <UserFormCard>

      <UserFormTitle>

        Notes

      </UserFormTitle>

      <UserTextField

        label="Internal Notes"

        value={form.notes}

        placeholder="Add internal notes for this user..."

        onChange={(e) =>

          updateField(
            "notes",
            e.target.value,
          )

        }

      />

    </UserFormCard>

  );

}
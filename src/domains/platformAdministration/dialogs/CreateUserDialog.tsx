import {
  useEffect,
  useState,
} from "react";

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

interface CreateUserDialogProps {

  open: boolean;

  loading?: boolean;

  onClose: () => void;

  onSave?: (
    form: UserFormData,
  ) => Promise<void> | void;

}

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

const INITIAL_FORM: UserFormData = {

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

export default function CreateUserDialog({

  open,

  loading = false,

  onClose,

  onSave,

}: CreateUserDialogProps) {

  const [
    saving,
    setSaving,
  ] = useState(loading);

  const [
    form,
    setForm,
  ] = useState<UserFormData>(
    INITIAL_FORM,
  );

  useEffect(() => {

    setSaving(loading);

  }, [

    loading,

  ]);

  useEffect(() => {

    if (open) {

      setForm(

        INITIAL_FORM,

      );

    }

  }, [

    open,

  ]);

  if (!open) {

    return null;

  }

  function updateField(

    field: keyof UserFormData,

    value: any,

  ) {

    setForm(previous => ({

      ...previous,

      [field]: value,

    }));

  }

  /* ======================================================
      COMPUTED VALUES
  ====================================================== */

  const dialogTitle =
    "Create User";

  const dialogSubtitle =
    "Create a new platform user.";

  const isFormValid =

    form.firstName.trim() !== "" &&

    form.lastName.trim() !== "" &&

    form.email.trim() !== "" &&

    form.role.trim() !== "" &&

    form.organization.trim() !== "";

  const createButtonDisabled =

    !isFormValid ||

    saving;

  /* ======================================================
      HANDLERS
  ====================================================== */

  async function handleSave() {

    if (

      createButtonDisabled

    ) {

      return;

    }

    try {

      setSaving(true);

      await onSave?.(

        form,

      );

      setForm(

        INITIAL_FORM,

      );

      handleClose();

    }

    catch (error) {

      console.error(

        "Create User Failed",

        error,

      );

    }

    finally {

      setSaving(false);

    }

  }

  function handleClose() {

    if (

      saving

    ) {

      return;

    }

    setForm(

      INITIAL_FORM,

    );

    onClose();

  }

  /* ======================================================

      CREATE USER PIPELINE

      Dialog

          ↓

      UserRegistryViewModel

          ↓

      PlatformAdministrationService

          ↓

      PlatformUserRepository

          ↓

      Supabase

  ====================================================== */

    return (

    <div style={overlayStyle}>

      <div style={dialogStyle}>

        <UserDialogHeader

          title={dialogTitle}

          subtitle={dialogSubtitle}

          onClose={handleClose}

        />

        <UserScrollableContent>

          <UserDialogBody>

            <UserForm>

              <PersonalInformationSection

                form={form}

                saving={saving}

                updateField={updateField}

              />

              <AccountInformationSection

                form={form}

                saving={saving}

                updateField={updateField}

              />

              <FoundationInformationSection

                form={form}

                saving={saving}

                updateField={updateField}

              />

              <RoleSpecificSection

                form={form}

                saving={saving}

                updateField={updateField}

              />

              <NotesSection

                form={form}

                saving={saving}

                updateField={updateField}

              />

            </UserForm>

          </UserDialogBody>

        </UserScrollableContent>

        <UserDialogFooter

          saving={saving}

          saveLabel="Create User"

          saveDisabled={createButtonDisabled}

          onCancel={handleClose}

          onSave={handleSave}

        />

      </div>

    </div>

  );

}

interface SectionProps {

  form: UserFormData;

  saving: boolean;

  updateField: (

    field: keyof UserFormData,

    value: any,

  ) => void;

}

function PersonalInformationSection({

  form,

  saving,

  updateField,

}: SectionProps){

  return (

    <UserFormCard>

      <UserFormTitle>

        Personal Information

      </UserFormTitle>

      <UserAvatarPicker

        onSelect={(file) =>
          updateField("avatar", file)
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

          <option>
            Male
          </option>

          <option>
            Female
          </option>

          <option>
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

  saving,

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
            updateField("role", value)
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

          <option>Active</option>

          <option>Pending</option>

          <option>Suspended</option>

        </UserSelect>

      </UserFormRow>

    </UserFormCard>

  );

}

function FoundationInformationSection({

  form,

  saving,

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

          onChange={(value)=>

            updateField(
              "organization",
              value,
            )
          }

        />

        <FoundationSchoolSelect

          value={form.school}

          onChange={(value)=>

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

          onChange={(value)=>

            updateField(
              "className",
              value,
            )
          }

        />

        <FoundationSectionSelect

          value={form.section}

          onChange={(value)=>

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

          onChange={(value)=>

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

  saving,

  updateField,

}: SectionProps) {

  if (!form.role) return null;

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
            onChange={(e)=>
              updateField("employeeId",e.target.value)
            }
          />

          <UserTextField
            label="Designation"
            value={form.designation}
            onChange={(e)=>
              updateField("designation",e.target.value)
            }
          />

        </UserFormRow>

      )}

      {form.role === "parent" && (

        <UserFormRow>

          <UserTextField
            label="Occupation"
            value={form.parentOccupation}
            onChange={(e)=>
              updateField("parentOccupation",e.target.value)
            }
          />

          <UserTextField
            label="Relationship"
            value={form.relationship}
            onChange={(e)=>
              updateField("relationship",e.target.value)
            }
          />

        </UserFormRow>

      )}

      {form.role === "partner" && (

        <UserFormRow>

          <UserTextField
            label="Company Name"
            value={form.companyName}
            onChange={(e)=>
              updateField("companyName",e.target.value)
            }
          />

          <UserTextField
            label="Partner Category"
            value={form.partnerCategory}
            onChange={(e)=>
              updateField("partnerCategory",e.target.value)
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
            onChange={(e)=>
              updateField("permissionGroup",e.target.value)
            }
          />

        </UserFormRow>

      )}

    </UserFormCard>

  );

}

function NotesSection({

  form,

  saving,

  updateField,

}: SectionProps){

  return (

    <UserFormCard>

      <UserFormTitle>
        Notes
      </UserFormTitle>

      <UserTextField
        label="Internal Notes"
        value={form.notes}
        placeholder="Additional notes..."
        onChange={(e)=>
          updateField("notes",e.target.value)
        }
      />

    </UserFormCard>

  );

}
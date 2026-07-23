import { useEffect, useState } from "react";

import type { TeacherAssignment } from "../types/TeacherAssignment";

interface TeacherAssignmentDialogProps {
  open: boolean;
  assignment?: TeacherAssignment;
  onClose: () => void;
  onSave: (
    assignment: Partial<TeacherAssignment>
  ) => Promise<void>;
}

export default function TeacherAssignmentDialog({
  open,
  assignment,
  onClose,
  onSave,
}: TeacherAssignmentDialogProps) {
  const [teacherUuid, setTeacherUuid] =
    useState("");

  const [schoolUuid, setSchoolUuid] =
    useState("");

  const [className, setClassName] =
    useState("");

  const [sectionName, setSectionName] =
    useState("");

  const [subjectName, setSubjectName] =
    useState("");

  const [academicYear, setAcademicYear] =
    useState("");

  const [isActive, setIsActive] =
    useState(true);

  useEffect(() => {
    if (!assignment) {
      return;
    }

    setTeacherUuid(
      assignment.teacherUuid ?? ""
    );

    setSchoolUuid(
      assignment.schoolUuid ?? ""
    );

    setClassName(
      assignment.className ?? ""
    );

    setSectionName(
      assignment.sectionName ?? ""
    );

    setSubjectName(
      assignment.subjectName ?? ""
    );

    setAcademicYear(
      assignment.academicYear ?? ""
    );

    setIsActive(
      assignment.isActive ?? true
    );
  }, [assignment]);

  if (!open) {
    return null;
  }

const handleSave = async () => {

try{

await onSave({

teacherUuid,
schoolUuid,
className,
sectionName,
subjectName,
academicYear,
isActive,

});

onClose();

}

catch(error:any){

alert(
error.message
);

}

};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-6 text-2xl font-bold">
          Teacher Assignment
        </h2>

        <div className="grid gap-4">
          <input
            value={teacherUuid}
            onChange={(e) =>
              setTeacherUuid(
                e.target.value
              )
            }
            placeholder="Teacher UUID"
            className="rounded-lg border p-3"
          />

          <input
            value={schoolUuid}
            onChange={(e) =>
              setSchoolUuid(
                e.target.value
              )
            }
            placeholder="School UUID"
            className="rounded-lg border p-3"
          />

          <input
            value={className}
            onChange={(e) =>
              setClassName(
                e.target.value
              )
            }
            placeholder="Class Name"
            className="rounded-lg border p-3"
          />

          <input
            value={sectionName}
            onChange={(e) =>
              setSectionName(
                e.target.value
              )
            }
            placeholder="Section Name"
            className="rounded-lg border p-3"
          />

          <input
            value={subjectName}
            onChange={(e) =>
              setSubjectName(
                e.target.value
              )
            }
            placeholder="Subject Name"
            className="rounded-lg border p-3"
          />

          <input
            value={academicYear}
            onChange={(e) =>
              setAcademicYear(
                e.target.value
              )
            }
            placeholder="Academic Year"
            className="rounded-lg border p-3"
          />

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) =>
                setIsActive(
                  e.target.checked
                )
              }
            />

            Active Assignment
          </label>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border px-5 py-2"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white"
          >
            Save Assignment
          </button>
        </div>
      </div>
    </div>
  );
}
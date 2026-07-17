import { useState } from "react";

import TeacherAssignmentDialog from "../dialogs/TeacherAssignmentDialog";

import type { TeacherAssignment } from "../types/TeacherAssignment";

import { useTeacherAssignmentViewModel } from "../viewmodels/TeacherAssignmentViewModel";

export default function TeacherAssignmentsPage() {
  const {
    assignments,
    loading,
    addAssignment,
    editAssignment,
    removeAssignment,
    activateAssignment,
    deactivateAssignment,
  } = useTeacherAssignmentViewModel();

  const [dialogOpen, setDialogOpen] = useState(false);

  const [selectedAssignment, setSelectedAssignment] =
    useState<TeacherAssignment | undefined>();

  const openCreateDialog = () => {
    setSelectedAssignment(undefined);
    setDialogOpen(true);
  };

  const openEditDialog = (
    assignment: TeacherAssignment
  ) => {
    setSelectedAssignment(assignment);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Teacher Assignments
          </h1>

          <p className="mt-1 text-gray-500">
            Manage teacher classroom assignments.
          </p>
        </div>

        <button
          onClick={openCreateDialog}
          className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white"
        >
          + Add Assignment
        </button>
      </div>

      {/* LOADING */}

      {loading && (
        <div>
          Loading assignments...
        </div>
      )}

      {/* EMPTY STATE */}

      {!loading &&
        assignments.length === 0 && (
          <div className="rounded-xl border p-8 text-center text-gray-500">
            No teacher assignments found.
          </div>
        )}

      {/* ASSIGNMENTS */}

      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <div
            key={assignment.id ?? Math.random()}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <div className="space-y-2">
              <h2 className="text-lg font-bold">
                Teacher UUID
              </h2>

              <p>{assignment.teacherUuid}</p>

              <p>
                School : {assignment.schoolUuid}
              </p>

              <p>
                Class : {assignment.className}
              </p>

              <p>
                Section : {assignment.sectionName}
              </p>

              <p>
                Subject : {assignment.subjectName}
              </p>

              <p>
                Academic Year : {assignment.academicYear}
              </p>

              <p>
                Status :{" "}
                {assignment.isActive
                  ? "Active"
                  : "Inactive"}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() =>
                  openEditDialog(assignment)
                }
                className="rounded-lg border px-4 py-2"
              >
                Edit
              </button>

              <button
                onClick={() => {
                  if (!assignment.id) {
                    return;
                  }

                  if (assignment.isActive) {
                    deactivateAssignment(
                      assignment.id
                    );
                  } else {
                    activateAssignment(
                      assignment.id
                    );
                  }
                }}
                className="rounded-lg border px-4 py-2"
              >
                {assignment.isActive
                  ? "Deactivate"
                  : "Activate"}
              </button>

              <button
                onClick={() => {
                  if (!assignment.id) {
                    return;
                  }

                  removeAssignment(
                    assignment.id
                  );
                }}
                className="rounded-lg border border-red-500 px-4 py-2 text-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DIALOG */}

      <TeacherAssignmentDialog
        open={dialogOpen}
        assignment={selectedAssignment}
        onClose={() =>
          setDialogOpen(false)
        }
        onSave={async (
          assignment
        ) => {
          if (
            selectedAssignment &&
            selectedAssignment.id
          ) {
            await editAssignment(
              selectedAssignment.id,
              assignment
            );
          } else {
            await addAssignment(
              assignment
            );
          }

          setDialogOpen(false);
        }}
      />
    </div>
  );
}
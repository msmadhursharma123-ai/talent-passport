import { useEffect, useState } from "react";

import type { TeacherAssignment } from "../types/TeacherAssignment";

import {
  getTeacherAssignments,
  getTeacherAssignmentsByTeacher,
  createTeacherAssignment,
  updateTeacherAssignment,
  deleteTeacherAssignment,
  setAssignmentStatus,
} from "../repository/TeacherAssignmentRepository";



/*
=========================================================
VIEW MODEL
=========================================================
*/

export function useTeacherAssignmentViewModel() {
  const [assignments, setAssignments] = useState<
    TeacherAssignment[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  /*
  =========================================================
  LOAD ALL ASSIGNMENTS
  =========================================================
  */

  const loadAssignments =
    async () => {
      setLoading(true);

      try {
        const data =
          await getTeacherAssignments();

        setAssignments(data);
      } finally {
        setLoading(false);
      }
    };

  /*
  =========================================================
  LOAD BY TEACHER
  =========================================================
  */

  const loadAssignmentsByTeacher =
    async (teacherUuid: string) => {
      setLoading(true);

      try {
        const data =
          await getTeacherAssignmentsByTeacher(
            teacherUuid
          );

        setAssignments(data);
      } finally {
        setLoading(false);
      }
    };

  /*
  =========================================================
  CREATE
  =========================================================
  */

  const addAssignment =
    async (
      assignment: Partial<TeacherAssignment>
    ) => {
      await createTeacherAssignment(
        assignment
      );

      await loadAssignments();
    };

  /*
  =========================================================
  UPDATE
  =========================================================
  */

  const editAssignment =
    async (
      id: string,
      assignment: Partial<TeacherAssignment>
    ) => {
      await updateTeacherAssignment(
        id,
        assignment
      );

      await loadAssignments();
    };

  /*
  =========================================================
  DELETE
  =========================================================
  */

  const removeAssignment =
    async (id: string) => {
      await deleteTeacherAssignment(
        id
      );

      await loadAssignments();
    };

  /*
  =========================================================
  ACTIVATE
  =========================================================
  */

  const activateAssignment =
    async (id: string) => {
      await setAssignmentStatus(
        id,
        true
      );

      await loadAssignments();
    };

  /*
  =========================================================
  DEACTIVATE
  =========================================================
  */

  const deactivateAssignment =
    async (id: string) => {
      await setAssignmentStatus(
        id,
        false
      );

      await loadAssignments();
    };

  /*
  =========================================================
  INITIAL LOAD
  =========================================================
  */

  useEffect(() => {
    loadAssignments();
  }, []);

  return {
    assignments,

    loading,

    loadAssignments,

    loadAssignmentsByTeacher,

    addAssignment,

    editAssignment,

    removeAssignment,

    activateAssignment,

    deactivateAssignment,
  };
}

export async function loadTeacherAssignments(
teacherUuid:string
){

return await
getTeacherAssignmentsByTeacher(
teacherUuid
);

}
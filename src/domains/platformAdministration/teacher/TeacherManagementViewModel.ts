import { useEffect, useState } from "react";
import {
  SchoolRecord,
  SchoolProfileLimits,
  getSchools,
  createSchool,
  updateSchool,
  deactivateSchool
} from "./TeacherManagementRepository";

export default function useTeacherManagementViewModel() {
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadSchools() {
    setLoading(true);
    try {
      setSchools(await getSchools());
    } finally {
      setLoading(false);
    }
  }

  async function addSchool(
    schoolName: string,
    board: string,
    city: string,
    limits: SchoolProfileLimits
  ) {
    const success = await createSchool(schoolName, board, city, limits);
    if (success) await loadSchools();
    return success;
  }

  async function editSchool(
    schoolUuid: string,
    schoolName: string,
    board: string,
    city: string,
    limits: SchoolProfileLimits
  ) {
    const success = await updateSchool(
      schoolUuid, schoolName, board, city, limits
    );
    if (success) await loadSchools();
    return success;
  }

  async function removeSchool(schoolUuid: string) {
    const success = await deactivateSchool(schoolUuid);
    if (success) await loadSchools();
    return success;
  }

  useEffect(() => { void loadSchools(); }, []);

  return {
    schools,
    loading,
    loadSchools,
    addSchool,
    editSchool,
    removeSchool
  };
}

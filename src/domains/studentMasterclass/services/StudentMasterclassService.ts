import { getStudentMasterclassHistory } from "../repository/StudentMasterclassRepository";
import type { StudentMasterclassRecord } from "../types/StudentMasterclassModels";

export async function loadStudentMasterclassHistory(): Promise<StudentMasterclassRecord[]> {
  const result = await getStudentMasterclassHistory();
  return result.rows;
}

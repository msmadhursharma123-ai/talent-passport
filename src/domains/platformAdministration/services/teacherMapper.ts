import { Teacher } from "../types/teacher";
import { mapPlatformUser } from "./platformUserMapper";

export function mapTeacher(
  row: any,
): Teacher {

  return {

    ...mapPlatformUser(row),

    employeeCode: row.employee_code,

    subjectIds: row.subject_ids ?? [],

    classIds: row.class_ids ?? [],

    sectionIds: row.section_ids ?? [],

  };

}
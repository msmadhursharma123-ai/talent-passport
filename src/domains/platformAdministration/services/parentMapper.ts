import { Parent } from "../types/parent";
import { mapPlatformUser } from "./platformUserMapper";

export function mapParent(
  row: any,
): Parent {

  return {

    ...mapPlatformUser(row),

    studentIds: row.student_ids ?? [],

  };

}
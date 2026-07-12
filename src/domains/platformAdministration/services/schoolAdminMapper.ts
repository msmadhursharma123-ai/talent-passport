import { SchoolAdmin } from "../types/schoolAdmin";
import { mapPlatformUser } from "./platformUserMapper";

export function mapSchoolAdmin(
  row: any,
): SchoolAdmin {

  return {

    ...mapPlatformUser(row),

    designation: row.designation,

  };

}
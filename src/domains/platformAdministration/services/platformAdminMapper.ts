import { PlatformAdmin } from "../types/platformAdmin";
import { mapPlatformUser } from "./platformUserMapper";

export function mapPlatformAdmin(
  row: any,
): PlatformAdmin {

  return {

    ...mapPlatformUser(row),

    permissions: row.permissions ?? [],

  };

}
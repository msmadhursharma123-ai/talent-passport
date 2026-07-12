import { Partner } from "../types/partner";
import { mapPlatformUser } from "./platformUserMapper";

export function mapPartner(
  row: any,
): Partner {

  return {

    ...mapPlatformUser(row),

    specialization: row.specialization,

  };

}
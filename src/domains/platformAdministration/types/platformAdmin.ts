import { PlatformUser } from "./platformUser";

export interface PlatformAdmin
  extends PlatformUser {

  permissions: string[];

}
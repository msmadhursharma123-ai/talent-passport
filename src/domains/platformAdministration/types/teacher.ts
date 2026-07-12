import { PlatformUser } from "./platformUser";

export interface Teacher
  extends PlatformUser {

  employeeCode?: string;

  subjectIds: string[];

  classIds: string[];

  sectionIds: string[];

}
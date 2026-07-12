import { SchoolAdminRepository } from "../repository/SchoolAdminRepository";

export const SchoolAdminViewModel = {

  async loadSchoolAdmins() {
    return SchoolAdminRepository.getAll();
  },

};
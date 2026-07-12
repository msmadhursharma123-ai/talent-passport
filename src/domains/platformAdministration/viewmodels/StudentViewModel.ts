import { StudentRepository } from "../repository/StudentRepository";

export const StudentViewModel = {

  async loadStudents() {
    return StudentRepository.getAll();
  },

};
import { TeacherRepository } from "../repository/TeacherRepository";

export const TeacherViewModel = {

  async loadTeachers() {
    return TeacherRepository.getAll();
  },

};
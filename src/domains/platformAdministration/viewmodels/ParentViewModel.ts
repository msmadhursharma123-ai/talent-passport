import { ParentRepository } from "../repository/ParentRepository";

export const ParentViewModel = {

  async loadParents() {
    return ParentRepository.getAll();
  },

};
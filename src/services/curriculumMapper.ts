import type { Curriculum } from "../types/curriculum";

/* ============================================================
   DATABASE → DOMAIN
============================================================ */

export function mapCurriculumFromDatabase(
  row: any
): Curriculum {
  return {
    id: row.id,

    organizationId:
      row.organization_id,

organizationName:
  row.organizations_master
    ?.organization_name ??
  "",

    curriculumCode:
      row.curriculum_code,

    curriculumName:
      row.curriculum_name,

    description:
      row.description,

    displayOrder:
      row.display_order,

    isActive:
      row.is_active,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}

/* ============================================================
   DOMAIN → DATABASE
============================================================ */

export function mapCurriculumToDatabase(
  curriculum: Partial<Curriculum>
) {
  return {
    id: curriculum.id,

    organization_id:
      curriculum.organizationId,



    curriculum_code:
      curriculum.curriculumCode,

    curriculum_name:
      curriculum.curriculumName,

    description:
      curriculum.description,

    display_order:
      curriculum.displayOrder,

    is_active:
      curriculum.isActive,
  };
}
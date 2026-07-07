import type { Class } from "../types/class";

/* ============================================================
   DATABASE → UI
============================================================ */

export function mapClassFromDatabase(
  row: any
): Class {
  return {
    id: row.id,

    organizationId: row.organization_id,

    organizationName:
      row.organizations_master
        ?.organization_name ?? "",

    curriculumId: row.curriculum_id,

    curriculumName:
      row.curriculum_master
        ?.curriculum_name ?? "",

    classCode: row.class_code,

    className: row.class_name,

    displayOrder:
      row.display_order ?? 1,

    isActive:
      row.is_active ?? true,

    createdBy: row.created_by,

    updatedBy: row.updated_by,

    createdAt: row.created_at,

    updatedAt: row.updated_at,
  };
}

/* ============================================================
   UI → DATABASE
============================================================ */

export function mapClassToDatabase(
  item: Partial<Class>
) {
  return {
    id: item.id,

    organization_id:
      item.organizationId,

    curriculum_id:
      item.curriculumId,

    class_code:
      item.classCode,

    class_name:
      item.className,

    display_order:
      item.displayOrder,

    is_active:
      item.isActive,

    created_by:
      item.createdBy,

    updated_by:
      item.updatedBy,
  };
}
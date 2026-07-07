import type { Section } from "../types/section";

/* ============================================================
   DATABASE → DOMAIN
============================================================ */

export function mapSectionFromDatabase(
  row: any
): Section {
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

    classId: row.class_id,

    className:
      row.classes_master
        ?.class_name ?? "",

    sectionCode:
      row.section_code,

    sectionName:
      row.section_name,

    displayOrder:
      row.display_order ?? 1,

    isActive:
      row.is_active ?? true,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}

/* ============================================================
   DOMAIN → DATABASE
============================================================ */

export function mapSectionToDatabase(
  section: Partial<Section>
) {
  return {
    id: section.id,

    organization_id:
      section.organizationId,

    curriculum_id:
      section.curriculumId,

    class_id:
      section.classId,

    section_code:
      section.sectionCode,

    section_name:
      section.sectionName,

    display_order:
      section.displayOrder,

    is_active:
      section.isActive,
  };
}
import type { AcademicYear } from "../types/academicYear";

/* ============================================================
   DATABASE → DOMAIN
============================================================ */

export function mapAcademicYearFromDatabase(
  row: any
): AcademicYear {
  return {
  id: row.id,

  organizationId:
    row.organization_id,

  academicYearCode:
    row.academic_year_code,

  academicYearName:
    row.academic_year_name,

  startDate:
    row.start_date,

  endDate:
    row.end_date,

  isCurrent:
    row.is_current,

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

export function mapAcademicYearToDatabase(
  academicYear: Partial<AcademicYear>
) {
const payload: any = {
  organization_id:
    academicYear.organizationId,

  academic_year_code:
    academicYear.academicYearCode,

  academic_year_name:
    academicYear.academicYearName,

  start_date:
    academicYear.startDate,

  end_date:
    academicYear.endDate,

  is_current:
    academicYear.isCurrent,

  display_order:
    academicYear.displayOrder,

  is_active:
    academicYear.isActive,
};

  if (academicYear.id) {
    payload.id = academicYear.id;
  }

  return payload;
}
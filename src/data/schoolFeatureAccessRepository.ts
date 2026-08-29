import { getSupabaseClient } from "../supabaseClient";

export type PortalRole = "student" | "teacher";

export const STUDENT_FEATURES = [
  { key: "dna-radar", label: "User DNA Radar" },
  { key: "homeboard", label: "Home Board" },
  { key: "timeline", label: "Timeline" },
  { key: "portfolio", label: "Portfolio" },
  { key: "competitions", label: "Competitions" },
  { key: "opportunities", label: "Opportunities" },
  { key: "mauke-pe-chauka", label: "Mauke Pe Chauka" },
  { key: "my-analysis", label: "My Analysis" },
  { key: "growth-plan", label: "Growth Plan" },
] as const;

export const TEACHER_FEATURES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "daily-log", label: "Daily Log" },
  { key: "teaching-journal", label: "Teaching Journal" },
  { key: "my-classroom", label: "My Classroom" },
  { key: "exam-preparation", label: "Exam Prep" },

  // Existing Teacher Portal planner modules.
  // Kept here so the same repository remains the single source of truth
  // for Teacher Registry access control.
  { key: "planners", label: "Planners" },
  { key: "unit-test-planner", label: "Unit Test" },
  { key: "exam-paper-planner", label: "Exam Paper" },
  { key: "worksheet-maker", label: "Worksheet" },
  { key: "parents-teacher-meeting", label: "PTM" },
] as const;

type FeatureDefinition =
  | (typeof STUDENT_FEATURES)[number]
  | (typeof TEACHER_FEATURES)[number];

/*
 * SINGLE SOURCE OF TRUTH FOR SCHOOL PORTAL ACCESS
 *
 * The same definitions are consumed by:
 *   1. Teacher Registry (checkboxes + save payload)
 *   2. Student Portal (navigation + active page guard)
 *   3. Teacher Portal (navigation + active page guard)
 *
 * Keep Student and Teacher namespaces completely independent.
 */
const FEATURE_DEFINITIONS: Record<PortalRole, readonly FeatureDefinition[]> = {
  student: STUDENT_FEATURES,
  teacher: TEACHER_FEATURES,
};

function defaultsFor(role: PortalRole): string[] {
  return FEATURE_DEFINITIONS[role].map((feature) => feature.key);
}

function validKeysFor(role: PortalRole): Set<string> {
  return new Set(defaultsFor(role));
}

function normalizeRequestedKeys(
  role: PortalRole,
  keys: string[] | null | undefined
): string[] {
  const valid = validKeysFor(role);

  return Array.from(
    new Set(
      (Array.isArray(keys) ? keys : [])
        .map((key) => String(key ?? "").trim())
        .filter((key) => valid.has(key))
    )
  );
}

/**
 * Read one portal's configuration.
 *
 * IMPORTANT:
 * Student and Teacher features are completely independent.
 * Never filter a Student query against TEACHER_FEATURES (or vice versa).
 *
 * Legacy safety:
 * - no rows for this school + role => all features enabled
 * - query/RLS/network failure => all features enabled
 * - partial legacy configuration => missing feature rows remain enabled
 *
 * Once saveSchoolFeatures() has written the complete configuration,
 * every feature has an explicit enabled true/false value and therefore
 * the school's selections are enforced exactly.
 */
export async function getSchoolFeatureKeys(
  schoolUuid: string,
  role: PortalRole
): Promise<string[]> {
  const defaults = defaultsFor(role);
  const normalizedSchoolUuid = String(schoolUuid ?? "").trim();

  const supabase = getSupabaseClient();

  if (!supabase || !normalizedSchoolUuid) {
    return defaults;
  }

  const { data, error } = await (supabase as any)
    .from("school_portal_features")
    .select("feature_key,enabled")
    .eq("school_uuid", normalizedSchoolUuid)
    .eq("portal_role", role);

  if (error) {
    console.error("Unable to load school portal configuration.", {
      schoolUuid: normalizedSchoolUuid,
      portalRole: role,
      error,
    });

    // Never destroy access to an existing portal because configuration
    // lookup temporarily fails.
    return defaults;
  }

  if (!Array.isArray(data) || data.length === 0) {
    // Existing/legacy school with no configuration rows.
    return defaults;
  }

  const validKeys = validKeysFor(role);
  const configured = new Map<string, boolean>();

  for (const row of data) {
    const featureKey = String(row?.feature_key ?? "").trim();

    // Ignore rows belonging to another/unknown feature rather than
    // allowing arbitrary database values into portal navigation.
    if (!validKeys.has(featureKey)) continue;

    configured.set(featureKey, Boolean(row?.enabled));
  }

  // IMPORTANT:
  // Build the result from the role's feature definition, not from the
  // database row order. This guarantees:
  //   Student -> STUDENT_FEATURES
  //   Teacher -> TEACHER_FEATURES
  //
  // Missing rows are treated as enabled for legacy/backward compatibility.
  return FEATURE_DEFINITIONS[role]
    .filter((feature) => configured.get(feature.key) ?? true)
    .map((feature) => feature.key);
}

/**
 * Read both portal configurations in one query.
 *
 * This follows the same role-specific rules as getSchoolFeatureKeys().
 * A school can have a complete Student configuration and no Teacher
 * configuration (or the reverse) without either portal becoming blank.
 */
export async function getSchoolFeatureConfiguration(schoolUuid: string) {
  const normalizedSchoolUuid = String(schoolUuid ?? "").trim();

  const defaults = {
    student: defaultsFor("student"),
    teacher: defaultsFor("teacher"),
  };

  const supabase = getSupabaseClient();

  if (!supabase || !normalizedSchoolUuid) {
    return defaults;
  }

  const { data, error } = await (supabase as any)
    .from("school_portal_features")
    .select("portal_role,feature_key,enabled")
    .eq("school_uuid", normalizedSchoolUuid);

  if (error) {
    console.error("Unable to load school portal configuration.", {
      schoolUuid: normalizedSchoolUuid,
      error,
    });

    return defaults;
  }

  if (!Array.isArray(data) || data.length === 0) {
    return defaults;
  }

  const result: Record<PortalRole, string[]> = {
    student: [],
    teacher: [],
  };

  for (const role of ["student", "teacher"] as const) {
    const validKeys = validKeysFor(role);
    const configured = new Map<string, boolean>();

    for (const row of data) {
      if (row?.portal_role !== role) continue;

      const featureKey = String(row?.feature_key ?? "").trim();

      if (!validKeys.has(featureKey)) continue;

      configured.set(featureKey, Boolean(row?.enabled));
    }

    result[role] = FEATURE_DEFINITIONS[role]
      .filter((feature) => configured.get(feature.key) ?? true)
      .map((feature) => feature.key);
  }

  return result;
}

/**
 * Platform Admin only: save the COMPLETE configuration for a school.
 *
 * The repository deliberately writes one explicit row for every known
 * Student and Teacher feature. Therefore an unchecked feature is stored
 * as enabled=false and cannot accidentally fall back to "missing = enabled"
 * after a successful save.
 */
export async function saveSchoolFeatures(
  schoolUuid: string,
  studentKeys: string[],
  teacherKeys: string[]
): Promise<boolean> {
  const normalizedSchoolUuid = String(schoolUuid ?? "").trim();

  const supabase = getSupabaseClient();

  if (!supabase || !normalizedSchoolUuid) {
    console.error("Unable to save school portal configuration: missing client or school UUID.");
    return false;
  }

  const normalizedStudentKeys = normalizeRequestedKeys(
    "student",
    studentKeys
  );

  const normalizedTeacherKeys = normalizeRequestedKeys(
    "teacher",
    teacherKeys
  );

  const studentKeySet = new Set(normalizedStudentKeys);
  const teacherKeySet = new Set(normalizedTeacherKeys);

  const updatedAt = new Date().toISOString();

  const rows = [
    ...STUDENT_FEATURES.map((feature) => ({
      school_uuid: normalizedSchoolUuid,
      portal_role: "student",
      feature_key: feature.key,
      enabled: studentKeySet.has(feature.key),
      updated_at: updatedAt,
    })),

    ...TEACHER_FEATURES.map((feature) => ({
      school_uuid: normalizedSchoolUuid,
      portal_role: "teacher",
      feature_key: feature.key,
      enabled: teacherKeySet.has(feature.key),
      updated_at: updatedAt,
    })),
  ];

  const { error } = await (supabase as any)
    .from("school_portal_features")
    .upsert(rows, {
      onConflict: "school_uuid,portal_role,feature_key",
    });

  if (error) {
    console.error("Unable to save school portal configuration.", {
      schoolUuid: normalizedSchoolUuid,
      error,
    });

    return false;
  }

  return true;
}

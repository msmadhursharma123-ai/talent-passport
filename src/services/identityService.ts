/* ============================================================
   TALENT PASSPORT IDENTITY SERVICE V2

   Central Identity Kernel
   ------------------------------------------------------------
   Single Source of Truth for every student identity.

   Responsibilities
   ----------------
   • Student Identity
   • Identity Cache
   • Identity Resolution
   • Identity Mapping
   • Session Storage
   • Future Identity Expansion

   Every repository must consume this service.
============================================================ */

export interface StudentIdentity {

  /* ========================================================
     Authentication
  ======================================================== */

  authUserId?: string;

  email?: string;

  /* ========================================================
     STUDENT DOMAIN
  ======================================================== */

  studentUuid: string;

  masterStudentId: string;

  studentCode: string;

  studentName: string;

  schoolName?: string;

  schoolUuid?: string;

  className?: string;

  section?: string;

  parentEmail?: string;

  parentPhone?: string;

  /* ========================================================
     PARTNER DOMAIN
     (Future Partner Authentication)
  ======================================================== */

  partnerId?: string;

  partnerCode?: string;

  partnerName?: string;

  partnerEmail?: string;

  partnerPhone?: string;

  partnerCategory?: string;

  partnerOrganization?: string;

  /* ========================================================
     SCHOOL DOMAIN
     (Future School Login)
  ======================================================== */

  schoolId?: string;

  schoolCode?: string;

  schoolAdminId?: string;

  /* ========================================================
     PASSPORT / WALLET
  ======================================================== */

  walletId?: string;

  passportId?: string;

  /* ========================================================
     AUTHORIZATION
  ======================================================== */

  role?: string;

  permissions?: string[];

  /* ========================================================
     EXTENSIBILITY
  ======================================================== */

  metadata?: Record<string, unknown>;

}

/* ============================================================
   TEACHER IDENTITY

   Dedicated identity model for Teacher Portal.

   Managed by the central Identity Service.
============================================================ */

export interface TeacherIdentity {

  /* ========================================================
     AUTHENTICATION
  ======================================================== */

  authUserId?: string;

  email?: string;

  /* ========================================================
     TEACHER DOMAIN
  ======================================================== */

  teacherUuid: string;

  teacherId: string;

  teacherName: string;

  phone?: string;

  organizationUuid?: string;

  organizationName?: string;

  schoolUuid?: string;

  schoolName?: string;

  boardUuid?: string;

  department?: string;

  designation?: string;

  profileCompleted?: boolean;

  isActive?: boolean;

  /* ========================================================
     AUTHORIZATION
  ======================================================== */

  role?: string;

  permissions?: string[];

  /* ========================================================
     EXTENSIBILITY
  ======================================================== */

  metadata?: Record<string, unknown>;

}

/* ============================================================
   SCHOOL IDENTITY

   Dedicated identity model for School Portal.

   Managed by the central Identity Service.
============================================================ */

export interface SchoolIdentity {

  /* ========================================================
     AUTHENTICATION
  ======================================================== */

  authUserId?: string;

  email?: string;

  /* ========================================================
     SCHOOL DOMAIN
  ======================================================== */

  schoolUuid: string;

  schoolId: string;

  schoolName: string;

  organizationUuid?: string;

  organizationName?: string;

  boardUuid?: string;

  principalName?: string;

  isActive?: boolean;

  /* ========================================================
     AUTHORIZATION
  ======================================================== */

  role?: string;

  permissions?: string[];

  /* ========================================================
     EXTENSIBILITY
  ======================================================== */

  metadata?: Record<string, unknown>;

}

/* ============================================================
   PARTNER IDENTITY

   Dedicated identity model for Partner Portal.

   This intentionally remains separate from StudentIdentity
   while being managed by the same Identity Service.
============================================================ */

export interface PartnerIdentity {

  /* ========================================================
     AUTHENTICATION
  ======================================================== */

  authUserId?: string;

  /* ========================================================
     PARTNER DOMAIN
  ======================================================== */

  partnerId: string;

partnerUuid: string;

  partnerCode?: string;

  partnerName: string;

  email?: string;

  phone?: string;

  category?: string;

  organization?: string;

  specialization?: string[];

  consultationServices?: string[];

  instituteArea?: string;

  preferredAgeFrom?: number;

  preferredAgeTo?: number;

  /* ========================================================
     AUTHORIZATION
  ======================================================== */

  role?: string;

  permissions?: string[];

  /* ========================================================
     EXTENSIBILITY
  ======================================================== */

  metadata?: Record<string, unknown>;

}

/* ============================================================
   Admin IDENTITY

   Dedicated identity model for Admin Portal.

   This intentionally remains separate from StudentIdentity and PartnerIdentity
   while being managed by the same Identity Service.
============================================================ */

export interface AdminIdentity {

    authUserId?: string;

    adminId: string;

    adminName: string;

    email?: string;

    phone?: string;

    role?: string;

    permissions?: string[];

}

/* ============================================================
   STORAGE
============================================================ */

/*
|--------------------------------------------------------------------------
| Student Identity Storage
|--------------------------------------------------------------------------
|
| Existing storage key used throughout the Student Portal.
| DO NOT change this key to preserve backward compatibility.
|
*/

const STUDENT_STORAGE_KEY = "studentProfile";

const TEACHER_STORAGE_KEY = "teacherProfile";

const SCHOOL_STORAGE_KEY = "schoolProfile";

/*
|--------------------------------------------------------------------------
| Partner Identity Storage
|--------------------------------------------------------------------------
|
| Dedicated storage for Partner Portal.
| Keeps Partner authentication isolated while remaining under the
| central IdentityService.
|
*/

const PARTNER_STORAGE_KEY = "partnerProfile";

/* ============================================================
   MEMORY CACHE

   Prevent repeated JSON.parse() calls throughout the app.

   Student and Partner identities maintain separate caches
   while remaining under the same IdentityService.
============================================================ */

/*
|--------------------------------------------------------------------------
| Student Identity Cache
|--------------------------------------------------------------------------
|
| Existing cache used throughout the Student Portal.
| DO NOT rename or remove.
|
*/

let identityCache: StudentIdentity | null = null;

let teacherIdentityCache: TeacherIdentity | null = null;

let schoolIdentityCache: SchoolIdentity | null = null;

/*
|--------------------------------------------------------------------------
| Partner Identity Cache
|--------------------------------------------------------------------------
|
| Dedicated cache for Partner Portal.
| Prevents repeated localStorage reads after Partner login.
|
*/

let partnerIdentityCache: PartnerIdentity | null = null;

/*
|--------------------------------------------------------------------------
| Authentication Session
|--------------------------------------------------------------------------
|
| This flag will be controlled by the upcoming AuthenticationService.
| IdentityService does not authenticate users; it only tracks whether
| an authenticated session has been initialized.
|
*/

let authSessionInitialized = false;

/* ============================================================
   MODULE → IDENTITY MAP

   Every repository asks for a module.

   Identity Service decides which identifier to return.

   This becomes the ONLY place where ID mappings exist.
============================================================ */

export const IDENTITY_MAP = {

  /* Student */

  student: "studentUuid",

  profile: "studentUuid",

  timeline: "studentUuid",

  portfolio: "studentUuid",

  wallet: "studentUuid",

  credits: "studentUuid",

  marketplace: "studentUuid",

  consultation: "studentUuid",

  opportunities: "studentUuid",

  dna: "studentUuid",

  growth: "studentUuid",

  /* Competition */

  competition: "studentCode",

  submissions: "studentCode",

  evaluations: "studentCode",

  leaderboard: "studentCode",

  passport: "studentCode",

  /* Analytics */

  analytics: "masterStudentId",

  admin: "masterStudentId",

  master: "masterStudentId",

/* ========================================================
   Teacher Modules
======================================================== */

teacher: "teacherUuid",

teacherProfile: "teacherUuid",

teacherAssignment: "teacherUuid",

teacherDashboard: "teacherUuid",


/* ========================================================
   School Modules
======================================================== */

school: "schoolUuid",

schoolDashboard: "schoolUuid",

teacherManagement: "schoolUuid",

studentManagement: "schoolUuid",

schoolAnalytics: "schoolUuid",

schoolSettings: "schoolUuid",

} as const;

/* ============================================================
   DATABASE TABLE → IDENTITY MAP

   Repositories query tables.

   This map decides which identity each table uses.

============================================================ */

export const TABLE_ID_MAP = {

  /* Core */

  students: "studentUuid",

  students_master: "masterStudentId",

  /* Student Modules */

  student_projects: "studentUuid",

  student_skills: "studentUuid",

  student_performances: "studentUuid",

  student_timeline_achievements: "studentUuid",

  student_assessments: "studentUuid",

  student_dna_profiles: "studentUuid",

  talent_passports_v2: "studentUuid",

  performance_otps: "studentUuid",

  /* Wallet */

  student_wallets: "studentUuid",

  wallet_transactions: "studentUuid",

  credit_transactions: "studentUuid",

  consultation_requests: "studentUuid",

  /* Marketplace */

  marketplace_orders: "studentUuid",

  marketplace_cart: "studentUuid",

  marketplace_reviews: "studentUuid",

  /* ========================================================
   PARTNER MARKETPLACE
======================================================== */

partner_scholarship_offers: "studentUuid",

partner_workshop_offers: "studentUuid",

partner_contact_requests: "studentUuid",

partner_incoming_requests: "studentUuid",

student_marketplace_activity: "studentUuid",

/* ========================================================
   PARTNER DOMAIN
======================================================== */

partner_profiles: "partnerId",

partner_student_leads: "partnerId",

partner_lead_activity: "partnerId",

partner_notifications: "partnerId",

partner_inbox: "partnerId",

partner_workshop_registrations: "partnerId",

partner_scholarship_applications: "partnerId",

  /* Passport */

  talent_passport_scores: "studentCode",

  submissions: "studentCode",

  evaluations: "studentCode",

  leaderboard: "studentCode",

  /* Analytics */

  analytics: "masterStudentId",

/* ========================================================
   Teacher Domain
======================================================== */

teachers_master: "teacherUuid",

teacher_profiles: "teacherUuid",

teacher_assignments: "teacherUuid",


/* ========================================================
   School Domain
======================================================== */

schools_master: "schoolUuid",

school_admins: "schoolUuid",
  
} as const;

export type IdentityTable =
keyof typeof TABLE_ID_MAP;

/* ============================================================
   TYPES
============================================================ */

export type IdentityModule = keyof typeof IDENTITY_MAP;

export type IdentityField = typeof IDENTITY_MAP[IdentityModule];

/* ============================================================
   SAVE IDENTITY
============================================================ */

export function saveStudentIdentity(
  identity: StudentIdentity
): void {

  const normalized = buildIdentity(identity);

  identityCache = normalized;

  localStorage.setItem(
    STUDENT_STORAGE_KEY,
    JSON.stringify(normalized)
  );

  if (import.meta.env.DEV) {

    console.groupCollapsed(
      "Identity Saved"
    );

    console.table({
      authUserId: normalized.authUserId,
      studentUuid: normalized.studentUuid,
      masterStudentId: normalized.masterStudentId,
      studentCode: normalized.studentCode,
      studentName: normalized.studentName
    });

    console.groupEnd();

  }

}

/* ============================================================
   SAVE TEACHER IDENTITY
============================================================ */

export function saveTeacherIdentity(
  identity: TeacherIdentity
): void {

  const normalized = buildTeacherIdentity(identity);

  teacherIdentityCache = normalized;

  localStorage.setItem(
    TEACHER_STORAGE_KEY,
    JSON.stringify(normalized)
  );

  if (import.meta.env.DEV) {

    console.groupCollapsed(
      "Teacher Identity Saved"
    );

    console.table({
      authUserId: normalized.authUserId,
      teacherUuid: normalized.teacherUuid,
      teacherId: normalized.teacherId,
      teacherName: normalized.teacherName,
      schoolUuid: normalized.schoolUuid
    });

    console.groupEnd();

  }

}

/* ============================================================
   SAVE SCHOOL IDENTITY
============================================================ */

export function saveSchoolIdentity(
  identity: SchoolIdentity
): void {

  const normalized =
    buildSchoolIdentity(identity);

  schoolIdentityCache =
    normalized;

  localStorage.setItem(
    SCHOOL_STORAGE_KEY,
    JSON.stringify(normalized)
  );

  if (import.meta.env.DEV) {

    console.groupCollapsed(
      "School Identity Saved"
    );

    console.table({

      authUserId:
        normalized.authUserId,

      schoolUuid:
        normalized.schoolUuid,

      schoolId:
        normalized.schoolId,

      schoolName:
        normalized.schoolName

    });

    console.groupEnd();

  }

}

/* ============================================================
   SAVE PARTNER IDENTITY
============================================================ */

export function savePartnerIdentity(
  identity: PartnerIdentity
): void {

  partnerIdentityCache = identity;

  localStorage.setItem(
    PARTNER_STORAGE_KEY,
    JSON.stringify(identity)
  );

}


/* ============================================================
   SAVE ADMIN IDENTITY
============================================================ */

const ADMIN_STORAGE_KEY = "adminProfile";

let adminIdentityCache: AdminIdentity | null = null;

export function saveAdminIdentity(
    identity: AdminIdentity
) {

    adminIdentityCache = identity;

    localStorage.setItem(
        ADMIN_STORAGE_KEY,
        JSON.stringify(identity)
    );

}

/* ============================================================
   GET CURRENT IDENTITY

   Loads from memory first.

   Falls back to localStorage.

============================================================ */

export function getCurrentStudent():
StudentIdentity | null {

  if (
    identityCache &&
    validateIdentity(identityCache)
  ) {

    return identityCache;

  }

  const raw =
    localStorage.getItem(
      STUDENT_STORAGE_KEY
    );

  if (!raw) {

    return null;

  }

  try {

    const parsed =
      buildIdentity(
        JSON.parse(raw)
      );

    if (
      !validateIdentity(parsed)
    ) {

      return null;

    }

    identityCache = parsed;

    return parsed;

  }

  catch {

    return null;

  }

}


/* ============================================================
   GET CURRENT TEACHER
============================================================ */

export function getCurrentTeacher():
TeacherIdentity | null {

  if (teacherIdentityCache) {

    return teacherIdentityCache;

  }

  const raw =
    localStorage.getItem(
      TEACHER_STORAGE_KEY
    );

  if (!raw) {

    return null;

  }

  try {

    const parsed =
      buildTeacherIdentity(
        JSON.parse(raw)
      );

    teacherIdentityCache = parsed;

    return parsed;

  }

  catch {

    return null;

  }

}

/* ============================================================
   GET CURRENT SCHOOL
============================================================ */

export function getCurrentSchool():
SchoolIdentity | null {

  if (schoolIdentityCache) {

    return schoolIdentityCache;

  }

  const raw =
    localStorage.getItem(
      SCHOOL_STORAGE_KEY
    );

  if (!raw) {

    return null;

  }

  try {

    const parsed =
      buildSchoolIdentity(
        JSON.parse(raw)
      );

    schoolIdentityCache = parsed;

    return parsed;

  }

  catch {

    return null;

  }

}

/* ============================================================
   GET CURRENT PARTNER

   Loads from memory first.

   Falls back to localStorage.
============================================================ */

export function getCurrentPartner():
  PartnerIdentity | null {

  if (partnerIdentityCache) {
    return partnerIdentityCache;
  }

  const raw =
    localStorage.getItem(
      PARTNER_STORAGE_KEY
    );

  if (!raw) {
    return null;
  }

  try {

    const parsed: PartnerIdentity =
      JSON.parse(raw);

    partnerIdentityCache = parsed;

    return parsed;

  } catch {

    return null;

  }

}

/* ============================================================
   GET CURRENT ADMIN

   Loads from memory first.

   Falls back to localStorage.
============================================================ */

export function getCurrentAdmin():

AdminIdentity | null {

    if (adminIdentityCache)
        return adminIdentityCache;

    const raw =
        localStorage.getItem(
            ADMIN_STORAGE_KEY
        );

    if (!raw)
        return null;

    const parsed =
        JSON.parse(raw);

    adminIdentityCache =
        parsed;

    return parsed;

}

/* ============================================================
   ALIAS

   Cleaner name for future repositories.
============================================================ */

export function getIdentity():
  StudentIdentity | null {

  return getCurrentStudent();

}

/* ============================================================
   REQUIRE IDENTITY

   Throws immediately if no identity exists.
============================================================ */

export function requireIdentity():
StudentIdentity {

  const identity =
    getCurrentStudent();

  if (identity) {

    return identity;

  }

  throw new Error(
    "Student identity not initialized."
  );

}

/* ============================================================
   REQUIRE TEACHER IDENTITY
============================================================ */

export function requireTeacherIdentity():
TeacherIdentity {

  const identity =
    getCurrentTeacher();

  if (identity) {

    return identity;

  }

  throw new Error(
    "Teacher identity not initialized."
  );

}

/* ============================================================
   REQUIRE SCHOOL IDENTITY
============================================================ */

export function requireSchoolIdentity():
SchoolIdentity {

  const identity =
    getCurrentSchool();

  if (identity) {

    return identity;

  }

  throw new Error(
    "School identity not initialized."
  );

}

/* ============================================================
   REQUIRE PARTNER IDENTITY

   Throws immediately if no Partner identity exists.
============================================================ */

export function requirePartnerIdentity():
  PartnerIdentity {

  const identity =
    getCurrentPartner();

  if (!identity) {

    throw new Error(
      "Partner identity not found."
    );

  }

  return identity;

}

/* ============================================================
   HAS IDENTITY
============================================================ */

export function hasIdentity(): boolean {

  return getCurrentStudent() !== null;

}

/* ============================================================
   HAS TEACHER IDENTITY
============================================================ */

export function hasTeacherIdentity(): boolean {

  return getCurrentTeacher() !== null;

}

/* ============================================================
   HAS SCHOOL IDENTITY
============================================================ */

export function hasSchoolIdentity(): boolean {

  return getCurrentSchool() !== null;

}

/* ============================================================
   HAS PARTNER IDENTITY
============================================================ */

export function hasPartnerIdentity(): boolean {

  return getCurrentPartner() !== null;

}

/* ============================================================
   AUTHENTICATION SESSION
============================================================ */

export function hasAuthSession(): boolean {

  return authSessionInitialized;

}

export function markAuthSessionInitialized(): void {

  authSessionInitialized = true;

}

export function clearAuthSession(): void {

  authSessionInitialized = false;

}

/* ============================================================
   UPDATE IDENTITY
============================================================ */

export function updateStudentIdentity(
  updates: Partial<StudentIdentity>
): void {

  const current = requireIdentity();

  saveStudentIdentity({

    ...current,

    ...updates

  });

}

/* ============================================================
   UPDATE TEACHER IDENTITY
============================================================ */

export function updateTeacherIdentity(
  updates: Partial<TeacherIdentity>
): void {

  const current =
    requireTeacherIdentity();

  saveTeacherIdentity({

    ...current,

    ...updates

  });

}

/* ============================================================
   UPDATE SCHOOL IDENTITY
============================================================ */

export function updateSchoolIdentity(
  updates: Partial<SchoolIdentity>
): void {

  const current =
    requireSchoolIdentity();

  saveSchoolIdentity({

    ...current,

    ...updates

  });

}

/* ============================================================
   UPDATE PARTNER IDENTITY
============================================================ */

export function updatePartnerIdentity(
  updates: Partial<PartnerIdentity>
): void {

  const current =
    requirePartnerIdentity();

  savePartnerIdentity({

    ...current,

    ...updates

  });

}

/* ============================================================
   CLEAR IDENTITY
============================================================ */

export function clearStudentIdentity(): void {

  identityCache = null;

  localStorage.removeItem(
    STUDENT_STORAGE_KEY
  );

}

/* ============================================================
   CLEAR TEACHER IDENTITY
============================================================ */

export function clearTeacherIdentity(): void {

  teacherIdentityCache = null;

  localStorage.removeItem(
    TEACHER_STORAGE_KEY
  );

}

/* ============================================================
   CLEAR SCHOOL IDENTITY
============================================================ */

export function clearSchoolIdentity(): void {

  schoolIdentityCache = null;

  localStorage.removeItem(
    SCHOOL_STORAGE_KEY
  );

}

/* ============================================================
   CLEAR PARTNER IDENTITY
============================================================ */

export function clearPartnerIdentity(): void {

  partnerIdentityCache = null;

  localStorage.removeItem(
    PARTNER_STORAGE_KEY
  );

  clearAuthSession();

}

/* ============================================================
   CLEAR ADMIN IDENTITY
============================================================ */

export function clearAdminIdentity() {

    adminIdentityCache = null;

    localStorage.removeItem(
        ADMIN_STORAGE_KEY
    );

}

/* ============================================================
   REFRESH CACHE

   Rebuilds memory from localStorage.
============================================================ */

export function refreshIdentity():
StudentIdentity | null {

  identityCache = null;

  return getCurrentStudent();

}

/* ============================================================
   REFRESH TEACHER IDENTITY
============================================================ */

export function refreshTeacherIdentity():
TeacherIdentity | null {

  teacherIdentityCache = null;

  return getCurrentTeacher();

}

/* ============================================================
   REFRESH SCHOOL IDENTITY
============================================================ */

export function refreshSchoolIdentity():
SchoolIdentity | null {

  schoolIdentityCache = null;

  return getCurrentSchool();

}

/* ============================================================
   REFRESH PARTNER IDENTITY

   Rebuilds Partner memory cache from localStorage.
============================================================ */

export function refreshPartnerIdentity():
  PartnerIdentity | null {

  partnerIdentityCache = null;

  return getCurrentPartner();

}

/* ============================================================
   BUILD IDENTITY

   Creates a fully normalized StudentIdentity object.

   Used after login, onboarding and profile refresh.
============================================================ */

export function buildIdentity(
  data: Partial<StudentIdentity>
): StudentIdentity {

  return {

    /* ========================================================
       AUTHENTICATION
    ======================================================== */

    authUserId:
      data.authUserId,

    email:
      data.email,

    /* ========================================================
       STUDENT DOMAIN
    ======================================================== */

    studentUuid:
      data.studentUuid ?? "",

    masterStudentId:
      data.masterStudentId ?? "",

    studentCode:
      data.studentCode ?? "",

    studentName:
      data.studentName ?? "",

    schoolName:
      data.schoolName,

    schoolUuid:
      data.schoolUuid,

    className:
      data.className,

    section:
      data.section,

    parentEmail:
      data.parentEmail,

    parentPhone:
      data.parentPhone,

    /* ========================================================
       PARTNER DOMAIN
    ======================================================== */

    partnerId:
      data.partnerId ?? "",

    partnerCode:
      data.partnerCode ?? "",

    partnerName:
      data.partnerName ?? "",

    partnerEmail:
      data.partnerEmail ?? "",

    partnerPhone:
      data.partnerPhone ?? "",

    partnerCategory:
      data.partnerCategory ?? "",

    partnerOrganization:
      data.partnerOrganization ?? "",

    /* ========================================================
       SCHOOL DOMAIN
    ======================================================== */

    schoolId:
      data.schoolId,

    schoolCode:
      data.schoolCode,

    schoolAdminId:
      data.schoolAdminId,

    /* ========================================================
       PASSPORT / WALLET
    ======================================================== */

    walletId:
      data.walletId,

    passportId:
      data.passportId,

    /* ========================================================
       AUTHORIZATION
    ======================================================== */

    role:
      data.role,

    permissions:
      data.permissions ?? [],

    /* ========================================================
       EXTENSIBILITY
    ======================================================== */

    metadata:
      data.metadata ?? {}

  };

}

/* ============================================================
   BUILD TEACHER IDENTITY

   Creates a fully normalized TeacherIdentity object.
============================================================ */

export function buildTeacherIdentity(
  data: Partial<TeacherIdentity>
): TeacherIdentity {

  return {

    /* ========================================================
       AUTHENTICATION
    ======================================================== */

    authUserId:
      data.authUserId,

    email:
      data.email,

    /* ========================================================
       TEACHER DOMAIN
    ======================================================== */

    teacherUuid:
      data.teacherUuid ?? "",

    teacherId:
      data.teacherId ?? "",

    teacherName:
      data.teacherName ?? "",

    phone:
      data.phone,

    organizationUuid:
      data.organizationUuid,

    organizationName:
      data.organizationName,

    schoolUuid:
      data.schoolUuid,

    schoolName:
      data.schoolName,

    boardUuid:
      data.boardUuid,

    department:
      data.department,

    designation:
      data.designation,

    profileCompleted:
      data.profileCompleted ?? false,

    isActive:
      data.isActive ?? true,

    /* ========================================================
       AUTHORIZATION
    ======================================================== */

    role:
      data.role,

    permissions:
      data.permissions ?? [],

    /* ========================================================
       EXTENSIBILITY
    ======================================================== */

    metadata:
      data.metadata ?? {}

  };

}

/* ============================================================
   BUILD SCHOOL IDENTITY

   Creates a fully normalized SchoolIdentity object.
============================================================ */

export function buildSchoolIdentity(
  data: Partial<SchoolIdentity>
): SchoolIdentity {

  return {

    authUserId:
      data.authUserId,

    email:
      data.email,

    schoolUuid:
      data.schoolUuid ?? "",

    schoolId:
      data.schoolId ?? "",

    schoolName:
      data.schoolName ?? "",

    organizationUuid:
      data.organizationUuid,

    organizationName:
      data.organizationName,

    boardUuid:
      data.boardUuid,

    principalName:
      data.principalName,

    isActive:
      data.isActive ?? true,

    role:
      data.role,

    permissions:
      data.permissions ?? [],

    metadata:
      data.metadata ?? {}

  };

}

/* ============================================================
   MERGE IDENTITY

   Safely merges new values into existing identity.
============================================================ */

export function mergeIdentity(
  updates: Partial<StudentIdentity>
): StudentIdentity {

  const merged = {

    ...requireIdentity(),

    ...updates

  };

  saveStudentIdentity(merged);

  return merged;

}

/* ============================================================
   IDENTITY VALIDATION
============================================================ */
export function validateIdentity(
  identity: StudentIdentity
): boolean {

    console.log("VALIDATING IDENTITY");

    console.table({

        studentUuid: identity.studentUuid,

        studentCode: identity.studentCode,

        masterStudentId: identity.masterStudentId,

        studentName: identity.studentName

    });

    return Boolean(

        identity.studentUuid &&
        identity.studentCode &&
        identity.masterStudentId &&
        identity.studentName

    );

}
/* ============================================================
   DEVELOPMENT HELPERS
============================================================ */

export function printIdentity(): void {

  if (import.meta.env.DEV) {

    console.group("Student Identity");

    console.table(requireIdentity());

    console.groupEnd();

  }

}

/* ============================================================
   TEACHER DEVELOPMENT HELPERS
============================================================ */

export function printTeacherIdentity(): void {

  if (import.meta.env.DEV) {

    console.group("Teacher Identity");

    console.table(requireTeacherIdentity());

    console.groupEnd();

  }

}

/* ============================================================
   SCHOOL DEVELOPMENT HELPERS
============================================================ */

export function printSchoolIdentity(): void {

  if (import.meta.env.DEV) {

    console.group("School Identity");

    console.table(requireSchoolIdentity());

    console.groupEnd();

  }

}

export function clearIdentityCache(): void {

  identityCache = null;

}

export function getTeacherIdentityCache():
TeacherIdentity | null {

  return teacherIdentityCache;

}

export function getSchoolIdentityCache():
SchoolIdentity | null {

  return schoolIdentityCache;

}

export function getIdentityCache():

StudentIdentity | null {

  return identityCache;

}

/* ============================================================
   FUTURE HELPERS
============================================================ */

export function getStudentProfile() {

  return requireIdentity();

}

export function getStudentName(): string {

  return requireIdentity().studentName;

}

export function getSchoolName():

string | undefined {

  return requireIdentity().schoolName;

}

export function getStudentClass():

string | undefined {

  return requireIdentity().className;

}

export function getStudentSection():

string | undefined {

  return requireIdentity().section;

}

export function getStudentEmail():

string | undefined {

  return requireIdentity().email;

}

export function getPermissions():

string[] {

  return requireIdentity().permissions ?? [];

}

export function hasPermission(
  permission: string
): boolean {

  return getPermissions().includes(permission);

}

/* ============================================================
   TEACHER HELPERS
============================================================ */

export function getTeacherProfile() {

  return requireTeacherIdentity();

}

export function getTeacherUuid(): string {

  return requireTeacherIdentity().teacherUuid;

}

export function getTeacherId(): string {

  return requireTeacherIdentity().teacherId;

}

export function getTeacherName(): string {

  return requireTeacherIdentity().teacherName;

}

export function getTeacherSchoolUuid():
string | undefined {

  return requireTeacherIdentity().schoolUuid;

}

export function getTeacherOrganizationUuid():
string | undefined {

  return requireTeacherIdentity().organizationUuid;

}

export function getTeacherBoardUuid():
string | undefined {

  return requireTeacherIdentity().boardUuid;

}

/* ============================================================
   IDENTITY RESOLVER
============================================================ */

export function getIdentityFor(
  module: IdentityModule
): string {

  const field =
    IDENTITY_MAP[module];

  /* ======================================================
     STUDENT MODULES
  ====================================================== */

  if (
    field === "studentUuid" ||
    field === "studentCode" ||
    field === "masterStudentId"
  ) {

    const identity =
      requireIdentity();

    const value =
      identity[field];

    if (!value) {

      throw new Error(
        `Identity '${field}' not found.`
      );

    }

    return value;

  }

  /* ======================================================
     TEACHER MODULES
  ====================================================== */

  if (
    field === "teacherUuid"
  ) {

    const identity =
      requireTeacherIdentity();

    return identity.teacherUuid;

  }

  /* ======================================================
     SCHOOL MODULES
  ====================================================== */

  if (
    field === "schoolUuid"
  ) {

    const identity =
      requireSchoolIdentity();

    return identity.schoolUuid;

  }

  throw new Error(

    `Unsupported identity field '${field}'.`

  );

}

/* ============================================================
   TABLE IDENTITY RESOLVER

   Every repository should use this.

============================================================ */

export function getTableIdentity(
  table: IdentityTable
): string {

  const field =
    TABLE_ID_MAP[table];

  switch (field) {

    case "studentUuid":

      return requireIdentity()
        .studentUuid;

    case "studentCode":

      return requireIdentity()
        .studentCode;

    case "masterStudentId":

      return requireIdentity()
        .masterStudentId;

    case "teacherUuid":

      return requireTeacherIdentity()
        .teacherUuid;

    case "schoolUuid":

      return requireSchoolIdentity()
        .schoolUuid;

    case "partnerId":

      return requirePartnerIdentity()
        .partnerId;

    default:

      throw new Error(

        `Unsupported identity '${field}'.`

      );

  }

}

/* ============================================================
   BACKWARD COMPATIBILITY
============================================================ */

export function getStudentUuid(): string {
  return getIdentityFor("student");
}

export function getStudentCode(): string {
  return getIdentityFor("competition");
}

export function getMasterStudentId(): string {
  return getIdentityFor("analytics");
}

export function isStudentLoggedIn(): boolean {
  return hasIdentity();
}

export function isTeacherLoggedIn(): boolean {

  return hasTeacherIdentity();

}

export function isSchoolLoggedIn(): boolean {

  return hasSchoolIdentity();

}


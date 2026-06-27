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

  master: "masterStudentId"

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

  analytics: "masterStudentId"

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

  identityCache = identity;

  localStorage.setItem(
   STUDENT_STORAGE_KEY,
    JSON.stringify(identity)
  );
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
   GET CURRENT IDENTITY

   Loads from memory first.

   Falls back to localStorage.

============================================================ */

export function getCurrentStudent():
  StudentIdentity | null {

  if (identityCache) {
    return identityCache;
  }

  const raw = localStorage.getItem(STUDENT_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {

    const parsed: StudentIdentity = JSON.parse(raw);

    identityCache = parsed;

    return parsed;

  } catch {

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

  const identity = getCurrentStudent();

  if (!identity) {

    throw new Error(
      "Student identity not found."
    );

  }

  return identity;

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
   HAS PARTNER IDENTITY
============================================================ */

export function hasPartnerIdentity(): boolean {

  return getCurrentPartner() !== null;

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

  localStorage.removeItem(STUDENT_STORAGE_KEY);

}

/* ============================================================
   CLEAR PARTNER IDENTITY
============================================================ */

export function clearPartnerIdentity(): void {

  partnerIdentityCache = null;

  localStorage.removeItem(
    PARTNER_STORAGE_KEY
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

export function clearIdentityCache(): void {

  identityCache = null;

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
   IDENTITY RESOLVER
============================================================ */

export function getIdentityFor(
  module: IdentityModule
): string {

  const identity = requireIdentity();

  const field = IDENTITY_MAP[module];

  const value = identity[field];

  if (!value) {
    throw new Error(
      `Identity '${field}' not found.`
    );
  }

  return value;
}

/* ============================================================
   TABLE IDENTITY RESOLVER

   Every repository should use this.

============================================================ */

export function getTableIdentity(

    table: IdentityTable

): string {

    const identity = requireIdentity();

    const field = TABLE_ID_MAP[table];

    const value = identity[field];

    if (!value) {

        throw new Error(

            `Identity '${field}' not available for table '${table}'.`

        );

    }

    return value;

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
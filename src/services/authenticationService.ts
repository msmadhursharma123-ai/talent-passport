import type {
    Session,
    User
} from "@supabase/supabase-js";

import {
    getSupabaseClient
} from "../supabaseClient";

import {
    getGrowthPlanData
} from "../data/passportRepository";

import {
    StudentIdentity,
    TeacherIdentity,
    SchoolIdentity,
    PartnerIdentity,
    AdminIdentity,

    buildIdentity,
    buildTeacherIdentity,
    buildSchoolIdentity,

    saveStudentIdentity,
    saveTeacherIdentity,
    saveSchoolIdentity,
    savePartnerIdentity,
    saveAdminIdentity,

    clearStudentIdentity,
    clearTeacherIdentity,
    clearSchoolIdentity,
    clearPartnerIdentity,
    clearAdminIdentity,

    markAuthSessionInitialized,
    clearAuthSession,
    hasAuthSession,

    getCurrentStudent,
    getCurrentTeacher,
    getCurrentSchool,
    getCurrentPartner,
    getCurrentAdmin

} from "./identityService";

import {

doesStudentProfileExist,
isQuestionnaireCompleted

}

from "../data/studentRepository";

import SchoolSubscriptionService
from "./schoolSubscriptionService";

import {
    isTeacherEmailAuthorized
} from "../data/schoolTeacherAllowlistRepository";

export type AuthRole =
    | "student"
    | "teacher"
    | "school"
    | "partner"
    | "admin";

export interface AuthResult {

    success: boolean;

    error?: string;

    authUserId?: string;

}

export interface SignInResult
extends AuthResult {

    identity?:

    StudentIdentity |
    TeacherIdentity |
    SchoolIdentity |
    PartnerIdentity |
    AdminIdentity;

    requiresPasswordReset?: boolean;

    /**
     * signInWithPassword is the Existing User Login operation.
     * New-user onboarding is performed by registration flows and never
     * by this function.
     */
    authenticationFlow?: "existing-user";

    /**
     * Credentials are valid, but the account has not entered a portal yet.
     * This is an incomplete onboarding account, not an Existing User.
     */
    onboardingIncomplete?: boolean;

}

export interface SignUpResult
    extends AuthResult {

    userId?: string;

    email?: string;

    sessionExists?: boolean;

    /**
     * Registration resumed an Auth account created earlier while onboarding
     * was still incomplete.
     */
    resumedIncompleteOnboarding?: boolean;

}

export interface BootstrapStudentResult
    extends AuthResult {

    studentUuid?: string;

    masterStudentId?: string;

}

export interface RestoreSessionResult
    extends AuthResult {

identity?:

StudentIdentity |

TeacherIdentity |

SchoolIdentity |

PartnerIdentity |

AdminIdentity;

}

interface StudentRow {

    id: string;

    student_uuid: string; 

    auth_user_id: string | null;

    student_id: string;

    student_name: string;

   student_email: string;

phone: string | null;

school_name: string | null;

    school_uuid: string | null;

    class_name: string | null;

    section: string | null;

    parent_email: string | null;

    student_mobile: string | null;

    parent_phone: string | null;

    wallet_id?: string | null;

    passport_id?: string | null;

    account_status?: string | null;

}

interface PartnerRow {

    id: string;

partner_uuid: string;

    auth_user_id: string | null;

    partner_id: string;

    institute_name: string;

    institute_city: string | null;

    email: string;

    mobile_number: string | null;

    skill_focus: string[] | null;

    last_login_at?: string | null;

    account_status?: string | null;

}

interface TeacherRow {

    id: string;

    teacher_uuid: string;

    auth_user_id: string | null;

    teacher_id: string;

    full_name: string;

    email: string;

    phone: string | null;

    organization_uuid: string | null;

    organization_name: string | null;

    school_uuid: string | null;

    school_name: string | null;

    board_uuid: string | null;

    department: string | null;

    designation: string | null;

    profile_completed: boolean | null;

    is_active: boolean | null;

}

interface SchoolRow {

    id: string;

    school_admin_id: string | null;

    school_admin_uuid: string | null;

    full_name: string;

    email: string;

    phone: string | null;

    organization_uuid: string | null;

    organization_name: string | null;

    school_uuid: string;

    school_name: string;

    designation: string | null;

    department: string | null;

    auth_user_id: string | null;

    account_status: string | null;

    last_login_at: string | null;

}

interface AdminRow {

    id: string;

    auth_user_id: string | null;

    admin_id: string;

    admin_name: string;

    admin_email: string;

    phone: string | null;

    role: string | null;

    permissions: string[] | null;

}

function getClient() {

    const supabase =
        getSupabaseClient();

    if (!supabase) {

        throw new Error(
            "Supabase is not configured."
        );

    }

    return supabase;

}

async function fetchStudentByAuthId(
    authUserId: string
): Promise<StudentRow | null> {

    const supabase =
        getClient();

    const {
        data,
        error
    } = await supabase
        .from("students_master")
        .select("*")
        .eq(
            "auth_user_id",
            authUserId
        )
        .maybeSingle();

    if (error) {

        return null;

    }

    return data as unknown as StudentRow | null;

}

/* ============================================================
   FETCH TEACHER BY AUTH USER
============================================================ */

async function fetchTeacherByAuthUserId(
    authUserId: string
): Promise<TeacherRow | null> {

    const supabase = getClient();

    const {
        data,
        error
    } = await supabase
        .from("teachers_master")
        .select("*")
        .eq("auth_user_id", authUserId)
        .maybeSingle();

    if (error) {
        return null;
    }

    return data;

}

/* ============================================================
   FETCH SCHOOL BY AUTH USER
============================================================ */

async function fetchSchoolByAuthUserId(
    authUserId: string
): Promise<SchoolRow | null> {

    const supabase = getClient();

    const {
        data,
        error
    } = await supabase
        .from("school_admins")
        .select("*")
        .eq("auth_user_id", authUserId)
        .maybeSingle();

    if (error) {
        return null;
    }

    return data;

}

async function fetchPartnerByAuthId(
    authUserId: string
): Promise<PartnerRow | null> {

    const supabase =
        getClient();

    const {
        data,
        error
    } =
        await supabase
            .from("partner_profiles")
            .select("*")
            .eq(
                "auth_user_id",
                authUserId
            )
            .maybeSingle();

    if (error) {

        return null; 

    }

    return data as unknown as PartnerRow | null;

}

async function resolveIdentity(
    authUserId: string
): Promise<
    | {
          role: "student";
          identity: StudentIdentity;
      }
    | {
          role: "teacher";
          identity: TeacherIdentity;
      }
    | {
          role: "school";
          identity: SchoolIdentity;
      }
    | {
          role: "partner";
          identity: PartnerIdentity;
      }
    | {
          role: "admin";
          identity: AdminIdentity;
      }
    | null
> {

    /*
     * PLATFORM ADMIN MUST BE RESOLVED FIRST.
     * If an old/dummy portal profile shares this auth UUID, the authoritative
     * admins row wins instead of incorrectly resolving the user as student.
     */
    const platformAdmin =
        await fetchAdminByAuthId(authUserId);

    if (platformAdmin) {

        return {

            role: "admin",

            identity: {

                adminId:
                    platformAdmin.id,

                adminName:
                    platformAdmin.admin_name,

                email:
                    platformAdmin.admin_email,

                role:
                    "admin"

            }

        };

    }

    const student =
        await fetchStudentByAuthId(authUserId);

    if (student) {

        return {

            role: "student",

            identity:
                createStudentIdentity(student)

        };

    }

    /* ============================================================
   TEACHER
============================================================ */

const teacher =
    await fetchTeacherByAuthUserId(
        authUserId
    );

if (teacher) {

    const identity =
        createTeacherIdentity(
            teacher
        );

    saveTeacherIdentity(
        identity
    );

    return {

    role: "teacher",

    identity

};

}

/* ============================================================
   SCHOOL
============================================================ */

const school =
    await fetchSchoolByAuthUserId(
        authUserId
    );

if (school) {

    const identity =
        createSchoolIdentity(
            school
        );

    saveSchoolIdentity(
        identity
    );

    return {

    role: "school",

    identity

};

}

    const partner =
        await fetchPartnerByAuthId(authUserId);

    if (partner) {

        return {

            role: "partner",

            identity: {

                partnerId:
                    partner.partner_id,

partnerUuid:
    partner.partner_uuid,

                partnerName:
                    partner.institute_name,

                email:
                    partner.email,

                phone:
                    partner.mobile_number ?? undefined,

                organization:
                    partner.institute_name,

                specialization:
                    partner.skill_focus ?? undefined,

                role:
                    "partner"

            }

        };

    }

    return null;



}

async function fetchAdminByAuthId(
    authUserId: string
): Promise<AdminRow | null> {

    const supabase =
        getClient();

    const {
        data,
        error
    } =
        await supabase
            .from("admins")
            .select("*")
            .eq(
                "auth_user_id",
                authUserId
            )
            .maybeSingle();

    if (error) {

        return null;

    }

    return data as unknown as AdminRow | null;

}

function createStudentIdentity(
    row: StudentRow
): StudentIdentity {

  console.log("STUDENT ROW FROM DB");
    console.table(row);

    return buildIdentity({

        authUserId:
            row.auth_user_id ?? undefined,

        email:
            row.student_email,

        studentUuid:
    row.student_uuid,

        masterStudentId:
            row.id,

        studentCode:
            row.student_id,

        studentName:
            row.student_name,

        schoolName:
            row.school_name ?? undefined,

        schoolUuid:
            row.school_uuid ?? undefined,

        className:
            row.class_name ?? undefined,

        section:
            row.section ?? undefined,

parentEmail:
    row.student_email ?? undefined,

studentPhone:
    row.student_mobile ??
    row.phone ??
    undefined,

parentPhone:
    row.parent_phone ??
    row.phone ??
    undefined,

        walletId:
            row.wallet_id ?? undefined,

        passportId:
            row.passport_id ?? undefined,

        role:
            "student",

        permissions: []

    });

}

/* ============================================================
   CREATE TEACHER IDENTITY
============================================================ */

function createTeacherIdentity(
    row: TeacherRow
): TeacherIdentity {

    return buildTeacherIdentity({

        authUserId:
            row.auth_user_id ?? undefined,

        email:
            row.email,

        teacherUuid:
            row.teacher_uuid,

        teacherId:
            row.teacher_id,

        teacherName:
            row.full_name,

        phone:
            row.phone ?? undefined,

        organizationUuid:
            row.organization_uuid ?? undefined,

        organizationName:
            row.organization_name ?? undefined,

        schoolUuid:
            row.school_uuid ?? undefined,

        schoolName:
            row.school_name ?? undefined,

        boardUuid:
            row.board_uuid ?? undefined,

        department:
            row.department ?? undefined,

        designation:
            row.designation ?? undefined,

  profileCompleted:
    row.profile_completed ?? false,

isActive:
    row.is_active ?? true,

role:
    "teacher",

permissions:
    []

});

}

/* ============================================================
   CREATE SCHOOL IDENTITY
============================================================ */

function createSchoolIdentity(
    row: SchoolRow
): SchoolIdentity {

    return buildSchoolIdentity({

        authUserId:
            row.auth_user_id ?? undefined,

        email:
            row.email ?? undefined,

        schoolUuid:
            row.school_uuid,

        schoolId:
            row.school_admin_id ?? row.school_admin_uuid ?? row.id,

        schoolName:
            row.school_name,

        organizationUuid:
            row.organization_uuid ?? undefined,

        organizationName:
            row.organization_name ?? undefined,

        principalName:
            row.full_name ?? undefined,

        isActive:
            (row.account_status ?? "Active").toLowerCase() !== "suspended",

        role:
            "school",

        permissions:
            []

    });

}

async function isResolvedAccountSuspended(
    role: AuthRole,
    identity: StudentIdentity | TeacherIdentity | SchoolIdentity | PartnerIdentity | AdminIdentity
): Promise<boolean> {
    if (role === "admin") return false;

    const supabase = getClient();
    let query: any;

    if (role === "student") {
        query = (supabase as any).from("students_master")
            .select("account_status")
            .eq("student_uuid", (identity as StudentIdentity).studentUuid)
            .maybeSingle();
    } else if (role === "teacher") {
        query = (supabase as any).from("teachers_master")
            .select("account_status")
            .eq("teacher_uuid", (identity as TeacherIdentity).teacherUuid)
            .maybeSingle();
    } else if (role === "school") {
        query = (supabase as any).from("school_admins")
            .select("account_status")
            .eq("school_uuid", (identity as SchoolIdentity).schoolUuid)
            .eq("auth_user_id", (identity as SchoolIdentity).authUserId)
            .maybeSingle();
    } else {
        query = (supabase as any).from("partners_master")
            .select("status")
            .eq("partner_uuid", (identity as PartnerIdentity).partnerUuid)
            .maybeSingle();
    }

    const { data, error } = await query;
    if (error) {
        console.error("Unable to verify account status.", error);
        return false;
    }

    const value = String(data?.account_status ?? data?.status ?? "").toLowerCase();
    return value === "suspended" || value === "inactive";
}

/* ============================================================
   SCHOOL SUBSCRIPTION VALIDATION

   Platform Admin bypasses subscription validation.
============================================================ */

async function validateSchoolSubscriptionAccess(
    role: AuthRole,
    identity:
        StudentIdentity |
        TeacherIdentity |
        SchoolIdentity |
        PartnerIdentity |
        AdminIdentity
): Promise<string | null> {

    if (role === "admin") {

        return null;

    }

    let schoolUuid: string | undefined;

    if (role === "student") {

        schoolUuid =
            (identity as StudentIdentity).schoolUuid;

    }

    else if (role === "teacher") {

        schoolUuid =
            (identity as TeacherIdentity).schoolUuid;

    }

    else if (role === "school") {

        schoolUuid =
            (identity as SchoolIdentity).schoolUuid;

    }

    else {

        return null;

    }

    if (!schoolUuid) {

        return null;

    }

    const result =

        await SchoolSubscriptionService

            .canLogin(

                schoolUuid

            );

    if (result.allowed) {

        return null;

    }

    return (

        result.message ??

        "Your school's subscription has expired. Please contact your school administrator."

    );

}

export async function signIn(
    email: string,
    password: string
): Promise<SignInResult> {

    try {

        const supabase =
            getClient();

        const {
            data,
            error
        } =
            await supabase.auth.signInWithPassword({

                email,
                password

            });

        if (error) {

            return {

                success: false,
                error: error.message

            };

        }

        const authUser =
            data.user;

        if (!authUser) {

            return {

                success: false,
                error:
                    "Authenticated user not found."

            };

        }

const resolved =
    await resolveIdentity(
        authUser.id
    );

/*
 * A newly-created profile can exist before the first portal activation.
 * It must remain in the onboarding state even though resolveIdentity()
 * can already find its profile row.
 */
if (
    resolved &&
    hasExplicitPortalActivation(authUser) &&
    authUser.user_metadata?.tp_portal_activated === false
) {
    return {
        success: true,
        identity: resolved.identity,
        onboardingIncomplete: true,
        authenticationFlow: "existing-user"
    };
}

/* ============================================================
   SCHOOL SUBSCRIPTION VALIDATION
============================================================ */

if (resolved) {

    const subscriptionError =

        await validateSchoolSubscriptionAccess(

            resolved.role,

            resolved.identity

        );

    if (subscriptionError) {

        await supabase.auth.signOut();

        clearStudentIdentity();

        clearTeacherIdentity();

        clearSchoolIdentity();

        clearPartnerIdentity();

        clearAdminIdentity();

        clearAuthSession();

        return {

            success: false,

            error: subscriptionError

        };

    }

}

if (resolved && await isResolvedAccountSuspended(resolved.role, resolved.identity)) {
            await supabase.auth.signOut();
            clearStudentIdentity();
            clearTeacherIdentity();
            clearSchoolIdentity();
            clearPartnerIdentity();
            clearAdminIdentity();
            clearAuthSession();

            return {
                success: false,
                error: "This account has been suspended. Please contact the platform administrator."
            };
        }

/* ============================================================
   SCHOOL FIRST LOGIN CHECK
============================================================ */

if (resolved?.role === "school") {

    const supabase = getClient();

const {

    data: schoolAdmin

} = await (supabase as any)

    .from("school_admins")

    .select("account_status,last_login_at")

    .eq("auth_user_id", authUser.id)

    .maybeSingle();

const admin = schoolAdmin as any;

  if (

    admin &&

    admin.account_status === "Temporary"

) {

        return {

            success: true,

            identity: resolved.identity,

            requiresPasswordReset: true,

            authenticationFlow: "existing-user"

        };

    }

}

      if (!resolved) {

            /*
             * An Auth account with our explicit onboarding marker can exist
             * before the portal profile is created. It is still onboarding,
             * not an Existing User.
             */
            if (
                hasExplicitPortalActivation(authUser) &&
                authUser.user_metadata?.tp_portal_activated === false
            ) {
                return {
                    success: true,
                    onboardingIncomplete: true,
                    authenticationFlow: "existing-user"
                };
            }

            await supabase.auth.signOut();
            clearStudentIdentity();
            clearTeacherIdentity();
            clearSchoolIdentity();
            clearPartnerIdentity();
            clearAdminIdentity();
            clearAuthSession();

            return {
                success: false,
                error: "No linked portal profile found for this account."
            };
        }

        switch (resolved.role) {
            case "student":
                clearTeacherIdentity();
                clearSchoolIdentity();
                clearPartnerIdentity();
                clearAdminIdentity();
                saveStudentIdentity(resolved.identity);

                console.log("========== AUTH SAVE ==========");
console.table(resolved.identity);

console.log("========== CACHE ==========");
console.table(getCurrentStudent());

console.log("========== LOCAL STORAGE ==========");
console.log(
    localStorage.getItem("studentProfile")
);

try {
    console.table(
        JSON.parse(
            localStorage.getItem("studentProfile") || "{}"
        )
    );
} catch (e) {
    console.error(e);
}

console.log(
    "AFTER SAVE",
    getCurrentStudent()
);

                break;

console.log(
    "AFTER SAVE",
    getCurrentStudent()
);

            case "teacher":
                clearStudentIdentity();
                clearSchoolIdentity();
                clearPartnerIdentity();
                clearAdminIdentity();
                saveTeacherIdentity(resolved.identity);
                break;

            case "school":
                clearStudentIdentity();
                clearTeacherIdentity();
                clearPartnerIdentity();
                clearAdminIdentity();
                saveSchoolIdentity(resolved.identity);
                break;

            case "partner":
                clearStudentIdentity();
                clearTeacherIdentity();
                clearSchoolIdentity();
                clearAdminIdentity();
                savePartnerIdentity(resolved.identity);
                break;

            case "admin":
                clearStudentIdentity();
                clearTeacherIdentity();
                clearSchoolIdentity();
                clearPartnerIdentity();
                saveAdminIdentity(resolved.identity);
                break;
        }

        markAuthSessionInitialized();

        /**
         * Passport warm-up
         */

        if (resolved.role === "student") {

            try {

                const growth =
                    await getGrowthPlanData();

                if (growth?.passport) {

                    localStorage.setItem(

                        "studentPassport",

                        JSON.stringify(
                            growth.passport
                        )

                    );

                }

            }

            catch (error) {

                console.error(

                    "Unable to restore passport.",

                    error

                );

            }

        }

        return {

            success: true,

            identity:
                resolved.identity,

            authenticationFlow:
                "existing-user"

        };

    }

    catch (error: any) {

        return {

            success: false,

            error:

                error?.message ??

                "Authentication failed."

        };

    }

}



/* ============================================================
   ONBOARDING STATE
   ------------------------------------------------------------
   A Supabase Auth row alone does NOT make a user an Existing User.

   New accounts are created with:
       tp_portal_activated = false

   That flag becomes true only when the first portal is actually
   entered. Legacy accounts without this marker remain backward
   compatible and continue to behave as established users.
============================================================ */

function hasExplicitPortalActivation(user: User): boolean {
    return Object.prototype.hasOwnProperty.call(
        user.user_metadata ?? {},
        "tp_portal_activated"
    );
}

function isPortalActivated(user: User): boolean {
    return user.user_metadata?.tp_portal_activated === true;
}

async function resumeIncompleteRegistration(
    role: Extract<AuthRole, "student" | "teacher" | "partner">,
    email: string,
    password: string
): Promise<SignUpResult> {

    const supabase = getClient();

    const { data, error } =
        await supabase.auth.signInWithPassword({
            email: email.trim(),
            password
        });

    if (error || !data.user) {
        return {
            success: false,
            error:
                error?.message ??
                "Unable to resume this registration."
        };
    }

    const user = data.user;

    /*
     * Once the first portal has been entered, this is an Existing User.
     * Never let the New User path overwrite that account.
     */
    if (isPortalActivated(user)) {
        await supabase.auth.signOut();

        return {
            success: false,
            error:
                "This account is already active. Please use the Existing User Login screen."
        };
    }

    const resolved = await resolveIdentity(user.id);

    if (resolved) {

        if (resolved.role !== role) {
            await supabase.auth.signOut();

            const portalName =
                resolved.role === "student"
                    ? "Student"
                    : resolved.role === "teacher"
                    ? "Teacher"
                    : resolved.role === "partner"
                    ? "Partner"
                    : resolved.role === "school"
                    ? "School"
                    : "Admin";

            return {
                success: false,
                error:
                    `This account belongs to the ${portalName} Portal. Please use ${portalName} Login.`
            };
        }

        /*
         * Only an explicit false marker is resumable.
         * An account with no marker is an older established account.
         */
        if (
            !hasExplicitPortalActivation(user) ||
            user.user_metadata?.tp_portal_activated !== false
        ) {
            await supabase.auth.signOut();

            return {
                success: false,
                error:
                    "This account is already registered. Please use the Existing User Login screen."
            };
        }
    } else if (
        !hasExplicitPortalActivation(user) ||
        user.user_metadata?.tp_portal_activated !== false
    ) {
        await supabase.auth.signOut();

        return {
            success: false,
            error:
                "This account already exists. Please use the Existing User Login screen."
        };
    }

    /*
     * Keep this session alive. The profile repositories will UPDATE the
     * existing incomplete profile instead of creating a duplicate row.
     */
    return {
        success: true,
        userId: user.id,
        email: user.email ?? email.trim(),
        sessionExists: data.session !== null,
        resumedIncompleteOnboarding: true
    };
}

export async function markPortalActivated(
    role: Extract<AuthRole, "student" | "teacher" | "partner">
): Promise<AuthResult> {

    try {
        const supabase = getClient();

        const { data, error } =
            await supabase.auth.updateUser({
                data: {
                    tp_portal_activated: true,
                    tp_portal_activated_at:
                        new Date().toISOString(),
                    tp_role: role
                }
            });

        if (error) {
            return {
                success: false,
                error: error.message
            };
        }

        return {
            success: true,
            authUserId: data.user?.id
        };

    } catch (error: any) {
        return {
            success: false,
            error:
                error?.message ??
                "Unable to mark portal activation."
        };
    }
}

export async function registerStudent(
    email: string,
    password: string
): Promise<SignUpResult> {

    try {
        const supabase = getClient();

        const { data, error } =
            await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    data: {
                        tp_role: "student",
                        tp_portal_activated: false
                    }
                }
            });

        /*
         * Existing confirmed users may be returned by Supabase as an
         * obfuscated user. If so, verify the supplied credentials and
         * resume only an explicitly incomplete onboarding account.
         */
        if (
            error ||
            (
                data.user &&
                Array.isArray(data.user.identities) &&
                data.user.identities.length === 0
            )
        ) {
            const resumed =
                await resumeIncompleteRegistration(
                    "student",
                    email,
                    password
                );

            if (resumed.success) return resumed;

            return {
                success: false,
                error:
                    resumed.error ??
                    error?.message ??
                    "Unable to create account."
            };
        }

        const user = data.user;

        if (!user) {
            return {
                success: false,
                error:
                    "Unable to create authentication account."
            };
        }

        return {
            success: true,
            userId: user.id,
            email: user.email ?? undefined,
            sessionExists: data.session !== null
        };

    } catch (error: any) {
        return {
            success: false,
            error:
                error?.message ??
                "Unable to create account."
        };
    }
}

export async function registerPartner(
    email: string,
    password: string
): Promise<SignUpResult> {

    try {
        const supabase = getClient();

        const { data, error } =
            await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    data: {
                        tp_role: "partner",
                        tp_portal_activated: false
                    }
                }
            });

        if (
            error ||
            (
                data.user &&
                Array.isArray(data.user.identities) &&
                data.user.identities.length === 0
            )
        ) {
            const resumed =
                await resumeIncompleteRegistration(
                    "partner",
                    email,
                    password
                );

            if (resumed.success) return resumed;

            return {
                success: false,
                error:
                    resumed.error ??
                    error?.message ??
                    "Unable to create account."
            };
        }

        const user = data.user;

        if (!user) {
            return {
                success: false,
                error:
                    "Unable to create authentication account."
            };
        }

        return {
            success: true,
            userId: user.id,
            email: user.email ?? undefined,
            sessionExists: data.session !== null
        };

    } catch (error: any) {
        return {
            success: false,
            error:
                error?.message ??
                "Unable to create account."
        };
    }
}

export async function registerTeacher(
    email: string,
    password: string
): Promise<SignUpResult> {

    try {
        const normalizedEmail = email.trim().toLowerCase();

        const authorized =
            await isTeacherEmailAuthorized(
                normalizedEmail
            );

        if (!authorized) {
            return {
                success: false,
                error:
                    "This email is not authorized for Teacher Portal registration. Please contact your school administrator or Talent Passport support."
            };
        }

        const supabase = getClient();

        const { data, error } =
            await supabase.auth.signUp({
                email: normalizedEmail,
                password,
                options: {
                    data: {
                        tp_role: "teacher",
                        tp_portal_activated: false
                    }
                }
            });

        if (
            error ||
            (
                data.user &&
                Array.isArray(data.user.identities) &&
                data.user.identities.length === 0
            )
        ) {
            const resumed =
                await resumeIncompleteRegistration(
                    "teacher",
                    email,
                    password
                );

            if (resumed.success) return resumed;

            return {
                success: false,
                error:
                    resumed.error ??
                    error?.message ??
                    "Unable to create account."
            };
        }

        const user = data.user;

        if (!user) {
            return {
                success: false,
                error:
                    "Unable to create authentication account."
            };
        }

        return {
            success: true,
            userId: user.id,
            email: user.email ?? undefined,
            sessionExists: data.session !== null
        };

    } catch (error: any) {
        return {
            success: false,
            error:
                error?.message ??
                "Unable to create teacher account."
        };
    }
}

export async function registerSchool(
    email: string,
    password: string
): Promise<SignUpResult> {

    try {

        const supabase =
            getClient();

        const {
            data,
            error
        } = await supabase.auth.signUp({

            email: email.trim(),

            password

        });

        if (error) {

            return {

                success: false,

                error: error.message

            };

        }

        const user =
            data.user;

        if (!user) {

            return {

                success: false,

                error:
                    "Unable to create authentication account."

            };

        }

        return {

            success: true,

            userId:
                user.id,

            email:
                user.email ?? undefined,

            sessionExists:
                data.session !== null

        };

    }

    catch (error: any) {

        return {

            success: false,

            error:
                error?.message ??
                "Unable to create school account."

        };

    }

}

export async function createSchoolAdmin(
    invitation: {
        schoolUuid: string;
        schoolName: string;
        administratorName: string;
        administratorEmail: string;
    },
    authUserId: string
): Promise<boolean> {

    try {

        const supabase = getClient();

      const { error } = await (supabase as any)
    .from("school_admins")
    .insert({

                school_admin_uuid: crypto.randomUUID(),

                school_admin_id:
                    "SCHADM-" +
                    Math.floor(100000 + Math.random() * 900000),

                full_name:
                    invitation.administratorName,

                email:
                    invitation.administratorEmail,

                school_uuid:
                    invitation.schoolUuid,

                school_name:
                    invitation.schoolName,

                auth_user_id:
                    authUserId,

                // New school-admin accounts remain Temporary until
                // the mandatory first-login password change succeeds.
                account_status:
                    "Temporary"

            });

        if (error) {

            console.error(error);

            return false;

        }

        return true;

    } catch (error) {

        console.error(error);

        return false;

    }

}

export async function bootstrapStudentIdentity(
    student: {
        studentName: string;
        studentEmail: string;
        studentCode: string;
        schoolName?: string;
        className?: string;
    }
): Promise<BootstrapStudentResult> {

    try {

        const supabase = getClient();

        const {
            data: authData
        } = await supabase.auth.getUser();

        const authUser = authData.user;

        if (!authUser) {

            return {

                success: false,

                error:
                    "Authenticated user not found."

            };

        }

        const {

            data,

            error

} = await (supabase as any)
    .from("students_master")

            .insert({

    auth_user_id:
        authUser.id,

    student_uuid:
        crypto.randomUUID(),

    student_name:
        student.studentName,

    student_email:
        student.studentEmail,

    student_id:
        student.studentCode,

    school_name:
        student.schoolName,

    class_name:
        student.className

})

            .select()

            .single();

      if (error) {

    console.error(
        "BOOTSTRAP INSERT ERROR",
        error
    );

    return {

        success: false,

        error:
            error.message

    };

}

console.log(
    "BOOTSTRAP INSERTED",
    data
);

        return {

            success: true,

           studentUuid: (data as any).student_uuid,

            masterStudentId: (data as any).id

        };

    }

    catch (error: any) {

        return {

            success: false,

            error:

                error?.message ??

                "Unable to create student identity."

        };

    }

}

export async function signOut():
Promise<AuthResult> {

    try {

        const supabase =
            getClient();

        await supabase.auth.signOut();

clearStudentIdentity();

clearTeacherIdentity();

clearSchoolIdentity();

clearPartnerIdentity();

clearAdminIdentity();

clearAuthSession();

        return {

            success: true

        };

    }

    catch (error: any) {

        return {

            success: false,

            error:
                error?.message ??
                "Logout failed."

        };

    }

}

export async function restoreSession():
Promise<RestoreSessionResult> {

    try {

        const supabase =
            getClient();

        const {
            data,
            error
        } =
            await supabase.auth.getSession();

        if (error) {

            return {

                success: false,

                error: error.message

            };

        }

        const session =
            data.session;

        if (!session) {

          clearStudentIdentity();

clearTeacherIdentity();

clearSchoolIdentity();

clearPartnerIdentity();

clearAdminIdentity();

            clearAuthSession();

            return {

                success: false,

                error:
                    "No active session."

            };

        }

     const resolved =
    await resolveIdentity(
        session.user.id
    );

/* ============================================================
   SCHOOL SUBSCRIPTION VALIDATION
============================================================ */

if (resolved) {

    const subscriptionError =

        await validateSchoolSubscriptionAccess(

            resolved.role,

            resolved.identity

        );

    if (subscriptionError) {

        await supabase.auth.signOut();

        clearStudentIdentity();

        clearTeacherIdentity();

        clearSchoolIdentity();

        clearPartnerIdentity();

        clearAdminIdentity();

        clearAuthSession();

        return {

            success: false,

            error: subscriptionError

        };

    }

}

if (resolved && await isResolvedAccountSuspended(resolved.role, resolved.identity)) {
            await supabase.auth.signOut();
            clearStudentIdentity();
            clearTeacherIdentity();
            clearSchoolIdentity();
            clearPartnerIdentity();
            clearAdminIdentity();
            clearAuthSession();

            return {
                success: false,
                error: "This account has been suspended."
            };
        }

        if (!resolved) {

            /*
             * A newly created onboarding account may survive a browser
             * restart before a portal profile is saved. Keep that session
             * alive so the user can restart onboarding. It is not an
             * Existing User until tp_portal_activated becomes true.
             */
            if (
                hasExplicitPortalActivation(session.user) &&
                session.user.user_metadata?.tp_portal_activated === false
            ) {
                return {
                    success: true
                };
            }

            await supabase.auth.signOut();

            clearStudentIdentity();
            clearTeacherIdentity();
            clearSchoolIdentity();
            clearPartnerIdentity();
            clearAdminIdentity();
            clearAuthSession();

            return {
                success: false,
                error:
                    "No linked profile found."
            };
        }

        /**
         * Identity Kernel Rule
         *
         * Never leave the application
         * in a state where ALL identities
         * are cleared.
         *
         * Replace only the active identity.
         */

        switch (resolved.role) {
            case "student":
                clearTeacherIdentity();
                clearSchoolIdentity();
                clearPartnerIdentity();
                clearAdminIdentity();
                saveStudentIdentity(resolved.identity);

                console.log("========== AUTH SAVE ==========");
console.table(resolved.identity);

console.log("========== CACHE ==========");
console.table(getCurrentStudent());

console.log("========== LOCAL STORAGE ==========");
console.log(
    localStorage.getItem("studentProfile")
);

try {
    console.table(
        JSON.parse(
            localStorage.getItem("studentProfile") || "{}"
        )
    );
} catch (e) {
    console.error(e);
}

console.log(
    "AFTER SAVE",
    getCurrentStudent()
);

                break;



            case "teacher":
                clearStudentIdentity();
                clearSchoolIdentity();
                clearPartnerIdentity();
                clearAdminIdentity();
                saveTeacherIdentity(resolved.identity);
                break;

            case "school":
                clearStudentIdentity();
                clearTeacherIdentity();
                clearPartnerIdentity();
                clearAdminIdentity();
                saveSchoolIdentity(resolved.identity);
                break;

            case "partner":
                clearStudentIdentity();
                clearTeacherIdentity();
                clearSchoolIdentity();
                clearAdminIdentity();
                savePartnerIdentity(resolved.identity);
                break;

            case "admin":
                clearStudentIdentity();
                clearTeacherIdentity();
                clearSchoolIdentity();
                clearPartnerIdentity();
                saveAdminIdentity(resolved.identity);
                break;
        }

        markAuthSessionInitialized();

        return {

            success: true,

            identity:
                resolved.identity

        };

    }

    catch (error: any) {

        return {

            success: false,

            error:
                error?.message ??
                "Session restore failed."

        };

    }

}

export async function initializeAuth(): Promise<void> {

    if (!hasAuthSession()) {

        await restoreSession();

    }

    const supabase = getClient();

    await supabase.auth.getSession();

}


export async function getCurrentSession():
Promise<Session | null> {

    const supabase =
        getClient();

    const {
        data
    } =
        await supabase.auth.getSession();

    return data.session;

}

export async function getCurrentUser():
Promise<User | null> {

    const session =
        await getCurrentSession();

    return session?.user ?? null;

}

export async function isAuthenticated():
Promise<boolean> {

    const session =
        await getCurrentSession();

    return session !== null;

}

let authSubscription:
    { unsubscribe(): void } | null = null;

export function onAuthStateChange(): void {

    if (authSubscription) {

        authSubscription.unsubscribe();

        authSubscription = null;

    }

    const supabase =
        getClient();

    const {
        data
    } =
        supabase.auth.onAuthStateChange(

            async (
                event,
                session
            ) => {

                switch (event) {

                    case "SIGNED_IN":

                        /**
                         * Session already initialized
                         * by signIn().
                         *
                         * Avoid duplicate restore.
                         */

                        if (!hasAuthSession()) {

                            await restoreSession();

                        }

                        break;

                    case "TOKEN_REFRESHED":

                        /**
                         * Refresh identity silently.
                         */

                        await restoreSession();

                        break;

                    case "SIGNED_OUT":

                      clearStudentIdentity();

clearTeacherIdentity();

clearSchoolIdentity();

clearPartnerIdentity();

clearAdminIdentity();

                        clearAuthSession();

                        break;

                    default:

                        break;

                }

            }

        );

    authSubscription =
        data.subscription;

}

export function removeAuthListener(): void {

    if (!authSubscription) {

        return;

    }

    authSubscription.unsubscribe();

    authSubscription = null;

}

export async function refreshIdentity():
Promise<RestoreSessionResult> {

    return restoreSession();

}
export function getCurrentIdentity() {

    const student =
        getCurrentStudent();

    if (student) {
        return student;
    }

    const teacher =
        getCurrentTeacher();

    if (teacher) {
        return teacher;
    }

    const school =
        getCurrentSchool();

    if (school) {
        return school;
    }

    const partner =
        getCurrentPartner();

    if (partner) {
        return partner;
    }

    return getCurrentAdmin();

}

export function isTeacherAuthenticated(): boolean {

    return getCurrentTeacher() !== null;

}

export function isSchoolAuthenticated(): boolean {

    return getCurrentSchool() !== null;

}

export function requireTeacherIdentity(): TeacherIdentity {

    const teacher =
        getCurrentTeacher();

    if (!teacher) {

        throw new Error(
            "Teacher identity not found."
        );

    }

    return teacher;

}

export function requireSchoolIdentity(): SchoolIdentity {

    const school =
        getCurrentSchool();

    if (!school) {

        throw new Error(
            "School identity not found."
        );

    }

    return school;

}

export async function requireAuthentication():
Promise<SignInResult> {

    const authenticated =
        await isAuthenticated();

    if (!authenticated) {

        return {

            success: false,

            error:
                "User is not authenticated."

        };

    }

    const identity =
    getCurrentIdentity();

    if (!identity) {

        return {

            success: false,

            error:
                "Identity could not be resolved."

        };

    }

    return {

        success: true,

        identity

    };

}

export async function updatePassword(
    newPassword: string
): Promise<AuthResult> {

    try {

        const supabase = getClient();

        const { data } =
            await supabase.auth.getUser();

        const authUser = data.user;

        if (!authUser) {

            return {

                success: false,

                error: "No authenticated user."

            };

        }

        const {

            error: passwordError

        } = await supabase.auth.updateUser({

            password: newPassword

        });

        if (passwordError) {

            return {

                success: false,

                error: passwordError.message

            };

        }

        const {

            data: schoolAdmin,

            error: schoolAdminLookupError

        } = await (supabase as any)

            .from("school_admins")

            .select("id")

            .eq("auth_user_id", authUser.id)

            .maybeSingle();

        if (schoolAdminLookupError) {

            return {

                success: false,

                error: schoolAdminLookupError.message

            };

        }

        // Only school-admin password changes own the school first-login flag.
        // Other portal roles keep their existing password-update behaviour.
        if (schoolAdmin) {

            const {

                error: schoolAdminUpdateError

            } = await (supabase as any)

                .from("school_admins")

                .update({

                    account_status: "Active",

                    last_login_at: new Date().toISOString()

                })

                .eq("auth_user_id", authUser.id);

            if (schoolAdminUpdateError) {

                return {

                    success: false,

                    error: schoolAdminUpdateError.message

                };

            }

        }

        return {

            success: true

        };

    }

    catch (error: any) {

        return {

            success: false,

            error:

                error?.message ??

                "Unable to update password."

        };

    }


    
}

const RECOVERY_TABLES = {

    student: {

        table: "students_master",

        email: "email",

        mobile: "phone"

    },

    teacher: {

        table: "teachers_master",

        email: "email",

        mobile: "phone"

    },

    partner: {

        table: "partners_master",

        email: "email",

        mobile: "phone"

    },

    school: {

        table: "school_admins",

        email: "email",

        mobile: "phone"

    },

    admin: {

        table: "platform_admins",

        email: "email",

        mobile: "phone"

    }

} as const;

export async function updateRecoveredPassword(
    role: AuthRole,
    email: string,
    newPassword: string
): Promise<AuthResult> {

    try {

        const supabase = getClient();

        const {

            data,

            error

        } = await supabase.functions.invoke(

            "update-password",

            {

             body: {
    role,
    email,
    password: newPassword
}

            }

        );

        if (error) {

            return {

                success: false,

                error: error.message

            };

        }

        if (!data?.success) {

            return {

                success: false,

                error:

                    data?.error ??

                    "Unable to update password."

            };

        }

        return {

            success: true

        };

    }

    catch (error: any) {

        return {

            success: false,

            error:

                error?.message ??

                "Unable to update password."

        };

    }

}

export async function updatePasswordWithRecoverySession(
    newPassword: string
): Promise<AuthResult> {

    try {

        const supabase = getClient();

        const {
            data: sessionData,
            error: sessionError
        } = await supabase.auth.getSession();

        if (sessionError) {

            return {
                success: false,
                error: sessionError.message
            };

        }

        if (!sessionData.session) {

            return {
                success: false,
                error:
                    "Your password reset link is invalid or has expired. Please request a new reset link."
            };

        }

        const {
            error
        } =
            await supabase.auth.updateUser({
                password: newPassword
            });

        if (error) {

            return {
                success: false,
                error: error.message
            };

        }

        return {
            success: true
        };

    }
    catch (error: any) {

        return {
            success: false,
            error:
                error?.message ??
                "Unable to update password."
        };

    }

}


export async function verifyRecoveryIdentity(
    role: AuthRole,
    email: string
): Promise<AuthResult> {

    const supabase = getClient();

    const { data, error } =
        await supabase.functions.invoke(
            "verify-recovery",
            {
                body: {
                    role,
                    email: email.trim()
                }
            }
        );

    if (error) {

        return {

            success: false,

            error:
                error.message

        };

    }

    return {

        success:
            data?.success === true,

        error:
            data?.error

    };

}

export async function sendPasswordResetEmail(
    email: string
): Promise<AuthResult> {

    try {

        const supabase = getClient();

        /*
         * PASSWORD RESET REDIRECT
         *
         * Always use the origin from which the user requested the reset.
         * Therefore:
         *   localhost -> http://localhost:3000/?reset-password=1
         *   Vercel     -> https://<current-vercel-domain>/?reset-password=1
         *
         * This keeps local and production flows identical and prevents a
         * reset link from accidentally pointing to a different deployment.
         * The corresponding redirect URLs must be allow-listed in Supabase.
         */
        const appUrl =
            window.location.origin.replace(/\/$/, "");

        const redirectTo =
            `${appUrl}/?reset-password=1`;

        const { error } =
            await supabase.auth.resetPasswordForEmail(
                email,
                {
                    redirectTo
                }
            );

        if (error) {

            return {

                success: false,

                error: error.message

            };

        }

        return {

            success: true

        };

    }

    catch (error: any) {

        return {

            success: false,

            error:
                error?.message ??
                "Unable to send reset email."

        };

    }

}
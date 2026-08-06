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

export type AuthRole =
    | "student"
    | "teacher"
    | "school"
    | "partner"
    | "admin";

export interface AuthResult {

    success: boolean;

    error?: string;

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

}

export interface SignUpResult
    extends AuthResult {

    userId?: string;

    email?: string;

    sessionExists?: boolean;

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

    parent_phone: string |null;

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

parentPhone:
    row.phone ?? undefined,

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

            requiresPasswordReset: true

        };

    }

}

      if (!resolved) {
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
                resolved.identity

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


export async function registerStudent(
    email: string,
    password: string
): Promise<SignUpResult> {

    try {

        const supabase =
            getClient();

        const {
            data,
            error
        } =
            await supabase.auth.signUp({

                email:
                    email.trim(),

                password

            });

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

        const user = data.user;

        if (!user) {

            return {

                success: false,

                error: "Unable to create authentication account."

            };

        }

        return {

            success: true,

            userId: user.id,

            email: user.email ?? undefined,

            sessionExists: data.session !== null

        };

    }

    catch (error: any) {

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

export async function verifyRecoveryIdentity(

    role:
        | "student"
        | "teacher"
        | "partner"
        | "school"
        | "admin",

    email: string,

    mobile: string

): Promise<AuthResult> {

    const supabase =
        getSupabaseClient();

    if (!supabase) {

        return {

            success: false,

            error: "Supabase is not initialized."

        };

    }


    
const {

    data,

    error

} = await (supabase as any).rpc(

    "verify_recovery_identity",

    {

        p_role: role,

        p_email: email.trim(),

        p_mobile: mobile.trim()

    }

);

if (error) {

    console.error(

        "Recovery RPC Error",

        error

    );

    return {

        success: false,

        error:

            "Unable to verify your identity."

    };

}

if (data !== true) {

    return {

        success: false,

        error:

            "Email and Mobile Number do not match our records."

    };

}

return {

    success: true

};

}

export async function sendPasswordResetEmail(
    email: string
): Promise<AuthResult> {

    try {

        const supabase = getClient();

        const redirectTo =
            `${window.location.origin}/reset-password`;

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
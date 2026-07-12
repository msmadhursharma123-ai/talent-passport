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

    class_name: string | null;

    section: string | null;

    parent_email: string | null;

    parent_phone: string |null;

    wallet_id?: string | null;

    passport_id?: string | null;

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

    school_uuid: string;

    auth_user_id: string | null;

    school_id: string;

    school_name: string;

    organization_uuid: string | null;

    organization_name: string | null;

    board_uuid: string | null;

    principal_name: string | null;

    is_active: boolean | null;

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
        .single();

    if (error) {

        return null;

    }

    return data as StudentRow;

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
            .single();

    if (error) {

        return null; 

    }

    return data as PartnerRow;

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

    const admin =
        await fetchAdminByAuthId(authUserId);

    if (admin) {

        return {

            role: "admin",

            identity: {

                adminId:
                    admin.id,

                adminName:
                    admin.admin_name,

                email:
                    admin.admin_email,

                role:
                    "admin"

            }

        };

    }

    const session = await getCurrentSession();

if (
    session?.user?.email
) {

    console.log(
        "No identity found. Bootstrapping student..."
    );

    const bootstrap =
        await bootstrapStudentIdentity({

            studentName:
                session.user.user_metadata?.full_name ??
                session.user.user_metadata?.name ??
                "New Student",

            studentEmail:
                session.user.email,

            studentCode:
                session.user.email
                    .replace("@", "_")
                    .replace(/\./g, "_"),

            schoolName: "",

            className: ""

        });

    if (bootstrap.success) {

        const student =
            await fetchStudentByAuthId(
                session.user.id
            );

        if (student) {

            return {

                role: "student",

                identity:
                    createStudentIdentity(student)

            };

        }

    }

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
            .single();

    if (error) {

        return null;

    }

    return data as AdminRow;

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
            row.is_active ?? true

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

        schoolUuid:
            row.school_uuid,

        schoolId:
            row.school_id,

        schoolName:
            row.school_name,

        organizationUuid:
            row.organization_uuid ?? undefined,

        organizationName:
            row.organization_name ?? undefined,

        boardUuid:
            row.board_uuid ?? undefined,

        principalName:
            row.principal_name ?? undefined,

        isActive:
            row.is_active ?? true

    });

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

      if (!resolved) {

    console.log(
        "No linked identity found. Attempting student bootstrap..."
    );

    const bootstrap = await bootstrapStudentIdentity({

       studentName:
    authUser.user_metadata?.full_name ??
    authUser.user_metadata?.name ??
    "New Student",

studentEmail:
    authUser.email ?? "",

studentCode:
    (authUser.email ?? "")
        .replace("@", "_")
        .replace(/\./g, "_"),

        schoolName: "",

        className: ""

    });

    if (bootstrap.success) {

        console.log(
            "Bootstrap successful. Restoring identity..."
        );

        return await restoreSession();

    }

    console.log(
        "Bootstrap failed. Signing out."
    );

    await supabase.auth.signOut();

    clearStudentIdentity();
    clearPartnerIdentity();
    clearAdminIdentity();
    clearAuthSession();

    return {

        success: false,

        error:
            bootstrap.error ??
            "No linked profile found."

    };

}

        /**
         * ==========================================
         * Identity Kernel Rule
         *
         * Never clear the active identity.
         * Only clear identities that belong
         * to other roles.
         * ==========================================
         */

        switch (resolved.role) {

            case "student":

                clearPartnerIdentity();
                clearAdminIdentity();

                saveStudentIdentity(
                    resolved.identity
                );

                break;

case "teacher":

    clearStudentIdentity();
    clearSchoolIdentity();
    clearPartnerIdentity();
    clearAdminIdentity();

    saveTeacherIdentity(
        resolved.identity
    );

    break;

case "school":

    clearStudentIdentity();
    clearTeacherIdentity();
    clearPartnerIdentity();
    clearAdminIdentity();

    saveSchoolIdentity(
        resolved.identity
    );

    break;

            case "partner":

                clearStudentIdentity();
                clearAdminIdentity();

                savePartnerIdentity(
                    resolved.identity
                );

                break;

            case "admin":

                clearStudentIdentity();
                clearPartnerIdentity();

                saveAdminIdentity(
                    resolved.identity
                );

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

                clearPartnerIdentity();
                clearAdminIdentity();

                saveStudentIdentity(
                    resolved.identity
                );

                break;

case "teacher":

    clearStudentIdentity();
    clearSchoolIdentity();
    clearPartnerIdentity();
    clearAdminIdentity();

    saveTeacherIdentity(
        resolved.identity
    );

    break;

case "school":

    clearStudentIdentity();
    clearTeacherIdentity();
    clearPartnerIdentity();
    clearAdminIdentity();

    saveSchoolIdentity(
        resolved.identity
    );

    break;

            case "partner":

                clearStudentIdentity();
                clearAdminIdentity();

                savePartnerIdentity(
                    resolved.identity
                );

                break;

            case "admin":

                clearStudentIdentity();
                clearPartnerIdentity();

                saveAdminIdentity(
                    resolved.identity
                );

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


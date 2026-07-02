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
    buildIdentity,
    saveStudentIdentity,
    clearStudentIdentity,
    markAuthSessionInitialized,
    clearAuthSession,
    hasAuthSession,
    getCurrentStudent,
    PartnerIdentity,
savePartnerIdentity,
clearPartnerIdentity,
getCurrentPartner,
AdminIdentity,
saveAdminIdentity,
clearAdminIdentity,
getCurrentAdmin
} from "./identityService";

export type AuthRole =
    | "student"
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

PartnerIdentity |

AdminIdentity;

}

export interface RestoreSessionResult
    extends AuthResult {

    identity?:

StudentIdentity |

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

            await supabase.auth.signOut();

            clearStudentIdentity();
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

export async function signOut():
Promise<AuthResult> {

    try {

        const supabase =
            getClient();

        await supabase.auth.signOut();

 clearStudentIdentity();

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

export async function initializeAuth():
Promise<void> {

    if (hasAuthSession()) {

        return;

    }

    await restoreSession();

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

    const partner =
        getCurrentPartner();

    if (partner) {

        return partner;

    }

    return getCurrentAdmin();

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


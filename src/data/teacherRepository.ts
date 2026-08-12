import { getSupabaseClient }
from "../supabaseClient";

import {

    buildTeacherIdentity,

    saveTeacherIdentity,

    TeacherIdentity

} from "../services/identityService";

import {
    isTeacherEmailAuthorizedForSchool
} from "./schoolTeacherAllowlistRepository";

/* ============================================================
   CREATE TEACHER PROFILE
============================================================ */

export interface CreateTeacherProfileRequest {

    fullName: string;

    email: string;

    phone: string;

    schoolUuid: string;

    schoolName: string;

    board: string;

    department: string;

    designation: string;

}

export async function createTeacherProfile(
    request: CreateTeacherProfileRequest
): Promise<TeacherIdentity | null> {

    const supabase =
        getSupabaseClient();

    if (!supabase)
        return null;

    const authorizedForSchool =
        await isTeacherEmailAuthorizedForSchool(
            request.email,
            request.schoolUuid
        );

    if (!authorizedForSchool) {
        throw new Error(
            "This teacher email is not authorized for the selected school. Please select the school assigned to this email."
        );
    }

    const {
        data: authData
    } = await supabase.auth.getUser();

    const authUser =
        authData.user;

    if (!authUser)
        return null;

    const teacherId =
        request.email
            .trim()
            .toLowerCase()
            .replace("@", "_")
            .replace(/\./g, "_");

    const payload = {
        teacher_id: teacherId,
        auth_user_id: authUser.id,
        full_name: request.fullName,
        email: request.email,
        phone: request.phone,
        school_uuid: request.schoolUuid,
        school_name: request.schoolName,
        department: request.department,
        designation: request.designation,
        account_status: "PENDING",
        profile_completed: false,
        is_active: true
    };

    /*
     * IMPORTANT:
     * If the teacher created the Auth account and saved the profile before
     * the browser was interrupted, retrying registration must UPDATE that
     * same profile instead of inserting a second teachers_master row.
     */
    const {
        data: existingTeacher
    } = await (supabase as any)
        .from("teachers_master")
        .select("*")
        .eq("auth_user_id", authUser.id)
        .maybeSingle();

    let teacher: any;
    let error: any;

    if (existingTeacher) {

        const result =
            await (supabase as any)
                .from("teachers_master")
                .update(payload)
                .eq(
                    "teacher_uuid",
                    existingTeacher.teacher_uuid
                )
                .select()
                .single();

        teacher = result.data;
        error = result.error;

    } else {

        const result =
            await (supabase as any)
                .from("teachers_master")
                .insert([payload])
                .select()
                .single();

        teacher = result.data;
        error = result.error;

        /*
         * A teacher email can also be unique. If a previous incomplete
         * profile exists for this exact Auth user, update it rather than
         * failing the onboarding retry.
         */
        if (
            error?.code === "23505" &&
            String(error?.message ?? "")
                .toLowerCase()
                .includes("email")
        ) {

            const {
                data: duplicateTeacher
            } = await (supabase as any)
                .from("teachers_master")
                .select("*")
                .eq(
                    "email",
                    request.email
                )
                .maybeSingle();

            if (
                duplicateTeacher &&
                duplicateTeacher.auth_user_id === authUser.id
            ) {

                const retry =
                    await (supabase as any)
                        .from("teachers_master")
                        .update(payload)
                        .eq(
                            "teacher_uuid",
                            duplicateTeacher.teacher_uuid
                        )
                        .select()
                        .single();

                teacher = retry.data;
                error = retry.error;
            }
        }
    }

    if (error) {
        console.error(
            "CREATE / UPDATE TEACHER PROFILE ERROR:",
            error
        );
        return null;
    }

    if (!teacher) {
        return null;
    }

    const identity =
        buildTeacherIdentity({
            authUserId:
                teacher.auth_user_id,
            teacherUuid:
                teacher.teacher_uuid,
            teacherId:
                teacher.teacher_id,
            teacherName:
                teacher.full_name,
            email:
                teacher.email,
            phone:
                teacher.phone,
            schoolUuid:
                teacher.school_uuid,
            schoolName:
                teacher.school_name,
            boardUuid:
                teacher.board_uuid,
            department:
                teacher.department,
            designation:
                teacher.designation,
            profileCompleted:
                teacher.profile_completed,
            isActive:
                teacher.is_active,
            role:
                "teacher",
            permissions:
                []
        });

    saveTeacherIdentity(identity);

    return identity;
}

export async function doesTeacherProfileExist(
authUserId:string
):Promise<boolean>{

const supabase =
getSupabaseClient();

if(!supabase){
return false;
}

const {

data

} = await supabase

.from("teachers_master")

.select("id")

.eq("auth_user_id",authUserId)

.maybeSingle();


return !!data;

}
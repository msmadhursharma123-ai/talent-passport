import { getSupabaseClient }
from "../supabaseClient";

import {

    buildTeacherIdentity,

    saveTeacherIdentity,

    TeacherIdentity

} from "../services/identityService";

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

    teacher_id:
        teacherId,

    auth_user_id:
        authUser.id,

    full_name:
        request.fullName,

    email:
        request.email,

    phone:
        request.phone,

    school_uuid:
    request.schoolUuid,

school_name:
    request.schoolName,

    department:
        request.department,

    designation:
        request.designation, 

    account_status:
    "PENDING",

    profile_completed:
    false,

    is_active:
        true

};

const {

    data: teacher,

    error

} = await (supabase as any)

    .from("teachers_master")

    .insert([

        payload

    ])

    .select()

    .single();

if (error) {

    console.error(error);

    return null;

}

if (!teacher) {

    return null;

}

const identity = buildTeacherIdentity({

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

saveTeacherIdentity(
    identity
);

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
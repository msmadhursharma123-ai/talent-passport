import { getSupabaseClient } from "../../../supabaseClient";
export interface SchoolRecord { schoolUuid:string; schoolName:string; board:string; city:string; isActive:boolean; studentProfileLimit:number; teacherProfileLimit:number; schoolAdminProfileLimit:number; studentProfilesUsed:number; teacherProfilesUsed:number; schoolAdminProfilesUsed:number; }
export interface SchoolProfileLimits { studentProfileLimit:number; teacherProfileLimit:number; schoolAdminProfileLimit:number; }
export interface SchoolSubscriptionDetails {

    subscriptionPlan: string;

    subscriptionStartDate: string;

    subscriptionEndDate: string;

    subscriptionStatus: string;

    gracePeriodDays: number;

    subscriptionNotes?: string;

}
export async function getSchools():Promise<SchoolRecord[]>{const supabase=getSupabaseClient();if(!supabase)return[];const{data,error}=await(supabase as any).from("schools_master").select("school_uuid,school_name,board,city,account_status,student_profile_limit,teacher_profile_limit,school_admin_profile_limit,student_profiles_used,teacher_profiles_used,school_admin_profiles_used").order("school_name",{ascending:true});if(error){console.error(error);return[];}return(data??[]).map((s:any)=>({schoolUuid:s.school_uuid,schoolName:s.school_name,board:s.board??"",city:s.city??"",isActive:s.account_status==="ACTIVE",studentProfileLimit:Number(s.student_profile_limit??0),teacherProfileLimit:Number(s.teacher_profile_limit??0),schoolAdminProfileLimit:Number(s.school_admin_profile_limit??0),studentProfilesUsed:Number(s.student_profiles_used??0),teacherProfilesUsed:Number(s.teacher_profiles_used??0),schoolAdminProfilesUsed:Number(s.school_admin_profiles_used??0)}));}
export async function createSchool(

    schoolName: string,

    board: string,

    city: string,

    limits: SchoolProfileLimits,

    subscription: SchoolSubscriptionDetails

): Promise<string | null> {

    const supabase =
        getSupabaseClient();

    if (!supabase)
        return null;

    const {

        data,

        error

    } = await (supabase as any)

        .from("schools_master")

        .insert({

            school_name:
                schoolName.trim(),

            board:
                board.trim(),

            city:
                city.trim(),

            account_status:
                "ACTIVE",

            student_profile_limit:
                limits.studentProfileLimit,

            teacher_profile_limit:
                limits.teacherProfileLimit,

            school_admin_profile_limit:
                limits.schoolAdminProfileLimit,

            student_profiles_used: 0,

            teacher_profiles_used: 0,

            school_admin_profiles_used: 0,

            subscription_plan:
                subscription.subscriptionPlan,

            subscription_start_date:
                subscription.subscriptionStartDate,

            subscription_end_date:
                subscription.subscriptionEndDate,

            subscription_status:
                subscription.subscriptionStatus,

            grace_period_days:
                subscription.gracePeriodDays,

            subscription_notes:
                subscription.subscriptionNotes ?? null

        })

        .select("school_uuid")

        .single();

    if (error) {

        console.error(error);

        return null;

    }

    return data.school_uuid;

}
export async function updateSchool(schoolUuid:string,schoolName:string,board:string,city:string,limits:SchoolProfileLimits):Promise<boolean>{const supabase=getSupabaseClient();if(!supabase)return false;const{error}=await(supabase as any).from("schools_master").update({school_name:schoolName.trim(),board:board.trim(),city:city.trim(),student_profile_limit:limits.studentProfileLimit,teacher_profile_limit:limits.teacherProfileLimit,school_admin_profile_limit:limits.schoolAdminProfileLimit}).eq("school_uuid",schoolUuid);if(error){console.error(error);return false;}return true;}
export async function deactivateSchool(schoolUuid:string):Promise<boolean>{const supabase=getSupabaseClient();if(!supabase)return false;const{error}=await(supabase as any).from("schools_master").update({account_status:"INACTIVE"}).eq("school_uuid",schoolUuid);if(error){console.error(error);return false;}return true;}

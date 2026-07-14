import { getSupabaseClient } from "../../../supabaseClient";

export interface SchoolRecord {

    schoolUuid: string;

    schoolName: string;

    board: string;

    city: string;

    isActive: boolean;

}

export async function getSchools(): Promise<SchoolRecord[]> {

    const supabase = getSupabaseClient();

    if (!supabase) {

        return [];

    }

    const {

        data,

        error

    } = await supabase

        .from("schools_master")

       .select(`
    school_uuid,
    school_name,
    board,
    city,
    account_status
`)

        .order(
            "school_name",
            {
                ascending: true
            }
        );

    if (error) {

        console.error(error);

        return [];

    }

    return (data ?? []).map((school: any) => ({

        schoolUuid:
            school.school_uuid,

        schoolName:
            school.school_name,

        board:
            school.board ?? "",

        city:
            school.city ?? "",

       isActive:
    school.account_status === "ACTIVE"

    }));

}

export async function createSchool(

    schoolName: string,

    board: string,

    city: string

): Promise<boolean> {

    const supabase = getSupabaseClient();

    if (!supabase) {

        return false;

    }

const { error } = await (supabase as any)

        .from("schools_master")

        .insert({

            school_name: schoolName,

            board,

            city,

            account_status: "ACTIVE"

        });

    if (error) {

        console.error(error);

        return false;

    }

    return true;

}

export async function updateSchool(

    schoolUuid: string,

    schoolName: string,

    board: string,

    city: string

): Promise<boolean> {

    const supabase = getSupabaseClient();

    if (!supabase) {

        return false;

    }

 const { error } = await (supabase as any)

        .from("schools_master")

        .update({

            school_name: schoolName,

            board,

            city

        })

        .eq(

            "school_uuid",

            schoolUuid

        );

    if (error) {

        console.error(error);

        return false;

    }

    return true;

}

export async function deactivateSchool(

    schoolUuid: string

): Promise<boolean> {

    const supabase = getSupabaseClient();

    if (!supabase) {

        return false;

    }

const { error } = await (supabase as any)

        .from("schools_master")

      .update({

    account_status:"INACTIVE"

})

        .eq(

            "school_uuid",

            schoolUuid

        );

    if (error) {

        console.error(error);

        return false;

    }

    return true;

}
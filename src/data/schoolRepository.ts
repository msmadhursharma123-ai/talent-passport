import { getSupabaseClient }
from "../supabaseClient";

export interface SchoolOption {

    schoolUuid: string;

    schoolName: string;

    board: string;

}

export async function getSchools()
: Promise<SchoolOption[]> {

    const supabase =
        getSupabaseClient();

    if (!supabase)
        return [];

    const {

        data,

        error

    } = await supabase

        .from("schools_master")

      .select(`
    school_uuid,
    school_name,
    board
`)
.eq(
    "account_status",
    "ACTIVE"
)

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


    
    return (

        data ??

        []

    ).map(

        (school: any) => ({

            schoolUuid:
            school.school_uuid,

        schoolName:
            school.school_name,

        board:
            school.board ?? ""

        })

    );

    

}

export async function updateSchoolProfile(

    schoolUuid:string,

    board:string,

    city:string,

    principalName:string,

    phone:string,

    website:string

):Promise<boolean>{

    const supabase =
        getSupabaseClient();

    if(!supabase){

        return false;

    }

  const schoolTable: any =

    supabase.from(

        "schools_master"

    );

const {

    error

}

=

await schoolTable

    .update({

        board,

        city,

        principal_name:

            principalName,

        phone,

        website,

        profile_completed: true

    })

    .eq(

        "school_uuid",

        schoolUuid

    );

    if(error){

        console.error(error);

        return false;

    }

    return true;

}
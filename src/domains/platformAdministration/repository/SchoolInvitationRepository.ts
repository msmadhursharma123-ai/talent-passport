import { getSupabaseClient } from "../../../supabaseClient";

import {
    SchoolAdminInvitation
} from "../types/SchoolAdminInvitation";

import {
    mapInvitationFromDatabase,
    mapInvitationToDatabase
} from "../mapper/SchoolInvitationMapper";



export default class SchoolInvitationRepository {

    async getInvitations(): Promise<SchoolAdminInvitation[]> {

        const supabase = getSupabaseClient();

        if (!supabase) {

            return [];

        }

        const {

            data,

            error

        } = await (supabase as any)

            .from("school_admin_invitations")

            .select("*")

            .order(
                "created_at",
                {
                    ascending:false
                }
            );

        if (error) {

            console.error(error);

            return [];

        }

        return (data ?? []).map(

            mapInvitationFromDatabase

        );

    }

    async createInvitation(

        invitation: SchoolAdminInvitation

    ): Promise<boolean> {

console.log("Repository createInvitation called");

        const supabase = getSupabaseClient();

        if (!supabase) {

            return false;

        }

        const {

            error

        } = await (supabase as any)

            .from("school_admin_invitations")

            .insert(

                mapInvitationToDatabase(

                    invitation

                  ) as any

            );

        if (error) {

            console.error(error);

            return false;

        }

        return true;

    }

    async getInvitationByToken(

        token:string

    ): Promise<SchoolAdminInvitation | null>{

        const supabase = getSupabaseClient();

        if(!supabase){

            return null;

        }

        const {

            data,

            error

        } = await (supabase as any)

            .from("school_admin_invitations")

            .select("*")

            .eq(

                "invitation_token",

                token

            )

            .single();

        if(error){

            return null;

        }

        return mapInvitationFromDatabase(

            data

        );

    }

    async updateStatus(

        invitationUuid:string,

        status:string

    ):Promise<boolean>{

        const supabase=getSupabaseClient();

        if(!supabase){

            return false;

        }

      const invitationTable: any =
    supabase.from(
        "school_admin_invitations"
    );

const {
    error
} = await invitationTable
    .update({
        status
    })
    .eq(
        "invitation_uuid",
        invitationUuid
    );

        if(error){

            console.error(error);

            return false;

        }

        return true;

    }

async validateInvitationToken(

    token:string

): Promise<SchoolAdminInvitation | null>{

    const supabase = getSupabaseClient();

    if(!supabase){

        return null;

    }

    const {

        data,

        error

    } = await (supabase as any)

        .from(

            "school_admin_invitations"

        )

        .select("*")

        .eq(

            "invitation_token",

            token

        )

        .single();

    if(error){

        return null;

    }

    return mapInvitationFromDatabase(

        data

    );

}

async acceptInvitationToken(

    token:string

): Promise<boolean>{

    const supabase = getSupabaseClient();

    if(!supabase){

        return false;

    }

    const {

        error

    } = await (supabase as any)

        .from(

            "school_admin_invitations"

        )

        .update({

            status:"Accepted",

            accepted_at:

            new Date().toISOString()

        })

        .eq(

            "invitation_token",

            token

        );

    return !error;

}

async createSchoolAdmin(

    invitation: SchoolAdminInvitation,

    authUserId: string

): Promise<boolean> {

    const supabase = getSupabaseClient();

    if (!supabase) {

        return false;

    }

    const schoolAdminTable: any =

        supabase.from(

            "school_admins"

        );

    const {

        error

    }

    =

    await schoolAdminTable

        .insert({

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

account_status: "active",

last_login_at: null,

        });

    if (error) {

        console.error(error);

        return false;

    }

    return true;

}



}
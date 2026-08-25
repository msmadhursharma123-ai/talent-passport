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

        const normalizedToken = token?.trim();

        if(!normalizedToken){

            return null;

        }

        /*
         * Invitation validation happens before the School Admin is
         * authenticated. The invitations table is intentionally not exposed
         * directly to anonymous users. Use the narrow SECURITY DEFINER RPC
         * instead; it returns only the invitation fields required by the
         * public setup checkpoint.
         */
        const {

            data,

            error

        } = await (supabase as any).rpc(

            "get_school_admin_invitation_by_token",

            {
                p_token: normalizedToken
            }

        );

        if(error){

            console.error(
                "Unable to validate School Admin invitation token.",
                error
            );

            return null;

        }

        const row = Array.isArray(data)
            ? data[0]
            : data;

        if(!row){

            return null;

        }

        return {

            invitationUuid:
                String(row.invitation_uuid ?? ""),

            schoolUuid:
                String(row.school_uuid ?? ""),

            schoolName:
                String(row.school_name ?? ""),

            administratorName:
                String(row.administrator_name ?? ""),

            administratorEmail:
                String(row.administrator_email ?? ""),

            invitationToken:
                String(row.invitation_token ?? normalizedToken),

            status:
                row.status,

            createdAt:
                String(row.created_at ?? ""),

            expiresAt:
                row.expires_at ?? null,

            acceptedAt:
                row.accepted_at ?? null,

            createdBy:
                row.created_by ?? null

        } as SchoolAdminInvitation;

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

    return this.getInvitationByToken(token);

}

async acceptInvitationToken(

    token:string

): Promise<boolean>{

    const supabase = getSupabaseClient();

    if(!supabase){

        return false;

    }

    const normalizedToken = token?.trim();

    if(!normalizedToken){

        return false;

    }

    /*
     * The authenticated School Admin accepts only the invitation represented
     * by the current Auth user. The RPC owns the update so invitation RLS is
     * not weakened for the public setup flow.
     */
    const {

        data,

        error

    } = await (supabase as any).rpc(

        "accept_school_admin_invitation",

        {
            p_token: normalizedToken
        }

    );

    if(error){

        console.error(
            "Unable to accept School Admin invitation.",
            error
        );

        return false;

    }

    return data === true || data === "true";

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
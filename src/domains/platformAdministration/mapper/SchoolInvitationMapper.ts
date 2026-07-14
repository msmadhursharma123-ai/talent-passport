import { SchoolAdminInvitation } from "../types/SchoolAdminInvitation";

export function mapInvitationFromDatabase(
    row: any
): SchoolAdminInvitation {

    return {

        invitationUuid:
            row.invitation_uuid,

        schoolUuid:
            row.school_uuid,

        schoolName:
            row.school_name,

        administratorName:
            row.administrator_name,

        administratorEmail:
            row.administrator_email,

        invitationToken:
            row.invitation_token,

        status:
            row.status,

        createdAt:
            row.created_at,

        expiresAt:
            row.expires_at,

        acceptedAt:
            row.accepted_at,

        createdBy:
            row.created_by

    };

}

export function mapInvitationToDatabase(
    invitation: SchoolAdminInvitation
) {

    return {

        invitation_uuid:
            invitation.invitationUuid,

        school_uuid:
            invitation.schoolUuid,

        school_name:
            invitation.schoolName,

        administrator_name:
            invitation.administratorName,

        administrator_email:
            invitation.administratorEmail,

        invitation_token:
            invitation.invitationToken,

        status:
            invitation.status,

        created_at:
            invitation.createdAt,

        expires_at:
            invitation.expiresAt,

        accepted_at:
            invitation.acceptedAt,

        created_by:
            invitation.createdBy

    };

}
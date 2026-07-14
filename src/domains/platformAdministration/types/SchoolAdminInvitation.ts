export type InvitationStatus =
    | "Pending"
    | "Accepted"
    | "Expired"
    | "Cancelled";

export interface SchoolAdminInvitation {

    invitationUuid: string;

    schoolUuid: string;

    schoolName: string;

    administratorName: string;

    administratorEmail: string;

    invitationToken: string;

    status: InvitationStatus;

    createdAt: string;

    expiresAt: string | null;

    acceptedAt: string | null;

    createdBy: string | null;

}
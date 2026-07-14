import { useEffect, useState } from "react";

import SchoolInvitationRepository
from "../repository/SchoolInvitationRepository";

import {
    SchoolAdminInvitation
}
from "../types/SchoolAdminInvitation";

const repository =
new SchoolInvitationRepository();

export default function
useSchoolInvitationViewModel(){

const [

    invitations,

    setInvitations

] = useState<SchoolAdminInvitation[]>([]);

const [

    loading,

    setLoading

] = useState(false);

const [

    saving,

    setSaving

] = useState(false);

async function loadInvitations(){

    setLoading(true);

    const data =
    await repository.getInvitations();

    setInvitations(data);

    setLoading(false);

}

useEffect(()=>{

    loadInvitations();

},[]);

async function
generateInvitation(

    invitation:
    SchoolAdminInvitation

){

    setSaving(true);

    const success =
    await repository.createInvitation(
        invitation
    );

    if(success){

        await loadInvitations();

    }

    setSaving(false);

    return success;

}

async function
acceptInvitation(

    invitationUuid:string

){

    const success =
    await repository.updateStatus(

        invitationUuid,

        "Accepted"

    );

    if(success){

        await loadInvitations();

    }

    return success;

}

async function
expireInvitation(

    invitationUuid:string

){

    const success =
    await repository.updateStatus(

        invitationUuid,

        "Expired"

    );

    if(success){

        await loadInvitations();

    }

    return success;

}

const pendingCount =
invitations.filter(

    x=>x.status==="Pending"

).length;

const acceptedCount =
invitations.filter(

    x=>x.status==="Accepted"

).length;

const expiredCount =
invitations.filter(

    x=>x.status==="Expired"

).length;

async function createSchoolAdmin(

    invitation: SchoolAdminInvitation,

    authUserId: string

){

    return await repository.createSchoolAdmin(

        invitation,

        authUserId

    );

}

return{

    invitations,

    loading,

    saving,

    pendingCount,

    acceptedCount,

    expiredCount,

    loadInvitations,

    generateInvitation,

    createSchoolAdmin,

    acceptInvitation,

    expireInvitation

};

}
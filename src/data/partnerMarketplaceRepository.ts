import {
  getSupabaseClient
} from "../supabaseClient";

import {

  getTableIdentity,

  requireIdentity,

  requirePartnerIdentity

} from "../services/identityService";

/* ============================================================
   REPOSITORY IDENTITY HELPERS
============================================================ */

function currentStudentId(): string {

  return getTableIdentity(
    "partner_scholarship_offers"
  );

}

function currentPartnerId(): string {

  const identity =
    requireIdentity();

  const partnerId =
    identity.partnerId;

if (!partnerId) {

    throw new Error(
        "Partner identity not available."
    );

}

return partnerId;

}

export async function
createScholarshipOffer(
  offer: any
) {

  const supabase =
    getSupabaseClient() as any;

  if (!supabase) {
    return null;
  }

  /* ============================================================
     Resolve Partner Identity
  ============================================================ */

  const resolvedPartnerId =
    offer.partner_id ??
    currentPartnerId();

  /* ============================================================
     Build Payload
  ============================================================ */

const payload = {

  ...offer,

  partner_id:
    resolvedPartnerId,

  email:
    offer.email,

  phone:
    offer.phone,

  class_name:
    offer.class_name

};

  /* ============================================================
     Create Scholarship Offer
  ============================================================ */

  const {

    data,

    error

  } =
    await supabase

      .from(
        "partner_scholarship_offers"
      )

      .insert([payload])

      .select()

      .single();

  if (error) {

    console.error(

      "SCHOLARSHIP INSERT ERROR",

      error

    );

    throw error;


  }

  return data;

}

export async function
createWorkshopOffer(
  offer: any
) {

  const supabase =
    getSupabaseClient() as any;

  if (!supabase) {
    return null;
  }

  /* ============================================================
     Resolve Partner Identity
  ============================================================ */

  const resolvedPartnerId =
    offer.partner_id ??
    currentPartnerId();

  /* ============================================================
     Build Payload
  ============================================================ */

const payload = {

  ...offer,

  partner_id:
    resolvedPartnerId,

  email:
    offer.email,

  phone:
    offer.phone,

  class_name:
    offer.class_name

};

  /* ============================================================
     Create Workshop Offer
  ============================================================ */

  const {

    data,

    error

  } =
    await supabase

      .from(
        "partner_workshop_offers"
      )

      .insert([payload])

      .select()

      .single();

  if (error) {

    console.error(

      "WORKSHOP INSERT ERROR",

      error

    );

    return null;

  }

  return data;

}

export async function
createContactRequest(
  request: any
) {

  const supabase =
    getSupabaseClient() as any;

  if (!supabase) {
    return null;
  }

  /* ============================================================
     Resolve Partner Identity
  ============================================================ */

  const resolvedPartnerId =
    request.partner_id ??
    currentPartnerId();

  /* ============================================================
     Build Payload
  ============================================================ */

 const payload = {

  ...request,

  partner_id:
    resolvedPartnerId,

  email:
    request.email,

  phone:
    request.phone,

  class_name:
    request.class_name

};

  /* ============================================================
     Create Contact Request
  ============================================================ */

  const {

    data,

    error

  } =
    await supabase

      .from(
        "partner_contact_requests"
      )

      .insert([payload])

      .select()

      .single();

  if (error) {

    console.error(

      "CONTACT REQUEST INSERT ERROR",

      error

    );

    return null;

  }

  return data;

}

export async function
fetchStudentScholarshipOffers(
  studentId?: string
) {

  const supabase =
    getSupabaseClient() as any;

  if (!supabase) {
    return [];
  }

  const resolvedStudentId =
    studentId ??
    currentStudentId();

    console.log(
    "SCHOLARSHIP STUDENT ID",
    resolvedStudentId
);

  const {
    data,
    error
  } =
    await supabase
      .from(
        "partner_scholarship_offers"
      )
      .select("*")
      .eq(
        "student_id",
        resolvedStudentId
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );

      console.log(
    "SCHOLARSHIP RESULTS",
    data
);

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}

export async function
fetchStudentWorkshopOffers(
  studentId?: string
) {

  const supabase =
    getSupabaseClient() as any;

  if (!supabase) {
    return [];
  }

  const resolvedStudentId =
    studentId ??
    currentStudentId();

console.log(
    "WORKSHOP STUDENT ID",
    resolvedStudentId
);

  const {
    data,
    error
  } =
    await supabase
      .from(
        "partner_workshop_offers"
      )
      .select("id,status,workshop_title,partner_name")
      .eq(
        "student_id",
        resolvedStudentId
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );

console.log(
    "WORKSHOP RESULTS",
    data
);

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}

export async function
fetchStudentContactRequests(
  studentId?: string
) {

  const supabase =
    getSupabaseClient() as any;

  if (!supabase) {
    return [];
  }

  const resolvedStudentId =
    studentId ??
    currentStudentId();

console.log(
    "CONTACT STUDENT ID",
    resolvedStudentId
);

  const {
    data,
    error
  } =
    await supabase
      .from(
        "partner_contact_requests"
      )
      .select("id,status,partner_name")
      .eq(
        "student_id",
        resolvedStudentId
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );

  console.log(
    "CONTACT RESULTS",
    data
  );

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}

export async function fetchPartnerScholarshipOffers(
  partnerId?: string
) {

  const supabase =
    getSupabaseClient() as any;

  if (!supabase) {
    return [];
  }

  const resolvedPartnerId =
    partnerId ??
    currentPartnerId();

  const {
    data,
    error
  } =
    await supabase

      .from("partner_scholarship_offers")

      .select("*")

      .eq(
        "partner_id",
        resolvedPartnerId
      )

      .order(
        "created_at",
        {
          ascending: false
        }
      );

  if (error) {

    console.error(error);

    return [];

  }

  return data ?? [];

}

export async function fetchPartnerWorkshopOffers(
  partnerId?: string
) {

  const supabase =
    getSupabaseClient() as any;

  if (!supabase) return [];

  const resolvedPartnerId =
    partnerId ??
    currentPartnerId();

  const {
    data,
    error
  } =
    await supabase

      .from("partner_workshop_offers")

      .select("*")

      .eq(
        "partner_id",
        resolvedPartnerId
      )

      .order(
        "created_at",
        {
          ascending: false
        }
      );

  if (error) {

    console.error(error);

    return [];

  }

  return data ?? [];

}

export async function fetchPartnerContactRequests(
  partnerId?: string
) {

  const supabase =
    getSupabaseClient() as any;

  if (!supabase) return [];

  const resolvedPartnerId =
    partnerId ??
    currentPartnerId();

  const {
    data,
    error
  } =
    await supabase

      .from("partner_contact_requests")

      .select("*")

      .eq(
        "partner_id",
        resolvedPartnerId
      )

      .order(
        "created_at",
        {
          ascending: false
        }
      );

  if (error) {

    console.error(error);

    return [];

  }

  return data ?? [];

}

export async function
fetchIncomingRequests(
  partnerId: string
) {

  const supabase =
    getSupabaseClient() as any;

  const {
    data,
    error
  } =
    await supabase
      .from(
        "partner_incoming_requests"
      )
      .select("*")
      .eq(
        "partner_id",
        partnerId
      )
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

  return data || [];
}

// ======================================
// PARTNER PIPELINE
// ======================================

export async function
fetchPartnerPipeline(
  partnerId: string
) {

  const [
    scholarships,
    workshops,
    contacts
  ] = await Promise.all([

    fetchPartnerScholarshipOffers(
      partnerId
    ),

    fetchPartnerWorkshopOffers(
      partnerId
    ),

    fetchPartnerContactRequests(
      partnerId
    )

  ]);

  return [

    ...(scholarships || []).map(
      (item: any) => ({
        ...item,
        type: "Scholarship"
      })
    ),

    ...(workshops || []).map(
      (item: any) => ({
        ...item,
        type: "Workshop"
      })
    ),

    ...(contacts || []).map(
      (item: any) => ({
        ...item,
        type: "Contact"
      })
    )

  ];
}

// ======================================
// DISCARD
// ======================================

export async function
discardScholarshipOffer(
  id: string
) {

  const supabase =
    getSupabaseClient() as any;

  return supabase
    .from(
      "partner_scholarship_offers"
    )
    .delete()
    .eq("id", id);
}

export async function
discardWorkshopOffer(
  id: string
) {

  const supabase =
    getSupabaseClient() as any;

  return supabase
    .from(
      "partner_workshop_offers"
    )
    .delete()
    .eq("id", id);
}

export async function
discardContactRequest(
  id: string
) {

  const supabase =
    getSupabaseClient() as any;

  return supabase
    .from(
      "partner_contact_requests"
    )
    .delete()
    .eq("id", id);
}

// ======================================
// RESEND
// ======================================

export async function
resendScholarshipOffer(
  id: string
) {

  const supabase =
    getSupabaseClient() as any;

  return supabase
    .from(
      "partner_scholarship_offers"
    )
    .update({
      created_at:
        new Date()
          .toISOString(),
      status: "pending"
    })
    .eq("id", id);
}

export async function
resendWorkshopOffer(
  id: string
) {

  const supabase =
    getSupabaseClient() as any;

  return supabase
    .from(
      "partner_workshop_offers"
    )
    .update({
      created_at:
        new Date()
          .toISOString(),
      status: "pending"
    })
    .eq("id", id);
}

export async function
resendContactRequest(
  id: string
) {

  const supabase =
    getSupabaseClient() as any;

  return supabase
    .from(
      "partner_contact_requests"
    )
    .update({
      created_at:
        new Date()
          .toISOString(),
      status: "pending"
    })
    .eq("id", id);
}

// ======================================
// STATUS UPDATE
// ======================================

export async function updateOfferStatus(
  tableName: string,
  id: string,
  status: string
) {

  const supabase =
    getSupabaseClient() as any;

  console.log(
    "UPDATE OFFER STATUS",
    {
      tableName,
      id,
      status
    }
  );

  const result =
    await supabase
      .from(tableName)
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select();

console.log("UPDATE RESULT", {
  data: result.data,
  error: result.error,
  count: result.data?.length
});

  return result;
}

export async function
updateOffer(
  tableName: string,
  id: string,
  payload: any
) {

  const supabase =
    getSupabaseClient() as any;

  return supabase
    .from(tableName)
    .update(payload)
    .eq("id", id);
}

// ======================================
// PARTNER DIRECTORY
// ======================================

export async function fetchPartners() {

  const supabase =
    getSupabaseClient() as any;

  if (!supabase) {
    return [];
  }

  const {
    data,
    error
  } =
    await supabase
      .from("partner_profiles")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false
        }
      );

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}

// ======================================
// STUDENT / PARENT REQUESTS
// ======================================

export async function
createIncomingRequest(
  request: any
) {

  const supabase =
    getSupabaseClient() as any;

  if (!supabase) {
    return null;
  }

  /* ============================================================
     Resolve Student Identity
  ============================================================ */

  const resolvedStudentId =
    request.student_id ??
    currentStudentId();

  /* ============================================================
     Build Payload
  ============================================================ */

  const payload = {

    ...request,

    student_id:
      resolvedStudentId,

    status:
      "pending",

    updated_at:
      new Date()
        .toISOString()

  };

  /* ============================================================
     Create Incoming Request
  ============================================================ */

  const {

    data,

    error

  } =
    await supabase

      .from(
        "partner_incoming_requests"
      )

      .insert([payload])

      .select()

      .single();

  if (error) {

    console.error(

      "INCOMING REQUEST INSERT ERROR",

      error

    );

    return null;

  }

  return data;

}

// ======================================
// MY REQUESTS
// ======================================

export async function
fetchStudentRequests(
  studentId?: string
) {

  const supabase =
    getSupabaseClient() as any;

  if (!supabase) {
    return [];
  }

  const resolvedStudentId =
    studentId ??
    currentStudentId();

  const {
    data,
    error
  } =
    await supabase
      .from(
        "partner_incoming_requests"
      )
      .select("*")
      .eq(
        "student_id",
        resolvedStudentId
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}

// ======================================
// ACCEPT / REJECT
// SCHOLARSHIP
// ======================================

export async function acceptScholarshipOffer(
  id:string
){

    const supabase =
      getSupabaseClient() as any;

    const { data } =
      await supabase
      .from("partner_scholarship_offers")
      .select("*")
      .eq("id",id)
      .single();
console.table({
    email: data.email,
    phone: data.phone,
    class_name: data.class_name,
    student_name: data.student_name,
    student_id: data.student_id
});


   console.log(
  "ACCEPT SCHOLARSHIP",
  id
);

await updateOfferStatus(
  "partner_scholarship_offers",
  id,
  "accepted"
);

    if(data){

       await createLead({

    partner_id: data.partner_id,

    partner_uuid: data.partner_uuid,

    partner_name: data.partner_name,

    student_id: data.student_id,

    student_name: data.student_name,

    school_name: data.school_name,

    email: data.email,

    phone: data.phone,

    class_name: data.class_name,

    request_type: "Scholarship",

    lead_source: "outgoing",

    status: "new_lead",

    notes: ""

});

    }

}

export async function rejectScholarshipOffer(
  id: string
) {
  return updateOfferStatus(
    "partner_scholarship_offers",
    id,
    "rejected"
  );
}

// ======================================
// ACCEPT / REJECT
// WORKSHOP
// ======================================

export async function acceptWorkshopOffer(
  id: string
) {
  const supabase = getSupabaseClient() as any;

  const { data } = await supabase
    .from("partner_workshop_offers")
    .select("*")
    .eq("id", id)
    .single();
console.log("SOURCE OFFER", data);

  console.log(
  "ACCEPT WORKSHOP",
  id
);

await updateOfferStatus(
  "partner_workshop_offers",
  id,
  "accepted"
);

  if (data) {
    await createLead({
      partner_id: data.partner_id,
      partner_uuid: data.partner_uuid,
      partner_name: data.partner_name,

      student_id: data.student_id,
      student_name: data.student_name,
      school_name: data.school_name,

      email: data.email,
      phone: data.phone,
      class_name: data.class_name,

      request_type: "Workshop",

      lead_source: "outgoing",

      status: "new_lead",

      notes: "",
    });
  }
}

export async function rejectWorkshopOffer(
  id: string
) {
  return updateOfferStatus(
    "partner_workshop_offers",
    id,
    "rejected"
  );
}

// ======================================
// ACCEPT / REJECT
// CONTACT
// ======================================

export async function acceptContactOffer(
  id: string
) {
  const supabase = getSupabaseClient() as any;

  const { data } = await supabase
    .from("partner_contact_requests")
    .select("*")
    .eq("id", id)
    .single();
console.log("SOURCE OFFER", data);


console.log(
  "ACCEPT CONTACT",
  id
);

await updateOfferStatus(
  "partner_contact_requests",
  id,
  "accepted"
);

  if (data) {
    await createLead({
      partner_id: data.partner_id,
      partner_uuid: data.partner_uuid,
      partner_name: data.partner_name,

      student_id: data.student_id,
      student_name: data.student_name,
      school_name: data.school_name,

      email: data.email,
      phone: data.phone,
      class_name: data.class_name,

      request_type: "Contact",

      lead_source: "outgoing",

      status: "new_lead",

      notes: "",
    });
  }
}

export async function rejectContactOffer(
  id: string
) {
  return updateOfferStatus(
    "partner_contact_requests",
    id,
    "rejected"
  );
}

export async function
createMarketplaceActivity(
  activity: {
    student_id?: string;
    activity_type: string;
    activity_title: string;
    partner_id: string;
    partner_name: string;
    status: string;
    metadata?: any;
  }
) {

  const supabase =
    getSupabaseClient() as any;

  if (!supabase) {
    return;
  }

  /* ============================================================
     Resolve Student Identity
  ============================================================ */

  const resolvedStudentId =
    activity.student_id ??
    currentStudentId();

  /* ============================================================
     Build Payload
  ============================================================ */

  const payload = {

    student_id:
      resolvedStudentId,

    activity_type:
      activity.activity_type,

    activity_title:
      activity.activity_title,

    partner_id:
      activity.partner_id,

    partner_name:
      activity.partner_name,

    status:
      activity.status,

    metadata:
      activity.metadata ?? {}

  };

  /* ============================================================
     Create Marketplace Activity
  ============================================================ */

  const {

    error

  } =
    await supabase

      .from(
        "student_marketplace_activity"
      )

      .insert([payload]);

  if (error) {

    console.error(

      "MARKETPLACE ACTIVITY INSERT ERROR",

      error

    );

  }

}

export async function
fetchMarketplaceActivity(
  studentId?: string
) {

  const supabase =
    getSupabaseClient() as any;

  if (!supabase) {
    return [];
  }

  const resolvedStudentId =
    studentId ??
    currentStudentId();

  const {
    data
  } =
    await supabase
      .from(
        "student_marketplace_activity"
      )
      .select("*")
      .eq(
        "student_id",
        resolvedStudentId
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );

  return data || [];
}

export async function fetchPartnerInbox(
  partnerId?: string
) {

  const supabase =
    getSupabaseClient() as any;

  if (!supabase) return [];

  const resolvedPartnerId =
    partnerId ??
    currentPartnerId();

  const {
    data,
    error
  } =
    await supabase

      .from("partner_inbox")

      .select("*")

      .eq(
        "partner_id",
        resolvedPartnerId
      )

      .order(
        "created_at",
        {
          ascending: false
        }
      );

  if (error) {

    console.error(error);

    return [];

  }

  return data ?? [];

}

export async function withdrawApplication(
  requestId: string
) {

  const supabase =
    getSupabaseClient();

  if (!supabase)
    return false;

  const { error } =
    await (supabase as any)
      .from(
        "partner_incoming_requests"
      )
      .update({
        withdrawn: true
      })
      .eq(
        "id",
        requestId
      );

  if (error) {
    console.error(error);
    return false;
  }

  return true;
}

// ======================================
// LEAD PIPELINE
// ======================================

export async function
createLead(
  lead: any
) {

  const supabase =
    getSupabaseClient() as any;

  if (!supabase) {
    return null;
  }

  /* ============================================================
     Resolve Identity
  ============================================================ */

  const resolvedStudentId =
    lead.student_id ??
    currentStudentId();

  const resolvedPartnerId =
    lead.partner_id ??
    currentPartnerId();

  const resolvedPartnerUuid =
    lead.partner_uuid;

  /* ============================================================
     Build Payload
  ============================================================ */

  const payload = {

    ...lead,

    student_id: resolvedStudentId,

    partner_id: resolvedPartnerId,

    partner_uuid: resolvedPartnerUuid

};

 

  /* ============================================================
     Create Lead
  ============================================================ */

console.log(
    "CREATE LEAD PAYLOAD",
    payload
);

console.log("================================");
console.log("INSERTING INTO partner_student_leads");
console.log(payload);


const {
  data: authData,
  error: authError,
} = await supabase.auth.getUser();

console.log("================================");
console.log("SUPABASE AUTH USER");
console.log(authData.user);

console.log("AUTH USER ID");
console.log(authData.user?.id);

console.log("PAYLOAD PARTNER UUID");
console.log(payload.partner_uuid);

console.log("PAYLOAD STUDENT ID");
console.log(payload.student_id);

console.log("================================");


  const {

    data,

    error

  } =
    await supabase

      .from(
        "partner_student_leads"
      )

      .insert([payload])

      .select()

      .single();

      console.log("================================");
console.log("INSERT RESPONSE");


console.log("INSERT DATA");
console.dir(data, { depth: null });

console.log("INSERT ERROR");
console.dir(error, { depth: null });

  if (error) {

    console.error(

      "CREATE LEAD ERROR",

      error

    );

    return null;

  }

  return data;

}

export async function fetchPartnerLeads(
  partnerId?: string
) {

  const supabase =
    getSupabaseClient() as any;

  if (!supabase) return [];

  const resolvedPartnerId =
    partnerId ??
    currentPartnerId();

  const {
    data,
    error
  } =
    await supabase

      .from("partner_student_leads")

      .select("*")

      .eq(
        "partner_id",
        resolvedPartnerId
      )

      .order(
        "created_at",
        {
          ascending: false
        }
      );

  if (error) {

    console.error(error);

    return [];

  }

  return data ?? [];

}

export async function
updateLeadStatus(
  leadId:string,
  status:string
) {

  const supabase =
    getSupabaseClient() as any;

  const result =
    await supabase
      .from(
        "partner_student_leads"
      )
      .update({
        status,
        updated_at:
          new Date()
            .toISOString()
      })
      .eq(
        "id",
        leadId
      );

  await createLeadActivity({

    lead_id:
      leadId,

    activity_type:
      "status_change",

    activity_note:
      `Status changed to ${status}`,

    created_by:
      "partner"

  });

  return result;
}

export async function
updateLeadNotes(
  leadId:string,
  notes:string
) {

  const supabase =
    getSupabaseClient() as any;

  const result =
    await supabase
      .from(
        "partner_student_leads"
      )
      .update({
        notes,
        updated_at:
          new Date()
            .toISOString()
      })
      .eq(
        "id",
        leadId
      );

  await createLeadActivity({

    lead_id:
      leadId,

    activity_type:
      "notes",

    activity_note:
      `Notes updated: ${notes}`,

    created_by:
      "partner"

  });

  return result;
}

export async function fetchLeadMetrics(
  partnerId: string
) {

  const leads =
    await fetchPartnerLeads(
      partnerId
    );

  return {

  total:
    leads.length,

  incoming:
    leads.filter(
      (l: any) =>
        l.lead_source ===
        "incoming"
    ).length,

  outgoing:
    leads.filter(
      (l: any) =>
        l.lead_source ===
        "outgoing"
    ).length,

  admissions:
    leads.filter(
      (l: any) =>
        l.status ===
        "admission_completed"
    ).length,

  rejected:
    leads.filter(
      (l: any) =>
        l.status ===
        "rejected"
    ).length
};
}

export async function fetchAllLeads() {

  const supabase =
    getSupabaseClient() as any;

  if (!supabase) return [];

  const { data, error } =
    await supabase
      .from("partner_student_leads")
      .select("*")
      .order(
        "created_at",
        { ascending: false }
      );

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}

export async function fetchAllocationHistory() {

  const leads =
    await fetchAllLeads();

  const partnerMap:
    Record<string, any> = {};

  leads.forEach((lead:any) => {

    const partner =
      lead.partner_name ||
      "Unknown";

    if (!partnerMap[partner]) {

      partnerMap[partner] = {
        partner_name: partner,
        total_leads: 0,
        admissions: 0
      };
    }

    partnerMap[partner]
      .total_leads++;

    if (
      lead.status ===
      "admission_completed"
    ) {

      partnerMap[partner]
        .admissions++;
    }
  });

  return Object.values(
    partnerMap
  ).map((row:any) => ({

    ...row,

    conversion_percentage:
      row.total_leads > 0
        ? Math.round(
            (
              row.admissions /
              row.total_leads
            ) * 100
          )
        : 0
  }));
}

export async function
createLeadActivity(
  activity:any
) {

  const supabase =
    getSupabaseClient() as any;

  return supabase
    .from(
      "partner_lead_activity"
    )
    .insert([activity]);
}

export async function
fetchLeadActivity(
  leadId:string
) {

  const supabase =
    getSupabaseClient() as any;

  const {
    data
  } =
    await supabase
      .from(
        "partner_lead_activity"
      )
      .select("*")
      .eq(
        "lead_id",
        leadId
      )
      .order(
        "created_at",
        {
          ascending:false
        }
      );

  return data || [];
}

export async function
updateLeadFollowup(
  leadId:string,
  nextDate:string
) {

  const supabase =
    getSupabaseClient() as any;

  const result =
    await supabase
      .from(
        "partner_student_leads"
      )
      .update({

        next_followup_date:
          nextDate,

        last_followup_date:
          new Date()
            .toISOString()

      })
      .eq(
        "id",
        leadId
      );

  await createLeadActivity({

    lead_id:
      leadId,

    activity_type:
      "followup",

    activity_note:
      `Follow up scheduled for ${nextDate}`,

    created_by:
      "partner"

  });

  return result;
}

export async function
logLeadCall(
  leadId:string
) {

  return createLeadActivity({

    lead_id: leadId,

    activity_type:
      "call",

    activity_note:
      "Parent called",

    created_by:
      "partner"

  });

}

export async function
logLeadWhatsapp(
  leadId:string
) {

  return createLeadActivity({

    lead_id: leadId,

    activity_type:
      "whatsapp",

    activity_note:
      "WhatsApp sent",

    created_by:
      "partner"

  });

}

export async function
logLeadCounselling(
  leadId:string
) {

  return createLeadActivity({

    lead_id: leadId,

    activity_type:
      "counselling",

    activity_note:
      "Counselling completed",

    created_by:
      "partner"

  });

}

export async function
logLeadAdmission(
  leadId:string
) {

  return createLeadActivity({

    lead_id: leadId,

    activity_type:
      "admission",

    activity_note:
      "Admission completed",

    created_by:
      "partner"

  });

}

export async function fetchAllocatedStudents(
  partnerId?: string
) {

  const supabase =
    getSupabaseClient() as any;

  if (!supabase) return [];

  const resolvedPartnerId =
    partnerId ??
    currentPartnerId();

  const {
    data,
    error
  } =
    await supabase

      .from("partner_student_leads")

      .select("*")

      .eq(
        "partner_id",
        resolvedPartnerId
      )

     .in("status", ["allocated"])

      .order(
        "created_at",
        {
          ascending: false
        }
      );

  if (error) {

    console.error(error);

    return [];

  }

    console.log(
    "ALLOCATED STUDENTS FROM DB",
    data
  );

  console.log(
    "FIRST STUDENT ID",
    data?.[0]?.student_id
  );

  console.log(
    "FIRST STUDENT OBJECT",
    data?.[0]
  );

  return data ?? [];

}

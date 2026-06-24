import {
  getSupabaseClient
} from "../supabaseClient";

export async function
createScholarshipOffer(
  offer: any
) {

  const supabase =
    getSupabaseClient() as any;

  if (!supabase) {
    return null;
  }

  const {
    data,
    error
  } =
    await supabase
      .from(
        "partner_scholarship_offers"
      )
      .insert([offer])
      .select()
      .single();

 if (error) {

  console.error(
    "SCHOLARSHIP INSERT ERROR",
    error
  );

  alert(
    JSON.stringify(error)
  );

  return null;
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

  const {
    data,
    error
  } =
    await supabase
      .from(
        "partner_workshop_offers"
      )
      .insert([offer])
      .select()
      .single();

  if (error) {
    console.error(error);
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

  const {
    data,
    error
  } =
    await supabase
      .from(
        "partner_contact_requests"
      )
      .insert([request])
      .select()
      .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function
fetchStudentScholarshipOffers(
  studentId: string
) {

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
      .from(
        "partner_scholarship_offers"
      )
      .select("*")
      .eq(
        "student_id",
        studentId
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

export async function
fetchStudentWorkshopOffers(
  studentId: string
) {

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
      .from(
        "partner_workshop_offers"
      )
      .select("*")
      .eq(
        "student_id",
        studentId
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

export async function
fetchStudentContactRequests(
  studentId: string
) {

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
      .from(
        "partner_contact_requests"
      )
      .select("*")
      .eq(
        "student_id",
        studentId
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

export async function
fetchPartnerScholarshipOffers(
  partnerId: string
) {

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
      .from(
        "partner_scholarship_offers"
      )
      .select("*")
      .eq(
        "partner_id",
        partnerId
      );

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}

export async function
fetchPartnerWorkshopOffers(
  partnerId: string
) {

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
      .from(
        "partner_workshop_offers"
      )
      .select("*")
      .eq(
        "partner_id",
        partnerId
      );

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}

export async function
fetchPartnerContactRequests(
  partnerId: string
) {

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
      .from(
        "partner_contact_requests"
      )
      .select("*")
      .eq(
        "partner_id",
        partnerId
      );

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
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

export async function
updateOfferStatus(
  tableName: string,
  id: string,
  status: string
) {

  const supabase =
    getSupabaseClient() as any;

  return supabase
    .from(tableName)
    .update({
      status
    })
    .eq(
      "id",
      id
    );
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

export async function createIncomingRequest(
  request: any
) {

  const supabase =
    getSupabaseClient() as any;

  if (!supabase) {
    return null;
  }

  const {
    data,
    error
  } =
    await supabase
      .from(
        "partner_incoming_requests"
      )
      .insert([
        {
          ...request,
          status: "pending",
          updated_at:
            new Date()
              .toISOString()
        }
      ])
      .select()
      .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

// ======================================
// MY REQUESTS
// ======================================

export async function fetchStudentRequests(
  studentId: string
) {

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
      .from(
        "partner_incoming_requests"
      )
      .select("*")
      .eq(
        "student_id",
        studentId
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
  id: string
) {
  return updateOfferStatus(
    "partner_scholarship_offers",
    id,
    "accepted"
  );
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
  return updateOfferStatus(
    "partner_workshop_offers",
    id,
    "accepted"
  );
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
  return updateOfferStatus(
    "partner_contact_requests",
    id,
    "accepted"
  );
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

export async function createMarketplaceActivity(
  activity: {
    student_id: string;
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

  if (!supabase) return;

  const { error } =
    await supabase
      .from(
        "student_marketplace_activity"
      )
      .insert([
        {
          student_id:
            activity.student_id,

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
            activity.metadata || {}
        }
      ]);

  if (error) {
    console.error(error);
  }
}

export async function fetchMarketplaceActivity(
  studentId: string
) {

 const supabase =
  getSupabaseClient() as any;

  if (!supabase)
    return [];

  const { data } =
    await supabase
      .from(
        "student_marketplace_activity"
      )
      .select("*")
      .eq(
        "student_id",
        studentId
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );

  return data || [];
}

export async function
fetchPartnerInbox(
  partnerId: string
) {

  const supabase =
    getSupabaseClient();

  if (!supabase) return [];

  const { data } =
    await supabase
      .from(
        "partner_contact_requests"
      )
      .select("*")
      .eq(
        "partner_id",
        partnerId
      )
      .order(
        "created_at",
        { ascending: false }
      );

  return data || [];
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

export async function createLead(
  lead: any
) {

  const supabase =
    getSupabaseClient() as any;

  if (!supabase)
    return null;

  const {
    data,
    error
  } =
    await supabase
      .from(
        "partner_student_leads"
      )
      .insert([lead])
      .select()
      .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function fetchPartnerLeads(
  partnerId: string
) {

  const supabase =
    getSupabaseClient() as any;

  if (!supabase)
    return [];

  const {
    data,
    error
  } =
    await supabase
      .from(
        "partner_student_leads"
      )
      .select("*")
      .eq(
        "partner_id",
        partnerId
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );

  if (error) {

    console.error(
      "FETCH LEADS ERROR",
      error
    );

    return [];
  }

  return data || [];
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


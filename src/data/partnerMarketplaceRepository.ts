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
  const identity = requirePartnerIdentity();

  if (!identity.partnerUuid) {
    throw new Error("Partner identity not available.");
  }

  return identity.partnerUuid;
}

function currentPartnerProfileId(): string {
  const identity = requirePartnerIdentity();

  if (!identity.partnerId) {
    throw new Error(
      "Partner profile ID not available."
    );
  }

  return identity.partnerId;
}

export async function createScholarshipOffer(
  offer: any
) {
  const supabase = getSupabaseClient() as any;

  if (!supabase) {
    return null;
  }

  console.log("====================================");
  console.log("CREATE SCHOLARSHIP OFFER");
  console.log("RAW OFFER");
  console.dir(offer, { depth: null });

  /* ============================================================
     Resolve Partner Identity
  ============================================================ */

  const resolvedPartnerId =
    offer.partner_id ??
    currentPartnerId();

  console.log("RESOLVED PARTNER ID");
  console.log(resolvedPartnerId);

  /* ============================================================
     Build Payload
  ============================================================ */

  const payload = {
    ...offer,

    partner_id: resolvedPartnerId,

    email: offer.email,

    phone: offer.phone,

    class_name: offer.class_name,
  };

  console.log("FINAL PAYLOAD");
  console.dir(payload, { depth: null });

  console.log("FINAL student_id =", payload.student_id);

  /* ============================================================
     Auth User
  ============================================================ */

  const {
    data: authData,
    error: authError,
  } = await supabase.auth.getUser();

  console.log("AUTH USER");
  console.dir(authData.user, { depth: null });

  console.log("AUTH USER ID");
  console.log(authData.user?.id);

  if (authError) {
    console.error("AUTH ERROR");
    console.error(authError);
  }

  /* ============================================================
     Insert
  ============================================================ */

  const { data, error } =
    await supabase
      .from("partner_scholarship_offers")
      .insert([payload])
      .select()
      .single();

  if (error) {
    console.error("SCHOLARSHIP INSERT ERROR");
    console.error(error);

    console.log("FAILED PAYLOAD");
    console.dir(payload, { depth: null });

    throw error;
  }

  console.log("INSERT SUCCESS");
  console.dir(data, { depth: null });

  return data;
}

export async function createWorkshopOffer(
  offer: any
) {
  const supabase = getSupabaseClient() as any;

  if (!supabase) {
    return null;
  }

  console.log("====================================");
  console.log("CREATE WORKSHOP OFFER");
  console.dir(offer, { depth: null });

  const resolvedPartnerId =
    offer.partner_id ??
    currentPartnerId();

  console.log("RESOLVED PARTNER ID");
  console.log(resolvedPartnerId);

  const payload = {
    ...offer,

    partner_id: resolvedPartnerId,

    email: offer.email,

    phone: offer.phone,

    class_name: offer.class_name,
  };

  console.log("FINAL PAYLOAD");
  console.dir(payload, { depth: null });

  const { data, error } =
    await supabase
      .from("partner_workshop_offers")
      .insert([payload])
      .select()
      .single();

  if (error) {
    console.error("WORKSHOP INSERT ERROR");
    console.error(error);

    console.log("FAILED PAYLOAD");
    console.dir(payload, { depth: null });

    return null;
  }

  console.log("WORKSHOP INSERT SUCCESS");
  console.dir(data, { depth: null });

  return data;
}

export async function createContactRequest(
  request: any
) {
  const supabase = getSupabaseClient() as any;

  if (!supabase) {
    return null;
  }

  console.log("====================================");
  console.log("CREATE CONTACT REQUEST");
  console.dir(request, { depth: null });

  const resolvedPartnerId =
    request.partner_id ??
    currentPartnerId();

  console.log("RESOLVED PARTNER ID");
  console.log(resolvedPartnerId);

  const payload = {
    ...request,

    partner_id: resolvedPartnerId,

    email: request.email,

    phone: request.phone,

    class_name: request.class_name,
  };

  console.log("FINAL PAYLOAD");
  console.dir(payload, { depth: null });

  const { data, error } =
    await supabase
      .from("partner_contact_requests")
      .insert([payload])
      .select()
      .single();

  if (error) {
    console.error("CONTACT INSERT ERROR");
    console.error(error);

    console.log("FAILED PAYLOAD");
    console.dir(payload, { depth: null });

    return null;
  }

  console.log("CONTACT INSERT SUCCESS");
  console.dir(data, { depth: null });

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
  const supabase = getSupabaseClient() as any;

  if (!supabase) {
    return [];
  }

  const resolvedPartnerId =
    partnerId ?? currentPartnerProfileId();

  console.log("===== SCHOLARSHIP QUERY =====");
  console.log("resolvedPartnerId =", resolvedPartnerId);

  const { data, error } = await supabase
    .from("partner_incoming_requests")
    .select("*")
    .eq("partner_id", resolvedPartnerId)
    .eq("request_type", "Scholarship")
    .order("created_at", {
      ascending: false,
    });

  console.log("Rows:", data?.length);
  console.log("Error:", error);
  console.table(data);

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

  if (!supabase) {
    return [];
  }

  const resolvedPartnerId =
    partnerId ??
    currentPartnerId();

  console.log(
    "WORKSHOP -> Resolved Partner ID:",
    resolvedPartnerId
  );

  const {
    data,
    error
  } =
    await supabase
      .from("partner_incoming_requests")
      .select("*")
      .eq(
        "partner_id",
        resolvedPartnerId
      )
      .eq(
        "request_type",
        "Workshop"
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

  if (!supabase) {
    return [];
  }

  const resolvedPartnerId =
    partnerId ??
    currentPartnerId();

  console.log(
    "CONTACT -> Resolved Partner ID:",
    resolvedPartnerId
  );

  const {
    data,
    error
  } =
    await supabase
      .from("partner_incoming_requests")
      .select("*")
      .eq(
        "partner_id",
        resolvedPartnerId
      )
      .eq(
        "request_type",
        "Contact"
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

export async function resolveMarketplacePartnerId(
  partnerUuid: string
) {
  const supabase = getSupabaseClient() as any;

  const { data, error } = await supabase
    .from("marketplace_partners")
    .select("id")
    .eq("partner_uuid", partnerUuid)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data?.id ?? null;
}
export async function fetchIncomingRequests(
  partnerUuid: string
) {

  console.log(
    "🔥🔥🔥 NEW FETCH INCOMING REQUESTS FUNCTION 🔥🔥🔥"
  );

  const supabase =
    getSupabaseClient() as any;

  if (!supabase) {
    return [];
  }

  /* ============================================================
     Resolve Both Partner Identities
  ============================================================ */

  const identity =
    requirePartnerIdentity();

  const partnerTextId =
    identity.partnerId;

  const marketplacePartnerId =
    await resolveMarketplacePartnerId(
      partnerUuid
    );

  console.log("================================");
  console.log("PIPELINE");
  console.log("Partner UUID:", partnerUuid);
  console.log("Partner Text ID:", partnerTextId);
  console.log("Marketplace Partner ID:", marketplacePartnerId);
  console.log("================================");

  console.log(
    "QUERY IDS",
    {
      partnerTextId,
      marketplacePartnerId
    }
  );

  /* ============================================================
     Build Query
  ============================================================ */

  let query =
    supabase
      .from(
        "partner_incoming_requests"
      )
      .select("*");

  if (
    partnerTextId &&
    marketplacePartnerId
  ) {

    console.log(
      "Using OR query for BOTH partner IDs"
    );

    query =
      query.or(
        `partner_id.eq.${partnerTextId},partner_id.eq.${marketplacePartnerId}`
      );

  } else if (partnerTextId) {

    console.log(
      "Using TEXT Partner ID only:",
      partnerTextId
    );

    query =
      query.eq(
        "partner_id",
        partnerTextId
      );

  } else if (marketplacePartnerId) {

    console.log(
      "Using MARKETPLACE Partner ID only:",
      marketplacePartnerId
    );

    query =
      query.eq(
        "partner_id",
        marketplacePartnerId
      );

  } else {

    console.error(
      "Unable to resolve any partner identity."
    );

    return [];
  }

  const {
    data,
    error
  } =
    await query.order(
      "created_at",
      {
        ascending: false
      }
    );

  console.log("================================");
  console.log("RAW QUERY RESULT");
  console.log("Returned Rows:", data?.length);
  console.log("Query Error:", error);

  console.table(
    (data || []).map(
      (r: any) => ({
        id: r.id,
        partner_id: r.partner_id,
        request_type: r.request_type,
        status: r.status,
        requester_name: r.requester_name,
      })
    )
  );

  console.log("================================");

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}

// ======================================
// PARTNER PIPELINE
// ======================================

export async function fetchPartnerPipeline(
  partnerUuid: string
) {
const partnerTextId =
    currentPartnerProfileId();

  if (!partnerTextId) {
    console.error(
      "Partner profile ID not found."
    );
    return [];
  }

  console.log("===== PARTNER PIPELINE =====");
  console.log("Partner UUID:", partnerUuid);
  console.log("Partner Text ID:", partnerTextId);

  const [
    scholarships,
    workshops,
    contacts
  ] = await Promise.all([

    fetchPartnerScholarshipOffers(
      partnerTextId
    ),

    fetchPartnerWorkshopOffers(
      partnerTextId
    ),

    fetchPartnerContactRequests(
      partnerTextId
    )

  ]);

  console.log("Scholarships:", scholarships);
  console.log("Workshops:", workshops);
  console.log("Contacts:", contacts);

  console.log(
    "Total:",
    (scholarships?.length ?? 0) +
    (workshops?.length ?? 0) +
    (contacts?.length ?? 0)
  );

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
   Remove student_uuid (table doesn't have this column)
============================================================ */

const {
    student_uuid,
    ...requestWithoutStudentUuid
} = request;

/* ============================================================
   Build Payload
============================================================ */

const payload = {

    ...requestWithoutStudentUuid,

    // Marketplace stores UUID in student_id
    student_id:
        resolvedStudentId,

    status:
        "pending",

    updated_at:
        new Date().toISOString()

};

console.log("INCOMING REQUEST PAYLOAD");
console.log(payload);

  /* ============================================================
     Create Incoming Request
  ============================================================ */

console.log("FINAL student_id =", payload.student_id);

const { data: authData, error: authError } =
  await supabase.auth.getUser();

console.log("AUTH USER =", authData.user);
console.log("AUTH USER ID =", authData.user?.id);

if (authError) {
  console.error("AUTH ERROR", authError);
}

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
        "INCOMING REQUEST INSERT ERROR"
    );

    console.error(error);

    console.log(
        "FAILED PAYLOAD"
    );

    console.dir(
        payload,
        { depth: null }
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

const query = await supabase
  .from("partner_incoming_requests")
  .select("*")
  .eq("student_id", resolvedStudentId)
  .order("created_at", { ascending: false });

console.log("RAW DATA");
console.table(query.data);
console.log(query.error);

const { data, error } = query;

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
  const supabase = getSupabaseClient() as any;

  const { data } = await supabase
    .from("partner_scholarship_offers")
    .select("*")
    .eq("id", id)
    .single();

  console.table({
    email: data?.email,
    phone: data?.phone,
    class_name: data?.class_name,
    student_name: data?.student_name,
    student_id: data?.student_id,
  });

  console.log("ACCEPT SCHOLARSHIP", id);

  await updateOfferStatus(
    "partner_scholarship_offers",
    id,
    "accepted"
  );

  if (data) {
    console.log("========== OUTGOING LEAD ==========");
    console.dir(data, { depth: null });

    try {
      const lead = await createLead({
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

        notes: "",
      });

      console.log("CREATE LEAD RESULT");
      console.dir(lead, { depth: null });
    } catch (e) {
      console.error("CREATE LEAD FAILED");
      console.error(e);
    }
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

  console.log("ACCEPT WORKSHOP", id);

  await updateOfferStatus(
    "partner_workshop_offers",
    id,
    "accepted"
  );

  if (data) {
    console.log("========== OUTGOING LEAD ==========");
    console.dir(data, { depth: null });

    try {
      const lead = await createLead({
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

      console.log("CREATE LEAD RESULT");
      console.dir(lead, { depth: null });
    } catch (e) {
      console.error("CREATE LEAD FAILED");
      console.error(e);
    }
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

  console.log("ACCEPT CONTACT", id);

  await updateOfferStatus(
    "partner_contact_requests",
    id,
    "accepted"
  );

  if (data) {
    console.log("========== OUTGOING LEAD ==========");
    console.dir(data, { depth: null });

    try {
      const lead = await createLead({
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

      console.log("CREATE LEAD RESULT");
      console.dir(lead, { depth: null });
    } catch (e) {
      console.error("CREATE LEAD FAILED");
      console.error(e);
    }
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
export async function createLead(
  lead: any
) {

  const supabase = getSupabaseClient() as any;

  if (!supabase) {
    return null;
  }

  const payload = {
    ...lead,
  };

  console.log("================================");
  console.log("CREATE LEAD");
  console.dir(payload, { depth: null });

/* ============================================================
   Every Accepted Interest Creates A New Lead

   Business Rule:
   - Never block duplicate enquiries.
   - Every acceptance becomes a CRM Lead.
   - Same student may enquire multiple times.
   - Incoming and Outgoing are both preserved.
   - Interest history is maintained through created_at.
============================================================ */

console.log("Creating a new CRM Lead...");

  /* ============================================================
     Insert New Lead
  ============================================================ */

  const {
    data,
    error,
  } = await supabase
    .from("partner_student_leads")
    .insert([payload])
    .select()
    .single();

  console.log("================================");
  console.log("INSERT RESPONSE");
  console.dir(data, { depth: null });
  console.dir(error, { depth: null });

  if (error) {
    console.error("CREATE LEAD ERROR", error);
    return null;
  }

  return data;
}

export async function fetchPartnerLeads(
  partnerId?: string
) {
  const supabase = getSupabaseClient() as any;

  if (!supabase) return [];

  const resolvedPartnerId =
    partnerId ??
    currentPartnerId();

  /* ==========================================
     Resolve Marketplace Partner ID
  ========================================== */

const identity = requirePartnerIdentity();

const partnerTextId = identity.partnerId;

const marketplacePartnerId =
  await resolveMarketplacePartnerId(
    resolvedPartnerId
  );

console.log("================================");
console.log("LEAD PIPELINE");
console.log("Partner UUID:", resolvedPartnerId);
console.log("Partner Text ID:", partnerTextId);
console.log("Marketplace Partner ID:", marketplacePartnerId);
console.log("================================");

let query = supabase
    .from("partner_student_leads")
    .select("*");

if (partnerTextId && marketplacePartnerId) {

  query = query.or(
    `partner_id.eq.${partnerTextId},partner_id.eq.${marketplacePartnerId}`
  );

} else if (partnerTextId) {

  query = query.eq(
    "partner_id",
    partnerTextId
  );

} else if (marketplacePartnerId) {

  query = query.eq(
    "partner_id",
    marketplacePartnerId
  );

} else {

  console.error(
    "Unable to resolve any partner identity."
  );

  return [];
}

const {
  data,
  error
} = await query.order(
  "created_at",
  {
    ascending: false,
  }
);

  console.log("LEADS RETURNED", data);

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


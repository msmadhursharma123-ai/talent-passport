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
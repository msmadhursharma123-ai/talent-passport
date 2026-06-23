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
    console.error(error);
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
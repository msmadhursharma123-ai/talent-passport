import { getSupabaseClient } from "../supabaseClient";

import {
  getTableIdentity,
  requireIdentity,
  requirePartnerIdentity
} from "../services/identityService";

/* ============================================================
   REPOSITORY IDENTITY HELPERS
============================================================ */

function currentStudentId(): string {
  return getTableIdentity("consultation_requests");
}

/* ============================================================
   TYPES
============================================================ */

export type CreateConsultationRequestInput = {

  studentId?: string;

  partnerId: string;

  category: string;

  skill: string;

  topic: string;

  description: string;

  consultationCredits: number;

  studentName?: string;

studentEmail?: string;

studentPhone?: string;

schoolName?: string;

className?: string;

partnerUuid?: string;

partnerName?: string;

};

/* ============================================================
   CREATE CONSULTATION REQUEST
============================================================ */

export async function createConsultationRequest(
  input: CreateConsultationRequestInput
) {

  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error(
      "Supabase client not initialized"
    );
  }

const identity =
  requireIdentity();

const resolvedStudentId =
  input.studentId ??
  currentStudentId();

const resolvedStudentUuid =
  identity.studentUuid;

console.log("================================");
console.log("CONSULTATION REQUEST");
console.log("partnerId =", input.partnerId);
console.log("studentId =", resolvedStudentId);
console.log("studentUuid =", resolvedStudentUuid);

  const {
    data,
    error
  } = await (supabase as any)

    .from("consultation_requests")



 .insert({

  student_id:
    resolvedStudentId,

  student_uuid:
    resolvedStudentUuid,

  partner_id:
    input.partnerId,

  category:
    input.category,

  skill:
    input.skill,

  topic:
    input.topic,

  description:
    input.description,

  consultation_credits:
    input.consultationCredits,

  status:
    "Pending"

})

    .select()

    .single();

  if (error) {
    throw error;
  }

  return data;

}


/* ============================================================
   CONSULTATION BOOKING REPOSITORY
============================================================ */

export interface CreateConsultationBookingInput {

  requestId: string;

  studentId: string;

  partnerId: string;

  creditsDeducted: number;

}

/* ============================================================
   CREATE CONSULTATION BOOKING
============================================================ */

export async function createConsultationBooking(

  input: CreateConsultationBookingInput

) {

  const supabase =
    getSupabaseClient();

  if (!supabase) {

    throw new Error(
      "Supabase client not available."
    );

  }

  /* ----------------------------------------------------------
     Identity
  ---------------------------------------------------------- */

  const identity =
    requireIdentity();

  const {

    data,

    error

  } =
    await (supabase as any)

      .from("consultation_bookings")

      .insert({

        request_id:
          input.requestId,

        // FK -> students_master.id
        student_id:
          input.studentId,

        // Identity -> students_master.student_uuid
        student_uuid:
          identity.studentUuid,

        partner_id:
          input.partnerId,

        // Temporary values.
        // Partner will update these after accepting the request.

        scheduled_date:
          new Date().toISOString().split("T")[0],

        scheduled_time:
          "00:00",

        duration_minutes:
          45,

        meeting_mode:
          "Pending",

        credits_deducted:
          input.creditsDeducted,

        booking_status:
          "Pending",

        booked_at:
          new Date()

      })

      .select()

      .single();

  if (error) {

    console.error(
      "CREATE CONSULTATION BOOKING ERROR",
      error
    );

    throw error;

  }

  return data;

}


/* ============================================================
   CONSULTATION REPOSITORY
   ------------------------------------------------------------
   This repository is ONLY for Consultation.
   Marketplace must never import from here.
============================================================ */

export async function resolveConsultationMarketplacePartnerId(
  partnerUuid?: string
): Promise<string | null> {

  const supabase = getSupabaseClient() as any;

  if (!supabase) return null;

  const identity = requirePartnerIdentity();

  const uuid =
    partnerUuid ??
    identity.partnerUuid;

  if (!uuid) return null;

  const {
    data,
    error,
  } = await supabase
    .from("marketplace_partners")
    .select("id")
    .eq("partner_uuid", uuid)
    .maybeSingle();

  if (error) {
    console.error(
      "CONSULTATION MARKETPLACE PARTNER RESOLVE ERROR",
      error
    );
    return null;
  }

  return data?.id ?? null;
}

/* ============================================================
   Resolve Partner Profile UUID
============================================================ */

export async function resolveConsultationPartnerUuid() {

  const identity =
    requirePartnerIdentity();

  return identity.partnerUuid;
}

/* ============================================================
   Resolve Partner Text ID
============================================================ */

export async function resolveConsultationPartnerTextId() {

  const identity =
    requirePartnerIdentity();

  return identity.partnerId;
}


// ============================================================
// CONSULTATION -> PARTNER INCOMING REQUEST
// ============================================================

export async function createConsultationIncomingRequest(
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


/* ============================================================
   CONSULTATION PARTNERS
   SOURCE OF TRUTH = marketplace_partners
============================================================ */

export async function
fetchConsultationPartners() {

  const supabase =
    getSupabaseClient() as any;

  if (!supabase) {
    return [];
  }

  const {
    data,
    error
  } = await supabase

    .from("marketplace_partners")

    .select(`
      id,
      partner_uuid,
      name,
      city,
      state,
      category,
      skills,
      consultation_duration,
      consultation_credits,
      rating,
      total_reviews,
      verified,
      featured
    `)

    .eq("active", true)

    .order(
      "featured",
      {
        ascending: false
      }
    )

    .order(
      "rating",
      {
        ascending: false
      }
    );

  if (error) {

    console.error(
      "CONSULTATION PARTNERS ERROR",
      error
    );

    return [];
  }

  return (data ?? []).map((partner: any) => ({

    // THIS IS THE IMPORTANT FK
    id: partner.id,

    // Identity
    partner_uuid: partner.partner_uuid,
  partner_id: partner.id,

    // UI
    institute_name: partner.name,
    institute_city: partner.city,
    category: partner.category,
    skill_focus: partner.skills ?? [],

    consultation_duration:
      partner.consultation_duration,

    consultation_credits:
      partner.consultation_credits,

    rating:
      partner.rating,

    total_reviews:
      partner.total_reviews,

    verified:
      partner.verified,

    featured:
      partner.featured

  }));

}
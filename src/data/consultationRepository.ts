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

/* ============================================================
   STUDENT CONSULTATION HISTORY
   ------------------------------------------------------------
   Read-only aggregation for the student's consultation ledger.
   Existing create/update flows are intentionally untouched.
============================================================ */

export async function fetchStudentConsultationHistory(
  studentId?: string
) {
  const supabase = getSupabaseClient() as any;

  if (!supabase) return [];

  const resolvedStudentId =
    studentId ?? currentStudentId();

  const { data: bookings, error: bookingError } =
    await supabase
      .from("consultation_bookings")
      .select("*")
      .eq("student_id", resolvedStudentId)
      .order("booked_at", { ascending: false });

  if (bookingError) {
    console.error(
      "STUDENT CONSULTATION HISTORY - BOOKINGS ERROR",
      bookingError
    );
    throw bookingError;
  }

  if (!bookings?.length) return [];

  const requestIds = Array.from(
    new Set(
      bookings
        .map((booking: any) => booking.request_id)
        .filter(Boolean)
    )
  );

  const partnerIds = Array.from(
    new Set(
      bookings
        .map((booking: any) => booking.partner_id)
        .filter(Boolean)
    )
  );

  const [requestResult, incomingResult, partnerResult] =
    await Promise.all([
      requestIds.length
        ? supabase
            .from("consultation_requests")
            .select("*")
            .in("id", requestIds)
        : Promise.resolve({ data: [], error: null }),

      requestIds.length
        ? supabase
            .from("partner_incoming_requests")
            .select("*")
            .in("consultation_request_id", requestIds)
        : Promise.resolve({ data: [], error: null }),

      partnerIds.length
        ? supabase
            .from("marketplace_partners")
            .select("*")
            .in("id", partnerIds)
        : Promise.resolve({ data: [], error: null })
    ]);

  if (requestResult.error) {
    console.error(
      "STUDENT CONSULTATION HISTORY - REQUESTS ERROR",
      requestResult.error
    );
    throw requestResult.error;
  }

  if (incomingResult.error) {
    console.error(
      "STUDENT CONSULTATION HISTORY - INCOMING STATUS ERROR",
      incomingResult.error
    );
    throw incomingResult.error;
  }

  if (partnerResult.error) {
    console.error(
      "STUDENT CONSULTATION HISTORY - PARTNER ERROR",
      partnerResult.error
    );
    throw partnerResult.error;
  }

  const requestsById = new Map(
    (requestResult.data ?? []).map((row: any) => [row.id, row])
  );

  const incomingByRequestId = new Map(
    (incomingResult.data ?? []).map((row: any) => [
      row.consultation_request_id,
      row
    ])
  );

  const partnersById = new Map(
    (partnerResult.data ?? []).map((row: any) => [row.id, row])
  );

  return bookings.map((booking: any) => {
    const request =
      requestsById.get(booking.request_id) ?? {};

    const incoming =
      incomingByRequestId.get(booking.request_id) ?? {};

    const partner =
      partnersById.get(booking.partner_id) ?? {};

    const rawStatus =
      incoming.status ??
      booking.booking_status ??
      request.status ??
      "pending";

    const normalizedStatus =
      String(rawStatus).toLowerCase();

    const accepted =
      normalizedStatus === "accepted";

    return {
      booking_id: booking.id,
      request_id: booking.request_id,
      booked_at: booking.booked_at,
      scheduled_date: booking.scheduled_date,
      scheduled_time: booking.scheduled_time,
      booking_status: booking.booking_status,
      credits_deducted: booking.credits_deducted,

      partner_id: booking.partner_id,
      partner_name:
        partner.name ??
        incoming.partner_name ??
        "Partner",
      partner_city:
        partner.city ?? "",

      // Only expose partner contact details after acceptance.
      partner_phone: accepted
        ? (
            partner.phone ??
            partner.mobile ??
            partner.phone_number ??
            partner.contact_phone ??
            partner.contact_mobile ??
            partner.whatsapp ??
            null
          )
        : null,

      partner_email: accepted
        ? (
            partner.email ??
            partner.email_address ??
            partner.contact_email ??
            null
          )
        : null,

      category: request.category ?? "",
      skill: request.skill ?? "",
      topic: request.topic ?? "",
      description:
        request.description ??
        incoming.message ??
        "",

      status: rawStatus
    };
  });
}

import { getSupabaseClient } from "../supabaseClient";
import { requireIdentity } from "../services/identityService";

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
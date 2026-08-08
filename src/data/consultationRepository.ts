import { getSupabaseClient } from "../supabaseClient";

import {
  getTableIdentity,
  requireIdentity
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
import { getSupabaseClient } from "../supabaseClient";

export type CreateConsultationRequestInput = {
  studentId: string;
  partnerId: string;
  category: string;
  skill: string;
  topic: string;
  description: string;
  consultationCredits: number;
};

export async function createConsultationRequest(
  input: CreateConsultationRequestInput
) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }

  const { data, error } = await (supabase as any)
    .from("consultation_requests")
   .insert({
  student_id: input.studentId,

  partner_id: input.partnerId,

  category: input.category,

  skill: input.skill,

  topic: input.topic,

  description: input.description,

  consultation_credits: input.consultationCredits,

  status: "Pending"
})
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
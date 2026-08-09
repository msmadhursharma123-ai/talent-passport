import { getSupabaseClient } from "../supabaseClient";

import {
  getTableIdentity
} from "../services/identityService";

/* ============================================================
   REPOSITORY IDENTITY HELPERS
============================================================ */

function currentStudentId(): string {
  return getTableIdentity("credit_transactions");
}

/* ============================================================
   TYPES
============================================================ */

export type CreateCreditTransactionInput = {

  studentId?: string;

  consultationRequestId?: string | null;

  transactionType:
    | "Credit"
    | "Debit";

  transactionCategory:
    | "Competition"
    | "Achievement"
    | "Portfolio"
    | "Consultation"
    | "Marketplace"
    | "Refund"
    | "Admin";

  credits: number;

  balanceBefore: number;

  balanceAfter: number;

  remarks?: string;

};

/* ============================================================
   CREATE CREDIT TRANSACTION
============================================================ */

export async function createCreditTransaction(
  input: CreateCreditTransactionInput
) {

  const supabase = getSupabaseClient();

  if (!supabase) {

    throw new Error(
      "Supabase client not initialized"
    );

  }

  const resolvedStudentId =
    input.studentId ??
    currentStudentId();

  const {
    data,
    error
  } = await (supabase as any)

    .from("credit_transactions")

 .insert({

      student_id:
        resolvedStudentId,

      booking_id:
        input.consultationRequestId,

      transaction_type:
        input.transactionType,

      source:
        input.transactionCategory,

      credits:
        input.credits,

      description:
        input.remarks ?? null,

      reference_id:
        input.consultationRequestId,

      created_by:
        "student"

})

    .select()

    .single();

  if (error) {
    throw error;
  }

  return data;

}

/* ============================================================
   STUDENT CONSULTATION SPEND
   ------------------------------------------------------------
   Returns the lifetime credits actually debited for
   consultations from the canonical credit ledger.
============================================================ */

export async function getStudentConsultationSpentCredits(
  studentId?: string
): Promise<number> {
  const supabase = getSupabaseClient() as any;

  if (!supabase) return 0;

  const resolvedStudentId =
    studentId ?? currentStudentId();

  const { data, error } =
    await supabase
      .from("credit_transactions")
      .select("credits, transaction_type, source")
      .eq("student_id", resolvedStudentId)
      .eq("transaction_type", "Debit")
      .eq("source", "Consultation");

  if (error) {
    console.error(
      "STUDENT CONSULTATION SPEND ERROR",
      error
    );
    throw error;
  }

  return (data ?? []).reduce(
    (total: number, row: any) =>
      total + Math.max(0, Number(row.credits) || 0),
    0
  );
}

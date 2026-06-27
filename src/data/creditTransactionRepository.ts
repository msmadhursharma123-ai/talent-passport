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

      consultation_request_id:
        input.consultationRequestId,

      transaction_type:
        input.transactionType,

      transaction_category:
        input.transactionCategory,

      credits:
        input.credits,

      balance_before:
        input.balanceBefore,

      balance_after:
        input.balanceAfter,

      remarks:
        input.remarks ?? null

    })

    .select()

    .single();

  if (error) {
    throw error;
  }

  return data;

}
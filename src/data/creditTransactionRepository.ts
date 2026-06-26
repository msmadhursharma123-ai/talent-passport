import { getSupabaseClient } from "../supabaseClient";

export type CreateCreditTransactionInput = {
  studentId: string;
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

  const { data, error } =
    await (supabase as any)
      .from("credit_transactions")
      .insert({

        student_id:
          input.studentId,

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
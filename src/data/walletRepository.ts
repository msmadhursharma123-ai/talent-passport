import { getSupabaseClient } from "../supabaseClient";
import { getTableIdentity } from "../services/identityService";

/* ============================================================
   REPOSITORY IDENTITY HELPERS
============================================================ */

function currentStudentId(): string {
  return getTableIdentity("student_wallets");
}

/* ============================================================
   GET STUDENT WALLET
============================================================ */

export async function getStudentWallet(
  studentId: string
) {

  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error(
      "Supabase client not initialized"
    );
  }

  const resolvedStudentId =
    studentId || currentStudentId();

  /* ----------------------------------------
     Fetch Existing Wallet
  ---------------------------------------- */

  const {
    data: wallet,
    error
  } = await (supabase as any)

    .from("student_wallets")

    .select("*")

    .eq("student_id", resolvedStudentId)

    .maybeSingle();

  if (error) {
    throw error;
  }

  /* ----------------------------------------
     Wallet Already Exists
  ---------------------------------------- */

  if (wallet) {
    return wallet;
  }

  /* ----------------------------------------
     Create Wallet Automatically
  ---------------------------------------- */

  const {
    data: newWallet,
    error: insertError
  } = await (supabase as any)

    .from("student_wallets")

    .insert({

      student_id: resolvedStudentId,

      available_credits: 0,

      spent_credits: 0,

      lifetime_earned: 0

    })

    .select()

    .single();

  if (insertError) {
    throw insertError;
  }

  return newWallet;

}

/* ============================================================
   UPDATE WALLET BALANCE
============================================================ */

export async function updateWalletBalance(
  walletId: string,
  balance: number
) {

  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error(
      "Supabase client not initialized"
    );
  }

  const {
    data,
    error
  } = await (supabase as any)

    .from("student_wallets")

    .update({

      available_credits: balance,

      updated_at: new Date().toISOString()

    })

    .eq("id", walletId)

    .select()

    .single();

  if (error) {
    throw error;
  }

  return data;

}

/* ============================================================
   UPDATE COMPLETE STUDENT WALLET
============================================================ */

export async function updateStudentWallet(

  studentId: string,

  availableCredits: number,

  spentCredits: number,

  lifetimeEarned: number

) {

  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error(
      "Supabase client not initialized"
    );
  }

  const resolvedStudentId =
    studentId || currentStudentId();

  const {
    data,
    error
  } = await (supabase as any)

    .from("student_wallets")

    .update({

      available_credits:
        availableCredits,

      spent_credits:
        spentCredits,

      lifetime_earned:
        lifetimeEarned,

      updated_at:
        new Date().toISOString()

    })

    .eq(
      "student_id",
      resolvedStudentId
    )

    .select()

    .single();

  if (error) {
    throw error;
  }

  return data;

}
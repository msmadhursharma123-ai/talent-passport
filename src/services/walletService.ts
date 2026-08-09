import {
  getStudentWallet,
  updateStudentWallet,
  updateWalletBalance
} from "../data/walletRepository";

import {
  getTableIdentity
} from "./identityService";

/* ============================================================
   WALLET SERVICE

   Responsibilities

   • Wallet synchronization
   • Credit deduction
   • Wallet business rules

   Never talks directly to Supabase.
   Always consumes repositories.
============================================================ */

/* ============================================================
   IDENTITY HELPER
============================================================ */

function resolveStudentId(
  studentId?: string
): string {

  return (
    studentId ??
    getTableIdentity(
      "student_wallets"
    )
  );

}

/* ============================================================
   SYNC STUDENT WALLET
============================================================ */

export async function syncStudentWallet(

  studentId: string,

  competitionCredits: number,

  achievementCredits: number,

  portfolioCredits: number,

  dailyFeedbackCredits: number = 0

) {

  const resolvedStudentId =
    resolveStudentId(studentId);

  /* ============================================
     Fetch Wallet
  ============================================ */

  const wallet =
    await getStudentWallet(
      resolvedStudentId
    );

  /* ============================================
     Calculate Wallet
  ============================================ */

  const lifetimeEarned =

    competitionCredits +

    achievementCredits +

    portfolioCredits +

    dailyFeedbackCredits;

  const availableCredits =

    lifetimeEarned -

    wallet.spent_credits;

  /* ============================================
     Debug Logging
  ============================================ */

  console.log("SYNC WALLET");

  console.log(
    "Student:",
    resolvedStudentId
  );

  console.log(
    "Competition:",
    competitionCredits
  );

  console.log(
    "Achievement:",
    achievementCredits
  );

  console.log(
    "Portfolio:",
    portfolioCredits
  );

  console.log(
    "Daily Feedback:",
    dailyFeedbackCredits
  );

  console.log(
    "Lifetime:",
    lifetimeEarned
  );

  console.log(
    "Available:",
    availableCredits
  );

  console.log(
    "Wallet Before:",
    wallet
  );

  /* ============================================
     Persist Wallet
  ============================================ */

  const result =

    await updateStudentWallet(

      resolvedStudentId,

      availableCredits,

      wallet.spent_credits,

      lifetimeEarned

    );

  console.log(
    "Wallet After:",
    result
  );

  return result;

}

/* ============================================================
   DEDUCT CONSULTATION CREDITS
============================================================ */

export async function deductConsultationCredits(

  studentId: string,

  credits: number

) {

  const resolvedStudentId =
    resolveStudentId(studentId);

  /* ============================================
     Fetch Wallet
  ============================================ */

  const wallet =
    await getStudentWallet(
      resolvedStudentId
    );

  /* ============================================
     Validate Balance
  ============================================ */

  if (
    wallet.available_credits <
    credits
  ) {

    throw new Error(
      "Insufficient Credits"
    );

  }

  /* ============================================
     Calculate New Balance
  ============================================ */

const newAvailableBalance =

    wallet.available_credits -

    credits;

const newSpentCredits =

    wallet.spent_credits +

    credits;

/* ============================================
Persist Wallet
============================================ */

await updateStudentWallet(

    resolvedStudentId,

    newAvailableBalance,

    newSpentCredits,

    wallet.lifetime_earned

);

  /* ============================================
     Return Transaction
  ============================================ */

  return {

    previousBalance:
      wallet.available_credits,

    currentBalance:
      newAvailableBalance

  };

}
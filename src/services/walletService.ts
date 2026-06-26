import {
  getStudentWallet,
  updateStudentWallet,
  updateWalletBalance
} from "../data/walletRepository";

/* ============================================================
   SYNC STUDENT WALLET
============================================================ */

export async function syncStudentWallet(

  studentId: string,

  competitionCredits: number,

  achievementCredits: number,

  portfolioCredits: number

) {

  const wallet =
    await getStudentWallet(studentId);

  const lifetimeEarned =
    competitionCredits +
    achievementCredits +
    portfolioCredits;

  const availableCredits =
    lifetimeEarned -
    wallet.spent_credits;

console.log("SYNC WALLET");
console.log("Student ID:", studentId);
console.log("Competition:", competitionCredits);
console.log("Achievement:", achievementCredits);
console.log("Portfolio:", portfolioCredits);
console.log("Lifetime:", lifetimeEarned);
console.log("Available:", availableCredits);
console.log("Wallet Before:", wallet);

const result = await updateStudentWallet(

  studentId,

  availableCredits,

  wallet.spent_credits,

  lifetimeEarned

);

console.log("Wallet After:", result);

return result;

}

/* ============================================================
   DEDUCT CONSULTATION CREDITS
============================================================ */

export async function deductConsultationCredits(

  studentId: string,

  credits: number

) {

  const wallet =
    await getStudentWallet(studentId);

  if (
    wallet.available_credits < credits
  ) {

    throw new Error(
      "Insufficient Credits"
    );

  }

  const newAvailableBalance =
    wallet.available_credits -
    credits;

  await updateWalletBalance(

    wallet.id,

    newAvailableBalance

  );

  return {

    previousBalance:
      wallet.available_credits,

    currentBalance:
      newAvailableBalance

  };

}
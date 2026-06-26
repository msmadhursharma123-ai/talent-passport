import {
  createConsultationRequest,
  CreateConsultationRequestInput
} from "../data/consultationRepository";

import {
  deductConsultationCredits
} from "./walletService";

import {
  createCreditTransaction
} from "../data/creditTransactionRepository";

export async function bookConsultation(
  input: CreateConsultationRequestInput
) {

  /* ============================================
     STEP 1
     Deduct Wallet Credits
  ============================================ */

  const walletTransaction =
    await deductConsultationCredits(
      input.studentId,
      input.consultationCredits
    );

  /* ============================================
     STEP 2
     Create Consultation Request
  ============================================ */

  const consultation =
    await createConsultationRequest(
      input
    );

  /* ============================================
     STEP 3
     Store Credit Ledger Entry
  ============================================ */

  await createCreditTransaction({

    studentId:
      input.studentId,

    consultationRequestId:
      consultation.id,

    transactionType:
      "Debit",

    transactionCategory:
      "Consultation",

    credits:
      input.consultationCredits,

    balanceBefore:
      walletTransaction.previousBalance,

    balanceAfter:
      walletTransaction.currentBalance,

    remarks:
      `Consultation booked with ${input.partnerId}`

  });

  /* ============================================
     STEP 4
     Return Complete Transaction
  ============================================ */

  return {

    consultation,

    wallet:
      walletTransaction

  };

}
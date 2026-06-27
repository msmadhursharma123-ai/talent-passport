import {
  createConsultationRequest,
  CreateConsultationRequestInput
} from "../data/consultationRepository";

import {
  createCreditTransaction
} from "../data/creditTransactionRepository";

import {
  deductConsultationCredits
} from "./walletService";

import {
  getTableIdentity
} from "./identityService";

/* ============================================================
   CONSULTATION SERVICE

   Responsibilities

   • Business orchestration
   • Wallet deduction
   • Consultation booking
   • Credit ledger

   Never talks directly to Supabase.
   Always consumes repositories/services.
============================================================ */

/* ============================================================
   IDENTITY HELPER
============================================================ */

function resolveStudentId(
  input: CreateConsultationRequestInput
): string {

  return (
    input.studentId ??
    getTableIdentity(
      "consultation_requests"
    )
  );

}

/* ============================================================
   BOOK CONSULTATION
============================================================ */

export async function bookConsultation(
  input: CreateConsultationRequestInput
) {

  /* ============================================
     Resolve Identity
  ============================================ */

  const studentId =
    resolveStudentId(input);

  /*
    Future Auth

    const identity =
      requireIdentity();

    Student Identity will automatically
    come from the Identity Kernel.
  */

  /* ============================================
     STEP 1
     Deduct Wallet Credits
  ============================================ */

  const walletTransaction =

    await deductConsultationCredits(

      studentId,

      input.consultationCredits

    );

  /* ============================================
     STEP 2
     Create Consultation Request
  ============================================ */

  const consultation =

    await createConsultationRequest({

      ...input,

      studentId

    });

  /* ============================================
     STEP 3
     Store Credit Ledger Entry
  ============================================ */

  await createCreditTransaction({

    studentId,

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
     Return Complete Result
  ============================================ */

  return {

    consultation,

    wallet:
      walletTransaction

  };

}
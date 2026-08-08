import {
  createConsultationRequest,
  CreateConsultationRequestInput
} from "../data/consultationRepository";

import {
  createConsultationBooking
} from "../data/consultationBookingRepository";

import {
  createCreditTransaction
} from "../data/creditTransactionRepository";

import {
  createIncomingRequest
} from "../data/partnerMarketplaceRepository";

import {
  deductConsultationCredits
} from "./walletService";

import {
  requireIdentity
} from "./identityService";




/* ============================================================
   CONSULTATION SERVICE

   Responsibilities

   • Business orchestration
   • Wallet deduction
   • Consultation booking
   • Partner Incoming Request
   • Credit ledger

   Never talks directly to Supabase.
   Always consumes repositories/services.
============================================================ */

/* ============================================================
   IDENTITY HELPER
============================================================ */

function resolveIdentity(
  input: CreateConsultationRequestInput
) {

  const identity =
    requireIdentity();

  return {

    masterStudentId:
      input.studentId ??
      identity.masterStudentId,

    studentUuid:
      identity.studentUuid

  };

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

const {

  masterStudentId,

  studentUuid

} = resolveIdentity(input);

  /*
    Future Auth

    const identity =
      requireIdentity();

    Student Identity will automatically
    come from the Identity Kernel.
  */


  /* ============================================
     STEP 2
     Create Consultation Request
  ============================================ */

console.log("========== CONSULTATION SERVICE ==========");
console.log("INPUT RECEIVED");
console.log(input);
console.log("partnerId =", input.partnerId);
console.log("masterStudentId =", masterStudentId);
console.log("studentUuid =", studentUuid);
console.log("==========================================");

const consultation =

await createConsultationRequest({

  ...input,

  studentId:
    masterStudentId

});

/* ============================================
   STEP 3
   Create Consultation Booking
============================================ */

const booking =

await createConsultationBooking({

  requestId:
    consultation.id,

  studentId:
    masterStudentId,

  partnerId:
    input.partnerId,

  creditsDeducted:
    input.consultationCredits

});

/* ============================================
   STEP 4
   Create Partner Incoming Request
============================================ */

console.log("========== INCOMING REQUEST ==========");
console.log({
  partner_id: input.partnerId,
  partner_uuid: input.partnerUuid,
  consultation_request_id: consultation.id
});
console.log("======================================");

const incomingRequest = await createIncomingRequest({

    partner_id: input.partnerId,
    partner_uuid: input.partnerUuid,

    student_id: studentUuid,

    partner_name: input.partnerName ?? "",
    requester_name: input.studentName ?? "",
    email: input.studentEmail ?? "",
    phone: input.studentPhone ?? "",
    school_name: input.schoolName ?? "",
    class_name: input.className ?? "",
    request_type: "Consultation",
    request_from: "Student",
    consultation_request_id: consultation.id,
    message: input.description

});

console.log("================================");
console.log("INCOMING REQUEST RESULT");
console.dir(incomingRequest, { depth: null });

if (!incomingRequest) {

    console.error(
        "CONSULTATION -> Incoming Request INSERT FAILED"
    );

    console.error({

        consultationId:
            consultation.id,

        partnerId:
            input.partnerId,

        studentUuid,

        studentName:
            input.studentName,

        partnerName:
            input.partnerName

    });

}

console.log("================================");

if (!incomingRequest) {
    throw new Error("Incoming request was not created.");
}
  /* ============================================
     STEP 4.5
     Deduct Wallet Credits
  ============================================ */

const walletTransaction =

await deductConsultationCredits(

  masterStudentId,

  input.consultationCredits

);


  /* ============================================
     STEP 5
     Store Credit Ledger Entry
  ============================================ */

await createCreditTransaction({

studentId:
    masterStudentId,

    consultationRequestId:
    booking.id,

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
     STEP 6
     Return Complete Result
  ============================================ */

  return {

    consultation,

    wallet:
      walletTransaction

  };

}
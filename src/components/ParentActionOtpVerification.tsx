import React, { useEffect, useMemo, useState } from "react";
import { getCurrentStudent } from "../services/identityService";
import {
  consumeParentActionVerification,
  sendParentActionOtp,
  verifyParentActionOtp,
  type ParentOtpPurpose,
} from "../services/otpService";

interface Props {
  purpose: Exclude<ParentOtpPurpose, "ONBOARDING_CONSENT">;
  title: string;
  description: string;
  actionLabel?: string;
  onCancel: () => void;
  onVerified: () => void;
}

export default function ParentActionOtpVerification({
  purpose,
  title,
  description,
  actionLabel = "Verify & Continue",
  onCancel,
  onVerified,
}: Props) {
  const student = getCurrentStudent();
  const phone = student?.parentPhone ?? "";

  const [otp, setOtp] = useState("");
  const [phoneMasked, setPhoneMasked] = useState("");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [resendSeconds, setResendSeconds] = useState(0);

  const maskedFromIdentity = useMemo(() => {
    const digits = String(phone).replace(/\D/g, "");
    if (digits.length < 4) return "your registered parent mobile number";
    return `+91 ••••••${digits.slice(-4)}`;
  }, [phone]);

  /*
   * The OTP component is shared by all protected parent-approved actions.
   * Keep the user-facing processing language here so the same UX is used
   * consistently for consultation, scholarship, workshop and contact flows.
   */
  const actionContext = useMemo(() => {
    const searchable = `${purpose} ${title} ${actionLabel} ${description}`.toLowerCase();

    if (purpose === "CONSULTATION_BOOKING" || searchable.includes("consultation")) {
      return {
        noun: "consultation",
        processing: "Verifying parent approval and booking your consultation…",
        shortProcessing: "Booking your consultation…",
        success: "Consultation request sent successfully.",
      };
    }

    if (searchable.includes("scholarship")) {
      return {
        noun: "scholarship",
        processing: searchable.includes("accept")
          ? "Verifying parent approval and accepting your scholarship request…"
          : "Verifying parent approval and sending your scholarship request…",
        shortProcessing: searchable.includes("accept")
          ? "Accepting your scholarship request…"
          : "Sending your scholarship request…",
        success: searchable.includes("accept")
          ? "Scholarship request accepted successfully."
          : "Scholarship request sent successfully.",
      };
    }

    if (searchable.includes("workshop")) {
      return {
        noun: "workshop",
        processing: searchable.includes("accept")
          ? "Verifying parent approval and accepting your workshop request…"
          : "Verifying parent approval and sending your workshop request…",
        shortProcessing: searchable.includes("accept")
          ? "Accepting your workshop request…"
          : "Sending your workshop request…",
        success: searchable.includes("accept")
          ? "Workshop request accepted successfully."
          : "Workshop request sent successfully.",
      };
    }

    return {
      noun: "contact request",
      processing: searchable.includes("accept")
        ? "Verifying parent approval and accepting your contact request…"
        : "Verifying parent approval and sending your contact request…",
      shortProcessing: searchable.includes("accept")
        ? "Accepting your contact request…"
        : "Sending your contact request…",
      success: searchable.includes("accept")
        ? "Contact request accepted successfully."
        : "Contact request sent successfully.",
    };
  }, [purpose, title, actionLabel, description]);

  const purposeText =
    purpose === "CONSULTATION_BOOKING"
      ? "booking this consultation"
      : purpose === "MARKETPLACE_OUTBOUND"
        ? "sending this request to the partner"
        : "accepting this partner invitation";

  const consentText =
    purpose === "CONSULTATION_BOOKING"
      ? "I confirm that the registered parent/guardian has approved this consultation request and the related use of the student's details."
      : purpose === "MARKETPLACE_OUTBOUND"
        ? "I confirm that the registered parent/guardian has approved sharing the student's details with this partner for this request."
        : "I confirm that the registered parent/guardian has approved accepting this partner opportunity for the student.";

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (expiresAt) {
        setSecondsLeft(
          Math.max(
            0,
            Math.ceil(
              (new Date(expiresAt).getTime() - Date.now()) / 1000,
            ),
          ),
        );
      } else {
        setSecondsLeft(0);
      }
      setResendSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [expiresAt]);

  const applySendResult = (
    result: Awaited<ReturnType<typeof sendParentActionOtp>>,
  ) => {
    if (!result.success) {
      setError(result.error ?? "Unable to send the parent OTP.");
      return false;
    }

    if (!result.challengeId) {
      setError(
        "The OTP was generated, but the verification challenge ID was not returned. Please request a new OTP.",
      );
      return false;
    }

    setOtpSent(true);
    setOtp("");
    setChallengeId(result.challengeId);
    setPhoneMasked(result.phoneMasked ?? maskedFromIdentity);
    setExpiresAt(result.expiresAt ?? null);
    setResendSeconds(45);
    setMessage(
      "A 6-digit verification code has been sent to the registered parent mobile number.",
    );
    return true;
  };

  const handleSendOtp = async () => {
    setError("");
    setMessage("");

    if (!consentAccepted) {
      setError(
        "Please confirm parent/guardian approval before sending the OTP.",
      );
      return;
    }

    if (!phone) {
      setError(
        "No parent mobile number is available. Please update the Student Profile.",
      );
      return;
    }

    setLoading(true);
    const result = await sendParentActionOtp(purpose, consentAccepted);
    setLoading(false);
    applySendResult(result);
  };

  const handleVerify = async () => {
    setError("");
    setMessage("");

    if (!consentAccepted) {
      setError(
        "Please confirm parent/guardian approval before verifying the OTP.",
      );
      return;
    }

    if (!challengeId) {
      setError("This verification session is missing. Please request a new OTP.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    /*
     * Immediately switch the dialog into an intentional processing state.
     * This happens before the network request so the user never sees a
     * 2–3 second period that looks like a frozen button.
     */
    setVerifying(true);
    setError("");
    setMessage("");

    const result = await verifyParentActionOtp(
      otp,
      purpose,
      consentAccepted,
      challengeId,
    );

    if (!result.success || !result.verified || !result.verificationToken) {
      setVerifying(false);
      setError(
        result.error ??
          "The parent OTP could not be verified. Please request a new OTP.",
      );
      return;
    }

    const consumed = await consumeParentActionVerification(
      purpose,
      result.verificationToken,
    );

    if (!consumed.authorized) {
      setVerifying(false);
      setError(
        consumed.error ??
          "Parent verification could not authorize this action. Please try again.",
      );
      return;
    }

    /*
     * The protected action is now authorized. Show a clear success state
     * briefly before handing control back to the originating page.
     */
    setCompleted(true);
    setVerifying(false);
    setMessage(actionContext.success);

    window.setTimeout(() => {
      onVerified();
    }, 850);
  };

  const handleResend = async () => {
    if (loading || verifying || completed || resendSeconds > 0 || !consentAccepted) {
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const result = await sendParentActionOtp(purpose, consentAccepted);

    setLoading(false);

    if (!applySendResult(result)) return;
    setMessage("A new verification code has been sent.");
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-[#07142D]/65 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-[520px] overflow-y-auto rounded-t-[26px] bg-white shadow-2xl sm:rounded-[28px]">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5 lg:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.18em] text-orange-500 sm:text-[10px]">
                SECURE PARENT VERIFICATION
              </div>
              <h2 className="mt-1.5 text-xl font-black leading-7 text-[#07142D] sm:text-2xl">
                {completed ? "Request Confirmed" : title}
              </h2>
            </div>

            <button
              type="button"
              onClick={onCancel}
              disabled={verifying}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg font-black text-slate-500 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Close verification"
            >
              ×
            </button>
          </div>
        </div>

        <div className="space-y-4 px-4 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-7">
          {verifying ? (
            <div
              className="rounded-2xl border border-blue-100 bg-blue-50/70 px-5 py-8 text-center sm:px-7 sm:py-10"
              role="status"
              aria-live="polite"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-blue-100 border-t-[#143B73] animate-spin" />

              <p className="mt-5 text-lg font-black text-[#07142D] sm:text-xl">
                {actionContext.shortProcessing}
              </p>

              <div className="mt-2 flex items-center justify-center gap-1 text-sm font-bold text-slate-500">
                <span>Verifying parent approval</span>
                <span className="inline-flex w-6 justify-start">
                  <span className="animate-pulse">•</span>
                  <span className="animate-pulse [animation-delay:150ms]">•</span>
                  <span className="animate-pulse [animation-delay:300ms]">•</span>
                </span>
              </div>

              <p className="mt-4 text-xs font-medium leading-5 text-slate-500">
                Please wait while we securely confirm the request. Do not close
                this window.
              </p>
            </div>
          ) : completed ? (
            <div
              className="rounded-2xl border border-green-200 bg-green-50 px-5 py-8 text-center sm:px-7 sm:py-10"
              role="status"
              aria-live="polite"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
                ✓
              </div>

              <p className="mt-5 text-lg font-black text-green-800 sm:text-xl">
                {actionContext.success}
              </p>

              <p className="mt-2 text-sm font-medium leading-5 text-green-700">
                Parent verification is complete. Continuing securely…
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4 sm:p-5">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-orange-500 sm:text-[10px]">
                  PARENT MOBILE
                </p>
                <p className="mt-1.5 text-lg font-black text-[#143B73] sm:text-xl">
                  {phoneMasked || maskedFromIdentity}
                </p>
                <p className="mt-2 text-xs font-medium leading-5 text-slate-600 sm:text-sm">
                  The verification code is sent only to the registered parent
                  mobile number, not the student's mobile number.
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:p-5">
                <p className="text-sm font-bold leading-6 text-[#143B73]">
                  Parent approval is required before {purposeText}.
                </p>
                <p className="mt-1 text-xs font-medium leading-5 text-slate-500 sm:text-sm">
                  {description}
                </p>
              </div>

              {!otpSent && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={consentAccepted}
                      onChange={(event) => {
                        setConsentAccepted(event.target.checked);
                        setError("");
                      }}
                      disabled={loading}
                      className="mt-1 h-4 w-4 shrink-0 accent-orange-500"
                    />
                    <span className="text-xs font-semibold leading-5 text-slate-700 sm:text-sm">
                      {consentText}
                    </span>
                  </label>

                  <p className="mt-3 pl-7 text-[11px] leading-5 text-slate-500">
                    The OTP verifies control of the registered parent mobile
                    number. The checkbox records the approval confirmation
                    required before this protected action can proceed.
                  </p>
                </div>
              )}

              {loading && !otpSent && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">
                  Sending verification code…
                </div>
              )}

              {message && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold leading-5 text-green-700">
                  {message}
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-5 text-red-700">
                  {error}
                </div>
              )}

              {otpSent && (
                <>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                      Enter 6-digit OTP
                    </label>

                    <input
                      value={otp}
                      onChange={(event) =>
                        setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="000000"
                      disabled={verifying}
                      className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-center text-xl font-black tracking-[0.35em] text-[#07142D] outline-none transition focus:border-orange-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60 sm:text-2xl"
                    />
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[11px] font-medium leading-5 text-slate-400 sm:text-xs">
                      {secondsLeft > 0
                        ? `Code expires in ${Math.floor(secondsLeft / 60)}:${String(
                            secondsLeft % 60,
                          ).padStart(2, "0")}.`
                        : "The verification code has expired."}
                    </p>

                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={
                        loading ||
                        verifying ||
                        completed ||
                        resendSeconds > 0 ||
                        !consentAccepted
                      }
                      className="text-left text-xs font-black text-orange-600 disabled:cursor-not-allowed disabled:text-slate-400 sm:text-right"
                    >
                      {resendSeconds > 0
                        ? `Resend in ${resendSeconds}s`
                        : "Resend OTP"}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {!verifying && !completed && (
          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-4 sm:flex-row sm:justify-end sm:px-6 sm:py-5 lg:px-7">
            <button
              type="button"
              onClick={onCancel}
              className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-black text-slate-600 transition hover:bg-slate-100 sm:w-auto"
            >
              Cancel
            </button>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading || !consentAccepted}
                className="w-full rounded-xl bg-orange-500 px-6 py-3 text-xs font-black text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {loading ? "Sending…" : "Send OTP"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleVerify}
                disabled={
                  verifying || otp.length !== 6 || !consentAccepted
                }
                className="w-full rounded-xl bg-orange-500 px-6 py-3 text-xs font-black text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {verifying ? "Verifying…" : actionLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

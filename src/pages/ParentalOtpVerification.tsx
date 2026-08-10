import React, { useEffect, useMemo, useState } from "react";
import { getCurrentStudent } from "../services/identityService";
import {
  sendParentOtp,
  verifyParentOtp,
} from "../services/otpService";

interface Props {
  termsAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
  onOpenTerms: () => void;
  onBack: () => void;
  onVerified: () => void;
}

export default function ParentalOtpVerification({
  termsAccepted,
  onTermsChange,
  onOpenTerms,
  onBack,
  onVerified,
}: Props) {
  const [otp, setOtp] = useState("");
  const [phoneMasked, setPhoneMasked] = useState("");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [resendSeconds, setResendSeconds] = useState(0);

  const student = getCurrentStudent();

  const phone = useMemo(
    () => student?.parentPhone ?? "",
    [student?.parentPhone]
  );

  useEffect(() => {
    const tick = () => {
      if (expiresAt) {
        const remaining = Math.max(
          0,
          Math.ceil(
            (new Date(expiresAt).getTime() - Date.now()) / 1000
          )
        );

        setSecondsLeft(remaining);
      }

      setResendSeconds((current) => Math.max(0, current - 1));
    };

    tick();

    const timer = window.setInterval(tick, 1000);

    return () => window.clearInterval(timer);
  }, [expiresAt]);

  const maskedFromIdentity = useMemo(() => {
    const digits = String(phone).replace(/\D/g, "");

    if (digits.length < 4) return "your registered mobile number";

    return `+91 ••••••${digits.slice(-4)}`;
  }, [phone]);

  const handleSendOtp = async () => {
    setError("");
    setMessage("");

    if (!termsAccepted) {
      setError(
        "Please read and accept the parental consent notice before continuing."
      );
      return;
    }

    if (!phone) {
      setError(
        "No parent mobile number is available. Please return to the Student Profile."
      );
      return;
    }

    setLoading(true);

    const result = await sendParentOtp(true);

    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Unable to send OTP.");
      return;
    }

    setOtpSent(true);
    setOtp("");
    setPhoneMasked(result.phoneMasked ?? maskedFromIdentity);
    setExpiresAt(result.expiresAt ?? null);
    setResendSeconds(45);
    setMessage(
      "A 6-digit verification code has been sent to the registered parent mobile number."
    );
  };

  const handleVerify = async () => {
    setError("");
    setMessage("");

    if (!termsAccepted) {
      setError("Please accept the parental consent notice first.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setVerifying(true);

    const result = await verifyParentOtp(otp, true);

    setVerifying(false);

    if (!result.success || !result.verified) {
      setError(result.error ?? "The OTP could not be verified.");
      return;
    }

    setMessage("Parent consent verified successfully. Opening your questionnaire…");

    window.setTimeout(() => {
      onVerified();
    }, 500);
  };

  const handleResend = async () => {
    if (loading || resendSeconds > 0 || secondsLeft <= 0) {
      return;
    }

    await handleSendOtp();
  };

  return (
    <div
      className="onboarding-page"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #F8F7F4 0%, #FCFAF7 38%, #FFF7EE 70%, #F3F6FB 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "rgba(244,166,35,0.085)",
          right: "-175px",
          top: "-215px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "410px",
          height: "410px",
          borderRadius: "50%",
          background: "rgba(20,59,115,0.060)",
          left: "-205px",
          bottom: "-215px",
          pointerEvents: "none",
        }}
      />

      <div
        className="otp-onboarding-card"
        style={{
          width: "min(760px, 100%)",
          background: "white",
          padding: 48,
          borderRadius: 32,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "transparent",
            border: "none",
            color: "#143B73",
            fontSize: "20px",
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: 24,
          }}
        >
          ← Student Profile
        </button>

        <div
          style={{
            color: "#F4A623",
            fontWeight: 700,
            letterSpacing: "1.2px",
            fontSize: 13,
            marginBottom: 10,
          }}
        >
          SECURE PARENT VERIFICATION
        </div>

        <h1
          style={{
            margin: 0,
            marginBottom: 14,
            fontSize: 40,
            fontWeight: 500,
            color: "#143B73",
          }}
        >
          Verify Parent Consent
        </h1>

        <p
          style={{
            color: "#64748B",
            fontSize: 16,
            lineHeight: 1.65,
            marginTop: 0,
            marginBottom: 28,
          }}
        >
          Before we begin the student questionnaire, we need to verify
          parental consent for creating and using the student profile.
        </p>

        <div
          style={{
            background: "#FFF7E8",
            border: "1px solid #F4A623",
            borderRadius: 16,
            padding: 18,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              color: "#64748B",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: ".8px",
              marginBottom: 6,
            }}
          >
            REGISTERED PARENT MOBILE
          </div>

          <div
            style={{
              color: "#143B73",
              fontSize: 20,
              fontWeight: 800,
            }}
          >
            {phoneMasked || maskedFromIdentity}
          </div>

          <div
            style={{
              marginTop: 6,
              color: "#64748B",
              fontSize: 13,
            }}
          >
            This number is taken directly from the Parent Mobile Number
            entered in the Student Profile.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            padding: 16,
            border: termsAccepted
              ? "1px solid #F4A623"
              : "1px solid #E2E8F0",
            borderRadius: 14,
            background: termsAccepted ? "#FFF7E8" : "#FAFBFC",
            marginBottom: 18,
          }}
        >
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => onTermsChange(e.target.checked)}
            style={{
              width: 18,
              height: 18,
              marginTop: 2,
              accentColor: "#143B73",
              flexShrink: 0,
            }}
          />

          <div
            style={{
              color: "#475569",
              fontSize: 14,
              lineHeight: 1.65,
            }}
          >
            I confirm that I am the parent or lawful guardian of the child
            and consent to the creation and processing of the child's
            student profile for the stated educational and
            student-development purposes. I have read the{" "}
            <button
              type="button"
              onClick={onOpenTerms}
              style={{
                border: "none",
                background: "transparent",
                padding: 0,
                color: "#143B73",
                fontWeight: 800,
                textDecoration: "underline",
                cursor: "pointer",
                fontSize: "inherit",
              }}
            >
              Parental Consent & Data Notice
            </button>
            .
          </div>
        </div>

        {!otpSent ? (
          <button
            onClick={handleSendOtp}
            disabled={loading || !termsAccepted}
            style={{
              width: "100%",
              padding: 16,
              border: "none",
              borderRadius: 12,
              background:
                loading || !termsAccepted ? "#CBD5E1" : "#143B73",
              color: "white",
              cursor:
                loading || !termsAccepted ? "not-allowed" : "pointer",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            {loading ? "Sending Verification Code..." : "Send OTP"}
          </button>
        ) : (
          <>
            <label
              style={{
                display: "block",
                color: "#143B73",
                fontWeight: 800,
                marginBottom: 10,
              }}
            >
              Enter 6-digit OTP
            </label>

            <input
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value.replace(/\D/g, "").slice(0, 6)
                )
              }
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="••••••"
              style={{
                width: "100%",
                padding: "16px 18px",
                borderRadius: 12,
                border: "1px solid #CBD5E1",
                fontSize: 24,
                letterSpacing: "8px",
                textAlign: "center",
                boxSizing: "border-box",
                outline: "none",
                color: "#143B73",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                marginTop: 12,
                marginBottom: 20,
                color: "#64748B",
                fontSize: 13,
              }}
            >
              <span>
                {secondsLeft > 0
                  ? `Code expires in ${Math.floor(secondsLeft / 60)}:${String(
                      secondsLeft % 60
                    ).padStart(2, "0")}`
                  : "Code expired"}
              </span>

              <button
                type="button"
                onClick={handleResend}
                disabled={loading || resendSeconds > 0 || secondsLeft <= 0}
                style={{
                  border: "none",
                  background: "transparent",
                  color:
                    loading || resendSeconds > 0 || secondsLeft <= 0
                      ? "#94A3B8"
                      : "#143B73",
                  fontWeight: 800,
                  cursor:
                    loading || resendSeconds > 0 || secondsLeft <= 0
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Resend OTP
              </button>
            </div>

            <button
              onClick={handleVerify}
              disabled={verifying || !termsAccepted}
              style={{
                width: "100%",
                padding: 16,
                border: "none",
                borderRadius: 12,
                background:
                  verifying || !termsAccepted ? "#CBD5E1" : "#143B73",
                color: "white",
                cursor:
                  verifying || !termsAccepted
                    ? "not-allowed"
                    : "pointer",
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              {verifying
                ? "Verifying Consent..."
                : "Verify OTP & Continue"}
            </button>
          </>
        )}

        {message && (
          <div
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 12,
              background: "#ECFDF5",
              border: "1px solid #A7F3D0",
              color: "#047857",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 12,
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#B91C1C",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            marginTop: 24,
            color: "#94A3B8",
            fontSize: 12,
            lineHeight: 1.6,
          }}
        >
          Your verification code is valid for 5 minutes. The OTP is used
          only to verify control of the registered parent mobile number.
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .onboarding-page {
            min-height: 100dvh !important;
            padding: 18px 14px !important;
            box-sizing: border-box;
          }

          .otp-onboarding-card {
            padding: 24px 18px !important;
            border-radius: 22px !important;
          }

          .otp-onboarding-card h1 {
            font-size: 30px !important;
            line-height: 1.15 !important;
          }
        }
      `}</style>
    </div>
  );
}

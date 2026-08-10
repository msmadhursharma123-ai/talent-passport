import React from "react";

interface Props {
  onBack: () => void;
  onAgree: () => void;
}

const terms = [
  {
    title: "1. Who is giving consent",
    body:
      "I confirm that I am the parent or lawful guardian of the child whose student profile is being created and that I am authorised to provide consent for the child's personal data to be processed.",
  },
  {
    title: "2. What data is being processed",
    body:
      "The platform may process information such as the student's name, age, class, school, parent contact details, interests, questionnaire responses, assessments, co-curricular activities, competition participation and related Talent Passport records.",
  },
  {
    title: "3. Why the data is processed",
    body:
      "The specified purposes are to create and maintain the student's profile, enable the Talent Passport journey, administer questionnaires and assessments, record co-curricular and competition activity, generate growth insights and provide related educational and student-development services.",
  },
  {
    title: "4. Child-data safeguards",
    body:
      "The platform is designed so that parental consent is obtained before the child proceeds to the student questionnaire. The platform will not use the child's personal data for targeted advertising or unrelated behavioural monitoring and will apply reasonable security safeguards.",
  },
  {
    title: "5. Your rights",
    body:
      "Subject to applicable law and retention requirements, parents/data principals may request information about personal data being processed, seek correction or updating of inaccurate or incomplete information, request erasure and use the platform's grievance mechanism.",
  },
  {
    title: "6. OTP verification",
    body:
      "The registered parent mobile number receives a one-time password. Successful OTP verification records that the person controlling that registered number completed the consent step. OTP verification confirms control of the number; it is not by itself an independent proof of parent-child relationship or identity.",
  },
  {
    title: "7. Consent record",
    body:
      "The platform records the consent version, a hash of the consent notice, the registered parent mobile number, verification time and verification method so that the consent event can be audited.",
  },
];

export default function ParentalConsentTerms({
  onBack,
  onAgree,
}: Props) {
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
        className="consent-terms-card"
        style={{
          width: "min(820px, 100%)",
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
            fontSize: 20,
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: 24,
          }}
        >
          ← Back to Verification
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
          PARENTAL CONSENT & DATA NOTICE
        </div>

        <h1
          style={{
            margin: 0,
            color: "#143B73",
            fontSize: 38,
            fontWeight: 500,
            marginBottom: 12,
          }}
        >
          Before the Student Journey Begins
        </h1>

        <p
          style={{
            color: "#64748B",
            lineHeight: 1.7,
            fontSize: 15,
            marginBottom: 28,
          }}
        >
          Please read this notice carefully. The student questionnaire will
          remain locked until the parental consent step is completed.
        </p>

        <div
          style={{
            maxHeight: "55vh",
            overflowY: "auto",
            paddingRight: 10,
          }}
        >
          {terms.map((item) => (
            <section key={item.title} style={{ marginBottom: 24 }}>
              <h2
                style={{
                  color: "#143B73",
                  fontSize: 17,
                  marginBottom: 8,
                }}
              >
                {item.title}
              </h2>

              <p
                style={{
                  color: "#475569",
                  fontSize: 14,
                  lineHeight: 1.75,
                  margin: 0,
                }}
              >
                {item.body}
              </p>
            </section>
          ))}

          <div
            style={{
              padding: 16,
              borderRadius: 14,
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              color: "#64748B",
              fontSize: 12,
              lineHeight: 1.65,
              marginBottom: 8,
            }}
          >
            This notice is designed around the child-data, notice, consent,
            security, rights and grievance concepts in the Digital Personal
            Data Protection Act, 2023 and the Digital Personal Data
            Protection Rules, 2025. It is a product implementation layer,
            not a substitute for legal review or the platform's final
            published privacy notice.
          </div>
        </div>

        <button
          onClick={onAgree}
          style={{
            width: "100%",
            marginTop: 24,
            padding: 16,
            border: "none",
            borderRadius: 12,
            background: "#143B73",
            color: "white",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          I Agree — Return to Verification
        </button>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .onboarding-page {
            min-height: 100dvh !important;
            padding: 18px 14px !important;
            box-sizing: border-box;
          }

          .consent-terms-card {
            padding: 24px 18px !important;
            border-radius: 22px !important;
          }

          .consent-terms-card h1 {
            font-size: 30px !important;
          }
        }
      `}</style>
    </div>
  );
}

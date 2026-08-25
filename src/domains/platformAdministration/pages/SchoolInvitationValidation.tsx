import React, { useEffect, useState } from "react";
import SchoolInvitationRepository from "../repository/SchoolInvitationRepository";
import { SchoolAdminInvitation } from "../types/SchoolAdminInvitation";

interface Props {
    onContinue: (email: string, token: string) => void;
    onBack: () => void;
}

const repository = new SchoolInvitationRepository();

export default function SchoolInvitationValidation({
    onContinue,
    onBack
}: Props) {
    const [loading, setLoading] = useState(true);
    const [invalid, setInvalid] = useState(false);
    const [invitation, setInvitation] = useState<SchoolAdminInvitation | null>(null);

    useEffect(() => {
        void validate();
    }, []);

    async function validate() {
        try {
            const hash = window.location.hash || "";
            const hashQuery = hash.includes("?")
                ? hash.slice(hash.indexOf("?") + 1)
                : "";
            const hashParams = new URLSearchParams(hashQuery);
            const searchParams = new URLSearchParams(window.location.search);
            const token =
                hashParams.get("token") ||
                searchParams.get("token");

            if (!token) {
                setInvalid(true);
                return;
            }

            const data = await repository.getInvitationByToken(token);

            if (!data || data.status !== "Pending") {
                setInvalid(true);
                return;
            }

            if (data.expiresAt && new Date(data.expiresAt).getTime() <= Date.now()) {
                setInvalid(true);
                return;
            }

            setInvitation(data);
        } catch (error) {
            console.error("SCHOOL INVITATION VALIDATION FAILED", error);
            setInvalid(true);
        } finally {
            setLoading(false);
        }
    }

    function continueToLogin() {
        const hash = window.location.hash || "";
        const hashQuery = hash.includes("?")
            ? hash.slice(hash.indexOf("?") + 1)
            : "";
        const hashParams = new URLSearchParams(hashQuery);
        const searchParams = new URLSearchParams(window.location.search);
        const token =
            hashParams.get("token") ||
            searchParams.get("token");

        if (!invitation || !token) {
            setInvalid(true);
            return;
        }

        sessionStorage.setItem("schoolInvitationToken", token);
        sessionStorage.setItem(
            "schoolLoginEmail",
            invitation.administratorEmail.trim()
        );

        onContinue(
            invitation.administratorEmail.trim(),
            token
        );
    }

    if (loading) {
        return (
            <div className="school-invitation-validation-page" style={pageStyle}>
                <div className="school-invitation-validation-card" style={cardStyle}>
                    <div className="school-validation-icon" style={spinnerStyle}>⏳</div>
                    <h2 style={titleStyle}>Validating School Invitation</h2>
                    <p style={subtitleStyle}>
                        Please wait while we verify this invitation.
                    </p>
                </div>
            </div>
        );
    }

    if (invalid || !invitation) {
        return (
            <div className="school-invitation-validation-page" style={pageStyle}>
                <div className="school-invitation-validation-card" style={cardStyle}>
                    <div className="school-validation-icon" style={errorIconStyle}>!</div>
                    <h2 style={titleStyle}>Invalid Invitation</h2>
                    <p style={subtitleStyle}>
                        This invitation is invalid, expired, or has already been accepted.
                        Please ask the Platform Administrator to send a fresh link.
                    </p>
                    <button type="button" onClick={onBack} style={secondaryButtonStyle}>
                        Back to Talent Passport
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="school-invitation-validation-page" style={pageStyle}>
            <div className="school-invitation-validation-card" style={cardStyle}>
                <div className="school-validation-icon" style={successIconStyle}>✓</div>
                <div style={eyebrowStyle}>INVITATION VERIFIED</div>
                <h1 style={titleStyle}>School Administrator Setup</h1>
                <p style={subtitleStyle}>
                    Your invitation is valid. Continue to School Login and use the temporary credentials provided by the Platform Administrator.
                </p>

                <div className="school-validation-info" style={infoCardStyle}>
                    <strong>School</strong>
                    <span>{invitation.schoolName}</span>
                </div>

                <div className="school-validation-info" style={infoCardStyle}>
                    <strong>Administrator</strong>
                    <span>{invitation.administratorName}</span>
                </div>

                <div className="school-validation-info" style={infoCardStyle}>
                    <strong>Login Email</strong>
                    <span>{invitation.administratorEmail}</span>
                </div>

                <button
                    type="button"
                    onClick={continueToLogin}
                    style={primaryButtonStyle}
                >
                    Continue to School Login
                </button>

                <button
                    type="button"
                    onClick={onBack}
                    style={secondaryButtonStyle}
                >
                    Back
                </button>
            </div>
        </div>
    );
}

const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    background: "linear-gradient(135deg, #F8F7F4 0%, #FCFAF7 38%, #FFF7EE 70%, #F3F6FB 100%)",
    boxSizing: "border-box"
};

const cardStyle: React.CSSProperties = {
    width: "min(650px, 100%)",
    background: "white",
    padding: 40,
    borderRadius: 24,
    boxShadow: "0 18px 50px rgba(15,23,42,.10)",
    boxSizing: "border-box"
};

const successIconStyle: React.CSSProperties = {
    width: 58,
    height: 58,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#DCFCE7",
    color: "#15803D",
    fontSize: 30,
    fontWeight: 800,
    marginBottom: 18
};

const errorIconStyle: React.CSSProperties = {
    width: 58,
    height: 58,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#FEE2E2",
    color: "#B91C1C",
    fontSize: 30,
    fontWeight: 800,
    marginBottom: 18
};

const spinnerStyle: React.CSSProperties = {
    fontSize: 32,
    marginBottom: 18
};

const eyebrowStyle: React.CSSProperties = {
    color: "#16A34A",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.3
};

const titleStyle: React.CSSProperties = {
    color: "#143B73",
    margin: "8px 0 10px",
    fontSize: 30,
    lineHeight: 1.15
};

const subtitleStyle: React.CSSProperties = {
    color: "#64748B",
    lineHeight: 1.55,
    marginBottom: 26
};

const infoCardStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    color: "#334155"
};

const primaryButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: 16,
    marginTop: 14,
    borderRadius: 12,
    border: "none",
    background: "#143B73",
    color: "white",
    fontWeight: 800,
    fontSize: 16,
    cursor: "pointer"
};

const secondaryButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: 14,
    marginTop: 12,
    borderRadius: 12,
    border: "1px solid #CBD5E1",
    background: "white",
    color: "#143B73",
    fontWeight: 700,
    cursor: "pointer"
};


/* Responsive presentation only: invitation validation remains functionally unchanged. */
const responsiveStyles = `
.school-invitation-validation-page { box-sizing: border-box; }
.school-invitation-validation-card { box-sizing: border-box; }
@media (max-width: 1024px) {
  .school-invitation-validation-page { padding: 18px !important; min-height: 100dvh !important; }
  .school-invitation-validation-card { width: min(500px, calc(100vw - 36px)) !important; padding: 30px !important; border-radius: 22px !important; }
}
@media (max-width: 600px) {
  .school-invitation-validation-page { padding: 12px !important; min-height: 100dvh !important; }
  .school-invitation-validation-card { width: min(100%, 360px) !important; padding: 20px 17px !important; border-radius: 20px !important; box-shadow: 0 10px 28px rgba(15,23,42,.07) !important; }
  .school-invitation-validation-card .school-validation-icon { width: 44px !important; height: 44px !important; font-size: 22px !important; margin-bottom: 12px !important; }
  .school-invitation-validation-card h1, .school-invitation-validation-card h2 { font-size: 24px !important; line-height: 1.15 !important; }
  .school-invitation-validation-card p { font-size: 13px !important; line-height: 1.45 !important; margin-bottom: 18px !important; }
  .school-invitation-validation-card .school-validation-info { padding: 12px !important; margin-bottom: 9px !important; border-radius: 10px !important; font-size: 13px !important; }
  .school-invitation-validation-card button { padding: 12px !important; margin-top: 9px !important; font-size: 14px !important; border-radius: 10px !important; }
}
`;

// Inject once at module load; class names are applied below via a tiny DOM-safe style tag.
if (typeof document !== "undefined" && !document.getElementById("school-invitation-validation-responsive")) {
    const style = document.createElement("style");
    style.id = "school-invitation-validation-responsive";
    style.textContent = responsiveStyles;
    document.head.appendChild(style);
}

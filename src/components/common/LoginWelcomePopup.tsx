import React, { useEffect, useState } from "react";

interface Props {
    active: boolean;
    portal: "Student" | "Teacher" | "Partner" | "School";
}

const MESSAGES = [
    "👋 Welcome to Talent Passport",
    "😊 Have a great day ahead",
    "🌟 Let’s dive into the world of academic intelligence",
] as const;

/**
 * UI-only login waiting state.
 *
 * Important:
 * - Does not participate in authentication.
 * - Does not await, delay, retry, or otherwise affect login.
 * - Appears only when the existing loading state lasts beyond a short
 *   threshold, preventing a flash on very fast logins.
 * - Immediately disappears when the existing login loading state ends.
 */
export default function LoginWelcomePopup({ active, portal }: Props) {
    const [visible, setVisible] = useState(false);
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        if (!active) {
            setVisible(false);
            setMessageIndex(0);
            return;
        }

        // UI-only threshold. It never blocks or delays the authentication call.
        const showTimer = window.setTimeout(() => {
            setVisible(true);
            setMessageIndex(0);
        }, 140);

        return () => {
            window.clearTimeout(showTimer);
        };
    }, [active]);

    useEffect(() => {
        if (!visible || !active) {
            return;
        }

        const messageTimer = window.setInterval(() => {
            setMessageIndex((current) => (current + 1) % MESSAGES.length);
        }, 700);

        return () => {
            window.clearInterval(messageTimer);
        };
    }, [visible, active]);

    if (!visible || !active) {
        return null;
    }

    return (
        <div
            className="tp-login-welcome-overlay"
            aria-live="polite"
            aria-label={`${MESSAGES[messageIndex]} — ${portal} Portal`}
        >
            <div className="tp-login-welcome-card">
                <div className="tp-login-welcome-orbit" aria-hidden="true" />
                <div className="tp-login-welcome-icon" aria-hidden="true">
                    {messageIndex === 0 ? "👋" : messageIndex === 1 ? "😊" : "🌟"}
                </div>
                <div className="tp-login-welcome-brand">TALENT PASSPORT</div>
                <div className="tp-login-welcome-message">
                    {MESSAGES[messageIndex]}
                </div>
                <div className="tp-login-welcome-dots" aria-hidden="true">
                    <span className={messageIndex === 0 ? "active" : ""} />
                    <span className={messageIndex === 1 ? "active" : ""} />
                    <span className={messageIndex === 2 ? "active" : ""} />
                </div>
            </div>

            <style>{`
                .tp-login-welcome-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    box-sizing: border-box;
                    pointer-events: none;
                    background: rgba(10, 24, 45, 0.34);
                    backdrop-filter: blur(5px);
                    -webkit-backdrop-filter: blur(5px);
                    animation: tpLoginWelcomeFadeIn 180ms ease-out both;
                }

                .tp-login-welcome-card {
                    position: relative;
                    width: min(430px, 100%);
                    box-sizing: border-box;
                    overflow: hidden;
                    padding: 34px 30px 28px;
                    border: 1px solid rgba(255, 255, 255, 0.16);
                    border-radius: 22px;
                    background:
                        linear-gradient(145deg, #0B1F3A 0%, #102F56 58%, #173E6D 100%);
                    box-shadow:
                        0 28px 80px rgba(3, 12, 28, 0.42),
                        0 10px 30px rgba(10, 35, 68, 0.28),
                        inset 0 1px 0 rgba(255, 255, 255, 0.10);
                    text-align: center;
                    animation: tpLoginWelcomePop 260ms cubic-bezier(.2,.8,.2,1) both;
                }

                .tp-login-welcome-card::before {
                    content: "";
                    position: absolute;
                    width: 180px;
                    height: 180px;
                    border-radius: 50%;
                    right: -90px;
                    top: -95px;
                    background: rgba(244, 166, 35, 0.09);
                }

                .tp-login-welcome-card::after {
                    content: "";
                    position: absolute;
                    width: 150px;
                    height: 150px;
                    border-radius: 50%;
                    left: -80px;
                    bottom: -85px;
                    background: rgba(255, 255, 255, 0.035);
                }

                .tp-login-welcome-orbit {
                    position: absolute;
                    width: 110px;
                    height: 110px;
                    border-radius: 50%;
                    right: 22%;
                    top: -72px;
                    border: 1px solid rgba(244, 166, 35, 0.20);
                }

                .tp-login-welcome-icon {
                    position: relative;
                    z-index: 1;
                    width: 66px;
                    height: 66px;
                    margin: 0 auto 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: rgba(244, 166, 35, 0.12);
                    border: 1px solid rgba(244, 166, 35, 0.20);
                    font-size: 28px;
                    line-height: 1;
                    box-shadow: 0 8px 22px rgba(244, 166, 35, 0.12);
                    animation: tpLoginWelcomeFloat 1.4s ease-in-out infinite;
                }

                .tp-login-welcome-brand {
                    position: relative;
                    z-index: 1;
                    color: #F4A623;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 2px;
                    margin-bottom: 8px;
                }

                .tp-login-welcome-message {
                    position: relative;
                    z-index: 1;
                    min-height: 34px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #FFFFFF;
                    font-size: 23px;
                    line-height: 1.25;
                    font-weight: 800;
                    letter-spacing: -0.2px;
                    animation: tpLoginWelcomeText 260ms ease-out both;
                }

                .tp-login-welcome-dots {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    justify-content: center;
                    gap: 7px;
                    margin-top: 18px;
                }

                .tp-login-welcome-dots span {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.24);
                    transition: transform 180ms ease, background 180ms ease;
                }

                .tp-login-welcome-dots span.active {
                    background: #F4A623;
                    transform: scale(1.35);
                }

                @keyframes tpLoginWelcomeFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes tpLoginWelcomePop {
                    from {
                        opacity: 0;
                        transform: translateY(8px) scale(.97);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                @keyframes tpLoginWelcomeFloat {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }

                @keyframes tpLoginWelcomeText {
                    from {
                        opacity: .35;
                        transform: translateY(4px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (max-width: 1024px) {
                    .tp-login-welcome-overlay {
                        padding: 22px;
                    }

                    .tp-login-welcome-card {
                        width: min(430px, 100%);
                        padding: 32px 28px 26px;
                    }

                    .tp-login-welcome-message {
                        font-size: 22px;
                    }
                }

                @media (max-width: 600px) {
                    .tp-login-welcome-overlay {
                        padding: 14px;
                    }

                    .tp-login-welcome-card {
                        width: 100%;
                        max-width: 390px;
                        padding: 27px 20px 23px;
                        border-radius: 22px;
                    }

                    .tp-login-welcome-icon {
                        width: 58px;
                        height: 58px;
                        font-size: 27px;
                        margin-bottom: 12px;
                    }

                    .tp-login-welcome-brand {
                        font-size: 10px;
                        letter-spacing: 1.7px;
                    }

                    .tp-login-welcome-message {
                        min-height: 30px;
                        font-size: 19px;
                    }

                    .tp-login-welcome-dots {
                        margin-top: 15px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .tp-login-welcome-overlay,
                    .tp-login-welcome-card,
                    .tp-login-welcome-icon,
                    .tp-login-welcome-message {
                        animation: none !important;
                    }
                }
            `}</style>
        </div>
    );
}

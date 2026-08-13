import React, { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Send } from "lucide-react";
import { getSupabaseClient } from "../../supabaseClient";

type FormState = {
  fullName: string;
  designation: string;
  organizationName: string;
  board: string;
  workEmail: string;
  phone: string;
  requirement: string;
};

const initialForm: FormState = {
  fullName: "",
  designation: "",
  organizationName: "",
  board: "",
  workEmail: "",
  phone: "",
  requirement: "",
};

const boardOptions = [
  "CBSE",
  "CISCE / ICSE",
  "State Board",
  "IB",
  "Cambridge",
  "Other",
  "Not sure",
];

async function getFunctionErrorMessage(error: unknown): Promise<string> {
  const fallback =
    error instanceof Error
      ? error.message
      : "Something went wrong. Please try again.";

  const context = (error as { context?: unknown } | null)?.context;

  if (
    context &&
    typeof context === "object" &&
    "json" in context &&
    typeof (context as { json?: unknown }).json === "function"
  ) {
    try {
      const payload = await (
        context as { json: () => Promise<unknown> }
      ).json();

      if (
        payload &&
        typeof payload === "object" &&
        "error" in payload &&
        typeof (payload as { error?: unknown }).error === "string"
      ) {
        return (payload as { error: string }).error;
      }
    } catch {
      // Keep the Supabase error message as the fallback.
    }
  }

  return fallback;
}

export default function RequestDemoPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] =
    useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const update = (key: keyof FormState, value: string) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (status === "submitting") return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase.functions.invoke("request-demo", {
        body: {
          ...form,
          source: "Talent Passport public website",
          submittedAt: new Date().toISOString(),
        },
      });

      if (error) {
        const message = await getFunctionErrorMessage(error);
        throw new Error(message);
      }

      if (!data?.success) {
        throw new Error(
          data?.error || "Unable to submit your request right now."
        );
      }

      setStatus("success");
      setForm(initialForm);
    } catch (error) {
      console.error("REQUEST DEMO SUBMISSION FAILED:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );

      setStatus("error");
    }
  };

  return (
    <main className="tp-demo-page">
      <style>{`
        .tp-demo-page{--n:#14213d;--b:#244f8f;--m:#64748b;--g:#f4a825;min-height:calc(100vh - 84px);background:radial-gradient(circle at 8% 10%,rgba(244,168,37,.10),transparent 28%),linear-gradient(180deg,#f7faff 0%,#fff 48%,#f6f9fd 100%);color:var(--n);padding:clamp(42px,6vw,82px) 18px 90px}
        .tp-demo-page *{box-sizing:border-box}.tp-demo-shell{width:min(1120px,100%);margin:0 auto}.tp-demo-heading{max-width:860px;margin-bottom:34px}
        .tp-demo-eyebrow{display:flex;align-items:center;gap:10px;color:#9b6912;font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}.tp-demo-eyebrow:before{content:"";width:26px;height:2px;background:var(--g);border-radius:99px}
        .tp-demo-heading h1{margin:15px 0 14px;font-size:clamp(39px,6vw,70px);line-height:.98;letter-spacing:-.055em;font-weight:420}.tp-demo-heading h1 em{font-style:normal;color:var(--b)}
        .tp-demo-heading p{max-width:760px;margin:0;color:#596982;font-size:clamp(15px,1.55vw,18px);line-height:1.7}
        .tp-demo-grid{display:grid;grid-template-columns:minmax(0,.82fr) minmax(0,1.18fr);gap:20px;align-items:stretch}
        .tp-demo-context{padding:28px;border-radius:26px;background:#14213d;color:#fff;box-shadow:0 22px 60px rgba(20,33,61,.14);display:flex;flex-direction:column;justify-content:space-between;min-height:100%}
        .tp-demo-context .num{width:40px;height:40px;border-radius:12px;background:var(--g);color:#14213d;display:grid;place-items:center;font-size:12px;font-weight:900}
        .tp-demo-context h2{margin:65px 0 12px;font-size:clamp(27px,3.4vw,42px);line-height:1.05;letter-spacing:-.04em}.tp-demo-context p{margin:0;color:#c8d2e0;font-size:14px;line-height:1.65}
        .tp-demo-points{display:grid;gap:9px;margin-top:28px}.tp-demo-point{display:flex;gap:9px;align-items:flex-start;color:#e6ebf2;font-size:12px;line-height:1.45}.tp-demo-point svg{flex:0 0 auto;color:var(--g);margin-top:1px}
        .tp-demo-form-card{padding:clamp(20px,3vw,32px);border:1px solid #dce5f0;border-radius:26px;background:rgba(255,255,255,.96);box-shadow:0 20px 55px rgba(20,33,61,.08)}
        .tp-demo-form-title{display:flex;justify-content:space-between;gap:15px;align-items:flex-start;margin-bottom:22px}.tp-demo-form-title h2{margin:0;font-size:22px;letter-spacing:-.025em}.tp-demo-form-title span{color:#9b6912;font-size:9px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap}
        .tp-demo-fields{display:grid;grid-template-columns:1fr 1fr;gap:14px}.tp-demo-field{min-width:0}.tp-demo-field.full{grid-column:1/-1}.tp-demo-field label{display:block;margin:0 0 6px;color:#33435d;font-size:11px;font-weight:800}
        .tp-demo-field input,.tp-demo-field select,.tp-demo-field textarea{width:100%;border:1px solid #d8e1ec;border-radius:12px;background:#fbfcfe;color:#14213d;font:inherit;font-size:13px;outline:none;transition:border-color .18s,box-shadow .18s}
        .tp-demo-field input,.tp-demo-field select{height:47px;padding:0 13px}.tp-demo-field textarea{min-height:122px;padding:12px 13px;resize:vertical;line-height:1.5}
        .tp-demo-field input:focus,.tp-demo-field select:focus,.tp-demo-field textarea:focus{border-color:#244f8f;box-shadow:0 0 0 3px rgba(36,79,143,.10);background:#fff}
        .tp-demo-submit{margin-top:18px;width:100%;min-height:52px;border:0;border-radius:13px;background:var(--g);color:#14213d;font:inherit;font-size:14px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 10px 24px rgba(244,168,37,.20)}
        .tp-demo-submit:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 14px 30px rgba(244,168,37,.27)}.tp-demo-submit:disabled{opacity:.68;cursor:not-allowed}
        .tp-demo-privacy{margin:10px 0 0;color:#8290a4;font-size:10px;line-height:1.5;text-align:center}.tp-demo-alert{margin-bottom:15px;padding:12px 13px;border-radius:12px;font-size:12px;line-height:1.45}.tp-demo-alert.error{background:#fff1f1;color:#9b3030;border:1px solid #f1cccc}
        .tp-demo-success{min-height:430px;display:flex;align-items:center;justify-content:center;text-align:center;padding:35px}.tp-demo-success-icon{width:58px;height:58px;border-radius:18px;background:#edf8f1;color:#21824b;display:grid;place-items:center;margin:0 auto 18px}.tp-demo-success h2{margin:0 0 9px;font-size:28px;letter-spacing:-.03em}.tp-demo-success p{max-width:450px;margin:0 auto;color:#64748b;font-size:14px;line-height:1.65}
        .tp-demo-back{margin-top:20px;display:inline-flex;align-items:center;gap:7px;border:1px solid #dce5f0;background:#fff;color:#244f8f;border-radius:11px;padding:10px 13px;font:inherit;font-size:12px;font-weight:800;cursor:pointer}
        @media(max-width:850px){.tp-demo-page{padding-left:15px;padding-right:15px}.tp-demo-grid{grid-template-columns:1fr}.tp-demo-context{min-height:0}.tp-demo-context h2{margin-top:35px}}
        @media(max-width:620px){.tp-demo-page{padding:38px 13px 60px}.tp-demo-heading h1{font-size:clamp(35px,10.5vw,48px);line-height:1.02}.tp-demo-heading p{font-size:14px;line-height:1.6}.tp-demo-context,.tp-demo-form-card{border-radius:19px;padding:19px}.tp-demo-context h2{font-size:27px;margin-top:28px}.tp-demo-fields{grid-template-columns:1fr;gap:12px}.tp-demo-field.full{grid-column:auto}.tp-demo-form-title{display:block}.tp-demo-form-title span{display:block;margin-top:7px}.tp-demo-success{min-height:360px;padding:20px}}
      `}</style>

      <div className="tp-demo-shell">
        <header className="tp-demo-heading">
          <div className="tp-demo-eyebrow">SCHOOLS • REQUEST A DEMO</div>
          <h1>
            See the intelligence your school is <em>missing.</em>
          </h1>
          <p>
            Tell us a little about your institution and what you want to
            improve. We'll tailor the walkthrough around your school's academic
            and operational priorities.
          </p>
        </header>

        <div className="tp-demo-grid">
          <aside className="tp-demo-context">
            <div>
              <div className="num">01</div>
              <h2>Let's make the invisible visible.</h2>
              <p>
                A focused walkthrough can show how Talent Passport connects
                classroom signals, learning gaps, doubt resolution and
                school-level intelligence without replacing the systems you
                already use.
              </p>

              <div className="tp-demo-points">
                <div className="tp-demo-point">
                  <CheckCircle2 size={15} />
                  Learning gaps by class, topic and student
                </div>
                <div className="tp-demo-point">
                  <CheckCircle2 size={15} />
                  Doubt resolution and intervention visibility
                </div>
                <div className="tp-demo-point">
                  <CheckCircle2 size={15} />
                  Cross-section patterns for school leadership
                </div>
                <div className="tp-demo-point">
                  <CheckCircle2 size={15} />
                  A broader student growth and identity layer
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 28,
                color: "#aebbd0",
                fontSize: 10,
                letterSpacing: ".1em",
                fontWeight: 800,
              }}
            >
              TALENT PASSPORT • SCHOOL INTELLIGENCE
            </div>
          </aside>

          <section className="tp-demo-form-card">
            {status === "success" ? (
              <div className="tp-demo-success">
                <div>
                  <div className="tp-demo-success-icon">
                    <CheckCircle2 size={30} />
                  </div>
                  <h2>Request received.</h2>
                  <p>
                    Thank you. Your request has been submitted successfully.
                    Our team will review your requirement and get back to you.
                  </p>
                  <button
                    type="button"
                    className="tp-demo-back"
                    onClick={() => {
                      setStatus("idle");
                      window.location.hash = "hero";
                    }}
                  >
                    Back to Talent Passport <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="tp-demo-form-title">
                  <h2>Tell us about your school</h2>
                  <span>2-minute request</span>
                </div>

                {status === "error" && (
                  <div className="tp-demo-alert error">{errorMessage}</div>
                )}

                <form onSubmit={submit}>
                  <div className="tp-demo-fields">
                    <div className="tp-demo-field">
                      <label htmlFor="demo-full-name">Your name *</label>
                      <input
                        id="demo-full-name"
                        value={form.fullName}
                        onChange={(e) =>
                          update("fullName", e.target.value)
                        }
                        placeholder="e.g. Madhur Sharma"
                        required
                      />
                    </div>

                    <div className="tp-demo-field">
                      <label htmlFor="demo-designation">Designation *</label>
                      <input
                        id="demo-designation"
                        value={form.designation}
                        onChange={(e) =>
                          update("designation", e.target.value)
                        }
                        placeholder="Principal / Director / Academic Head"
                        required
                      />
                    </div>

                    <div className="tp-demo-field">
                      <label htmlFor="demo-organization">
                        School / Organization *
                      </label>
                      <input
                        id="demo-organization"
                        value={form.organizationName}
                        onChange={(e) =>
                          update("organizationName", e.target.value)
                        }
                        placeholder="School or institution name"
                        required
                      />
                    </div>

                    <div className="tp-demo-field">
                      <label htmlFor="demo-board">Board *</label>
                      <select
                        id="demo-board"
                        value={form.board}
                        onChange={(e) => update("board", e.target.value)}
                        required
                      >
                        <option value="" disabled>
                          Select board
                        </option>
                        {boardOptions.map((board) => (
                          <option key={board} value={board}>
                            {board}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="tp-demo-field">
                      <label htmlFor="demo-email">Work email *</label>
                      <input
                        id="demo-email"
                        type="email"
                        value={form.workEmail}
                        onChange={(e) => update("workEmail", e.target.value)}
                        placeholder="name@school.org"
                        required
                      />
                    </div>

                    <div className="tp-demo-field">
                      <label htmlFor="demo-phone">
                        Phone / WhatsApp *
                      </label>
                      <input
                        id="demo-phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        placeholder="+91 98XXXXXXXX"
                        required
                      />
                    </div>

                    <div className="tp-demo-field full">
                      <label htmlFor="demo-requirement">
                        Specific requirement (optional)
                      </label>
                      <textarea
                        id="demo-requirement"
                        value={form.requirement}
                        onChange={(e) =>
                          update("requirement", e.target.value)
                        }
                        placeholder="Tell us what you would most like to see: learning gaps, doubt resolution, teacher intelligence, school analytics, student growth, or something specific to your school."
                      />
                    </div>
                  </div>

                  <button
                    className="tp-demo-submit"
                    type="submit"
                    disabled={status === "submitting"}
                  >
                    {status === "submitting" ? (
                      <>
                        Submitting <Loader2 size={16} />
                      </>
                    ) : (
                      <>
                        Submit Request <Send size={16} />
                      </>
                    )}
                  </button>

                  <p className="tp-demo-privacy">
                    Your information is used only to respond to this demo
                    request.
                  </p>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

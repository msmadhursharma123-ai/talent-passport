import { useEffect, useState } from "react";
import {
  getActiveSchoolPosts,
  submitSchoolPostResponse,
} from "../repository/SchoolPostRepository";
import type { SchoolPost, SchoolPostAudience } from "../types/SchoolPostModels";

interface Props {
  audience: SchoolPostAudience;
}

export default function SchoolPostFeed({ audience }: Props) {
  const [posts, setPosts] = useState<SchoolPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [selectedValues, setSelectedValues] = useState<Record<string, number | null>>({});
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const rows = await getActiveSchoolPosts(audience);
      setPosts(rows);
    } catch (e: any) {
      setError(e?.message ?? "Unable to load school posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [audience]);

  const submit = async (post: SchoolPost, value: number | null, text: string) => {
    if (submittingId) return;

    setSubmittingId(post.id);
    setError("");

    try {
      await submitSchoolPostResponse(post.id, audience, value, text);
      setPosts(current => current.filter(item => item.id !== post.id));
    } catch (e: any) {
      setError(e?.message ?? "Unable to submit your response.");
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <div className="school-post-feed-loading">
        <span className="school-post-feed-dot" />
        Loading school updates…
      </div>
    );
  }

  if (posts.length === 0 && !error) return null;

  return (
    <section className="school-post-feed">
      <style>{`
        .school-post-feed {
          width:100%;
          min-width:0;
          padding:8px 0 0;
          background:#F5F6FA;
        }
        .school-post-feed-shell { width:100%;min-width:0; }
        .school-post-feed-loading {
          display:flex;align-items:center;gap:7px;
          padding:6px 12px;color:#94A3B8;font-size:9px;font-weight:750;
        }
        .school-post-feed-dot { width:5px;height:5px;border-radius:50%;background:#F97316;animation:schoolPostPulse 1.1s infinite ease-in-out; }
        @keyframes schoolPostPulse { 0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)} }
        .school-post-feed-card {
          position:relative;overflow:hidden;
          border:1px solid #E2E8F0;border-radius:13px;
          background:#FFFFFF;box-shadow:0 5px 16px rgba(15,23,42,.035);
          padding:11px 12px;margin-bottom:7px;
        }
        .school-post-feed-card::after {
          content:"";position:absolute;right:-35px;top:-45px;width:95px;height:95px;border-radius:50%;
          background:rgba(249,115,22,.045);pointer-events:none;
        }
        .school-post-feed-card > * { position:relative;z-index:1; }
        .school-post-feed-kicker {
          display:flex;align-items:center;gap:6px;
          color:#F97316;font-size:8px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;
        }
        .school-post-feed-badge {
          display:inline-flex;padding:3px 6px;border-radius:6px;background:#FFF7ED;color:#EA580C;
          font-size:7px;font-weight:900;letter-spacing:.05em;
        }
        .school-post-feed-title { margin:5px 0 0;color:#0F172A;font-size:13px;font-weight:900;line-height:1.2;overflow-wrap:anywhere; }
        .school-post-feed-body { margin:5px 0 0;color:#475569;font-size:10px;font-weight:600;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere; }
        .school-post-feed-rule { margin-top:7px;padding:7px 8px;border-radius:8px;background:#F8FAFC;color:#64748B;font-size:8px;font-weight:700;line-height:1.4; }
        .school-post-feed-poll { margin-top:9px; }
        .school-post-feed-options { display:flex;gap:4px;flex-wrap:wrap; }
        .school-post-feed-option {
          min-width:25px;height:27px;padding:0 7px;border:1px solid #D8E0EA;border-radius:7px;background:#fff;color:#334155;
          font-size:9px;font-weight:850;cursor:pointer;
        }
        .school-post-feed-option.active { border-color:#FDBA74;background:#FFF7ED;color:#EA580C; }
        .school-post-feed-slider { width:100%;accent-color:#F97316; }
        .school-post-feed-slider-labels { display:flex;justify-content:space-between;color:#94A3B8;font-size:8px;font-weight:800; }
        .school-post-feed-submit {
          margin-top:7px;border:0;border-radius:8px;background:#143B73;color:#fff;padding:7px 10px;
          font-size:9px;font-weight:900;cursor:pointer;
        }
        .school-post-feed-submit:disabled { opacity:.45;cursor:not-allowed; }
        .school-post-feed-error { margin:6px 0;padding:7px 9px;border-radius:8px;background:#FEF2F2;border:1px solid #FECACA;color:#B91C1C;font-size:9px;font-weight:750; }
        .school-post-feed-meta { margin-top:7px;color:#94A3B8;font-size:8px;font-weight:700; }
        @media (min-width:1025px) {
          .school-post-feed { padding:10px 0 0; }
          .school-post-feed-card { padding:12px 14px; }
        }
        @media (max-width:600px) {
          .school-post-feed { padding:5px 0 0; }
          .school-post-feed-card { border-radius:10px;padding:9px 10px;margin-bottom:5px;box-shadow:0 3px 10px rgba(15,23,42,.025); }
          .school-post-feed-title { font-size:12px; }
          .school-post-feed-body { font-size:9px;line-height:1.45; }
          .school-post-feed-option { height:25px;min-width:23px;font-size:8px;padding:0 6px; }
        }
      `}</style>

      <div className="school-post-feed-shell">
        {error && <div className="school-post-feed-error">{error}</div>}

        {posts.map(post => {
          const selected = selectedValues[post.id] ?? null;
          const submitting = submittingId === post.id;

          return (
            <article className="school-post-feed-card" key={post.id}>
              <div className="school-post-feed-kicker">
                <span className="school-post-feed-badge">
                  {post.postType === "announcement" ? "School Update" : "School Pulse"}
                </span>
                {post.postType === "poll" ? "Quick response" : "Announcement"}
              </div>

              <h3 className="school-post-feed-title">{post.title}</h3>
              <div className="school-post-feed-body">{post.body}</div>

              {post.rulesText && (
                <div className="school-post-feed-rule">
                  <strong>Note:</strong> {post.rulesText}
                </div>
              )}

              {post.postType === "poll" && (
                <div className="school-post-feed-poll">
                  {post.pollType === "yes_no" ? (
                    <div className="school-post-feed-options">
                      <button
                        type="button"
                        className={`school-post-feed-option ${selected === 1 ? "active" : ""}`}
                        onClick={() =>
                          setSelectedValues(current => ({ ...current, [post.id]: 1 }))
                        }
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className={`school-post-feed-option ${selected === 0 ? "active" : ""}`}
                        onClick={() =>
                          setSelectedValues(current => ({ ...current, [post.id]: 0 }))
                        }
                      >
                        No
                      </button>
                    </div>
                  ) : post.pollType === "slider_1_10" ? (
                    <>
                      <input
                        className="school-post-feed-slider"
                        type="range"
                        min={1}
                        max={10}
                        step={1}
                        value={selected ?? 5}
                        onChange={event =>
                          setSelectedValues(current => ({
                            ...current,
                            [post.id]: Number(event.target.value),
                          }))
                        }
                      />
                      <div className="school-post-feed-slider-labels">
                        <span>1 · Not confident</span>
                        <strong style={{ color: "#143B73" }}>{selected ?? 5}</strong>
                        <span>10 · Very confident</span>
                      </div>
                    </>
                  ) : (
                    <div className="school-post-feed-options">
                      {Array.from({ length: 10 }, (_, index) => index + 1).map(value => (
                        <button
                          type="button"
                          key={value}
                          className={`school-post-feed-option ${selected === value ? "active" : ""}`}
                          onClick={() =>
                            setSelectedValues(current => ({
                              ...current,
                              [post.id]: value,
                            }))
                          }
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    className="school-post-feed-submit"
                    disabled={submitting || selected === null}
                    onClick={() =>
                      void submit(
                        post,
                        selected,
                        post.pollType === "yes_no"
                          ? selected === 1
                            ? "yes"
                            : "no"
                          : String(selected ?? ""),
                      )
                    }
                  >
                    {submitting ? "Submitting…" : "Submit Response"}
                  </button>
                </div>
              )}

              <div className="school-post-feed-meta">
                Available until{" "}
                {new Date(post.endsAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

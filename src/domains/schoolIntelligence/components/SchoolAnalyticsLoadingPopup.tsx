import { useEffect, useState } from "react";

type PageKind = "overview" | "teacher" | "academic" | "classroom";

const MESSAGES: Record<PageKind, string[]> = {
  overview: [
    "Mapping your school’s learning intelligence",
    "Connecting classroom activity with academic insights",
    "Preparing school-wide intelligence",
    "Surfacing actionable insights for leadership",
  ],
  teacher: [
    "Reading today’s teacher activity",
    "Connecting teaching logs with classroom intelligence",
    "Preparing teacher intelligence insights",
    "Surfacing today’s teaching signals",
  ],
  academic: [
    "Analysing exam preparation intelligence",
    "Tracing unresolved doubts across subjects",
    "Connecting academic signals across classes",
    "Preparing the academic readiness view",
  ],
  classroom: [
    "Reading classroom learning signals",
    "Connecting daily feedback with teacher intelligence",
    "Preparing classroom-level intelligence",
    "Surfacing actionable classroom insights",
  ],
};

export default function SchoolAnalyticsLoadingPopup({
  active,
  page,
}: {
  active: boolean;
  page: PageKind;
}) {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      setIndex(0);
      return;
    }

    const showTimer = window.setTimeout(() => setVisible(true), 120);
    return () => window.clearTimeout(showTimer);
  }, [active]);

  useEffect(() => {
    if (!visible || !active) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % MESSAGES[page].length);
    }, 700);
    return () => window.clearInterval(timer);
  }, [active, page, visible]);

  if (!active || !visible) return null;

  return (
    <div className="tp-school-loading-backdrop" aria-live="polite" aria-busy="true">
      <div className="tp-school-loading-card" role="status">
        <div className="tp-school-loading-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="tp-school-loading-eyebrow">TALENT PASSPORT</div>
        <div className="tp-school-loading-title"> Lets dive into School Intelligence</div>
        <div className="tp-school-loading-message" key={`${page}-${index}`}>
          {MESSAGES[page][index]}
        </div>
        <div className="tp-school-loading-progress" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
}

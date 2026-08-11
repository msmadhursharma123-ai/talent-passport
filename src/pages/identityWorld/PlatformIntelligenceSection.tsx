import React from "react";

const pillars = [
  {
    number: "01",
    label: "ACADEMIC & SKILL SUCCESS",
    title: "Elevating student results & real-world potential",
    text: "We bridge the gap between classroom teaching and measurable student growth. By mapping daily learning analytics, our platform identifies hidden understanding gaps before they impact exam scores. We turn complex classroom feedback into actionable growth pathways—improving both academic outcomes and vital real-world skills.",
    points: ["Subject mastery", "Skill growth", "Continuous improvement"],
  },
  {
    number: "02",
    label: "SEAMLESS INTEGRATION",
    title: "The Intelligence layer over your existing tech stack",
    text: "No migration headaches, no broken workflows, and absolutely zero friction. Our platform sits gracefully at the top of your school's existing ecosystem, serving as the master intelligence layer for the ERP, LMS, or learning tools you already use.",
    points: ["ERP + LMS compatible", "One intelligence layer", "Live real-time insights"],
  },
];

export default function PlatformIntelligenceSection() {
  return (
    <section className="pi">
      <div className="pi-shell">
        <header className="pi-heading">
          <div className="pi-eyebrow"><span /> ACADEMIC INTELLIGENCE · ECOSYSTEM OVERLAY</div>
          <h2>One intelligence layer.<br /><em>Every learning signal connected.</em></h2>
          <p>Talent Passport sits above your existing ecosystem and turns scattered classroom signals into one connected picture of academic progress, skill growth and actionable improvement.</p>
        </header>

        <div className="pi-hero">
          <div className="pi-image-frame">
            <img src="/landing/mainpage.webp" alt="Talent Passport intelligence platform" draggable="false" />
            <div className="pi-caption"><i /> LIVE LEARNING INTELLIGENCE</div>
          </div>
          <aside className="pi-side-note">
            <span className="pi-note-number">01</span>
            <strong>See the whole picture.</strong>
            <p>Students, teachers, parents and school leaders work from the same intelligence layer instead of disconnected dashboards.</p>
          </aside>
        </div>

        <div className="pi-divider"><span>HOW THE LAYER CREATES VALUE</span></div>

        <div className="pi-cards">
          {pillars.map(item => (
            <article className="pi-card" key={item.number}>
              <div className="pi-card-top"><span className="pi-number">{item.number}</span><span className="pi-label">{item.label}</span></div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <div className="pi-points">{item.points.map(point => <span key={point}><b>✓</b>{point}</span>)}</div>
            </article>
          ))}
        </div>

        <div className="pi-bottom">
          <div><span>THE RESULT</span><strong>Better decisions, earlier interventions, stronger outcomes.</strong></div>
          <div className="pi-arrow">↗</div>
        </div>
      </div>

      <style>{`
        .pi{position:relative;overflow:hidden;padding:clamp(55px,8vw,105px) 18px;background:radial-gradient(circle at 8% 15%,rgba(245,166,35,.10),transparent 28%),linear-gradient(180deg,#f7faff,#fff 55%,#f6f9fd);color:#14213d}
        .pi-shell{max-width:1180px;margin:auto}
        .pi-heading{max-width:900px;margin-bottom:38px}
        .pi-eyebrow{display:flex;align-items:center;gap:10px;color:#f5a623;font-size:11px;font-weight:900;letter-spacing:.18em}
        .pi-eyebrow span{width:26px;height:2px;background:#f5a623;border-radius:4px}
        .pi-heading h2{margin:16px 0 15px;font-size:clamp(38px,5.7vw,70px);line-height:.98;letter-spacing:-.055em}
        .pi-heading h2 em{color:#214d86;font-style:normal}
        .pi-heading p{max-width:760px;margin:0;color:#596982;font-size:clamp(16px,1.8vw,19px);line-height:1.7}
        .pi-hero{display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:18px;align-items:stretch}
        .pi-image-frame{position:relative;overflow:hidden;background:#fff;border:1px solid #dce5f0;border-radius:28px;box-shadow:0 25px 70px rgba(20,33,61,.11)}
        .pi-image-frame img{display:block;width:100%;height:auto;max-height:600px;object-fit:contain;user-select:none;-webkit-user-drag:none}
        .pi-caption{position:absolute;left:18px;bottom:18px;display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:999px;background:rgba(20,33,61,.9);color:#fff;font-size:10px;font-weight:900;letter-spacing:.1em}
        .pi-caption i{width:7px;height:7px;border-radius:50%;background:#f5a623;box-shadow:0 0 0 4px rgba(245,166,35,.18)}
        .pi-side-note{display:flex;flex-direction:column;justify-content:flex-end;padding:25px;border-radius:24px;background:#14213d;color:#fff;box-shadow:0 20px 55px rgba(20,33,61,.16)}
        .pi-note-number{width:38px;height:38px;display:grid;place-items:center;border-radius:12px;background:#f5a623;color:#14213d;font-size:12px;font-weight:900}
        .pi-side-note strong{font-size:24px;line-height:1.15;margin-top:55px}
        .pi-side-note p{color:#c7d1df;font-size:14px;line-height:1.6;margin:10px 0 0}
        .pi-divider{display:flex;align-items:center;gap:15px;margin:45px 0 18px;color:#7b899e;font-size:10px;font-weight:900;letter-spacing:.16em}
        .pi-divider:after{content:"";height:1px;flex:1;background:#dce5f0}
        .pi-cards{display:grid;grid-template-columns:1fr 1fr;gap:18px}
        .pi-card{padding:27px;border:1px solid #dce5f0;border-radius:24px;background:rgba(255,255,255,.94);box-shadow:0 15px 42px rgba(20,33,61,.07);transition:.25s}
        .pi-card:hover{transform:translateY(-4px);box-shadow:0 22px 55px rgba(20,33,61,.11)}
        .pi-card-top{display:flex;align-items:center;gap:11px;margin-bottom:18px}
        .pi-number{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:#edf3fa;color:#214d86;font-weight:900;font-size:12px}
        .pi-label{color:#214d86;font-size:10px;font-weight:900;letter-spacing:.12em}
        .pi-card h3{margin:0;color:#14213d;font-size:clamp(25px,3vw,36px);line-height:1.08;letter-spacing:-.035em}
        .pi-card>p{color:#596982;font-size:15px;line-height:1.7;margin:15px 0 21px}
        .pi-points{display:flex;flex-wrap:wrap;gap:7px}
        .pi-points span{display:inline-flex;align-items:center;gap:6px;padding:8px 10px;border-radius:999px;background:#f6f9fc;color:#53627a;border:1px solid #e4eaf2;font-size:11px;font-weight:700}
        .pi-points b{color:#f5a623}
        .pi-bottom{margin-top:18px;padding:20px 23px;border-radius:20px;background:linear-gradient(100deg,#14213d,#214d86);color:#fff;display:flex;justify-content:space-between;align-items:center;gap:20px}
        .pi-bottom span{display:block;color:#f5a623;font-size:9px;font-weight:900;letter-spacing:.15em;margin-bottom:5px}
        .pi-bottom strong{font-size:clamp(16px,2vw,21px)}
        .pi-arrow{width:42px;height:42px;flex:0 0 42px;display:grid;place-items:center;border-radius:50%;background:#f5a623;color:#14213d;font-size:20px;font-weight:900}
        @media(max-width:850px){.pi{padding-left:15px;padding-right:15px}.pi-hero{grid-template-columns:1fr}.pi-side-note{min-height:170px}.pi-side-note strong{margin-top:35px}}
        @media(max-width:620px){.pi{padding-top:48px;padding-bottom:65px}.pi-heading h2{font-size:38px;line-height:1.02}.pi-heading p{font-size:15.5px;line-height:1.65}.pi-image-frame{border-radius:19px}.pi-image-frame img{width:100%;height:auto;object-fit:contain}.pi-caption{left:10px;bottom:10px;font-size:8px;padding:7px 9px}.pi-side-note{border-radius:19px;padding:19px;min-height:155px}.pi-side-note strong{font-size:21px;margin-top:27px}.pi-side-note p{font-size:13px}.pi-cards{grid-template-columns:1fr;gap:12px}.pi-card{padding:20px;border-radius:19px}.pi-card h3{font-size:25px}.pi-card>p{font-size:14px;line-height:1.65}.pi-bottom{padding:17px;border-radius:17px}.pi-bottom strong{font-size:15px;line-height:1.35;display:block}}
      `}</style>
    </section>
  );
}

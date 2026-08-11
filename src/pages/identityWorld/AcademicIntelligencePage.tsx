import React from "react";

const intelligenceSteps = [
  "Prepare Students Before Every Unit Test",
  "Resolve Learning Doubts Earlier",
  "Identify Hidden Academic Gaps",
  "Support Every Student With Confidence",
  "Keep Parents Connected to Progress",
  "Build Better Academic Outcomes",
];

const cards = [
  {
    title: "School–Parent Partnership",
    text: "Keep teachers and parents connected through continuous visibility."
  },
  {
    title: "Teacher Support",
    text: "Help teachers understand classroom learning trends."
  },
  {
    title: "Academic Continuity",
    text: "Learning records grow every teaching day."
  },
  {
    title: "School Improvement",
    text: "Enable data-informed academic planning."
  },
];

export default function AcademicIntelligencePage() {
  return (
    <main className="ai-page">
      <div className="ai-shell">
        <section className="ai-intro">
          <div className="ai-copy">
            <span className="ai-eyebrow">ACADEMIC INTELLIGENCE</span>
            <h1>Help Every Student <em>Learn With Confidence.</em></h1>
            <p>
              Academic excellence is built through thousands of classroom
              moments—not only final examinations. Understanding learning
              patterns across classrooms helps schools strengthen teaching
              support, student outcomes and long-term academic performance.
            </p>
            <div className="ai-pills">
              <span>LIVE LEARNING SIGNALS</span>
              <span>STUDENT UNDERSTANDING</span>
              <span>ACADEMIC CONTINUITY</span>
            </div>
          </div>

          <div className="ai-image-card">
            <img
              src="/landing/academic.webp"
              alt="Academic intelligence platform"
              draggable="false"
            />
            <div className="ai-image-tag">
              <span /> ACADEMIC INTELLIGENCE LAYER
            </div>
          </div>
        </section>

        <section className="ai-value-grid">
          <div className="ai-value-main">
            <span className="ai-section-label">FROM DAILY LEARNING TO BETTER MARKS</span>
            <h2>Turn everyday classroom evidence into earlier academic action.</h2>
            <p>
              Instead of waiting for the final result to reveal a problem,
              schools can build a continuous picture of learning, doubts,
              understanding and support needs.
            </p>

            <div className="ai-metrics">
              <div><strong>100%</strong><span>Topic Visibility</span></div>
              <div><strong>Daily</strong><span>Understanding Tracking</span></div>
              <div><strong>AI</strong><span>Learning Intelligence</span></div>
              <div><strong>24×7</strong><span>Parent Visibility</span></div>
            </div>
          </div>

          <div className="ai-flow">
            <div className="ai-flow-head">
              <span>THE INTELLIGENCE FLOW</span>
              <b>From signal → intervention → outcome</b>
            </div>

            <div className="ai-steps">
              {intelligenceSteps.map((step, index) => (
                <div className="ai-step" key={step}>
                  <div className="ai-step-number">{index + 1}</div>
                  <div className="ai-step-content">
                    <strong>{step}</strong>
                    {index < intelligenceSteps.length - 1 && <span className="ai-line" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="ai-support">
          <div className="ai-support-heading">
            <span className="ai-section-label">WHAT THE SCHOOL GAINS</span>
            <h2>Intelligence doesn't replace teachers. <em>It empowers them.</em></h2>
          </div>

          <div className="ai-support-cards">
            {cards.map((card, index) => (
              <article key={card.title} className="ai-support-card">
                <span>0{index + 1}</span>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            ))}
          </div>

          <div className="ai-statement">
            <div className="ai-brain">✦</div>
            <div>
              <strong>Every classroom deserves the same level of intelligence that businesses use to make decisions.</strong>
              <p>Make academic progress visible while there is still time to improve it.</p>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .ai-page{
          background:
            radial-gradient(circle at 8% 10%,rgba(245,166,35,.11),transparent 28%),
            linear-gradient(180deg,#f8fbff 0%,#fff 48%,#f7f9fc 100%);
          color:#14213d;
          overflow:hidden;
        }
        .ai-shell{max-width:1180px;margin:auto;padding:clamp(52px,7vw,96px) 18px}
        .ai-intro{display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);gap:35px;align-items:center}
        .ai-copy{padding:8px 0}
        .ai-eyebrow,.ai-section-label{color:#c5891a;font-size:10px;font-weight:900;letter-spacing:.18em}
        .ai-eyebrow{display:inline-flex;padding:9px 12px;border:1px solid rgba(197,137,26,.18);border-radius:999px;background:#fff5e5}
        .ai-copy h1{font-size:clamp(42px,5.6vw,72px);line-height:.99;letter-spacing:-.055em;margin:20px 0 18px;color:#173f7a}
        .ai-copy h1 em,.ai-support-heading h2 em{font-style:normal;color:#c5891a}
        .ai-copy p{font-size:17px;line-height:1.75;color:#667085;max-width:610px;margin:0}
        .ai-pills{display:flex;flex-wrap:wrap;gap:7px;margin-top:24px}
        .ai-pills span{padding:8px 10px;border-radius:999px;background:#fff;border:1px solid #dfe7f1;color:#53627a;font-size:9px;font-weight:900;letter-spacing:.08em}
        .ai-image-card{position:relative;border:1px solid #dce5f0;border-radius:30px;background:#fff;padding:12px;box-shadow:0 28px 70px rgba(20,33,61,.12);overflow:hidden}
        .ai-image-card img{display:block;width:100%;height:auto;max-height:620px;object-fit:contain;border-radius:21px;user-select:none;-webkit-user-drag:none}
        .ai-image-tag{position:absolute;left:26px;bottom:25px;padding:9px 12px;border-radius:999px;background:rgba(20,33,61,.92);color:#fff;font-size:9px;font-weight:900;letter-spacing:.1em;display:flex;align-items:center;gap:8px}
        .ai-image-tag span{width:7px;height:7px;border-radius:50%;background:#f5a623;box-shadow:0 0 0 4px rgba(245,166,35,.15)}
        .ai-value-grid{margin-top:70px;display:grid;grid-template-columns:1fr .82fr;gap:18px}
        .ai-value-main,.ai-flow{border:1px solid #dce5f0;border-radius:25px;background:rgba(255,255,255,.94);box-shadow:0 16px 42px rgba(20,33,61,.06)}
        .ai-value-main{padding:32px}
        .ai-value-main h2{font-size:clamp(28px,3.5vw,44px);line-height:1.05;letter-spacing:-.04em;margin:13px 0 15px;color:#173f7a}
        .ai-value-main>p{font-size:15px;line-height:1.75;color:#667085;margin:0}
        .ai-metrics{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;margin-top:27px}
        .ai-metrics div{padding:16px;border-radius:16px;background:#f7f9fc;border:1px solid #e5eaf1}
        .ai-metrics strong{display:block;color:#173f7a;font-size:25px}
        .ai-metrics span{display:block;margin-top:5px;color:#667085;font-size:11px}
        .ai-flow{padding:28px}
        .ai-flow-head{display:flex;justify-content:space-between;gap:15px;align-items:flex-start;margin-bottom:25px}
        .ai-flow-head span{font-size:9px;font-weight:900;letter-spacing:.13em;color:#c5891a}
        .ai-flow-head b{font-size:10px;color:#8491a5;text-align:right}
        .ai-step{display:flex;gap:12px}
        .ai-step-number{width:31px;height:31px;flex:0 0 31px;border-radius:11px;background:#173f7a;color:#fff;display:grid;place-items:center;font-size:11px;font-weight:900}
        .ai-step-content{min-width:0;padding-top:6px}
        .ai-step-content strong{font-size:13px;color:#173f7a;line-height:1.35}
        .ai-line{display:block;width:2px;height:23px;margin:8px 0 8px 14px;background:linear-gradient(#c5891a,rgba(197,137,26,0))}
        .ai-support{margin-top:70px}
        .ai-support-heading{max-width:850px}
        .ai-support-heading h2{font-size:clamp(32px,4vw,54px);line-height:1.02;letter-spacing:-.045em;color:#173f7a;margin:12px 0 25px}
        .ai-support-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
        .ai-support-card{padding:23px;border-radius:20px;background:#fff;border:1px solid #dce5f0;box-shadow:0 12px 30px rgba(20,33,61,.05)}
        .ai-support-card>span{font-size:10px;font-weight:900;color:#c5891a}
        .ai-support-card h3{font-size:18px;line-height:1.2;color:#173f7a;margin:20px 0 10px}
        .ai-support-card p{font-size:13px;line-height:1.6;color:#667085;margin:0}
        .ai-statement{display:flex;align-items:center;gap:20px;margin-top:18px;padding:23px;border-radius:21px;background:linear-gradient(100deg,#14213d,#214d86);color:#fff}
        .ai-brain{width:48px;height:48px;flex:0 0 48px;border-radius:15px;background:#f5a623;color:#14213d;display:grid;place-items:center;font-size:22px}
        .ai-statement strong{font-size:16px;line-height:1.35}
        .ai-statement p{margin:5px 0 0;color:#cbd5e1;font-size:12px}
        @media(max-width:900px){.ai-intro{grid-template-columns:1fr}.ai-value-grid{grid-template-columns:1fr}.ai-support-cards{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:600px){
          .ai-shell{padding:45px 15px 65px}
          .ai-copy h1{font-size:42px}
          .ai-copy p{font-size:15px;line-height:1.65}
          .ai-image-card{border-radius:20px;padding:8px}
          .ai-image-card img{border-radius:14px}
          .ai-image-tag{left:15px;bottom:15px;font-size:7px;padding:7px 9px}
          .ai-value-grid,.ai-support{margin-top:45px}
          .ai-value-main,.ai-flow{padding:20px;border-radius:19px}
          .ai-value-main h2{font-size:29px}
          .ai-flow-head{display:block}
          .ai-flow-head b{display:block;text-align:left;margin-top:7px}
          .ai-support-heading h2{font-size:33px}
          .ai-support-cards{grid-template-columns:1fr}
          .ai-support-card{padding:19px}
          .ai-statement{align-items:flex-start;padding:18px}
          .ai-statement strong{font-size:14px}
        }
      `}</style>
    </main>
  );
}

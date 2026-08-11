import React from "react";

const pillars=[
 ["Academic Result","Track learning response early enough to intervene before gaps affect examinations."],
 ["Doubt Resolution","Micromanage unresolved doubts and identify where support is repeatedly required."],
 ["Understanding %","See how much of the classroom is actually understanding, not just attending."],
 ["Teacher Performance","Connect classroom actions with response, closure and improvement patterns."],
];

export default function SchoolAnalyticsPage(){
 return <section className="school-page"><div className="school-inner">
  <div className="school-copy"><div className="kicker">SCHOOL ANALYTICS</div><h1>A School-Wide Intelligence Layer For Continuous Improvement.</h1><p>Help your school track the micro-signals behind every student’s learning journey—from the doubt a student raises today to the understanding percentage that improves over an academic year.</p></div>
  <div className="school-visual"><img src="/landing/schoolanalytics.webp" alt="School analytics" draggable="false"/><div className="school-badge"><strong>LIVE INTELLIGENCE</strong><span>Students · Teachers · Classes</span></div></div>
  <div className="pillar-grid">{pillars.map(([t,d],i)=><article key={t}><span>0{i+1}</span><h3>{t}</h3><p>{d}</p></article>)}</div>
 </div><style>{`
 .school-page{padding:48px 17px 85px;background:#f8fbff}.school-inner{max-width:1180px;margin:auto}.kicker{color:#f5a623;font-size:12px;font-weight:900;letter-spacing:.18em}.school-copy h1{font-size:clamp(38px,6vw,68px);line-height:1.02;letter-spacing:-.05em;color:#14213d;max-width:930px;margin:13px 0}.school-copy p{color:#596982;font-size:clamp(16px,2vw,20px);line-height:1.75;max-width:900px}.school-visual{position:relative;margin:32px auto 25px;border-radius:28px;overflow:hidden;border:1px solid #dfe7f1;background:#fff;box-shadow:0 25px 70px rgba(20,33,61,.1)}.school-visual img{display:block;width:100%;height:auto;object-fit:contain}.school-badge{position:absolute;right:20px;bottom:20px;background:rgba(255,255,255,.94);border-radius:16px;padding:13px 16px;box-shadow:0 12px 30px rgba(20,33,61,.12);display:grid}.school-badge strong{font-size:11px;color:#f5a623;letter-spacing:.1em}.school-badge span{font-size:12px;color:#53627a;margin-top:4px}.pillar-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.pillar-grid article{background:#fff;border:1px solid #dfe7f1;border-radius:20px;padding:20px}.pillar-grid span{color:#f5a623;font-weight:900;font-size:12px}.pillar-grid h3{color:#14213d;margin:10px 0 7px}.pillar-grid p{color:#65748a;font-size:13px;line-height:1.55;margin:0}@media(max-width:850px){.pillar-grid{grid-template-columns:1fr 1fr}}@media(max-width:520px){.school-page{padding:38px 15px 65px}.school-copy h1{font-size:37px}.school-copy p{font-size:16px;line-height:1.65}.school-visual{border-radius:18px}.school-badge{right:10px;bottom:10px;padding:10px 11px}.pillar-grid{grid-template-columns:1fr}.pillar-grid article{padding:17px}}
 `}</style></section>
}

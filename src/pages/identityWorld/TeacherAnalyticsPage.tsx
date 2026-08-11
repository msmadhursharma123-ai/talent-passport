import React from "react";

const metrics=[
 ["01","Understanding","See which concepts are understood, uncertain or repeatedly misunderstood."],
 ["02","Doubt Closure","Track unresolved doubts and close the loop before they become learning gaps."],
 ["03","Participation","Turn classroom response patterns into actionable teacher insight."],
 ["04","Growth","Compare learning response over time instead of relying on a single test."],
];

export default function TeacherAnalyticsPage(){
 return <section className="teacher-page"><div className="teacher-inner">
   <div className="teacher-head"><div className="kicker">TEACHER ANALYTICS</div><h1>Turn Classroom Signals Into Better Teaching.</h1><p>A live intelligence layer that helps teachers understand response, identify gaps and act while learning is still happening.</p></div>
   <div className="teacher-layout"><div className="teacher-cards">{metrics.map(([n,t,d])=><article key={n}><b>{n}</b><div><h3>{t}</h3><p>{d}</p></div></article>)}</div><div className="teacher-media"><img src="/landing/teacheranalytics.webp" alt="Teacher analytics" draggable="false"/></div></div>
 </div><style>{`
 .teacher-page{padding:48px 17px 85px;background:#fff}.teacher-inner{max-width:1180px;margin:auto}.kicker{color:#f5a623;font-size:12px;font-weight:900;letter-spacing:.18em}.teacher-head h1{color:#14213d;font-size:clamp(38px,6vw,68px);line-height:1.02;letter-spacing:-.05em;max-width:850px;margin:13px 0}.teacher-head p{color:#596982;max-width:800px;font-size:clamp(16px,2vw,20px);line-height:1.7}.teacher-layout{display:grid;grid-template-columns:.85fr 1.15fr;gap:25px;align-items:stretch;margin-top:35px}.teacher-cards{display:grid;grid-template-columns:1fr 1fr;gap:12px}.teacher-cards article{background:linear-gradient(145deg,#fff,#f7faff);border:1px solid #dfe7f1;border-radius:22px;padding:20px;display:flex;gap:13px;box-shadow:0 15px 35px rgba(20,33,61,.07)}.teacher-cards b{color:#f5a623;font-size:12px}.teacher-cards h3{margin:0 0 7px;color:#14213d}.teacher-cards p{margin:0;color:#65748a;line-height:1.5;font-size:13px}.teacher-media{border-radius:26px;overflow:hidden;border:1px solid #dfe7f1;background:#f8fafc;box-shadow:0 25px 65px rgba(20,33,61,.1)}.teacher-media img{display:block;width:100%;height:100%;object-fit:contain}@media(max-width:850px){.teacher-layout{grid-template-columns:1fr}.teacher-media{order:-1}.teacher-cards{grid-template-columns:1fr 1fr}}@media(max-width:520px){.teacher-page{padding:38px 15px 65px}.teacher-head h1{font-size:37px}.teacher-head p{font-size:16px}.teacher-cards{grid-template-columns:1fr}.teacher-cards article{padding:17px;border-radius:18px}.teacher-media{border-radius:18px}}
 `}</style></section>
}

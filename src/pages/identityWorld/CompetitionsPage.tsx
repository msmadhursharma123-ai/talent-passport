import React from "react";

const events = [
  ["🗣️","Event 1","Communication"],
  ["💡","Event 2","Critical Thinking"],
  ["🎨","Event 3","Creativity"],
  ["🤝","Event 4","Team Collaboration"],
];

export default function CompetitionsPage(){
  return <section className="comp-page"><div className="comp-inner">
    <div className="comp-copy">
      <div className="kicker">20 CHALLENGES · 4 SKILL PILLARS</div>
      <h1>Tailor Your Journey: Choose Your 4 Skill Challenges</h1>
      <p>No student sits on the sidelines. We don’t push traditional rote-learning contests; instead, we offer dynamic, NEP-focused challenges designed to discover every child's unique potential.</p>
    </div>
    <div className="comp-media"><img src="/landing/competitions.webp" alt="Talent Passport competitions" draggable="false"/></div>
    <div className="event-grid">{events.map(([icon,event,title])=><article key={event}><span>{icon}</span><small>{event}</small><h3>{title}</h3><p>Choose 1 out of 5 competitions</p></article>)}</div>
    <div className="result"><strong>The Result</strong><span>Every student participates in all 4 essential real-world skill pillars, picking the exact <b>4 competitions out of 20</b> that ignite their passion.</span></div>
  </div><style>{`
    .comp-page{background:#fff;padding:46px 17px 80px}.comp-inner{max-width:1180px;margin:auto}.kicker{color:#f5a623;font-size:12px;font-weight:900;letter-spacing:.18em}.comp-copy h1{color:#14213d;font-size:clamp(38px,6vw,67px);line-height:1.02;letter-spacing:-.045em;max-width:900px;margin:13px 0}.comp-copy>p{max-width:850px;color:#596982;font-size:clamp(16px,2vw,20px);line-height:1.7}.comp-media{margin:30px 0;border-radius:26px;overflow:hidden;border:1px solid #e3e9f2;background:#f8fafc}.comp-media img{display:block;width:100%;height:auto;object-fit:contain}.event-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:25px}.event-grid article{padding:22px;border:1px solid #e3e9f2;border-radius:22px;background:#fff;box-shadow:0 14px 35px rgba(20,33,61,.07)}.event-grid span{font-size:27px}.event-grid small{display:block;color:#f5a623;font-weight:800;margin-top:13px}.event-grid h3{margin:6px 0;color:#14213d}.event-grid p{color:#65748a;margin:0;font-size:14px}.result{margin-top:22px;border-radius:22px;padding:22px;background:linear-gradient(135deg,#14213d,#214d86);color:#fff;display:flex;gap:15px;align-items:flex-start}.result strong{color:#f5a623;white-space:nowrap}.result span{line-height:1.6}@media(max-width:800px){.event-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:520px){.comp-page{padding:38px 15px 65px}.comp-copy h1{font-size:37px}.comp-copy>p{font-size:16px}.comp-media{border-radius:18px}.event-grid{gap:9px}.event-grid article{padding:16px;border-radius:17px}.event-grid h3{font-size:15px}.event-grid p{font-size:12px}.result{display:block;border-radius:18px}.result span{display:block;margin-top:8px}}
  `}</style></section>
}

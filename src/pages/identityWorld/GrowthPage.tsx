import React, { useEffect, useState } from "react";

const rows=[
 ["Teachers","Plan lessons → ask questions → review responses","Faster feedback · better intervention","Better teachers"],
 ["Students","Respond → reflect → act on feedback","Stronger ownership · visible growth","Better students"],
 ["Leaders","Collect intelligence → identify patterns → improve practice","Data-backed professional development","Better leaders"],
];

export default function GrowthPage(){
 const [active,setActive]=useState(0);
 useEffect(()=>{const id=setInterval(()=>setActive(v=>(v+1)%rows.length),2600);return()=>clearInterval(id)},[]);
 return <section className="growth-page"><div className="growth-inner">
  <div className="growth-head"><div className="kicker">GROWTH INTELLIGENCE</div><h1>From Classroom Signals To Measurable Growth.</h1><p>One intelligence loop connecting inputs, activities, outputs and outcomes across the people who make learning happen.</p></div>
  <div className="growth-table">
   <div className="growth-person"><div className="avatar">◉</div><strong>{rows[active][0]}</strong><span>Active in the intelligence loop</span></div>
   {rows[active].slice(1).map((x,i)=><div className="growth-col" key={i}><small>{["ACTIVITIES","OUTPUTS","OUTCOMES"][i]}</small><div>{x}</div></div>)}
  </div>
  <div className="growth-tabs">{rows.map((r,i)=><button className={i===active?"active":""} onClick={()=>setActive(i)} key={r[0]}>{r[0]}</button>)}</div>
 </div><style>{`
 .growth-page{padding:48px 17px 85px;background:#fff}.growth-inner{max-width:1180px;margin:auto}.kicker{color:#f5a623;font-size:12px;font-weight:900;letter-spacing:.18em}.growth-head h1{font-size:clamp(38px,6vw,68px);line-height:1.02;letter-spacing:-.05em;color:#14213d;max-width:900px;margin:13px 0}.growth-head p{color:#596982;font-size:clamp(16px,2vw,20px);line-height:1.7;max-width:850px}.growth-table{display:grid;grid-template-columns:.65fr 1fr 1fr 1fr;gap:0;margin-top:38px;border:1px solid #e0e7f0;border-radius:25px;overflow:hidden;box-shadow:0 22px 60px rgba(20,33,61,.1)}.growth-person,.growth-col{padding:25px;border-right:1px solid #e0e7f0;min-height:220px}.growth-person{background:#f8fafc;display:flex;flex-direction:column;justify-content:center}.avatar{width:65px;height:65px;border-radius:50%;display:grid;place-items:center;background:#eaf0f8;color:#214d86;font-size:35px;margin-bottom:16px}.growth-person strong{font-size:22px;color:#14213d}.growth-person span{font-size:12px;color:#738198;margin-top:6px}.growth-col{background:#fff}.growth-col small{color:#f5a623;font-weight:900;letter-spacing:.12em}.growth-col div{margin-top:20px;color:#42536d;line-height:1.7}.growth-tabs{display:flex;gap:8px;margin-top:16px}.growth-tabs button{border:1px solid #dfe7f1;background:#fff;border-radius:999px;padding:10px 17px;color:#53627a;font-weight:800;cursor:pointer}.growth-tabs .active{background:#14213d;color:#fff;border-color:#14213d}@media(max-width:700px){.growth-table{grid-template-columns:1fr;}.growth-person,.growth-col{min-height:auto;border-right:0;border-bottom:1px solid #e0e7f0;padding:19px}.growth-person{align-items:flex-start}.growth-tabs{overflow:auto;padding-bottom:5px}.growth-tabs button{white-space:nowrap}.growth-head h1{font-size:37px}.growth-head p{font-size:16px}}
 `}</style></section>
}

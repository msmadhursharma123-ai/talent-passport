import React from "react";

const items = [
  ["🏆","Achievements","Turn recognition into a permanent digital record."],
  ["📁","Projects","Show what you built, solved, created and led."],
  ["🎓","Certificates","Keep proof of skills accessible in one identity."],
  ["🎯","Skills","Map measurable improvement, not just participation."],
  ["💳","Talent Credits","Earn credits from achievements and performance."],
  ["🪪","Talent Passport","Carry your verified growth identity anywhere."],
];

export default function StudentPortfolioPage(){
  return <section className="portfolio-page">
    <div className="portfolio-inner">
      <div className="kicker">DIGITAL PORTFOLIO</div>
      <h1>Build Your Talent Passport.</h1>
      <p className="lead">
     Don't let your school achievements fade after the marks are given. Upload your projects, certificates, and performances here to build a powerful digital identity, earn Talent Credits for every milestone, and unlock exclusive scholarships, masterclasses, and real-world academy opportunities.
      </p>
      <h2>Build your Talent Passport.</h2>
      <div className="portfolio-grid">{items.map(([icon,title,text])=>
        <article className="portfolio-card" key={title}>
          <span>{icon}</span><h3>{title}</h3><p>{text}</p>
        </article>
      )}</div>
      <div className="portfolio-media"><img src="/landing/studentportfolio.webp" alt="Student digital portfolio" draggable="false"/></div>
    </div>
    <style>{`
      .portfolio-page{background:linear-gradient(180deg,#fff,#f7faff);padding:45px 17px 85px;overflow:hidden}
      .portfolio-inner{max-width:1180px;margin:auto}
      .kicker{color:#f5a623;font-weight:900;font-size:12px;letter-spacing:.18em}
      .portfolio-page h1{font-size:clamp(38px,6vw,70px);line-height:1;letter-spacing:-.05em;color:#14213d;margin:13px 0}
      .lead{max-width:980px;color:#596982;font-size:clamp(16px,2vw,20px);line-height:1.75}
      .portfolio-page h2{color:#214d86;font-size:clamp(23px,3vw,34px);margin:36px 0 18px}
      .portfolio-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}
      .portfolio-card{background:#fff;border:1px solid #e1e8f2;border-radius:20px;padding:22px 15px;box-shadow:0 14px 35px rgba(20,33,61,.07)}
      .portfolio-card span{font-size:25px}.portfolio-card h3{font-size:16px;color:#14213d;margin:14px 0 7px}.portfolio-card p{font-size:13px;line-height:1.5;color:#65748a;margin:0}
      .portfolio-media{margin-top:28px;border-radius:26px;overflow:hidden;border:1px solid #e1e8f2;background:#fff;box-shadow:0 24px 60px rgba(20,33,61,.1)}
      .portfolio-media img{display:block;width:100%;height:auto;object-fit:contain;user-select:none;-webkit-user-drag:none}
      @media(max-width:900px){.portfolio-grid{grid-template-columns:repeat(3,1fr)}}
      @media(max-width:600px){.portfolio-page{padding:38px 15px 65px}.portfolio-page h1{font-size:38px}.lead{font-size:16px;line-height:1.65}.portfolio-grid{grid-template-columns:repeat(2,1fr);gap:10px}.portfolio-card{padding:17px 13px;border-radius:16px}.portfolio-card h3{font-size:15px}.portfolio-card p{font-size:12px}.portfolio-media{border-radius:18px}}
    `}</style>
  </section>
}

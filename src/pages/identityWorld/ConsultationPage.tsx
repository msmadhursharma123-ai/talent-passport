import React from "react";
import { ArrowRight, Check, Compass, GraduationCap, HeartHandshake, LineChart, Sparkles, UsersRound } from "lucide-react";

const features = [
  { icon: <Compass size={20}/>, title: "Academic Guidance", text: "Clarify learning gaps, study pathways and academic decisions." },
  { icon: <Sparkles size={20}/>, title: "Talent Guidance", text: "Understand where a student's strengths can be developed further." },
  { icon: <GraduationCap size={20}/>, title: "Career Readiness", text: "Connect growth evidence with future opportunities and pathways." },
  { icon: <UsersRound size={20}/>, title: "Parent Support", text: "Give families a clearer picture before making important decisions." },
  { icon: <LineChart size={20}/>, title: "Evidence-led Context", text: "Experts can work from the student's verified growth profile." },
  { icon: <HeartHandshake size={20}/>, title: "Trusted Experts", text: "Create a structured consultation ecosystem rather than an open directory." },
];

export default function ConsultationPage() {
  return (
    <main className="cp">
      <div className="cp-shell">
        <section className="cp-hero">
          <div className="cp-hero-copy">
            <span className="cp-eyebrow">CONSULTATION ECOSYSTEM</span>
            <h1>The right guidance at the <em>right stage</em> of a student's journey.</h1>
            <p>
              Connect students and parents with relevant experts for academic,
              talent and future-readiness decisions—starting with context,
              not generic advice.
            </p>
            <div className="cp-actions">
              <a href="#contact"><span>Explore Consultation</span><ArrowRight size={16}/></a>
              <div><Check size={15}/> Context-led guidance</div>
            </div>
          </div>

          <div className="cp-image">
            <img src="/landing/consultation.webp" alt="Talent Passport consultation ecosystem" draggable="false"/>
            <div className="cp-image-label"><span/> CONSULTATION CONTEXT</div>
          </div>
        </section>

        <section className="cp-context">
          <div className="cp-context-intro">
            <span className="cp-label">GUIDANCE, NOT GENERIC ADVICE</span>
            <h2>Every conversation should begin with the student's journey.</h2>
            <p>
              Consultations are designed around the student's existing journey,
              so conversations can start with context instead of starting from zero.
            </p>
          </div>

          <div className="cp-context-flow">
            <div className="cp-flow-step"><b>01</b><span>Growth evidence</span></div>
            <div className="cp-flow-arrow">→</div>
            <div className="cp-flow-step"><b>02</b><span>Relevant expert</span></div>
            <div className="cp-flow-arrow">→</div>
            <div className="cp-flow-step"><b>03</b><span>Actionable guidance</span></div>
          </div>
        </section>

        <section className="cp-features">
          <div className="cp-section-head">
            <span className="cp-label">THE CONSULTATION ECOSYSTEM</span>
            <h2>Support that understands the whole picture.</h2>
          </div>

          <div className="cp-grid">
            {features.map((feature, index) => (
              <article className="cp-card" key={feature.title}>
                <div className="cp-card-icon">{feature.icon}</div>
                <span className="cp-card-number">0{index + 1}</span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
                <div className="cp-card-arrow"><ArrowRight size={15}/></div>
              </article>
            ))}
          </div>
        </section>

        <section className="cp-bottom">
          <div>
            <span>THE TALENT PASSPORT DIFFERENCE</span>
            <strong>Better context leads to better conversations.</strong>
            <p>Build guidance around what the student has actually learned, achieved and demonstrated.</p>
          </div>
          <div className="cp-orbit"><span>TP</span></div>
        </section>
      </div>

      <style>{`
        .cp{background:radial-gradient(circle at 8% 10%,rgba(245,166,35,.10),transparent 27%),linear-gradient(180deg,#f8fbff,#fff 52%,#f6f9fc);color:#14213d;overflow:hidden}
        .cp-shell{max-width:1180px;margin:auto;padding:clamp(52px,7vw,95px) 18px}
        .cp-hero{display:grid;grid-template-columns:.9fr 1.1fr;gap:35px;align-items:center}
        .cp-eyebrow,.cp-label{font-size:10px;font-weight:900;letter-spacing:.18em;color:#c5891a}
        .cp-eyebrow{display:inline-block;padding:9px 12px;border-radius:999px;background:#fff4e4;border:1px solid rgba(197,137,26,.17)}
        .cp-hero h1{font-size:clamp(42px,5.2vw,68px);line-height:1;letter-spacing:-.055em;color:#173f7a;margin:20px 0 18px}
        .cp-hero h1 em{font-style:normal;color:#c5891a}
        .cp-hero-copy>p{max-width:580px;color:#667085;font-size:17px;line-height:1.75;margin:0}
        .cp-actions{display:flex;align-items:center;flex-wrap:wrap;gap:15px;margin-top:25px}
        .cp-actions a{display:inline-flex;align-items:center;gap:9px;padding:13px 16px;border-radius:12px;background:#173f7a;color:#fff;text-decoration:none;font-size:12px;font-weight:900;box-shadow:0 12px 25px rgba(23,63,122,.18)}
        .cp-actions div{display:flex;align-items:center;gap:6px;color:#667085;font-size:11px;font-weight:700}
        .cp-image{position:relative;border:1px solid #dce5f0;border-radius:29px;padding:10px;background:#fff;box-shadow:0 28px 70px rgba(20,33,61,.11);overflow:hidden}
        .cp-image img{display:block;width:100%;height:auto;max-height:620px;object-fit:contain;border-radius:21px;user-select:none;-webkit-user-drag:none}
        .cp-image-label{position:absolute;left:25px;bottom:23px;display:flex;align-items:center;gap:7px;padding:8px 11px;border-radius:999px;background:rgba(20,33,61,.92);color:#fff;font-size:8px;font-weight:900;letter-spacing:.1em}
        .cp-image-label span{width:7px;height:7px;border-radius:50%;background:#f5a623}
        .cp-context{margin-top:70px;padding:30px;border:1px solid #dce5f0;border-radius:25px;background:#fff;display:grid;grid-template-columns:1fr .95fr;gap:35px;box-shadow:0 15px 40px rgba(20,33,61,.05)}
        .cp-context h2,.cp-section-head h2{font-size:clamp(29px,3.6vw,46px);line-height:1.04;letter-spacing:-.045em;color:#173f7a;margin:12px 0}
        .cp-context p{color:#667085;font-size:15px;line-height:1.7;margin:0;max-width:620px}
        .cp-context-flow{display:flex;align-items:center;justify-content:center;gap:10px}
        .cp-flow-step{display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;min-width:90px}
        .cp-flow-step b{width:40px;height:40px;border-radius:13px;display:grid;place-items:center;background:#fff4e4;color:#c5891a;font-size:10px}
        .cp-flow-step span{font-size:11px;color:#53627a;font-weight:800}
        .cp-flow-arrow{color:#c5891a;font-size:18px}
        .cp-features{margin-top:70px}
        .cp-section-head{max-width:700px;margin-bottom:25px}
        .cp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
        .cp-card{position:relative;padding:23px;border:1px solid #dce5f0;border-radius:20px;background:#fff;box-shadow:0 12px 30px rgba(20,33,61,.05);min-height:205px}
        .cp-card-icon{width:42px;height:42px;border-radius:13px;background:#edf3fa;color:#173f7a;display:grid;place-items:center}
        .cp-card-number{position:absolute;top:25px;right:23px;color:#c5891a;font-size:9px;font-weight:900}
        .cp-card h3{font-size:18px;color:#173f7a;margin:24px 0 9px}
        .cp-card p{font-size:13px;line-height:1.6;color:#667085;margin:0;max-width:270px}
        .cp-card-arrow{position:absolute;bottom:20px;right:22px;color:#173f7a}
        .cp-bottom{margin-top:18px;padding:24px;border-radius:21px;background:linear-gradient(100deg,#14213d,#214d86);color:#fff;display:flex;align-items:center;justify-content:space-between;gap:25px}
        .cp-bottom span{font-size:9px;font-weight:900;letter-spacing:.15em;color:#f5a623}
        .cp-bottom strong{display:block;font-size:21px;margin-top:7px}
        .cp-bottom p{font-size:12px;color:#cbd5e1;margin:7px 0 0}
        .cp-orbit{width:62px;height:62px;flex:0 0 62px;border:1px solid rgba(255,255,255,.25);border-radius:50%;display:grid;place-items:center}
        .cp-orbit span{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:#f5a623;color:#14213d;font-size:12px;font-weight:900}
        @media(max-width:900px){.cp-hero{grid-template-columns:1fr}.cp-context{grid-template-columns:1fr}.cp-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:600px){
          .cp-shell{padding:45px 15px 65px}.cp-hero h1{font-size:42px}.cp-hero-copy>p{font-size:15px;line-height:1.65}
          .cp-image{border-radius:20px;padding:7px}.cp-image img{border-radius:14px}.cp-image-label{left:14px;bottom:14px;font-size:7px}
          .cp-context,.cp-card{border-radius:19px}.cp-context{padding:20px;margin-top:45px}.cp-context-flow{flex-wrap:wrap;gap:7px}.cp-flow-arrow{display:none}.cp-flow-step{min-width:75px}
          .cp-features{margin-top:45px}.cp-grid{grid-template-columns:1fr}.cp-card{min-height:185px;padding:19px}.cp-bottom{padding:19px;align-items:flex-start}.cp-bottom strong{font-size:17px}.cp-orbit{width:48px;height:48px;flex-basis:48px}.cp-orbit span{width:32px;height:32px}
        }
      `}</style>
    </main>
  );
}

import React from "react";
import {
  BarChart3,
  BellRing,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  MessageSquareText,
  School,
  Sparkles,
  UsersRound,
} from "lucide-react";

const steps = [
  ["01", <School size={20} />, "Create your School Admin Portal", "Set up your school workspace and create the foundation for a connected learning intelligence system."],
  ["02", <BookOpen size={20} />, "Create your School Classes", "Organise classes and bring the right teachers and students into the right academic structure."],
  ["03", <UsersRound size={20} />, "Track every teacher and student in your school", "Connect classroom activity, student progress and teacher signals into one visible journey."],
  ["04", <BarChart3 size={20} />, "Use Advanced Analytics to improve academic result", "Turn learning signals into patterns, insights and actions that help your school improve."],
  ["05", <MessageSquareText size={20} />, "Do polls, posts and Announcements", "Keep the school community aligned with simple, timely communication and feedback."],
  ["06", <BellRing size={20} />, "Win more Admissions next year with improved results", "Use visible improvement and stronger outcomes to build a stronger story for the next admission cycle."],
] as const;

function StepVisual({ index }: { index: number }) {
  return (
    <div className="tp-resource-visual">
      <img
        src={`/landing/${index + 1}.webp`}
        alt={`Talent Passport resource visual for step ${index + 1}`}
        loading="lazy"
        draggable={false}
      />
      <div className="tp-resource-visual-badge">
        <CheckCircle2 size={13} />
        Talent Passport
      </div>
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <main className="tp-res">
      <style>{`
        .tp-res{
          --n:#14213d;
          --b:#244f8f;
          --m:#66758b;
          --g:#f4a825;
          background:#fff;
          color:var(--n);
          overflow:hidden;
        }
        .tp-res *{box-sizing:border-box}
        .tp-res .w{width:min(1160px,calc(100% - 36px));margin:auto}

        .tp-res .hero{
          padding:clamp(58px,7.5vw,96px) 0 62px;
          background:#fff;
        }
        .tp-res .ey{
          display:flex;
          gap:9px;
          align-items:center;
          margin-bottom:14px;
          color:#9b6912;
          font-size:10px;
          font-weight:850;
          letter-spacing:1.75px;
          text-transform:uppercase;
        }
        .tp-res .ey:before{
          content:"";
          width:26px;
          height:2px;
          background:var(--g);
          border-radius:99px;
        }
        .tp-res h1{
          margin:0;
          max-width:870px;
          font-size:clamp(40px,5.7vw,68px);
          line-height:1.01;
          letter-spacing:-.045em;
          font-weight:730;
        }
        .tp-res h1 span{color:var(--b)}
        .tp-res .intro{
          max-width:680px;
          margin:20px 0 0;
          color:var(--m);
          font-size:16px;
          line-height:1.62;
        }

        .tp-res .process{
          padding:58px 0 72px;
          background:#fbfcfe;
          border-top:1px solid rgba(20,33,61,.07);
          border-bottom:1px solid rgba(20,33,61,.07);
        }
        .tp-res .head{
          display:flex;
          justify-content:space-between;
          gap:30px;
          align-items:end;
          margin-bottom:22px;
        }
        .tp-res h2{
          margin:0;
          font-size:clamp(28px,3.4vw,42px);
          line-height:1;
          letter-spacing:-.04em;
          font-weight:800;
        }
        .tp-res .head p{
          max-width:430px;
          margin:0;
          color:var(--m);
          font-size:13px;
          line-height:1.55;
        }

        .tp-res .step{
          display:grid;
          grid-template-columns:.92fr .78fr;
          gap:68px;
          align-items:center;
          padding:50px 0;
          border-top:1px solid rgba(20,33,61,.08);
        }
        .tp-res .step:first-of-type{border-top:0}
        .tp-res .num{
          display:block;
          margin-bottom:13px;
          color:#a2adbd;
          font-size:9px;
          font-weight:850;
          letter-spacing:1.45px;
        }
        .tp-res .icon{
          width:42px;
          height:42px;
          display:flex;
          align-items:center;
          justify-content:center;
          margin-bottom:15px;
          border-radius:12px;
          background:#fff8eb;
          color:var(--b);
          border:1px solid rgba(244,168,37,.22);
        }
        .tp-res h3{
          margin:0 0 10px;
          max-width:580px;
          font-size:clamp(24px,2.8vw,35px);
          line-height:1.07;
          letter-spacing:-.038em;
          font-weight:800;
        }
        .tp-res .step p{
          margin:0;
          max-width:560px;
          color:var(--m);
          font-size:13.5px;
          line-height:1.65;
        }

        .tp-resource-visual{
          position:relative;
          min-height:300px;
          padding:20px;
          display:flex;
          align-items:center;
          justify-content:center;
          overflow:hidden;
          border-radius:24px;
          background:linear-gradient(145deg,#f3f6fa,#edf2f8);
          border:1px solid rgba(36,79,143,.09);
          box-shadow:0 14px 38px rgba(20,33,61,.055);
        }
        .tp-resource-visual img{
          display:block;
          width:100%;
          max-width:100%;
          height:260px;
          object-fit:contain;
          object-position:center;
          border-radius:14px;
          user-select:none;
          -webkit-user-drag:none;
          filter:drop-shadow(0 12px 22px rgba(20,33,61,.08));
          animation:tp-image-float 5s ease-in-out infinite;
        }
        .tp-resource-visual-badge{
          position:absolute;
          left:16px;
          bottom:15px;
          display:flex;
          align-items:center;
          gap:6px;
          padding:6px 9px;
          border:1px solid rgba(255,255,255,.8);
          border-radius:999px;
          background:rgba(20,33,61,.82);
          color:#fff;
          font-size:8px;
          font-weight:800;
          letter-spacing:.8px;
          text-transform:uppercase;
          backdrop-filter:blur(8px);
        }
        @keyframes tp-image-float{
          50%{transform:translateY(-4px)}
        }

        .tp-res .tip{
          padding:48px 0;
          background:var(--n);
          color:#fff;
        }
        .tp-res .tipin{
          display:grid;
          grid-template-columns:auto 1fr;
          gap:19px;
          align-items:start;
        }
        .tp-res .tipicon{
          width:46px;
          height:46px;
          display:flex;
          align-items:center;
          justify-content:center;
          border-radius:13px;
          background:rgba(244,168,37,.12);
          color:#f4c867;
        }
        .tp-res .tip h2{color:#fff}
        .tp-res .tip p{
          margin:10px 0 0;
          max-width:850px;
          color:#c7d0df;
          font-size:13px;
          line-height:1.65;
        }
        .tp-res .tip strong{color:#fff}

        .tp-res .next{
          padding:60px 0 72px;
          text-align:center;
        }
        .tp-res .next p{
          max-width:650px;
          margin:11px auto 0;
          color:var(--m);
          font-size:13px;
          line-height:1.6;
        }
        .tp-res .next-mark{
          margin-top:15px;
          display:inline-flex;
          align-items:center;
          gap:6px;
          color:var(--b);
          font-size:11px;
          font-weight:800;
        }

        @media(max-width:800px){
          .tp-res .w{width:min(100% - 30px,650px)}
          .tp-res .head{display:block}
          .tp-res .head p{margin-top:11px}
          .tp-res .step{
            grid-template-columns:1fr;
            gap:22px;
            padding:40px 0;
          }
          .tp-resource-visual{
            min-height:270px;
            padding:16px;
          }
          .tp-resource-visual img{
            height:235px;
          }
        }

        @media(max-width:600px){
          .tp-res .w{width:min(100% - 26px,560px)}
          .tp-res .hero{padding:45px 0 48px}
          .tp-res h1{
            font-size:clamp(35px,10.2vw,49px);
            line-height:1.03;
          }
          .tp-res .intro{font-size:13px;line-height:1.58}
          .tp-res .process{padding:42px 0 52px}
          .tp-res .step{padding:34px 0;gap:18px}
          .tp-res h3{font-size:25px}
          .tp-res .step p{font-size:12px}
          .tp-resource-visual{
            min-height:220px;
            padding:12px;
            border-radius:18px;
          }
          .tp-resource-visual img{
            width:100%;
            height:190px;
            max-height:190px;
            object-fit:contain;
            border-radius:11px;
          }
          .tp-resource-visual-badge{
            left:11px;
            bottom:10px;
            font-size:7px;
          }
          .tp-res .tip{padding:40px 0}
          .tp-res .tipin{grid-template-columns:auto 1fr;gap:12px}
          .tp-res .tipicon{width:39px;height:39px}
          .tp-res .tip h2{font-size:24px}
          .tp-res .tip p{font-size:11.5px}
        }

        @media(prefers-reduced-motion:reduce){
          .tp-resource-visual img{animation:none}
        }
      `}</style>

      <section className="hero">
        <div className="w">
          <div className="ey">Talent Passport Resources</div>
          <h1>
            Build a school where every learning signal becomes <span>action.</span>
          </h1>
          <p className="intro">
            A practical six-step journey for schools to set up Talent Passport, connect their people,
            understand what is happening and turn improvement into a stronger school story.
          </p>
        </div>
      </section>

      <section className="process">
        <div className="w">
          <div className="head">
            <h2>How it works.</h2>
            <p>Follow the journey from your first school setup to measurable improvement and a stronger admission story.</p>
          </div>

          {steps.map(([number, icon, title, text], index) => (
            <article className="step" key={number}>
              <div>
                <span className="num">{number}</span>
                <div className="icon">{icon}</div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
              <StepVisual index={index} />
            </article>
          ))}
        </div>
      </section>

      <section className="tip">
        <div className="w tipin">
          <div className="tipicon"><Sparkles size={21} /></div>
          <div>
            <h2>Top Tip</h2>
            <p>
              Remember, real value comes from using Talent Passport with your students. Making Talent Passport part of your teaching routine will help you make every classroom moment count.{" "}
              <strong>We will become your best admission pitch.</strong>
            </p>
          </div>
        </div>
      </section>

      <section className="next">
        <div className="w">
          <h2>What next?</h2>
          <p>Once the system is part of your school routine, learning evidence, improvement signals and student growth begin working together.</p>
          <div className="next-mark">
            <GraduationCap size={15} />
            One connected school journey.
          </div>
        </div>
      </section>
    </main>
  );
}

import React from "react";
import HeroSlider from "../../components/landing/HeroSlider";
import { ArrowRight, BriefcaseBusiness, School, Sparkles, Trophy, UsersRound } from "lucide-react";

interface Props {
  onContinue: () => void;
}

type HomeCard = {
  icon: React.ReactNode;
  number: string;
  title: string;
  text: string;
  href: string;
};

const cards: HomeCard[] = [
  { icon: <School size={18} />, number: "01", title: "School Analytics", text: "See academic performance, understanding, doubt resolution and school-wide improvement as one connected picture.", href: "school-analytics" },
  { icon: <UsersRound size={18} />, number: "02", title: "Teacher Analytics", text: "Turn classroom signals into actionable teacher intelligence, stronger support and measurable improvement.", href: "teacher-analytics" },
  { icon: <BriefcaseBusiness size={18} />, number: "03", title: "Marketplace", text: "Connect students with scholarships, workshops, consultations, academies, auditions and real-world opportunities.", href: "marketplace" },
  { icon: <Trophy size={18} />, number: "04", title: "Talent & Recognition", text: "Competitions, achievements, certificates and a verified portfolio become part of one student identity.", href: "recognition" },
];

export default function IdentityWorldHome({ onContinue }: Props) {
  return (
    <main className="iw-home-clean">
      <style>{`
        .iw-home-clean{
          --n:#14213d;
          --b:#244f8f;
          --m:#64748b;
          --g:#f4a825;
          background:#fff;
          color:var(--n);
          overflow:hidden;
        }
        .iw-home-clean *{box-sizing:border-box}
        .iw-home-clean .iw-ecosystem{
          padding:clamp(52px,6.5vw,88px) 0 96px;
          background:#fff;
        }
        .iw-home-clean .iw-container{
          width:min(1200px,calc(100% - 40px));
          margin:auto;
        }
        .iw-heading{
          display:grid;
          grid-template-columns:minmax(0,1.08fr) minmax(280px,.72fr);
          gap:54px;
          align-items:end;
          margin-bottom:34px;
        }
        .iw-eyebrow{
          display:flex;
          gap:9px;
          align-items:center;
          margin-bottom:13px;
          color:#9b6912;
          font-size:8px;
          font-weight:550;
          letter-spacing:1.75px;
          text-transform:uppercase;
        }
        .iw-eyebrow:before{
          content:"";
          width:25px;
          height:2px;
          background:var(--g);
          border-radius:99px;
        }
        /* Reduced from the previous oversized heading.
           The narrower max-width and lighter tracking keep the exact same visual
           language as the reference: premium, compact and editorial. */
        .iw-title{
          margin:0;
          max-width:690px;
          color:var(--n);
          font-size:clamp(37px,4.25vw,59px);
          line-height:1.02;
          letter-spacing:-.045em;
          font-weight:420;
        }
        .iw-title span{color:var(--b)}
        .iw-lead{
          margin:0 0 2px;
          max-width:485px;
          color:var(--m);
          font-size:clamp(14px,1.18vw,17px);
          line-height:1.58;
        }
        .iw-showcase{
          display:grid;
          grid-template-columns:1.38fr .62fr;
          gap:18px;
          align-items:stretch;
        }
        .iw-image-wrap{
          position:relative;
          min-height:485px;
          overflow:hidden;
          border:1px solid rgba(20,33,61,.1);
          border-radius:23px;
          background:#eef3f8;
          box-shadow:0 16px 42px rgba(20,33,61,.07);
        }
        .iw-image-wrap:after{
          content:"";
          position:absolute;
          inset:0;
          background:linear-gradient(180deg,transparent 56%,rgba(20,33,61,.2));
          pointer-events:none;
        }
        .iw-image{
          display:block;
          width:100%;
          height:100%;
          min-height:485px;
          object-fit:cover;
        }
        .iw-image-label{
          position:absolute;
          left:16px;
          bottom:16px;
          z-index:2;
          display:flex;
          gap:8px;
          align-items:center;
          padding:7px 11px;
          border:1px solid rgba(255,255,255,.28);
          border-radius:999px;
          background:rgba(20,33,61,.73);
          color:#fff;
          font-size:9px;
          font-weight:800;
          letter-spacing:.95px;
          text-transform:uppercase;
          backdrop-filter:blur(12px);
        }
        .iw-image-dot{
          width:6px;
          height:6px;
          border-radius:50%;
          background:var(--g);
        }
        .iw-cards{
          display:grid;
          grid-template-rows:repeat(4,minmax(0,1fr));
          gap:9px;
        }
        .iw-card{
          position:relative;
          display:grid;
          grid-template-columns:auto minmax(0,1fr) auto;
          align-items:center;
          gap:12px;
          padding:14px 15px;
          border:1px solid rgba(20,33,61,.09);
          border-radius:15px;
          background:#fff;
          box-shadow:0 6px 20px rgba(20,33,61,.04);
          transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease;
        }
        .iw-card:hover{
          transform:translateX(-2px);
          border-color:rgba(244,168,37,.34);
          box-shadow:0 12px 26px rgba(20,33,61,.08);
        }
        .iw-card-icon{
          width:38px;
          height:38px;
          display:flex;
          align-items:center;
          justify-content:center;
          border:1px solid rgba(244,168,37,.22);
          border-radius:11px;
          background:#fff8eb;
          color:var(--b);
        }
        .iw-card-number{
          position:absolute;
          right:12px;
          top:8px;
          color:#a2adbd;
          font-size:8px;
          font-weight:850;
          letter-spacing:1.1px;
        }
        .iw-card-title{
          margin:0 0 4px;
          font-size:14px;
          line-height:1.15;
          font-weight:800;
        }
        .iw-card-text{
          margin:0;
          color:var(--m);
          font-size:10.5px;
          line-height:1.42;
        }
        .iw-card-link{
          width:29px;
          height:29px;
          display:flex;
          align-items:center;
          justify-content:center;
          border:1px solid rgba(20,33,61,.09);
          border-radius:50%;
          color:var(--b);
          text-decoration:none;
          background:#fbfcfe;
        }
        .iw-discovery{
          display:flex;
          gap:9px;
          align-items:center;
          margin-top:13px;
          padding:10px 2px;
          border-top:1px solid rgba(20,33,61,.09);
          color:#718096;
          font-size:10px;
          font-weight:600;
        }
        .iw-discovery svg{color:#b97c16;flex:0 0 auto}

        @media(max-width:1000px){
          .iw-home-clean .iw-container{width:min(100% - 34px,900px)}
          .iw-heading{grid-template-columns:1fr;gap:13px}
          .iw-title{max-width:720px;font-size:clamp(38px,6.1vw,53px)}
          .iw-showcase{grid-template-columns:1fr}
          .iw-image-wrap,.iw-image{min-height:360px}
          .iw-cards{
            grid-template-columns:repeat(2,minmax(0,1fr));
            grid-template-rows:none;
          }
          .iw-card{min-height:116px}
        }

        @media(max-width:640px){
          .iw-home-clean .iw-ecosystem{padding:42px 0 58px}
          .iw-home-clean .iw-container{width:min(100% - 26px,560px)}
          .iw-title{
            max-width:520px;
            font-size:clamp(34px,9.7vw,46px);
            line-height:1.035;
            letter-spacing:-.038em;
          }
          .iw-lead{font-size:13px;line-height:1.55}
          .iw-heading{margin-bottom:23px}
          .iw-showcase{gap:11px}
          .iw-image-wrap{
            min-height:215px;
            border-radius:18px;
          }
          .iw-image{
            min-height:215px;
            aspect-ratio:16/10;
            object-fit:cover;
          }
          .iw-image-label{
            left:11px;
            bottom:11px;
            padding:6px 9px;
            font-size:7.5px;
          }
          .iw-cards{
            grid-template-columns:1fr;
            gap:8px;
          }
          .iw-card{
            min-height:0;
            padding:13px;
            border-radius:14px;
          }
          .iw-card-icon{width:35px;height:35px}
          .iw-card-title{font-size:14px}
          .iw-card-text{font-size:10.5px}
          .iw-card-link{width:27px;height:27px}
          .iw-discovery{font-size:9.5px;line-height:1.4}
        }

        @media(prefers-reduced-motion:reduce){
          .iw-card{transition:none}
        }
      `}</style>

      <section className="iw-home-hero" id="hero">
        <HeroSlider onContinue={onContinue} />
      </section>

      <section className="iw-ecosystem" aria-label="Identity World ecosystem">
        <div className="iw-container">
          <div className="iw-heading">
            <div>
              <div className="iw-eyebrow">Identity World</div>
              <h2 className="iw-title">
                One ecosystem.<br />
                <span>Your complete growth journey.</span>
              </h2>
            </div>
            <p className="iw-lead">
              Talent Passport connects learning, growth, recognition and opportunity into one clean student journey.
            </p>
          </div>

          <div className="iw-showcase">
            <div className="iw-image-wrap">
              <img
                className="iw-image"
                src="/landing/analytics.webp"
                alt="Talent Passport growth and learning analytics dashboard"
                loading="eager"
                draggable={false}
              />
              <div className="iw-image-label">
                <span className="iw-image-dot" />
                Connected growth intelligence
              </div>
            </div>

            <div className="iw-cards">
              {cards.map((item) => (
                <article className="iw-card" key={item.title}>
                  <div className="iw-card-icon">{item.icon}</div>
                  <div>
                    <h3 className="iw-card-title">{item.title}</h3>
                    <p className="iw-card-text">{item.text}</p>
                  </div>
                  <a className="iw-card-link" href={`#${item.href}`} aria-label={`Explore ${item.title}`}>
                    <ArrowRight size={13} />
                  </a>
                  <span className="iw-card-number">{item.number}</span>
                </article>
              ))}
            </div>
          </div>

          <div className="iw-discovery">
            <Sparkles size={14} />
            <span>Use the navigation to explore academic intelligence, growth intelligence and opportunities in greater depth.</span>
          </div>
        </div>
      </section>
    </main>
  );
}

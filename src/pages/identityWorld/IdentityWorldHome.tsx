import React from "react";
import HeroSlider from "../../components/landing/HeroSlider";
import { ArrowRight, BarChart3, BriefcaseBusiness, School, Sparkles, Trophy, UsersRound } from "lucide-react";

interface Props { onContinue:()=>void; }

export default function IdentityWorldHome({onContinue}:Props){
  const cards = [
    {
      icon:<School size={21}/>,
      title:"School Analytics",
      text:"See academic performance, understanding, doubt resolution and school-wide improvement as one connected picture.",
      href:"school-analytics"
    },
    {
      icon:<UsersRound size={21}/>,
      title:"Teacher Analytics",
      text:"Turn classroom signals into actionable teacher intelligence, stronger support and measurable improvement.",
      href:"teacher-analytics"
    },
    {
      icon:<BriefcaseBusiness size={21}/>,
      title:"Marketplace",
      text:"Connect students with scholarships, workshops, consultations, academies, auditions and real-world opportunities.",
      href:"marketplace"
    },
    {
      icon:<Trophy size={21}/>,
      title:"Talent & Recognition",
      text:"Competitions, achievements, certificates and a verified portfolio become part of one student identity.",
      href:"recognition"
    },
  ];

  return (
    <main className="iw-home">
      <section className="iw-home-hero" id="hero">
        <HeroSlider onContinue={onContinue}/>
      </section>

      <section className="iw-home-intro">
        <div className="iw-page-container">
          <div className="iw-home-intro-head">
            <div>
              <div className="iw-section-eyebrow">IDENTITY WORLD</div>
              <h2>One ecosystem for the complete student journey.</h2>
            </div>
            <p>
              Talent Passport connects learning, growth, recognition and
              opportunity without turning the public website into one endless
              scroll.
            </p>
          </div>

          <div className="iw-home-cards">
            {cards.map(item => (
              <article className="iw-home-card" key={item.title}>
                <div className="iw-home-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <a href={`#${item.href}`}>
                  Explore <ArrowRight size={14}/>
                </a>
              </article>
            ))}
          </div>

          <div className="iw-home-discovery">
            <Sparkles size={17}/>
            <span>Use the navigation to explore academic intelligence, growth intelligence and opportunities in greater depth.</span>
          </div>
        </div>
      </section>
    </main>
  );
}

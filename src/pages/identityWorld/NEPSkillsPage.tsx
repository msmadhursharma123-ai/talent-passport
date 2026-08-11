import React from "react";

export default function NEPSkillsPage() {
  return (
    <section className="iw-nep-page">
      <div className="iw-nep-inner">
        <div className="iw-kicker">NEP-ALIGNED SKILLS</div>
        <h1>Skills That Matter Beyond the Report Card.</h1>
        <p>
          At our core, we bridge the gap between classroom grades and real-world
          success by tracking a student's live growth in vital NEP skills—including
          communication, creativity, critical thinking, confidence, leadership, and
          collaboration—from the very first day they create their profile. While
          schools and parents often focus solely on academic results during the early
          years, the global marketplace tells a different story. From corporate
          boardrooms and elite sports academies to top-tier law firms and competitive
          universities, every industry prioritizes these core competencies for
          long-term individual growth. By mapping a student’s measurable improvement
          across the academic year, we ensure they build the foundational human
          capabilities that truly matter once school ends, preparing them to thrive
          in the entire journey ahead.
        </p>
        <div className="iw-media">
          <img src="/landing/NEP.webp" alt="NEP aligned skills" draggable="false" />
        </div>
      </div>
      <style>{`
        .iw-nep-page{background:#fff;padding:clamp(42px,7vw,90px) 18px;overflow:hidden}
        .iw-nep-inner{max-width:1160px;margin:auto}
        .iw-kicker{color:#f5a623;font-size:12px;font-weight:900;letter-spacing:.18em;margin-bottom:15px}
        .iw-nep-page h1{margin:0;color:#14213d;font-size:clamp(36px,6vw,68px);line-height:1.02;letter-spacing:-.045em;max-width:850px}
        .iw-nep-page p{color:#596982;max-width:930px;font-size:clamp(16px,2vw,20px);line-height:1.75;margin:24px 0 0}
        .iw-media{margin:42px auto 0;background:#f8fafc;border:1px solid #e3e9f2;border-radius:26px;overflow:hidden;box-shadow:0 22px 65px rgba(20,33,61,.12)}
        .iw-media img{display:block;width:100%;height:auto;max-height:720px;object-fit:contain;user-select:none;-webkit-user-drag:none}
        @media(max-width:768px){.iw-nep-page{padding:38px 15px}.iw-nep-page h1{font-size:35px}.iw-nep-page p{font-size:16px;line-height:1.65}.iw-media{margin-top:28px;border-radius:18px}}
      `}</style>
    </section>
  );
}

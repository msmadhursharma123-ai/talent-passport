import React, { useMemo, useRef, useState } from "react";

const outcomes = [
  {
    title: "Schools outperform peer schools in academic results.",
    text: "Daily classroom intelligence shows where learning is slipping before it becomes an exam-result problem.",
  },
  {
    title: "Schools bring the best out of students.",
    text: "Weak areas and unresolved doubts are highlighted after every class so intervention starts early.",
  },
  {
    title: "Schools evaluate students and teachers beyond marks.",
    text: "Progress is seen through understanding, doubt closures and the quality of learning—not marks alone.",
  },
  {
    title: "Schools improve teacher performance.",
    text: "Classroom signals turn into clear feedback on where teaching is working and where support is needed.",
  },
];

export default function FiveMinuteSchoolImpactPage() {
  const [videoKey, setVideoKey] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  /*
   * The supplied landing asset is an MP4 video, not an image.
   * Keep the URL base-aware so it works on localhost, Vercel, and
   * deployments served from a non-root Vite base path.
   */
  const videoSrc = useMemo(() => {
    const base = (import.meta.env.BASE_URL || "/").replace(/\/?$/, "/");
    return `${base}landing/video.mp4?v=${videoKey}`;
  }, [videoKey]);

  const toggleVideoPlayback = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (!video.paused && !video.ended) {
        video.pause();
        return;
      }

      if (video.ended) {
        video.currentTime = 0;
      }

      await video.play();
      // The onPlay handler is the source of truth for the overlay state.
      // Keep this state update as a fallback for browsers that resolve play()
      // before dispatching the play event.
      setVideoPlaying(true);
    } catch (error) {
      console.error("FIVE MINUTE SCHOOL IMPACT VIDEO PLAY FAILED:", error);
      // Re-mount once if the browser rejected the first source instance.
      setVideoKey((value) => value + 1);
    }
  };

  const handleVideoKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      void toggleVideoPlayback();
    }
  };

  return (
    <section className="fm5" aria-label="Five minute school impact">
      <style>{`
        .fm5{
          --fm-n:#14213d;
          --fm-b:#214d86;
          --fm-m:#596982;
          --fm-g:#f5a623;
          position:relative;
          overflow:hidden;
          padding:clamp(58px,8vw,102px) 18px clamp(66px,8vw,105px);
          color:var(--fm-n);
          background:
            radial-gradient(circle at 90% 12%,rgba(245,166,35,.10),transparent 25%),
            radial-gradient(circle at 5% 82%,rgba(33,77,134,.07),transparent 28%),
            linear-gradient(180deg,#f6f9fd 0%,#ffffff 52%,#f7faff 100%);
        }

        .fm5 *{box-sizing:border-box}

        .fm5-shell{
          width:min(1180px,100%);
          margin:0 auto;
        }

        .fm5-heading{
          max-width:910px;
          margin:0 0 clamp(28px,4vw,44px);
        }

        .fm5-eyebrow{
          display:flex;
          align-items:center;
          gap:9px;
          margin-bottom:13px;
          color:#a06d16;
          font-size:10px;
          line-height:1;
          font-weight:900;
          letter-spacing:.18em;
          text-transform:uppercase;
        }

        .fm5-eyebrow span{
          width:26px;
          height:2px;
          flex:0 0 auto;
          border-radius:99px;
          background:var(--fm-g);
        }

        .fm5-heading h2{
          margin:0;
          max-width:900px;
          color:var(--fm-n);
          font-size:clamp(42px,5.7vw,72px);
          line-height:.97;
          letter-spacing:-.055em;
          font-weight:400;
        }

        .fm5-heading h2 em{
          color:var(--fm-b);
          font-style:normal;
        }

        .fm5-heading p{
          max-width:650px;
          margin:16px 0 0;
          color:var(--fm-m);
          font-size:clamp(15px,1.45vw,18px);
          line-height:1.65;
        }

        .fm5-main{
          display:grid;
          grid-template-columns:minmax(0,1.02fr) minmax(360px,.98fr);
          gap:22px;
          align-items:start;
        }

        .fm5-impact{
          min-width:0;
          padding:clamp(25px,3vw,38px);
          border:1px solid #dce5f0;
          border-radius:28px;
          background:rgba(255,255,255,.92);
          box-shadow:0 20px 55px rgba(20,33,61,.075);
        }

        .fm5-impact-head{
          display:flex;
          align-items:flex-end;
          gap:18px;
          margin-bottom:24px;
        }

        .fm5-wehelp{
          flex:0 0 auto;
          display:flex;
          flex-direction:column;
          align-items:flex-start;
          gap:.10em;
          color:var(--fm-n);
          font-size:clamp(50px,6.2vw,78px);
          line-height:.78;
          letter-spacing:-.075em;
          font-weight:900;
          text-transform:uppercase;
        }

        .fm5-wehelp span{
          display:block;
          color:var(--fm-g);
        }

        .fm5-mini-note{
          margin:0 0 2px;
          max-width:180px;
          color:#7b899e;
          font-size:9px;
          line-height:1.45;
          font-weight:800;
          letter-spacing:.11em;
          text-transform:uppercase;
        }

        .fm5-list{
          display:grid;
          gap:8px;
        }

        .fm5-row{
          display:grid;
          grid-template-columns:28px minmax(0,1fr);
          gap:11px;
          align-items:start;
          padding:12px 0;
          border-top:1px solid #e6ecf3;
        }

        .fm5-row:last-child{
          border-bottom:1px solid #e6ecf3;
        }

        .fm5-index{
          display:grid;
          place-items:center;
          width:28px;
          height:28px;
          border-radius:9px;
          background:#edf3fa;
          color:var(--fm-b);
          font-size:9px;
          font-weight:900;
        }

        .fm5-row-title{
          margin:0;
          color:var(--fm-n);
          font-size:14px;
          line-height:1.35;
          font-weight:850;
          letter-spacing:-.01em;
        }

        .fm5-row-text{
          margin:4px 0 0;
          color:var(--fm-m);
          font-size:10.5px;
          line-height:1.48;
        }

        .fm5-video-card{
          position:relative;
          align-self:start;
          justify-self:center;
          width:min(100%,520px);
          min-width:0;
          padding:0;
          height:645px;
          overflow:hidden;
          border:2px solid #b9cde3;
          border-radius:28px;
          background:#ffffff;
          box-shadow:
            0 20px 55px rgba(20,33,61,.075),
            inset 0 0 0 1px rgba(33,77,134,.08);
        }

        .fm5-video-button{
          position:relative;
          display:block;
          width:100%;
          height:100%;
          min-height:0;
          padding:0;
          overflow:hidden;
          border:0;
          border-radius:0;
          background:transparent;
          cursor:pointer;
          text-align:left;
          outline:none;
        }

        .fm5-video-button:focus-visible{
          box-shadow:0 0 0 3px rgba(245,166,35,.75);
        }

        .fm5-video{
          display:block;
          width:100%;
          height:100%;
          min-height:0;
          object-fit:cover;
          background:#ffffff;
          user-select:none;
          -webkit-user-drag:none;
          pointer-events:none;
        }

        .fm5-play{
          position:absolute;
          left:50%;
          top:50%;
          display:grid;
          place-items:center;
          width:66px;
          height:66px;
          transform:translate(-50%,-50%);
          border:1px solid rgba(255,255,255,.45);
          border-radius:50%;
          background:rgba(20,33,61,.76);
          color:#fff;
          box-shadow:0 10px 30px rgba(0,0,0,.2);
          backdrop-filter:blur(10px);
          transition:transform .2s ease,background .2s ease;
        }

        .fm5-video-button:hover .fm5-play,
        .fm5-video-button:focus-visible .fm5-play{
          transform:translate(-50%,-50%) scale(1.06);
          background:rgba(245,166,35,.94);
          color:#14213d;
        }

        .fm5-play svg{
          width:22px;
          height:22px;
          margin-left:3px;
          fill:currentColor;
        }

        .fm5-video-copy{
          position:absolute;
          left:17px;
          right:17px;
          bottom:16px;
          z-index:2;
          color:#fff;
          pointer-events:none;
        }

        .fm5-video-label{
          display:inline-flex;
          align-items:center;
          gap:7px;
          padding:6px 9px;
          border:1px solid rgba(255,255,255,.22);
          border-radius:999px;
          background:rgba(20,33,61,.74);
          color:#fff;
          font-size:8px;
          font-weight:900;
          letter-spacing:.12em;
          text-transform:uppercase;
          backdrop-filter:blur(10px);
        }

        .fm5-video-label i{
          width:5px;
          height:5px;
          border-radius:50%;
          background:var(--fm-g);
          box-shadow:0 0 0 3px rgba(245,166,35,.15);
        }

        .fm5-video-copy strong{
          display:block;
          margin-top:9px;
          font-size:17px;
          line-height:1.18;
          letter-spacing:-.02em;
        }

        .fm5-video-copy small{
          display:block;
          margin-top:4px;
          color:#c7d1df;
          font-size:9px;
          line-height:1.4;
        }

        .fm5-result{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:18px;
          margin-top:16px;
          padding:17px 20px;
          border-radius:18px;
          background:linear-gradient(100deg,#14213d,#214d86);
          color:#fff;
        }

        .fm5-result-label{
          display:block;
          margin-bottom:5px;
          color:var(--fm-g);
          font-size:8px;
          font-weight:900;
          letter-spacing:.16em;
          text-transform:uppercase;
        }

        .fm5-result strong{
          font-size:clamp(15px,1.7vw,20px);
          line-height:1.25;
        }

        .fm5-result-time{
          flex:0 0 auto;
          display:grid;
          place-items:center;
          width:54px;
          height:54px;
          border-radius:16px;
          background:var(--fm-g);
          color:var(--fm-n);
          font-size:9px;
          line-height:1.05;
          font-weight:950;
          letter-spacing:.04em;
          text-align:center;
          text-transform:uppercase;
        }

        /* Desktop: use the vacant right-side space while keeping the video compact enough
           to visually finish alongside the fourth WE HELP item. */
        @media(min-width:901px){
          .fm5-video-card{
            width:min(100%,520px);
            height:645px;
          }
        }

        @media(max-width:900px){
          .fm5{padding-left:15px;padding-right:15px}
          .fm5-main{grid-template-columns:1fr;gap:14px}
          .fm5-video-card{
            order:-1;
            width:100%;
            max-width:none;
            height:auto;
            justify-self:stretch;
            border:2px solid #b9cde3;
            border-radius:23px;
          }
          .fm5-video-button{
            width:100%;
            height:auto;
            aspect-ratio:9 / 16;
          }
          .fm5-video{
            width:100%;
            height:100%;
            object-fit:cover;
          }
          .fm5-impact{padding:23px;border-radius:23px}
        }

        @media(max-width:620px){
          .fm5{
            padding:43px 13px 58px;
            background:
              radial-gradient(circle at 92% 8%,rgba(245,166,35,.085),transparent 28%),
              linear-gradient(180deg,#f7faff 0%,#fff 60%,#f7faff 100%);
          }

          .fm5-heading{margin-bottom:20px}
          .fm5-eyebrow{margin-bottom:10px;font-size:7.5px;letter-spacing:.15em}
          .fm5-eyebrow span{width:20px}
          .fm5-heading h2{
            max-width:520px;
            font-size:clamp(35px,10.5vw,47px);
            line-height:1;
            letter-spacing:-.045em;
          }
          .fm5-heading p{
            max-width:520px;
            margin-top:10px;
            font-size:12px;
            line-height:1.5;
          }

          .fm5-main{gap:10px}

          .fm5-video-card{
            width:100%;
            max-width:none;
            height:auto;
            padding:0;
            border:2px solid #b9cde3;
            border-radius:18px;
            box-shadow:0 10px 28px rgba(20,33,61,.055);
          }

          .fm5-video-button{
            width:100%;
            height:auto;
            min-height:0;
            aspect-ratio:9 / 16;
            border-radius:0;
          }

          .fm5-video{
            width:100%;
            height:100%;
            object-fit:cover;
          }

          .fm5-play{
            width:48px;
            height:48px;
          }

          .fm5-play svg{
            width:16px;
            height:16px;
          }

          .fm5-video-copy{
            left:10px;
            right:10px;
            bottom:10px;
          }

          .fm5-video-label{
            padding:5px 7px;
            font-size:6.5px;
          }

          .fm5-video-copy strong{
            margin-top:6px;
            font-size:13px;
          }

          .fm5-video-copy small{
            margin-top:2px;
            font-size:7.5px;
          }

          .fm5-impact{
            padding:16px 14px;
            border-radius:18px;
            box-shadow:0 10px 28px rgba(20,33,61,.055);
          }

          .fm5-impact-head{
            align-items:center;
            gap:10px;
            margin-bottom:11px;
          }

          .fm5-wehelp{
            font-size:clamp(44px,14.2vw,64px);
            line-height:.78;
            letter-spacing:-.08em;
            gap:.11em;
          }

          .fm5-mini-note{
            max-width:130px;
            margin:0;
            font-size:6.5px;
            line-height:1.35;
            letter-spacing:.09em;
          }

          .fm5-list{gap:0}

          .fm5-row{
            grid-template-columns:22px minmax(0,1fr);
            gap:8px;
            padding:8px 0;
          }

          .fm5-index{
            width:22px;
            height:22px;
            border-radius:7px;
            font-size:7px;
          }

          .fm5-row-title{
            font-size:10.5px;
            line-height:1.3;
          }

          .fm5-row-text{
            margin-top:2px;
            font-size:8px;
            line-height:1.35;
          }

          .fm5-result{
            margin-top:9px;
            padding:12px 13px;
            border-radius:13px;
            gap:10px;
          }

          .fm5-result-label{
            margin-bottom:3px;
            font-size:6.5px;
          }

          .fm5-result strong{
            font-size:11px;
            line-height:1.25;
          }

          .fm5-result-time{
            width:39px;
            height:39px;
            border-radius:11px;
            font-size:6.5px;
          }
        }

        @media(prefers-reduced-motion:reduce){
          .fm5-play{transition:none}
        }
      `}</style>

      <div className="fm5-shell">
        <header className="fm5-heading">
          <div className="fm5-eyebrow">
            <span />
            SCHOOL PERFORMANCE · DAILY INTELLIGENCE
          </div>

          <h2>
            All it takes is just <em>5 mins a day.</em>
          </h2>

          <p>
            A few minutes of daily classroom intelligence can help a school
            see what is working, what is getting missed and where to act next.
          </p>
        </header>

        <div className="fm5-main">
          <article className="fm5-impact">
            <div className="fm5-impact-head">
              <div className="fm5-wehelp">
                WE <span>HELP</span>
              </div>

              <p className="fm5-mini-note">
                Turn everyday classroom signals into measurable school
                improvement.
              </p>
            </div>

            <div className="fm5-list">
              {outcomes.map((item, index) => (
                <div className="fm5-row" key={item.title}>
                  <span className="fm5-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div>
                    <h3 className="fm5-row-title">{item.title}</h3>
                    <p className="fm5-row-text">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <div className="fm5-video-card">
            <div
              className="fm5-video-button"
              role="button"
              tabIndex={0}
              onClick={() => void toggleVideoPlayback()}
              onKeyDown={handleVideoKeyDown}
              aria-label={
                videoPlaying
                  ? "Pause the five minute school intelligence video"
                  : "Play the five minute school intelligence video"
              }
            >
              <video
                key={videoKey}
                ref={videoRef}
                className="fm5-video"
                src={videoSrc}
                playsInline
                preload="metadata"
                onPlay={() => setVideoPlaying(true)}
                onPause={() => setVideoPlaying(false)}
                onEnded={() => setVideoPlaying(false)}
              />

              {!videoPlaying && (
                <span className="fm5-play" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M8.5 5.4v13.2a1 1 0 0 0 1.52.86l10.1-6.6a1 1 0 0 0 0-1.72l-10.1-6.6A1 1 0 0 0 8.5 5.4Z" />
                  </svg>
                </span>
              )}

              <span className="fm5-video-copy">
                <span className="fm5-video-label">
                  <i />
                  5 MINUTES · SCHOOL INTELLIGENCE
                </span>
                <strong></strong>
                <small>
                  {videoPlaying ? "Tap to pause." : "Tap to play."}
                </small>
              </span>
            </div>
          </div>
        </div>

        <div className="fm5-result">
          <div>
            <span className="fm5-result-label">THE DAILY HABIT</span>
            <strong>
              Better visibility. Earlier intervention. Stronger outcomes.
            </strong>
          </div>

          <div className="fm5-result-time">
            5
            <br />
            MINS
          </div>
        </div>
      </div>
    </section>
  );
}

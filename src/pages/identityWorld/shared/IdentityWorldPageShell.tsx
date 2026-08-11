import React from "react";

export const TP = {
  navy: "#173F7A",
  deep: "#07142D",
  blue: "#2563EB",
  gold: "#F5A623",
  orange: "#F97316",
  ink: "#1E293B",
  muted: "#64748B",
  line: "#E2E8F0",
  soft: "#F8FAFC",
  warm: "#FFF8ED",
  white: "#FFFFFF",
};

export function ProtectedImage({
  src,
  alt,
  className,
  style,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{ position: "relative", overflow: "hidden", ...style }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
          userSelect: "none",
          WebkitUserDrag: "none",
          pointerEvents: "none",
        } as React.CSSProperties}
      />
      <span
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, userSelect: "none" }}
      />
    </div>
  );
}

export function PageShell({
  eyebrow,
  title,
  highlight,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 90% 8%, rgba(245,166,35,.13), transparent 22%), linear-gradient(180deg,#FFFFFF 0%,#F8FAFC 100%)",
        color: TP.ink,
        fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflowX: "hidden",
      }}
    >
      <style>{`
        .tp-page-wrap{max-width:1180px;margin:0 auto;padding:72px 24px 88px}
        .tp-eyebrow{font-size:11px;font-weight:900;letter-spacing:.22em;text-transform:uppercase;color:${TP.orange}}
        .tp-title{margin:10px 0 0;font-size:clamp(36px,5vw,66px);line-height:1.02;letter-spacing:-.045em;color:${TP.deep};font-weight:900;max-width:850px}
        .tp-title span{color:${TP.gold}}
        .tp-intro{max-width:820px;margin:22px 0 0;color:${TP.muted};font-size:clamp(15px,1.8vw,19px);line-height:1.75}
        .tp-section{margin-top:56px}
        .tp-card{background:rgba(255,255,255,.92);border:1px solid rgba(23,63,122,.11);border-radius:28px;box-shadow:0 20px 55px rgba(7,20,45,.07)}
        .tp-pill{display:inline-flex;align-items:center;gap:7px;border-radius:999px;background:${TP.warm};border:1px solid #F8D99B;color:#A65B00;padding:7px 12px;font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
        .tp-grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}
        .tp-grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
        .tp-body{font-size:15px;line-height:1.75;color:${TP.muted}}
        .tp-kicker{font-size:11px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:${TP.blue}}
        .tp-feature{padding:22px;border-radius:22px;background:linear-gradient(145deg,#fff,#f8fbff);border:1px solid ${TP.line};transition:transform .25s ease,box-shadow .25s ease}
        .tp-feature:hover{transform:translateY(-4px);box-shadow:0 18px 36px rgba(23,63,122,.10)}
        .tp-number{font-size:12px;font-weight:900;color:${TP.gold};letter-spacing:.12em}
        @media(max-width:900px){.tp-page-wrap{padding:52px 18px 70px}.tp-grid2,.tp-grid3{grid-template-columns:1fr}.tp-section{margin-top:42px}.tp-card{border-radius:22px}}
        @media(max-width:600px){.tp-page-wrap{padding:34px 14px 56px}.tp-title{font-size:34px;line-height:1.06}.tp-intro{font-size:14px;line-height:1.65}.tp-body{font-size:13.5px;line-height:1.7}.tp-feature{padding:17px;border-radius:18px}}
      `}</style>
      <div className="tp-page-wrap">
        <div className="tp-eyebrow">{eyebrow}</div>
        <h1 className="tp-title">
          {title} {highlight && <span>{highlight}</span>}
        </h1>
        <p className="tp-intro">{intro}</p>
        {children}
      </div>
    </main>
  );
}

export function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div className="tp-kicker">{eyebrow}</div>
      <h2 style={{ margin: "7px 0 0", color: TP.deep, fontSize: "clamp(25px,3vw,38px)", lineHeight: 1.1, letterSpacing: "-.03em" }}>{title}</h2>
      {text && <p className="tp-body" style={{ margin: "10px 0 0", maxWidth: 760 }}>{text}</p>}
    </div>
  );
}

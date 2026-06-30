import React from "react";

interface HeroBackgroundProps {
  children?: React.ReactNode;
}

export default function HeroBackground({
  children,
}: HeroBackgroundProps) {
  return (
    <section className="hero-background">

      {/* Animated Gradient */}

      <div className="hero-gradient" />

      {/* Grid */}

      <div className="hero-grid" />

      {/* Glow */}

      <div className="hero-glow hero-glow-one" />
      <div className="hero-glow hero-glow-two" />

      {/* Floating Orbs */}

      <div className="hero-orb orb-one" />
      <div className="hero-orb orb-two" />
      <div className="hero-orb orb-three" />

      {/* Particles */}

      <div className="hero-particles">

        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="particle"
            style={
              {
                "--x": `${Math.random() * 100}%`,
                "--delay": `${Math.random() * 8}s`,
                "--duration": `${8 + Math.random() * 8}s`,
              } as React.CSSProperties
            }
          />
        ))}

      </div>

      <div className="hero-content">

        {children}

      </div>

    </section>
  );
}
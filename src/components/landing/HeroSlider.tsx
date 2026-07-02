import { useEffect, useState } from "react";
import HeroBackground from "./HeroBackground";
import HeroFloatingCards from "./hero/HeroFloatingCards";

interface SlideData {
  eyebrow: string;
  title: string;
  description: string;
  primaryButton: string;
  secondaryButton: string;
}



const slides: SlideData[] = [
  {
    eyebrow: "INDIA'S FIRST TALENT & IDENTITY INFRASTRUCTURE PLATFORM",
    title: "One Passport.\nOne Identity.\nEndless Possibilities.",
    description:
      "Capture every competition, project, achievement, portfolio and real-world experience inside one verified lifelong Talent Passport that grows with every student.",
    primaryButton: "Explore Platform",
    secondaryButton: "Enter Portal",
  },
  {
    eyebrow: "BEYOND MARKS • BEYOND CERTIFICATES",
    title: "Learning Beyond\nThe Classroom.",
    description:
      "Develop communication, creativity, confidence, leadership, and critical thinking through meaningful real-world experiences that prepare students for tomorrow.",
    primaryButton: "Discover Features",
    secondaryButton: "View Student Journey",
  },
  {
    eyebrow: "BUILD • GROW • ACHIEVE",
    title: "Build Talent.\nEarn Credits.\nUnlock Opportunities.",
    description:
      "Participate in competitions, build your portfolio, earn credits, connect with industry partners, and unlock scholarships, workshops, and future opportunities.",
    primaryButton: "Explore Marketplace",
    secondaryButton: "Learn More",
  },
];

interface HeroSliderProps {
  onContinue: () => void;
}

export default function HeroSlider({
  onContinue,
}: HeroSliderProps) {

  const [currentSlide, setCurrentSlide] = useState(0);

  const current = slides[currentSlide];

  /* =====================================================
      AUTO PLAY
  ====================================================== */

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentSlide((previous) =>
        previous === slides.length - 1 ? 0 : previous + 1
      );
    }, 6000);

    return () => window.clearInterval(interval);
  }, []);

  /* =====================================================
      KEYBOARD NAVIGATION
  ====================================================== */

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        nextSlide();
      }

      if (event.key === "ArrowLeft") {
        previousSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* =====================================================
      HELPERS
  ====================================================== */

  const nextSlide = () => {
    setCurrentSlide((previous) =>
      previous === slides.length - 1 ? 0 : previous + 1
    );
  };

  const previousSlide = () => {
    setCurrentSlide((previous) =>
      previous === 0 ? slides.length - 1 : previous - 1
    );
  };

  return (
    <HeroBackground>
      <section className="hero-slider">
        {/* =====================================================
            LEFT SIDE
        ====================================================== */}

        <div
          className="hero-left"
          key={currentSlide}
        >
          <div className="hero-eyebrow">
            {current.eyebrow}
          </div>

          <h1 className="hero-title">
            {current.title}
          </h1>

          <p className="hero-description">
            {current.description}
          </p>

          {/* CTA Buttons */}

         <div className="hero-buttons">

    <button
        className="hero-primary-btn"
        onClick={onContinue}
    >
        Enter Identity World →
    </button>

    <button
        className="hero-secondary-btn"
        onClick={() =>
            document
                .getElementById("journey")
                ?.scrollIntoView({
                    behavior: "smooth",
                })
        }
    >
        Explore Platform
    </button>

</div>

          {/* Slider Indicators */}

          <div className="hero-indicators">
            {slides.map((_, index) => (
              <button
                key={index}
                aria-label={`Slide ${index + 1}`}
                className={`hero-indicator ${
                  currentSlide === index
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setCurrentSlide(index)
                }
              />
            ))}
          </div>

          {/* Platform Highlights */}

          <div className="hero-stats">
            <div className="hero-stat">
              <span>🏆</span>
              <p>Competitions</p>
            </div>

            <div className="hero-stat">
              <span>📂</span>
              <p>Portfolio</p>
            </div>

            <div className="hero-stat">
              <span>🎯</span>
              <p>Credits</p>
            </div>

            <div className="hero-stat">
              <span>🪪</span>
              <p>Verified Identity</p>
            </div>
          </div>
        </div>

        {/* =====================================================
            RIGHT SIDE
        ====================================================== */}

        <div className="hero-right">
          <HeroFloatingCards />
        </div>
      </section>

            {/* =====================================================
          HERO NAVIGATION
      ====================================================== */}

      <div className="hero-navigation">
        <button
          className="hero-nav-btn"
          onClick={previousSlide}
          aria-label="Previous Slide"
        >
          ←
        </button>

        <button
          className="hero-nav-btn"
          onClick={nextSlide}
          aria-label="Next Slide"
        >
          →
        </button>
      </div>

      {/* =====================================================
          SCROLL INDICATOR
      ====================================================== */}

      <div className="hero-scroll">
        <div className="mouse">
          <div className="wheel" />
        </div>

        <span>Scroll to Explore</span>
      </div>
    </HeroBackground>
  );
}
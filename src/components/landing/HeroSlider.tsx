import { useEffect, useRef, useState, type ReactNode } from "react";
import HeroBackground from "./HeroBackground";
import HeroFloatingCards from "./hero/HeroFloatingCards";

interface SlideData {
  eyebrow: string;
  title: string;
  highlightWords: string[];
  description: string;
  primaryButton: string;
  secondaryButton: string;
}

const slides: SlideData[] = [

  {
    eyebrow: "REAL-TIME DIAGNOSTICS",
    title: "Identify learning bottlenecks in seconds, not weeks.",
    highlightWords: ["seconds", "learning"],
    description:
      "Which topics are giving Class 8 Math the most trouble right now? Eliminate manual consolidation and pinpoint learning friction across sections instantly.",
    primaryButton: "See How It Works",
    secondaryButton: "Enter Talent Passport",
  },
  {
    eyebrow: "FOR SCHOOL LEADERS • THE VISIBILITY GAP",
    title: "Your school has the data.\nDo you have the visibility?",
    highlightWords: ["data", "visibility"],
    description:
      "Insights exist across classrooms, but pulling them together shouldn't take days. Unify classroom intelligence into a single, real-time dashboard without chasing staff for manual reports.",
    primaryButton: "Request Demo",
    secondaryButton: "Enter Talent Passport",
  },
  {
    eyebrow: "CLOSING THE LOOP",
    title: "Unresolved doubts become learning gaps.\nAre you catching them?",
    highlightWords: ["doubts", "catching"],
    description:
      "Track doubt resolution automatically. Catch struggling students and micro-gaps before they surface as poor term-end exam scores.",
    primaryButton: "Track Learning Gaps",
    secondaryButton: "Enter Talent Passport",
  },
  {
    eyebrow: "SYSTEMIC INSIGHTS",
    title: "Spot curriculum patterns before they impact results.",
    highlightWords: ["curriculum", "results"],
    description:
      "When five sections struggle with the exact same topic, it’s a systemic trend, not an isolated issue. Surface cross-classroom patterns automatically to guide targeted intervention.",
    primaryButton: "See School Intelligence",
    secondaryButton: "Enter Talent Passport",
  },
  {
    eyebrow: "PROACTIVE SCHOOL MANAGEMENT",
    title: "Stop analyzing past failures.\nStart predicting student outcomes.",
    highlightWords: ["failures", "outcomes"],
    description:
      "Traditional report cards tell you what already went wrong. Learning intelligence flags forming gaps early enough so your educators can actually step in.",
    primaryButton: "See How It Works",
    secondaryButton: "Enter Talent Passport",
  },
  {
    eyebrow: "INDIA'S FIRST TALENT & IDENTITY INFRASTRUCTURE PLATFORM",
    title: "One passport.\nOne identity.\nEndless possibilities.",
    highlightWords: ["passport", "identity", "possibilities"],
    description:
      "Capture every competition, project, achievement, portfolio and real-world experience inside one verified lifelong Talent Passport that grows with every student.",
    primaryButton: "Explore Platform",
    secondaryButton: "Enter Talent Passport",
  },
  {
    eyebrow: "FOR SCHOOLS • FROM DATA TO PERFORMANCE",
    title: "Where student growth\nbecomes school growth.",
    highlightWords: ["student", "school"],
    description:
      "Connect academics, skills, participation, teacher intelligence and student growth in one system to identify gaps, improve outcomes, and build a stronger school.",
    primaryButton: "For Schools",
    secondaryButton: "Enter Talent Passport",
  },
  {
    eyebrow: "ONE PLATFORM • EVERY STAKEHOLDER",
    title: "Everyone grows.\nEverything connects.",
    highlightWords: ["grows", "connects"],
    description:
      "Students understand where they need to grow. Schools resolve learning gaps. Teachers improve classroom performance. Partners reach the right talent and drive meaningful footfall.",
    primaryButton: "Explore Platform",
    secondaryButton: "Enter Talent Passport",
  },
];

interface HeroSliderProps {
  onContinue: () => void;
}

function renderHighlightedTitle(title: string, highlightWords: string[]) {
  const lines = title.split("\n");

  // Build the matcher from the slide's actual highlightWords.
  // This prevents a word such as "data" from being forgotten in a
  // separate hard-coded regex.
  const escapedWords = highlightWords
    .filter(Boolean)
    .map((word) => word.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&"))
    .join("|");

  const highlightPattern = escapedWords
    ? new RegExp(`(${escapedWords})`, "gi")
    : null;

  return lines.map((line, lineIndex) => {
    const parts = highlightPattern ? line.split(highlightPattern) : [line];

    return (
      <span key={lineIndex} className="hero-title-line">
        {parts.map((part, partIndex) => {
          const highlighted = highlightWords.some(
            (word) => word.toLowerCase() === part.toLowerCase()
          );

          return highlighted ? (
            <span key={partIndex} className="hero-title-highlight">
              {part}
            </span>
          ) : (
            <span key={partIndex}>{part}</span>
          );
        })}
      </span>
    );
  }).reduce<ReactNode[]>((output, line, index) => {
    if (index > 0) output.push(<br key={`title-break-${index}`} />);
    output.push(line);
    return output;
  }, []);
}

export default function HeroSlider({ onContinue }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroButtonColor, setHeroButtonColor] = useState("#f5a623");
  const current = slides[currentSlide];
  const primaryButtonRef = useRef<HTMLButtonElement | null>(null);

  // Read the actual rendered CTA color so highlighted title words always
  // match the button instead of relying on a guessed hex value.
  useEffect(() => {
    const button = primaryButtonRef.current;
    if (!button) return;

    const computed = window.getComputedStyle(button);
    const backgroundColor = computed.backgroundColor;

    if (
      backgroundColor &&
      backgroundColor !== "transparent" &&
      backgroundColor !== "rgba(0, 0, 0, 0)"
    ) {
      setHeroButtonColor(backgroundColor);
    }
  }, [currentSlide]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentSlide((previous) =>
        previous === slides.length - 1 ? 0 : previous + 1
      );
    }, 6000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") nextSlide();
      if (event.key === "ArrowLeft") previousSlide();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  const handleAction = (label: string) => {
    switch (label) {
      case "Request Demo":
      case "Schedule a Briefing":
        window.location.hash = "request-demo";
        return;
      case "See School Intelligence":
        window.location.hash = "school-analytics";
        return;
      case "Track Learning Gaps":
        window.location.hash = "teacher-analytics";
        return;
      case "See How It Works":
        window.location.hash = "academic-intelligence";
        return;
      case "For Schools":
        window.location.hash = "schools";
        return;
      case "View Opportunities":
        window.location.hash = "marketplace";
        return;
      case "Explore Platform":
        // Each Explore Platform CTA is intentionally mapped by slide below.
        window.location.hash =
          currentSlide === 5
            ? "hpc"
            : currentSlide === 7
              ? "student-portfolio"
              : "growth";
        return;
      case "Enter Talent Passport":
        onContinue();
        return;
      default:
        return;
    }
  };

  return (
    <HeroBackground>
      <style>{`
        .hero-slider{
          --hero-button-yellow:${heroButtonColor};
        }
        .hero-title-line{display:inline}
        .hero-title-highlight{
          color:var(--hero-button-yellow) !important;
          font-weight:inherit;
        }
      `}</style>
      <section className="hero-slider">
        <div className="hero-left" key={currentSlide}>
          <div className="hero-eyebrow">{current.eyebrow}</div>

          <h1 className="hero-title">
            {renderHighlightedTitle(current.title, current.highlightWords)}
          </h1>

          <p className="hero-description">{current.description}</p>

          <div className="hero-buttons">
            <button
              type="button"
              ref={primaryButtonRef}
              className="hero-primary-btn"
              onClick={() => handleAction(current.primaryButton)}
            >
              {current.primaryButton} →
            </button>

            <button
              type="button"
              className="hero-secondary-btn"
              onClick={() => handleAction(current.secondaryButton)}
            >
              {current.secondaryButton}
            </button>
          </div>

          <div className="hero-indicators">
            {slides.map((slide, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to slide ${index + 1}: ${slide.eyebrow}`}
                className={`hero-indicator ${
                  currentSlide === index ? "active" : ""
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>

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

        <div className="hero-right">
          <HeroFloatingCards />
        </div>
      </section>

      <div className="hero-navigation">
        <button
          type="button"
          className="hero-nav-btn"
          onClick={previousSlide}
          aria-label="Previous Slide"
        >
          ←
        </button>
        <button
          type="button"
          className="hero-nav-btn"
          onClick={nextSlide}
          aria-label="Next Slide"
        >
          →
        </button>
      </div>

      <div className="hero-scroll">
        <div className="mouse">
          <div className="wheel" />
        </div>
        <span>Scroll to Explore</span>
      </div>
    </HeroBackground>
  );
}
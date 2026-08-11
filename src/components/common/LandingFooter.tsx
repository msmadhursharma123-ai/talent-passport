import React from "react";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";

interface LandingFooterProps {
  onContinue: () => void;
}

const groups = [
  {
    title: "Platform",
    links: [
      ["For Schools", "schools"],
      ["Teacher Analytics", "teacher-analytics"],
      ["School Analytics", "school-analytics"],
      ["Student Portfolio", "student-portfolio"],
      ["NEP-Aligned Skills", "nep-skills"],
      ["HPC / Talent Passport", "hpc"],
    ],
  },
  {
    title: "Opportunities",
    links: [
      ["Marketplace", "marketplace"],
      ["Consultation", "consultation"],
      ["Competitions", "competitions"],
      ["Partners", "partners"],
      ["Recognition", "recognition"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["Resources", "resources"],
      ["Blogs", "blogs"],
      ["FAQs", "faq"],
      ["Trust Center", "trust"],
      ["Testimonials", "testimonials"],
    ],
  },
  {
    title: "Company",
    links: [
      ["Founder", "founder"],
      ["Plans", "plans"],
      ["Contact Center", "contact"],
    ],
  },
];

export default function LandingFooter({ onContinue }: LandingFooterProps) {
  return (
    <footer className="iw-footer">
      <div className="iw-footer-top">
        <div className="iw-footer-brand">
          <a href="#hero" className="iw-footer-logo">
            <span className="iw-footer-mark">TP</span>
            <span>
              <strong>talentpassport</strong>
              <small>ONE PASSPORT, ONE IDENTITY, ENDLESS POSSIBILITIES</small>
            </span>
          </a>

          <p>
            Building India's next-generation talent identity ecosystem where
            every learner can discover, grow and showcase their journey beyond
            marks.
          </p>

          <div className="iw-footer-trust">
            <ShieldCheck size={15} />
            <span>Built for a connected education ecosystem</span>
          </div>
        </div>

        <div className="iw-footer-links">
          {groups.map((group) => (
            <div key={group.title}>
              <h3>{group.title}</h3>
              {group.links.map(([label, href]) => (
                <a key={href} href={`#${href}`}>
                  {label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="iw-footer-bottom">
        <span>© 2026 Talent Passport OS. All Rights Reserved.</span>

        <div>
          <a href="#trust">Privacy & Trust</a>
          <a href="#trust">Terms</a>
          <a href="#contact">
            <Mail size={14} />
            Contact
          </a>
        </div>

        <button type="button" onClick={onContinue}>
          Enter Identity World
          <ArrowRight size={14} />
        </button>
      </div>
    </footer>
  );
}

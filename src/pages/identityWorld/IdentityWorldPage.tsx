import React, { type ReactNode } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export interface Feature {
  icon?: string;
  title: string;
  text: string;
}

interface Props {
  eyebrow: string;
  title: string;
  subtitle: string;
  accent?: string;
  children: ReactNode;
}

export function IdentityWorldPage({
  eyebrow,
  title,
  subtitle,
  accent = "orange",
  children,
}: Props) {
  return (
    <main className={`iw-page iw-accent-${accent}`}>
      <section className="iw-page-hero">
        <div className="iw-page-hero-glow iw-page-hero-glow-one" />
        <div className="iw-page-hero-glow iw-page-hero-glow-two" />

        <div className="iw-page-container">
          <div className="iw-eyebrow">
            <Sparkles size={13} />
            {eyebrow}
          </div>

          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </section>

      {children}
    </main>
  );
}

export function FeatureGrid({
  items,
  columns = 3,
}: {
  items: Feature[];
  columns?: 2 | 3 | 4;
}) {
  return (
    <div className={`iw-feature-grid iw-columns-${columns}`}>
      {items.map((item) => (
        <article className="iw-feature-card" key={item.title}>
          {item.icon && <div className="iw-feature-icon">{item.icon}</div>}
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  );
}

export function MetricStrip({
  items,
}: {
  items: { value: string; label: string }[];
}) {
  return (
    <div className="iw-metric-strip">
      {items.map((item) => (
        <div className="iw-metric" key={item.label}>
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function SectionBlock({
  eyebrow,
  title,
  text,
  children,
  dark = false,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  children?: ReactNode;
  dark?: boolean;
}) {
  return (
    <section className={`iw-section ${dark ? "iw-section-dark" : ""}`}>
      <div className="iw-page-container">
        {eyebrow && <div className="iw-section-eyebrow">{eyebrow}</div>}
        <h2>{title}</h2>
        {text && <p className="iw-section-lead">{text}</p>}
        {children}
      </div>
    </section>
  );
}

export function Checklist({ items }: { items: string[] }) {
  return (
    <div className="iw-checklist">
      {items.map((item) => (
        <div className="iw-check" key={item}>
          <span>
            <Check size={14} />
          </span>
          <p>{item}</p>
        </div>
      ))}
    </div>
  );
}

export function CTABox({
  title,
  text,
  action = "Explore Identity World",
  onClick,
}: {
  title: string;
  text: string;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <section className="iw-section iw-section-cta">
      <div className="iw-page-container">
        <div className="iw-cta-box">
          <div>
            <div className="iw-section-eyebrow">TALENT PASSPORT</div>
            <h2>{title}</h2>
            <p>{text}</p>
          </div>

          <button type="button" onClick={onClick}>
            {action}
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </section>
  );
}

export function PageLinkCard({
  title,
  text,
  href,
}: {
  title: string;
  text: string;
  href: string;
}) {
  return (
    <a className="iw-link-card" href={`#${href}`}>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
      <ChevronRight size={20} />
    </a>
  );
}

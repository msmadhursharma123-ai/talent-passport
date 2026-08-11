import { IdentityWorldPage, FeatureGrid, SectionBlock } from "./IdentityWorldPage";

const features = [
  {
    title: "What is Talent Passport?",
    text: "A connected student growth operating system bringing learning, skills, achievements and opportunities into one identity.",
  },
  {
    title: "Who is it for?",
    text: "Students, parents, teachers, schools, learning partners and the wider education ecosystem.",
  },
  {
    title: "Is it only a competition platform?",
    text: "No. Competitions are one evidence and participation layer inside a much broader growth ecosystem.",
  },
  {
    title: "What is the Talent Passport?",
    text: "A verified lifelong student identity that grows through learning, projects, competitions, portfolios and achievements.",
  },
  {
    title: "What do schools get?",
    text: "Teacher intelligence, classroom insights, student growth records, opportunity pathways and school-level analytics.",
  },
  {
    title: "Can students showcase non-academic strengths?",
    text: "Yes. The system is designed to make holistic skills and meaningful experiences visible alongside academics.",
  },
];

export default function FAQPage() {
  return (
    <IdentityWorldPage
      eyebrow="FREQUENTLY ASKED QUESTIONS"
      title="Clear answers before you enter the ecosystem."
      subtitle="A concise guide to what Talent Passport is, who it serves and how the connected model works."
      accent="blue"
    >
      <SectionBlock
        eyebrow="THE QUESTIONS PEOPLE ASK FIRST"
        title="Simple answers. No jargon."
        text="These answers can grow as the platform evolves; the navigation keeps the information accessible without crowding the homepage."
      >
        <FeatureGrid items={features} columns={3} />
      </SectionBlock>
    </IdentityWorldPage>
  );
}

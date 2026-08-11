import { IdentityWorldPage, FeatureGrid, SectionBlock } from "./IdentityWorldPage";

const features = [
    { icon: "🏫", title: "School", text: "Academic intelligence, teacher workflows, student growth and school analytics." },
    { icon: "🤝", title: "Partner", text: "Opportunity discovery, verified institute presence and student outreach." },
    { icon: "⭐", title: "Ecosystem", text: "Expanded intelligence and marketplace capabilities for growing institutions." },
];

export default function PlansPage() {
  return (
    <IdentityWorldPage
      eyebrow="PLANS"
      title="Choose the layer your institution needs today."
      subtitle="Flexible access for schools, learning partners and future ecosystem participants as Talent Passport grows."
      accent="orange"
    >
      <SectionBlock
        eyebrow="PLANS"
        title="Simple plans. Clear value."
        text="The plan structure can evolve as the platform expands. The public experience stays focused on outcomes rather than overwhelming visitors with pricing complexity."
      >
        <FeatureGrid items={features} columns={3} />
      </SectionBlock>
    </IdentityWorldPage>
  );
}

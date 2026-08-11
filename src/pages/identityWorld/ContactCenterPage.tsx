import { IdentityWorldPage, FeatureGrid, SectionBlock } from "./IdentityWorldPage";

const features = [
    { icon: "🏫", title: "Schools", text: "Book a conversation about school onboarding and academic intelligence." },
    { icon: "🤝", title: "Partners", text: "Talk about marketplace, workshops, scholarships and institutional partnerships." },
    { icon: "🧑‍🎓", title: "Students & Parents", text: "Ask about participation, profiles, opportunities and the student journey." },
    { icon: "👩‍🏫", title: "Educators", text: "Learn how teacher workflows and classroom intelligence fit together." },
    { icon: "🛠️", title: "Support", text: "Get help with account, portal or platform-related issues." },
    { icon: "✉️", title: "General Enquiries", text: "For questions that do not fit another category." },
];

export default function ContactCenterPage() {
  return (
    <IdentityWorldPage
      eyebrow="CONTACT CENTER"
      title="Talk to the right Talent Passport team."
      subtitle="Whether you are a school, partner, parent, educator or student, start with the reason you want to connect."
      accent="blue"
    >
      <SectionBlock
        eyebrow="CONTACT CENTER"
        title="One door. The right destination."
        text="The contact center will become the public routing layer for institutional enquiries, partnerships, support and general questions."
      >
        <FeatureGrid items={features} columns={3} />
      </SectionBlock>
    </IdentityWorldPage>
  );
}

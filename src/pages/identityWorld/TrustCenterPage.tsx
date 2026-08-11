import { IdentityWorldPage, FeatureGrid, SectionBlock } from "./IdentityWorldPage";

const features = [
    { icon: "🔐", title: "Identity & Access", text: "Portal access is separated by role so the right workspace reaches the right user." },
    { icon: "🛡️", title: "Data Protection", text: "The platform is designed with controlled data access and backend-enforced permissions." },
    { icon: "👥", title: "Role-based Experience", text: "Students, teachers, schools, partners and administrators have distinct responsibilities." },
    { icon: "📋", title: "Transparency", text: "Policies and operational commitments can be surfaced here as the ecosystem matures." },
    { icon: "🏫", title: "Institutional Trust", text: "Schools and partners can understand how the platform fits into their operating model." },
    { icon: "📨", title: "Support & Reporting", text: "A clear route for questions, concerns and trust-related communication." },
];

export default function TrustCenterPage() {
  return (
    <IdentityWorldPage
      eyebrow="TRUST CENTER"
      title="Built around verified identity, responsible access and clear ownership."
      subtitle="A transparent home for the principles behind how Talent Passport handles student growth information and ecosystem trust."
      accent="blue"
    >
      <SectionBlock
        eyebrow="TRUST CENTER"
        title="Trust is part of the product."
        text="As the platform grows, this space will become the public reference point for privacy, security, permissions, data practices and institutional responsibility."
      >
        <FeatureGrid items={features} columns={3} />
      </SectionBlock>
    </IdentityWorldPage>
  );
}

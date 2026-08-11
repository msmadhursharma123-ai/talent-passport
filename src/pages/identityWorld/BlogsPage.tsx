import { IdentityWorldPage, FeatureGrid, SectionBlock } from "./IdentityWorldPage";

const features = [
    { icon: "🏫", title: "School Transformation", text: "How schools can build continuous learning intelligence." },
    { icon: "🧠", title: "Learning Intelligence", text: "What concept-level and classroom data can change." },
    { icon: "🌱", title: "Student Growth", text: "Why development needs more than marks and certificates." },
    { icon: "🚀", title: "Future of Talent", text: "How verified identity can connect students to opportunity." },
    { icon: "🤝", title: "Partner Ecosystems", text: "Building better connections between learners and institutions." },
    { icon: "💡", title: "Founder Notes", text: "Product philosophy, lessons and the journey behind Talent Passport." },
];

export default function BlogsPage() {
  return (
    <IdentityWorldPage
      eyebrow="BLOGS"
      title="Ideas on student growth, education intelligence and the future of talent."
      subtitle="A future editorial layer for insights, product thinking, school transformation and stories from the ecosystem."
      accent="orange"
    >
      <SectionBlock
        eyebrow="BLOGS"
        title="The thinking behind the platform."
        text="The blog can evolve into a destination for education leaders, teachers, parents, students and partners who want to understand where learning and talent ecosystems are heading."
      >
        <FeatureGrid items={features} columns={3} />
      </SectionBlock>
    </IdentityWorldPage>
  );
}

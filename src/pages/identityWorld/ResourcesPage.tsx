import { IdentityWorldPage, FeatureGrid, SectionBlock } from "./IdentityWorldPage";

const features = [
    { icon: "📘", title: "School Guides", text: "Practical material for school leaders and administrators." },
    { icon: "👩‍🏫", title: "Teacher Guides", text: "Workflows and best practices for classroom intelligence." },
    { icon: "🎓", title: "Student Guides", text: "How to build, participate, grow and use a Talent Passport." },
    { icon: "👨‍👩‍👧", title: "Parent Guides", text: "Understand the student's learning and growth journey." },
    { icon: "🤝", title: "Partner Guides", text: "How academies and institutes can create meaningful opportunities." },
    { icon: "🧠", title: "Product Explainers", text: "Short explanations of the platform's major systems and terminology." },
];

export default function ResourcesPage() {
  return (
    <IdentityWorldPage
      eyebrow="RESOURCES"
      title="Useful material for schools, educators, parents and students."
      subtitle="Guides, explainers, product resources and practical material that help the ecosystem understand and use Talent Passport."
      accent="blue"
    >
      <SectionBlock
        eyebrow="RESOURCES"
        title="Learn before you launch."
        text="Resources will become the practical knowledge layer around the platform—not another stream of promotional content."
      >
        <FeatureGrid items={features} columns={3} />
      </SectionBlock>
    </IdentityWorldPage>
  );
}

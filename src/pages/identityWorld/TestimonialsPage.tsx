import TestimonialsSection from "../../components/landing/TestimonialsSection";
import { IdentityWorldPage } from "./IdentityWorldPage";

export default function TestimonialsPage() {
  return (
    <IdentityWorldPage
      eyebrow="TRUSTED JOURNEYS"
      title="Real stories. Real growth."
      subtitle="Perspectives from students, parents, teachers, school leaders and education partners."
    >
      <div className="iw-legacy-section"><TestimonialsSection /></div>
    </IdentityWorldPage>
  );
}

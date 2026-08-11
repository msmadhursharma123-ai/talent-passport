import ImageSection from "../../components/common/ImageSection";
import { IdentityWorldPage } from "./IdentityWorldPage";

export default function HPCPage() {
  return (
    <IdentityWorldPage
      eyebrow="THE HPC CREDENTIAL"
      title="A verified student identity that grows with the learner."
      subtitle="The Talent Passport brings daily learning, projects, competitions, portfolios and achievements into one lifelong academic and talent identity."
    >
      <div className="iw-legacy-section"><ImageSection /></div>
    </IdentityWorldPage>
  );
}

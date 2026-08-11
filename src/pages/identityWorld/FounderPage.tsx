import FounderSection from "../../components/landing/FounderSection";
import { IdentityWorldPage } from "./IdentityWorldPage";

export default function FounderPage() {
  return (
    <IdentityWorldPage
      eyebrow="OUR STORY"
      title="We are building the identity layer for every student."
      subtitle="Why Talent Passport exists, what it is trying to change, and the philosophy behind one connected student growth identity."
    >
      <div className="iw-legacy-section"><FounderSection /></div>
    </IdentityWorldPage>
  );
}

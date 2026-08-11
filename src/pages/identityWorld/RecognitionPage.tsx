import JourneySection from "../../components/common/JourneySection";
import { IdentityWorldPage } from "./IdentityWorldPage";

export default function RecognitionPage() {
  return (
    <IdentityWorldPage
      eyebrow="RECOGNITION"
      title="Build confidence. Compete. Grow."
      subtitle="Every meaningful experience becomes evidence of growth—from discovering a passion to being recognised for the skills you build."
    >
      <div className="iw-legacy-section"><JourneySection /></div>
    </IdentityWorldPage>
  );
}

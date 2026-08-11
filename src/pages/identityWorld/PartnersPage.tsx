import PartnerSection from "../../components/identityWorld/sections/PartnerSection";
import { IdentityWorldPage } from "./IdentityWorldPage";

export default function PartnersPage() {
  return (
    <IdentityWorldPage
      eyebrow="PARTNER ECOSYSTEM"
      title="Bring great learning opportunities to every student."
      subtitle="Connect academies, institutes and education partners with schools and students through a verified opportunity ecosystem."
    >
      <div className="iw-legacy-section"><PartnerSection /></div>
    </IdentityWorldPage>
  );
}

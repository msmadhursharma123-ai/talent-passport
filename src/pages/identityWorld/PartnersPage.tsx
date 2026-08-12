import PartnerSection from "../../components/identityWorld/sections/PartnerSection";
import { IdentityWorldPage } from "./IdentityWorldPage";

export default function PartnersPage() {
  return (
    <IdentityWorldPage
      eyebrow="PARTNER ECOSYSTEM"
      title="A Talent Marketplace that creates opportunities at your fingertips."
      subtitle="Unlock premium local academies,exclusive masterclasses and auditions in a single tap."
    >
      <div className="iw-legacy-section"><PartnerSection /></div>
    </IdentityWorldPage>
  );
}

import React,
{
  useState
}
from "react";

import PartnerLayout,
{
  PartnerTab
}
from "./PartnerLayout";

import PartnerHome
from "./PartnerHome";

import TalentDiscovery
from "./TalentDiscovery";

interface Props {
  onLogout: () => void;
}

export default function PartnerPortal({
  onLogout
}: Props) {

  const [activeTab,
    setActiveTab] =
    useState<PartnerTab>(
      "dashboard"
    );

  const renderPage =
    () => {

      switch (
        activeTab
      ) {

        case "dashboard":
          return (
            <PartnerHome />
          );

        case "talent-discovery":

  return (
    <TalentDiscovery />
  );

        case
        "consultations":

          return (
            <div>
              Consultations
              (Coming Next)
            </div>
          );

        default:
          return (
            <PartnerHome />
          );
      }
    };

  return (
    <PartnerLayout
      activeTab={
        activeTab
      }
      setActiveTab={
        setActiveTab
      }
      onLogout={
        onLogout
      }
    >
      {renderPage()}
    </PartnerLayout>
  );
}
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

interface Props {
  onLogout: () => void;
}

export default function PartnerPortal({
  onLogout
}: Props) {

  const [activeTab,
    setActiveTab] =
    useState<PartnerTab>(
      "home"
    );

  const renderPage =
    () => {

      switch (
        activeTab
      ) {

        case "home":
          return (
            <PartnerHome />
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
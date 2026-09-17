import React,
{
  useEffect,
  useRef,
  useState
}
from "react";

import { registerAndroidBackHandler } from "../../mobile/androidBackNavigation";

import PartnerLayout,
{
  PartnerTab
}
from "./PartnerLayout";

import PartnerHome
from "./PartnerHome";

import TalentDiscovery
from "./TalentDiscovery";

import IncomingRequests
from "./IncomingRequests";

import LeadPipeline
from "./LeadPipeline";

interface Props {

  onLogout: () => void;
}

export default function PartnerPortal({

  onLogout

}: Props) {

  const [

    activeTab,

    rawSetActiveTab

  ] =
    useState<PartnerTab>(
      "dashboard"
    );

  const activeTabRef = useRef<PartnerTab>(activeTab);
  const historyRef = useRef<PartnerTab[]>([]);
  const pendingRef = useRef(false);
  const restoringRef = useRef(false);

  const setActiveTab = (next: PartnerTab) => {
    const current = activeTabRef.current;

    if (next === current) return;

    if (!restoringRef.current && !pendingRef.current) {
      historyRef.current.push(current);
      pendingRef.current = true;
      queueMicrotask(() => {
        pendingRef.current = false;
      });
    }

    activeTabRef.current = next;
    rawSetActiveTab(next);
  };

  useEffect(() =>
    registerAndroidBackHandler(() => {
      const previous = historyRef.current.pop();

      if (previous === undefined) return false;

      restoringRef.current = true;
      activeTabRef.current = previous;
      rawSetActiveTab(previous);
      restoringRef.current = false;

      return true;
    }, 10),
  []);

  const renderPage =
    () => {

      switch (
        activeTab
      ) {

        case "dashboard":

          return (
            <PartnerHome />
          );

        case
        "talent-discovery":

          return (
            <TalentDiscovery />
          );

        case
        "incoming-requests":

          return (
            <IncomingRequests />
          );

        case
        "lead-pipeline":

          return (
            <LeadPipeline />
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
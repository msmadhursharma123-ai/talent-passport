import { useEffect, useRef, useState } from "react";
import { loadPartnerDashboardAnalytics } from "../services/PartnerDashboardAnalyticsService";
import type { PartnerDashboardAnalytics } from "../types/PartnerDashboardAnalyticsModels";

export function usePartnerDashboardAnalytics() {
  const [analytics, setAnalytics] = useState<PartnerDashboardAnalytics | null>(null);
  const [error, setError] = useState<unknown>(null);
  const requestRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const requestId = ++requestRef.current;

    loadPartnerDashboardAnalytics()
      .then((data) => {
        if (cancelled || requestId !== requestRef.current) return;
        setAnalytics(data);
        setError(null);
      })
      .catch((loadError) => {
        if (cancelled || requestId !== requestRef.current) return;
        setAnalytics(null);
        setError(loadError);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { analytics, error };
}

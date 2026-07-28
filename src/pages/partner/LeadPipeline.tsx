import React,
{
  useEffect,
  useMemo,
  useState
}
from "react";

import {
  fetchPartnerLeads,
  updateLeadStatus,
  updateLeadNotes,
  fetchLeadMetrics
}
from "../../data/partnerMarketplaceRepository";

import {
  requirePartnerIdentity
}
from "../../services/identityService";

import LeadCRMDrawer from "./LeadCRMDrawer";

const STATUS_OPTIONS = [

  "new_lead",

  "contacted",

  "follow_up",

  "counselling_scheduled",

  "counselling_done",

  "interested",

  "admission_completed",

  "parent_declined",

  "not_reachable",

  "rejected",

  "closed"

];



export default function LeadPipeline() {

  /*
  =======================================================
  Resolve Partner Identity
  =======================================================
  */

  const partnerIdentity =
    requirePartnerIdentity();

  const rawPartnerId =
    partnerIdentity.partnerId;

  if (!rawPartnerId) {

    throw new Error(
      "Partner identity is missing."
    );

  }

  const partnerId: string =
    rawPartnerId;

  const partnerName =
    partnerIdentity.partnerName ?? "";

  const [
    leads,
    setLeads
  ] =
    useState<any[]>([]);

  const [
    metrics,
    setMetrics
  ] =
    useState<any>({
      total: 0,
      incoming: 0,
      outgoing: 0,
      admissions: 0,
      rejected: 0
    });

  const [
    loading,
    setLoading
  ] =
    useState(false);

  const [
    search,
    setSearch
  ] =
    useState("");

  const [
    statusFilter,
    setStatusFilter
  ] =
    useState("all");

  const [
    sourceFilter,
    setSourceFilter
  ] =
    useState("all");

  const [
    selectedLead,
    setSelectedLead
  ] =
    useState<any>(null);

const [
  drawerOpen,
  setDrawerOpen
] = useState(false);

  const [
    notes,
    setNotes
  ] =
    useState("");

  useEffect(() => {

    loadData();

  }, []);

  async function
  loadData() {

    try {

      setLoading(true);

  

    const leadData =
  await fetchPartnerLeads(
    partnerId
  );

console.log(
  "LEADS RETURNED",
  leadData
);



      const metricData =
        await fetchLeadMetrics(
          partnerId
        );

      setLeads(
        leadData || []
      );

      setMetrics(
        metricData
      );

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }
  }

  async function
handleStatusChange(
  leadId:string,
  status:string
) {

  setLeads(prev =>

    prev.map(lead =>

      lead.id === leadId

        ? {
            ...lead,
            status
          }

        : lead
    )
  );

  await updateLeadStatus(
    leadId,
    status
  );

  loadData();
}

  async function
  saveNotes() {

    if (!selectedLead)
      return;

    await updateLeadNotes(
      selectedLead.id,
      notes
    );

    await loadData();

    alert(
      "Notes Updated"
    );
  }

const today =
  new Date()
    .toISOString()
    .split("T")[0];

const dueTodayCount =
  leads.filter(
    (lead:any) =>
      lead.next_followup_date ===
      today
  ).length;

const overdueCount =
  leads.filter(
    (lead:any) =>
      lead.next_followup_date &&
      lead.next_followup_date <
      today
  ).length;

const interestedCount =
  leads.filter(
    (lead:any) =>
      lead.status ===
      "interested"
  ).length;

const counsellingCount =
  leads.filter(
    (lead:any) =>
      lead.status ===
      "counselling_scheduled"
  ).length;

  const filteredLeads =
    useMemo(() => {

      return leads.filter(
        (lead: any) => {

          const searchMatch =

            lead.student_name
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              )

            ||

            lead.school_name
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              )

            ||

            lead.phone
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const statusMatch =

            statusFilter === "all"

            ||

            lead.status ===
            statusFilter;

          const sourceMatch =

            sourceFilter === "all"

            ||

            lead.lead_source ===
            sourceFilter;

          return (
            searchMatch
            &&
            statusMatch
            &&
            sourceMatch
          );
        }
      );

    }, [

      leads,

      search,

      statusFilter,

      sourceFilter

    ]);

  function
  getStatusColor(
    status: string
  ) {

    switch (status) {

      case
      "admission_completed":
        return "#DCFCE7";

      case
      "rejected":
        return "#FEE2E2";

      case
      "parent_declined":
        return "#FEE2E2";

      case
      "interested":
        return "#DBEAFE";

      default:
        return "#FEF3C7";
    }
  }

   return (

    <div
      className="lead-pipeline-page"
      style={{
        width: "95%",
        maxWidth: "1600px",
        margin: "0 auto",
        padding: "24px",
        boxSizing: "border-box"
      }}
    >

      <style>{`
        .lp-swipe-hint { display: none; }

        @media (max-width: 1024px) {
          .lead-pipeline-page {
            width: 100% !important;
            max-width: none !important;
            padding: 6px !important;
          }

          .lp-hero {
            min-height: 0 !important;
            padding: 16px 18px !important;
            margin-bottom: 10px !important;
            border-radius: 18px !important;
            gap: 14px !important;
          }
          .lp-hero-copy { min-width: 0 !important; max-width: none !important; flex: 1 1 auto !important; }
          .lp-hero-copy > div:first-child { font-size: 8px !important; letter-spacing: 1.2px !important; margin-bottom: 6px !important; }
          .lp-hero-title { font-size: 25px !important; line-height: 1.08 !important; letter-spacing: -.45px !important; }
          .lp-hero-copy > p { margin-top: 6px !important; font-size: 11px !important; line-height: 1.4 !important; }
          .lp-hero-copy > div:last-child { margin-top: 9px !important; gap: 6px !important; }
          .lp-hero-copy > div:last-child > div { padding: 5px 8px !important; font-size: 8px !important; }
          .lp-hero-badge { width: 64px !important; height: 64px !important; min-width: 64px !important; border-radius: 16px !important; }
          .lp-hero-badge > div > div:first-child { font-size: 21px !important; }
          .lp-hero-badge > div > div:last-child { margin-top: 4px !important; font-size: 6px !important; letter-spacing: .55px !important; }

          .lp-summary, .lp-filter-desk, .lp-ledger { border-radius: 17px !important; margin-bottom: 10px !important; }
          .lp-summary { padding: 15px !important; }
          .lp-summary > div:first-child { gap: 10px !important; margin-bottom: 12px !important; align-items: flex-start !important; }
          .lp-summary > div:first-child > div:first-child > div:first-child { font-size: 8px !important; letter-spacing: 1.1px !important; margin-bottom: 4px !important; }
          .lp-summary h2, .lp-ledger h2 { font-size: 18px !important; line-height: 1.12 !important; }
          .lp-summary p, .lp-ledger p { font-size: 10px !important; line-height: 1.35 !important; }
          .lp-summary > div:first-child > div:last-child { font-size: 8px !important; }

          .lp-primary-grid, .lp-action-grid { gap: 7px !important; margin-bottom: 7px !important; }
          .lp-stat-card { min-height: 82px !important; padding: 10px !important; border-radius: 12px !important; }
          .lp-stat-card > div:last-child > div:first-child { font-size: 7px !important; line-height: 1.1 !important; }
          .lp-stat-card > div:last-child > div:nth-child(2) { font-size: 20px !important; margin-top: 5px !important; }
          .lp-stat-card > div:last-child > div:last-child { font-size: 8px !important; margin-top: 4px !important; line-height: 1.2 !important; }

          .lp-filter-desk { padding: 12px !important; }
          .lp-filter-desk > div:first-child { font-size: 8px !important; margin-bottom: 7px !important; }
          .lp-filter-grid { grid-template-columns: minmax(0,1.6fr) minmax(0,.7fr) minmax(0,.7fr) !important; gap: 6px !important; }
          .lp-filter-grid input, .lp-filter-grid select { min-width: 0 !important; height: 32px !important; padding: 0 8px !important; border-radius: 8px !important; font-size: 9px !important; }

          .lp-ledger-header { padding: 15px !important; }
          .lp-ledger-header > div:last-child { align-items: flex-start !important; gap: 10px !important; }
          .lp-ledger-header > div:last-child > div:last-child { padding: 5px 8px !important; font-size: 8px !important; }

          .lp-swipe-hint {
            display: block;
            margin: 8px 10px 6px;
            padding: 6px 9px;
            border: 1px solid #FED7AA;
            border-radius: 9px;
            background: #FFF7ED;
            color: #9A3412;
            font-size: 8px;
            font-weight: 800;
          }
          .lp-table-scroll {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: thin;
          }
          .lp-table { min-width: 900px !important; }
          .lp-table th { padding: 8px 10px !important; font-size: 8px !important; }
          .lp-table td { padding: 9px 10px !important; font-size: 10px !important; }
          .lp-table button { padding: 5px 8px !important; border-radius: 7px !important; font-size: 8px !important; }
          .lp-table select { min-width: 120px !important; padding: 5px 7px !important; border-radius: 7px !important; font-size: 8px !important; }
          .lp-table span { padding: 4px 6px !important; font-size: 8px !important; }
          .lp-table td:first-child > div > div:last-child > div:first-child {
            font-size: 10px !important;
            line-height: 1.25 !important;
          }
          .lp-table td:first-child > div > div:last-child > div:last-child {
            font-size: 8px !important;
            line-height: 1.25 !important;
          }

          .lp-sticky-col {
            position: sticky !important;
            left: 0 !important;
            z-index: 4 !important;
            min-width: 120px !important;
            box-shadow: 6px 0 10px -10px rgba(15,23,42,.55);
          }
          .lp-sticky-head { z-index: 6 !important; background: #F8FAFC !important; }
          .lp-sticky-cell { background: #FFFFFF !important; }
        }

        @media (max-width: 600px) {
          .lead-pipeline-page { padding: 4px !important; }

          .lp-hero { padding: 12px 13px !important; margin-bottom: 8px !important; border-radius: 14px !important; gap: 8px !important; }
          .lp-hero-copy > div:first-child { font-size: 6px !important; letter-spacing: .8px !important; margin-bottom: 4px !important; }
          .lp-hero-title { font-size: 18px !important; letter-spacing: -.25px !important; }
          .lp-hero-copy > p { margin-top: 4px !important; font-size: 8px !important; line-height: 1.3 !important; }
          .lp-hero-copy > div:last-child { margin-top: 6px !important; gap: 4px !important; }
          .lp-hero-copy > div:last-child > div { padding: 4px 6px !important; font-size: 6px !important; }
          .lp-hero-badge { width: 48px !important; height: 48px !important; min-width: 48px !important; border-radius: 11px !important; }
          .lp-hero-badge > div > div:first-child { font-size: 15px !important; }
          .lp-hero-badge > div > div:last-child { font-size: 4px !important; letter-spacing: .25px !important; }

          .lp-summary, .lp-filter-desk, .lp-ledger { border-radius: 14px !important; margin-bottom: 8px !important; }
          .lp-summary { padding: 10px !important; }
          .lp-summary h2, .lp-ledger h2 { font-size: 14px !important; }
          .lp-summary p, .lp-ledger p { font-size: 7.5px !important; }
          .lp-summary > div:first-child > div:first-child > div:first-child { font-size: 6px !important; letter-spacing: .8px !important; }
          .lp-summary > div:first-child > div:last-child { font-size: 6px !important; }

          .lp-primary-grid { grid-template-columns: repeat(5,minmax(0,1fr)) !important; gap: 3px !important; margin-bottom: 4px !important; }
          .lp-action-grid { grid-template-columns: repeat(4,minmax(0,1fr)) !important; gap: 3px !important; }
          .lp-stat-card { min-height: 66px !important; padding: 6px !important; border-radius: 8px !important; }
          .lp-stat-card > div:last-child > div:first-child { font-size: 5px !important; letter-spacing: .2px !important; }
          .lp-stat-card > div:last-child > div:nth-child(2) { font-size: 15px !important; margin-top: 4px !important; }
          .lp-stat-card > div:last-child > div:last-child { font-size: 5.5px !important; margin-top: 3px !important; }

          .lp-filter-desk { padding: 9px !important; }
          .lp-filter-desk > div:first-child { font-size: 6px !important; margin-bottom: 5px !important; }
          .lp-filter-grid { grid-template-columns: minmax(0,1.6fr) minmax(0,.7fr) minmax(0,.7fr) !important; gap: 3px !important; }
          .lp-filter-grid input, .lp-filter-grid select { height: 27px !important; padding: 0 4px !important; border-radius: 6px !important; font-size: 6.5px !important; }

          .lp-ledger-header { padding: 10px !important; }
          .lp-ledger-header > div:last-child > div:last-child { padding: 4px 6px !important; font-size: 6px !important; }
          .lp-swipe-hint { margin: 6px 7px 5px; padding: 5px 7px; font-size: 7px; border-radius: 7px; }
          .lp-table { min-width: 760px !important; }
          .lp-table th { padding: 6px 8px !important; font-size: 6.5px !important; }
          .lp-table td { padding: 7px 8px !important; font-size: 8px !important; }
          .lp-table button { padding: 4px 6px !important; font-size: 6.5px !important; }
          .lp-table select { min-width: 100px !important; padding: 4px 5px !important; font-size: 6.5px !important; }
          .lp-table span { padding: 3px 5px !important; font-size: 6.5px !important; }
          .lp-table td:first-child > div > div:last-child > div:first-child {
            font-size: 8px !important;
            line-height: 1.25 !important;
          }
          .lp-table td:first-child > div > div:last-child > div:last-child {
            font-size: 6.5px !important;
            line-height: 1.25 !important;
          }
          .lp-sticky-col { min-width: 100px !important; }
        }
      `}</style>


      {/* =========================================================
          HERO
         ========================================================= */}

      <div
        className="lp-hero"
        style={{
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg,#FFFFFF 0%,#FFFCF8 55%,#F7FAFF 100%)",
          borderRadius: "28px",
          border: "1px solid #DCE4EE",
          boxShadow:
            "0 12px 34px rgba(15,23,42,.06)",
          padding: "34px 38px",
          marginBottom: "20px",
          minHeight: "165px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "30px"
        }}
      >

        <div
          style={{
            position: "absolute",
            width: "330px",
            height: "330px",
            borderRadius: "50%",
            right: "-105px",
            top: "-175px",
            background: "rgba(249,115,22,.065)",
            pointerEvents: "none"
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "240px",
            height: "240px",
            borderRadius: "50%",
            right: "150px",
            bottom: "-180px",
            background: "rgba(59,130,246,.055)",
            pointerEvents: "none"
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "115px",
            height: "115px",
            borderRadius: "50%",
            right: "92px",
            top: "22px",
            background: "rgba(255,237,213,.55)",
            pointerEvents: "none"
          }}
        />


        <div
          className="lp-hero-copy"
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "850px"
          }}
        >

          <div
            style={{
              color: "#F97316",
              fontSize: "12px",
              letterSpacing: "2.4px",
              fontWeight: 800,
              textTransform: "uppercase",
              marginBottom: "12px"
            }}
          >
            PARTNER CRM
          </div>

          <h1 className="lp-hero-title"
            style={{
              margin: 0,
              color: "#0F172A",
              fontSize: "40px",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-1px"
            }}
          >
            Lead Pipeline
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              color: "#64748B",
              fontSize: "18px",
              lineHeight: 1.65,
              maxWidth: "760px"
            }}
          >
            Manage enquiries, admissions and follow-ups.
          </p>

          <div
            style={{
              display: "flex",
              gap: "9px",
              flexWrap: "wrap",
              marginTop: "17px"
            }}
          >

            <div
              style={{
                padding: "7px 11px",
                borderRadius: "999px",
                background: "#FFF7ED",
                border: "1px solid #FED7AA",
                color: "#C2410C",
                fontSize: "13px",
                fontWeight: 800
              }}
            >
              {metrics.total} TOTAL LEADS
            </div>

            <div
              style={{
                padding: "7px 11px",
                borderRadius: "999px",
                background: "#EFF6FF",
                border: "1px solid #BFDBFE",
                color: "#1D4ED8",
                fontSize: "13px",
                fontWeight: 800
              }}
            >
              CRM PIPELINE
            </div>

          </div>

        </div>


        <div
          className="lp-hero-badge"
          style={{
            position: "relative",
            zIndex: 2,
            width: "128px",
            height: "128px",
            borderRadius: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(145deg,#FFF7ED,#FFFFFF)",
            border: "1px solid #FED7AA",
            boxShadow:
              "0 12px 30px rgba(249,115,22,.10)",
            flexShrink: 0
          }}
        >

          <div
            style={{
              textAlign: "center"
            }}
          >

            <div
              style={{
                fontSize: "38px",
                lineHeight: 1
              }}
            >
              ◇
            </div>

            <div
              style={{
                marginTop: "9px",
                color: "#F97316",
                fontSize: "12px",
                fontWeight: 900,
                letterSpacing: "1.4px"
              }}
            >
              LEAD CRM
            </div>

          </div>

        </div>

      </div>


      {/* =========================================================
          PIPELINE INTELLIGENCE
         ========================================================= */}

      <div
        className="lp-summary"
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "24px",
          padding: "24px",
          marginBottom: "20px",
          boxShadow:
            "0 8px 24px rgba(15,23,42,.035)"
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "20px",
            marginBottom: "20px"
          }}
        >

          <div>

            <div
              style={{
                color: "#F97316",
                fontSize: "13px",
                fontWeight: 800,
                letterSpacing: "1.8px",
                textTransform: "uppercase",
                marginBottom: "7px"
              }}
            >
              CRM INTELLIGENCE
            </div>

            <h2
              style={{
                margin: 0,
                color: "#0F172A",
                fontSize: "24px",
                fontWeight: 800
              }}
            >
              Lead Pipeline Summary
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#64748B",
                fontSize: "16px"
              }}
            >
              Track lead activity, admissions and
              follow-up priorities across your pipeline.
            </p>

          </div>

          <div
            style={{
              color: "#94A3B8",
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: ".8px",
              whiteSpace: "nowrap"
            }}
          >
            PARTNER CRM LEDGER
          </div>

        </div>


        {/* PRIMARY METRICS */}

        <div
          className="lp-primary-grid"
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(5,minmax(0,1fr))",
            gap: "12px",
            marginBottom: "12px"
          }}
        >

          <StatCard
            title="Total Leads"
            value={metrics.total}
            tone="orange"
            description="All CRM opportunities"
          />

          <StatCard
            title="Incoming"
            value={metrics.incoming}
            tone="blue"
            description="Student initiated leads"
          />

          <StatCard
            title="Outgoing"
            value={metrics.outgoing}
            tone="purple"
            description="Partner initiated leads"
          />

          <StatCard
            title="Admissions"
            value={metrics.admissions}
            tone="green"
            description="Completed admissions"
          />

          <StatCard
            title="Rejected"
            value={metrics.rejected}
            tone="red"
            description="Leads not progressed"
          />

        </div>


        {/* ACTION METRICS */}

        <div
          className="lp-action-grid"
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4,minmax(0,1fr))",
            gap: "12px"
          }}
        >

          <StatCard
            title="Due Today"
            value={dueTodayCount}
            tone="yellow"
            description="Follow-ups scheduled today"
          />

          <StatCard
            title="Overdue"
            value={overdueCount}
            tone="red"
            description="Follow-ups needing attention"
          />

          <StatCard
            title="Interested"
            value={interestedCount}
            tone="green"
            description="Leads showing interest"
          />

          <StatCard
            title="Counselling"
            value={counsellingCount}
            tone="blue"
            description="Counselling scheduled"
          />

        </div>

      </div>


      {/* =========================================================
          FILTER DESK
         ========================================================= */}

      <div
        className="lp-filter-desk"
        style={{
          background:
            "linear-gradient(135deg,#FFFFFF,#FFFCF8)",
          padding: "18px",
          borderRadius: "20px",
          marginBottom: "20px",
          border: "1px solid #E2E8F0",
          boxShadow:
            "0 6px 18px rgba(15,23,42,.025)"
        }}
      >

        <div
          style={{
            color: "#F97316",
            fontSize: "12px",
            fontWeight: 850,
            letterSpacing: "1.4px",
            marginBottom: "11px"
          }}
        >
          PIPELINE FILTERS
        </div>

        <div
          className="lp-filter-grid"
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(300px,1.6fr) minmax(180px,.7fr) minmax(180px,.7fr)",
            gap: "10px"
          }}
        >

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search Student / School / Phone"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid #CBD5E1",
              background: "#FFFFFF",
              color: "#0F172A",
              fontSize: "15px",
              outline: "none"
            }}
          />


          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid #CBD5E1",
              background: "#FFFFFF",
              color: "#334155",
              fontSize: "15px",
              fontWeight: 600,
              outline: "none"
            }}
          >

            <option value="all">
              All Statuses
            </option>

            {STATUS_OPTIONS.map(
              status => (

                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>

              )
            )}

          </select>


          <select
            value={sourceFilter}
            onChange={(e) =>
              setSourceFilter(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid #CBD5E1",
              background: "#FFFFFF",
              color: "#334155",
              fontSize: "15px",
              fontWeight: 600,
              outline: "none"
            }}
          >

            <option value="all">
              All Sources
            </option>

            <option value="incoming">
              Incoming
            </option>

            <option value="outgoing">
              Outgoing
            </option>

            <option value="admin_assigned">
              Admin Assigned
            </option>

          </select>

        </div>

      </div>


      {/* =========================================================
          LEAD LEDGER
         ========================================================= */}

      <div
        className="lp-ledger"
        style={{
          background: "#FFFFFF",
          borderRadius: "24px",
          overflow: "hidden",
          border: "1px solid #E2E8F0",
          boxShadow:
            "0 8px 24px rgba(15,23,42,.035)"
        }}
      >

        {/* LEDGER HEADER */}

        <div
          className="lp-ledger-header"
          style={{
            position: "relative",
            overflow: "hidden",
            padding: "24px",
            borderBottom: "1px solid #E2E8F0",
            background:
              "linear-gradient(135deg,#FFFFFF 0%,#FFFCF8 100%)"
          }}
        >

          <div
            style={{
              position: "absolute",
              width: "165px",
              height: "165px",
              borderRadius: "50%",
              right: "-55px",
              top: "-100px",
              background: "rgba(249,115,22,.055)",
              pointerEvents: "none"
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "20px"
            }}
          >

            <div>

              <div
                style={{
                  color: "#F97316",
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "1.5px",
                  marginBottom: "6px"
                }}
              >
                CRM OPPORTUNITY PIPELINE
              </div>

              <h2
                style={{
                  margin: 0,
                  color: "#0F172A",
                  fontSize: "23px",
                  fontWeight: 800
                }}
              >
                Lead Ledger
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748B",
                  fontSize: "15px"
                }}
              >
                Manage every lead from initial interest
                through follow-up and admission.
              </p>

            </div>


            <div
              style={{
                padding: "7px 11px",
                borderRadius: "999px",
                background: "#FFF7ED",
                border: "1px solid #FED7AA",
                color: "#C2410C",
                fontSize: "13px",
                fontWeight: 800,
                whiteSpace: "nowrap"
              }}
            >
              {filteredLeads.length} LEADS
            </div>

          </div>

        </div>


        <div className="lp-swipe-hint">
          Swipe left or right to view lead details →
        </div>

        <div
          className="lp-table-scroll"
          style={{
            overflowX: "auto"
          }}
        >

          <table
            className="lp-table"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "1250px"
            }}
          >

            <thead>

              <tr
                style={{
                  background: "#F8FAFC"
                }}
              >

                {[
                  "Student",
                  "School",
                  "Phone",
                  "Email",
                  "Source",
                  "Status",
                  "Follow Up",
                  "Actions"
                ].map(label => (

                  <th
                    key={label}
                    className={label === "Student" ? "lp-sticky-col lp-sticky-head" : undefined}
                    style={{
                      padding: "13px 16px",
                      textAlign:
                        [
                          "Source",
                          "Status",
                          "Follow Up",
                          "Actions"
                        ].includes(label)
                          ? "center"
                          : "left",
                      color: "#64748B",
                      fontSize: "12px",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      fontWeight: 800,
                      borderBottom:
                        "1px solid #E2E8F0"
                    }}
                  >
                    {label}
                  </th>

                ))}

              </tr>

            </thead>


            <tbody>

              {filteredLeads.map(
                (
                  lead: any,
                  index: number
                ) => {

                  const isOverdue =
                    lead.next_followup_date &&
                    lead.next_followup_date <
                    today;

                  const isDueToday =
                    lead.next_followup_date ===
                    today;

                  return (

                    <tr
                      key={lead.id}
                      style={{
                        background:
                          isOverdue
                            ? "#FFF9F9"
                            : isDueToday
                            ? "#FFFDF5"
                            : index % 2 === 0
                            ? "#FFFFFF"
                            : "#FCFDFE",
                        borderBottom:
                          "1px solid #F1F5F9"
                      }}
                    >

                      {/* STUDENT */}

                      <td
                        className="lp-sticky-col lp-sticky-cell"
                        style={{
                          padding: "15px 16px"
                        }}
                      >

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px"
                          }}
                        >

                          <div
                            style={{
                              width: "35px",
                              height: "35px",
                              borderRadius: "11px",
                              background: "#FFF7ED",
                              border:
                                "1px solid #FED7AA",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#F97316",
                              fontSize: "15px",
                              fontWeight: 900,
                              flexShrink: 0
                            }}
                          >
                            {lead.student_name
                              ?.charAt(0)
                              .toUpperCase() ||
                              "S"}
                          </div>

                          <div>

                            <div
                              style={{
                                fontWeight: 750,
                                color: "#0F172A",
                                fontSize: "15px"
                              }}
                            >
                              {lead.student_name}
                            </div>

                            <div
                              style={{
                                fontSize: "12px",
                                color: "#94A3B8",
                                marginTop: "3px"
                              }}
                            >
                              {lead.request_type ||
                                "Lead"}
                            </div>

                          </div>

                        </div>

                      </td>


                      {/* SCHOOL */}

                      <td
                        style={{
                          padding: "15px 16px",
                          color: "#475569",
                          fontSize: "14px",
                          fontWeight: 600
                        }}
                      >
                        {lead.school_name || "-"}
                      </td>


                      {/* PHONE */}

                      <td
                        style={{
                          padding: "15px 16px",
                          color: "#475569",
                          fontSize: "14px"
                        }}
                      >
                        {lead.phone || "-"}
                      </td>


                      {/* EMAIL */}

                      <td
                        style={{
                          padding: "15px 16px",
                          color: "#475569",
                          fontSize: "13px"
                        }}
                      >
                        {lead.email || "-"}
                      </td>


                      {/* SOURCE */}

                      <td
                        style={{
                          padding: "15px 16px",
                          textAlign: "center"
                        }}
                      >

                        {lead.lead_source ===
                          "incoming" && (

                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "6px 9px",
                              borderRadius: "999px",
                              background: "#EFF6FF",
                              border:
                                "1px solid #BFDBFE",
                              color: "#1D4ED8",
                              fontSize: "12px",
                              fontWeight: 750
                            }}
                          >
                            ↓ Incoming
                          </span>

                        )}


                        {lead.lead_source ===
                          "outgoing" && (

                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "6px 9px",
                              borderRadius: "999px",
                              background: "#ECFDF5",
                              border:
                                "1px solid #BBF7D0",
                              color: "#15803D",
                              fontSize: "12px",
                              fontWeight: 750
                            }}
                          >
                            ↑ Outgoing
                          </span>

                        )}


                        {lead.lead_source ===
                          "admin_assigned" && (

                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "6px 9px",
                              borderRadius: "999px",
                              background: "#FEFCE8",
                              border:
                                "1px solid #FDE68A",
                              color: "#A16207",
                              fontSize: "12px",
                              fontWeight: 750
                            }}
                          >
                            ★ Assigned
                          </span>

                        )}

                      </td>


                      {/* STATUS */}

                      <td
                        style={{
                          padding: "15px 16px",
                          textAlign: "center"
                        }}
                      >

                        <select
                          value={lead.status}
                          onChange={(e) =>
                            handleStatusChange(
                              lead.id,
                              e.target.value
                            )
                          }
                          style={{
                            padding: "8px 10px",
                            borderRadius: "9px",
                            border:
                              "1px solid #CBD5E1",
                            minWidth: "165px",
                            fontSize: "13px",
                            fontWeight: 650,
                            color: "#334155",
                            background: "#FFFFFF",
                            outline: "none"
                          }}
                        >

                          {STATUS_OPTIONS.map(
                            status => (

                              <option
                                key={status}
                                value={status}
                              >
                                {status}
                              </option>

                            )
                          )}

                        </select>

                      </td>


                      {/* FOLLOW-UP */}

                      <td
                        style={{
                          padding: "15px 16px",
                          textAlign: "center"
                        }}
                      >

                        {lead.next_followup_date ? (

                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "6px 9px",
                              borderRadius: "999px",

                              background:
                                isOverdue
                                  ? "#FEF2F2"
                                  : isDueToday
                                  ? "#FEFCE8"
                                  : "#EFF6FF",

                              border:
                                isOverdue
                                  ? "1px solid #FECACA"
                                  : isDueToday
                                  ? "1px solid #FDE68A"
                                  : "1px solid #BFDBFE",

                              color:
                                isOverdue
                                  ? "#B91C1C"
                                  : isDueToday
                                  ? "#A16207"
                                  : "#1D4ED8",

                              fontSize: "12px",
                              fontWeight: 750
                            }}
                          >
                            {lead.next_followup_date}
                          </span>

                        ) : (

                          <span
                            style={{
                              color: "#94A3B8",
                              fontSize: "13px",
                              fontWeight: 600
                            }}
                          >
                            Not Set
                          </span>

                        )}

                      </td>


                      {/* ACTION */}

                      <td
                        style={{
                          padding: "15px 16px",
                          textAlign: "center"
                        }}
                      >

                        <button
                          onClick={() => {

                            setSelectedLead(
                              lead
                            );

                            setDrawerOpen(
                              true
                            );

                          }}
                          style={{
                            background:
                              "linear-gradient(135deg,#F97316,#FB923C)",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: "9px",
                            padding: "8px 14px",
                            fontWeight: 750,
                            fontSize: "13px",
                            cursor: "pointer",
                            boxShadow:
                              "0 5px 12px rgba(249,115,22,.16)"
                          }}
                        >
                          View
                        </button>

                      </td>

                    </tr>

                  );

                }
              )}

            </tbody>

          </table>

        </div>


        {/* EMPTY STATE */}

        {filteredLeads.length === 0 && (

          <div
            style={{
              padding: "55px 25px",
              textAlign: "center",
              background:
                "linear-gradient(180deg,#FFFFFF,#FAFCFF)"
            }}
          >

            <div
              style={{
                width: "54px",
                height: "54px",
                borderRadius: "17px",
                margin: "0 auto 14px",
                background: "#FFF7ED",
                border: "1px solid #FED7AA",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#F97316",
                fontSize: "26px",
                fontWeight: 800
              }}
            >
              ◇
            </div>

            <div
              style={{
                color: "#0F172A",
                fontSize: "18px",
                fontWeight: 800
              }}
            >
              No leads found
            </div>

            <div
              style={{
                color: "#64748B",
                fontSize: "14px",
                marginTop: "5px"
              }}
            >
              No leads match the current search
              and filter combination.
            </div>

          </div>

        )}

      </div>


      {/* =========================================================
          EXISTING CRM DRAWER — FUNCTIONALITY UNCHANGED
         ========================================================= */}

      <LeadCRMDrawer
        lead={selectedLead}
        open={drawerOpen}
        onClose={() => {

          setDrawerOpen(
            false
          );

          setSelectedLead(
            null
          );

        }}
        onRefresh={() => {

          loadData();

        }}
      />

    </div>

  );
}

function StatCard({
  title,
  value,
  tone = "blue",
  description
}: {
  title: string;
  value: any;
  tone?: "orange" | "blue" | "green" | "red" | "purple" | "yellow";
  description?: string;
}) {

  const palettes = {

    orange: {
      background:
        "linear-gradient(135deg,#FFF7ED,#FFFBF5)",
      border: "#FED7AA",
      label: "#9A3412",
      value: "#F97316",
      circle: "rgba(249,115,22,.08)"
    },

    blue: {
      background:
        "linear-gradient(135deg,#EFF6FF,#F8FBFF)",
      border: "#BFDBFE",
      label: "#1E40AF",
      value: "#2563EB",
      circle: "rgba(37,99,235,.07)"
    },

    green: {
      background:
        "linear-gradient(135deg,#ECFDF5,#F7FFFB)",
      border: "#BBF7D0",
      label: "#166534",
      value: "#16A34A",
      circle: "rgba(22,163,74,.07)"
    },

    red: {
      background:
        "linear-gradient(135deg,#FEF2F2,#FFF9F9)",
      border: "#FECACA",
      label: "#991B1B",
      value: "#DC2626",
      circle: "rgba(220,38,38,.06)"
    },

    purple: {
      background:
        "linear-gradient(135deg,#F5F3FF,#FBFAFF)",
      border: "#DDD6FE",
      label: "#6D28D9",
      value: "#7C3AED",
      circle: "rgba(124,58,237,.07)"
    },

    yellow: {
      background:
        "linear-gradient(135deg,#FEFCE8,#FFFDF4)",
      border: "#FDE68A",
      label: "#854D0E",
      value: "#CA8A04",
      circle: "rgba(202,138,4,.07)"
    }

  };

  const palette =
    palettes[tone];

  return (

    <div
      className="lp-stat-card"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "105px",
        padding: "17px",
        borderRadius: "18px",
        background: palette.background,
        border: `1px solid ${palette.border}`
      }}
    >

      <div
        style={{
          position: "absolute",
          width: "82px",
          height: "82px",
          borderRadius: "50%",
          right: "-25px",
          top: "-32px",
          background: palette.circle,
          pointerEvents: "none"
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1
        }}
      >

        <div
          style={{
            color: palette.label,
            fontSize: "11px",
            fontWeight: 850,
            letterSpacing: ".7px",
            textTransform: "uppercase"
          }}
        >
          {title}
        </div>

        <div
          style={{
            color: palette.value,
            fontSize: "31px",
            fontWeight: 900,
            lineHeight: 1,
            marginTop: "9px"
          }}
        >
          {value}
        </div>

        {description && (

          <div
            style={{
              color: "#475569",
              fontSize: "12px",
              fontWeight: 600,
              marginTop: "7px"
            }}
          >
            {description}
          </div>

        )}

      </div>

    </div>

  );
}


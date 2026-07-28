import React,
{
  useEffect,
  useState
}
from "react";

import {
  fetchIncomingRequests,
  createLead
}
from "../../data/partnerMarketplaceRepository";

import {
  getSupabaseClient
}
from "../../supabaseClient";

import {
  requirePartnerIdentity,
} from "../../services/identityService";


/* =========================================================
   INCOMING REQUESTS — UI HELPERS
   ========================================================= */

function RequestMetricCard({
  label,
  value,
  description,
  tone
}: {
  label: string;
  value: any;
  description: string;
  tone: "orange" | "yellow" | "green" | "red";
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

    yellow: {
      background:
        "linear-gradient(135deg,#FEFCE8,#FFFDF4)",
      border: "#FDE68A",
      label: "#854D0E",
      value: "#CA8A04",
      circle: "rgba(202,138,4,.07)"
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
    }

  };

  const palette =
    palettes[tone];

  return (

    <div
      className="ir-metric-card"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "108px",
        borderRadius: "18px",
        padding: "17px",
        background: palette.background,
        border: `1px solid ${palette.border}`
      }}
    >

      <div
        style={{
          position: "absolute",
          width: "88px",
          height: "88px",
          borderRadius: "50%",
          right: "-28px",
          top: "-34px",
          background: palette.circle
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
            fontSize: "9px",
            fontWeight: 850,
            letterSpacing: ".65px",
            textTransform: "uppercase"
          }}
        >
          {label}
        </div>

        <div
          style={{
            color: palette.value,
            fontSize: "30px",
            fontWeight: 900,
            lineHeight: 1,
            marginTop: "9px"
          }}
        >
          {value}
        </div>

        <div
          style={{
            color: "#475569",
            fontSize: "10px",
            fontWeight: 600,
            marginTop: "7px"
          }}
        >
          {description}
        </div>

      </div>

    </div>

  );
}


function RequestStatusBadge({
  status
}: {
  status: string;
}) {

  const normalized =
    String(status || "")
      .toLowerCase();

  let config = {
    background: "#FEFCE8",
    border: "#FDE68A",
    color: "#A16207",
    dot: "#EAB308"
  };

  if (normalized === "accepted") {

    config = {
      background: "#ECFDF5",
      border: "#BBF7D0",
      color: "#15803D",
      dot: "#22C55E"
    };

  }

  if (normalized === "rejected") {

    config = {
      background: "#FEF2F2",
      border: "#FECACA",
      color: "#B91C1C",
      dot: "#EF4444"
    };

  }

  return (

    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 10px",
        borderRadius: "999px",
        background: config.background,
        border: `1px solid ${config.border}`,
        color: config.color,
        fontSize: "9px",
        fontWeight: 800,
        textTransform: "capitalize"
      }}
    >

      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: config.dot
        }}
      />

      {status || "pending"}

    </span>

  );
}


function RequestTypeBadge({
  type
}: {
  type: string;
}) {

  return (

    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: "999px",
        background: "#FFF7ED",
        border: "1px solid #FED7AA",
        color: "#C2410C",
        fontSize: "12px",
        fontWeight: 800,
        textTransform: "capitalize"
      }}
    >
      {type || "Request"}
    </span>

  );
}


function RequestActionButton({
  label,
  onClick,
  tone = "neutral",
  disabled = false
}: {
  label: string;
  onClick: () => void;
  tone?: "neutral" | "accept" | "reject";
  disabled?: boolean;
}) {

  let config = {
    background: "#FFFFFF",
    border: "#E2E8F0",
    color: "#334155"
  };

  if (tone === "accept") {

    config = {
      background: "#ECFDF5",
      border: "#BBF7D0",
      color: "#15803D"
    };

  }

  if (tone === "reject") {

    config = {
      background: "#FEF2F2",
      border: "#FECACA",
      color: "#B91C1C"
    };

  }

  return (

    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        border: `1px solid ${config.border}`,
        background: config.background,
        color: config.color,
        borderRadius: "9px",
        padding: "7px 11px",
        cursor:
          disabled
            ? "not-allowed"
            : "pointer",
        opacity:
          disabled
            ? 0.55
            : 1,
        fontSize: "12px",
        fontWeight: 750
      }}
    >
      {label}
    </button>

  );
}


function RequestDetailCard({
  label,
  value,
  fullWidth = false
}: {
  label: string;
  value: any;
  fullWidth?: boolean;
}) {

  return (

    <div
      className="ir-detail-card"
      style={{
        gridColumn:
          fullWidth
            ? "1 / -1"
            : undefined,
        background:
          "linear-gradient(145deg,#F8FAFC,#FFFFFF)",
        border: "1px solid #E2E8F0",
        borderRadius: "14px",
        padding: "14px"
      }}
    >

      <div
        style={{
          color: "#64748B",
          fontSize: "11px",
          fontWeight: 800,
          letterSpacing: ".9px",
          textTransform: "uppercase",
          marginBottom: "6px"
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#0F172A",
          fontSize: "15px",
          fontWeight: 700,
          lineHeight: 1.5,
          wordBreak: "break-word",
          whiteSpace:
            fullWidth
              ? "pre-wrap"
              : undefined
        }}
      >
        {value || "-"}
      </div>

    </div>

  );
}

export default function IncomingRequests() {

const partnerIdentity =
  requirePartnerIdentity();

const partnerId =
  partnerIdentity.partnerId;

const partnerName =
  partnerIdentity.partnerName ?? "";

  const [
    requests,
    setRequests
  ] =
    useState<any[]>([]);

  const [
    selectedRequest,
    setSelectedRequest
  ] =
    useState<any>(null);

  const [
    loading,
    setLoading
  ] =
    useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

 async function
loadRequests() {

  const data =
    await fetchIncomingRequests(
      partnerId
    );

  setRequests(
    data || []
  );
}

  async function
  updateRequestStatus(
    requestId: string,
    status: string
  ) {

    const supabase =
      getSupabaseClient();

    if (!supabase) {
      return;
    }

    await (supabase as any)
      .from(
        "partner_incoming_requests"
      )
      .update({
        status,
        updated_at:
          new Date()
            .toISOString()
      })
      .eq(
        "id",
        requestId
      );
  }
async function handleAccept(
  request: any
) {

  try {

    setLoading(true);

    await updateRequestStatus(
      request.id,
      "accepted"
    );

    console.log("======================================");
    console.log("INCOMING REQUEST ACCEPT");
    console.log("FULL REQUEST OBJECT");
    console.dir(request, { depth: null });

    console.log("PARTNER UUID");
    console.log(request.partner_uuid);

    console.log("STUDENT ID");
    console.log(request.student_id);

    console.log("EMAIL");
    console.log(request.email);

    console.log("PHONE");
    console.log(request.phone);

    let lead;

    try {

      lead = await createLead({

        partner_id: request.partner_id,

        partner_uuid:
  request.partner_uuid ??
  partnerIdentity.partnerUuid,

        partner_name: request.partner_name,

        student_id: request.student_id,

        student_name: request.requester_name,

        school_name: request.school_name,

        email: request.email,

        phone: request.phone,

        class_name: request.class_name,

        request_type: request.request_type,

        lead_source: "incoming",

        status: "new_lead",

        notes: ""

      });

      console.log("CREATE LEAD RETURNED");
      console.dir(lead, { depth: null });

    } catch (e) {

      console.error("CREATE LEAD THREW");
      console.error(e);

    }

    alert(
      "Lead successfully created."
    );

    await loadRequests();

  } catch (error) {

    console.error(error);

    alert(
      "Failed to create lead."
    );

  } finally {

    setLoading(false);

  }
}

  async function
  handleReject(
    request: any
  ) {

    const confirmReject =
      window.confirm(
        "Reject this request?"
      );

    if (!confirmReject)
      return;

    await updateRequestStatus(
      request.id,
      "rejected"
    );

    await loadRequests();
  }

  function
  getStatusColor(
    status: string
  ) {

    switch (status) {

      case "accepted":
        return "#DCFCE7";

      case "rejected":
        return "#FEE2E2";

      default:
        return "#FEF3C7";
    }
  }

   return (

    <div
      className="incoming-requests-page"
      style={{
        width: "95%",
        maxWidth: "1600px",
        margin: "0 auto",
        padding: "24px",
        boxSizing: "border-box"
      }}
    >

      <style>{`
        .ir-swipe-hint { display: none; }

        @media (max-width: 1024px) {
          .incoming-requests-page {
            width: 100% !important;
            max-width: none !important;
            padding: 6px !important;
          }

          .ir-hero {
            min-height: 0 !important;
            padding: 16px 18px !important;
            margin-bottom: 10px !important;
            border-radius: 18px !important;
            gap: 14px !important;
          }
          .ir-hero-copy { min-width: 0 !important; max-width: none !important; flex: 1 1 auto !important; }
          .ir-hero-copy > div:first-child { font-size: 8px !important; letter-spacing: 1.2px !important; margin-bottom: 6px !important; }
          .ir-hero-title { font-size: 25px !important; line-height: 1.08 !important; letter-spacing: -.45px !important; }
          .ir-hero-copy > p { margin-top: 6px !important; font-size: 11px !important; line-height: 1.4 !important; }
          .ir-hero-copy > div:last-child { margin-top: 9px !important; gap: 6px !important; }
          .ir-hero-copy > div:last-child > div { padding: 5px 8px !important; font-size: 8px !important; }
          .ir-hero-badge { width: 64px !important; height: 64px !important; min-width: 64px !important; border-radius: 16px !important; }
          .ir-hero-badge > div > div:first-child { font-size: 21px !important; }
          .ir-hero-badge > div > div:last-child { margin-top: 4px !important; font-size: 6px !important; letter-spacing: .55px !important; }

          .ir-summary, .ir-ledger { border-radius: 17px !important; margin-bottom: 10px !important; }
          .ir-summary { padding: 15px !important; }
          .ir-summary > div:first-child { gap: 10px !important; margin-bottom: 12px !important; align-items: flex-start !important; }
          .ir-summary > div:first-child > div:first-child > div:first-child { font-size: 8px !important; letter-spacing: 1.1px !important; margin-bottom: 4px !important; }
          .ir-summary h2, .ir-ledger h2 { font-size: 18px !important; line-height: 1.12 !important; }
          .ir-summary p, .ir-ledger p { font-size: 10px !important; line-height: 1.35 !important; }
          .ir-summary > div:first-child > div:last-child { font-size: 8px !important; }

          .ir-metrics-grid { gap: 7px !important; }
          .ir-metric-card { min-height: 82px !important; padding: 10px !important; border-radius: 12px !important; }
          .ir-metric-card > div:last-child > div:first-child { font-size: 7px !important; line-height: 1.1 !important; }
          .ir-metric-card > div:last-child > div:nth-child(2) { font-size: 20px !important; margin-top: 5px !important; }
          .ir-metric-card > div:last-child > div:last-child { font-size: 8px !important; margin-top: 4px !important; line-height: 1.2 !important; }

          .ir-ledger-header { padding: 15px !important; }
          .ir-ledger-header > div:last-child { align-items: flex-start !important; gap: 10px !important; }
          .ir-ledger-header > div:last-child > div:last-child { padding: 5px 8px !important; font-size: 8px !important; }
          .ir-swipe-hint {
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
          .ir-table-scroll {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: thin;
          }
          .ir-table { min-width: 650px !important; }
          .ir-table th { padding: 8px 10px !important; font-size: 8px !important; }
          .ir-table td { padding: 9px 10px !important; font-size: 10px !important; }
          .ir-table button { padding: 5px 7px !important; border-radius: 7px !important; font-size: 8px !important; }
          .ir-table span { font-size: 8px !important; }
          .ir-table td:nth-child(2) > div > div:last-child > div:first-child {
            font-size: 10px !important;
            line-height: 1.25 !important;
          }
          .ir-table td:nth-child(2) > div > div:last-child > div:last-child {
            font-size: 8px !important;
            line-height: 1.25 !important;
          }
          .ir-sticky-col {
            position: sticky !important;
            left: 0 !important;
            z-index: 4 !important;
            min-width: 90px !important;
            box-shadow: 6px 0 10px -10px rgba(15,23,42,.55);
          }
          .ir-sticky-head { z-index: 6 !important; background: #F8FAFC !important; }
          .ir-sticky-cell { background: #FFFFFF !important; }

          .ir-modal-overlay { padding: 12px !important; }
          .ir-modal-card { width: min(620px, calc(100vw - 24px)) !important; border-radius: 18px !important; }
          .ir-detail-card { padding: 10px !important; border-radius: 10px !important; }
          .ir-detail-card > div:first-child { font-size: 8px !important; margin-bottom: 4px !important; }
          .ir-detail-card > div:last-child { font-size: 10px !important; }
        }

        @media (max-width: 600px) {
          .incoming-requests-page { padding: 4px !important; }

          .ir-hero { padding: 12px 13px !important; margin-bottom: 8px !important; border-radius: 14px !important; gap: 8px !important; }
          .ir-hero-copy > div:first-child { font-size: 6px !important; letter-spacing: .8px !important; margin-bottom: 4px !important; }
          .ir-hero-title { font-size: 18px !important; letter-spacing: -.25px !important; }
          .ir-hero-copy > p { margin-top: 4px !important; font-size: 8px !important; line-height: 1.3 !important; }
          .ir-hero-copy > div:last-child { margin-top: 6px !important; gap: 4px !important; }
          .ir-hero-copy > div:last-child > div { padding: 4px 6px !important; font-size: 6px !important; }
          .ir-hero-badge { width: 48px !important; height: 48px !important; min-width: 48px !important; border-radius: 11px !important; }
          .ir-hero-badge > div > div:first-child { font-size: 15px !important; }
          .ir-hero-badge > div > div:last-child { font-size: 4px !important; letter-spacing: .25px !important; }

          .ir-summary, .ir-ledger { border-radius: 14px !important; margin-bottom: 8px !important; }
          .ir-summary { padding: 10px !important; }
          .ir-summary h2, .ir-ledger h2 { font-size: 14px !important; }
          .ir-summary p, .ir-ledger p { font-size: 7.5px !important; }
          .ir-summary > div:first-child > div:first-child > div:first-child { font-size: 6px !important; letter-spacing: .8px !important; }
          .ir-summary > div:first-child > div:last-child { font-size: 6px !important; }

          .ir-metrics-grid { grid-template-columns: repeat(4,minmax(0,1fr)) !important; gap: 4px !important; }
          .ir-metric-card { min-height: 68px !important; padding: 7px !important; border-radius: 9px !important; }
          .ir-metric-card > div:last-child > div:first-child { font-size: 5.5px !important; }
          .ir-metric-card > div:last-child > div:nth-child(2) { font-size: 16px !important; margin-top: 4px !important; }
          .ir-metric-card > div:last-child > div:last-child { font-size: 6px !important; margin-top: 3px !important; }

          .ir-ledger-header { padding: 10px !important; }
          .ir-ledger-header > div:last-child > div:last-child { padding: 4px 6px !important; font-size: 6px !important; }
          .ir-swipe-hint { margin: 6px 7px 5px; padding: 5px 7px; font-size: 7px; border-radius: 7px; }
          .ir-table { min-width: 560px !important; }
          .ir-table th { padding: 6px 8px !important; font-size: 6.5px !important; }
          .ir-table td { padding: 7px 8px !important; font-size: 8px !important; }
          .ir-table button { padding: 4px 5px !important; font-size: 6.5px !important; }
          .ir-table span { font-size: 6.5px !important; }
          .ir-table td:nth-child(2) > div > div:last-child > div:first-child {
            font-size: 8px !important;
            line-height: 1.25 !important;
          }
          .ir-table td:nth-child(2) > div > div:last-child > div:last-child {
            font-size: 6.5px !important;
            line-height: 1.25 !important;
          }
          .ir-sticky-col { min-width: 76px !important; }

          .ir-modal-overlay { padding: 8px !important; }
          .ir-modal-card { width: calc(100vw - 16px) !important; border-radius: 14px !important; }
          .ir-detail-card { padding: 7px !important; border-radius: 8px !important; }
          .ir-detail-card > div:first-child { font-size: 6px !important; }
          .ir-detail-card > div:last-child { font-size: 8px !important; }
        }
      `}</style>


      {/* =========================================================
          HERO
         ========================================================= */}

      <div
        className="ir-hero"
        style={{
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #FFFFFF 0%, #FFFCF8 55%, #F7FAFF 100%)",
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

        {/* DECORATIVE CIRCLES */}

        <div
          style={{
            position: "absolute",
            width: "330px",
            height: "330px",
            borderRadius: "50%",
            right: "-105px",
            top: "-175px",
            background:
              "rgba(249,115,22,.065)",
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
            background:
              "rgba(59,130,246,.055)",
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
            background:
              "rgba(255,237,213,.55)",
            pointerEvents: "none"
          }}
        />


        {/* HERO CONTENT */}

        <div
          className="ir-hero-copy"
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "850px"
          }}
        >

          <div
            style={{
              color: "#F97316",
              fontSize: "15px",
              letterSpacing: "2.4px",
              fontWeight: 800,
              textTransform: "uppercase",
              marginBottom: "12px"
            }}
          >
            PARTNER CRM
          </div>

          <h1 className="ir-hero-title"
            style={{
              margin: 0,
              color: "#0F172A",
              fontSize: "43px",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-1px"
            }}
          >
            Incoming Requests
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
            Review student requests, respond to incoming
            interest and convert accepted requests into
            actionable CRM leads.
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
              {requests.length} TOTAL REQUESTS
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
              CRM INTAKE DESK
            </div>

          </div>

        </div>


        {/* HERO SYMBOL */}

        <div
          className="ir-hero-badge"
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
                fontSize: "40px",
                lineHeight: 1
              }}
            >
              ↗
            </div>

            <div
              style={{
                marginTop: "9px",
                color: "#F97316",
                fontSize: "9px",
                fontWeight: 900,
                letterSpacing: "1.4px"
              }}
            >
              REQUEST INTAKE
            </div>

          </div>

        </div>

      </div>


      {/* =========================================================
          REQUEST INTELLIGENCE
         ========================================================= */}

      <div
        className="ir-summary"
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
              REQUEST INTELLIGENCE
            </div>

            <h2
              style={{
                margin: 0,
                color: "#0F172A",
                fontSize: "24px",
                fontWeight: 800
              }}
            >
              Incoming Request Summary
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#64748B",
                fontSize: "16px"
              }}
            >
              A snapshot of student interest moving through
              your partner CRM intake pipeline.
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
            PARTNER REQUEST LEDGER
          </div>

        </div>


        <div
          className="ir-metrics-grid"
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4,minmax(0,1fr))",
            gap: "14px"
          }}
        >

          <RequestMetricCard
            label="Total Requests"
            value={requests.length}
            description="Requests received from students"
            tone="orange"
          />

          <RequestMetricCard
            label="Pending"
            value={
              requests.filter(
                request =>
                  request.status === "pending"
              ).length
            }
            description="Waiting for your response"
            tone="yellow"
          />

          <RequestMetricCard
            label="Accepted"
            value={
              requests.filter(
                request =>
                  request.status === "accepted"
              ).length
            }
            description="Converted into CRM leads"
            tone="green"
          />

          <RequestMetricCard
            label="Rejected"
            value={
              requests.filter(
                request =>
                  request.status === "rejected"
              ).length
            }
            description="Requests not progressed"
            tone="red"
          />

        </div>

      </div>


      {/* =========================================================
          REQUEST LEDGER
         ========================================================= */}

      <div
        className="ir-ledger"
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow:
            "0 8px 24px rgba(15,23,42,.035)"
        }}
      >

        {/* TABLE HEADER */}

        <div
          className="ir-ledger-header"
          style={{
            position: "relative",
            overflow: "hidden",
            padding: "24px",
            borderBottom:
              "1px solid #E2E8F0",
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
              background:
                "rgba(249,115,22,.055)",
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
                CRM INTAKE PIPELINE
              </div>

              <h2
                style={{
                  margin: 0,
                  color: "#0F172A",
                  fontSize: "23px",
                  fontWeight: 800
                }}
              >
                Student Requests
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748B",
                  fontSize: "15px"
                }}
              >
                Review each incoming request and decide
                whether it should move into your CRM.
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
              {requests.length} REQUESTS
            </div>

          </div>

        </div>


        {/* TABLE */}

        <div className="ir-swipe-hint">
          Swipe left or right to view request details →
        </div>

        <div
          className="ir-table-scroll"
          style={{
            overflowX: "auto"
          }}
        >

          <table
            className="ir-table"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "760px"
            }}
          >

            <thead>

              <tr
                style={{
                  background: "#F8FAFC"
                }}
              >

                {[
                  "Type",
                  "Student",
                  "School",
                  "Status",
                  "Actions"
                ].map(label => (

                  <th
                    key={label}
                    className={label === "Type" ? "ir-sticky-col ir-sticky-head" : undefined}
                    style={{
                      padding: "13px 18px",
                      textAlign: "left",
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

              {requests.map(
                (
                  request: any
                ) => (

                  <tr
                    key={request.id}
                    style={{
                      borderBottom:
                        "1px solid #F1F5F9"
                    }}
                  >

                    {/* TYPE */}

                    <td
                      className="ir-sticky-col ir-sticky-cell"
                      style={{
                        padding: "15px 18px"
                      }}
                    >

                      <RequestTypeBadge
                        type={
                          request.request_type
                        }
                      />

                    </td>


                    {/* STUDENT */}

                    <td
                      style={{
                        padding: "15px 18px"
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
                            width: "34px",
                            height: "34px",
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
                          {request.requester_name
                            ?.charAt(0)
                            .toUpperCase() ||
                            "S"}
                        </div>

                        <div>

                          <div
                            style={{
                              color: "#0F172A",
                              fontSize: "15px",
                              fontWeight: 750
                            }}
                          >
                            {
                              request.requester_name
                            }
                          </div>

                          <div
                            style={{
                              marginTop: "2px",
                              color: "#94A3B8",
                              fontSize: "11px"
                            }}
                          >
                            Incoming student
                          </div>

                        </div>

                      </div>

                    </td>


                    {/* SCHOOL */}

                    <td
                      style={{
                        padding: "15px 18px",
                        color: "#475569",
                        fontSize: "15px",
                        fontWeight: 600
                      }}
                    >
                      {request.school_name || "-"}
                    </td>


                    {/* STATUS */}

                    <td
                      style={{
                        padding: "15px 18px"
                      }}
                    >

                      <RequestStatusBadge
                        status={
                          request.status
                        }
                      />

                    </td>


                    {/* ACTIONS */}

                    <td
                      style={{
                        padding: "15px 18px"
                      }}
                    >

                      <div
                        style={{
                          display: "flex",
                          gap: "7px",
                          flexWrap: "wrap"
                        }}
                      >

                        <RequestActionButton
                          label="View"
                          onClick={() =>
                            setSelectedRequest(
                              request
                            )
                          }
                        />

                        {request.status ===
                          "pending" && (

                          <>

                            <RequestActionButton
                              label={
                                loading
                                  ? "Processing..."
                                  : "Accept"
                              }
                              tone="accept"
                              disabled={loading}
                              onClick={() =>
                                handleAccept(
                                  request
                                )
                              }
                            />

                            <RequestActionButton
                              label="Reject"
                              tone="reject"
                              onClick={() =>
                                handleReject(
                                  request
                                )
                              }
                            />

                          </>

                        )}

                      </div>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>


        {/* EMPTY STATE */}

        {requests.length === 0 && (

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
              ↗
            </div>

            <div
              style={{
                color: "#0F172A",
                fontSize: "18px",
                fontWeight: 800
              }}
            >
              No incoming requests yet
            </div>

            <div
              style={{
                color: "#64748B",
                fontSize: "14px",
                marginTop: "5px"
              }}
            >
              Student requests will appear here
              when they reach your partner CRM.
            </div>

          </div>

        )}

      </div>


      {/* =========================================================
          REQUEST DETAIL MODAL
         ========================================================= */}

      {selectedRequest && (

        <div
          className="ir-modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15,23,42,.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 9999
          }}
        >

          <div
            className="ir-modal-card"
            style={{
              width:
                "min(680px, calc(100vw - 40px))",
              maxHeight: "88vh",
              overflowY: "auto",
              background: "#FFFFFF",
              borderRadius: "26px",
              border: "1px solid #E2E8F0",
              boxShadow:
                "0 28px 80px rgba(15,23,42,.20)"
            }}
          >

            {/* MODAL HEADER */}

            <div
              style={{
                position: "relative",
                overflow: "hidden",
                padding: "22px",
                borderBottom:
                  "1px solid #E2E8F0",
                background:
                  "linear-gradient(135deg,#FFFFFF,#FFF9F3)"
              }}
            >

              <div
                style={{
                  position: "absolute",
                  width: "145px",
                  height: "145px",
                  borderRadius: "50%",
                  right: "-50px",
                  top: "-80px",
                  background:
                    "rgba(249,115,22,.07)",
                  pointerEvents: "none"
                }}
              />

              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "flex-start",
                  gap: "20px"
                }}
              >

                <div>

                  <div
                    style={{
                      color: "#F97316",
                      fontSize: "11px",
                      fontWeight: 850,
                      letterSpacing: "1.4px",
                      marginBottom: "6px"
                    }}
                  >
                    INCOMING REQUEST
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      color: "#0F172A",
                      fontSize: "24px",
                      fontWeight: 800
                    }}
                  >
                    Request Details
                  </h2>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#64748B",
                      fontSize: "14px",
                      lineHeight: 1.5
                    }}
                  >
                    Review the student information
                    attached to this CRM request.
                  </p>

                </div>


                <button
                  onClick={() =>
                    setSelectedRequest(
                      null
                    )
                  }
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "10px",
                    border:
                      "1px solid #E2E8F0",
                    background: "#FFFFFF",
                    color: "#64748B",
                    cursor: "pointer",
                    fontSize: "21px",
                    fontWeight: 700,
                    flexShrink: 0
                  }}
                >
                  ×
                </button>

              </div>

            </div>


            {/* MODAL BODY */}

            <div
              style={{
                padding: "22px"
              }}
            >

              {/* STUDENT IDENTITY */}

              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "space-between",
                  gap: "15px",
                  padding: "15px",
                  borderRadius: "17px",
                  background:
                    "linear-gradient(135deg,#FFF7ED,#FFFCF8)",
                  border: "1px solid #FED7AA",
                  marginBottom: "16px"
                }}
              >

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    position: "relative",
                    zIndex: 1
                  }}
                >

                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "14px",
                      background: "#FFFFFF",
                      border:
                        "1px solid #FED7AA",
                      color: "#F97316",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: "19px"
                    }}
                  >
                    {selectedRequest
                      .requester_name
                      ?.charAt(0)
                      .toUpperCase() ||
                      "S"}
                  </div>

                  <div>

                    <div
                      style={{
                        color: "#9A3412",
                        fontSize: "11px",
                        fontWeight: 850,
                        letterSpacing: "1px",
                        marginBottom: "3px"
                      }}
                    >
                      REQUESTER
                    </div>

                    <div
                      style={{
                        color: "#0F172A",
                        fontSize: "18px",
                        fontWeight: 800
                      }}
                    >
                      {
                        selectedRequest
                          .requester_name
                      }
                    </div>

                    <div
                      style={{
                        color: "#64748B",
                        fontSize: "13px",
                        marginTop: "2px"
                      }}
                    >
                      {
                        selectedRequest
                          .school_name ||
                        "School not available"
                      }
                    </div>

                  </div>

                </div>


                <RequestStatusBadge
                  status={
                    selectedRequest.status
                  }
                />

              </div>


              {/* DETAILS GRID */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "10px"
                }}
              >

                <RequestDetailCard
                  label="Request Type"
                  value={
                    selectedRequest
                      .request_type
                  }
                />

                <RequestDetailCard
                  label="Status"
                  value={
                    selectedRequest.status
                  }
                />

                <RequestDetailCard
                  label="Email"
                  value={
                    selectedRequest.email
                  }
                />

                <RequestDetailCard
                  label="Phone"
                  value={
                    selectedRequest.phone
                  }
                />

                <RequestDetailCard
                  label="School"
                  value={
                    selectedRequest
                      .school_name
                  }
                />

                <RequestDetailCard
                  label="Class"
                  value={
                    selectedRequest
                      .class_name
                  }
                />

                <RequestDetailCard
                  label="Message"
                  value={
                    selectedRequest.message
                  }
                  fullWidth
                />

              </div>


              {/* FOOTER */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "9px",
                  marginTop: "18px",
                  paddingTop: "17px",
                  borderTop:
                    "1px solid #F1F5F9"
                }}
              >

                <button
                  onClick={() =>
                    setSelectedRequest(
                      null
                    )
                  }
                  style={{
                    padding: "9px 15px",
                    borderRadius: "10px",
                    border:
                      "1px solid #CBD5E1",
                    background: "#FFFFFF",
                    color: "#475569",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 750
                  }}
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}
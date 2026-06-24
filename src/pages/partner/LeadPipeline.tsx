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

      const profile =
        JSON.parse(
          localStorage.getItem(
            "partnerProfile"
          ) || "{}"
        );

      const partnerId =
        profile.partner_id;

console.log(
  "CURRENT PARTNER PROFILE",
  profile
);

console.log(
  "CURRENT PARTNER ID",
  partnerId
);

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

    <div>

      {/* HERO */}

      <div
        style={{
          background:
            "linear-gradient(135deg,#0F172A,#1E293B)",
          color:
            "white",
          padding:
            "32px",
          borderRadius:
            "24px",
          marginBottom:
            "24px"
        }}
      >

        <div
          style={{
            color:
              "#F59E0B",
            fontWeight:
              700,
            letterSpacing:
              2
          }}
        >
          PARTNER CRM
        </div>

        <h1>
          Lead Pipeline
        </h1>

        <p>
          Manage enquiries,
          admissions and
          follow-ups.
        </p>

      </div>

      {/* KPI CARDS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
  "repeat(9,1fr)",
          gap: "16px",
          marginBottom: "24px"
        }}
      >

        <StatCard
          title="Total Leads"
          value={metrics.total}
        />

        <StatCard
          title="Incoming"
          value={metrics.incoming}
        />

        <StatCard
          title="Outgoing"
          value={metrics.outgoing}
        />

        <StatCard
          title="Admissions"
          value={metrics.admissions}
        />

        <StatCard
          title="Rejected"
          value={metrics.rejected}
        />

<StatCard
  title="Due Today"
  value={dueTodayCount}
/>

<StatCard
  title="Overdue"
  value={overdueCount}
/>

<StatCard
  title="Interested"
  value={interestedCount}
/>

<StatCard
  title="Counselling"
  value={counsellingCount}
/>

      </div>

      {/* FILTERS */}

      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "20px",
          marginBottom: "20px",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap"
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
            padding: "12px",
            minWidth: "280px"
          }}
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
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

 {/* TABLE */}

<div
  style={{
    background: "white",
    borderRadius: "24px",
    overflow: "hidden",
    border: "1px solid #E2E8F0",
    boxShadow:
      "0 10px 30px rgba(15,23,42,0.06)"
  }}
>

  <table
    style={{
      width: "100%",
      borderCollapse: "collapse"
    }}
  >

    <thead>

      <tr
        style={{
          background:
            "linear-gradient(90deg,#071A44,#102A5C)",
          color: "white",
          height: "64px"
        }}
      >

        <th style={{padding:"18px 24px",textAlign:"left",width:"18%"}}>
          Student
        </th>

        <th style={{padding:"18px 24px",textAlign:"left",width:"16%"}}>
          School
        </th>

        <th style={{padding:"18px 24px",textAlign:"left",width:"12%"}}>
          Phone
        </th>

        <th style={{padding:"18px 24px",textAlign:"left",width:"18%"}}>
          Email
        </th>

        <th style={{padding:"18px 24px",textAlign:"center",width:"10%"}}>
          Source
        </th>

        <th style={{padding:"18px 24px",textAlign:"center",width:"14%"}}>
          Status
        </th>

        <th style={{padding:"18px 24px",textAlign:"center",width:"12%"}}>
          Follow Up
        </th>

        <th style={{padding:"18px 24px",textAlign:"center",width:"10%"}}>
          Actions
        </th>

      </tr>

    </thead>

    <tbody>

      {filteredLeads.map(
        (lead:any,index:number) => (

          <tr
            key={lead.id}
            style={{

              background:

                lead.next_followup_date &&
                lead.next_followup_date <
                today

                  ? "#FEF2F2"

                  :

                lead.next_followup_date ===
                today

                  ? "#FFFBEB"

                  :

                index % 2 === 0

                  ? "#FFFFFF"

                  : "#FAFBFC",

              borderBottom:
                "1px solid #E2E8F0"

            }}
          >

            {/* STUDENT */}

            <td
              style={{
                padding:"20px 24px"
              }}
            >

              <div
                style={{
                  fontWeight:700,
                  color:"#0F172A"
                }}
              >
                {lead.student_name}
              </div>

              <div
                style={{
                  fontSize:"12px",
                  color:"#64748B",
                  marginTop:"4px"
                }}
              >
                {lead.request_type}
              </div>

            </td>

            {/* SCHOOL */}

            <td
              style={{
                padding:"20px 24px",
                color:"#334155"
              }}
            >
              {lead.school_name}
            </td>

            {/* PHONE */}

            <td
              style={{
                padding:"20px 24px",
                color:"#475569"
              }}
            >
              {lead.phone || "-"}
            </td>

            {/* EMAIL */}

            <td
              style={{
                padding:"20px 24px",
                color:"#475569",
                fontSize:"13px"
              }}
            >
              {lead.email || "-"}
            </td>

            {/* SOURCE */}

            <td
              style={{
                padding:"20px 24px",
                textAlign:"center"
              }}
            >

              {lead.lead_source ===
              "incoming" && (

                <span
                  style={{
                    background:"#DBEAFE",
                    color:"#1E40AF",
                    padding:"8px 14px",
                    borderRadius:"999px",
                    fontSize:"12px",
                    fontWeight:600
                  }}
                >
                  ⬇ Incoming
                </span>

              )}

              {lead.lead_source ===
              "outgoing" && (

                <span
                  style={{
                    background:"#DCFCE7",
                    color:"#166534",
                    padding:"8px 14px",
                    borderRadius:"999px",
                    fontSize:"12px",
                    fontWeight:600
                  }}
                >
                  ⬆ Outgoing
                </span>

              )}

              {lead.lead_source ===
              "admin_assigned" && (

                <span
                  style={{
                    background:"#FEF3C7",
                    color:"#92400E",
                    padding:"8px 14px",
                    borderRadius:"999px",
                    fontSize:"12px",
                    fontWeight:600
                  }}
                >
                  ⭐ Assigned
                </span>

              )}

            </td>

            {/* STATUS */}

            <td
              style={{
                padding:"20px 24px",
                textAlign:"center"
              }}
            >

              <select
                value={lead.status}
                onChange={(e)=>
                  handleStatusChange(
                    lead.id,
                    e.target.value
                  )
                }
                style={{
                  padding:"10px 12px",
                  borderRadius:"10px",
                  border:"1px solid #CBD5E1",
                  minWidth:"190px",
                  fontWeight:600,
                  background:"white"
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

            {/* FOLLOWUP */}

            <td
              style={{
                padding:"20px 24px",
                textAlign:"center"
              }}
            >

              {lead.next_followup_date ? (

                <span
                  style={{
                    background:"#EFF6FF",
                    color:"#1E40AF",
                    padding:"8px 12px",
                    borderRadius:"999px",
                    fontSize:"12px",
                    fontWeight:600
                  }}
                >
                  {lead.next_followup_date}
                </span>

              ) : (

                <span
                  style={{
                    color:"#94A3B8"
                  }}
                >
                  Not Set
                </span>

              )}

            </td>

            {/* ACTION */}

            <td
              style={{
                padding:"20px 24px",
                textAlign:"center"
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
                  background:"#FBBF24",
                  color:"#071A44",
                  border:"none",
                  borderRadius:"10px",
                  padding:"10px 18px",
                  fontWeight:700,
                  cursor:"pointer"
                }}
              >
                View
              </button>

            </td>

          </tr>

        )
      )}

    </tbody>

  </table>

</div>

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
  value
}: any) {

  return (

    <div
      style={{
        background:"white",
        padding:"20px",
        borderRadius:"20px"
      }}
    >

      <div>
        {title}
      </div>

      <div
        style={{
          fontSize:"32px",
          fontWeight:700,
          marginTop:"8px"
        }}
      >
        {value}
      </div>


    </div>

  );
}


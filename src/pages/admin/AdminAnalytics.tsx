import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../../supabaseClient";

import StudentLeadTable
  from "../../components/admin/StudentLeadTable";

import AllocateLeadsModal
  from "../../components/admin/AllocateLeadsModal";

import AllocationHistoryModal
  from "../../components/admin/AllocationHistoryModal";

type AnalyticsTab =
  | "students"
  | "partners";

export default function AdminAnalytics() {

  const [activeTab,
    setActiveTab] =
    useState<AnalyticsTab>(
      "students"
    );

  const [students,
    setStudents] =
    useState<any[]>([]);

  const [partners,
    setPartners] =
    useState<any[]>([]);

  const [marketplace,
    setMarketplace] =
    useState<any[]>([]);

  const [leads,
    setLeads] =
    useState<any[]>([]);

  const [requests,
    setRequests] =
    useState<any[]>([]);

  const [partnerSearch,
    setPartnerSearch] =
    useState("");

  const [
    selectedStudents,
    setSelectedStudents
  ] = useState<string[]>([]);

  const [
    allocateModalOpen,
    setAllocateModalOpen
  ] = useState(false);

  const [
    historyModalOpen,
    setHistoryModalOpen
  ] = useState(false);

  useEffect(() => {

    loadData();

  }, []);

  async function loadData() {

    const supabase =
      getSupabaseClient();

    if (!supabase)
      return;

    const {
      data: studentsData
    } =
      await (supabase as any)
        .from(
          "students_master"
        )
        .select("*");

    const {
      data: partnersData
    } =
      await (supabase as any)
        .from(
          "partners_master"
        )
        .select("*");

    const {
      data: marketplaceData
    } =
      await (supabase as any)
        .from(
          "student_marketplace_activity"
        )
        .select("*");

    const {
      data: leadData
    } =
      await (supabase as any)
        .from(
          "partner_student_leads"
        )
        .select("*");

    const {
      data: requestData
    } =
      await (supabase as any)
        .from(
          "partner_contact_requests"
        )
        .select("*");

    setStudents(
      studentsData || []
    );

    setPartners(
      partnersData || []
    );

    setMarketplace(
      marketplaceData || []
    );

    setLeads(
      leadData || []
    );

    setRequests(
      requestData || []
    );
  }

  const filteredPartners =
    useMemo(() => {

      return partners.filter(
        partner =>
          (
            partner.partner_name ||
            ""
          )
            .toLowerCase()
            .includes(
              partnerSearch
                .toLowerCase()
            )
      );

    }, [
      partners,
      partnerSearch
    ]);

  const totalSchools =
    new Set(
      students.map(
        s => s.school_name
      )
    ).size;

  const totalActivePartners =
    partners.filter(
      partner =>
        partner.status ===
        "active"
    ).length;

  const allocatedLeads =
    leads.length;

  const activeLeads =
    leads.filter(
      lead =>
        ![
          "Rejected",
          "Closed"
        ].includes(
          lead.status
        )
    ).length;

  const convertedLeads =
    leads.filter(
      lead =>
        lead.status ===
        "Admitted"
    ).length;

  const conversionRate =
    leads.length > 0

      ? Math.round(
          (
            convertedLeads /
            leads.length
          ) * 100
        )

      : 0;

  return (

    <div
      style={{
        padding:"30px"
      }}
    >

      <div
        style={{
          display:"flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
          marginBottom:
            "20px"
        }}
      >

        <div>

          <h1
            style={{
              margin:0
            }}
          >
            Analytics Center
          </h1>

          <div
            style={{
              color:"#64748B",
              marginTop:"6px"
            }}
          >
            Lead Allocation &
            Conversion Intelligence
          </div>

        </div>

      </div>

      <div
        style={{
          display:"flex",
          gap:"12px",
          marginBottom:
            "24px"
        }}
      >

        <button
          onClick={() =>
            setActiveTab(
              "students"
            )
          }
          style={
            activeTab ===
            "students"

              ? activeTabStyle

              : inactiveTabStyle
          }
        >
          Students
        </button>

        <button
          onClick={() =>
            setActiveTab(
              "partners"
            )
          }
          style={
            activeTab ===
            "partners"

              ? activeTabStyle

              : inactiveTabStyle
          }
        >
          Partners
        </button>

      </div>

            {activeTab ===
        "students" && (

        <>

          {/* KPI SECTION */}

          <div
            style={kpiGrid}
          >

            <KPI
              title="Students"
              value={
                students.length
              }
            />

            <KPI
              title="Schools"
              value={
                totalSchools
              }
            />

            <KPI
              title="Active Partners"
              value={
                totalActivePartners
              }
            />

            <KPI
              title="Allocated Leads"
              value={
                allocatedLeads
              }
            />

          </div>

          {/* LEAD REGISTRY */}

          <StudentLeadTable

            students={
              students
            }

            leads={
              leads
            }

            selectedStudents={
              selectedStudents
            }

            setSelectedStudents={
              setSelectedStudents
            }

            onAllocate={() =>
              setAllocateModalOpen(
                true
              )
            }

            onHistory={() =>
              setHistoryModalOpen(
                true
              )
            }

          />

          {/* STUDENT INSIGHTS */}

          <div
            style={{
              display:"grid",
              gridTemplateColumns:
                "repeat(3,1fr)",
              gap:"20px",
              marginTop:"20px"
            }}
          >

            <Section
              title="Lead Status"
            >

              <MetricRow
                label="Allocated"
                value={
                  leads.filter(
                    l =>
                      l.status ===
                      "allocated"
                  ).length
                }
              />

              <MetricRow
                label="Contacted"
                value={
                  leads.filter(
                    l =>
                      l.status ===
                      "contacted"
                  ).length
                }
              />

              <MetricRow
                label="Counselling"
                value={
                  leads.filter(
                    l =>
                      l.status ===
                      "counselling"
                  ).length
                }
              />

              <MetricRow
                label="Admitted"
                value={
                  leads.filter(
                    l =>
                      l.status ===
                      "Admitted"
                  ).length
                }
              />

              <MetricRow
                label="Rejected"
                value={
                  leads.filter(
                    l =>
                      l.status ===
                      "Rejected"
                  ).length
                }
              />

            </Section>

            <Section
              title="Marketplace Activity"
            >

              <MetricRow
                label="Activities"
                value={
                  marketplace.length
                }
              />

              <MetricRow
                label="Requests"
                value={
                  requests.length
                }
              />

              <MetricRow
                label="Partners"
                value={
                  partners.length
                }
              />

            </Section>

            <Section
              title="Lead Conversion"
            >

              <MetricRow
                label="Total Leads"
                value={
                  leads.length
                }
              />

              <MetricRow
                label="Admissions"
                value={
                  convertedLeads
                }
              />

              <MetricRow
                label="Conversion %"
                value={
                  conversionRate +
                  "%"
                }
              />

            </Section>

          </div>

          {/* MODALS */}

          <AllocateLeadsModal

            open={
              allocateModalOpen
            }

            onClose={() =>
              setAllocateModalOpen(
                false
              )
            }

            selectedStudents={
              students.filter(
                student =>
                  selectedStudents.includes(
                    student.student_id
                  )
              )
            }

            onSuccess={() => {

              loadData();

              setSelectedStudents(
                []
              );

            }}

          />

          <AllocationHistoryModal

            open={
              historyModalOpen
            }

            onClose={() =>
              setHistoryModalOpen(
                false
              )
            }

          />

        </>

      )}

            {activeTab ===
        "partners" && (

        <>

          {/* PARTNER KPI SECTION */}

          <div
            style={kpiGrid}
          >

            <KPI
              title="Partners"
              value={
                partners.length
              }
            />

            <KPI
              title="Total Leads"
              value={
                leads.length
              }
            />

            <KPI
              title="Active Leads"
              value={
                activeLeads
              }
            />

            <KPI
              title="Conversion %"
              value={
                conversionRate +
                "%"
              }
            />

          </div>

          {/* PARTNER REGISTRY */}

          <Section
            title="Partner Registry"
          >

            <input
              placeholder="Search Partner"
              value={
                partnerSearch
              }
              onChange={(e)=>
                setPartnerSearch(
                  e.target.value
                )
              }
              style={searchStyle}
            />

            <table
              style={tableStyle}
            >

              <thead>

                <tr>

                  <th>
                    Partner
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Area
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Age Range
                  </th>

                  <th>
                    Specialization
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredPartners
                  .slice(0,100)
                  .map(
                    partner => (

                    <tr
                      key={
                        partner.id
                      }
                    >

                      <td>
                        {
                          partner.partner_name
                        }
                      </td>

                      <td>
                        {
                          partner.category
                        }
                      </td>

                      <td>
                        {
                          partner.institute_area
                        }
                      </td>

                      <td>
                        {
                          partner.email
                        }
                      </td>

                      <td>

                        {
                          partner.preferred_age_from
                        }

                        {" - "}

                        {
                          partner.preferred_age_to
                        }

                      </td>

                      <td>

                        {Array.isArray(
                          partner.specialization
                        )

                          ? partner.specialization.join(
                              ", "
                            )

                          : "-"}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </Section>

          {/* PARTNER INTELLIGENCE */}

          <div
            style={{
              display:"grid",
              gridTemplateColumns:
                "repeat(3,1fr)",
              gap:"20px",
              marginTop:"20px"
            }}
          >

            <Section
              title="Partner Categories"
            >

              {Object.entries(

                partners.reduce(
                  (
                    acc:any,
                    partner:any
                  ) => {

                    const key =
                      partner.category ||
                      "Unknown";

                    acc[key] =
                      (acc[key] || 0)
                      + 1;

                    return acc;

                  },
                  {}
                )

              ).map(
                ([key,value]) => (

                  <MetricRow
                    key={key}
                    label={String(key)}
                    value={value}
                  />

                )
              )}

            </Section>

            <Section
              title="Area Distribution"
            >

              {Object.entries(

                partners.reduce(
                  (
                    acc:any,
                    partner:any
                  ) => {

                    const key =
                      partner.institute_area ||
                      "Unknown";

                    acc[key] =
                      (acc[key] || 0)
                      + 1;

                    return acc;

                  },
                  {}
                )

              )
                .slice(0,10)
                .map(
                  ([key,value]) => (

                    <MetricRow
                      key={key}
                      label={String(key)}
                      value={value}
                    />

                  )
                )}

            </Section>

            <Section
              title="Partner Engagement"
            >

              <MetricRow
                label="Contact Requests"
                value={
                  requests.length
                }
              />

              <MetricRow
                label="Allocated Leads"
                value={
                  leads.length
                }
              />

              <MetricRow
                label="Active Partners"
                value={
                  totalActivePartners
                }
              />

            </Section>

          </div>

          {/* LEAD FUNNEL */}

          <Section
            title="Lead Funnel"
          >

            <div
              style={{
                display:"grid",
                gridTemplateColumns:
                  "repeat(5,1fr)",
                gap:"16px"
              }}
            >

              <KPI
                title="Allocated"
                value={
                  leads.filter(
                    l =>
                      l.status ===
                      "allocated"
                  ).length
                }
              />

              <KPI
                title="Contacted"
                value={
                  leads.filter(
                    l =>
                      l.status ===
                      "contacted"
                  ).length
                }
              />

              <KPI
                title="Counselling"
                value={
                  leads.filter(
                    l =>
                      l.status ===
                      "counselling"
                  ).length
                }
              />

              <KPI
                title="Admitted"
                value={
                  leads.filter(
                    l =>
                      l.status ===
                      "Admitted"
                  ).length
                }
              />

              <KPI
                title="Rejected"
                value={
                  leads.filter(
                    l =>
                      l.status ===
                      "Rejected"
                  ).length
                }
              />

            </div>

          </Section>

        </>

      )}

          </div>
  );
}

/* =======================================================
   SHARED COMPONENTS
======================================================= */

function KPI({

  title,
  value

}: any) {

  return (

    <div
      style={{
        background:"white",
        borderRadius:"20px",
        padding:"24px",
        boxShadow:
          "0 1px 3px rgba(0,0,0,0.06)"
      }}
    >

      <div
        style={{
          color:"#64748B",
          fontSize:"14px",
          fontWeight:500
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize:"34px",
          fontWeight:700,
          marginTop:"8px",
          color:"#0F172A"
        }}
      >
        {value}
      </div>

    </div>

  );
}

function Section({

  title,
  children

}: any) {

  return (

    <div
      style={{
        background:"white",
        padding:"24px",
        borderRadius:"20px",
        marginTop:"20px",
        boxShadow:
          "0 1px 3px rgba(0,0,0,0.06)"
      }}
    >

      <h2
        style={{
          marginTop:0,
          marginBottom:"20px",
          fontSize:"20px",
          color:"#0F172A"
        }}
      >
        {title}
      </h2>

      {children}

    </div>

  );
}

function MetricRow({

  label,
  value

}: any) {

  return (

    <div
      style={{
        display:"flex",
        justifyContent:
          "space-between",
        alignItems:"center",
        padding:"12px 0",
        borderBottom:
          "1px solid #F1F5F9"
      }}
    >

      <span
        style={{
          color:"#475569"
        }}
      >
        {label}
      </span>

      <strong
        style={{
          color:"#0F172A"
        }}
      >
        {value}
      </strong>

    </div>

  );
}

/* =======================================================
   STYLES
======================================================= */

const kpiGrid = {

  display:"grid",

  gridTemplateColumns:
    "repeat(4,1fr)",

  gap:"20px",

  marginBottom:"20px"

};

const searchStyle = {

  width:"100%",

  padding:"12px 16px",

  borderRadius:"12px",

  border:
    "1px solid #CBD5E1",

  fontSize:"14px"

};

const tableStyle = {

  width:"100%",

  borderCollapse:
    "collapse" as const

};

const activeTabStyle = {

  background:"#143B73",

  color:"white",

  border:"none",

  padding:"12px 24px",

  borderRadius:"12px",

  cursor:"pointer",

  fontWeight:600

};

const inactiveTabStyle = {

  background:"#E2E8F0",

  color:"#475569",

  border:"none",

  padding:"12px 24px",

  borderRadius:"12px",

  cursor:"pointer",

  fontWeight:600

};
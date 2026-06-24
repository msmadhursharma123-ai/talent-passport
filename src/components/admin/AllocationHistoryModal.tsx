import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  fetchAllocationHistory
} from "../../data/partnerMarketplaceRepository";

interface Props {

  open: boolean;

  onClose: () => void;
}

export default function AllocationHistoryModal({

  open,

  onClose

}: Props) {

  const [history,
    setHistory] =
    useState<any[]>([]);

  const [partnerSearch,
    setPartnerSearch] =
    useState("");

  const [period,
    setPeriod] =
    useState("all");

  useEffect(() => {

    if (open) {

      loadHistory();
    }

  }, [open]);

  async function loadHistory() {

    const data =
      await fetchAllocationHistory();

    setHistory(
      data || []
    );
  }

  const filteredHistory =
    useMemo(() => {

      return history.filter(
        item => {

          const matchesPartner =

            (
              item.partner_name ||
              ""
            )

            .toLowerCase()

            .includes(
              partnerSearch
                .toLowerCase()
            );

          return matchesPartner;
        }
      );

    }, [

      history,
      partnerSearch,
      period

    ]);

  const totalLeads =
    filteredHistory.reduce(

      (sum,item) =>

        sum +
        (item.total_leads || 0),

      0
    );

  const totalAdmissions =
    filteredHistory.reduce(

      (sum,item) =>

        sum +
        (item.admissions || 0),

      0
    );

  const overallConversion =

    totalLeads > 0

      ? Math.round(
          (
            totalAdmissions /
            totalLeads
          ) * 100
        )

      : 0;

  if (!open)
    return null;

  return (

    <div
      style={{
        position:"fixed",
        inset:0,
        background:
          "rgba(0,0,0,0.45)",
        zIndex:9999,

        display:"flex",

        justifyContent:
          "center",

        alignItems:
          "center"
      }}
    >

      <div
        style={{
          width:"1200px",
          maxHeight:"85vh",

          overflow:"auto",

          background:"white",

          borderRadius:"24px",

          padding:"24px"
        }}
      >

        {/* HEADER */}

        <div
          style={{
            display:"flex",

            justifyContent:
              "space-between",

            alignItems:
              "center"
          }}
        >

          <div>

            <h2
              style={{
                margin:0
              }}
            >
              Allocation History
            </h2>

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

          <button
            onClick={onClose}
          >
            Close
          </button>

        </div>

        {/* KPI */}

        <div
          style={{
            display:"grid",

            gridTemplateColumns:
              "repeat(4,1fr)",

            gap:"16px",

            marginTop:"24px"
          }}
        >

          <KPI
            title="Partners"
            value={
              filteredHistory.length
            }
          />

          <KPI
            title="Total Leads"
            value={totalLeads}
          />

          <KPI
            title="Admissions"
            value={
              totalAdmissions
            }
          />

          <KPI
            title="Conversion %"
            value={
              overallConversion +
              "%"
            }
          />

        </div>

        {/* FILTERS */}

        <div
          style={{
            display:"grid",

            gridTemplateColumns:
              "2fr 1fr",

            gap:"12px",

            marginTop:"24px"
          }}
        >

          <input
            placeholder=
              "Search Partner"

            value={
              partnerSearch
            }

            onChange={(e)=>
              setPartnerSearch(
                e.target.value
              )
            }
          />

          <select
            value={period}
            onChange={(e)=>
              setPeriod(
                e.target.value
              )
            }
          >

            <option value="all">
              All Time
            </option>

            <option value="today">
              Today
            </option>

            <option value="week">
              This Week
            </option>

            <option value="month">
              This Month
            </option>

          </select>

        </div>

        {/* TABLE */}

        <table
          style={{
            width:"100%",

            marginTop:"24px",

            borderCollapse:
              "collapse"
          }}
        >

          <thead>

            <tr>

              <th>
                Partner
              </th>

              <th>
                Total Leads
              </th>

              <th>
                Admissions
              </th>

              <th>
                Conversion %
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredHistory.map(
              row => (

                <tr
                  key={
                    row.partner_name
                  }
                >

                  <td>
                    {
                      row.partner_name
                    }
                  </td>

                  <td>
                    {
                      row.total_leads
                    }
                  </td>

                  <td>
                    {
                      row.admissions
                    }
                  </td>

                  <td>

                    <span
                      style={{
                        background:
                          row.conversion_percentage >= 50
                            ? "#DCFCE7"
                            : "#FEF3C7",

                        color:
                          row.conversion_percentage >= 50
                            ? "#166534"
                            : "#92400E",

                        padding:
                          "6px 10px",

                        borderRadius:
                          "999px",

                        fontWeight:
                          600
                      }}
                    >

                      {
                        row.conversion_percentage
                      }
                      %

                    </span>

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

function KPI({

  title,
  value

}: any) {

  return (

    <div
      style={{
        border:
          "1px solid #E5E7EB",

        borderRadius:
          "16px",

        padding:"20px"
      }}
    >

      <div
        style={{
          color:"#64748B"
        }}
      >
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
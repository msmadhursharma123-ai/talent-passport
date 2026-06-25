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
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 20,
    padding: 22,
    marginTop: 24,
    marginBottom: 24,
    boxShadow: "0 8px 24px rgba(15,23,42,.05)",
  }}
>
  <div
    style={{
      display: "flex",
      gap: 18,
      alignItems: "center",
      flexWrap: "wrap",
    }}
  >
    {/* Search */}

    <div
      style={{
        flex: 1,
        minWidth: 350,
        position: "relative",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 16,
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: 18,
        }}
      >
        🔍
      </span>

      <input
        placeholder="Search Partner..."
        value={partnerSearch}
        onChange={(e) =>
          setPartnerSearch(e.target.value)
        }
        style={{
          width: "100%",
          height: 50,
          padding: "0 18px 0 48px",
          borderRadius: 14,
          border: "1px solid #E2E8F0",
          background: "#F8FAFC",
          outline: "none",
          fontSize: 14,
          boxSizing: "border-box",
        }}
      />
    </div>

    {/* Period */}

    <div
      style={{
        width: 240,
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
        borderRadius: 16,
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#64748B",
          textTransform: "uppercase",
          letterSpacing: ".05em",
          marginBottom: 8,
        }}
      >
        📅 Time Period
      </div>

      <select
        value={period}
        onChange={(e) =>
          setPeriod(e.target.value)
        }
        style={{
          width: "100%",
          border: "none",
          background: "transparent",
          outline: "none",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
        }}
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

    {/* Reset */}

    <button
      onClick={() => {
        setPartnerSearch("");
        setPeriod("all");
      }}
      style={{
        height: 50,
        padding: "0 22px",
        borderRadius: 14,
        border: "1px solid #CBD5E1",
        background: "#F8FAFC",
        cursor: "pointer",
        fontWeight: 600,
        color: "#475569",
      }}
    >
      ↺ Reset
    </button>
  </div>
</div>

       {/* TABLE */}

<div
  style={{
    marginTop: 24,
    border: "1px solid #E2E8F0",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 8px 20px rgba(15,23,42,.05)",
  }}
>
  <table
    style={{
      width: "100%",
      borderCollapse: "collapse",
      tableLayout: "fixed",
    }}
  >
    <thead>
      <tr
        style={{
          background: "#F8FAFC",
          borderBottom: "2px solid #E2E8F0",
        }}
      >
        <th
          style={{
            width: "40%",
            padding: "18px 20px",
            textAlign: "left",
            fontSize: 13,
            color: "#475569",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: ".05em",
          }}
        >
          Partner
        </th>

        <th
          style={{
            width: "18%",
            padding: "18px 20px",
            textAlign: "center",
            fontSize: 13,
            color: "#475569",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          Total Leads
        </th>

        <th
          style={{
            width: "18%",
            padding: "18px 20px",
            textAlign: "center",
            fontSize: 13,
            color: "#475569",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          Admissions
        </th>

        <th
          style={{
            width: "24%",
            padding: "18px 20px",
            textAlign: "center",
            fontSize: 13,
            color: "#475569",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          Conversion %
        </th>
      </tr>
    </thead>

    <tbody>
      {filteredHistory.map((row) => (
        <tr
          key={row.partner_name}
          style={{
            borderBottom: "1px solid #F1F5F9",
            transition: ".2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#FAFCFF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#FFFFFF";
          }}
        >
          <td
            style={{
              padding: "18px 20px",
              fontWeight: 600,
              color: "#0F172A",
            }}
          >
            {row.partner_name}
          </td>

          <td
            style={{
              padding: "18px 20px",
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            {row.total_leads}
          </td>

          <td
            style={{
              padding: "18px 20px",
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            {row.admissions}
          </td>

          <td
            style={{
              padding: "18px 20px",
              textAlign: "center",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                justifyContent: "center",
                alignItems: "center",
                minWidth: 70,
                padding: "8px 14px",
                borderRadius: 999,
                background:
                  row.conversion_percentage >= 50
                    ? "#DCFCE7"
                    : row.conversion_percentage >= 25
                    ? "#DBEAFE"
                    : "#FEF3C7",
                color:
                  row.conversion_percentage >= 50
                    ? "#166534"
                    : row.conversion_percentage >= 25
                    ? "#1D4ED8"
                    : "#92400E",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {row.conversion_percentage}%
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>


</div>

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
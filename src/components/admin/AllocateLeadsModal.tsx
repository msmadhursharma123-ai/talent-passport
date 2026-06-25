import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  createLead
} from "../../data/partnerMarketplaceRepository";

import {
  getSupabaseClient
} from "../../supabaseClient";

interface Props {

  open: boolean;

  onClose: () => void;

  selectedStudents: any[];

  onSuccess: () => void;
}

export default function AllocateLeadsModal({

  open,

  onClose,

  selectedStudents,

  onSuccess

}: Props) {

  const [partners,
    setPartners] =
    useState<any[]>([]);

  const [search,
    setSearch] =
    useState("");

  const [activityFilter,
    setActivityFilter] =
    useState("All");

  const [areaFilter,
    setAreaFilter] =
    useState("All");

  const [selectedPartner,
    setSelectedPartner] =
    useState<any>(null);

  const [allocating,
    setAllocating] =
    useState(false);

  useEffect(() => {

    if (open) {

      loadPartners();
    }

  }, [open]);

  async function loadPartners() {

    const supabase =
      getSupabaseClient();

    if (!supabase) return;

    const {
      data
    } =
      await (supabase as any)
        .from("partners_master")
        .select("*")
        .order(
          "partner_name"
        );

    setPartners(
      data || []
    );
  }

  const specializations =
    Array.from(
      new Set(
        partners.flatMap(
          p =>
            Array.isArray(
              p.specialization
            )
              ? p.specialization
              : []
        )
      )
    );

  const areas =
    Array.from(
      new Set(
        partners.map(
          p =>
            p.institute_area
        )
      )
    );

  const filteredPartners =
    useMemo(() => {

      return partners.filter(
        partner => {

          const matchesSearch =

            (
              partner.partner_name ||
              ""
            )

            .toLowerCase()

            .includes(
              search.toLowerCase()
            );

          const matchesActivity =

            activityFilter ===
              "All"

            ||

            (
              partner.specialization
              || []
            )

            .includes(
              activityFilter
            );

          const matchesArea =

            areaFilter ===
              "All"

            ||

            partner.institute_area
            === areaFilter;

          return (

            matchesSearch &&
            matchesActivity &&
            matchesArea

          );
        }
      );

    }, [

      partners,

      search,

      activityFilter,

      areaFilter

    ]);

  async function allocateLeads() {

    if (!selectedPartner) {

      alert(
        "Please select a partner"
      );

      return;
    }

    setAllocating(true);

    try {

      for (
        const student of
        selectedStudents
      ) {

        await createLead({

          partner_id:
            selectedPartner.partner_id,

          partner_name:
            selectedPartner.partner_name,

          student_id:
            student.student_id,

          student_name:
            student.student_name,

          school_name:
            student.school_name,

          email:
            student.student_email,

          phone:
            student.phone,

          class_name:
            student.class_name,

          lead_source:
            "Admin Allocation",

          request_type:
            "Talent Discovery",

          status:
            "allocated"
        });
      }

      alert(
        `${selectedStudents.length} leads allocated successfully`
      );

      onSuccess();

      onClose();

    } catch (error) {

      console.error(error);

      alert(
        "Failed to allocate leads"
      );

    } finally {

      setAllocating(false);
    }
  }

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
              Allocate Leads
            </h2>

            <div
              style={{
                color:"#64748B",
                marginTop:"6px"
              }}
            >
              Selected Students:
              {" "}
              <strong>
                {
                  selectedStudents.length
                }
              </strong>
            </div>

          </div>

          <button
            onClick={onClose}
          >
            Close
          </button>

        </div>

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
  {/* Search */}

  <div
    style={{
      display: "flex",
      gap: 16,
      alignItems: "center",
      marginBottom: 20,
    }}
  >
    <div
      style={{
        flex: 1,
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
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          height: 50,
          padding: "0 18px 0 48px",
          borderRadius: 14,
          border: "1px solid #E2E8F0",
          background: "#F8FAFC",
          fontSize: 14,
          outline: "none",
        }}
      />
    </div>

    <button
      onClick={() => {
        setSearch("");
        setActivityFilter("All");
        setAreaFilter("All");
      }}
      style={{
        height: 50,
        padding: "0 20px",
        borderRadius: 14,
        border: "1px solid #CBD5E1",
        background: "#F8FAFC",
        cursor: "pointer",
        fontWeight: 600,
      }}
    >
      ↺ Reset
    </button>
  </div>

  {/* Filters */}

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(2,minmax(220px,1fr))",
      gap: 18,
    }}
  >
    {/* Activity */}

    <div
      style={{
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
        borderRadius: 16,
        padding: 16,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#64748B",
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: ".05em",
        }}
      >
        🎯 Specialization
      </div>

      <select
        value={activityFilter}
        onChange={(e) =>
          setActivityFilter(e.target.value)
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
        <option value="All">
          All Specializations
        </option>

        {specializations.map((spec) => (
          <option
            key={spec}
            value={spec}
          >
            {spec}
          </option>
        ))}
      </select>
    </div>

    {/* Area */}

    <div
      style={{
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
        borderRadius: 16,
        padding: 16,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#64748B",
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: ".05em",
        }}
      >
        📍 Area
      </div>

      <select
        value={areaFilter}
        onChange={(e) =>
          setAreaFilter(e.target.value)
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
        <option value="All">
          All Areas
        </option>

        {areas.map((area) => (
          <option
            key={area}
            value={area}
          >
            {area}
          </option>
        ))}
      </select>
    </div>
  </div>
</div>

       <div
  style={{
    marginTop: 24,
    border: "1px solid #E2E8F0",
    borderRadius: 16,
    overflow: "hidden",
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
      borderBottom: "1px solid #E2E8F0",
    }}
  >
    <th style={headerStyle}>Select</th>

    <th
      style={{
        ...headerStyle,
        width: 280,
      }}
    >
      Partner
    </th>

    <th style={headerStyle}>
      Category
    </th>

    <th
      style={{
        ...headerStyle,
        width: 260,
      }}
    >
      Specialization
    </th>

    <th style={headerStyle}>
      Age Range
    </th>

    <th style={headerStyle}>
      Area
    </th>
  </tr>
</thead>

          <tbody>

            {filteredPartners.map(
              partner => (

                <tr
  key={partner.partner_id}
  style={{
    borderBottom: "1px solid #F1F5F9",
  }}
>
                

                  <td
  style={{
    padding: "18px 16px",
    verticalAlign: "top",
  }}
>

                    <input
                      type="radio"
                      checked={
                        selectedPartner
                          ?.partner_id ===
                        partner.partner_id
                      }
                      onChange={() =>
                        setSelectedPartner(
                          partner
                        )
                      }
                    />

                  </td>

                  <td
  style={{
    padding: "18px 16px",
    verticalAlign: "top",
  }}
>
                    {
                      partner.partner_name
                    }
                  </td>

                  <td
  style={{
    padding: "18px 16px",
    verticalAlign: "top",
  }}
>
                    {
                      partner.category
                    }
                  </td>

                  <td
  style={{
    padding: "18px 16px",
    verticalAlign: "top",
  }}
>

                    {Array.isArray(
                      partner.specialization
                    )
                      ? partner.specialization.join(
                          ", "
                        )
                      : "-"}

                  </td>

                  <td
  style={{
    padding: "18px 16px",
    verticalAlign: "top",
  }}
>

                    {
                      partner.preferred_age_from
                    }

                    {" - "}

                    {
                      partner.preferred_age_to
                    }

                  </td>

                  <td
  style={{
    padding: "18px 16px",
    verticalAlign: "top",
  }}
>
                    {
                      partner.institute_area
                    }
                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>
</div>

        <div
          style={{
            display:"flex",
            justifyContent:
              "flex-end",
            marginTop:"24px"
          }}
        >

          <button
            onClick={
              allocateLeads
            }
            disabled={
              allocating
            }
            style={{
              background:
                "#143B73",
              color:"white",
              border:"none",
              padding:
                "12px 24px",
              borderRadius:
                "12px",
              cursor:"pointer"
            }}
          >

            {allocating
              ? "Allocating..."
              : "Allocate Selected Leads"}

          </button>

        </div>

      </div>

    </div>
  );
}

const headerStyle: React.CSSProperties = {
  padding: "16px",
  textAlign: "left",
  background: "#F8FAFC",
  color: "#475569",
  fontWeight: 700,
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: ".05em",
  borderBottom: "1px solid #E2E8F0",
};
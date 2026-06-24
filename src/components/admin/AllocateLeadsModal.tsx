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
            display:"grid",
            gridTemplateColumns:
              "repeat(4,1fr)",
            gap:"12px",
            marginTop:"24px"
          }}
        >

          <input
            placeholder=
              "Search Partner"
            value={search}
            onChange={(e)=>
              setSearch(
                e.target.value
              )
            }
          />

          <select
            value={
              activityFilter
            }
            onChange={(e)=>
              setActivityFilter(
                e.target.value
              )
            }
          >

            <option>
              All
            </option>

            {specializations.map(
              spec => (

                <option
                  key={spec}
                >
                  {spec}
                </option>

              )
            )}

          </select>

          <select
            value={
              areaFilter
            }
            onChange={(e)=>
              setAreaFilter(
                e.target.value
              )
            }
          >

            <option>
              All
            </option>

            {areas.map(
              area => (

                <option
                  key={area}
                >
                  {area}
                </option>

              )
            )}

          </select>

        </div>

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
                Select
              </th>

              <th>
                Partner
              </th>

              <th>
                Category
              </th>

              <th>
                Specialization
              </th>

              <th>
                Age Range
              </th>

              <th>
                Area
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredPartners.map(
              partner => (

                <tr
                  key={
                    partner.partner_id
                  }
                >

                  <td>

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

                    {Array.isArray(
                      partner.specialization
                    )
                      ? partner.specialization.join(
                          ", "
                        )
                      : "-"}

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
                    {
                      partner.institute_area
                    }
                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

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
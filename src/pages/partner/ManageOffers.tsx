import React,
{
  useEffect,
  useState
}
from "react";

import {
  fetchPartnerScholarshipOffers,
  fetchPartnerWorkshopOffers,
  fetchPartnerContactRequests
}
from "../../data/partnerMarketplaceRepository";

export default function ManageOffers() {

  const [scholarships,
    setScholarships] =
    useState<any[]>([]);

  const [workshops,
    setWorkshops] =
    useState<any[]>([]);

  const [contacts,
    setContacts] =
    useState<any[]>([]);

  const [typeFilter,
    setTypeFilter] =
    useState("All");

  const [statusFilter,
    setStatusFilter] =
    useState("All");

  useEffect(() => {
    loadData();
  }, []);

  async function
  loadData() {

    const scholarshipData =
      await fetchPartnerScholarshipOffers(
        "partner_demo"
      );

    const workshopData =
      await fetchPartnerWorkshopOffers(
        "partner_demo"
      );

    const contactData =
      await fetchPartnerContactRequests(
        "partner_demo"
      );

    setScholarships(
      scholarshipData || []
    );

    setWorkshops(
      workshopData || []
    );

    setContacts(
      contactData || []
    );
  }

  const pipeline = [

    ...scholarships.map(
      x => ({
        ...x,
        type:"Scholarship"
      })
    ),

    ...workshops.map(
      x => ({
        ...x,
        type:"Workshop"
      })
    ),

    ...contacts.map(
      x => ({
        ...x,
        type:"Contact"
      })
    )

  ];

  const filtered =
    pipeline.filter(item => {

      if (
        typeFilter !== "All" &&
        item.type !== typeFilter
      ) {
        return false;
      }

      if (
        statusFilter !== "All" &&
        item.status !== statusFilter
      ) {
        return false;
      }

      return true;
    });

  return (

    <div>

      <div
        style={{
          background:
            "linear-gradient(135deg,#0F172A,#1E293B)",
          color:"white",
          padding:"40px",
          borderRadius:"24px",
          marginBottom:"25px"
        }}
      >

        <div
          style={{
            color:"#F59E0B",
            fontWeight:700,
            letterSpacing:2
          }}
        >
          PARTNER CRM
        </div>

        <h1>
          Manage Offers
        </h1>

        <p>
          Manage scholarships,
          workshops and contact
          requests sent to students.
        </p>

      </div>

      {/* KPI */}

      <div
        style={{
          display:"grid",
          gridTemplateColumns:
          "repeat(7,1fr)",
          gap:"16px",
          marginBottom:"25px"
        }}
      >

        <StatCard
          title="Scholarships"
          value={
            scholarships.length
          }
        />

        <StatCard
          title="Workshops"
          value={
            workshops.length
          }
        />

        <StatCard
          title="Contacts"
          value={
            contacts.length
          }
        />

        <StatCard
          title="Pending"
          value={
            pipeline.filter(
              x =>
                x.status ===
                "pending"
            ).length
          }
        />

        <StatCard
          title="Accepted"
          value={
            pipeline.filter(
              x =>
                x.status ===
                "accepted"
            ).length
          }
        />

        <StatCard
          title="Rejected"
          value={
            pipeline.filter(
              x =>
                x.status ===
                "rejected"
            ).length
          }
        />

        <StatCard
          title="Expired"
          value={0}
        />

      </div>

      {/* FILTERS */}

      <div
        style={{
          background:"white",
          padding:"24px",
          borderRadius:"20px",
          marginBottom:"20px",
          display:"flex",
          gap:"20px"
        }}
      >

        <select
          value={typeFilter}
          onChange={(e)=>
            setTypeFilter(
              e.target.value
            )
          }
        >
          <option>
            All
          </option>

          <option>
            Scholarship
          </option>

          <option>
            Workshop
          </option>

          <option>
            Contact
          </option>

        </select>

        <select
          value={statusFilter}
          onChange={(e)=>
            setStatusFilter(
              e.target.value
            )
          }
        >
          <option>
            All
          </option>

          <option>
            pending
          </option>

          <option>
            accepted
          </option>

          <option>
            rejected
          </option>
        </select>

      </div>

      {/* TABLE */}

      <div
        style={{
          background:"white",
          borderRadius:"24px",
          overflow:"hidden"
        }}
      >

        <table
          style={{
            width:"100%"
          }}
        >

          <thead>

            <tr>

              <th>Type</th>
              <th>Student</th>
              <th>School</th>
              <th>Status</th>
              <th>Actions</th>

            </tr>

          </thead>

          <tbody>

            {filtered.map(
              item => (

                <tr
                  key={item.id}
                >

                  <td>
                    {item.type}
                  </td>

                  <td>
                    {
                      item.student_name
                    }
                  </td>

                  <td>
                    {
                      item.school_name
                    }
                  </td>

                  <td>
                    {
                      item.status
                    }
                  </td>

                  <td>

                    <button>
                      View
                    </button>

                    <button>
                      Send Again
                    </button>

                    <button>
                      Discard
                    </button>

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

function StatCard(
{
  title,
  value
}: any
) {

  return (

    <div
      style={{
        background:"white",
        padding:"20px",
        borderRadius:"20px",
        border:
          "1px solid #E5E7EB"
      }}
    >

      <div>
        {title}
      </div>

      <div
        style={{
          fontSize:"32px",
          fontWeight:700
        }}
      >
        {value}
      </div>

    </div>

  );
}
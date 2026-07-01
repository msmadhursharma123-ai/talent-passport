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

  async function
  handleAccept(
    request: any
  ) {

    try {

      setLoading(true);

      await updateRequestStatus(
        request.id,
        "accepted"
      );

console.log("INCOMING REQUEST ACCEPT");
console.table({
  email: request.email,
  phone: request.phone,
  class_name: request.class_name,
  partner_uuid: request.partner_uuid,
  student_id: request.student_id,
});

      const lead =
      await createLead({

    partner_id: request.partner_id,

    partner_uuid: request.partner_uuid,

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

      console.log(
        "Lead Created",
        lead
      );

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
          Incoming Requests
        </h1>

        <p>
          Review and convert
          student requests
          into CRM leads.
        </p>

      </div>

      {/* TABLE */}

      <div
        style={{
          background:
            "white",
          borderRadius:
            "20px",
          overflow:
            "hidden",
          border:
            "1px solid #E5E7EB"
        }}
      >

        <table
          style={{
            width:
              "100%",
            borderCollapse:
              "collapse"
          }}
        >

          <thead>

            <tr
              style={{
                background:
                  "#F8FAFC"
              }}
            >

              <th style={{ padding:"16px", textAlign:"left" }}>
                Type
              </th>

              <th style={{ padding:"16px", textAlign:"left" }}>
                Name
              </th>

              <th style={{ padding:"16px", textAlign:"left" }}>
                School
              </th>

              <th style={{ padding:"16px", textAlign:"left" }}>
                Status
              </th>

              <th style={{ padding:"16px", textAlign:"left" }}>
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {requests.map(
              (
                request: any
              ) => (

                <tr
                  key={
                    request.id
                  }
                >

                  <td style={{ padding:"16px" }}>
                    {request.request_type}
                  </td>

                  <td style={{ padding:"16px" }}>
                    {request.requester_name}
                  </td>

                  <td style={{ padding:"16px" }}>
                    {request.school_name}
                  </td>

                  <td style={{ padding:"16px" }}>

                    <span
                      style={{
                        padding:
                          "6px 12px",
                        borderRadius:
                          "999px",
                        background:
                          getStatusColor(
                            request.status
                          )
                      }}
                    >
                      {request.status}
                    </span>

                  </td>

                  <td style={{ padding:"16px" }}>

                    <button
                      onClick={() =>
                        setSelectedRequest(
                          request
                        )
                      }
                    >
                      View
                    </button>

                    {" "}

                    {request.status ===
                      "pending" && (

                      <>
                        <button
                          disabled={
                            loading
                          }
                          onClick={() =>
                            handleAccept(
                              request
                            )
                          }
                        >
                          Accept
                        </button>

                        {" "}

                        <button
                          onClick={() =>
                            handleReject(
                              request
                            )
                          }
                        >
                          Reject
                        </button>
                      </>
                    )}

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

      {/* DETAIL MODAL */}

      {selectedRequest && (

        <div
          style={{
            position:
              "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,.5)",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center"
          }}
        >

          <div
            style={{
              width:
                "600px",
              background:
                "white",
              borderRadius:
                "20px",
              padding:
                "24px"
            }}
          >

            <h2>
              Request Details
            </h2>

            <p>
              <b>Name:</b>{" "}
              {selectedRequest.requester_name}
            </p>

            <p>
              <b>Email:</b>{" "}
              {selectedRequest.email}
            </p>

            <p>
              <b>Phone:</b>{" "}
              {selectedRequest.phone}
            </p>

            <p>
              <b>School:</b>{" "}
              {selectedRequest.school_name}
            </p>

            <p>
              <b>Message:</b>{" "}
              {selectedRequest.message}
            </p>

            <button
              onClick={() =>
                setSelectedRequest(
                  null
                )
              }
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>

  );
}
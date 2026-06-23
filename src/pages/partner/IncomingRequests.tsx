import React,
{
  useEffect,
  useState
}
from "react";

import {
  fetchIncomingRequests
}
from "../../data/partnerMarketplaceRepository";

export default function IncomingRequests() {

  const [
    requests,
    setRequests
  ] =
    useState<any[]>([]);

  useEffect(() => {
    loadRequests();
  }, []);

  async function
  loadRequests() {

    const data =
      await fetchIncomingRequests(
        "partner_demo"
      );

    setRequests(
      data || []
    );
  }

  return (

    <div>

      <div
        style={{
          background:
            "linear-gradient(135deg,#0F172A,#1E293B)",
          color:"white",
          padding:"32px",
          borderRadius:"24px",
          marginBottom:"24px"
        }}
      >

        <div
          style={{
            color:"#F59E0B",
            fontWeight:700,
            letterSpacing:2
          }}
        >
          PARTNER INBOX
        </div>

        <h1>
          Incoming Requests
        </h1>

        <p>
          Manage requests from
          students, parents
          and schools.
        </p>

      </div>

      <div
        style={{
          background:"white",
          borderRadius:"20px",
          overflow:"hidden",
          border:
            "1px solid #E5E7EB"
        }}
      >

        <table
          style={{
            width:"100%",
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

              <th
                style={{
                  padding:"16px",
                  textAlign:"left"
                }}
              >
                Type
              </th>

              <th
                style={{
                  padding:"16px",
                  textAlign:"left"
                }}
              >
                From
              </th>

              <th
                style={{
                  padding:"16px",
                  textAlign:"left"
                }}
              >
                School
              </th>

              <th
                style={{
                  padding:"16px",
                  textAlign:"left"
                }}
              >
                Status
              </th>

              <th
                style={{
                  padding:"16px",
                  textAlign:"left"
                }}
              >
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {requests.map(
              request => (

                <tr
                  key={
                    request.id
                  }
                >

                  <td
                    style={{
                      padding:"16px"
                    }}
                  >
                    {
                      request.request_type
                    }
                  </td>

                  <td
                    style={{
                      padding:"16px"
                    }}
                  >
                    {
                      request.requester_name
                    }
                  </td>

                  <td
                    style={{
                      padding:"16px"
                    }}
                  >
                    {
                      request.school_name
                    }
                  </td>

                  <td
                    style={{
                      padding:"16px"
                    }}
                  >
                    {
                      request.status
                    }
                  </td>

                  <td
                    style={{
                      padding:"16px"
                    }}
                  >

                    <button>
                      View
                    </button>

                    {" "}

                    <button>
                      Accept
                    </button>

                    {" "}

                    <button>
                      Reject
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

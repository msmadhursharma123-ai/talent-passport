import React,{
  useEffect,
  useMemo,
  useState
} from "react";

import {
  requireIdentity,
  getStudentUuid
} from "../../services/identityService";

import {
  fetchPartners,
  fetchStudentScholarshipOffers,
  fetchStudentWorkshopOffers,
  fetchStudentContactRequests,
  fetchStudentRequests,
  createIncomingRequest,
  acceptScholarshipOffer,
  rejectScholarshipOffer,
  acceptWorkshopOffer,
  rejectWorkshopOffer,
  acceptContactOffer,
  rejectContactOffer,
  createMarketplaceActivity,
  fetchMarketplaceActivity,
  withdrawApplication
}
from "../../data/partnerMarketplaceRepository";

type InboxOffer = {
  id: string;

  type:
    | "Scholarship"
    | "Workshop"
    | "Contact";

  status?: string;

  partner_name?: string;

  offer_title?: string;

  workshop_title?: string;

  description?: string;

  offer_description?: string;

  workshop_description?: string;

  request_reason?: string;

  benefits?: string;

  scholarship_value?: number | string;
};

export default function MaukePeChauka() {

 const identity =
  requireIdentity();

const studentId =
  getStudentUuid();

  const [loading, setLoading] =
    useState(true);

  const [partners, setPartners] =
    useState<any[]>([]);

  const [offers, setOffers] =
    useState<InboxOffer[]>([]);

const [
  selectedOffer,
  setSelectedOffer
] = useState<any>(null);

const [
  selectedActivity,
  setSelectedActivity
] = useState<any>(null);

const [
  showActivityDetails,
  setShowActivityDetails
] = useState(false);

const [
  showOfferDetails,
  setShowOfferDetails
] = useState(false);

const [
  partnerSearch,
  setPartnerSearch
] = useState("");

  const [requests, setRequests] =
    useState<any[]>([]);

  const [selectedPartner,
    setSelectedPartner] =
    useState<any>(null);

  const [requestType,
    setRequestType] =
    useState("");

  const [message,
    setMessage] =
    useState("");

    const [
  activity,
  setActivity
] = useState<any[]>([]);

  const [showRequestDialog,
    setShowRequestDialog] =
    useState(false);

const [
  timelineFilter,
  setTimelineFilter
] = useState("all");

  useEffect(() => {
    loadMarketplace();
  }, []);

  async function loadMarketplace() {

    setLoading(true);

 const [
  partnerData,
  scholarshipOffers,
  workshopOffers,
  contactOffers,
  requestData,
  activityData
] = await Promise.all([
  fetchPartners(),
  fetchStudentScholarshipOffers(
    studentId
  ),
  fetchStudentWorkshopOffers(
    studentId
  ),
  fetchStudentContactRequests(
    studentId
  ),
  fetchStudentRequests(
    studentId
  ),
  fetchMarketplaceActivity(
    studentId
  )
]);

    const mergedOffers = [

      ...(scholarshipOffers || [])
        .map((item: any) => ({
          ...item,
          type: "Scholarship"
        })),

      ...(workshopOffers || [])
        .map((item: any) => ({
          ...item,
          type: "Workshop"
        })),

      ...(contactOffers || [])
        .map((item: any) => ({
          ...item,
          type: "Contact"
        }))
    ];

    setPartners(
      partnerData || []
    );

   setOffers(
  mergedOffers.filter(
    (item:any) =>
      item.status !== "accepted" &&
      item.status !== "rejected"
  )
);

const acceptedOffers =
  mergedOffers.filter(
    (item:any)=>
      item.status === "accepted"
  );

setRequests([
  ...(requestData || [])
      .filter(
        (item:any)=>
          !item.withdrawn
      ),

  ...acceptedOffers
]);

setActivity(
  activityData || []
);

setLoading(false);

}

const filteredActivity =
  useMemo(() => {

    if (
      timelineFilter ===
      "all"
    ) {
      return activity;
    }

    return activity.filter(
      (item) => {

        const status =
          (
            item.status || ""
          ).toLowerCase();

        const type =
          (
            item.activity_type || ""
          ).toLowerCase();

        switch (
          timelineFilter
        ) {

          case "incoming":
            return (
              type.includes(
                "offer"
              )
            );

          case "outgoing":
            return (
              type.includes(
                "request"
              )
            );

          case "accepted":
            return (
              status ===
              "accepted"
            );

          case "rejected":
            return (
              status ===
              "rejected"
            );

          case "withdrawn":
            return (
              status ===
              "withdrawn"
            );

          case "pending":
            return (
              status ===
              "pending"
            );

          default:
            return true;
        }
      }
    );

  }, [
    activity,
    timelineFilter
  ]);

const opportunityIndex =
  useMemo(() => {

      const scores =
        JSON.parse(
          localStorage.getItem(
            "talentScores"
          ) || "{}"
        );

      const values =
        Object.values(
          scores || {}
        ) as number[];

      if (!values.length)
        return 72;

      return Math.round(
        values.reduce(
          (a, b) => a + b,
          0
        ) / values.length
      );

    }, []);

async function handleRequest() {

  if (!selectedPartner)
    return;

  const identity =
    requireIdentity();

  console.log(
    "STUDENT IDENTITY",
    identity
  );

  console.log(
    "PHONE VALUE",
    identity.parentPhone
  );

  await createIncomingRequest({

    partner_id:
      selectedPartner.partner_id,

    partner_name:
      selectedPartner.institute_name,

    student_id:
      getStudentUuid(),

    requester_name:
      identity.studentName,

    school_name:
      identity.schoolName,

    email:
      identity.parentEmail,

    phone:
      identity.parentPhone,

    class_name:
      identity.className,

    request_type:
      requestType,

    request_from:
      "student",

    message

  });

  await createMarketplaceActivity({

    student_id:
      getStudentUuid(),

    activity_type:
      "request",

    activity_title:
      `${requestType} Request Submitted`,

    partner_id:
      selectedPartner.partner_id,

    partner_name:
      selectedPartner.institute_name,

    status:
      "submitted",

    metadata: {
      requestType
    }

  });

  setShowRequestDialog(
    false
  );

  setMessage("");

  await loadMarketplace();

}

async function handleWithdraw(
  requestId: string,
  partnerName: string
) {

  const confirmed =
    window.confirm(
      "Withdraw this application?"
    );

  if (!confirmed)
    return;

  await withdrawApplication(
    requestId
  );

  await createMarketplaceActivity({

    student_id:
      getStudentUuid(),

    activity_type:
      "withdrawn",

    activity_title:
      "Application Withdrawn",

    partner_id: "",

    partner_name:
      partnerName,

    status:
      "withdrawn",

    metadata: {}

  });

  await loadMarketplace();

}


  
 async function handleOfferAction(
  offer: InboxOffer,
  action:
    "accept" | "reject"
) {

  if (
    offer.type ===
    "Scholarship"
  ) {

    if (
      action ===
      "accept"
    ) {

      await acceptScholarshipOffer(
        offer.id
      );

      await createMarketplaceActivity({

        student_id:
          getStudentUuid(),

        activity_type:
          "offer",

        activity_title:
          "Scholarship Accepted",

        partner_id:
          "",

        partner_name:
          offer.partner_name ||
          "",

        status:
          "accepted"

      });

    } else {

      await rejectScholarshipOffer(
        offer.id
      );

      await createMarketplaceActivity({

        student_id:
          getStudentUuid(),

        activity_type:
          "offer",

        activity_title:
          "Scholarship Rejected",

        partner_id:
          "",

        partner_name:
          offer.partner_name ||
          "",

        status:
          "rejected"

      });

    }

  }

  if (
    offer.type ===
    "Workshop"
  ) {

    if (
      action ===
      "accept"
    ) {

      await acceptWorkshopOffer(
        offer.id
      );

    } else {

      await rejectWorkshopOffer(
        offer.id
      );

    }

  }

  if (
    offer.type ===
    "Contact"
  ) {

    if (
      action ===
      "accept"
    ) {

      await acceptContactOffer(
        offer.id
      );

    } else {

      await rejectContactOffer(
        offer.id
      );

    }

  }

  await loadMarketplace();

}

  return (

    <div
      style={{
        padding: 24,
        background:
          "#F5F7F8",
        minHeight:
          "100vh"
      }}
    >

      {/* HERO */}

      <div
        style={{
          background:
            "#ffffff",
          borderRadius: 24,
          padding: 32,
          color: "#000000",
          marginBottom: 24
        }}
      >

        <div
          style={{
            fontSize: 13,
            letterSpacing: 2,
            color: "#F4A623",
            fontWeight: 700
          }}
        >
          TALENT OPPORTUNITY MARKETPLACE
        </div>

        <h1
          style={{
            fontSize: 42,
            marginTop: 10,
            marginBottom: 10
          }}
        >
          🎯 Mauke Pe Chauka
        </h1>

        <div
          style={{
            color: "#000000",
            fontSize: 16
          }}
        >
          Connect with scholarships,
          workshops, institutions,
          academies and talent partners.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4,1fr)",
            gap: 18,
            marginTop: 28
          }}
        >

          <div
            style={{
              background:
                "rgba(255, 255, 255, 0.08)",
              borderRadius: 18,
              padding: 18
            }}
          >
            <div>
              Active Partners
            </div>

            <div
              style={{
                fontSize: 34,
                fontWeight: 700
              }}
            >
              {partners.length}
            </div>
          </div>

          <div
            style={{
              background:
                "rgba(255,255,255,.08)",
              borderRadius: 18,
              padding: 18
            }}
          >
            <div>
              Invitations
            </div>

            <div
              style={{
                fontSize: 34,
                fontWeight: 700
              }}
            >
              {offers.length}
            </div>
          </div>

          <div
            style={{
              background:
                "rgba(255,255,255,.08)",
              borderRadius: 18,
              padding: 18
            }}
          >
            <div>
              Applications
            </div>

            <div
              style={{
                fontSize: 34,
                fontWeight: 700
              }}
            >
              {requests.length}
            </div>
          </div>

          <div
            style={{
              background:
                "#FF6B00",
              borderRadius: 18,
              padding: 18
            }}
          >
            <div>
              Opportunity Index
            </div>

            <div
              style={{
                fontSize: 34,
                fontWeight: 700
              }}
            >
              {opportunityIndex}
            </div>
          </div>

        </div>
      </div>

      {/* INVITATION INBOX */}

<div
  style={{
    background:"#FFF",
    borderRadius:24,
    padding:24,
    marginBottom:24
  }}
>

  <h2
    style={{
      color:"#143B73"
    }}
  >
    📩 Invitation Inbox
  </h2>

  {offers.length === 0 ? (

    <div
      style={{
        padding:30,
        textAlign:"center",
        color:"#64748B"
      }}
    >
      No invitations received yet.
    </div>

  ) : (

    <div
      style={{
        display:"flex",
        gap:16,
        overflowX:"auto",
        paddingBottom:10
      }}
    >

      {offers.map((offer)=>{

        const isCompleted =
          offer.status === "accepted" ||
          offer.status === "rejected";

        return (

          <div
            key={offer.id}
            style={{
              minWidth:360,
              border:"1px solid #E5E7EB",
              borderRadius:18,
              padding:20,
              background:"#FAFAFA"
            }}
          >

            <div
              style={{
                display:"flex",
                justifyContent:"space-between"
              }}
            >

              <div>

                <div
                  style={{
                    fontWeight:700,
                    fontSize:18
                  }}
                >
                  {
                    offer.offer_title ||
                    offer.workshop_title ||
                    "Contact Request"
                  }
                </div>

                <div
                  style={{
                    color:"#64748B",
                    marginTop:4
                  }}
                >
                  {offer.partner_name}
                </div>

              </div>

              <div
                style={{
                  background:"#EFF6FF",
                  color:"#1D4ED8",
                  padding:"6px 12px",
                  borderRadius:999
                }}
              >
                {offer.type}
              </div>

            </div>

            <div
              style={{
                marginTop:14,
                display:"flex",
                gap:10,
                flexWrap:"wrap"
              }}
            >

              <button
                onClick={()=>{
                  setSelectedOffer(
                    offer
                  );
                  setShowOfferDetails(
                    true
                  );
                }}
                style={{
                  background:"#143B73",
                  color:"#FFF",
                  border:"none",
                  borderRadius:10,
                  padding:"10px 14px",
                  cursor:"pointer"
                }}
              >
                View
              </button>

              {!isCompleted && (

                <>
                  <button
                    onClick={()=>
                      handleOfferAction(
                        offer,
                        "accept"
                      )
                    }
                    style={{
                      background:"#16A34A",
                      color:"#FFF",
                      border:"none",
                      borderRadius:10,
                      padding:"10px 14px"
                    }}
                  >
                    Accept
                  </button>

                  <button
                    onClick={()=>
                      handleOfferAction(
                        offer,
                        "reject"
                      )
                    }
                    style={{
                      background:"#DC2626",
                      color:"#FFF",
                      border:"none",
                      borderRadius:10,
                      padding:"10px 14px"
                    }}
                  >
                    Reject
                  </button>
                </>
              )}

              {isCompleted && (

                <div
                  style={{
                    background:
                      offer.status === "accepted"
                      ? "#DCFCE7"
                      : "#FEE2E2",

                    color:
                      offer.status === "accepted"
                      ? "#166534"
                      : "#991B1B",

                    padding:"10px 14px",
                    borderRadius:10,
                    fontWeight:700
                  }}
                >
               {(offer.status || "").toUpperCase()}
                </div>

              )}

            </div>

          </div>

        );

      })}

    </div>

  )}

</div>

      {/* PARTNER DIRECTORY */}

      <div
        style={{
          background: "#FFF",
          borderRadius: 24,
          padding: 24,
          marginBottom: 24
        }}
      >

<input
  value={partnerSearch}
  onChange={(e)=>
    setPartnerSearch(
      e.target.value
    )
  }
  placeholder="Search Partner..."
  style={{
    width:"100%",
    padding:"14px",
    borderRadius:12,
    border:"1px solid #CBD5E1",
    marginBottom:20
  }}
/>

        <h2
          style={{
            color: "#143B73",
            marginBottom: 20
          }}
        >
          🏢 Explore Partners
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill,minmax(320px,1fr))",
            gap: 20
          }}
        >

          {partners
.filter((partner)=>
  partner.institute_name
    ?.toLowerCase()
    .includes(
      partnerSearch.toLowerCase()
    )
)
.map((partner) => (

            <div
              key={partner.id}
              style={{
                background: "#FFFFFF",
                border:
                  "1px solid #E5E7EB",
                borderRadius: 20,
                padding: 20
              }}
            >

              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#143B73"
                }}
              >
                {partner.institute_name}
              </div>

              <div
                style={{
                  marginTop: 10,
                  color: "#64748B"
                }}
              >
                📍 {partner.institute_city}
              </div>

              <div
                style={{
                  marginTop: 6,
                  color: "#64748B"
                }}
              >
                🎯 {partner.skill_focus}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 18,
                  flexWrap: "wrap"
                }}
              >

                <button
                  onClick={() => {
                    setSelectedPartner(
                      partner
                    );
                    setRequestType(
                      "Scholarship"
                    );
                    setShowRequestDialog(
                      true
                    );
                  }}
                  style={{
                    background:
                      "#FF6B00",
                    color: "#FFF",
                    border: "none",
                    borderRadius: 10,
                    padding:
                      "10px 14px",
                    cursor: "pointer"
                  }}
                >
                  Request Scholarship
                </button>

                <button
                  onClick={() => {
                    setSelectedPartner(
                      partner
                    );
                    setRequestType(
                      "Workshop"
                    );
                    setShowRequestDialog(
                      true
                    );
                  }}
                  style={{
                    background:
                      "#143B73",
                    color: "#FFF",
                    border: "none",
                    borderRadius: 10,
                    padding:
                      "10px 14px",
                    cursor: "pointer"
                  }}
                >
                  Request Workshop
                </button>

                <button
                  onClick={() => {
                    setSelectedPartner(
                      partner
                    );
                    setRequestType(
                      "Contact"
                    );
                    setShowRequestDialog(
                      true
                    );
                  }}
                  style={{
                    background:
                      "#F3F4F6",
                    color: "#111827",
                    border: "none",
                    borderRadius: 10,
                    padding:
                      "10px 14px",
                    cursor: "pointer"
                  }}
                >
                  Request Callback
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* MY APPLICATIONS */}

<div
  style={{
    background:"#FFF",
    borderRadius:24,
    padding:24,
    marginBottom:24
  }}
>

  <h2
    style={{
      color:"#143B73"
    }}
  >
    📋 My Applications
  </h2>

  {requests.length === 0 ? (

    <div
      style={{
        padding:20,
        color:"#64748B"
      }}
    >
      No applications found.
    </div>

  ) : (

    requests.map((request:any)=>{

      const incoming =
        !request.request_from;

      return (

        <div
          key={request.id}
          style={{
            border:"1px solid #E5E7EB",
            borderRadius:16,
            padding:18,
            marginTop:12,
            background:"#FFF"
          }}
        >

          <div
            style={{
              display:"flex",
              justifyContent:"space-between"
            }}
          >

            <div>

              <div
                style={{
                  display:"flex",
                  gap:10,
                  marginBottom:8
                }}
              >

                <div
                  style={{
                    background:
                      incoming
                      ? "#DCFCE7"
                      : "#DBEAFE",

                    color:
                      incoming
                      ? "#166534"
                      : "#1D4ED8",

                    padding:"4px 10px",
                    borderRadius:999,
                    fontSize:11,
                    fontWeight:700
                  }}
                >
                  {
                    incoming
                    ? "INCOMING"
                    : "OUTGOING"
                  }
                </div>

              </div>

              <div
                style={{
                  fontWeight:700,
                  fontSize:18
                }}
              >
                {request.partner_name}
              </div>

              <div
                style={{
                  color:"#64748B",
                  marginTop:4
                }}
              >
                {
                  request.request_type ||
                  request.type
                }
              </div>

            </div>

            <div
              style={{
                background:"#FEF3C7",
                color:"#92400E",
                padding:"6px 12px",
                borderRadius:999,
                fontWeight:700
              }}
            >
              {
                request.status ||
                "accepted"
              }
            </div>

          </div>

          <div
            style={{
              display:"flex",
              gap:10,
              marginTop:15
            }}
          >

            <button
              onClick={()=>{
                setSelectedActivity(
                  request
                );
                setShowActivityDetails(
                  true
                );
              }}
              style={{
                background:"#143B73",
                color:"#FFF",
                border:"none",
                borderRadius:8,
                padding:"8px 12px"
              }}
            >
              View
            </button>

            {!incoming && (

              <button
                onClick={()=>
                  handleWithdraw(
                    request.id,
                    request.partner_name
                  )
                }
                style={{
                  background:"#FEE2E2",
                  color:"#B91C1C",
                  border:"none",
                  borderRadius:8,
                  padding:"8px 12px"
                }}
              >
                Withdraw
              </button>

            )}

          </div>

        </div>

      );

    })

  )}

</div>

<div
  style={{
    background:"#FFF",
    borderRadius:24,
    padding:24,
    marginBottom:24
  }}
>

  <div
    style={{
      display:"flex",
      justifyContent:"space-between",
      alignItems:"center",
      marginBottom:20
    }}
  >

    <h2
      style={{
        color:"#143B73",
        margin:0
      }}
    >
      📈 Opportunity Timeline
    </h2>

<select
  value={timelineFilter}
  onChange={(e)=>
    setTimelineFilter(
      e.target.value
    )
  }
  style={{
    padding:"10px 12px",
    borderRadius:10,
    border:"1px solid #CBD5E1"
  }}
>

  <option value="all">
    All Activities
  </option>

  <option value="incoming">
    Incoming
  </option>

  <option value="outgoing">
    Outgoing
  </option>

  <option value="accepted">
    Accepted
  </option>

  <option value="rejected">
    Rejected
  </option>

  <option value="withdrawn">
    Withdrawn
  </option>

</select>

</div>

   {
  filteredActivity.length === 0
  ? (

    <div
      style={{
        padding:20,
        color:"#64748B"
      }}
    >
      No activity found.
    </div>

  )
  : (

    <div
      style={{
        display:"flex",
        flexDirection:"column",
        gap:14
      }}
    >

      {filteredActivity.map(
        (item:any)=>{

          const status =
            (
              item.status || ""
            ).toLowerCase();

          const incoming =
            item.activity_type ===
            "offer";

          return (

            <div
              key={item.id}
              style={{
                border:
                  "1px solid #E5E7EB",
                borderRadius:16,
                padding:18
              }}
            >

              <div
                style={{
                  display:"flex",
                  justifyContent:
                    "space-between"
                }}
              >

                <div>

                  <div
                    style={{
                      display:"flex",
                      gap:10,
                      marginBottom:8
                    }}
                  >

                    <div
                      style={{
                        background:
                          incoming
                          ? "#DCFCE7"
                          : "#DBEAFE",

                        color:
                          incoming
                          ? "#166534"
                          : "#1D4ED8",

                        padding:"4px 10px",
                        borderRadius:999,
                        fontSize:11,
                        fontWeight:700
                      }}
                    >
                      {
                        incoming
                        ? "INCOMING"
                        : "OUTGOING"
                      }
                    </div>

                    <div
                      style={{
                        background:"#F3F4F6",
                        padding:"4px 10px",
                        borderRadius:999,
                        fontSize:11,
                        fontWeight:700
                      }}
                    >
                      {status}
                    </div>

                  </div>

                  <div
                    style={{
                      fontWeight:700
                    }}
                  >
                    {
                      item.activity_title
                    }
                  </div>

                  <div
                    style={{
                      color:"#64748B",
                      marginTop:4
                    }}
                  >
                    {
                      item.partner_name
                    }
                  </div>

                </div>

                <button
                  onClick={()=>{
                    setSelectedActivity(
                      item
                    );
                    setShowActivityDetails(
                      true
                    );
                  }}
                  style={{
                    background:"#143B73",
                    color:"#FFF",
                    border:"none",
                    borderRadius:8,
                    padding:"8px 12px",
                    height:40
                  }}
                >
                  View
                </button>

              </div>

              <div
                style={{
                  marginTop:10,
                  fontSize:12,
                  color:"#94A3B8"
                }}
              >
                {
                  new Date(
                    item.created_at
                  ).toLocaleString()
                }
              </div>

            </div>

          );

        }
      )}

    </div>

  )
}
      </div>

{showOfferDetails &&
 selectedOffer && (

<div
  style={{
    position:"fixed",
    inset:0,
    background:
      "rgba(0,0,0,.45)",
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    zIndex:9999
  }}
>

  <div
    style={{
      width:650,
      background:"#FFF",
      borderRadius:20,
      padding:24
    }}
  >

    <h2>
      {
        selectedOffer.offer_title ||
        selectedOffer.workshop_title ||
        "Contact Request"
      }
    </h2>

    <div
      style={{
        marginTop:10
      }}
    >
      Partner:
      {" "}
      {selectedOffer.partner_name}
    </div>

    <div
      style={{
        marginTop:20,
        lineHeight:1.7
      }}
    >

      <strong>
        Description:
      </strong>

      <br />

      {
        selectedOffer.offer_description ||
        selectedOffer.workshop_description ||
        selectedOffer.request_reason ||
        "No description provided"
      }

    </div>

    {selectedOffer.scholarship_value && (

      <div
        style={{
          marginTop:15
        }}
      >
        Scholarship Value:
        {" "}
        {
          selectedOffer.scholarship_value
        }
      </div>

    )}

    <div
      style={{
        display:"flex",
        justifyContent:"flex-end",
        marginTop:25
      }}
    >

      <button
        onClick={()=>
          setShowOfferDetails(
            false
          )
        }
      >
        Close
      </button>

    </div>

  </div>

</div>

)}

{showActivityDetails &&
 selectedActivity && (

<div
  style={{
    position:"fixed",
    inset:0,
    background:"rgba(0,0,0,.45)",
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    zIndex:9999
  }}
>

  <div
    style={{
      width:650,
      background:"#FFF",
      borderRadius:20,
      padding:24
    }}
  >

    <h2>
      Activity Details
    </h2>

    <div>
      Partner:
      {" "}
      {selectedActivity.partner_name}
    </div>

    <div
      style={{
        marginTop:15
      }}
    >
      Status:
      {" "}
      {selectedActivity.status}
    </div>

    <div
      style={{
        marginTop:15
      }}
    >
      Activity:
      {" "}
      {selectedActivity.activity_title}
    </div>

    <div
      style={{
        marginTop:15
      }}
    >
      Type:
      {" "}
      {selectedActivity.activity_type}
    </div>

    <div
      style={{
        display:"flex",
        justifyContent:"flex-end",
        marginTop:25
      }}
    >

      <button
        onClick={()=>
          setShowActivityDetails(
            false
          )
        }
      >
        Close
      </button>

    </div>

  </div>

</div>

)}

      {/* REQUEST DIALOG */}

      {showRequestDialog &&
        selectedPartner && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,.45)",
            display: "flex",
            justifyContent:
              "center",
            alignItems:
              "center",
            zIndex: 1000
          }}
        >

          <div
            style={{
              background: "#FFF",
              borderRadius: 20,
              padding: 24,
              width: 550
            }}
          >

            <h2>
              Request {requestType}
            </h2>

            <div
              style={{
                marginBottom: 15
              }}
            >
              Partner:
              {" "}
              {
                selectedPartner
                  .institute_name
              }
            </div>

            <textarea
              value={message}
              onChange={(e) =>
                setMessage(
                  e.target.value
                )
              }
              rows={5}
              placeholder="Tell the partner why you are interested..."
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 12,
                border:
                  "1px solid #CBD5E1"
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent:
                  "flex-end",
                gap: 12,
                marginTop: 20
              }}
            >

              <button
                onClick={() =>
                  setShowRequestDialog(
                    false
                  )
                }
              >
                Cancel
              </button>

              <button
                onClick={
                  handleRequest
                }
                style={{
                  background:
                    "#FF6B00",
                  color: "#FFF",
                  border: "none",
                  padding:
                    "10px 16px",
                  borderRadius: 12
                }}
              >
                Submit Request
              </button>

            </div>



          </div>

        </div>

      )}

    </div>
  );
}
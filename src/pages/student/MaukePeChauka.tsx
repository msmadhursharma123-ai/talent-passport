import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  requireIdentity,
  getStudentUuid,
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
  withdrawApplication,
} from "../../data/partnerMarketplaceRepository";

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
  const identity = requireIdentity();

  const studentId = getStudentUuid();

  const [loading, setLoading] =
    useState(true);

  const [partners, setPartners] =
    useState<any[]>([]);

  const [offers, setOffers] =
    useState<InboxOffer[]>([]);

  const [
    selectedOffer,
    setSelectedOffer,
  ] = useState<any>(null);

  const [
    selectedActivity,
    setSelectedActivity,
  ] = useState<any>(null);

  const [
    showActivityDetails,
    setShowActivityDetails,
  ] = useState(false);

  const [
    showOfferDetails,
    setShowOfferDetails,
  ] = useState(false);

  const [
    partnerSearch,
    setPartnerSearch,
  ] = useState("");

  const [requests, setRequests] =
    useState<any[]>([]);

  const [
    selectedPartner,
    setSelectedPartner,
  ] = useState<any>(null);

  const [
    requestType,
    setRequestType,
  ] = useState("");

  const [message, setMessage] =
    useState("");

  const [activity, setActivity] =
    useState<any[]>([]);

  const [
    showRequestDialog,
    setShowRequestDialog,
  ] = useState(false);

  const [
    timelineFilter,
    setTimelineFilter,
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
      activityData,
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
      ),
    ]);

    console.table(
      (scholarshipOffers || []).map(
        (x: any) => ({
          id: x.id,
          status: x.status,
          title: x.offer_title,
        })
      )
    );

    console.table(
      (workshopOffers || []).map(
        (x: any) => ({
          id: x.id,
          status: x.status,
          title: x.workshop_title,
        })
      )
    );

    console.table(
      (contactOffers || []).map(
        (x: any) => ({
          id: x.id,
          status: x.status,
        })
      )
    );

    const mergedOffers = [
      ...(scholarshipOffers || []).map(
        (item: any) => ({
          ...item,
          type: "Scholarship",
        })
      ),

      ...(workshopOffers || []).map(
        (item: any) => ({
          ...item,
          type: "Workshop",
        })
      ),

      ...(contactOffers || []).map(
        (item: any) => ({
          ...item,
          type: "Contact",
        })
      ),
    ];

    setPartners(
      partnerData || []
    );

    setOffers(
      mergedOffers.filter(
        (item: any) =>
          item.status !== "accepted" &&
          item.status !== "rejected"
      )
    );

    const acceptedOffers =
      mergedOffers.filter(
        (item: any) =>
          item.status === "accepted"
      );

    setRequests([
      ...(requestData || []).filter(
        (item: any) =>
          !item.withdrawn
      ),

      ...acceptedOffers,
    ]);

    setActivity(
      activityData || []
    );

    setLoading(false);
  }

  const filteredActivity =
    useMemo(() => {
      if (
        timelineFilter === "all"
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
              return type.includes(
                "offer"
              );

            case "outgoing":
              return type.includes(
                "request"
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
      timelineFilter,
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

      if (!values.length) {
        return 72;
      }

      return Math.round(
        values.reduce(
          (a, b) => a + b,
          0
        ) / values.length
      );
    }, []);

  async function handleRequest() {
    if (!selectedPartner) {
      return;
    }

    const identity =
      requireIdentity();

    console.log(
      "===================================="
    );

    console.log(
      "IDENTITY OBJECT"
    );

    console.dir(
      identity,
      { depth: null }
    );

    console.log(
      "IDENTITY VALUES"
    );

    console.table({
      studentName:
        identity.studentName,

      schoolName:
        identity.schoolName,

      parentEmail:
        identity.parentEmail,

      parentPhone:
        identity.parentPhone,

      className:
        identity.className,
    });

    console.log(
      "=================================="
    );

    console.log(
      "SELECTED PARTNER"
    );

    console.dir(
      selectedPartner,
      { depth: null }
    );

    console.log(
      "PARTNER ID"
    );

    console.log(
      selectedPartner.partner_id
    );

    console.log(
      "PARTNER UUID"
    );

    console.log(
      selectedPartner.partner_uuid
    );

    console.log(
      "=================================="
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

      message,
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
        requestType,
      },
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

    if (!confirmed) {
      return;
    }

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

      metadata: {},
    });

    await loadMarketplace();
  }

  async function handleOfferAction(
    offer: InboxOffer,
    action:
      | "accept"
      | "reject"
  ) {
    if (
      offer.type ===
      "Scholarship"
    ) {
      if (
        action === "accept"
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

          partner_id: "",

          partner_name:
            offer.partner_name ||
            "",

          status:
            "accepted",
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

          partner_id: "",

          partner_name:
            offer.partner_name ||
            "",

          status:
            "rejected",
        });
      }
    }

    if (
      offer.type ===
      "Workshop"
    ) {
      if (
        action === "accept"
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
        action === "accept"
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
    <div className="min-h-screen bg-[#F7F9FC] px-2.5 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">

      <div className="mx-auto max-w-[1600px] space-y-3 sm:space-y-4 lg:space-y-6">

       {/* ========================================================= */}
{/* HERO / MARKETPLACE OVERVIEW */}
{/* ========================================================= */}

<section
  className="
    relative
    overflow-hidden
    rounded-[18px] sm:rounded-[22px] lg:rounded-[28px]
    border
    border-slate-200
    bg-gradient-to-br
    from-white
    via-white
    to-[#F7F9FF]
    shadow-sm
  "
>
  {/* ======================================================= */}
  {/* DECORATIVE BACKGROUND — SAME LANGUAGE AS COMPETITIONS */}
  {/* ======================================================= */}

  <div
    className="
      pointer-events-none
      absolute
      -right-20
      -top-28
      h-[310px]
      w-[310px]
      rounded-full
      bg-orange-50/80
    "
  />

  <div
    className="
      pointer-events-none
      absolute
      right-[17%]
      -top-24
      h-[170px]
      w-[170px]
      rounded-full
      bg-orange-50/40
    "
  />

  <div
    className="
      pointer-events-none
      absolute
      -bottom-36
      right-[13%]
      h-[250px]
      w-[250px]
      rounded-full
      bg-indigo-50/70
    "
  />

  {/* ======================================================= */}
  {/* CONTENT */}
  {/* ======================================================= */}

  <div className="relative z-10 px-4 py-5 sm:px-6 sm:py-6 lg:px-9 lg:py-8">

    <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">

      {/* LEFT */}

      <div className="max-w-3xl">

        <p className="text-[9px] sm:text-[10px] lg:text-xs font-black uppercase tracking-[0.18em] sm:tracking-[0.22em] lg:tracking-[0.24em] text-orange-500">
          Talent Opportunity Marketplace
        </p>

        <h1 className="mt-2 sm:mt-3 text-[25px] sm:text-[30px] font-black tracking-tight text-[#07142D] ">
          🎯 Mauke Pe Chauka
        </h1>

        <p className="mt-2 sm:mt-3 max-w-2xl text-[11px] sm:text-[13px] lg:text-sm font-medium leading-5 sm:leading-6 text-slate-500">
          Connect with scholarships, workshops,
          institutions, academies and talent partners.
        </p>

      </div>

      {/* MARKETPLACE STATUS */}

      <div
        className="
          inline-flex
          w-fit
          items-center
          gap-2
          rounded-full
          border
          border-green-200
          bg-green-50
          px-4
          py-2
        "
      >

        <span className="h-2 w-2 rounded-full bg-green-500" />

        <span className="text-xs font-black uppercase tracking-wider text-green-700">
          Marketplace Active
        </span>

      </div>

    </div>

    {/* ===================================================== */}
    {/* METRIC CARDS */}
    {/* ===================================================== */}

    <div className="mt-5 sm:mt-6 lg:mt-7 grid grid-cols-2 gap-2.5 sm:gap-3 lg:gap-4 xl:grid-cols-4">

      {/* ACTIVE PARTNERS */}

      <div className="rounded-xl sm:rounded-2xl border border-blue-100 bg-blue-50/70 p-3.5 sm:p-4 lg:p-5">

        <div className="flex items-start justify-between gap-4">

          <div>

            <p className="text-xs font-black uppercase tracking-wider text-blue-700">
              Active Partners
            </p>

            <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl lg:text-4xl font-black text-[#07142D]">
              {loading ? "--" : partners.length}
            </p>

          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
            🏢
          </div>

        </div>

        <p className="mt-3 text-xs font-semibold text-blue-600">
          Available in the partner network
        </p>

      </div>

      {/* INVITATIONS */}

      <div className="rounded-xl sm:rounded-2xl border border-purple-100 bg-purple-50/70 p-3.5 sm:p-4 lg:p-5">

        <div className="flex items-start justify-between gap-4">

          <div>

            <p className="text-xs font-black uppercase tracking-wider text-purple-700">
              Invitations
            </p>

            <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl lg:text-4xl font-black text-[#07142D]">
              {loading ? "--" : offers.length}
            </p>

          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
            ✉️
          </div>

        </div>

        <p className="mt-3 text-xs font-semibold text-purple-600">
          Opportunities waiting for your response
        </p>

      </div>

      {/* APPLICATIONS */}

      <div className="rounded-xl sm:rounded-2xl border border-green-100 bg-green-50/70 p-3.5 sm:p-4 lg:p-5">

        <div className="flex items-start justify-between gap-4">

          <div>

            <p className="text-xs font-black uppercase tracking-wider text-green-700">
              Applications
            </p>

            <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl lg:text-4xl font-black text-[#07142D]">
              {loading ? "--" : requests.length}
            </p>

          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
            📋
          </div>

        </div>

        <p className="mt-3 text-xs font-semibold text-green-600">
          Active opportunity connections
        </p>

      </div>

      {/* OPPORTUNITY INDEX */}

      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-orange-500 p-3.5 sm:p-4 lg:p-5 text-white shadow-sm">

        <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/10" />

        <div className="absolute -bottom-10 right-10 h-24 w-24 rounded-full bg-white/10" />

        <div className="relative">

          <div className="flex items-start justify-between gap-4">

            <div>

              <p className="text-xs font-black uppercase tracking-wider text-orange-100">
                Opportunity Index
              </p>

              <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl lg:text-4xl font-black">
                {opportunityIndex}
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-xl">
              ✦
            </div>

          </div>

          <p className="mt-3 text-xs font-bold text-orange-100">
            Your current marketplace opportunity score
          </p>

        </div>

      </div>

    </div>

  </div>

</section>

        {/* ========================================================= */}
        {/* MY INVITATIONS */}
        {/* ========================================================= */}

        <section className="rounded-[18px] sm:rounded-[22px] lg:rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">

          {/* SECTION HEADER */}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-[9px] sm:text-[10px] lg:text-xs font-black uppercase tracking-[0.16em] sm:tracking-[0.18em] lg:tracking-[0.2em] text-orange-500">
                Partner Outreach
              </p>

              <h2 className="mt-1.5 sm:mt-2 text-xl sm:text-[22px] lg:text-2xl font-black text-[#07142D]">
                My Invitations
              </h2>

              <p className="mt-1 text-[11px] sm:text-[13px] lg:text-sm font-medium text-slate-500">
                Review opportunities sent directly by talent partners.
              </p>

            </div>

            <div className="rounded-full bg-purple-50 px-4 py-2 text-xs font-black text-purple-700">
              {offers.length} Pending
            </div>

          </div>

          {/* EMPTY STATE */}

          {!loading && offers.length === 0 ? (

            <div className="mt-6 flex min-h-[170px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                ✉️
              </div>

              <p className="mt-4 font-black text-[#07142D]">
                No invitations received yet
              </p>

              <p className="mt-1 text-sm text-slate-500">
                New partner invitations will appear here.
              </p>

            </div>

          ) : (
            <>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 xl:hidden">
              <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 sm:text-[11px]">
                Swipe to explore more
              </span>
              <span className="flex items-center gap-1 text-sm font-black text-orange-500" aria-hidden="true">
                ← <span className="text-[10px] text-slate-400">SWIPE</span> →
              </span>
            </div>

            <div className="mt-4 sm:mt-5 lg:mt-6 flex gap-3 sm:gap-4 overflow-x-auto pb-3 snap-x snap-mandatory [-webkit-overflow-scrolling:touch]">

              {offers.map((offer) => {

                const isCompleted =
                  offer.status === "accepted" ||
                  offer.status === "rejected";

                const offerTitle =
                  offer.offer_title ||
                  offer.workshop_title ||
                  "Contact Request";

                const typeStyles =
                  offer.type === "Scholarship"
                    ? "border-orange-200 bg-orange-50 text-orange-700"
                    : offer.type === "Workshop"
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-purple-200 bg-purple-50 text-purple-700";

                return (

                  <article
                    key={offer.id}
                    className="flex min-h-[225px] min-w-[86vw] max-w-[86vw] sm:min-w-[310px] sm:max-w-[310px] lg:min-h-[250px] lg:min-w-[330px] lg:max-w-[330px] snap-start flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                  >

                    {/* CARD TOP */}

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#07142D] text-lg text-white">
                        {offer.type === "Scholarship"
                          ? "★"
                          : offer.type === "Workshop"
                          ? "✦"
                          : "☎"}
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide ${typeStyles}`}
                      >
                        {offer.type}
                      </span>

                    </div>

                    {/* CONTENT */}

                    <div className="mt-5 flex-1">

                      <h3 className="line-clamp-2 text-base sm:text-lg font-black leading-6 text-[#07142D]">
                        {offerTitle}
                      </h3>

                      <p className="mt-2 text-sm font-bold text-slate-500">
                        {offer.partner_name || "Talent Partner"}
                      </p>

                      <p className="mt-3 line-clamp-2 text-xs font-medium leading-5 text-slate-500">
                        {offer.offer_description ||
                          offer.workshop_description ||
                          offer.request_reason ||
                          offer.description ||
                          "A new opportunity has been shared with you."}
                      </p>

                    </div>

                    {/* ACTIONS */}

                    <div className="mt-5 flex flex-wrap gap-2">

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOffer(offer);
                          setShowOfferDetails(true);
                        }}
                        className="rounded-lg bg-[#143B73] px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#0E2D59]"
                      >
                        View
                      </button>

                      {!isCompleted && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              handleOfferAction(
                                offer,
                                "accept"
                              )
                            }
                            className="rounded-lg bg-green-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-green-700"
                          >
                            Accept
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleOfferAction(
                                offer,
                                "reject"
                              )
                            }
                            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-black text-red-700 transition hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </>
                      )}

                      {isCompleted && (
                        <span
                          className={`rounded-lg px-4 py-2.5 text-xs font-black uppercase ${
                            offer.status === "accepted"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {offer.status || ""}
                        </span>
                      )}

                    </div>

                  </article>

                );

              })}

            </div>
            </>
          )}

        </section>

            {/* ========================================================= */}
        {/* EXPLORE PARTNERS */}
        {/* ========================================================= */}

        <section className="rounded-[18px] sm:rounded-[22px] lg:rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">

          {/* SECTION HEADER */}

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <p className="text-[9px] sm:text-[10px] lg:text-xs font-black uppercase tracking-[0.16em] sm:tracking-[0.18em] lg:tracking-[0.2em] text-orange-500">
                Opportunity Network
              </p>

              <h2 className="mt-1.5 sm:mt-2 text-xl sm:text-[22px] lg:text-2xl font-black text-[#07142D]">
                Explore Partners
              </h2>

              <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                Discover institutions, academies and talent partners
                that can support your learning and growth journey.
              </p>

            </div>

            {/* SEARCH */}

            <div className="w-full sm:max-w-[440px] lg:w-[390px]">

              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Find a Partner
              </p>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4">

                <span className="text-base text-slate-400">
                  ⌕
                </span>

                <input
                  type="text"
                  value={partnerSearch}
                  onChange={(e) =>
                    setPartnerSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search partner, skill or location..."
                  className="h-11 w-full bg-transparent text-sm font-semibold text-[#07142D] outline-none placeholder:font-medium placeholder:text-slate-400"
                />

              </div>

            </div>

          </div>

          {/* PARTNER COUNT */}

          <div className="mt-6 flex items-center justify-between border-b border-slate-100 pb-4">

            <p className="text-sm font-bold text-slate-500">
              Available Partner Network
            </p>

            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
              {
                partners.filter(
                  (partner: any) => {

                    const query =
                      partnerSearch
                        .trim()
                        .toLowerCase();

                    if (!query) {
                      return true;
                    }

                    const searchable =
                      [
                        partner.institute_name,
                        partner.partner_name,
                        partner.organization_name,
                        partner.category,
                        partner.specialization,
                        partner.city,
                        partner.location,
                      ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();

                    return searchable.includes(
                      query
                    );
                  }
                ).length
              } Partners
            </span>

          </div>

          {/* LOADING STATE */}

          {loading && (

            <div className="mt-4 sm:mt-5 lg:mt-6 flex gap-3 sm:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [-webkit-overflow-scrolling:touch] xl:grid xl:grid-cols-3 xl:overflow-visible xl:pb-0">

              {[1, 2, 3].map(
                (item) => (

                  <div
                    key={item}
                    className="min-h-[285px] animate-pulse rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >

                    <div className="h-10 w-10 rounded-xl bg-slate-200" />

                    <div className="mt-5 h-5 w-2/3 rounded bg-slate-200" />

                    <div className="mt-3 h-3 w-1/2 rounded bg-slate-200" />

                    <div className="mt-6 h-16 rounded-xl bg-slate-200" />

                    <div className="mt-5 flex gap-2">

                      <div className="h-9 flex-1 rounded-lg bg-slate-200" />

                      <div className="h-9 flex-1 rounded-lg bg-slate-200" />

                    </div>

                  </div>

                )
              )}

            </div>

          )}

          {/* PARTNER CARDS */}

            <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 xl:hidden">
              <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 sm:text-[11px]">
                Swipe to explore more
              </span>
              <span className="flex items-center gap-1 text-sm font-black text-orange-500" aria-hidden="true">
                ← <span className="text-[10px] text-slate-400">SWIPE</span> →
              </span>
            </div>

          {!loading && (

            <div className="mt-4 sm:mt-5 lg:mt-6 flex gap-3 sm:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [-webkit-overflow-scrolling:touch] xl:grid xl:grid-cols-3 xl:overflow-visible xl:pb-0">

              {partners

                .filter(
                  (partner: any) => {

                    const query =
                      partnerSearch
                        .trim()
                        .toLowerCase();

                    if (!query) {
                      return true;
                    }

                    const searchable =
                      [
                        partner.institute_name,
                        partner.partner_name,
                        partner.organization_name,
                        partner.category,
                        partner.specialization,
                        partner.city,
                        partner.location,
                      ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();

                    return searchable.includes(
                      query
                    );
                  }
                )

                .map(
                  (partner: any) => {

                    const partnerName =
                      partner.institute_name ||
                      partner.partner_name ||
                      partner.organization_name ||
                      "Talent Partner";

                    const category =
                      partner.category ||
                      partner.partner_type ||
                      partner.organization_type ||
                      "Talent Development";

                    const specialization =
                      partner.specialization ||
                      partner.skills ||
                      partner.focus_area ||
                      partner.description ||
                      "Student growth and talent development";

                    const location =
                      partner.city ||
                      partner.location ||
                      partner.address ||
                      "Location not specified";

                    return (

                      <article
                        key={
                          partner.partner_id ||
                          partner.partner_uuid ||
                          partner.id ||
                          partnerName
                        }
                        className="group flex min-h-[260px] sm:min-h-[280px] lg:min-h-[300px] min-w-[86vw] max-w-[86vw] sm:min-w-[340px] sm:max-w-[340px] lg:min-w-[380px] lg:max-w-[380px] xl:min-w-0 xl:max-w-none snap-start flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-orange-200 hover:shadow-md"
                      >

                        {/* CARD ACCENT */}

                        <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400" />

                        <div className="flex flex-1 flex-col p-4 sm:p-5">

                          {/* TOP */}

                          <div className="flex items-start justify-between gap-4">

                            <div className="flex min-w-0 items-start gap-3">

                              {/* NO PARTNER LOGO */}

                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#07142D] text-base sm:text-lg font-black text-white">
                                {partnerName
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0">

                                <h3 className="truncate text-base sm:text-lg font-black text-[#07142D]">
                                  {partnerName}
                                </h3>

                                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-orange-500">
                                  {category}
                                </p>

                              </div>

                            </div>

                            <span className="shrink-0 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-green-700">
                              Active
                            </span>

                          </div>

                          {/* INFORMATION */}

                          <div className="mt-4 sm:mt-5 grid gap-2.5 sm:gap-3">

                            <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">

                              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-500">
                                Focus Area
                              </p>

                              <p className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-[#143B73]">
                                {String(
                                  specialization
                                )}
                              </p>

                            </div>

                            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3">

                              <span className="text-sm">
                                ◉
                              </span>

                              <div className="min-w-0">

                                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                                  Location
                                </p>

                                <p className="mt-0.5 truncate text-xs font-bold text-slate-600">
                                  {String(
                                    location
                                  )}
                                </p>

                              </div>

                            </div>

                          </div>

                          {/* ACTION AREA */}

                          <div className="mt-auto pt-5">

                            <p className="mb-2 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                              Connect With Partner
                            </p>

                            <div className="grid grid-cols-1 gap-2 min-[390px]:grid-cols-3">

                              {/* SCHOLARSHIP */}

                              <button
                                type="button"
                                onClick={() => {

                                  setSelectedPartner(
                                    partner
                                  );

                                  setRequestType(
                                    "Scholarship"
                                  );

                                  setMessage("");

                                  setShowRequestDialog(
                                    true
                                  );

                                }}
                                className="rounded-lg bg-[#143B73] px-2 py-2.5 text-[10px] font-black text-white transition hover:bg-[#0E2D59]"
                              >
                                Scholarship
                              </button>

                              {/* WORKSHOP */}

                              <button
                                type="button"
                                onClick={() => {

                                  setSelectedPartner(
                                    partner
                                  );

                                  setRequestType(
                                    "Workshop"
                                  );

                                  setMessage("");

                                  setShowRequestDialog(
                                    true
                                  );

                                }}
                                className="rounded-lg bg-orange-500 px-2 py-2.5 text-[10px] font-black text-white transition hover:bg-orange-600"
                              >
                                Workshop
                              </button>

                              {/* CALLBACK */}

                              <button
                                type="button"
                                onClick={() => {

                                  setSelectedPartner(
                                    partner
                                  );

                                  setRequestType(
                                    "Contact"
                                  );

                                  setMessage("");

                                  setShowRequestDialog(
                                    true
                                  );

                                }}
                                className="rounded-lg border border-purple-200 bg-purple-50 px-2 py-2.5 text-[10px] font-black text-purple-700 transition hover:bg-purple-100"
                              >
                                Callback
                              </button>

                            </div>

                          </div>

                        </div>

                      </article>

                    );

                  }
                )}

            </div>

          )}

          {/* NO SEARCH RESULTS */}

          {!loading &&
            partners.length > 0 &&
            partners.filter(
              (partner: any) => {

                const query =
                  partnerSearch
                    .trim()
                    .toLowerCase();

                if (!query) {
                  return true;
                }

                const searchable =
                  [
                    partner.institute_name,
                    partner.partner_name,
                    partner.organization_name,
                    partner.category,
                    partner.specialization,
                    partner.city,
                    partner.location,
                  ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return searchable.includes(
                  query
                );
              }
            ).length === 0 && (

              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">

                <p className="font-black text-[#07142D]">
                  No matching partners found
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Try another partner name, skill or location.
                </p>

              </div>

            )}

          {/* NO PARTNERS */}

          {!loading &&
            partners.length === 0 && (

              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                  🏢
                </div>

                <p className="mt-4 font-black text-[#07142D]">
                  Partner network is currently empty
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  New partner opportunities will appear here once available.
                </p>

              </div>

            )}

        </section>

                {/* ========================================================= */}
        {/* MY APPLICATIONS */}
        {/* ========================================================= */}

        <section className="rounded-[18px] sm:rounded-[22px] lg:rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">

          {/* SECTION HEADER */}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-[9px] sm:text-[10px] lg:text-xs font-black uppercase tracking-[0.16em] sm:tracking-[0.18em] lg:tracking-[0.2em] text-orange-500">
                Opportunity Connections
              </p>

              <h2 className="mt-1.5 sm:mt-2 text-xl sm:text-[22px] lg:text-2xl font-black text-[#07142D]">
                My Applications
              </h2>

              <p className="mt-1 text-[11px] sm:text-[13px] lg:text-sm font-medium text-slate-500">
                Track the opportunities you have applied for,
                requested or accepted.
              </p>

            </div>

            <div className="rounded-full bg-green-50 px-4 py-2 text-xs font-black text-green-700">
              {requests.length} Applications
            </div>

          </div>

          {/* LOADING */}

          {loading && (

            <div className="mt-6 flex gap-4 overflow-hidden">

              {[1, 2, 3].map(
                (item) => (

                  <div
                    key={item}
                    className="min-h-[240px] min-w-[86vw] max-w-[86vw] sm:min-w-[310px] sm:max-w-[310px] lg:min-h-[270px] lg:min-w-[330px] lg:max-w-[330px] snap-start animate-pulse rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >

                    <div className="flex items-center justify-between">

                      <div className="h-11 w-11 rounded-xl bg-slate-200" />

                      <div className="h-6 w-20 rounded-full bg-slate-200" />

                    </div>

                    <div className="mt-5 h-5 w-2/3 rounded bg-slate-200" />

                    <div className="mt-3 h-3 w-1/2 rounded bg-slate-200" />

                    <div className="mt-6 h-14 rounded-xl bg-slate-200" />

                    <div className="mt-5 flex gap-2">

                      <div className="h-10 flex-1 rounded-lg bg-slate-200" />

                      <div className="h-10 flex-1 rounded-lg bg-slate-200" />

                    </div>

                  </div>

                )
              )}

            </div>

          )}

          {/* EMPTY STATE */}

          {!loading &&
            requests.length === 0 && (

              <div className="mt-6 flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
                  📋
                </div>

                <p className="mt-4 font-black text-[#07142D]">
                  No applications yet
                </p>

                <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                  Scholarship, workshop and partner requests
                  will appear here once you start connecting
                  with opportunities.
                </p>

              </div>

            )}

          {/* APPLICATION CAROUSEL */}

            <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 xl:hidden">
              <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 sm:text-[11px]">
                Swipe to explore more
              </span>
              <span className="flex items-center gap-1 text-sm font-black text-orange-500" aria-hidden="true">
                ← <span className="text-[10px] text-slate-400">SWIPE</span> →
              </span>
            </div>

          {!loading &&
            requests.length > 0 && (

              <div className="mt-4 sm:mt-5 lg:mt-6 flex gap-3 sm:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [-webkit-overflow-scrolling:touch]">

                {requests.map(
                  (request: any) => {

                    const applicationType =
                      request.request_type ||
                      request.type ||
                      request.offer_type ||
                      "Opportunity";

                    const partnerName =
                      request.partner_name ||
                      request.institute_name ||
                      request.organization_name ||
                      "Talent Partner";

                    const applicationTitle =
                      request.offer_title ||
                      request.workshop_title ||
                      request.request_title ||
                      request.activity_title ||
                      `${applicationType} Application`;

                    const status =
                      (
                        request.status ||
                        "pending"
                      ).toLowerCase();

                    const isAccepted =
                      status ===
                      "accepted";

                    const isRejected =
                      status ===
                      "rejected";

                    const isWithdrawn =
                      status ===
                      "withdrawn";

                    const isPending =
                      !isAccepted &&
                      !isRejected &&
                      !isWithdrawn;

                    const statusStyle =
                      isAccepted
                        ? "border-green-200 bg-green-50 text-green-700"
                        : isRejected
                        ? "border-red-200 bg-red-50 text-red-700"
                        : isWithdrawn
                        ? "border-slate-200 bg-slate-100 text-slate-600"
                        : "border-orange-200 bg-orange-50 text-orange-700";

                    const typeStyle =
                      String(
                        applicationType
                      )
                        .toLowerCase()
                        .includes(
                          "scholar"
                        )
                        ? {
                            card:
                              "border-orange-100",
                            icon:
                              "bg-orange-50 text-orange-600",
                            panel:
                              "border-orange-100 bg-orange-50/60",
                            panelText:
                              "text-orange-700",
                            accent:
                              "bg-orange-500",
                          }
                        : String(
                            applicationType
                          )
                            .toLowerCase()
                            .includes(
                              "workshop"
                            )
                        ? {
                            card:
                              "border-blue-100",
                            icon:
                              "bg-blue-50 text-blue-700",
                            panel:
                              "border-blue-100 bg-blue-50/60",
                            panelText:
                              "text-blue-700",
                            accent:
                              "bg-blue-600",
                          }
                        : {
                            card:
                              "border-purple-100",
                            icon:
                              "bg-purple-50 text-purple-700",
                            panel:
                              "border-purple-100 bg-purple-50/60",
                            panelText:
                              "text-purple-700",
                            accent:
                              "bg-purple-600",
                          };

                    return (

                      <article
                        key={
                          request.id ||
                          `${partnerName}-${applicationTitle}`
                        }
                        className={`relative flex min-h-[250px] min-w-[86vw] max-w-[86vw] sm:min-w-[320px] sm:max-w-[320px] lg:min-h-[285px] lg:min-w-[340px] lg:max-w-[340px] snap-start flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${typeStyle.card}`}
                      >

                        {/* TOP ACCENT */}

                        <div
                          className={`h-1.5 w-full ${typeStyle.accent}`}
                        />

                        <div className="flex flex-1 flex-col p-4 sm:p-5">

                          {/* CARD TOP */}

                          <div className="flex items-start justify-between gap-3">

                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base sm:text-lg font-black ${typeStyle.icon}`}
                            >

                              {String(
                                applicationType
                              )
                                .toLowerCase()
                                .includes(
                                  "scholar"
                                )
                                ? "★"
                                : String(
                                    applicationType
                                  )
                                    .toLowerCase()
                                    .includes(
                                      "workshop"
                                    )
                                ? "✦"
                                : "↗"}

                            </div>

                            <span
                              className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide ${statusStyle}`}
                            >
                              {status}
                            </span>

                          </div>

                          {/* APPLICATION INFO */}

                          <div className="mt-5">

                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                              {applicationType}
                            </p>

                            <h3 className="mt-1 line-clamp-2 text-base sm:text-lg font-black leading-6 text-[#07142D]">
                              {applicationTitle}
                            </h3>

                            <p className="mt-2 text-sm font-bold text-slate-500">
                              {partnerName}
                            </p>

                          </div>

                          {/* STATUS / CONTEXT */}

                          <div
                            className={`mt-5 rounded-xl border px-4 py-3 ${typeStyle.panel}`}
                          >

                            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                              Current Status
                            </p>

                            <div className="mt-1 flex items-center gap-2">

                              <span
                                className={`h-2 w-2 rounded-full ${
                                  isAccepted
                                    ? "bg-green-500"
                                    : isRejected
                                    ? "bg-red-500"
                                    : isWithdrawn
                                    ? "bg-slate-400"
                                    : "bg-orange-500"
                                }`}
                              />

                              <p
                                className={`text-xs font-black uppercase ${typeStyle.panelText}`}
                              >
                                {isAccepted
                                  ? "Opportunity Accepted"
                                  : isRejected
                                  ? "Application Rejected"
                                  : isWithdrawn
                                  ? "Application Withdrawn"
                                  : "Awaiting Partner Response"}
                              </p>

                            </div>

                          </div>

                          {/* ACTIONS */}

                          <div className="mt-auto flex gap-2 pt-5">

                            <button
                              type="button"
                              onClick={() => {

                                setSelectedActivity(
                                  request
                                );

                                setShowActivityDetails(
                                  true
                                );

                              }}
                              className="flex-1 rounded-lg bg-[#143B73] px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#0E2D59]"
                            >
                              View
                            </button>

                            {isPending && (

                              <button
                                type="button"
                                onClick={() =>
                                  handleWithdraw(
                                    request.id,
                                    partnerName
                                  )
                                }
                                className="flex-1 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-black text-red-700 transition hover:bg-red-100"
                              >
                                Withdraw
                              </button>

                            )}

                            {isAccepted && (

                              <div className="flex-1 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-center text-xs font-black text-green-700">
                                Accepted
                              </div>

                            )}

                            {isRejected && (

                              <div className="flex-1 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-center text-xs font-black text-red-700">
                                Rejected
                              </div>

                            )}

                            {isWithdrawn && (

                              <div className="flex-1 rounded-lg border border-slate-200 bg-slate-100 px-4 py-2.5 text-center text-xs font-black text-slate-600">
                                Withdrawn
                              </div>

                            )}

                          </div>

                        </div>

                      </article>

                    );

                  }
                )}

              </div>

            )}

          {/* CAROUSEL HINT */}

          {!loading &&
            requests.length > 1 && (

              <div className="mt-1 flex items-center justify-end gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">

                <span>
                  Scroll to explore applications
                </span>

                <span className="text-base text-orange-500">
                  →
                </span>

              </div>

            )}

        </section>

                {/* ========================================================= */}
        {/* OPPORTUNITY TIMELINE */}
        {/* ========================================================= */}

        <section className="rounded-[18px] sm:rounded-[22px] lg:rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">

          {/* SECTION HEADER */}

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <p className="text-[9px] sm:text-[10px] lg:text-xs font-black uppercase tracking-[0.16em] sm:tracking-[0.18em] lg:tracking-[0.2em] text-orange-500">
                Marketplace Journey
              </p>

              <h2 className="mt-1.5 sm:mt-2 text-xl sm:text-[22px] lg:text-2xl font-black text-[#07142D]">
                Opportunity Timeline
              </h2>

              <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                Follow your complete marketplace journey across
                invitations, applications, requests and partner decisions.
              </p>

            </div>

            {/* TIMELINE FILTER */}

            <div className="w-full sm:w-[240px]">

              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Filter Timeline
              </p>

              <select
                value={timelineFilter}
                onChange={(e) =>
                  setTimelineFilter(
                    e.target.value
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-[#07142D] outline-none transition focus:border-orange-300 focus:bg-white"
              >
                <option value="all">
                  All Activity
                </option>

                <option value="incoming">
                  Incoming Offers
                </option>

                <option value="outgoing">
                  Outgoing Requests
                </option>

                <option value="accepted">
                  Accepted
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="rejected">
                  Rejected
                </option>

                <option value="withdrawn">
                  Withdrawn
                </option>

              </select>

            </div>

          </div>

          {/* SUMMARY STRIP */}

          <div className="mt-4 sm:mt-5 lg:mt-6 flex flex-wrap items-center gap-2 sm:gap-3 border-b border-slate-100 pb-5">

            <div className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-blue-700">
              {filteredActivity.length} Activities
            </div>

            <div className="rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-green-700">
              {
                activity.filter(
                  (item: any) =>
                    (
                      item.status || ""
                    ).toLowerCase() ===
                    "accepted"
                ).length
              } Accepted
            </div>

            <div className="rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-orange-700">
              {
                activity.filter(
                  (item: any) =>
                    (
                      item.status || ""
                    ).toLowerCase() ===
                    "pending"
                ).length
              } Pending
            </div>

          </div>

          {/* LOADING STATE */}

          {loading && (

            <div className="mt-6 flex gap-4 overflow-hidden">

              {[1, 2, 3].map(
                (item) => (

                  <div
                    key={item}
                    className="min-h-[250px] min-w-[320px] max-w-[320px] animate-pulse rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >

                    <div className="flex items-center justify-between">

                      <div className="h-11 w-11 rounded-xl bg-slate-200" />

                      <div className="h-6 w-20 rounded-full bg-slate-200" />

                    </div>

                    <div className="mt-5 h-5 w-3/4 rounded bg-slate-200" />

                    <div className="mt-3 h-3 w-1/2 rounded bg-slate-200" />

                    <div className="mt-6 h-14 rounded-xl bg-slate-200" />

                    <div className="mt-5 h-10 rounded-lg bg-slate-200" />

                  </div>

                )
              )}

            </div>

          )}

          {/* EMPTY TIMELINE */}

          {!loading &&
            filteredActivity.length === 0 && (

              <div className="mt-6 flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
                  ◷
                </div>

                <p className="mt-4 font-black text-[#07142D]">
                  No timeline activity found
                </p>

                <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                  Marketplace activity matching this filter
                  will appear here.
                </p>

              </div>

            )}

          {/* TIMELINE CAROUSEL */}

          {!loading &&
            filteredActivity.length > 0 && (
            <>
              <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 xl:hidden">
              <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 sm:text-[11px]">
                Swipe to explore more
              </span>
              <span className="flex items-center gap-1 text-sm font-black text-orange-500" aria-hidden="true">
                ← <span className="text-[10px] text-slate-400">SWIPE</span> →
              </span>
            </div>

            <div className="mt-4 sm:mt-5 lg:mt-6 flex gap-3 sm:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [-webkit-overflow-scrolling:touch]">

                {filteredActivity.map(
                  (
                    item: any,
                    index: number
                  ) => {

                    const status =
                      (
                        item.status ||
                        "pending"
                      ).toLowerCase();

                    const activityType =
                      (
                        item.activity_type ||
                        "activity"
                      ).toLowerCase();

                    const isOffer =
                      activityType.includes(
                        "offer"
                      );

                    const isRequest =
                      activityType.includes(
                        "request"
                      );

                    const isWithdrawn =
                      status ===
                        "withdrawn" ||
                      activityType.includes(
                        "withdraw"
                      );

                    const isAccepted =
                      status ===
                      "accepted";

                    const isRejected =
                      status ===
                      "rejected";

                    const isPending =
                      status ===
                        "pending" ||
                      status ===
                        "submitted";

                    const partnerName =
                      item.partner_name ||
                      "Talent Partner";

                    const activityTitle =
                      item.activity_title ||
                      "Marketplace Activity";

                    const activityDate =
                      item.created_at ||
                      item.updated_at ||
                      item.date ||
                      null;

                    const cardTheme =
                      isAccepted
                        ? {
                            accent:
                              "bg-green-500",
                            icon:
                              "bg-green-50 text-green-700",
                            panel:
                              "border-green-100 bg-green-50/60",
                            panelText:
                              "text-green-700",
                          }
                        : isRejected
                        ? {
                            accent:
                              "bg-red-500",
                            icon:
                              "bg-red-50 text-red-700",
                            panel:
                              "border-red-100 bg-red-50/60",
                            panelText:
                              "text-red-700",
                          }
                        : isWithdrawn
                        ? {
                            accent:
                              "bg-slate-400",
                            icon:
                              "bg-slate-100 text-slate-600",
                            panel:
                              "border-slate-200 bg-slate-50",
                            panelText:
                              "text-slate-600",
                          }
                        : isOffer
                        ? {
                            accent:
                              "bg-purple-500",
                            icon:
                              "bg-purple-50 text-purple-700",
                            panel:
                              "border-purple-100 bg-purple-50/60",
                            panelText:
                              "text-purple-700",
                          }
                        : isRequest
                        ? {
                            accent:
                              "bg-blue-600",
                            icon:
                              "bg-blue-50 text-blue-700",
                            panel:
                              "border-blue-100 bg-blue-50/60",
                            panelText:
                              "text-blue-700",
                          }
                        : {
                            accent:
                              "bg-orange-500",
                            icon:
                              "bg-orange-50 text-orange-700",
                            panel:
                              "border-orange-100 bg-orange-50/60",
                            panelText:
                              "text-orange-700",
                          };

                    const statusStyle =
                      isAccepted
                        ? "border-green-200 bg-green-50 text-green-700"
                        : isRejected
                        ? "border-red-200 bg-red-50 text-red-700"
                        : isWithdrawn
                        ? "border-slate-200 bg-slate-100 text-slate-600"
                        : "border-orange-200 bg-orange-50 text-orange-700";

                    return (

                      <article
                        key={
                          item.id ||
                          `${activityTitle}-${index}`
                        }
                        className="relative flex min-h-[240px] min-w-[86vw] max-w-[86vw] sm:min-w-[310px] sm:max-w-[310px] lg:min-h-[270px] lg:min-w-[330px] lg:max-w-[330px] snap-start flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                      >

                        {/* TOP ACCENT */}

                        <div
                          className={`h-1.5 w-full ${cardTheme.accent}`}
                        />

                        <div className="flex flex-1 flex-col p-4 sm:p-5">

                          {/* TOP */}

                          <div className="flex items-start justify-between gap-3">

                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base sm:text-lg font-black ${cardTheme.icon}`}
                            >
                              {isAccepted
                                ? "✓"
                                : isRejected
                                ? "×"
                                : isWithdrawn
                                ? "↶"
                                : isOffer
                                ? "✦"
                                : isRequest
                                ? "↗"
                                : "◷"}
                            </div>

                            <span
                              className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide ${statusStyle}`}
                            >
                              {status}
                            </span>

                          </div>

                          {/* CONTENT */}

                          <div className="mt-5">

                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                              {isOffer
                                ? "Incoming Opportunity"
                                : isRequest
                                ? "Outgoing Request"
                                : isWithdrawn
                                ? "Application Update"
                                : "Marketplace Activity"}
                            </p>

                            <h3 className="mt-1 line-clamp-2 text-base sm:text-lg font-black leading-6 text-[#07142D]">
                              {activityTitle}
                            </h3>

                            <p className="mt-2 text-sm font-bold text-slate-500">
                              {partnerName}
                            </p>

                          </div>

                          {/* TIMELINE META */}

                          <div
                            className={`mt-5 rounded-xl border px-4 py-3 ${cardTheme.panel}`}
                          >

                            <div className="flex items-center justify-between gap-4">

                              <div>

                                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                                  Journey Status
                                </p>

                                <p
                                  className={`mt-1 text-xs font-black uppercase ${cardTheme.panelText}`}
                                >
                                  {isAccepted
                                    ? "Opportunity Accepted"
                                    : isRejected
                                    ? "Opportunity Declined"
                                    : isWithdrawn
                                    ? "Application Withdrawn"
                                    : isPending
                                    ? "In Progress"
                                    : status}
                                </p>

                              </div>

                              {activityDate && (

                                <div className="shrink-0 text-right">

                                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                                    Date
                                  </p>

                                  <p className="mt-1 text-[11px] font-bold text-slate-600">
                                    {new Date(
                                      activityDate
                                    ).toLocaleDateString(
                                      "en-US",
                                      {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      }
                                    )}
                                  </p>

                                </div>

                              )}

                            </div>

                          </div>

                          {/* VIEW */}

                          <div className="mt-auto pt-5">

                            <button
                              type="button"
                              onClick={() => {

                                setSelectedActivity(
                                  item
                                );

                                setShowActivityDetails(
                                  true
                                );

                              }}
                              className="w-full rounded-lg bg-[#143B73] px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#0E2D59]"
                            >
                              View Activity
                            </button>

                          </div>

                        </div>

                      </article>

                    );

                  }
                )}

              </div>
            </>
            )}

          {/* SCROLL HINT */}

          {!loading &&
            filteredActivity.length > 1 && (

              <div className="mt-1 flex items-center justify-end gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">

                <span>
                  Scroll to explore timeline
                </span>

                <span className="text-base text-orange-500">
                  →
                </span>

              </div>

            )}

        </section>

                {/* ========================================================= */}
        {/* REQUEST PARTNER DIALOG */}
        {/* ========================================================= */}

        {showRequestDialog && selectedPartner && (

          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-[#07142D]/60 p-0 sm:p-4 backdrop-blur-sm">

            <div className="w-full max-w-xl overflow-hidden rounded-[18px] sm:rounded-[22px] lg:rounded-[28px] border border-slate-200 bg-white shadow-2xl">

              {/* DIALOG HEADER */}

              <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5 lg:px-7 lg:py-6">

                <div className="flex items-start justify-between gap-5">

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-lg sm:text-xl font-black text-orange-600">
                      {requestType === "Scholarship"
                        ? "★"
                        : requestType === "Workshop"
                        ? "✦"
                        : "☎"}
                    </div>

                    <div>

                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                        Partner Request
                      </p>

                      <h3 className="mt-1 text-lg sm:text-xl font-black text-[#07142D]">
                        Request {requestType}
                      </h3>

                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {selectedPartner.institute_name ||
                          selectedPartner.partner_name ||
                          selectedPartner.organization_name ||
                          "Talent Partner"}
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowRequestDialog(false);
                      setSelectedPartner(null);
                      setMessage("");
                    }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-base sm:text-lg font-black text-slate-500 transition hover:bg-slate-200 hover:text-[#07142D]"
                  >
                    ×
                  </button>

                </div>

              </div>

              {/* DIALOG BODY */}

              <div className="px-4 py-4 sm:px-6 sm:py-5 lg:px-7 lg:py-6">

                <div className="grid gap-3 sm:grid-cols-2">

                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">

                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-500">
                      Request Type
                    </p>

                    <p className="mt-1 text-sm font-black text-[#143B73]">
                      {requestType}
                    </p>

                  </div>

                  <div className="rounded-xl border border-orange-100 bg-orange-50/60 px-4 py-3">

                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-orange-500">
                      Request From
                    </p>

                    <p className="mt-1 text-sm font-black text-orange-700">
                      Student Portal
                    </p>

                  </div>

                </div>

                <div className="mt-5">

                  <label className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                    Message To Partner
                  </label>

                  <textarea
                    value={message}
                    onChange={(e) =>
                      setMessage(
                        e.target.value
                      )
                    }
                    rows={5}
                    placeholder={
                      requestType === "Scholarship"
                        ? "Tell the partner why you are interested in this scholarship opportunity..."
                        : requestType === "Workshop"
                        ? "Tell the partner what you would like to learn from this workshop..."
                        : "Share why you would like the partner to contact you..."
                    }
                    className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium leading-6 text-[#07142D] outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
                  />

                </div>

                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">

                  <p className="text-xs font-medium leading-5 text-slate-500">
                    Your existing student identity information will be
                    included with this request using the current
                    marketplace flow.
                  </p>

                </div>

              </div>

              {/* DIALOG ACTIONS */}

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-4 sm:px-6 sm:py-5 lg:px-7 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() => {
                    setShowRequestDialog(false);
                    setSelectedPartner(null);
                    setMessage("");
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-black text-slate-600 transition hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleRequest}
                  className="rounded-xl bg-orange-500 px-6 py-3 text-xs font-black text-white shadow-sm transition hover:bg-orange-600"
                >
                  Submit Request
                </button>

              </div>

            </div>

          </div>

        )}

        {/* ========================================================= */}
        {/* INVITATION DETAILS DIALOG */}
        {/* ========================================================= */}

        {showOfferDetails && selectedOffer && (

          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-[#07142D]/60 p-0 sm:p-4 backdrop-blur-sm">

            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[18px] sm:rounded-[22px] lg:rounded-[28px] border border-slate-200 bg-white shadow-2xl">

              {/* HEADER */}

              <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5 lg:px-7 lg:py-6">

                <div className="flex items-start justify-between gap-5">

                  <div className="flex items-start gap-4">

                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg sm:text-xl font-black ${
                        selectedOffer.type === "Scholarship"
                          ? "bg-orange-50 text-orange-600"
                          : selectedOffer.type === "Workshop"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-purple-50 text-purple-700"
                      }`}
                    >
                      {selectedOffer.type === "Scholarship"
                        ? "★"
                        : selectedOffer.type === "Workshop"
                        ? "✦"
                        : "☎"}
                    </div>

                    <div>

                      <div className="flex flex-wrap items-center gap-2">

                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                          My Invitation
                        </p>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-slate-600">
                          {selectedOffer.type}
                        </span>

                      </div>

                      <h3 className="mt-2 text-lg sm:text-xl font-black leading-7 text-[#07142D]">
                        {selectedOffer.offer_title ||
                          selectedOffer.workshop_title ||
                          "Partner Contact Request"}
                      </h3>

                      <p className="mt-1 text-sm font-bold text-slate-500">
                        {selectedOffer.partner_name ||
                          "Talent Partner"}
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowOfferDetails(false);
                      setSelectedOffer(null);
                    }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-base sm:text-lg font-black text-slate-500 transition hover:bg-slate-200 hover:text-[#07142D]"
                  >
                    ×
                  </button>

                </div>

              </div>

              {/* BODY */}

              <div className="space-y-4 px-4 py-4 sm:px-6 sm:py-5 lg:px-7 lg:py-6">

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Opportunity Description
                  </p>

                  <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
                    {selectedOffer.offer_description ||
                      selectedOffer.workshop_description ||
                      selectedOffer.request_reason ||
                      selectedOffer.description ||
                      "The partner has shared this opportunity with you through the marketplace."}
                  </p>

                </div>

                {selectedOffer.benefits && (

                  <div className="rounded-2xl border border-green-100 bg-green-50/60 p-5">

                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-green-600">
                      Benefits
                    </p>

                    <p className="mt-2 text-sm font-semibold leading-6 text-green-800">
                      {selectedOffer.benefits}
                    </p>

                  </div>

                )}

                {selectedOffer.scholarship_value && (

                  <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-5">

                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-500">
                      Scholarship Value
                    </p>

                    <p className="mt-1.5 sm:mt-2 text-xl sm:text-[22px] lg:text-2xl font-black text-orange-700">
                      {selectedOffer.scholarship_value}
                    </p>

                  </div>

                )}

                <div className="grid gap-3 sm:grid-cols-2">

                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">

                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-500">
                      Invitation Type
                    </p>

                    <p className="mt-1 text-sm font-black text-[#143B73]">
                      {selectedOffer.type}
                    </p>

                  </div>

                  <div className="rounded-xl border border-purple-100 bg-purple-50/60 px-4 py-3">

                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-purple-500">
                      Status
                    </p>

                    <p className="mt-1 text-sm font-black uppercase text-purple-700">
                      {selectedOffer.status || "pending"}
                    </p>

                  </div>

                </div>

              </div>

              {/* ACTIONS */}

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-4 sm:px-6 sm:py-5 lg:px-7 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() => {
                    setShowOfferDetails(false);
                    setSelectedOffer(null);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-black text-slate-600 transition hover:bg-slate-100"
                >
                  Close
                </button>

                {selectedOffer.status !== "accepted" &&
                  selectedOffer.status !== "rejected" && (

                    <>

                      <button
                        type="button"
                        onClick={async () => {

                          await handleOfferAction(
                            selectedOffer,
                            "reject"
                          );

                          setShowOfferDetails(
                            false
                          );

                          setSelectedOffer(
                            null
                          );

                        }}
                        className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-xs font-black text-red-700 transition hover:bg-red-100"
                      >
                        Delete
                      </button>

                      <button
                        type="button"
                        onClick={async () => {

                          await handleOfferAction(
                            selectedOffer,
                            "accept"
                          );

                          setShowOfferDetails(
                            false
                          );

                          setSelectedOffer(
                            null
                          );

                        }}
                        className="rounded-xl bg-green-600 px-6 py-3 text-xs font-black text-white shadow-sm transition hover:bg-green-700"
                      >
                        Accept Invitation
                      </button>

                    </>

                  )}

              </div>

            </div>

          </div>

        )}

        {/* ========================================================= */}
        {/* ACTIVITY / APPLICATION DETAILS DIALOG */}
        {/* ========================================================= */}

        {showActivityDetails && selectedActivity && (

          <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-[#07142D]/60 p-0 sm:p-4 backdrop-blur-sm">

            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[18px] sm:rounded-[22px] lg:rounded-[28px] border border-slate-200 bg-white shadow-2xl">

              {/* HEADER */}

              <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5 lg:px-7 lg:py-6">

                <div className="flex items-start justify-between gap-5">

                  <div>

                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                      Marketplace Details
                    </p>

                    <h3 className="mt-2 text-lg sm:text-xl font-black leading-7 text-[#07142D]">
                      {selectedActivity.activity_title ||
                        selectedActivity.offer_title ||
                        selectedActivity.workshop_title ||
                        selectedActivity.request_title ||
                        "Opportunity Details"}
                    </h3>

                    <p className="mt-1 text-sm font-bold text-slate-500">
                      {selectedActivity.partner_name ||
                        selectedActivity.institute_name ||
                        selectedActivity.organization_name ||
                        "Talent Partner"}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowActivityDetails(false);
                      setSelectedActivity(null);
                    }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-base sm:text-lg font-black text-slate-500 transition hover:bg-slate-200 hover:text-[#07142D]"
                  >
                    ×
                  </button>

                </div>

              </div>

              {/* BODY */}

              <div className="space-y-4 px-4 py-4 sm:px-6 sm:py-5 lg:px-7 lg:py-6">

                <div className="grid gap-3 sm:grid-cols-2">

                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-4">

                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-500">
                      Activity Type
                    </p>

                    <p className="mt-1 text-sm font-black capitalize text-[#143B73]">
                      {selectedActivity.request_type ||
                        selectedActivity.type ||
                        selectedActivity.activity_type ||
                        selectedActivity.offer_type ||
                        "Opportunity"}
                    </p>

                  </div>

                  <div className="rounded-xl border border-orange-100 bg-orange-50/60 px-4 py-4">

                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-orange-500">
                      Status
                    </p>

                    <p className="mt-1 text-sm font-black uppercase text-orange-700">
                      {selectedActivity.status ||
                        "pending"}
                    </p>

                  </div>

                </div>

                {(selectedActivity.message ||
                  selectedActivity.description ||
                  selectedActivity.offer_description ||
                  selectedActivity.workshop_description ||
                  selectedActivity.request_reason) && (

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Details
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-6 text-slate-700">
                      {selectedActivity.message ||
                        selectedActivity.description ||
                        selectedActivity.offer_description ||
                        selectedActivity.workshop_description ||
                        selectedActivity.request_reason}
                    </p>

                  </div>

                )}

                {selectedActivity.created_at && (

                  <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-5">

                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-purple-500">
                      Activity Date
                    </p>

                    <p className="mt-2 text-sm font-black text-purple-700">
                      {new Date(
                        selectedActivity.created_at
                      ).toLocaleString(
                        "en-US",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>

                  </div>

                )}

                {selectedActivity.metadata && (

                  <div className="rounded-2xl border border-slate-200 bg-white p-5">

                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Opportunity Information
                    </p>

                    <div className="mt-3 space-y-2">

                      {Object.entries(
                        selectedActivity.metadata
                      ).map(
                        ([key, value]) => (

                          <div
                            key={key}
                            className="flex items-start justify-between gap-5 border-b border-slate-100 py-2 last:border-b-0"
                          >

                            <span className="text-xs font-bold capitalize text-slate-500">
                              {key.replace(
                                /_/g,
                                " "
                              )}
                            </span>

                            <span className="max-w-[60%] text-right text-xs font-black text-[#07142D]">
                              {typeof value ===
                                "object"
                                ? JSON.stringify(
                                    value
                                  )
                                : String(
                                    value ??
                                      "-"
                                  )}
                            </span>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

              </div>

              {/* FOOTER */}

              <div className="flex justify-end border-t border-slate-100 bg-slate-50/70 px-4 py-4 sm:px-6 sm:py-5 lg:px-7">

                <button
                  type="button"
                  onClick={() => {
                    setShowActivityDetails(false);
                    setSelectedActivity(null);
                  }}
                  className="rounded-xl bg-[#143B73] px-6 py-3 text-xs font-black text-white transition hover:bg-[#0E2D59]"
                >
                  Close Details
                </button>

              </div>

            </div>

          </div>

        )}

              </div>

    </div>
  );
}
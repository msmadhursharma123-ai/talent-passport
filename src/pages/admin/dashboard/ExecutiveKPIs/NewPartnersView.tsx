import { useEffect, useState } from "react";

import {
  fetchPartnersMaster,
} from "../../../../supabaseClient";

import ExecutiveDrawerTabs from "./ExecutiveDrawerTabs";

import ExecutiveDrawerFilters, {
  type ExecutiveFilter,
} from "./ExecutiveDrawerFilters";

import ExecutiveDrawerTable, {
  type ExecutiveTableColumn,
} from "./ExecutiveDrawerTable";

interface PartnerRecord {
  id: string;

  partner_name: string;

  institute_city: string;

  specialization: string;

  status: string;

  created_at: string;
}

export default function NewPartnersView() {
  const [timeRange, setTimeRange] =
    useState<
      "today" |
      "last7Days" |
      "last30Days"
    >("today");

  const [partners, setPartners] =
    useState<PartnerRecord[]>([]);

  const [filters, setFilters] =
    useState<ExecutiveFilter[]>([
      {
        id: "search",
        label: "Search Partner",
        type: "search",
        value: "",
      },
      {
        id: "city",
        label: "City",
        type: "select",
        value: "",
        options: [],
      },
      {
        id: "specialization",
        label: "Specialization",
        type: "select",
        value: "",
        options: [],
      },
      {
        id: "status",
        label: "Status",
        type: "select",
        value: "",
        options: [],
      },
    ]);

  useEffect(() => {
    loadPartners();
  }, []);

  async function loadPartners() {
    const data =
      await fetchPartnersMaster();

    setPartners(data);

    setFilters((previous) =>
      previous.map((filter) => {
        if (filter.id === "city") {
          return {
            ...filter,
            options: [
              ...new Set(
                data
                  .map(
                    (r) =>
                      r.institute_city
                  )
                  .filter(Boolean)
              ),
            ] as string[],
          };
        }

        if (
          filter.id ===
          "specialization"
        ) {
          return {
            ...filter,
            options: [
              ...new Set(
                data
                  .map(
                    (r) =>
                      r.specialization
                  )
                  .filter(Boolean)
              ),
            ] as string[],
          };
        }

        if (
          filter.id === "status"
        ) {
          return {
            ...filter,
            options: [
              ...new Set(
                data
                  .map(
                    (r) =>
                      r.status
                  )
                  .filter(Boolean)
              ),
            ] as string[],
          };
        }

        return filter;
      })
    );
  }

  const columns: ExecutiveTableColumn[] =
    [
      {
        key: "partner",
        title: "Partner",
        width: "2fr",
      },
      {
        key: "city",
        title: "City",
      },
      {
        key: "specialization",
        title: "Specialization",
      },
      {
        key: "status",
        title: "Status",
      },
      {
        key: "joinedOn",
        title: "Joined On",
      },
    ];

  const now = new Date();

  const filteredPartners =
    partners.filter((partner) => {
      const created =
        new Date(
          partner.created_at
        );

      switch (timeRange) {
        case "today":
          return (
            created.toDateString() ===
            now.toDateString()
          );

        case "last7Days":
          return (
            now.getTime() -
              created.getTime() <=
            7 *
              24 *
              60 *
              60 *
              1000
          );

        case "last30Days":
          return (
            now.getTime() -
              created.getTime() <=
            30 *
              24 *
              60 *
              60 *
              1000
          );

        default:
          return true;
      }
    });

  const search =
    filters
      .find(
        (f) =>
          f.id === "search"
      )
      ?.value.toLowerCase() ??
    "";

  const selectedCity =
    filters.find(
      (f) =>
        f.id === "city"
    )?.value ?? "";

  const selectedSpecialization =
    filters.find(
      (f) =>
        f.id ===
        "specialization"
    )?.value ?? "";

  const selectedStatus =
    filters.find(
      (f) =>
        f.id === "status"
    )?.value ?? "";

  const finalPartners =
    filteredPartners.filter(
      (partner) => {
        const matchesSearch =
          partner.partner_name
            .toLowerCase()
            .includes(search);

        const matchesCity =
          !selectedCity ||
          partner.institute_city ===
            selectedCity;

        const matchesSpecialization =
          !selectedSpecialization ||
          partner.specialization ===
            selectedSpecialization;

        const matchesStatus =
          !selectedStatus ||
          partner.status ===
            selectedStatus;

        return (
          matchesSearch &&
          matchesCity &&
          matchesSpecialization &&
          matchesStatus
        );
      }
    );

  const rows =
    finalPartners.map(
      (partner) => ({
        partner:
          partner.partner_name,
        city:
          partner.institute_city,
        specialization:
          partner.specialization,
        status:
          partner.status,
        joinedOn: new Date(
          partner.created_at
        ).toLocaleDateString(),
      })
    );

  function handleFilterChange(
    id: string,
    value: string
  ) {
    setFilters((previous) =>
      previous.map((filter) =>
        filter.id === id
          ? {
              ...filter,
              value,
            }
          : filter
      )
    );
  }

  return (
    <>
      <ExecutiveDrawerTabs
        value={timeRange}
        onChange={
          setTimeRange
        }
      />

      <ExecutiveDrawerFilters
        filters={filters}
        onChange={
          handleFilterChange
        }
      />

      <div
        style={{
          display: "flex",
          justifyContent:
            "flex-end",
          marginTop: 12,
          marginBottom: 12,
          fontSize: 14,
          color: "#64748B",
          fontWeight: 600,
        }}
      >
        Showing{" "}
        {rows.length} Partner
        {rows.length === 1
          ? ""
          : "s"}
      </div>

      <ExecutiveDrawerTable
        columns={columns}
        rows={rows}
        emptyMessage="No partners found."
      />
    </>
  );
}
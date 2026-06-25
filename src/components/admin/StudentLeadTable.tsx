import React, {
  useMemo,
  useState
} from "react";

interface Props {
  students: any[];
  leads: any[];

  selectedStudents: string[];

  setSelectedStudents: (
    ids: string[]
  ) => void;

  onAllocate: () => void;

  onHistory: () => void;
}

export default function StudentLeadTable({

  students,
  leads,

  selectedStudents,
  setSelectedStudents,

  onAllocate,
  onHistory

}: Props) {

  const [search,
    setSearch] =
    useState("");

  const [schoolFilter,
    setSchoolFilter] =
    useState("All");

  const [classFilter,
    setClassFilter] =
    useState("All");

  const [activityFilter,
    setActivityFilter] =
    useState("All");

  const [cityFilter,
    setCityFilter] =
    useState("All");

  const [areaFilter,
    setAreaFilter] =
    useState("All");

  const [statusFilter,
    setStatusFilter] =
    useState("All");

 const schools = [
  ...new Set(
    students
      .map(s => s.school_name)
      .filter(Boolean)
  ),
];

const classes = [
  ...new Set(
    students
      .map(s => s.class_name)
      .filter(Boolean)
  ),
];

const cities = [
  ...new Set(
    students
      .map(s => s.residence_city)
      .filter(Boolean)
  ),
];

const areas = [
  ...new Set(
    students
      .map(s => s.residence_area)
      .filter(Boolean)
  ),
];

const activities = [
  ...new Set(
    students
      .map(s => s.favourite_activity)
      .filter(Boolean)
  ),
];

  function getLeadStatus(
    studentId: string
  ) {

    const lead =
      leads.find(
        l =>
          l.student_id ===
          studentId
      );

    return (
      lead?.status ||
      "Unallocated"
    );
  }

  const filteredStudents =
    useMemo(() => {

      return students.filter(
        student => {

          const leadStatus =
            getLeadStatus(
              student.student_id
            );

          const matchesSearch =
            (
              student.student_name ||
              ""
            )
              .toLowerCase()
              .includes(
                search
                  .toLowerCase()
              );

         const matchesSchool =
  schoolFilter === "All" ||
  String(student.school_name)
      .trim()
      .toLowerCase() ===
  schoolFilter
      .trim()
      .toLowerCase();

          const matchesClass =
            classFilter ===
              "All" ||
            String(
              student.class_name
            ) ===
              String(
                classFilter
              );

         const matchesActivity =
  activityFilter === "All" ||
  String(student.favourite_activity)
      .trim()
      .toLowerCase() ===
  activityFilter
      .trim()
      .toLowerCase();

         const matchesCity =
  cityFilter === "All" ||
  String(student.residence_city)
      .trim()
      .toLowerCase() ===
  cityFilter
      .trim()
      .toLowerCase();

          const matchesArea =
  areaFilter === "All" ||
  String(student.residence_area)
      .trim()
      .toLowerCase() ===
  areaFilter
      .trim()
      .toLowerCase();

         const matchesStatus =
  statusFilter === "All" ||
  leadStatus.toLowerCase() ===
  statusFilter.toLowerCase().replace(" ", "_");

          return (
            matchesSearch &&
            matchesSchool &&
            matchesClass &&
            matchesActivity &&
            matchesCity &&
            matchesArea &&
            matchesStatus
          );
        }
      );

    }, [

      students,
      search,

      schoolFilter,
      classFilter,

      activityFilter,
      cityFilter,
      areaFilter,

      statusFilter,
      leads
    ]);

  function toggleStudent(
    studentId: string
  ) {

    if (
      selectedStudents.includes(
        studentId
      )
    ) {

      setSelectedStudents(
        selectedStudents.filter(
          id =>
            id !== studentId
        )
      );

      return;
    }

    setSelectedStudents([
      ...selectedStudents,
      studentId
    ]);
  }

  function toggleAll() {

    if (
      selectedStudents.length ===
      filteredStudents.length
    ) {

      setSelectedStudents([]);

      return;
    }

    setSelectedStudents(
      filteredStudents.map(
        s => s.student_id
      )
    );
  }

  return (

    <div
      style={{
        background:"white",
        borderRadius:"24px",
        padding:"24px",
        marginTop:"20px"
      }}
    >

      <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
    gap: 24,
    flexWrap: "wrap"
  }}
>
  <div>
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "#EEF4FF",
        color: "#143B73",
        padding: "6px 12px",
        borderRadius: 999,
        fontWeight: 700,
        fontSize: 12,
        marginBottom: 14
      }}
    >
      ● STUDENT CRM
    </div>

    <h2
      style={{
        margin: 0,
        fontSize: 28,
        fontWeight: 700,
        color: "#0F172A"
      }}
    >
      Student Registry
    </h2>

    <p
      style={{
        marginTop: 10,
        color: "#64748B",
        maxWidth: 620,
        lineHeight: 1.7,
        marginBottom: 0
      }}
    >
      Search, filter, allocate and monitor every student lead from one
      intelligent registry. This is the central command centre for partner
      allocations.
    </p>
  </div>

  <div
    style={{
      display: "flex",
      gap: 12,
      alignItems: "center",
      flexWrap: "wrap"
    }}
  >
    <button
      onClick={onAllocate}
      style={{
        background: "#143B73",
        color: "#fff",
        border: "none",
        padding: "12px 20px",
        borderRadius: 14,
        cursor: "pointer",
        fontWeight: 600
      }}
    >
      🎯 Allocate Leads
    </button>

    <button
      onClick={onHistory}
      style={{
        background: "#F97316",
        color: "#fff",
        border: "none",
        padding: "12px 20px",
        borderRadius: 14,
        cursor: "pointer",
        fontWeight: 600
      }}
    >
      📜 Allocation History
    </button>
  </div>
</div>

      {/* FILTERS */}

<div
  style={{
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    boxShadow: "0 8px 24px rgba(15,23,42,.05)",
  }}
>
  {/* Top Row */}
  <div
    style={{
      display: "flex",
      gap: 16,
      alignItems: "center",
      marginBottom: 28,
      flexWrap: "wrap",
    }}
  >
    <div
      style={{
        flex: 1,
        minWidth: 320,
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
        placeholder="Search student by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          height: 50,
          padding: "0 18px 0 48px",
          borderRadius: 14,
          border: "1px solid #E2E8F0",
          outline: "none",
          fontSize: 14,
          background: "#F8FAFC",
          boxSizing: "border-box",
        }}
      />
    </div>

    <button
      onClick={() => {
        setSchoolFilter("All");
        setClassFilter("All");
        setActivityFilter("All");
        setCityFilter("All");
        setAreaFilter("All");
        setStatusFilter("All");
        setSearch("");
      }}
      style={{
        height: 50,
        padding: "0 22px",
        borderRadius: 14,
        border: "1px solid #E2E8F0",
        background: "#FFFFFF",
        cursor: "pointer",
        fontWeight: 600,
        color: "#475569",
      }}
    >
      ↺ Reset Filters
    </button>
  </div>

  {/* Filter Cards */}
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
      gap: 16,
    }}
  >
    {[
      {
        icon: "🏫",
        label: "School",
        value: schoolFilter,
        setter: setSchoolFilter,
        options: schools,
      },
      {
        icon: "📚",
        label: "Class",
        value: classFilter,
        setter: setClassFilter,
        options: classes,
      },
      {
        icon: "🎯",
        label: "Activity",
        value: activityFilter,
        setter: setActivityFilter,
        options: activities,
      },
      {
        icon: "📍",
        label: "City",
        value: cityFilter,
        setter: setCityFilter,
        options: cities,
      },
      {
        icon: "📌",
        label: "Area",
        value: areaFilter,
        setter: setAreaFilter,
        options: areas,
      },
      {
        icon: "🚦",
        label: "Status",
        value: statusFilter,
        setter: setStatusFilter,
        options: [
          "Allocated",
          "Contacted",
          "Counselling",
          "Admitted",
          "Rejected",
          "Unallocated",
        ],
      },
    ].map((filter) => (
      <div
        key={filter.label}
        style={{
          background: "#F8FAFC",
          border: "1px solid #E2E8F0",
          borderRadius: 16,
          padding: "16px",
        }}
      >
        <div
          style={{
            fontSize: 11,
fontWeight: 700,
letterSpacing: ".05em",
textTransform: "uppercase",
color: "#64748B",
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>{filter.icon}</span>
          {filter.label}
        </div>

        <select
          value={filter.value}
          onChange={(e) => filter.setter(e.target.value)}
          style={{
            width: "100%",
            border: "none",
            background: "transparent",
            fontSize: 14,
            fontWeight: 600,
            color: "#0F172A",
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="All">
            All {filter.label}
          </option>

          {filter.options.map((item: any) => (
            <option
              key={String(item)}
              value={String(item)}
            >
              {String(item)}
            </option>
          ))}
        </select>
      </div>
    ))}
  </div>

  {(schoolFilter !== "All" ||
    classFilter !== "All" ||
    activityFilter !== "All" ||
    cityFilter !== "All" ||
    areaFilter !== "All" ||
    statusFilter !== "All") && (
    <div
      style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        marginTop: 18,
      }}
    >
      {[
        schoolFilter !== "All" && `🏫 ${schoolFilter}`,
        classFilter !== "All" && `📚 ${classFilter}`,
        activityFilter !== "All" && `🎯 ${activityFilter}`,
        cityFilter !== "All" && `📍 ${cityFilter}`,
        areaFilter !== "All" && `📌 ${areaFilter}`,
        statusFilter !== "All" && `🚦 ${statusFilter}`,
      ]
        .filter(Boolean)
        .map((chip) => (
          <div
            key={chip as string}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              background: "#EEF4FF",
              color: "#143B73",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {chip}
          </div>
        ))}
    </div>
  )}
</div>

     {/* STUDENT REGISTRY */}

<div
  style={{
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0 10px 24px rgba(15,23,42,.05)",
  }}
>
  <div
    style={{
      overflowX: "auto",
    }}
  >
    <table
      style={{
        width: "100%",
        minWidth: 1500,
        borderCollapse: "collapse",
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
              width: 60,
              padding: "18px 14px",
              textAlign: "center",
            }}
          >
            <input
              type="checkbox"
              checked={
                filteredStudents.length > 0 &&
                selectedStudents.length === filteredStudents.length
              }
              onChange={toggleAll}
            />
          </th>

          {[
            "Student",
            "Mobile",
            "Email",
            "School",
            "Class",
            "Age",
            "Gender",
            "City",
            "Area",
            "Activity",
            "Lead Status",
          ].map((heading) => (
            <th
              key={heading}
              style={{
                padding: "18px 16px",
                textAlign: "left",
                fontSize: 13,
                fontWeight: 700,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: ".05em",
                whiteSpace: "nowrap",
              }}
            >
              {heading}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>

          {filteredStudents.map((student) => {
  const status = getLeadStatus(student.student_id);

  const statusConfig: Record<
    string,
    { bg: string; color: string; label: string }
  > = {
    Unallocated: {
      bg: "#F1F5F9",
      color: "#64748B",
      label: "Unallocated",
    },
    allocated: {
      bg: "#DCFCE7",
      color: "#166534",
      label: "Allocated",
    },
    contacted: {
      bg: "#DBEAFE",
      color: "#1D4ED8",
      label: "Contacted",
    },
    counselling: {
      bg: "#FEF3C7",
      color: "#92400E",
      label: "Counselling",
    },
    counselling_scheduled: {
      bg: "#EDE9FE",
      color: "#6D28D9",
      label: "Counselling",
    },
    admitted: {
      bg: "#DCFCE7",
      color: "#15803D",
      label: "Admitted",
    },
    rejected: {
      bg: "#FEE2E2",
      color: "#B91C1C",
      label: "Rejected",
    },
    new_lead: {
      bg: "#E0F2FE",
      color: "#0369A1",
      label: "New Lead",
    },
  };

  const badge =
    statusConfig[status] ??
    {
      bg: "#F1F5F9",
      color: "#475569",
      label: status,
    };

  return (
    <tr
      key={student.student_id}
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
          padding: "18px 14px",
          textAlign: "center",
        }}
      >
        <input
          type="checkbox"
          checked={selectedStudents.includes(student.student_id)}
          onChange={() => toggleStudent(student.student_id)}
        />
      </td>

      <td
        style={{
          padding: "18px 16px",
          minWidth: 220,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            color: "#0F172A",
            fontSize: 15,
          }}
        >
          {student.student_name}
        </div>

        <div
          style={{
            fontSize: 12,
            color: "#64748B",
            marginTop: 4,
          }}
        >
          {student.student_id}
        </div>
      </td>

      <td style={{ padding: "18px 16px" }}>
        {student.phone || "-"}
      </td>

      <td style={{ padding: "18px 16px" }}>
        {student.student_email || "-"}
      </td>

      <td
        style={{
          padding: "18px 16px",
          fontWeight: 600,
        }}
      >
        {student.school_name}
      </td>

      <td style={{ padding: "18px 16px" }}>
        {student.class_name}
      </td>

      <td style={{ padding: "18px 16px" }}>
        {student.student_age}
      </td>

      <td style={{ padding: "18px 16px" }}>
        {student.gender}
      </td>

      <td style={{ padding: "18px 16px" }}>
        {student.residence_city}
      </td>

      <td style={{ padding: "18px 16px" }}>
        {student.residence_area}
      </td>

      <td
        style={{
          padding: "18px 16px",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "6px 12px",
            borderRadius: 999,
            background: "#EEF4FF",
            color: "#143B73",
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          {student.favourite_activity}
        </span>
      </td>

      <td
        style={{
          padding: "18px 16px",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "7px 14px",
            borderRadius: 999,
            background: badge.bg,
            color: badge.color,
            fontWeight: 700,
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
        >
          {badge.label}
        </span>
      </td>
    </tr>
  );
})}
      </tbody>
    </table>
  </div>
</div>
</div>
 );}

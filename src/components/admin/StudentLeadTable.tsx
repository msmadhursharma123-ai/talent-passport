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

  const schools =
    Array.from(
      new Set(
        students.map(
          s => s.school_name
        )
      )
    );

  const classes =
    Array.from(
      new Set(
        students.map(
          s => s.class_name
        )
      )
    );

  const activities =
    Array.from(
      new Set(
        students.map(
          s =>
            s.favourite_activity
        )
      )
    );

  const cities =
    Array.from(
      new Set(
        students.map(
          s =>
            s.residence_city
        )
      )
    );

  const areas =
    Array.from(
      new Set(
        students.map(
          s =>
            s.residence_area
        )
      )
    );

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
            schoolFilter ===
              "All" ||
            student.school_name ===
              schoolFilter;

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
            activityFilter ===
              "All" ||
            student.favourite_activity ===
              activityFilter;

          const matchesCity =
            cityFilter ===
              "All" ||
            student.residence_city ===
              cityFilter;

          const matchesArea =
            areaFilter ===
              "All" ||
            student.residence_area ===
              areaFilter;

          const matchesStatus =
            statusFilter ===
              "All" ||
            leadStatus ===
              statusFilter;

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
          display:"flex",
          justifyContent:
            "space-between",
          alignItems:"center",
          marginBottom:"20px"
        }}
      >

        <h2>
          Student Lead Registry
        </h2>

        <div
          style={{
            display:"flex",
            gap:"12px"
          }}
        >

          <button
            onClick={onAllocate}
            style={{
              background:"#143B73",
              color:"white",
              border:"none",
              padding:
                "12px 18px",
              borderRadius:
                "12px",
              cursor:"pointer"
            }}
          >
            Allot Leads
          </button>

          <button
            onClick={onHistory}
            style={{
              background:"#F4A623",
              color:"white",
              border:"none",
              padding:
                "12px 18px",
              borderRadius:
                "12px",
              cursor:"pointer"
            }}
          >
            Allocation History
          </button>

        </div>

      </div>

      {/* FILTERS */}

      <div
        style={{
          display:"grid",
          gridTemplateColumns:
            "repeat(6,1fr)",
          gap:"12px",
          marginBottom:"20px"
        }}
      >

        <input
          placeholder=
            "Search Student"
          value={search}
          onChange={(e)=>
            setSearch(
              e.target.value
            )
          }
        />

        <select
          value={schoolFilter}
          onChange={(e)=>
            setSchoolFilter(
              e.target.value
            )
          }
        >
          <option>All</option>

          {schools.map(
            school => (
              <option
                key={school}
              >
                {school}
              </option>
            )
          )}

        </select>

        <select
          value={classFilter}
          onChange={(e)=>
            setClassFilter(
              e.target.value
            )
          }
        >
          <option>All</option>

          {classes.map(
            cls => (
              <option
                key={cls}
              >
                {cls}
              </option>
            )
          )}

        </select>

        <select
          value={activityFilter}
          onChange={(e)=>
            setActivityFilter(
              e.target.value
            )
          }
        >
          <option>All</option>

          {activities.map(
            activity => (
              <option
                key={activity}
              >
                {activity}
              </option>
            )
          )}

        </select>

        <select
          value={cityFilter}
          onChange={(e)=>
            setCityFilter(
              e.target.value
            )
          }
        >
          <option>All</option>

          {cities.map(
            city => (
              <option
                key={city}
              >
                {city}
              </option>
            )
          )}

        </select>

        <select
          value={areaFilter}
          onChange={(e)=>
            setAreaFilter(
              e.target.value
            )
          }
        >
          <option>All</option>

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
          borderCollapse:
            "collapse"
        }}
      >

        <thead>

          <tr>

            <th>

              <input
                type="checkbox"
                checked={
                  filteredStudents
                    .length > 0 &&
                  selectedStudents
                    .length ===
                  filteredStudents
                    .length
                }
                onChange={
                  toggleAll
                }
              />

            </th>

            <th>Student</th>
            <th>Mobile</th>
            <th>Email</th>

            <th>School</th>
            <th>Class</th>

            <th>Age</th>
            <th>Gender</th>

            <th>City</th>
            <th>Area</th>

            <th>Activity</th>

            <th>
              Lead Status
            </th>

          </tr>

        </thead>

        <tbody>

          {filteredStudents.map(
            student => {

              const status =
                getLeadStatus(
                  student.student_id
                );

              return (

                <tr
                  key={
                    student.student_id
                  }
                >

                  <td>

                    <input
                      type="checkbox"
                      checked={
                        selectedStudents.includes(
                          student.student_id
                        )
                      }
                      onChange={() =>
                        toggleStudent(
                          student.student_id
                        )
                      }
                    />

                  </td>

                  <td>
                    {
                      student.student_name
                    }
                  </td>

                  <td>
                    {
                      student.phone
                    }
                  </td>

                  <td>
                    {
                      student.student_email
                    }
                  </td>

                  <td>
                    {
                      student.school_name
                    }
                  </td>

                  <td>
                    {
                      student.class_name
                    }
                  </td>

                  <td>
                    {
                      student.student_age
                    }
                  </td>

                  <td>
                    {
                      student.gender
                    }
                  </td>

                  <td>
                    {
                      student.residence_city
                    }
                  </td>

                  <td>
                    {
                      student.residence_area
                    }
                  </td>

                  <td>
                    {
                      student.favourite_activity
                    }
                  </td>

                  <td>

                    <span
                      style={{
                        background:
                          status ===
                          "Unallocated"
                            ? "#F3F4F6"
                            : "#DCFCE7",

                        color:
                          status ===
                          "Unallocated"
                            ? "#475569"
                            : "#166534",

                        padding:
                          "6px 10px",

                        borderRadius:
                          "999px",

                        fontSize:
                          "12px",

                        fontWeight:
                          600
                      }}
                    >
                      {status}
                    </span>

                  </td>

                </tr>

              );
            }
          )}

        </tbody>

      </table>

    </div>
  );
}
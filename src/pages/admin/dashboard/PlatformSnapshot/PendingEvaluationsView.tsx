import { useMemo, useState } from "react";

interface SubmissionRecord {
  id: string;
  student_name: string;
  competition_name?: string | null;
  event_name?: string | null;
  pathway?: string | null;
  school_name?: string | null;
  class_name?: string | null;
  created_at: string;
  overall_score?: number | null;
  processing_status?: string | null;
}

interface Props {
  records: SubmissionRecord[];
}

export default function PendingEvaluationsView({
  records,
}: Props) {
  const [search, setSearch] =
    useState("");

  const [selectedSchool, setSelectedSchool] =
    useState("");

  const [selectedClass, setSelectedClass] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const schoolOptions =
    useMemo(() => {
      return [
        ...new Set(
          records
            .map((x) => x.school_name)
            .filter(Boolean)
        ),
      ].sort();
    }, [records]);



  const classOptions =
    useMemo(() => {
      return [
        ...new Set(
          records
            .map((x) => x.class_name)
            .filter(Boolean)
        ),
      ].sort();
    }, [records]);

  const categoryOptions =
    useMemo(() => {
      return [
        ...new Set(
          records
            .map((x) => x.pathway)
            .filter(Boolean)
        ),
      ].sort();
    }, [records]);

  const filtered =
    useMemo(() => {

        console.log("Pending Records");
console.table(
  records.map((record) => ({
    student: record.student_name,
    competition: record.competition_name,
    overall_score: record.overall_score,
    processing_status: record.processing_status,
  }))
);

      return records.filter(
        (record) => {
          const pending =
            record.overall_score ===
              null ||
            record.overall_score ===
              undefined;

          const matchesSearch =
            record.student_name
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            (
              record.school_name ??
              ""
            )
              .toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesSchool =
            !selectedSchool ||
            record.school_name ===
              selectedSchool;

          const matchesClass =
            !selectedClass ||
            record.class_name ===
              selectedClass;

          const matchesCategory =
            !selectedCategory ||
            record.pathway ===
              selectedCategory;

          return (
            pending &&
            matchesSearch &&
            matchesSchool &&
            matchesClass &&
            matchesCategory
          );
        }
      );
    }, [
      records,
      search,
      selectedSchool,
      selectedClass,
      selectedCategory,
    ]);

const schoolCount = useMemo(() => {
  return new Set(
    filtered
      .map((record) => record.school_name)
      .filter(Boolean)
  ).size;
}, [filtered]);

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "2fr 1fr 1fr 1fr",
          gap: 16,
          marginBottom: 22,
        }}
      >
        <input
          placeholder="Search Student / School"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          style={{
            height: 42,
            border:
              "1px solid #CBD5E1",
            borderRadius: 8,
            padding: "0 14px",
          }}
        />

        <select
          value={selectedSchool}
          onChange={(e) =>
            setSelectedSchool(
              e.target.value
            )
          }
          style={{
            height: 42,
            border:
              "1px solid #CBD5E1",
            borderRadius: 8,
          }}
        >
          <option value="">
            All Schools
          </option>

          {schoolOptions.map(
            (item) => (
              <option
                key={item}
                value={item!}
              >
                {item}
              </option>
            )
          )}
        </select>

        <select
          value={selectedClass}
          onChange={(e) =>
            setSelectedClass(
              e.target.value
            )
          }
          style={{
            height: 42,
            border:
              "1px solid #CBD5E1",
            borderRadius: 8,
          }}
        >
          <option value="">
            All Classes
          </option>

          {classOptions.map(
            (item) => (
              <option
                key={item}
                value={item!}
              >
                {item}
              </option>
            )
          )}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) =>
            setSelectedCategory(
              e.target.value
            )
          }
          style={{
            height: 42,
            border:
              "1px solid #CBD5E1",
            borderRadius: 8,
          }}
        >
          <option value="">
            All Categories
          </option>

          {categoryOptions.map(
            (item) => (
              <option
                key={item}
                value={item!}
              >
                {item}
              </option>
            )
          )}
        </select>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent:
            "flex-end",
          marginBottom: 18,
          color: "#64748B",
          fontWeight: 600,
        }}
      >
        <div
    style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 18,
        color: "#64748B",
        fontWeight: 600,
    }}
>
    <div>
        {filtered.length} Pending Evaluations
    </div>

    <div>
        Across {schoolCount} Schools
    </div>
</div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "2fr 2fr 1.4fr 2fr 120px 140px",
          padding: "14px 20px",
          background: "#F8FAFC",
          border:
            "1px solid #E2E8F0",
          borderBottom: "none",
          fontWeight: 700,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        <div>Student</div>
        <div>Competition</div>
        <div>Category</div>
        <div>School</div>
        <div>Class</div>
        <div>Status</div>
      </div>

            <div
        style={{
          border: "1px solid #E2E8F0",
          borderTop: "none",
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          overflow: "hidden",
        }}
      >
        {filtered.length === 0 ? (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "#64748B",
              fontWeight: 500,
            }}
          >
            🎉 No Pending Evaluations
          </div>
        ) : (
          filtered.map((record, index) => (
            <div
              key={record.id}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "2fr 2fr 1.4fr 2fr 120px 140px",
                padding: "14px 20px",
                alignItems: "center",
                borderBottom:
                  index === filtered.length - 1
                    ? "none"
                    : "1px solid #E2E8F0",
                background:
                  index % 2 === 0
                    ? "#FFFFFF"
                    : "#FAFAFA",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    color: "#0F172A",
                  }}
                >
                  {record.student_name}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: "#64748B",
                    marginTop: 4,
                  }}
                >
                  {new Date(
                    record.created_at
                  ).toLocaleDateString()}
                </div>
              </div>

              <div
                style={{
                  fontWeight: 500,
                }}
              >
                {record.competition_name ||
                  record.event_name ||
                  "-"}
              </div>

              <div>
                <span
                  style={{
                    display: "inline-flex",
                    padding:
                      "5px 12px",
                    borderRadius: 999,
                    background: "#EEF2FF",
                    color: "#4338CA",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {record.pathway ??
                    "-"}
                </span>
              </div>

              <div>
                {record.school_name ??
                  "-"}
              </div>

              <div>
                {record.class_name ??
                  "-"}
              </div>

              <div>
               {(() => {
  const status =
    record.processing_status;

  const overall =
    record.overall_score;

  let background =
    "#FEF3C7";

  let color =
    "#92400E";

  let label =
    "Pending Evaluation";

  if (
    status === "Processing"
  ) {
    background =
      "#DBEAFE";

    color =
      "#1D4ED8";

    label =
      "Processing";
  }

  else if (
    status === "Failed"
  ) {
    background =
      "#FEE2E2";

    color =
      "#991B1B";

    label =
      "Failed";
  }

  else if (
    overall !== null &&
    overall !== undefined
  ) {
    background =
      "#DCFCE7";

    color =
      "#166534";

    label =
      "Evaluated";
  }

  return (
    <span
      style={{
        display:
          "inline-flex",

        justifyContent:
          "center",

        alignItems:
          "center",

        padding:
          "6px 12px",

        borderRadius:
          999,

        background,

        color,

        fontWeight: 600,

        fontSize: 12,
      }}
    >
      {label}
    </span>
  );
})()}
              </div>
            </div>
          ))
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginTop: 18,
          color: "#64748B",
          fontWeight: 600,
        }}
      >
        <div>
          Total Pending Evaluations
        </div>

        <div>
          {filtered.length}
        </div>
      </div>
    </>
  );
}
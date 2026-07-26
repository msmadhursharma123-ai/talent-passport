import React from "react";

interface TimelineFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;

  filterYear: string;
  setFilterYear: (value: string) => void;

  filterCategory: string;
  setFilterCategory: (value: string) => void;

  filterLevel: string;
  setFilterLevel: (value: string) => void;

  achievements: Array<{
    achievement_year: number;
    activity_category: string;
  }>;
  onAddAchievement: () => void;
}

export default function TimelineFilters({
  searchTerm,
  setSearchTerm,
  filterYear,
  setFilterYear,
  filterCategory,
  setFilterCategory,
  filterLevel,
  setFilterLevel,
  achievements,
  onAddAchievement,
}: TimelineFiltersProps) {

  const years = [
    ...new Set(
      achievements.map(
        (item) => item.achievement_year
      )
    ),
  ];

  const categories = [
    ...new Set(
      achievements
        .map(
          (item) => item.activity_category
        )
        .filter(Boolean)
    ),
  ];

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    minWidth: 0,
    padding: "13px 14px",
    borderRadius: 12,
    border: "1px solid #E2E8F0",
    background: "#FFFFFF",
    color: "#0F172A",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 24,
        padding: 20,
        marginBottom: 30,
        border: "1px solid #E2E8F0",
        boxShadow: "0 4px 16px rgba(15,23,42,.04)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
          gap: 15,
          alignItems: "center",
        }}
      >
        {/* SEARCH */}

        <input
          placeholder="Search Achievement..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
          style={fieldStyle}
        />

        {/* YEAR */}

        <select
          value={filterYear}
          onChange={(e) =>
            setFilterYear(e.target.value)
          }
          style={fieldStyle}
        >
          <option value="All">
            All Years
          </option>

          {years.map((year) => (
            <option
              key={year}
              value={String(year)}
            >
              {year}
            </option>
          ))}
        </select>

   

        {/* CATEGORY */}

        <select
          value={filterCategory}
          onChange={(e) =>
            setFilterCategory(e.target.value)
          }
          style={fieldStyle}
        >
          <option value="All">
            All Categories
          </option>

          {categories.map((category) => (
            <option
              key={category}
              value={category}
            >
              {category}
            </option>
          ))}
        </select>

        {/* LEVEL */}

        <select
          value={filterLevel}
          onChange={(e) =>
            setFilterLevel(e.target.value)
          }
          style={fieldStyle}
        >
          <option value="All">
            All Levels
          </option>

          <option value="Intra School">
            Intra School
          </option>

          <option value="Inter School">
            Inter School
          </option>

          <option value="District">
            District
          </option>

          <option value="State">
            State
          </option>

          <option value="National">
            National
          </option>
        </select>

     {/* ADD ACHIEVEMENT */}

        <button
          type="button"
          onClick={onAddAchievement}
          style={{
            height: 46,
            padding: "0 20px",
            borderRadius: 12,
            border: "none",
            background:
              "linear-gradient(135deg,#F97316,#FB923C)",
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: 800,
            cursor: "pointer",
            whiteSpace: "nowrap",
            boxShadow:
              "0 8px 20px rgba(249,115,22,.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
          }}
        >
          <span
            style={{
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            +
          </span>

          Add Achievement
        </button>

      </div>
    </div>
  );
}
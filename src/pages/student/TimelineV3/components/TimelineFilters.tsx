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
      className="timeline-filter-card"
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
        className="timeline-filter-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
          gap: 15,
          alignItems: "center",
        }}
      >
        {/* SEARCH */}

        <input
          className="timeline-filter-search"
          placeholder="Search Achievement..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
          style={fieldStyle}
        />

        {/* YEAR */}

        <select
          className="timeline-filter-field"
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
          className="timeline-filter-field"
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
          className="timeline-filter-field"
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
          className="timeline-filter-add"
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
            className="timeline-filter-add-icon"
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


      <style>{`

        /* =====================================================
           TABLET
           DESKTOP ABOVE 1024px UNTOUCHED
        ===================================================== */

        @media (max-width: 1024px) {

          .timeline-filter-card {
            padding: 15px !important;
            margin-bottom: 17px !important;

            border-radius: 18px !important;
          }

          .timeline-filter-grid {
            grid-template-columns:
              minmax(0, 2fr)
              minmax(105px, .8fr)
              minmax(125px, 1fr)
              minmax(115px, .9fr)
              auto !important;

            gap: 9px !important;
          }

          .timeline-filter-search,
          .timeline-filter-field {
            padding: 10px 11px !important;

            border-radius: 10px !important;

            font-size: 12px !important;
          }

          .timeline-filter-add {
            height: 38px !important;

            padding: 0 13px !important;

            border-radius: 10px !important;

            font-size: 11.5px !important;

            gap: 5px !important;
          }

          .timeline-filter-add-icon {
            font-size: 15px !important;
          }

        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 768px) {

          .timeline-filter-card {
            width: 100% !important;
            max-width: 100% !important;

            padding: 11px !important;
            margin-bottom: 10px !important;

            border-radius: 15px !important;

            box-sizing: border-box;
          }


          /*
             Mobile structure:

             Search Search
             Year   Category
             Level  Add
          */

          .timeline-filter-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr)) !important;

            gap: 7px !important;

            width: 100% !important;
          }


          /* Search spans entire first row */

          .timeline-filter-search {
            grid-column: 1 / -1;

            width: 100% !important;

            padding: 9px 10px !important;

            border-radius: 9px !important;

            font-size: 11px !important;
          }


          /* Dropdowns */

          .timeline-filter-field {
            width: 100% !important;
            min-width: 0 !important;

            padding: 9px 8px !important;

            border-radius: 9px !important;

            font-size: 10.5px !important;
          }


          /* Add button becomes another compact grid control */

          .timeline-filter-add {
            width: 100% !important;
            height: 35px !important;

            padding: 0 8px !important;

            border-radius: 9px !important;

            font-size: 10.5px !important;

            gap: 4px !important;

            white-space: nowrap !important;

            box-shadow:
              0 5px 12px rgba(249,115,22,.15) !important;
          }

          .timeline-filter-add-icon {
            font-size: 14px !important;
          }

        }


        /* =====================================================
           520px
        ===================================================== */

        @media (max-width: 520px) {

          .timeline-filter-card {
            padding: 10px !important;
            margin-bottom: 8px !important;

            border-radius: 14px !important;
          }

          .timeline-filter-grid {
            gap: 6px !important;
          }

          .timeline-filter-search {
            height: 34px;

            padding: 8px 9px !important;

            font-size: 10.5px !important;
          }

          .timeline-filter-field {
            height: 34px;

            padding: 7px 7px !important;

            font-size: 10px !important;
          }

          .timeline-filter-add {
            height: 34px !important;

            font-size: 10px !important;
          }

        }


        /* =====================================================
           390px / 400px
        ===================================================== */

        @media (max-width: 420px) {

          .timeline-filter-card {
            padding: 9px !important;

            border-radius: 13px !important;
          }

          .timeline-filter-grid {
            gap: 5px !important;
          }

          .timeline-filter-search {
            height: 32px;

            padding: 7px 8px !important;

            border-radius: 8px !important;

            font-size: 10px !important;
          }

          .timeline-filter-field {
            height: 32px;

            padding: 6px !important;

            border-radius: 8px !important;

            font-size: 9.5px !important;
          }

          .timeline-filter-add {
            height: 32px !important;

            padding: 0 6px !important;

            border-radius: 8px !important;

            font-size: 9.5px !important;

            gap: 3px !important;
          }

          .timeline-filter-add-icon {
            font-size: 13px !important;
          }

        }


        /* =====================================================
           VERY SMALL PHONE
        ===================================================== */

        @media (max-width: 360px) {

          .timeline-filter-card {
            padding: 8px !important;
          }

          .timeline-filter-search,
          .timeline-filter-field,
          .timeline-filter-add {
            font-size: 9px !important;
          }

        }

      `}</style>
    </div>
  );
}
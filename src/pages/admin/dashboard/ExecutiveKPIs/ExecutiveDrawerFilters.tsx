export interface ExecutiveFilter {
  id: string;
  label: string;
  type: "search" | "select";
  value: string;
  options?: string[];
}

interface ExecutiveDrawerFiltersProps {
  filters: ExecutiveFilter[];
  onChange: (
    id: string,
    value: string
  ) => void;
}

export default function ExecutiveDrawerFilters({
  filters,
  onChange,
}: ExecutiveDrawerFiltersProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "2fr repeat(3,1fr)",
        gap: 16,
        marginBottom: 24,
      }}
    >
      {filters.map((filter) => {
        if (filter.type === "search") {
          return (
            <input
              key={filter.id}
              type="text"
              placeholder={filter.label}
              value={filter.value}
              onChange={(e) =>
                onChange(
                  filter.id,
                  e.target.value
                )
              }
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                border:
                  "1px solid #CBD5E1",
                background: "#FFFFFF",
                fontSize: 14,
                outline: "none",
              }}
            />
          );
        }

        return (
          <select
            key={filter.id}
            value={filter.value}
            onChange={(e) =>
              onChange(
                filter.id,
                e.target.value
              )
            }
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              border:
                "1px solid #CBD5E1",
              background: "#FFFFFF",
              fontSize: 14,
            }}
          >
            <option value="">
              All {filter.label}
            </option>

            {(filter.options ?? []).map(
              (option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              )
            )}
          </select>
        );
      })}
    </div>
  );
}
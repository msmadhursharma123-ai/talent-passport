import { useMemo } from "react";

type Props = {
  monthKey: string;
  todayKey: string;
  selectedDates: Set<string>;
  markedDates: Set<string>;
  onToggleDate: (dateKey: string) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
};

function parseDateKey(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function monthKeyLabel(monthKey: string): string {
  return parseDateKey(`${monthKey}-01`).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function weekdayLabel(index: number): string {
  return new Date(Date.UTC(2026, 0, 4 + index)).toLocaleDateString("en-IN", {
    weekday: "short",
    timeZone: "UTC",
  });
}

export default function TeacherAbsenceCalendar({
  monthKey,
  todayKey,
  selectedDates,
  markedDates,
  onToggleDate,
  onPreviousMonth,
  onNextMonth,
}: Props) {
  const cells = useMemo(() => {
    const first = parseDateKey(`${monthKey}-01`);
    const year = first.getUTCFullYear();
    const month = first.getUTCMonth();
    const firstWeekday = first.getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const values: Array<string | null> = Array(firstWeekday).fill(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      values.push(dateKey(new Date(Date.UTC(year, month, day))));
    }
    while (values.length % 7 !== 0) values.push(null);
    return values;
  }, [monthKey]);

  const todayMonth = todayKey.slice(0, 7);
  const previousDisabled = monthKey <= todayMonth;

  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        border: "1px solid #D5DFEB",
        borderRadius: 14,
        background: "#F8FAFD",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <button
          type="button"
          onClick={onPreviousMonth}
          disabled={previousDisabled}
          aria-label="Previous month"
          style={{
            width: 32,
            height: 32,
            border: "1px solid #CBD5E1",
            borderRadius: 8,
            background: "#FFFFFF",
            color: previousDisabled ? "#B8C2CF" : "#334155",
            cursor: previousDisabled ? "not-allowed" : "pointer",
            fontWeight: 900,
          }}
        >
          ‹
        </button>
        <strong
          style={{
            color: "#0B1D38",
            fontSize: 12,
            fontWeight: 900,
          }}
        >
          {monthKeyLabel(monthKey)}
        </strong>
        <button
          type="button"
          onClick={onNextMonth}
          aria-label="Next month"
          style={{
            width: 32,
            height: 32,
            border: "1px solid #CBD5E1",
            borderRadius: 8,
            background: "#FFFFFF",
            color: "#334155",
            cursor: "pointer",
            fontWeight: 900,
          }}
        >
          ›
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: 4,
        }}
      >
        {Array.from({ length: 7 }, (_, index) => (
          <div
            key={`weekday-${index}`}
            style={{
              minWidth: 0,
              textAlign: "center",
              color: "#657896",
              fontSize: 8,
              fontWeight: 900,
              padding: "4px 0",
            }}
          >
            {weekdayLabel(index)}
          </div>
        ))}

        {cells.map((value, index) => {
          if (!value) return <div key={`empty-${index}`} style={{ minHeight: 38 }} />;

          const isPast = value < todayKey;
          const isMarked = markedDates.has(value);
          const isSelected = selectedDates.has(value);
          const isToday = value === todayKey;
          const day = Number(value.slice(-2));

          return (
            <button
              key={value}
              type="button"
              onClick={() => onToggleDate(value)}
              disabled={isPast || isMarked}
              aria-pressed={isSelected || isMarked}
              title={isMarked ? "Already marked absent" : isPast ? "Past date" : `Mark absent on ${value}`}
              style={{
                minWidth: 0,
                minHeight: 38,
                borderRadius: 9,
                border: isSelected || isMarked ? "1px solid #F97316" : isToday ? "1px solid #FDBA74" : "1px solid #D5DFEB",
                background: isSelected || isMarked ? "#FFF2E7" : "#FFFFFF",
                color: isPast ? "#B8C2CF" : isSelected || isMarked ? "#C2410C" : "#334155",
                cursor: isPast || isMarked ? "not-allowed" : "pointer",
                fontSize: 10,
                fontWeight: 850,
                opacity: isPast ? 0.62 : 1,
                boxSizing: "border-box",
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 10,
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          flexWrap: "wrap",
          color: "#657896",
          fontSize: 8,
          fontWeight: 750,
        }}
      >
        <span>Tap individual dates to select multiple days.</span>
        <span>{selectedDates.size} selected</span>
      </div>
    </div>
  );
}

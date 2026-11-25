import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import TeacherAbsenceCalendar from "./TeacherAbsenceCalendar";
import {
  getCurrentTeacherAbsences,
  getCurrentTeacherAbsencesForRange,
  markCurrentTeacherAbsent,
} from "../repository/TeacherDailyAttendanceRepository";

type Props = {
  disabled?: boolean;
};

function indiaDateKey(offsetDays = 0): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = Number(parts.find((part) => part.type === "year")?.value ?? 0);
  const month = Number(parts.find((part) => part.type === "month")?.value ?? 0);
  const day = Number(parts.find((part) => part.type === "day")?.value ?? 0);
  const date = new Date(Date.UTC(year, month - 1, day + offsetDays));

  return date.toISOString().slice(0, 10);
}

function monthKeyFromDateKey(dateKey: string): string {
  return dateKey.slice(0, 7);
}

function monthBounds(monthKey: string): { start: string; end: string } {
  const [year, month] = monthKey.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function shiftMonth(monthKey: string, amount: number): string {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1 + amount, 1)).toISOString().slice(0, 7);
}

function formatChoiceDate(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00Z`);
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export default function TeacherDailyAbsenceButton({ disabled = false }: Props) {
  const todayKey = indiaDateKey(0);
  const tomorrowKey = indiaDateKey(1);
  const [markedDates, setMarkedDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarMonthKey, setCalendarMonthKey] = useState(monthKeyFromDateKey(todayKey));
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const existing = await getCurrentTeacherAbsences([todayKey, tomorrowKey]);
        if (!cancelled) {
          setMarkedDates(new Set(existing.map((absence) => absence.absenceDate)));
        }
      } catch (error) {
        // Absence status is additive UI. A read failure must never block
        // the existing Daily Log page from loading or publishing.
        console.error("TEACHER ABSENCE STATUS LOAD FAILED", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [todayKey, tomorrowKey]);

  async function loadCalendarMonth(monthKey: string) {
    const { start, end } = monthBounds(monthKey);
    setCalendarLoading(true);
    try {
      const existing = await getCurrentTeacherAbsencesForRange(start, end);
      setMarkedDates((current) => {
        const next = new Set(current);
        existing.forEach((absence) => next.add(absence.absenceDate));
        return next;
      });
    } catch (error) {
      console.error("TEACHER ABSENCE CALENDAR LOAD FAILED", error);
      window.alert("Unable to load the absence calendar. Please try again.");
    } finally {
      setCalendarLoading(false);
    }
  }

  function openDialog() {
    if (disabled || loading || saving) return;

    setSelectedDates(new Set(markedDates));
    setCalendarMonthKey(monthKeyFromDateKey(todayKey));
    setCalendarOpen(false);
    setOpen(true);
  }

  function closeDialog() {
    if (saving) return;
    setOpen(false);
    setCalendarOpen(false);
    setSelectedDates(new Set(markedDates));
  }

  async function openCalendar() {
    if (saving) return;
    const nextOpen = !calendarOpen;
    setCalendarOpen(nextOpen);
    if (nextOpen) await loadCalendarMonth(calendarMonthKey);
  }

  async function changeCalendarMonth(amount: number) {
    if (saving || calendarLoading) return;
    const nextMonth = shiftMonth(calendarMonthKey, amount);
    const currentMonth = monthKeyFromDateKey(todayKey);
    if (nextMonth < currentMonth) return;
    setCalendarMonthKey(nextMonth);
    await loadCalendarMonth(nextMonth);
  }

  function toggleDate(dateKey: string) {
    if (saving || markedDates.has(dateKey) || dateKey < todayKey) return;
    setSelectedDates((current) => {
      const next = new Set(current);
      if (next.has(dateKey)) next.delete(dateKey);
      else next.add(dateKey);
      return next;
    });
  }

  async function handleSubmit() {
    if (saving || selectedDates.size === 0) return;

    setSaving(true);
    try {
      const dates = Array.from(selectedDates).sort();
      const saved = await markCurrentTeacherAbsent(dates);
      setMarkedDates((current) => {
        const next = new Set(current);
        saved.forEach((absence) => next.add(absence.absenceDate));
        dates.forEach((date) => next.add(date));
        return next;
      });
      setOpen(false);
      setCalendarOpen(false);
      setSelectedDates(new Set());
    } catch (error) {
      console.error("TEACHER ABSENCE MARK FAILED", error);
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to update your absence status. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        disabled={disabled || loading || saving}
        title="Mark your absence for planned dates"
        style={{
          minHeight: 42,
          borderRadius: 10,
          border: "1px solid #CBD5E1",
          background: "#FFFFFF",
          color: "#334155",
          padding: "9px 13px",
          fontSize: 12,
          fontWeight: 800,
          lineHeight: 1.2,
          cursor: disabled || loading || saving ? "default" : "pointer",
          opacity: disabled || loading ? 0.72 : 1,
          whiteSpace: "nowrap",
          boxSizing: "border-box",
        }}
      >
        {saving ? "Saving…" : "Mark absent"}
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog();
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            background: "rgba(11, 29, 56, 0.42)",
            boxSizing: "border-box",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="teacher-absence-title"
            style={{
              position: "relative",
              width: "min(100%, 520px)",
              maxHeight: "min(92dvh, 760px)",
              overflowY: "auto",
              border: "1px solid #E0E6EF",
              borderRadius: 20,
              background: "linear-gradient(145deg, #FFFFFF 0%, #FFFFFF 72%, #FFFCF8 100%)",
              boxShadow: "0 24px 70px rgba(11, 29, 56, 0.22)",
              padding: 22,
              boxSizing: "border-box",
            }}
          >
            <button
              type="button"
              onClick={closeDialog}
              disabled={saving}
              aria-label="Close absence dialog"
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                width: 34,
                height: 34,
                border: "1px solid #CBD5E1",
                borderRadius: 9,
                background: "#FFFFFF",
                color: "#334155",
                cursor: saving ? "not-allowed" : "pointer",
                fontWeight: 800,
              }}
            >
              ✕
            </button>

            <div style={{ paddingRight: 44 }}>
              <p
                style={{
                  margin: 0,
                  color: "#D95213",
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                }}
              >
                Teacher Attendance
              </p>
              <h2
                id="teacher-absence-title"
                style={{
                  margin: "7px 0 0",
                  color: "#0B1D38",
                  fontSize: 22,
                  lineHeight: 1.2,
                  fontWeight: 900,
                  letterSpacing: "-.3px",
                }}
              >
                Mark absent
              </h2>
              <p
                style={{
                  margin: "8px 0 0",
                  color: "#526987",
                  fontSize: 11,
                  lineHeight: 1.5,
                  fontWeight: 650,
                }}
              >
                Select today, tomorrow, or any planned future dates. You can select multiple dates at once.
              </p>
            </div>

            <div style={{ display: "grid", gap: 10, marginTop: 20 }}>
              {([
                [todayKey, "Mark absent today"],
                [tomorrowKey, "Mark absent tomorrow"],
              ] as const).map(([dateKey, label]) => {
                const checked = selectedDates.has(dateKey);
                const alreadyMarked = markedDates.has(dateKey);
                return (
                  <label
                    key={dateKey}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      minHeight: 64,
                      padding: "12px 14px",
                      border: checked ? "1px solid #F97316" : "1px solid #D5DFEB",
                      borderRadius: 12,
                      background: checked ? "#FFF7EF" : "#FFFFFF",
                      cursor: alreadyMarked || saving ? "not-allowed" : "pointer",
                      boxSizing: "border-box",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDate(dateKey)}
                      disabled={saving || alreadyMarked}
                      style={{
                        width: 18,
                        height: 18,
                        flex: "0 0 auto",
                        accentColor: "#F97316",
                      }}
                    />
                    <span style={{ minWidth: 0 }}>
                      <strong
                        style={{
                          display: "block",
                          color: "#0B1D38",
                          fontSize: 12,
                          fontWeight: 850,
                        }}
                      >
                        {label}
                      </strong>
                      <span
                        style={{
                          display: "block",
                          marginTop: 4,
                          color: "#657896",
                          fontSize: 9,
                          fontWeight: 700,
                        }}
                      >
                        {formatChoiceDate(dateKey)}{alreadyMarked ? " · Already marked" : ""}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => void openCalendar()}
              disabled={saving}
              style={{
                width: "100%",
                minHeight: 46,
                marginTop: 12,
                padding: "10px 13px",
                border: calendarOpen ? "1px solid #F97316" : "1px solid #CBD5E1",
                borderRadius: 11,
                background: calendarOpen ? "#FFF7EF" : "#FFFFFF",
                color: "#334155",
                fontSize: 10,
                fontWeight: 850,
                textAlign: "left",
                cursor: saving ? "not-allowed" : "pointer",
                boxSizing: "border-box",
              }}
            >
              <span style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                <span>📅 Select planned absence dates from calendar</span>
                <span aria-hidden="true">{calendarOpen ? "⌃" : "⌄"}</span>
              </span>
            </button>

            {calendarOpen && (
              <TeacherAbsenceCalendar
                monthKey={calendarMonthKey}
                todayKey={todayKey}
                selectedDates={selectedDates}
                markedDates={markedDates}
                onToggleDate={toggleDate}
                onPreviousMonth={() => void changeCalendarMonth(-1)}
                onNextMonth={() => void changeCalendarMonth(1)}
              />
            )}

            {calendarLoading && (
              <p
                style={{
                  margin: "8px 0 0",
                  color: "#657896",
                  fontSize: 8,
                  fontWeight: 750,
                  textAlign: "center",
                }}
              >
                Loading marked dates…
              </p>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 9,
                flexWrap: "wrap",
                marginTop: 20,
              }}
            >
              <button
                type="button"
                onClick={closeDialog}
                disabled={saving}
                style={{
                  minHeight: 40,
                  padding: "9px 15px",
                  border: "1px solid #CBD5E1",
                  borderRadius: 9,
                  background: "#FFFFFF",
                  color: "#334155",
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={saving || selectedDates.size === 0 || calendarLoading}
                style={{
                  minHeight: 40,
                  padding: "9px 16px",
                  border: "1px solid #EA580C",
                  borderRadius: 9,
                  background: saving || selectedDates.size === 0 || calendarLoading ? "#FDBA74" : "#F97316",
                  color: "#FFFFFF",
                  fontSize: 10,
                  fontWeight: 850,
                  cursor: saving || selectedDates.size === 0 || calendarLoading ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Saving…" : `Submit${selectedDates.size ? ` (${selectedDates.size})` : ""}`}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

import { useEffect, useState } from "react";
import MonthlyLearningReviewGate from "./MonthlyLearningReviewGate";
import DailyCanonicalVerificationGate from "./DailyCanonicalVerificationGate";
import LiveDoubtReconciliationGate from "../../liveDoubtIntelligence/components/LiveDoubtReconciliationGate";
import { getStudentMonthlyLearningReviewState } from "../repository/StudentMonthlyLearningReviewRepository";
import { currentReviewMonth, isIndiaFirstDay } from "../utils/MonthlyReviewDate";
import { getMyAcademicYearContext } from "../../academicYear/repositories/AcademicYearRepository";

interface Props { onSubmitted?: () => void; }
type GateMode = "CHECKING" | "CURRENT" | "HISTORICAL" | "UNAVAILABLE" | "FALLBACK";

export default function StudentLearningVerificationGate({ onSubmitted }: Props) {
  const [mode, setMode] = useState<GateMode>("CHECKING");
  const [monthlyPending, setMonthlyPending] = useState(false);
  const [monthlyStrict, setMonthlyStrict] = useState(false);
  const [monthlyCompletedToday, setMonthlyCompletedToday] = useState(false);

  async function check() {
    setMode("CHECKING");
    const firstDay = isIndiaFirstDay();
    try {
      const academicYear = await getMyAcademicYearContext();
      if (academicYear && !academicYear.isCurrent) {
        setMonthlyPending(false);
        setMonthlyStrict(false);
        setMonthlyCompletedToday(false);
        setMode("HISTORICAL");
        return;
      }
      if (!academicYear) {
        setMonthlyPending(false);
        setMonthlyStrict(false);
        setMonthlyCompletedToday(false);
        // On the reserved first day, fail closed rather than showing the old
        // Live popup without a verified current-year Monthly scope.
        setMode("UNAVAILABLE");
        return;
      }

      const state = await getStudentMonthlyLearningReviewState(currentReviewMonth());
      const hasCycle = Boolean(state.cycle);
      const completed = state.cycle?.status === "COMPLETED";
      const hasPendingCycle = Boolean(state.cycle && !completed);
      const overdueWithoutCycle = !firstDay && !hasCycle;

      // Locked product flow:
      //   India day 1  -> Monthly priority; Daily is suppressed.
      //   Later days   -> resume any pending Monthly review; if the student
      //                   missed day 1 entirely, create/resume the overdue
      //                   current-month Monthly review on the first later login.
      //   Completed    -> Daily may run on later days; on day 1 it remains the
      //                   reserved Monthly day, so no Daily popup is shown.
      const showMonthly = firstDay ? !completed : hasPendingCycle || overdueWithoutCycle;
      setMonthlyPending(showMonthly);
      setMonthlyStrict(showMonthly);
      setMonthlyCompletedToday(firstDay && Boolean(completed));
      setMode("CURRENT");
    } catch (error) {
      console.error("MONTHLY/VERIFICATION STATUS CHECK FAILED", error);
      // The Monthly/verification layer is additive. If its status check fails,
      // preserve the original Live gate exactly as the plan requires.
      setMonthlyPending(false);
      setMonthlyStrict(false);
      setMonthlyCompletedToday(false);
      setMode("FALLBACK");
    }
  }

  useEffect(() => { void check(); }, []);

  if (mode === "CHECKING") return null;
  if (mode === "HISTORICAL") return null;
  if (mode === "UNAVAILABLE" || mode === "FALLBACK") {
    return <LiveDoubtReconciliationGate onSubmitted={onSubmitted} />;
  }
  if (monthlyPending) {
    return <MonthlyLearningReviewGate strictMandatory={monthlyStrict} onSubmitted={() => { void check(); }} />;
  }
  if (monthlyCompletedToday) return null;
  return <DailyCanonicalVerificationGate onSubmitted={onSubmitted} />;
}

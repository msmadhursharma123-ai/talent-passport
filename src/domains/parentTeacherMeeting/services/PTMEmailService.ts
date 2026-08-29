import { getSupabaseClient } from "../../../supabaseClient";
import type { PTMReport, PTMEmailResult } from "../types/PTMModels";

export async function sendPTMReportEmail(
  report: PTMReport,
  pdfBase64: string
): Promise<PTMEmailResult> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Supabase is not configured." };
  }

  if (!report.student.studentUuid) {
    return { success: false, error: "Student identity is missing." };
  }

  if (!report.student.studentEmail) {
    return { success: false, error: "This student does not have a registered parent email." };
  }

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session?.access_token) {
    return { success: false, error: "Your teacher session has expired. Please sign in again and retry." };
  }

  const { data, error } = await supabase.functions.invoke("send-ptm-report", {
    body: {
      studentUuid: report.student.studentUuid,
      startDate: report.period.startDate,
      endDate: report.period.endDate,
      className: report.student.className,
      sectionName: report.student.sectionName,
      pdfBase64,
      report: {
        studentName: report.student.studentName,
        schoolName: report.schoolName,
        teacherName: report.teacherName,
        periodLabel: report.period.label,
        combinedUnderstandingPercentage: report.combinedUnderstandingPercentage,
        totalLogs: report.totalLogs,
        totalFeedbackResponses: report.totalFeedbackResponses,
        overallResponseRate: report.overallResponseRate,
        feedbackDays: report.feedbackDays,
        subjects: report.subjects,
        pendingDoubts: report.pendingDoubts,
        discussionPoints: report.discussionPoints,
      },
    },
  });

  if (error) {
    const message = error.message || "Unable to send the PTM report.";
    return {
      success: false,
      error: message.includes("Failed to send a request") || message.includes("CORS")
        ? "The PTM email service is not reachable yet. Deploy the updated send-ptm-report function and its PTM config block, then retry."
        : message,
    };
  }

  return (data ?? { success: false, error: "The email service returned no response." }) as PTMEmailResult;
}

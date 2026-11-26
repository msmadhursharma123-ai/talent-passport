import ParentsTeacherMeetingPage from "./ParentsTeacherMeetingPage";

/**
 * School Portal PTM wrapper.
 * Reuses the exact Teacher PTM presentation while switching only the
 * repository scope from teacher-assigned classrooms to the authenticated
 * school-wide roster.
 */
export default function SchoolParentsTeacherMeetingPage() {
  return <ParentsTeacherMeetingPage scope="school" />;
}

import {
  fetchStudentsMaster,
  fetchTalentPassportScores
} from "../../supabaseClient";

export interface LeaderboardRow {
  student_id: string;
  student_name: string;
  school_name: string;
  class_name: string;

  creativity_score: number;
  communication_score: number;
  leadership_score: number;
  critical_thinking_score: number;
  collaboration_score: number;
  confidence_score: number;

  overall_score: number;

  total_events: number;

  rank: number;

  school_rank: number;
  class_rank: number;

  percentile: number;

  gap_to_top: number;
}

export interface EventLeaderboardRow {
  student_id: string;
  student_name: string;
  school_name: string;
  class_name: string;

  event_name: string;
  pathway: string;

  creativity_score: number;
  communication_score: number;
  leadership_score: number;
  critical_thinking_score: number;
  collaboration_score: number;
  confidence_score: number;

  overall_score: number;

  rank: number;
}

function average(
  total: number,
  count: number
) {
  if (!count) return 0;

  return Math.round(total / count);
}


// ========================================
// OVERALL STUDENT LEADERBOARD
// ========================================

export async function buildLeaderboard(): Promise<LeaderboardRow[]> {
  const students: any[] =
  (await fetchStudentsMaster()) || [];

const scores: any[] =
  (await fetchTalentPassportScores()) || [];

  const leaderboard: LeaderboardRow[] = [];

  for (const student of students || []) {

    const studentScores =
      (scores || []).filter(
        (score: any) =>
          score.student_id ===
          student.student_id
      );

    if (!studentScores.length) {
      continue;
    }

    const creativity =
      average(
        studentScores.reduce(
          (
            sum: number,
            item: any
          ) =>
            sum +
            (item.creativity_score || 0),
          0
        ),
        studentScores.length
      );

    const communication =
      average(
        studentScores.reduce(
          (
            sum: number,
            item: any
          ) =>
            sum +
            (item.communication_score || 0),
          0
        ),
        studentScores.length
      );

    const leadership =
      average(
        studentScores.reduce(
          (
            sum: number,
            item: any
          ) =>
            sum +
            (item.leadership_score || 0),
          0
        ),
        studentScores.length
      );

    const thinking =
      average(
        studentScores.reduce(
          (
            sum: number,
            item: any
          ) =>
            sum +
            (
              item.critical_thinking_score ||
              0
            ),
          0
        ),
        studentScores.length
      );

    const collaboration =
      average(
        studentScores.reduce(
          (
            sum: number,
            item: any
          ) =>
            sum +
            (
              item.collaboration_score ||
              0
            ),
          0
        ),
        studentScores.length
      );

    const confidence =
      average(
        studentScores.reduce(
          (
            sum: number,
            item: any
          ) =>
            sum +
            (
              item.confidence_score ||
              0
            ),
          0
        ),
        studentScores.length
      );

    const overall =
      average(
        studentScores.reduce(
          (
            sum: number,
            item: any
          ) =>
            sum +
            (
              item.overall_score || 0
            ),
          0
        ),
        studentScores.length
      );

      

    leaderboard.push({
      student_id:
        student.student_id,

      student_name:
        student.student_name,

      school_name:
        student.school_name,

      class_name:
        student.class_name,

      creativity_score:
        creativity,

      communication_score:
        communication,

      leadership_score:
        leadership,

      critical_thinking_score:
        thinking,

      collaboration_score:
        collaboration,

      confidence_score:
        confidence,

      overall_score:
        overall,

      total_events:
        studentScores.length,

      rank: 0,

school_rank: 0,

class_rank: 0,

percentile: 0,

gap_to_top: 0,
    });
  }

  leaderboard.sort(
    (a, b) =>
      b.overall_score -
      a.overall_score
  );

const schoolRankMap = new Map<
  string,
  LeaderboardRow[]
>();

const classRankMap = new Map<
  string,
  LeaderboardRow[]
>();

for (const row of leaderboard) {
  if (!schoolRankMap.has(row.school_name)) {
    schoolRankMap.set(
      row.school_name,
      leaderboard
        .filter(
          (student) =>
            student.school_name === row.school_name
        )
        .sort(
          (a, b) =>
            b.overall_score -
            a.overall_score
        )
    );
  }

  if (!classRankMap.has(row.class_name)) {
    classRankMap.set(
      row.class_name,
      leaderboard
        .filter(
          (student) =>
            student.class_name === row.class_name
        )
        .sort(
          (a, b) =>
            b.overall_score -
            a.overall_score
        )
    );
  }
}

  leaderboard.forEach(
  (
    item,
    index
  ) => {

    item.rank =
      index + 1;

  const schoolStudents =
  schoolRankMap.get(item.school_name) ?? [];

    item.school_rank =
      schoolStudents.findIndex(
        (x) =>
          x.student_id ===
          item.student_id
      ) + 1;

  const classStudents =
  classRankMap.get(item.class_name) ?? [];

    item.class_rank =
      classStudents.findIndex(
        (x) =>
          x.student_id ===
          item.student_id
      ) + 1;

    item.percentile =
      Math.round(
        (
          (leaderboard.length -
            item.rank) /
          leaderboard.length
        ) * 100
      );

    item.gap_to_top =
      leaderboard[0]
        .overall_score -
      item.overall_score;
  }
);


  return leaderboard;
}

// ========================================
// EVENT LEADERBOARD
// ========================================

export async function buildEventLeaderboard(
  eventName: string
): Promise<EventLeaderboardRow[]> {
 const students: any[] =
  (await fetchStudentsMaster()) || [];

const scores: any[] =
  (await fetchTalentPassportScores()) || [];

  const eventRows:
    EventLeaderboardRow[] = [];

  const filteredScores =
    (scores || []).filter(
      (score: any) =>
        score.event_name ===
        eventName
    );

  for (const score of filteredScores) {

    const student =
      (students || []).find(
        (item: any) =>
          item.student_id ===
          score.student_id
      );

    if (!student) {
      continue;
    }

    eventRows.push({
      student_id:
        student.student_id,

      student_name:
        student.student_name,

      school_name:
        student.school_name,

      class_name:
        student.class_name,

      event_name:
        score.event_name,

      pathway:
        score.pathway,

      creativity_score:
        score.creativity_score || 0,

      communication_score:
        score.communication_score || 0,

      leadership_score:
        score.leadership_score || 0,

      critical_thinking_score:
        score.critical_thinking_score || 0,

      collaboration_score:
        score.collaboration_score || 0,

      confidence_score:
        score.confidence_score || 0,

      overall_score:
        score.overall_score || 0,

      rank: 0,
    });
  }

  eventRows.sort(
    (a, b) =>
      b.overall_score -
      a.overall_score
  );

  eventRows.forEach(
    (
      item,
      index
    ) => {
      item.rank = index + 1;
    }
  );

  return eventRows;
}

// ========================================
// UNIQUE FILTERS
// ========================================

export async function getLeaderboardFilters(): Promise<{
  schools: string[];
  classes: string[];
  events: string[];
}> {

const students: any[] =
  (await fetchStudentsMaster()) || [];

const scores: any[] =
  (await fetchTalentPassportScores()) || [];

  const schools =
    [
      ...new Set(
        (students || [])
          .map(
            (x: any) =>
              x.school_name
          )
          .filter(Boolean)
      ),
    ];

  const classes =
    [
      ...new Set(
        (students || [])
          .map(
            (x: any) =>
              x.class_name
          )
          .filter(Boolean)
      ),
    ];

  const events =
    [
      ...new Set(
        (scores || [])
          .map(
            (x: any) =>
              x.event_name
          )
          .filter(Boolean)
      ),
    ];

  return {
    schools,
    classes,
    events,
  };
}
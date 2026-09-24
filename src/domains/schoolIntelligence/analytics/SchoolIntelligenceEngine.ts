import type {
  SchoolAcademicTrendPoint,
  SchoolClassroomHealthRow,
  SchoolIntelligenceSnapshot,
  SchoolTeacherIntelligenceRow,
  SchoolTeacherDailyIntelligence,
  SchoolExamPreparationClassroom,
} from "../types/SchoolIntelligenceModels";
import type { SchoolIntelligenceRawData } from "../repository/SchoolIntelligenceRepository";

import {
  aggregateLearningLectureMetrics,
  calculateLearningLectureMetrics,
  isLearningUnderstandingLevel,
} from "../../../utils/learningFeedbackAnalytics";
import {
  calculateDoubtClosureRate,
  countResolvedDoubts,
  calculateLearningDoubtRate,
} from "../../../utils/analyticsConsistency";

const COMPLETE = "I completely understood.";
const PARTIAL = "I partially understood.";
const NONE = "I didn't understand.";

const pct = (part: number, total: number) =>
  total === 0 ? 0 : Math.round((part / total) * 100);



const isLearningFeedback = (feedback: any) =>
  isLearningUnderstandingLevel(feedback?.effective_understanding_level ?? feedback?.understanding_level);

function getDoubtMetrics(doubts: any[]) {
  const doubtsAsked = (doubts ?? []).length;
  const doubtsResolved = countResolvedDoubts(doubts ?? []);

  return {
    doubtsAsked,
    doubtsResolved,
    doubtClosureRate: calculateDoubtClosureRate(doubts ?? []),
  };
}

const sameValue = (a: unknown, b: unknown) =>
  String(a ?? "").trim().toLowerCase() === String(b ?? "").trim().toLowerCase();

function normalizeConcept(value: unknown) {
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function effectiveUnderstanding(raw: SchoolIntelligenceRawData, feedback: any) {
  const original = feedback.understanding_level;
  if (feedback?._live_reconciled === true) return original;
  if (original !== PARTIAL && original !== NONE) return original;
  const concepts = Array.isArray(feedback?.concepts_not_understood) ? feedback.concepts_not_understood.filter(Boolean) : [];
  if (!concepts.length) return original;
  const matches = raw.doubts.filter((doubt: any) =>
    String(doubt.daily_log_uuid ?? "") === String(feedback.daily_log_uuid ?? "") &&
    String(doubt.student_uuid ?? "") === String(feedback.student_uuid ?? "") &&
    concepts.some((concept: string) => normalizeConcept(doubt.previous_difficult_concept ?? doubt.doubt_concept ?? doubt.previous_topic_name) === normalizeConcept(concept))
  );
  if (!matches.length) return original;
  const unresolved = concepts.filter((concept: string) =>
    !matches.some((doubt: any) =>
      normalizeConcept(doubt.previous_difficult_concept ?? doubt.doubt_concept ?? doubt.previous_topic_name) === normalizeConcept(concept) &&
      !(String(doubt.student_response ?? "").trim().toUpperCase() === "DISCUSSED" || doubt.doubt_resolved === true || String(doubt.status ?? "").trim().toUpperCase() === "RESOLVED")
    )
  );
  return unresolved.length === 0 ? COMPLETE : original;
}

function averageDailyResponseRate(
  raw: SchoolIntelligenceRawData,
  logs: any[],
  feedback: any[],
  className: unknown,
  sectionName: unknown
) {
  if (logs.length === 0) return 0;

  const classStudents = raw.students.filter(
    student =>
      sameValue(student.class_name, className) &&
      sameValue(student.section_name, sectionName)
  );
  const strength = new Set(
    classStudents.map(student => student.student_uuid).filter(Boolean)
  ).size;

  if (strength === 0) return 0;

  const dailyRates = logs.map(log => {
    const lectureMetrics = calculateLearningLectureMetrics({
      studentUuids: classStudents.map(student => student.student_uuid),
      feedback: feedback.filter(
        row => String(row.daily_log_uuid) === String(log.id)
      ),
    });

    return lectureMetrics.responseRate;
  });

  return Math.round(
    dailyRates.reduce((sum, rate) => sum + rate, 0) / dailyRates.length
  );
}


function latestLogTime(log:any){
  const time=new Date(log.created_at ?? log.log_date ?? "").getTime();
  return Number.isFinite(time)?time:0;
}
function buildDailyClassroomIntelligence(raw:SchoolIntelligenceRawData):SchoolTeacherDailyIntelligence[]{
  return raw.teachers.map(teacher=>{
    const assignments=raw.assignments.filter(a=>
      String(a.teacher_uuid)===String(teacher.teacher_uuid) && a.is_active!==false
    );
    const unique=assignments.filter((a,i,all)=>all.findIndex(x=>
      sameValue(x.class_name,a.class_name)&&sameValue(x.section_name,a.section_name)
    )===i);

    const classrooms=unique.flatMap(a=>{
      const logs=raw.logs.filter(l=>String(l.teacher_assignment_uuid)===String(a.id))
        .sort((x,y)=>latestLogTime(y)-latestLogTime(x));
      if(!logs.length)return [];
      const latest=logs[0];
      const feedback=raw.feedback.filter(f=>String(f.daily_log_uuid)===String(latest.id));
      const students=raw.students.filter(s=>
        sameValue(s.class_name,a.class_name)&&sameValue(s.section_name,a.section_name)
      );
      const latestMetrics = calculateLearningLectureMetrics({
        studentUuids: students.map(s => s.student_uuid),
        feedback,
      });
      const totalStudents = latestMetrics.totalStudents;
      const full = latestMetrics.completeStudents;
      const partial = latestMetrics.partialStudents;
      const none = latestMetrics.didntUnderstandStudents;
      const submitted = latestMetrics.responseStudents + latestMetrics.absentStudents;
      const score = latestMetrics.healthPercentage;
      let status="Excellent"; if(score<80)status="Needs Attention"; if(score<50)status="Critical";

      const conceptMap=new Map<string,number>();
      feedback.forEach(f=>(Array.isArray(f.concepts_not_understood)?f.concepts_not_understood:[])
        .forEach((c:unknown)=>{const k=String(c??"").trim();if(k)conceptMap.set(k,(conceptMap.get(k)??0)+1);}));
      const names=new Map(raw.students.map(s=>[String(s.student_uuid??""),String(s.student_name??"Student")]));
      const attention=Array.from(new Set(feedback.filter(f=>
        f.understanding_level===PARTIAL||f.understanding_level===NONE
      ).map(f=>names.get(String(f.student_uuid??""))??"Student")));

      return [{
        assignmentUuid:String(a.id??""),teacherUuid:String(teacher.teacher_uuid??""),
        teacherName:teacher.full_name??"Teacher",classroom:`${a.class_name}-${a.section_name}`,
        className:a.class_name??"",sectionName:a.section_name??"",subjectName:a.subject_name??latest.subject_name??"",
        latestLectureUuid:String(latest.id??""),latestLectureDate:String(latest.log_date??""),
        latestTopic:latest.topic_name??"-",totalStudents,feedbackSubmitted:submitted,
        feedbackRemaining:Math.max(0,totalStudents-submitted),completelyUnderstood:full,
        completelyUnderstoodRate:pct(full,latestMetrics.eligibleStudents),partiallyUnderstood:partial,
        partiallyUnderstoodRate:pct(partial,latestMetrics.eligibleStudents),didntUnderstand:none,
        didntUnderstandRate:pct(none,latestMetrics.eligibleStudents),classHealthScore:score,classHealthStatus:status,
        mostDifficultConcept:[...conceptMap.entries()].sort((x,y)=>y[1]-x[1])[0]?.[0]??"-",
        studentsRequiringAttention:attention
      }];
    });
    return {teacherUuid:String(teacher.teacher_uuid??""),teacherName:teacher.full_name??"Teacher",classrooms};
  }).filter(t=>t.classrooms.length>0).sort((a,b)=>a.teacherName.localeCompare(b.teacherName));
}


function indiaTodayKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";

  return `${year}-${month}-${day}`;
}

function buildTeacherLiveStatus(raw: SchoolIntelligenceRawData) {
  const today = indiaTodayKey();

  return raw.teachers
    .map((teacher: any) => {
      const assignments = raw.assignments.filter(
        (assignment: any) =>
          String(assignment.teacher_uuid ?? "") ===
            String(teacher.teacher_uuid ?? "")
      );

      const assignmentIds = new Set(
        assignments.map((assignment: any) => String(assignment.id ?? ""))
      );

      const todayLogs = raw.logs
        .filter(
          (log: any) =>
            assignmentIds.has(String(log.teacher_assignment_uuid ?? "")) &&
            String(log.log_date ?? "") === today
        )
        .sort((a: any, b: any) => latestLogTime(b) - latestLogTime(a));

      return {
        teacherUuid: String(teacher.teacher_uuid ?? ""),
        teacherName: String(teacher.full_name ?? "Teacher"),
        subjects: Array.from(
          new Set(
            assignments
              .map((assignment: any) => String(assignment.subject_name ?? "").trim())
              .filter(Boolean)
          )
        ),
        classrooms: Array.from(
          new Set(
            assignments
              .map(
                (assignment: any) =>
                  `Class ${assignment.class_name ?? ""} · ${assignment.section_name ?? ""}`
              )
              .filter((value: string) => value.trim() !== "Class ·")
          )
        ),
        isPresentToday: todayLogs.length > 0,
        todayLogCount: todayLogs.length,
        lastActivityAt: todayLogs[0]?.created_at ?? todayLogs[0]?.log_date ?? "",
        todayLectures: todayLogs.map((log: any) => ({
          logUuid: String(log.id ?? ""),
          assignmentUuid: String(log.teacher_assignment_uuid ?? ""),
          className: String(log.class_name ?? ""),
          sectionName: String(log.section_name ?? ""),
          classroom: `Class ${log.class_name ?? ""} · ${log.section_name ?? ""}`,
          subjectName: String(log.subject_name ?? ""),
          topicName: String(log.topic_name ?? ""),
          conceptsCovered: Array.isArray(log.concepts_covered)
            ? log.concepts_covered.map((concept: unknown) => String(concept ?? "").trim()).filter(Boolean)
            : [],
          pageFrom: log.page_from == null ? null : Number(log.page_from),
          pageTo: log.page_to == null ? null : Number(log.page_to),
          homeworkGiven: Boolean(log.homework_given),
          activityConducted: Boolean(log.activity_conducted),
          teacherNotes: String(log.teacher_notes ?? ""),
          logDate: String(log.log_date ?? ""),
          createdAt: String(log.created_at ?? log.log_date ?? ""),
        })),
      };
    })
    .sort((a: any, b: any) => a.teacherName.localeCompare(b.teacherName));
}

function buildSchoolExamPreparation(raw:SchoolIntelligenceRawData):SchoolExamPreparationClassroom[]{
  const teacherNames=new Map<string,string>(raw.teachers.map((t:any)=>[String(t.teacher_uuid??""),String(t.full_name??"Teacher")]));
  const studentNames=new Map<string,string>(raw.students.map((s:any)=>[String(s.student_uuid??""),String(s.student_name??"Student")]));
  const classrooms=new Map<string,any>();
  for(const a of raw.assignments.filter((x:any)=>x.is_active!==false)){
    const className=String(a.class_name??""),sectionName=String(a.section_name??""),key=`${className}__${sectionName}`;
    if(!classrooms.has(key))classrooms.set(key,{classroomKey:key,classroom:`Class ${className} - Section ${sectionName}`,className,sectionName,subjects:[]});
    const assignmentUuid=String(a.id??"");
    const records=raw.doubts.filter((d:any)=>String(d.teacher_assignment_uuid??"")===assignmentUuid&&String(d.status??"").trim().toUpperCase()==="NOT DISCUSSED"&&d.doubt_resolved!==true);
    const sm=new Map<string,any>();
    for(const r of records){
      const id=String(r.student_uuid??"");
      if(!sm.has(id))sm.set(id,{studentUuid:id,studentName:String(r.student_name??"").trim()||studentNames.get(id)||"Student",totalUnresolvedDoubts:0,topics:[],subtopics:[]});
      const s=sm.get(id);s.totalUnresolvedDoubts++;
      const topic=String(r.previous_topic_name??r.previous_difficult_concept??"").trim();if(topic){s.topics.push(topic);s.subtopics.push(String(r.previous_difficult_concept??r.doubt_concept??"").trim());}
    }
    const students=Array.from(sm.values()).map((s:any)=>{
      const m=new Map<string,number>();s.topics.forEach((t:string)=>m.set(t,(m.get(t)??0)+1));
      const highestRiskTopic=Array.from(m.entries()).sort((x,y)=>y[1]-x[1])[0]?.[0]??"-";
      return {...s,highestRiskTopic,attentionLevel:s.totalUnresolvedDoubts>=6?"HIGH":s.totalUnresolvedDoubts>=3?"MEDIUM":"LOW"};
    }).sort((x:any,y:any)=>y.totalUnresolvedDoubts-x.totalUnresolvedDoubts||x.studentName.localeCompare(y.studentName));
    const tm=new Map<string,number>();records.forEach((r:any)=>{const t=String(r.previous_topic_name??r.previous_difficult_concept??"").trim();if(t)tm.set(t,(tm.get(t)??0)+1)});
    classrooms.get(key).subjects.push({assignmentUuid,subjectName:String(a.subject_name??"Subject"),teacherUuid:String(a.teacher_uuid??""),teacherName:teacherNames.get(String(a.teacher_uuid??""))??"Teacher",students,totalStudentsWithUnresolvedDoubts:students.length,doubtsPerKid:students.length?Math.round(records.length/students.length*10)/10:0,commonDoubts:Array.from(tm.entries()).sort((x,y)=>y[1]-x[1]).slice(0,3).map(x=>x[0])});
  }
  return Array.from(classrooms.values()).map((c:any)=>({...c,subjects:c.subjects.sort((a:any,b:any)=>a.subjectName.localeCompare(b.subjectName))})).sort((a:any,b:any)=>Number(a.className)-Number(b.className)||a.sectionName.localeCompare(b.sectionName));
}

export function buildSchoolIntelligenceSnapshot(
  raw: SchoolIntelligenceRawData
): SchoolIntelligenceSnapshot {
  const effectiveFeedback = raw.feedback.map(row => ({
    ...row,
    effective_understanding_level: effectiveUnderstanding(raw, row),
  }));

  const assignmentById = new Map(
    raw.assignments.map((assignment: any) => [String(assignment.id ?? ""), assignment]),
  );

  const rosterForAssignment = (assignment: any) =>
    raw.students
      .filter(
        (student: any) =>
          sameValue(student.class_name, assignment?.class_name) &&
          sameValue(student.section_name, assignment?.section_name),
      )
      .map((student: any) => student.student_uuid)
      .filter(Boolean);

  const metricsForLogs = (logs: any[]) =>
    logs.map((log: any) => {
      const assignment = assignmentById.get(String(log.teacher_assignment_uuid ?? ""));
      const lectureFeedback = effectiveFeedback.filter(
        (row: any) => String(row.daily_log_uuid ?? "") === String(log.id ?? ""),
      );

      return calculateLearningLectureMetrics({
        studentUuids: rosterForAssignment(assignment),
        feedback: lectureFeedback,
        getUnderstandingLevel: (row: any) => row.effective_understanding_level,
      });
    });

  const allDoubtsMetrics = getDoubtMetrics(raw.doubts);
  const allLectureMetrics = metricsForLogs(raw.logs);
  const allLearningMetrics = aggregateLearningLectureMetrics(allLectureMetrics);

  const classrooms: SchoolClassroomHealthRow[] = raw.assignments.map(assignment => {
    const logs = raw.logs.filter(
      x => String(x.teacher_assignment_uuid) === String(assignment.id)
    );
    const lectureMetrics = metricsForLogs(logs);
    const aggregate = aggregateLearningLectureMetrics(lectureMetrics);
    const teacher = raw.teachers.find(
      x => String(x.teacher_uuid) === String(assignment.teacher_uuid)
    );
    const doubtMetrics = getDoubtMetrics(
      raw.doubts.filter(
        doubt =>
          String(doubt.teacher_assignment_uuid ?? "") === String(assignment.id ?? "")
      )
    );

    return {
      assignmentUuid: assignment.id,
      classroom: `Class ${assignment.class_name} · Section ${assignment.section_name}`,
      className: assignment.class_name ?? "",
      sectionName: assignment.section_name ?? "",
      subjectName: assignment.subject_name ?? "",
      teacherUuid: assignment.teacher_uuid,
      teacherName: teacher?.full_name ?? "Teacher",
      totalStudents: rosterForAssignment(assignment).length,
      topicsTaught: logs.length,
      responses:
        aggregate.responseStudentObservations + aggregate.absentStudentObservations,
      responseRate: aggregate.responseRate,
      completelyUnderstood: aggregate.completeStudentObservations,
      partiallyUnderstood: aggregate.partialStudentObservations,
      didntUnderstand: aggregate.didntUnderstandStudentObservations,
      understandingRate: aggregate.understandingRate,
      partialUnderstandingRate: aggregate.partialRate,
      doubtRate: calculateLearningDoubtRate(
        aggregate.partialStudentObservations,
        aggregate.didntUnderstandStudentObservations,
        aggregate.eligibleStudentObservations,
      ),
      doubtsAsked: doubtMetrics.doubtsAsked,
      doubtsResolved: doubtMetrics.doubtsResolved,
      doubtClosureRate: doubtMetrics.doubtClosureRate,
      eligibleStudentObservations: aggregate.eligibleStudentObservations,
      responseStudentObservations: aggregate.responseStudentObservations,
      completeStudentObservations: aggregate.completeStudentObservations,
      partialStudentObservations: aggregate.partialStudentObservations,
      didntUnderstandStudentObservations: aggregate.didntUnderstandStudentObservations,
      healthPercentageSum: aggregate.healthPercentageSum,
      healthLectureCount: aggregate.lectureCount,
    };
  });

  const teachers: SchoolTeacherIntelligenceRow[] = raw.teachers.map(teacher => {
    const assignments = raw.assignments.filter(
      x => String(x.teacher_uuid) === String(teacher.teacher_uuid)
    );
    const assignmentIds = new Set(assignments.map(x => String(x.id)));
    const logs = raw.logs.filter(
      x => assignmentIds.has(String(x.teacher_assignment_uuid))
    );
    const lectureMetrics = metricsForLogs(logs);
    const aggregate = aggregateLearningLectureMetrics(lectureMetrics);
    const doubtMetrics = getDoubtMetrics(
      raw.doubts.filter(
        doubt => assignmentIds.has(String(doubt.teacher_assignment_uuid ?? ""))
      )
    );

    return {
      teacherUuid: teacher.teacher_uuid,
      teacherName: teacher.full_name ?? "Teacher",
      subjects: Array.from(
        new Set(assignments.map(x => x.subject_name).filter(Boolean))
      ),
      classrooms: Array.from(
        new Set(
          assignments.map(x => `Class ${x.class_name} · ${x.section_name}`)
        )
      ),
      topicsTaught: logs.length,
      responses:
        aggregate.responseStudentObservations + aggregate.absentStudentObservations,
      understandingRate: aggregate.understandingRate,
      partialUnderstandingRate: aggregate.partialRate,
      doubtRate: calculateLearningDoubtRate(
        aggregate.partialStudentObservations,
        aggregate.didntUnderstandStudentObservations,
        aggregate.eligibleStudentObservations,
      ),
      doubtsAsked: doubtMetrics.doubtsAsked,
      doubtsResolved: doubtMetrics.doubtsResolved,
      doubtClosureRate: doubtMetrics.doubtClosureRate,
      eligibleStudentObservations: aggregate.eligibleStudentObservations,
      responseStudentObservations: aggregate.responseStudentObservations,
      completeStudentObservations: aggregate.completeStudentObservations,
      partialStudentObservations: aggregate.partialStudentObservations,
      didntUnderstandStudentObservations: aggregate.didntUnderstandStudentObservations,
    };
  });

  const logsByDate = new Map<string, any[]>();
  for (const log of raw.logs) {
    const date = String(log.log_date ?? "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const list = logsByDate.get(date) ?? [];
    list.push(log);
    logsByDate.set(date, list);
  }

  const trends: SchoolAcademicTrendPoint[] = Array.from(logsByDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, logs]) => {
      const aggregate = aggregateLearningLectureMetrics(metricsForLogs(logs));
      return {
        date,
        responses:
          aggregate.responseStudentObservations + aggregate.absentStudentObservations,
        understandingRate: aggregate.understandingRate,
        partialUnderstandingRate: aggregate.partialRate,
        doubtRate: calculateLearningDoubtRate(
          aggregate.partialStudentObservations,
          aggregate.didntUnderstandStudentObservations,
          aggregate.eligibleStudentObservations,
        ),
        eligibleStudentObservations: aggregate.eligibleStudentObservations,
        responseStudentObservations: aggregate.responseStudentObservations,
        completeStudentObservations: aggregate.completeStudentObservations,
        partialStudentObservations: aggregate.partialStudentObservations,
        didntUnderstandStudentObservations: aggregate.didntUnderstandStudentObservations,
      };
    });

  const reporting = new Set(
    raw.logs
      .map(log => {
        const assignment = raw.assignments.find(
          x => String(x.id) === String(log.teacher_assignment_uuid)
        );
        return assignment
          ? `${assignment.class_name}|${assignment.section_name}`
          : "";
      })
      .filter(Boolean)
  );

  return {
    schoolUuid: raw.schoolUuid,
    schoolName: raw.schoolName,
    stats: {
      activeTeachers: raw.teachers.filter(x => x.is_active !== false).length,
      totalStudents: raw.students.length,
      classesReporting: reporting.size,
      topicsTaught: raw.logs.length,
      responses:
        allLearningMetrics.responseStudentObservations +
        allLearningMetrics.absentStudentObservations,
      completelyUnderstood: allLearningMetrics.completeStudentObservations,
      partiallyUnderstood: allLearningMetrics.partialStudentObservations,
      didntUnderstand: allLearningMetrics.didntUnderstandStudentObservations,
      understandingRate: allLearningMetrics.understandingRate,
      partialUnderstandingRate: allLearningMetrics.partialRate,
      doubtRate: calculateLearningDoubtRate(
        allLearningMetrics.partialStudentObservations,
        allLearningMetrics.didntUnderstandStudentObservations,
        allLearningMetrics.eligibleStudentObservations,
      ),
      doubtsAsked: allDoubtsMetrics.doubtsAsked,
      activeDoubts: raw.doubts.filter(
        x =>
          x.doubt_resolved !== true &&
          String(x.status ?? "").trim().toUpperCase() !== "RESOLVED"
      ).length,
      resolvedDoubts: allDoubtsMetrics.doubtsResolved,
      doubtResolutionRate: allDoubtsMetrics.doubtClosureRate,
    },
    classrooms,
    teachers,
    trends,
    dailyClassroomIntelligence: buildDailyClassroomIntelligence(raw),
    teacherLiveStatus: buildTeacherLiveStatus(raw),
    examPreparation: buildSchoolExamPreparation(raw),
  };
}

import type {
  SchoolAcademicTrendPoint,
  SchoolClassroomHealthRow,
  SchoolIntelligenceSnapshot,
  SchoolTeacherIntelligenceRow,
  SchoolTeacherDailyIntelligence,
  SchoolExamPreparationClassroom,
} from "../types/SchoolIntelligenceModels";
import type { SchoolIntelligenceRawData } from "../repository/SchoolIntelligenceRepository";

import { isLearningUnderstandingLevel } from "../../../utils/learningFeedbackAnalytics";

const COMPLETE = "I completely understood.";
const PARTIAL = "I partially understood.";
const NONE = "I didn't understand.";

const pct = (part: number, total: number) =>
  total === 0 ? 0 : Math.round((part / total) * 100);



const isLearningFeedback = (feedback: any) =>
  isLearningUnderstandingLevel(feedback?.effective_understanding_level ?? feedback?.understanding_level);

function getDoubtMetrics(doubts: any[]) {
  const doubtsAsked = doubts.length;

  const doubtsResolved = doubts.filter(
    doubt =>
      doubt.doubt_resolved === true ||
      String(doubt.status ?? "")
        .trim()
        .toUpperCase() === "RESOLVED"
  ).length;

  return {
    doubtsAsked,
    doubtsResolved,
    doubtClosureRate: pct(
      doubtsResolved,
      doubtsAsked
    ),
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
    const responders = new Set(
      feedback
        .filter(row => String(row.daily_log_uuid) === String(log.id))
        .map(row => row.student_uuid)
        .filter(Boolean)
    ).size;

    return Math.min(100, (responders / strength) * 100);
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
      const totalStudents=new Set(students.map(s=>s.student_uuid).filter(Boolean)).size;
      const full=feedback.filter(f=>f.understanding_level===COMPLETE).length;
      const partial=feedback.filter(f=>f.understanding_level===PARTIAL).length;
      const none=feedback.filter(f=>f.understanding_level===NONE).length;
      const submitted=new Set(feedback.map(f=>f.student_uuid).filter(Boolean)).size;
      const absentStudentUuids=new Set(feedback.filter(f=>String(f.understanding_level??"").trim()==="I was absent.").map(f=>String(f.student_uuid??"")).filter(Boolean));
      const learningStudentDenominator=Math.max(0,totalStudents-absentStudentUuids.size);
      const score=learningStudentDenominator===0?0:Math.round(((full+partial*.5)/learningStudentDenominator)*100);
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
        completelyUnderstoodRate:pct(full,learningStudentDenominator),partiallyUnderstood:partial,
        partiallyUnderstoodRate:pct(partial,learningStudentDenominator),didntUnderstand:none,
        didntUnderstandRate:pct(none,learningStudentDenominator),classHealthScore:score,classHealthStatus:status,
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
  // Absence is a neutral attendance response, not a learning outcome. Keep
  // it in response counts, but exclude it from understanding/partial/did-not-
  // understand denominators so those percentages describe learning feedback.
  const learningFeedback = effectiveFeedback.filter(isLearningFeedback);

  const complete = learningFeedback.filter(
    x => x.effective_understanding_level === COMPLETE
  ).length;
  const partial = learningFeedback.filter(
    x => x.effective_understanding_level === PARTIAL
  ).length;
  const none = learningFeedback.filter(
    x => x.effective_understanding_level === NONE
  ).length;

  const activeDoubts = raw.doubts.filter(
    x =>
      x.doubt_resolved !== true &&
      String(x.status ?? "").trim().toUpperCase() !== "RESOLVED"
  ).length;
  const resolvedDoubts = raw.doubts.filter(
    x =>
      x.doubt_resolved === true ||
      String(x.status ?? "").trim().toUpperCase() === "RESOLVED"
  ).length;

  const doubtsAsked = raw.doubts.length;

  const doubtClosureRate = pct(
    resolvedDoubts,
    doubtsAsked
  );

  const classrooms: SchoolClassroomHealthRow[] = raw.assignments.map(assignment => {
    const logs = raw.logs.filter(
      x => String(x.teacher_assignment_uuid) === String(assignment.id)
    );
    const logIds = new Set(logs.map(x => String(x.id)));
    const feedback = effectiveFeedback.filter(
      x => logIds.has(String(x.daily_log_uuid))
    );
    const learningFeedbackForAssignment = feedback.filter(isLearningFeedback);
    const teacher = raw.teachers.find(
      x => String(x.teacher_uuid) === String(assignment.teacher_uuid)
    );

    const fully = learningFeedbackForAssignment.filter(
      x => x.effective_understanding_level === COMPLETE
    ).length;
    const partly = learningFeedbackForAssignment.filter(
      x => x.effective_understanding_level === PARTIAL
    ).length;
    const difficult = learningFeedbackForAssignment.filter(
      x => x.effective_understanding_level === NONE
    ).length;

    const doubtMetrics = getDoubtMetrics(
      raw.doubts.filter(
        doubt =>
          String(
            doubt.teacher_assignment_uuid ?? ""
          ) === String(assignment.id ?? "")
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
      topicsTaught: logs.length,
      responses: feedback.length,
      responseRate: averageDailyResponseRate(
        raw,
        logs,
        feedback,
        assignment.class_name,
        assignment.section_name
      ),
      completelyUnderstood: fully,
      partiallyUnderstood: partly,
      didntUnderstand: difficult,
      understandingRate: pct(fully, learningFeedbackForAssignment.length),
      partialUnderstandingRate: pct(partly, learningFeedbackForAssignment.length),
      doubtRate: pct(difficult, learningFeedbackForAssignment.length),
      doubtsAsked: doubtMetrics.doubtsAsked,
      doubtsResolved: doubtMetrics.doubtsResolved,
      doubtClosureRate: doubtMetrics.doubtClosureRate,
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
    const logIds = new Set(logs.map(x => String(x.id)));
    const feedback = effectiveFeedback.filter(
      x => logIds.has(String(x.daily_log_uuid))
    );
    const learningFeedbackForTeacher = feedback.filter(isLearningFeedback);
    const fully = learningFeedbackForTeacher.filter(
      x => x.effective_understanding_level === COMPLETE
    ).length;
    const partly = learningFeedbackForTeacher.filter(
      x => x.effective_understanding_level === PARTIAL
    ).length;
    const difficult = learningFeedbackForTeacher.filter(
      x => x.effective_understanding_level === NONE
    ).length;

    const doubtMetrics = getDoubtMetrics(
      raw.doubts.filter(
        doubt =>
          assignmentIds.has(
            String(
              doubt.teacher_assignment_uuid ?? ""
            )
          )
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
      responses: feedback.length,
      understandingRate: pct(fully, learningFeedbackForTeacher.length),
      partialUnderstandingRate: pct(partly, learningFeedbackForTeacher.length),
      doubtRate: pct(difficult, learningFeedbackForTeacher.length),
      doubtsAsked: doubtMetrics.doubtsAsked,
      doubtsResolved: doubtMetrics.doubtsResolved,
      doubtClosureRate: doubtMetrics.doubtClosureRate,
    };
  });

  const byDate = new Map<string, any[]>();
  effectiveFeedback.forEach(row => {
    const date = String(row.submitted_at ?? "").split("T")[0];
    if (!date) return;
    byDate.set(date, [...(byDate.get(date) ?? []), row]);
  });

  const trends: SchoolAcademicTrendPoint[] = Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, rows]) => {
      const learningRows = rows.filter(isLearningFeedback);
      const fully = learningRows.filter(
        x => x.effective_understanding_level === COMPLETE
      ).length;
      const partly = learningRows.filter(
        x => x.effective_understanding_level === PARTIAL
      ).length;
      const difficult = learningRows.filter(
        x => x.effective_understanding_level === NONE
      ).length;

      return {
        date,
        responses: rows.length,
        understandingRate: pct(fully, learningRows.length),
        partialUnderstandingRate: pct(partly, learningRows.length),
        doubtRate: pct(difficult, learningRows.length),
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
      responses: raw.feedback.length,
      completelyUnderstood: complete,
      partiallyUnderstood: partial,
      didntUnderstand: none,
      understandingRate: pct(complete, learningFeedback.length),
      partialUnderstandingRate: pct(partial, learningFeedback.length),
      doubtRate: pct(none, learningFeedback.length),
      doubtsAsked,
      activeDoubts,
      resolvedDoubts,
      doubtResolutionRate: doubtClosureRate,
    },
    classrooms,
    teachers,
    trends,
    dailyClassroomIntelligence: buildDailyClassroomIntelligence(raw),
    teacherLiveStatus: buildTeacherLiveStatus(raw),
    examPreparation: buildSchoolExamPreparation(raw),
  };
}

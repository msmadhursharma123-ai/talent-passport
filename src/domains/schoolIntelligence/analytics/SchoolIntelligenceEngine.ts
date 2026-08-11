import type {
  SchoolAcademicTrendPoint,
  SchoolClassroomHealthRow,
  SchoolIntelligenceSnapshot,
  SchoolTeacherIntelligenceRow,
  SchoolTeacherDailyIntelligence,
  SchoolExamPreparationClassroom,
} from "../types/SchoolIntelligenceModels";
import type { SchoolIntelligenceRawData } from "../repository/SchoolIntelligenceRepository";

const COMPLETE = "I completely understood.";
const PARTIAL = "I partially understood.";
const NONE = "I didn't understand.";

const pct = (part: number, total: number) =>
  total === 0 ? 0 : Math.round((part / total) * 100);

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

function latestDoubtForFeedback(raw: SchoolIntelligenceRawData, feedback: any) {
  const matches = raw.doubts.filter(
    doubt =>
      String(doubt.daily_log_uuid ?? "") === String(feedback.daily_log_uuid ?? "") &&
      String(doubt.student_uuid ?? "") === String(feedback.student_uuid ?? "")
  );

  if (matches.length === 0) return null;

  return [...matches].sort((a, b) => {
    const aTime = new Date(a.revision_checked_at ?? a.created_at ?? 0).getTime();
    const bTime = new Date(b.revision_checked_at ?? b.created_at ?? 0).getTime();
    return bTime - aTime;
  })[0];
}

function effectiveUnderstanding(raw: SchoolIntelligenceRawData, feedback: any) {
  const original = feedback.understanding_level;

  if (original !== PARTIAL && original !== NONE) {
    return original;
  }

  const doubt = latestDoubtForFeedback(raw, feedback);
  if (!doubt) return original;

  const response = String(doubt.student_response ?? "").trim().toUpperCase();

  // Once the student confirms that the old gap was discussed,
  // that earlier learning signal moves into the understood bucket.
  if (
    response === "DISCUSSED" ||
    doubt.doubt_resolved === true ||
    String(doubt.status ?? "").trim().toUpperCase() === "RESOLVED"
  ) {
    return COMPLETE;
  }

  // NOT DISCUSSED (or still pending) preserves the student's original
  // PARTIAL vs DIDN'T UNDERSTAND classification.
  return original;
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
      const score=totalStudents===0?0:Math.round(((full+partial*.5)/totalStudents)*100);
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
        completelyUnderstoodRate:pct(full,totalStudents),partiallyUnderstood:partial,
        partiallyUnderstoodRate:pct(partial,totalStudents),didntUnderstand:none,
        didntUnderstandRate:pct(none,totalStudents),classHealthScore:score,classHealthStatus:status,
        mostDifficultConcept:[...conceptMap.entries()].sort((x,y)=>y[1]-x[1])[0]?.[0]??"-",
        studentsRequiringAttention:attention
      }];
    });
    return {teacherUuid:String(teacher.teacher_uuid??""),teacherName:teacher.full_name??"Teacher",classrooms};
  }).filter(t=>t.classrooms.length>0).sort((a,b)=>a.teacherName.localeCompare(b.teacherName));
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
      if(!sm.has(id))sm.set(id,{studentUuid:id,studentName:String(r.student_name??"").trim()||studentNames.get(id)||"Student",totalUnresolvedDoubts:0,topics:[]});
      const s=sm.get(id);s.totalUnresolvedDoubts++;
      const topic=String(r.previous_topic_name??r.previous_difficult_concept??"").trim();if(topic)s.topics.push(topic);
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

  const complete = effectiveFeedback.filter(
    x => x.effective_understanding_level === COMPLETE
  ).length;
  const partial = effectiveFeedback.filter(
    x => x.effective_understanding_level === PARTIAL
  ).length;
  const none = effectiveFeedback.filter(
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
    const teacher = raw.teachers.find(
      x => String(x.teacher_uuid) === String(assignment.teacher_uuid)
    );

    const fully = feedback.filter(
      x => x.effective_understanding_level === COMPLETE
    ).length;
    const partly = feedback.filter(
      x => x.effective_understanding_level === PARTIAL
    ).length;
    const difficult = feedback.filter(
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
      understandingRate: pct(fully, feedback.length),
      partialUnderstandingRate: pct(partly, feedback.length),
      doubtRate: pct(difficult, feedback.length),
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
    const fully = feedback.filter(
      x => x.effective_understanding_level === COMPLETE
    ).length;
    const partly = feedback.filter(
      x => x.effective_understanding_level === PARTIAL
    ).length;
    const difficult = feedback.filter(
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
      understandingRate: pct(fully, feedback.length),
      partialUnderstandingRate: pct(partly, feedback.length),
      doubtRate: pct(difficult, feedback.length),
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
      const fully = rows.filter(
        x => x.effective_understanding_level === COMPLETE
      ).length;
      const partly = rows.filter(
        x => x.effective_understanding_level === PARTIAL
      ).length;
      const difficult = rows.filter(
        x => x.effective_understanding_level === NONE
      ).length;

      return {
        date,
        responses: rows.length,
        understandingRate: pct(fully, rows.length),
        partialUnderstandingRate: pct(partly, rows.length),
        doubtRate: pct(difficult, rows.length),
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
      understandingRate: pct(complete, raw.feedback.length),
      partialUnderstandingRate: pct(partial, raw.feedback.length),
      doubtRate: pct(none, raw.feedback.length),
      doubtsAsked,
      activeDoubts,
      resolvedDoubts,
      doubtResolutionRate: doubtClosureRate,
    },
    classrooms,
    teachers,
    trends,
    dailyClassroomIntelligence: buildDailyClassroomIntelligence(raw),
    examPreparation: buildSchoolExamPreparation(raw),
  };
}

import { getSupabaseClient } from "../../../supabaseClient";

import {
  ClassroomFeedbackRadar,
  StudentFeedbackRow,
} from "../types/TeacherFeedbackModels";

import {
getTeacherAssignmentsByTeacher,
}
from "./TeacherAssignmentRepository";

function normalizeText(
text:string
){

return text
.trim()
.toLowerCase();

}

function getConceptKeywords(
concept:string
){

return normalizeText(concept)
.split(" ")
.filter(Boolean);

}

function buildConceptMatchingEngine(

teacherConcepts:string[],

studentResponses:string[]

){

const conceptMap =

new Map<string,number>();


for(

const teacherConcept of teacherConcepts

){

const normalizedTeacherConcept =

normalizeText(
teacherConcept
);


let count = 0;


for(

const response of studentResponses

){

const normalizedResponse =

normalizeText(
response
);


// LEVEL 1 + LEVEL 2

if(

normalizedResponse.includes(
normalizedTeacherConcept
)

){

count++;

continue;

}


// LEVEL 3

const keywords =

getConceptKeywords(
teacherConcept
);


const keywordMatched =

keywords.some(

(keyword)=>

normalizedResponse.includes(
keyword
)

);


if(

keywordMatched

){

count++;

}

}


if(count > 0){

conceptMap.set(

teacherConcept,

count

);

}


}

console.log(
"TEACHER CONCEPTS"
);

console.table(
teacherConcepts
);


console.log(
"STUDENT RESPONSES"
);

console.table(
studentResponses
);


console.log(
"CONCEPT MATCHES"
);

console.table(
Array.from(
conceptMap.entries()
)
);

return Array.from(

conceptMap.entries()

)

.sort(

(a,b)=>

b[1] - a[1]

)

.slice(0,2)

.map(

([concept,count])=>({

concept,
count,

})

);

}

interface RadarBuildContext {
  teacherConcepts?: string[];
  teacherAssignmentUuid?: string;
  actualClassName?: string;
  actualSectionName?: string;
  allStudents?: Array<{
    student_uuid: string;
    student_name: string;
  }>;
}

async function buildFeedbackRadar(

classroomFeedback:
StudentFeedbackRow[],

dailyLogUuid?: string,

context?: RadarBuildContext

): Promise<ClassroomFeedbackRadar> {

  // WE WILL BUILD THIS IN THE NEXT STEPS.

const supabase = getSupabaseClient();

    /****************************************

UNDERSTANDING BREAKDOWN

****************************************/

const completelyUnderstood =

classroomFeedback.filter(

(item)=>

item.understanding_level ===
"I completely understood."

).length;


const partiallyUnderstood =

classroomFeedback.filter(

(item)=>

item.understanding_level ===
"I partially understood."

).length;


const didNotUnderstand =

classroomFeedback.filter(

(item)=>

item.understanding_level ===
"I didn't understand."

).length;

const actualDailyLogUuid =

dailyLogUuid ??

classroomFeedback[0]?.daily_log_uuid;

const teacherConcepts:string[] =
  context?.teacherConcepts
  ? [...context.teacherConcepts]
  : [];

if(
  teacherConcepts.length === 0 &&
  actualDailyLogUuid
){

const { data: teacherLog } =

await (supabase as any)

.from(
"teacher_daily_logs"
)

.select(
"concepts_covered"
)

.eq(
"id",
actualDailyLogUuid
)

.single();

teacherConcepts.push(
...(teacherLog?.concepts_covered ?? [])
);

}

const studentResponses:string[] = [];

for(

const item of classroomFeedback

){

const concepts =

item.concepts_not_understood ?? [];


studentResponses.push(
...concepts
);


if(

item.additional_note?.trim()

){

studentResponses.push(
item.additional_note
);

}

}

/****************************************

COMMON DIFFICULT CONCEPTS

****************************************/
const commonConcepts =

buildConceptMatchingEngine(

teacherConcepts,

studentResponses

);

/****************************************

STUDENTS REQUIRING ATTENTION

****************************************/

const attentionStudents =

classroomFeedback.filter(

(item)=>

item.understanding_level !==

"I completely understood."

);


const studentUuids =
Array.from(
  new Set(
    attentionStudents
      .map(
        (item)=>item.student_uuid
      )
      .filter(Boolean)
  )
);

const studentNameMap =
new Map<string,string>();

const studentSource =
  context?.allStudents ?? [];

studentSource.forEach(
  (student:any)=>{
    studentNameMap.set(
      student.student_uuid,
      student.student_name
    );
  }
);

if(
  !context?.allStudents &&
  studentUuids.length > 0
){

const { data: students } =
await (supabase as any)
.from("students_master")
.select(
"student_uuid,student_name"
)
.in(
"student_uuid",
studentUuids
);

students?.forEach((student:any)=>{

studentNameMap.set(
student.student_uuid,
student.student_name
);

});

}
console.log("STUDENT NAME MAP");

console.log(studentNameMap);

const groupedStudents = new Map();

for (const item of attentionStudents) {

const studentName =
studentNameMap.get(item.student_uuid) ??
"Student";


if (!groupedStudents.has(item.student_uuid)) {

groupedStudents.set(
item.student_uuid,
{
studentName,
understandingLevel:
item.understanding_level,
concepts: [],
}
);

}


const student =
groupedStudents.get(
item.student_uuid
);


const concepts =
item.concepts_not_understood ?? [];


student.concepts.push(
...concepts
);

}


const studentsRequiringAttention =
Array.from(
groupedStudents.values()
);

console.log(
"FINAL STUDENTS REQUIRING ATTENTION"
);

console.table(
studentsRequiringAttention
);

console.log(
"STUDENTS REQUIRING ATTENTION"
);

console.table(
studentsRequiringAttention
);

/****************************************

TOTAL STUDENTS

****************************************/

let totalStudentsInClass = 0;

let pendingStudents:any[] = [];

let actualClassName =
  context?.actualClassName ?? "";

let actualSectionName =
  context?.actualSectionName ?? "";

let teacherAssignmentUuid =
  context?.teacherAssignmentUuid ?? "";

if(
  !teacherAssignmentUuid &&
  actualDailyLogUuid
){

const {
data:dailyLog
} = await (supabase as any)
.from("teacher_daily_logs")
.select(
"teacher_assignment_uuid"
)
.eq(
"id",
actualDailyLogUuid
)
.single();

teacherAssignmentUuid =
dailyLog?.teacher_assignment_uuid ?? "";

}

/*
---------------------------------------
FETCH CLASSROOM ASSIGNMENT
---------------------------------------
*/

if(
  (!actualClassName ||
   !actualSectionName) &&
  teacherAssignmentUuid
){

const {
data:assignment
} = await (supabase as any)
.from(
"teacher_classroom_assignments"
)
.select(
"class_name,section_name"
)
.eq(
"id",
teacherAssignmentUuid
)
.single();

actualClassName =
assignment?.class_name ?? "";

actualSectionName =
assignment?.section_name ?? "";

}

/*
---------------------------------------
FETCH TOTAL STUDENTS
---------------------------------------
*/

if(

actualClassName &&
actualSectionName

){

let allStudents =
  context?.allStudents ?? [];

if(
  !context?.allStudents
){

const {
data
} = await (supabase as any)

.from("students_master")

.select(
"student_uuid,student_name"
)

.eq(
"class_name",
actualClassName
)

.eq(
"section_name",
actualSectionName
);

allStudents =
  data ?? [];

}

totalStudentsInClass =

allStudents.length;


/*
---------------------------------------
PENDING STUDENTS
---------------------------------------
*/

const submittedStudentUuids =

classroomFeedback.map(

(item)=>item.student_uuid

);


pendingStudents =

(allStudents ?? []).filter(

(student:any)=>{

return !submittedStudentUuids.includes(

student.student_uuid

);

}

);

}


const pendingStudentsCount =

pendingStudents.length;

/****************************************

CLASSROOM HEALTH SCORE

****************************************/

const totalStudents =

totalStudentsInClass;


const healthScore =

totalStudents === 0

? 0

:

Math.round(

(

(

completelyUnderstood +

(partiallyUnderstood * 0.5)

)

/

totalStudents

)

* 100

);


let status =

"Excellent";


if(

healthScore < 80

){

status =

"Needs Attention";

}


if(

healthScore < 50

){

status =

"Critical";

}


const classroomHealthScore = {

score:

healthScore,

status,

};

/****************************************

TOMORROW'S TEACHING PLAN

****************************************/

const teachingRecommendation =

commonConcepts.length === 0

?

"No revision required."

:

commonConcepts.length === 1

?

`Most students struggled with ${
commonConcepts[0].concept
}. Please revise this concept before beginning tomorrow's lecture.`

:

`Most students struggled with ${
commonConcepts
.map((item)=>item.concept)
.join(" and ")
}. Please spend the first few minutes revising these concepts before beginning tomorrow's lecture.`;
  
  /*
      FINAL RESPONSE
  */

const radar = {

classroomHealthScore,

completelyUnderstood,

partiallyUnderstood,

didNotUnderstand,

commonConcepts,

studentsRequiringAttention,

teachingRecommendation,


// NEW

totalStudents,

pendingStudentsCount,

pendingStudents,

};

  console.log(
    "CLASSROOM RADAR"
  );

  console.log(radar);

  return radar;
}


export async function getClassroomFeedbackRadar(
  className: string,
  sectionName: string
): Promise<ClassroomFeedbackRadar> {

  const classroomFeedback =
    await getClassroomFeedbackRows(
      className,
      sectionName
    );

  return await buildFeedbackRadar(
    classroomFeedback
  );

}



export async function getClassroomFeedbackRows(
  className: string,
  sectionName: string
): Promise<StudentFeedbackRow[]> {
  const supabase =
    getSupabaseClient();

  const { data, error } =
    await (supabase as any)
      .from(
        "student_daily_feedback"
      )
      .select("*")
      .eq(
        "class_name",
        className
      )
      .eq(
        "section_name",
        sectionName
      );

  if (error) {
    console.error(error);

    return [];
  }

  console.log(
    "CLASSROOM FEEDBACK"
  );

  console.table(data);

  return data ?? [];
}

export async function getLectureFeedbackRows(
  dailyLogUuid: string
): Promise<StudentFeedbackRow[]> {

  const supabase = getSupabaseClient();

  const { data, error } = await (supabase as any)

    .from("student_daily_feedback")

    .select("*")

    .eq(
      "daily_log_uuid",
      dailyLogUuid
    );

  if (error) {
    throw error;
  }

console.log(
    "DAILY LOG UUID RECEIVED"
);

console.log(
    dailyLogUuid
);

console.log(
    "LECTURE FEEDBACK ROWS"
);

console.table(
    data
);

  return data ?? [];

}

export async function getLectureFeedbackRadar(
  dailyLogUuid: string
): Promise<ClassroomFeedbackRadar> {

  const lectureFeedback =

    await getLectureFeedbackRows(
      dailyLogUuid
    );

  console.log(
    "LECTURE FEEDBACK"
  );

  console.table(
    lectureFeedback
  );

return await buildFeedbackRadar(

lectureFeedback,

dailyLogUuid

);

}

/*
 =========================================================
 FAST LECTURE RADAR
 ---------------------------------------------------------
 Used by Teacher Home. It keeps the exact radar calculation
 but preloads the classroom context so buildFeedbackRadar()
 does not repeat the same database lookups.
 =========================================================
*/
export async function getLectureFeedbackRadarFast(
  dailyLogUuid: string
): Promise<ClassroomFeedbackRadar> {

  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error(
      "Supabase not configured."
    );
  }

  const [
    classroomFeedback,
    teacherLogResult,
  ] = await Promise.all([

    getLectureFeedbackRows(
      dailyLogUuid
    ),

    (supabase as any)
      .from("teacher_daily_logs")
      .select(
        "teacher_assignment_uuid,concepts_covered"
      )
      .eq(
        "id",
        dailyLogUuid
      )
      .single(),

  ]);

  const teacherLog =
    teacherLogResult?.data;

  const teacherAssignmentUuid =
    teacherLog?.teacher_assignment_uuid ??
    "";

  let actualClassName = "";
  let actualSectionName = "";

  if (teacherAssignmentUuid) {

    const {
      data: assignment,
      error: assignmentError,
    } = await (supabase as any)
      .from(
        "teacher_classroom_assignments"
      )
      .select(
        "class_name,section_name"
      )
      .eq(
        "id",
        teacherAssignmentUuid
      )
      .single();

    if (assignmentError) {
      throw assignmentError;
    }

    actualClassName =
      assignment?.class_name ?? "";

    actualSectionName =
      assignment?.section_name ?? "";

  }

  let allStudents:
    Array<{
      student_uuid: string;
      student_name: string;
    }> = [];

  if (
    actualClassName &&
    actualSectionName
  ) {

    const {
      data: students,
      error: studentsError,
    } = await (supabase as any)
      .from("students_master")
      .select(
        "student_uuid,student_name"
      )
      .eq(
        "class_name",
        actualClassName
      )
      .eq(
        "section_name",
        actualSectionName
      );

    if (studentsError) {
      throw studentsError;
    }

    allStudents =
      students ?? [];

  }

  return buildFeedbackRadar(
    classroomFeedback,
    dailyLogUuid,
    {
      teacherConcepts:
        teacherLog?.concepts_covered ?? [],

      teacherAssignmentUuid,

      actualClassName,

      actualSectionName,

      allStudents,
    }
  );

}

export async function getStudentsAtRisk(
  className: string,
  sectionName: string
) {

  const supabase =
    getSupabaseClient();


  /*
  =========================================================
  FETCH CLASSROOM FEEDBACK
  =========================================================
  */

  const {
    data: feedbacks,
    error: feedbackError,
  } = await (supabase as any)

    .from("student_daily_feedback")

    .select("*")

    .eq(
      "class_name",
      className
    )

    .eq(
      "section_name",
      sectionName
    );


  if (feedbackError) {

    console.error(
      "STUDENTS AT RISK FEEDBACK ERROR",
      feedbackError
    );

    return {
      veryCritical: [],
      critical: [],
      moderate: [],
    };
  }


  console.log(
    "STUDENTS AT RISK FEEDBACKS"
  );

  console.table(
    feedbacks
  );


  if (
    !feedbacks ||
    feedbacks.length === 0
  ) {

    return {
      veryCritical: [],
      critical: [],
      moderate: [],
    };
  }


  /*
  =========================================================
  GET UNIQUE STUDENT UUIDS
  =========================================================
  */

  const studentUuids: string[] =

    Array.from(

      new Set<string>(

        feedbacks

          .map(
            (item: any) =>
              item.student_uuid
          )

          .filter(
            (uuid: any): uuid is string =>
              Boolean(uuid)
          )

      )

    );


  /*
  =========================================================
  FETCH REAL STUDENT NAMES
  FROM STUDENTS MASTER
  =========================================================
  */

  const {
    data: students,
    error: studentError,
  } = await (supabase as any)

    .from("students_master")

    .select(
      "student_uuid,student_name"
    )

    .in(
      "student_uuid",
      studentUuids
    );


  if (studentError) {

    console.error(
      "STUDENT NAME FETCH ERROR",
      studentError
    );
  }


  /*
  =========================================================
  BUILD UUID → STUDENT NAME MAP
  =========================================================
  */

  const studentNameMap =
    new Map<string, string>();


  (students ?? []).forEach(
    (student: any) => {

      if (
        student.student_uuid
      ) {

        studentNameMap.set(
          student.student_uuid,
          student.student_name || "Student"
        );

      }

    }
  );


  console.log(
    "STUDENTS AT RISK NAME MAP"
  );

  console.table(
    Array.from(
      studentNameMap.entries()
    )
  );


  /*
  =========================================================
  GROUP ALL FEEDBACK BY STUDENT UUID
  =========================================================
  */

  const groupedStudents =
    new Map<string, any[]>();


  feedbacks.forEach(
    (item: any) => {

      if (
        !item.student_uuid
      ) {

        return;
      }


      if (
        !groupedStudents.has(
          item.student_uuid
        )
      ) {

        groupedStudents.set(
          item.student_uuid,
          []
        );

      }


      groupedStudents
        .get(
          item.student_uuid
        )!
        .push(
          item
        );

    }
  );


  /*
  =========================================================
  FINAL RISK CATEGORIES
  =========================================================
  */

  const veryCritical: string[] = [];

  const critical: string[] = [];

  const moderate: string[] = [];


  /*
  =========================================================
  ANALYSE EACH STUDENT
  =========================================================
  */

  for (
    const [
      studentUuid,
      responses,
    ] of groupedStudents
  ) {


    /*
    ---------------------------------------------------------
    SORT RESPONSES

    IMPORTANT:
    Keep created_at as the chronology used by the
    existing risk engine.
    ---------------------------------------------------------
    */

    const sortedResponses =
      [...responses].sort(

        (a: any, b: any) => {

          const aTime =
            a.created_at
              ? new Date(
                  a.created_at
                ).getTime()
              : 0;

          const bTime =
            b.created_at
              ? new Date(
                  b.created_at
                ).getTime()
              : 0;


          return (
            bTime - aTime
          );

        }

      );


    /*
    ---------------------------------------------------------
    TAKE LATEST 3 SUBMITTED RESPONSES
    ---------------------------------------------------------
    */

    const lastThree =

      sortedResponses

        .slice(
          0,
          3
        )

        .map(
          (item: any) =>
            item.understanding_level
        );


    /*
    ---------------------------------------------------------
    STUDENT NEEDS AT LEAST 3 RESPONSES
    BEFORE RISK CLASSIFICATION
    ---------------------------------------------------------
    */

    if (
      lastThree.length < 3
    ) {

      continue;
    }


    /*
    ---------------------------------------------------------
    RESOLVE REAL STUDENT NAME
    ---------------------------------------------------------
    */

    const studentName =

      studentNameMap.get(
        studentUuid
      )

      ??

      sortedResponses[0]
        ?.student_name

      ??

      "Student";


    /*
    ---------------------------------------------------------
    COUNT UNDERSTANDING LEVELS
    ---------------------------------------------------------
    */

    const didntCount =

      lastThree.filter(

        (level: string) =>

          level ===
          "I didn't understand."

      ).length;


    const partialCount =

      lastThree.filter(

        (level: string) =>

          level ===
          "I partially understood."

      ).length;


    /*
    =========================================================
    VERY CRITICAL

    LAST 3 RESPONSES:

    DIDN'T
    DIDN'T
    DIDN'T
    =========================================================
    */

    if (
      didntCount === 3
    ) {

      veryCritical.push(
        studentName
      );

      continue;
    }


    /*
    =========================================================
    CRITICAL

    LAST 3 RESPONSES:

    2 × DIDN'T
    1 × PARTIALLY

    Order does not matter.
    =========================================================
    */

    if (
      didntCount === 2 &&
      partialCount === 1
    ) {

      critical.push(
        studentName
      );

      continue;
    }


    /*
    =========================================================
    MODERATE

    LAST 3 RESPONSES:

    PARTIAL
    PARTIAL
    PARTIAL
    =========================================================
    */

    if (
      partialCount === 3
    ) {

      moderate.push(
        studentName
      );

      continue;
    }

  }


  /*
  =========================================================
  DEBUG — VERIFY CALCULATION
  =========================================================
  */

  console.log(
    "FINAL STUDENTS AT RISK"
  );

  console.log({
    veryCritical,
    critical,
    moderate,
  });


  /*
  =========================================================
  FINAL RESULT
  =========================================================
  */

  return {

    veryCritical,

    critical,

    moderate,

  };

}

import { getSupabaseClient } from "../../../supabaseClient";

import {
  getCurrentTeacher,
} from "../../../services/identityService";

import {
  getTeacherAssignmentsByTeacher,
} from "./TeacherAssignmentRepository";


function getHighestRiskTopic(
  topics: string[]
) {
  const topicMap =
    new Map<string, number>();

  for (const topic of topics) {
    topicMap.set(
      topic,
      (topicMap.get(topic) ?? 0) + 1
    );
  }

  let highestTopic = "";
  let highestCount = 0;

  topicMap.forEach(
    (count, topic) => {
      if (count > highestCount) {
        highestCount = count;
        highestTopic = topic;
      }
    }
  );

  return highestTopic;
}


function getAttentionLevel(
  count: number
) {
  if (count >= 6) {
    return "HIGH";
  }

  if (count >= 3) {
    return "MEDIUM";
  }

  return "LOW";
}


export async function
getTeacherExamAttentionIntelligence(
  startDate?: string,
  endDate?: string
) {

  const teacher =
    getCurrentTeacher();

  if (!teacher) {
    return [];
  }


  const assignments =

    await getTeacherAssignmentsByTeacher(
      teacher.teacherUuid
    );


  const assignmentIds =

    assignments
      .map((item) => item.id)
      .filter(Boolean);


  if (
    assignmentIds.length === 0
  ) {
    return [];
  }


  const supabase =
    getSupabaseClient();


  let query = (supabase as any)
    .from(
      "pending_teacher_doubts"
    )
    .select("*")
    .in(
      "teacher_assignment_uuid",
      assignmentIds
    )
    .eq(
      "status",
      "NOT DISCUSSED"
    );

  if (startDate) {
    query = query.gte("log_date", startDate);
  }

  if (endDate) {
    query = query.lte("log_date", endDate);
  }

  const {
    data,
    error,
  } = await query;


  if (error) {
    throw error;
  }


  if (!data) {
    return [];
  }


  /*
--------------------------------

CREATE ALL CLASSROOMS
FROM TEACHER ASSIGNMENTS

--------------------------------
*/

const classroomMap =
  new Map();


for (const assignment of assignments) {

  const classroomKey =

    `Class ${assignment.className} - Section ${assignment.sectionName}`;


  classroomMap.set(
    classroomKey,
    []
  );

}


/*
--------------------------------

PUSH EXISTING DATA
INTO CLASSROOMS

--------------------------------
*/

for (const item of data) {

  const classroomKey =

    `Class ${item.class_name} - Section ${item.section_name}`;


  if (
    classroomMap.has(
      classroomKey
    )
  ) {

    classroomMap
      .get(classroomKey)
      .push(item);

  }

}


  /*
  --------------------------------

  BUILD TABLE DATA

  --------------------------------
  */

  const result: any[] = [];


  for (

    const [

      classroom,

      records,

    ]

    of classroomMap

  ) {

/*
--------------------------------

EMPTY CLASSROOM

--------------------------------
*/

if (records.length === 0) {

  result.push({

    classroom,

    students: [],

  });

  continue;

}

    const studentMap =
      new Map();


    for (const row of records) {

      if (

        !studentMap.has(
          row.student_name
        )

      ) {

        studentMap.set(

          row.student_name,

          {

            studentName:
              row.student_name,

            totalUnresolvedDoubts:
              0,

            topics: [],

          }

        );

      }

      

      const student =

        studentMap.get(
          row.student_name
        );


      student.totalUnresolvedDoubts += 1;


      student.topics.push(
        row.previous_topic_name
      );

    }


    /*
    --------------------------------

    SORT DESCENDING

    --------------------------------
    */

    const students =

      Array.from(
        studentMap.values()
      )

        .map(
          (student: any) => ({

            studentName:
              student.studentName,

            totalUnresolvedDoubts:
              student.totalUnresolvedDoubts,

            topics:
              student.topics,

            highestRiskTopic:
              getHighestRiskTopic(
                student.topics
              ),

            attentionLevel:
              getAttentionLevel(
                student.totalUnresolvedDoubts
              ),

          })
        )

        .sort(

          (a: any, b: any) =>

            b.totalUnresolvedDoubts -

            a.totalUnresolvedDoubts

        );


    /*
    --------------------------------

    PUSH TABLE

    --------------------------------
    */

    result.push({

      classroom,

      students,

    });

  }


  return result;

}
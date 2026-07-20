/*******************************************************
 * ACADEMIC MASTER REPOSITORY
 *
 * Foundation Hub is the single source of truth for:
 *
 * Board
 * Class
 * Subjects
 * Chapters
 * Topics
 * Sub Topics
 *
 * This repository will be consumed by:
 *
 * Teacher Portal
 * Student Portal
 * Parent Portal
 * Growth Plan
 * Continuous Calendar
 * Progress Tracker
 * Teacher Analytics
 * Academic Analytics
 *
 *******************************************************/


/* =====================================================
   BOARDS
===================================================== */

export function getBoards() {
  return ["CBSE", "ICSE"];
}


/* =====================================================
   CLASSES
===================================================== */

export function getClasses() {
  return [
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
  ];
}


/* =====================================================
   SUBJECTS
===================================================== */

export function getSubjectsByClass(
  className: string
) {
  const classNumber =
    Number(className);


  /* ------------------------------------------
     CLASS 4 & 5
  ------------------------------------------ */

  if (
    classNumber === 4 ||
    classNumber === 5
  ) {
    return [
      "All Subjects",
      "Mathematics",
      "English",
      "Hindi",
      "EVS",
      "Social Studies",
      "Computer Science",
      "General Knowledge",
    ];
  }


  /* ------------------------------------------
     CLASS 6 TO 8
  ------------------------------------------ */

  if (
    classNumber >= 6 &&
    classNumber <= 8
  ) {
    return [
      "All Subjects",
      "Mathematics",
      "English",
      "Hindi",
      "Science",
      "Physics",
      "Chemistry",
      "Biology",
      "History",
      "Civics",
      "Geography",
      "Social Studies",
      "Computer Science",
      "General Knowledge",
    ];
  }


  /* ------------------------------------------
     CLASS 9 & 10
  ------------------------------------------ */

  if (
    classNumber === 9 ||
    classNumber === 10
  ) {
    return [
      "All Subjects",
      "Mathematics",
      "English",
      "Hindi",
      "Science",
      "Physics",
      "Chemistry",
      "Biology",
      "History",
      "Civics",
      "Geography",
      "Social Science",
      "Computer Science",
      "General Knowledge",
      "Physical Education",
      "Economics",
      "Business Studies",
    ];
  }


  return ["All Subjects"];
}



/* =====================================================
   CHAPTERS
===================================================== */

export async function getChaptersBySubject() {

  return [];

}


/* =====================================================
   TOPICS
===================================================== */

export async function getTopicsByChapter() {

  return [];

}


/* =====================================================
   SUB TOPICS
===================================================== */

export async function getSubTopicsByTopic() {

  return [];

}
/* ============================================================
   STUDENT QUESTIONNAIRE

   Responsibilities

   • Student questionnaire definition
   • Static configuration
   • No Repository
   • No Identity
   • No Supabase
============================================================ */

export type QuestionType =

  | "single"

  | "multi"

  | "slider";

export interface StudentQuestion {

  id: number;

  type: QuestionType;

  title: string;

  options?: readonly string[];

  minSelect?: number;

  min?: number;

  max?: number;

}

export const studentQuestions:
ReadonlyArray<StudentQuestion> = [

  {
    id: 1,
    type: "single",
    title: "Who is building this profile?",
    options: [
      "Parent",
      "Student",
      "Teacher",
      "Guardian"
    ]
  },

  {
    id: 2,
    type: "single",
    title: "Which class is the student currently studying in?",
    options: [
      "Class 4",
      "Class 5",
      "Class 6",
      "Class 7",
      "Class 8",
      "Class 9",
      "Class 10",
      "Class 11",
      "Class 12"
    ]
  },

  {
    id: 3,
    type: "multi",
    minSelect: 5,
    title: "Which words best describe the student?",
    options: [
      "Creative",
      "Curious",
      "Confident",
      "Leader",
      "Shy",
      "Athletic",
      "Artistic",
      "Analytical",
      "Team Player",
      "Independent",
      "Loves Performing",
      "Problem Solver"
    ]
  },

  {
    id: 4,
    type: "multi",
    minSelect: 3,
    title: "Which activities does the student genuinely enjoy?",
    options: [
      "Dance",
      "Music",
      "Singing",
      "Art",
      "Theatre",
      "Debate",
      "Public Speaking",
      "Coding",
      "Robotics",
      "Sports",
      "Writing",
      "Reading"
    ]
  },

  {
    id: 5,
    type: "single",
    title: "What does the student spend most free time doing?",
    options: [
      "Sports",
      "Reading",
      "Drawing",
      "Gaming",
      "YouTube",
      "Dancing",
      "Music",
      "Building Things",
      "Performing"
    ]
  },

  {
    id: 6,
    type: "multi",
    minSelect: 3,
    title: "Which areas would you most like to improve?",
    options: [
      "Confidence",
      "Leadership",
      "Communication",
      "Creativity",
      "Teamwork",
      "Critical Thinking",
      "Focus"
    ]
  },

  {
    id: 7,
    type: "slider",
    title: "How comfortable is the student while performing on stage?",
    min: 1,
    max: 10
  },

  {
    id: 8,
    type: "slider",
    title: "How comfortable is the student making new friends?",
    min: 1,
    max: 10
  },

  {
    id: 9,
    type: "single",
    title: "How often does the student participate in competitions?",
    options: [
      "Never",
      "Once",
      "Occasionally",
      "Frequently",
      "Very Active"
    ]
  },

  {
    id: 10,
    type: "multi",
    minSelect: 3,
    title: "What are your goals for the student?",
    options: [
      "Build Confidence",
      "Discover Talents",
      "Improve Communication",
      "Leadership Development",
      "Recognition",
      "Scholarships",
      "Portfolio Building",
      "Future Career Discovery"
    ]
  }

] as const;
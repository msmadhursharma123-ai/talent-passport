import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import {
  fetchAllSubmissions,
  fetchStudentsMaster,
  fetchStudentEvents,
  fetchTalentPassports,
  fetchDNAProfiles,
} from "../supabaseClient";

import {
  HeroBanner,
  DashboardFilters,
  RegistrationTracker,
  ExecutiveKPIs,
} from "./admin/dashboard";

import PlatformSnapshot from "./admin/dashboard/PlatformSnapshot";

/* ============================================================
   DASHBOARD FILTER HELPERS
============================================================ */

function getUniqueSchools(
  students: any[]
): string[] {

  return [

    "All Schools",

    ...new Set(

      students

        .map(

          student => student.school_name

        )

        .filter(Boolean)

    )

  ];

}

function getUniqueClasses(
  students: any[]
): string[] {

  return [

    "All Classes",

    ...new Set(

      students

        .map(

          student => student.class_name

        )

        .filter(Boolean)

    )

  ];

}

function filterStudents(

  students: any[],

  selectedSchool: string,

  selectedClass: string

) {

  return students.filter(student => {

    const schoolMatch =

      selectedSchool === "All Schools" ||

      student.school_name === selectedSchool;

    const classMatch =

      selectedClass === "All Classes" ||

      student.class_name === selectedClass;

    return schoolMatch && classMatch;

  });

}

function filterSubmissions(

  submissions: any[],

  filteredStudents: any[]

) {

  const ids = new Set(

    filteredStudents.map(

      student => student.student_id

    )

  );

  return submissions.filter(

    submission =>

      ids.has(

        submission.student_id

      )

  );

}

/* ============================================================
   DASHBOARD METRIC HELPERS
============================================================ */

function calculateDashboardMetrics(

  students: any[],

  submissions: any[],

  passports: any[],

  dnaProfiles: any[]

) {

  return {

    totalStudents:
      students.length,

    totalSubmissions:
      submissions.length,

    totalPassports:
      passports.length,

    totalDNAProfiles:
      dnaProfiles.length

  };

}

/* ============================================================
   COMPLETION HELPERS
============================================================ */

function calculateCompletionStats(

  students: any[],

  passports: any[]

) {

  const completed =

    passports.length;

  const pending =

    Math.max(

      0,

      students.length -

      completed

    );

  return {

    completed,

    pending

  };

}

/* ============================================================
   AVERAGE SCORE HELPERS
============================================================ */

function calculateAverageDNA(

  dnaProfiles: any[]

) {

  if (!dnaProfiles.length) {

    return 0;

  }

  const total =

    dnaProfiles.reduce(

      (sum, profile) =>

        sum +

        (profile.combined_score ?? 0),

      0

    );

  return Math.round(

    total /

    dnaProfiles.length

  );

}

function calculateAveragePassport(

  passports: any[]

) {

  if (!passports.length) {

    return 0;

  }

  const total =

    passports.reduce(

      (sum, passport) =>

        sum +

        (passport.combined_score ?? 0),

      0

    );

  return Math.round(

    total /

    passports.length

  );

}

/* ============================================================
   SUMMARY METRICS
============================================================ */

function calculateSummaryMetrics(

  filteredStudents: any[],

  filteredSubmissions: any[]

) {

  const totalSchools =

    new Set(

      filteredStudents.map(

        student => student.school_name

      )

    ).size;

  const totalClasses =

    new Set(

      filteredStudents.map(

        student => student.class_name

      )

    ).size;

  const totalCompetitions =

    new Set(

      filteredSubmissions.map(

        submission => submission.event_name

      )

    ).size;

const pendingEvaluationRows =
  filteredSubmissions.filter(
    submission =>
      submission.overall_score === null ||
      submission.overall_score === undefined
  );

const pendingEvaluations =
  pendingEvaluationRows.length;

  return {

    totalStudents:

      filteredStudents.length,

    totalEntries:

      filteredSubmissions.length,

    totalSchools,

    totalClasses,

    totalCompetitions,

    pendingEvaluations

  };

}

/* ============================================================
   REGISTRATION COMPLETION
============================================================ */

function calculateRegistrationStatus(

  students: any[],

  studentEvents: any[]

) {

  const completedStudents =

    students.filter(student => {

      const completedEvents =

        studentEvents.filter(

          event =>

            event.student_id ===
            student.student_id &&

            event.status ===
            "Completed"

        );

      return completedEvents.length >= 4;

    });

  const incompleteStudents =

    students.filter(student => {

      const completedEvents =

        studentEvents.filter(

          event =>

            event.student_id ===
            student.student_id &&

            event.status ===
            "Completed"

        );

      return completedEvents.length < 4;

    });


    
  return {

    completedStudents,

    incompleteStudents

  };

}

/* ============================================================
   TOP SCHOOL ANALYTICS
============================================================ */

function calculateTopSchools(

  filteredStudents: any[]

) {

  const participationMap =
    new Map<string, number>();

  filteredStudents.forEach(student => {

    const school =
      student.school_name ?? "Unknown";

    participationMap.set(

      school,

      (participationMap.get(school) ?? 0) + 1

    );

  });

  return [...participationMap.entries()]

    .map(([school, count]) => ({

      school,

      count

    }))

    .sort(

      (a, b) =>

        b.count - a.count

    )

    .slice(0, 5);

}

/* ============================================================
   TOP EVENT ANALYTICS
============================================================ */

function calculateTopEvents(

  filteredSubmissions: any[]

) {

  const eventMap =
    new Map<string, number>();

  filteredSubmissions.forEach(submission => {

    const event =
      submission.event_name ?? "Unknown";

    eventMap.set(

      event,

      (eventMap.get(event) ?? 0) + 1

    );

  });

  return [...eventMap.entries()]

    .map(([event, count]) => ({

      event,

      count

    }))

    .sort(

      (a, b) =>

        b.count - a.count

    )

    .slice(0, 5);

}

/* ============================================================
   PASSPORT & DNA ANALYTICS
============================================================ */

function calculateProfileAnalytics(

  passports: any[],

  dnaProfiles: any[]

) {

  const passportAverage =

    passports.length === 0

      ? 0

      : Math.round(

          passports.reduce(

            (sum, passport) =>

              sum +

              (passport.overall_score ??

               passport.score ??

               0),

            0

          ) /

          passports.length

        );

  const dnaAverage =

    dnaProfiles.length === 0

      ? 0

      : Math.round(

          dnaProfiles.reduce(

            (sum, dna) =>

              sum +

              (dna.overall_score ??

               dna.score ??

               0),

            0

          ) /

          dnaProfiles.length

        );

  return {

    passportAverage,

    dnaAverage

  };

}

export default function AdminDashboard() {

  const [submissions, setSubmissions] =
    useState<any[]>([]);

  const [students, setStudents] =
    useState<any[]>([]);

  const [studentEvents, setStudentEvents] =
    useState<any[]>([]);

  const [passports, setPassports] =
    useState<any[]>([]);

  const [dnaProfiles, setDNAProfiles] =
    useState<any[]>([]);

 const [selectedSchool,
  setSelectedSchool] =
  useState("All Schools");

const [selectedClass,
  setSelectedClass] =
  useState("All Classes");

const [showIncomplete,
  setShowIncomplete] =
  useState(false);

/* Registration Filters */

const [registrationSchool,
  setRegistrationSchool] =
  useState("All Schools");

const [registrationClass,
  setRegistrationClass] =
  useState("All Classes");

const [registrationActivity,
  setRegistrationActivity] =
  useState("All Activities");

  useEffect(() => {
    loadData();
  }, []);

  /* ============================================================
   LOAD DASHBOARD DATA
============================================================ */

async function loadData(): Promise<void> {

  try {

    const [

      submissionsResult,

      studentsResult,

      eventsResult,

      passportsResult,

      dnaResult

    ] = await Promise.all([

      fetchAllSubmissions(),

      fetchStudentsMaster(),

      fetchStudentEvents(),

      fetchTalentPassports(),

      fetchDNAProfiles()

    ]);

    

    setSubmissions(

      submissionsResult?.submissions ?? []

    );

    setStudents(

      studentsResult ?? []

    );

    setStudentEvents(

      eventsResult ?? []

    );

    setPassports(

      passportsResult ?? []

    );

    setDNAProfiles(

      dnaResult ?? []

    );

  } catch (error) {

    console.error(

      "ADMIN DASHBOARD LOAD ERROR",

      error

    );

    setSubmissions([]);

    setStudents([]);

    setStudentEvents([]);

    setPassports([]);

    setDNAProfiles([]);

  }

}

  const schools =

  getUniqueSchools(

    students

  );

const classes =

  getUniqueClasses(

    students

  );

const filteredStudents =

  filterStudents(

    students,

    selectedSchool,

    selectedClass

  );

  const filteredSubmissions =
  filterSubmissions(
    submissions,
    filteredStudents
  );

const summary =

  calculateSummaryMetrics(

    filteredStudents,

    filteredSubmissions

  );

const pendingEvaluationRows =
  filteredSubmissions.filter(
    submission =>
      submission.overall_score === null ||
      submission.overall_score === undefined
  );

  const {

  completedStudents,

  incompleteStudents

} =

  calculateRegistrationStatus(

    filteredStudents,

    studentEvents

  );

const registrationStudents = incompleteStudents.map(
  (student) => {

    const studentRows =
      studentEvents.filter(
        (event) =>
          event.student_id ===
          student.student_id
      );

    const missingEvents: string[] = [];

    if (
      !studentRows.some(
        (x) =>
          x.event_name ===
          "Communication"
      )
    ) {
      missingEvents.push(
        "Communication"
      );
    }

    if (
      !studentRows.some(
        (x) =>
          x.event_name ===
          "Creative Expression"
      )
    ) {
      missingEvents.push(
        "Creative Expression"
      );
    }

    if (
      !studentRows.some(
        (x) =>
          x.event_name ===
          "Critical Thinking"
      )
    ) {
      missingEvents.push(
        "Critical Thinking"
      );
    }

    if (
      !studentRows.some(
        (x) =>
          x.event_name ===
          "Team Event"
      )
    ) {
      missingEvents.push(
        "Team Event"
      );
    }

    return {
      id: student.student_id,
      studentName:
        student.student_name,
      schoolName:
        student.school_name,
      className:
        student.class_name,
      missingEvents,
    };
  }
);

  const topSchools =

  calculateTopSchools(

    filteredStudents

  );

const topEvents =

  calculateTopEvents(

    filteredSubmissions

  );

 const {

  passportAverage,

  dnaAverage

} =

  calculateProfileAnalytics(

    passports,

    dnaProfiles

  );

  return (
    <div
      style={{
        padding: "40px",
        background:
          "#F3F4F6",
        minHeight:
          "100vh",
      }}
    >

      {/* HERO SECTION */}

     <HeroBanner
  title="ADMIN INTELLIGENCE CENTER"
  subtitle="Competition Operations, Participation, Talent Passport & School Insights"
/>

      {/* FILTER BAR */}

<DashboardFilters
  schools={schools}
  classes={classes}
  selectedSchool={selectedSchool}
  selectedClass={selectedClass}
  showIncomplete={showIncomplete}
  onSchoolChange={setSelectedSchool}
  onClassChange={setSelectedClass}
  onToggleIncomplete={() =>
    setShowIncomplete((previous) => !previous)
  }
/>

      {/* KPI */}

{/* EXECUTIVE INTELLIGENCE */}

<h3
  style={{
    margin: "8px 0 16px",
    color: "#071952",
    fontSize: "18px",
    fontWeight: 700,
  }}
>
  Executive Intelligence
</h3>

<ExecutiveKPIs />

{/* PLATFORM SNAPSHOT */}

<h3
  style={{
    margin: "8px 0 16px",
    color: "#071952",
    fontSize: "18px",
    fontWeight: 700,
  }}
>
  Platform Snapshot
</h3>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "20px",
    marginBottom: "24px",
  }}
>
<PlatformSnapshot
  summary={{
    totalStudents: summary.totalStudents,
    totalEntries: summary.totalEntries,
    totalSchools: summary.totalSchools,
    totalClasses: summary.totalClasses,
    competitions: summary.totalCompetitions,
    pendingEvaluations: summary.pendingEvaluations,
    completedRegistrations:
      completedStudents.length,
    incompleteRegistrations:
      incompleteStudents.length,
  }}

  students={filteredStudents}

  submissions={filteredSubmissions}

  pendingEvaluationRows={
    pendingEvaluationRows
  }

  completedStudents={completedStudents}

  incompleteStudents={incompleteStudents}
/>
      </div>

     {/* PLATFORM INSIGHTS */}

<h3
  style={{
    margin: "8px 0 16px",
    color: "#071952",
    fontSize: "18px",
    fontWeight: 700,
  }}
>
  Platform Insights
</h3>

<div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: "20px",
          marginBottom: "24px",
        }}
      >
        <InfoCard
          title="Top Schools"
        >
          {topSchools.map(

  item => (

    <Row

      key={item.school}

      label={item.school}

      value={item.count}

    />

  )

)}
        </InfoCard>

        <InfoCard
          title="Top Events"
        >
          {topEvents.map(

  item => (

    <Row

      key={item.event}

      label={item.event}

      value={item.count}

    />

  )

)}
        </InfoCard>
      </div>

     {/* TALENT INTELLIGENCE */}

<h3
  style={{
    margin: "8px 0 16px",
    color: "#071952",
    fontSize: "18px",
    fontWeight: 700,
  }}
>
  Talent Intelligence
</h3>

<div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: "20px",
          marginBottom: "24px",
        }}
      >
        <InfoCard
          title="Talent Passport Intelligence"
        >
          <Row
            label="Average Passport Score"
            value={passportAverage}
          />

          <Row
            label="Average DNA Index"
            value={dnaAverage}
          />

          <Row
            label="Students Evaluated"
            value={
              passports.length
            }
          />
        </InfoCard>

        <InfoCard
          title="Platform Status"
        >
          <Row
            label="Active Students"
            value={summary.totalStudents}
          />

          <Row
            label="Active Schools"
            value={summary.totalSchools}
          />

          <Row
            label="Pending Evaluations"
            value={
              summary.pendingEvaluations
            }
          />
        </InfoCard>
      </div>

    {/* REGISTRATION TRACKER */}

{showIncomplete && (
 <RegistrationTracker
  students={registrationStudents}
  schools={schools}
  classes={classes}
  selectedSchool={registrationSchool}
  selectedClass={registrationClass}
  selectedActivity={registrationActivity}
  onSchoolChange={setRegistrationSchool}
  onClassChange={setRegistrationClass}
  onActivityChange={setRegistrationActivity}
  />
)}

    </div>
  );
}

/* ============================================================
   DASHBOARD CARD
============================================================ */

interface DashboardCardProps {

  title: string;

  value: string | number;

}

/* ============================================================
   INFORMATION CARD
============================================================ */



interface InfoCardProps {

  title: string;

  children: ReactNode;

}

function InfoCard({

  title,

  children

}: InfoCardProps) {

  return (

    <div

      style={{

        background: "white",

        borderRadius: "24px",

        padding: "24px"

      }}

    >

      <h2

        style={{

          marginBottom: "20px",

          color: "#071952"

        }}

      >

        {title}

      </h2>

      {children}

    </div>

  );

}

/* ============================================================
   INFORMATION ROW
============================================================ */

interface RowProps {

  label: string;

  value: string | number;

}

function Row({

  label,

  value

}: RowProps) {

  return (

    <div

      style={{

        display: "flex",

        justifyContent: "space-between",

        padding: "10px 0",

        borderBottom: "1px solid #E5E7EB"

      }}

    >

      <span>

        {label}

      </span>

      <strong>

        {value}

      </strong>

    </div>

  );

}
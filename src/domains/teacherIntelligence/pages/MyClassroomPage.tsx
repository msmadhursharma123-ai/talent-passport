import { useEffect, useState } from "react";

import {
getCurrentTeacher,
} from "../../../services/identityService";

import {
getTeacherAssignmentsByTeacher,
} from "../repository/TeacherAssignmentRepository";

import type { TeacherAssignment }
from "../types/TeacherAssignment";

import {
getTeacherDailyLogsByAssignment,
} from "../repository/TeacherDailyLogRepository";

import type {
TeacherDailyLog,
} from "../types/TeacherDailyLog";

import {

getStudentsAtRisk

}

from "../repository/TeacherFeedbackAnalyticsRepository";

export default function MyClassroomPage() {

const [assignments,setAssignments] =
useState<TeacherAssignment[]>([]);



const [selectedMonth,setSelectedMonth] =
useState("July 2026");

const [selectedAssignment,
setSelectedAssignment] =
useState<TeacherAssignment | null>(null);

const [dailyLogs,setDailyLogs] =
useState<TeacherDailyLog[]>([]);

const [

studentsAtRisk,

setStudentsAtRisk

] = useState<{

veryCritical:string[];

critical:string[];

moderate:string[];

}>({

veryCritical:[],

critical:[],

moderate:[],

});

const [selectedDayTopics,setSelectedDayTopics] =
useState<TeacherDailyLog[]>([]);

const [showTopicsModal,setShowTopicsModal] =
useState(false);

const academicMonths = [

"July 2026",
"August 2026",
"September 2026",
"October 2026",
"November 2026",
"December 2026",
"January 2027",
"February 2027",
"March 2027",
"April 2027",

];

const selectedMonthName =
selectedMonth.split(" ")[0];

const selectedYear =
selectedMonth.split(" ")[1];


const logsForSelectedMonth =

dailyLogs.filter((item) => {

  const currentDate =
    new Date(item.logDate);

  return (

    currentDate.toLocaleString(
      "default",
      {
        month: "long",
      }
    ) === selectedMonthName &&

    String(
      currentDate.getFullYear()
    ) === selectedYear

  );

});


const sortedLogs =

[...logsForSelectedMonth].sort(
  (a,b) =>
    new Date(a.logDate).getTime() -
    new Date(b.logDate).getTime()
);


const latestLog =

sortedLogs[
  sortedLogs.length - 1
];

const daysInMonthMap = {

"July 2026":31,
"August 2026":31,
"September 2026":30,
"October 2026":31,
"November 2026":30,
"December 2026":31,
"January 2027":31,
"February 2027":28,
"March 2027":31,
"April 2027":30,

};

useEffect(()=>{

loadAssignments();

},[]);


async function loadAssignments(){

const teacher =
getCurrentTeacher();

if(!teacher){
return;
}

const data =
await getTeacherAssignmentsByTeacher(
teacher.teacherUuid
);

setAssignments(data);

console.log(data);

console.log(teacher.teacherUuid);


}return (
  <div
    style={{
      padding: "20px",
      background: "#F6F7F9",
      minHeight: "100%",
    }}
  >
    {/* =====================================================
        PAGE HERO
       ===================================================== */}

    <div style={heroStyle}>
      <div style={heroOrangeCircle} />
      <div style={heroSoftCircle} />
      <div style={heroBlueCircle} />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        <div>
          <div style={eyebrowStyle}>
            CLASSROOM INTELLIGENCE WORKSPACE
          </div>

          <h1
            style={{
              margin: "8px 0 8px",
              color: "#0F172A",
              fontSize: "28px",
              lineHeight: 1.15,
              fontWeight: 800,
              letterSpacing: "-0.7px",
            }}
          >
            My Classroom
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: "650px",
              color: "#64748B",
              fontSize: "16px",
              lineHeight: 1.65,
            }}
          >
            Explore your Assigned Classroom, Teaching History and
            Monthly Activities
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "14px",
            }}
          >
            <div style={orangePillStyle}>
              CLASSROOM HISTORY
            </div>

            <div style={bluePillStyle}>
              STUDENT INTELLIGENCE
            </div>
          </div>
        </div>

        <div style={heroBadgeStyle}>
          <div
            style={{
              fontSize: "28px",
              lineHeight: 1,
            }}
          >
            ◇
          </div>

          <div
            style={{
              marginTop: "8px",
              color: "#F97316",
              fontSize: "8px",
              fontWeight: 800,
              letterSpacing: "1.2px",
            }}
          >
            CLASSROOM
          </div>
        </div>
      </div>
    </div>

    {/* =====================================================
        CLASSROOM CONTROLS
       ===================================================== */}

    <div style={sectionCardStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "18px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={eyebrowStyle}>
            CLASSROOM CONTROLS
          </div>

          <h2 style={sectionTitleStyle}>
            Explore Your Classroom
          </h2>

          <p style={sectionDescriptionStyle}>
            Select an assigned classroom and academic month to
            explore its teaching record.
          </p>
        </div>

        <div style={ledgerLabelStyle}>
          ACADEMIC WORKSPACE
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
          gap: "12px",
          marginTop: "18px",
        }}
      >
        <div>
          <div style={fieldLabelStyle}>
            
          </div>

          <select
            style={dropdownStyle}
            value={selectedAssignment?.id ?? ""}
            onChange={async (e) => {
              const assignment =
                assignments.find(
                  (item) =>
                    String(item.id) === e.target.value
                );

              setSelectedAssignment(
                assignment ?? null
              );

              if (assignment) {
                const logs =
                  await getTeacherDailyLogsByAssignment(
                    assignment.id
                  );

                setDailyLogs(logs);

                const riskData =
                  await getStudentsAtRisk(
                    assignment.className,
                    assignment.sectionName
                  );

                setStudentsAtRisk(riskData);
              } else {
                setDailyLogs([]);
              }
            }}
          >
            <option value="">
              Select Classroom
            </option>

            {assignments.map((assignment) => (
              <option
                key={assignment.id}
                value={assignment.id}
              >
                Class {assignment.className} - Section{" "}
                {assignment.sectionName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div style={fieldLabelStyle}>
            
          </div>

          <select
            style={dropdownStyle}
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
            }}
          >
            {academicMonths.map((month) => (
              <option
                key={month}
                value={month}
              >
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>

    {/* =====================================================
        ASSIGNED CLASSROOM
       ===================================================== */}

    <div style={sectionCardStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        <div>
          <div style={eyebrowStyle}>
            CLASSROOM PROFILE
          </div>

          <h2 style={sectionTitleStyle}>
            Assigned Classroom Information
          </h2>

          <p style={sectionDescriptionStyle}>
            Your current academic assignment and classroom
            configuration.
          </p>
        </div>

        <div style={ledgerLabelStyle}>
          TEACHER ASSIGNMENT
        </div>
      </div>

     <div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "14px",
    marginTop: "20px",
  }}
>
        <InfoCard
          
          title="Class"
          value={
            selectedAssignment?.className ??
            "Not Selected"
          }
          background="#FFF7ED"
          border="#FED7AA"
          color="#EA580C"
        />

        <InfoCard
          
          title="Section"
          value={
            selectedAssignment?.sectionName ??
            "Not Selected"
          }
          background="#EFF6FF"
          border="#BFDBFE"
          color="#2563EB"
        />

        <InfoCard
          
          title="Subject"
          value={
            selectedAssignment?.subjectName ??
            "Not Selected"
          }
          background="#F0FDF4"
          border="#BBF7D0"
          color="#16A34A"
        />

        <InfoCard
          
          title="Session"
          value={
            selectedAssignment?.academicYear ??
            "2026-2027"
          }
          background="#FAF5FF"
          border="#E9D5FF"
          color="#7C3AED"
        />
      </div>
    </div>

   {/* =====================================================
    CLASSROOM HISTORY
   ===================================================== */}

<div
  style={{
    position: "relative",
    overflow: "hidden",

    marginBottom: "18px",
    padding: "24px",

    background: "#FFFFFF",

    border: "1px solid #E2E8F0",
    borderRadius: "22px",

    boxShadow:
      "0 7px 24px rgba(15,23,42,0.035)",
  }}
>

  {/* DECORATIVE SECTION CIRCLE */}

  <div
    style={{
      position: "absolute",

      width: "125px",
      height: "125px",

      right: "-38px",
      top: "-52px",

      borderRadius: "50%",

      background:
        "rgba(255,237,213,0.48)",

      pointerEvents: "none",
    }}
  />


  {/* =====================================================
      SECTION HEADER
     ===================================================== */}

  <div
    style={{
      position: "relative",
      zIndex: 1,

      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",

      gap: "20px",
    }}
  >

    <div>

      <div
        style={{
          color: "#F97316",

          fontSize: "10px",
          fontWeight: 800,

          letterSpacing: "1.6px",
          textTransform: "uppercase",
        }}
      >
        LEARNING CONTINUITY
      </div>


      <h2
        style={{
          margin: "7px 0 0",

          color: "#0F172A",

          fontSize: "21px",
          lineHeight: 1.2,

          fontWeight: 800,

          letterSpacing: "-0.3px",
        }}
      >
        See Your Classroom Calendar
      </h2>


      <p
        style={{
          margin: "7px 0 0",

          color: "#64748B",

          fontSize: "14px",
          lineHeight: 1.55,
        }}
      >
        Review lectures, topics, homework and classroom
        activities recorded throughout the selected month.
      </p>

    </div>


    {/* MONTHLY LEDGER BADGE */}

    <div
      style={{
        position: "relative",
        zIndex: 1,

        flexShrink: 0,

        padding: "8px 14px",

        background:
          "linear-gradient(135deg,#FFF7ED,#FFFFFF)",

        border:
          "1px solid #FED7AA",

        borderRadius: "11px",

        color: "#EA580C",

        fontSize: "10px",
        fontWeight: 800,

        letterSpacing: "0.7px",

        textTransform: "uppercase",
      }}
    >
      Monthly Learning Ledger
    </div>

  </div>


  {/* =====================================================
      WEEK DAYS
     ===================================================== */}

  <div
    style={{
      position: "relative",
      zIndex: 1,

      display: "grid",

      gridTemplateColumns:
        "repeat(7, minmax(0,1fr))",

      gap: "12px",

      marginTop: "30px",
      marginBottom: "12px",
    }}
  >

    {[
      "MON",
      "TUE",
      "WED",
      "THU",
      "FRI",
      "SAT",
      "SUN",
    ].map((day) => (

      <div
        key={day}
        style={{
          textAlign: "center",

          color: "#64748B",

          fontSize: "11px",
          fontWeight: 800,

          letterSpacing: "1.1px",
        }}
      >
        {day}
      </div>

    ))}

  </div>


  {/* =====================================================
      CALENDAR GRID
     ===================================================== */}

  <div
    style={{
      position: "relative",
      zIndex: 1,

      display: "grid",

      gridTemplateColumns:
        "repeat(7, minmax(0,1fr))",

      gap: "12px",
    }}
  >

    {Array.from({
      length:
        daysInMonthMap[
          selectedMonth as keyof typeof daysInMonthMap
        ],
    }).map((_, index) => {

      const day =
        index + 1;


      /* -------------------------------------------------
         LOGS FOR CURRENT DAY
         EXISTING FUNCTIONALITY PRESERVED
      ------------------------------------------------- */

      const logsForDay =
        dailyLogs.filter((item) => {

          const currentDate =
            new Date(item.logDate);

          const selectedMonthName =
            selectedMonth.split(" ")[0];

          const selectedYear =
            selectedMonth.split(" ")[1];

          return (

            currentDate.getDate() === day &&

            currentDate.toLocaleString(
              "default",
              {
                month: "long",
              }
            ) === selectedMonthName &&

            String(
              currentDate.getFullYear()
            ) === selectedYear

          );

        });


      const visibleTopics =
        logsForDay.slice(0, 1);


      const remainingTopics =
        logsForDay.length - 1;


      /* =================================================
         EMPTY DAY
         SAME UI LANGUAGE AS STUDENT CALENDAR
      ================================================= */

      if (
        logsForDay.length === 0
      ) {

        return (

          <div
            key={day}
            style={{
              position: "relative",

              overflow: "hidden",

              minHeight: "116px",

              padding: "14px",

              boxSizing: "border-box",

              background:
                "linear-gradient(135deg,#FFF9EF 0%,#FFFCF7 100%)",

              border:
                "1px solid #FDBA74",

              borderRadius: "15px",

              display: "flex",
              flexDirection: "column",

              boxShadow:
                "0 2px 6px rgba(15,23,42,0.02)",
            }}
          >

            {/* CORNER CIRCLE */}

            <div
              style={{
                position: "absolute",

                width: "54px",
                height: "54px",

                right: "-18px",
                top: "-18px",

                borderRadius: "50%",

                background:
                  "rgba(255,237,213,0.78)",

                pointerEvents: "none",
              }}
            />


            {/* DATE */}

            <div
              style={{
                position: "relative",
                zIndex: 1,

                color: "#0F172A",

                fontSize: "14px",
                lineHeight: 1,

                fontWeight: 800,
              }}
            >
              {day}
            </div>


            {/* EMPTY MESSAGE */}

            <div
              style={{
                position: "relative",
                zIndex: 1,

                flex: 1,

                display: "flex",

                alignItems: "center",
                justifyContent: "center",

                paddingBottom: "3px",
              }}
            >

              <div
                style={{
                  color: "#EA580C",

                  fontSize: "10px",
                  lineHeight: 1.3,

                  fontWeight: 800,

                  textAlign: "center",
                }}
              >
                No Lecture Conducted
              </div>

            </div>

          </div>

        );

      }


      /* =================================================
         LECTURE DAY
      ================================================= */

      const isLatestDay =
        logsForDay.some(
          (item) =>
            item.id === latestLog?.id
        );


      return (

        <div
          key={day}
          style={{
            position: "relative",

            overflow: "hidden",

            minHeight: "116px",

            padding: "14px",

            boxSizing: "border-box",

   background:
  isLatestDay
    ? "linear-gradient(135deg,#FFF3E8 0%,#FFF9F3 100%)"
    : "linear-gradient(135deg,#F0FDF4 0%,#F8FFF9 100%)",

border:
  isLatestDay
    ? "1.5px solid #F97316"
    : "1px solid #BBF7D0",

            borderRadius: "15px",

            boxShadow:
              "0 2px 6px rgba(15,23,42,0.02)",
          }}
        >

          {/* CORNER CIRCLE */}

          <div
            style={{
              position: "absolute",

              width: "54px",
              height: "54px",

              right: "-18px",
              top: "-18px",

              borderRadius: "50%",

            background:
  isLatestDay
    ? "rgba(249,115,22,0.10)"
    : "rgba(220,252,231,0.82)",

              pointerEvents: "none",
            }}
          />


          {/* DATE */}

          <div
            style={{
              position: "relative",
              zIndex: 1,

              color: "#0F172A",

              fontSize: "14px",
              lineHeight: 1,

              fontWeight: 800,

              marginBottom: "13px",
            }}
          >
            {day}
          </div>


          {/* TOPIC */}

          {visibleTopics.map(
            (topic) => (

              <div
                key={topic.id}
                style={{
                  position: "relative",
                  zIndex: 1,
                }}
              >

                <div
                  style={{
                    display:
                      "inline-flex",

                    maxWidth: "100%",

                    padding:
                      "5px 8px",

                    borderRadius:
                      "10px",

                    background:
                      topic.id ===
                      latestLog?.id
                        ? "#FFEDD5"
                        : "#DCFCE7",

                    color:
                      topic.id ===
                      latestLog?.id
                        ? "#EA580C"
                        : "#15803D",

                    fontWeight: 800,

                    fontSize: "10px",

                    lineHeight: 1.3,

                    overflow:
                      "hidden",

                    textOverflow:
                      "ellipsis",

                    whiteSpace:
                      "nowrap",

                    boxSizing:
                      "border-box",
                  }}
                >
                  {topic.topicName}
                </div>


                <div
                  style={{
                    marginTop: "7px",

                    color: "#64748B",

                    fontSize: "10px",

                    fontWeight: 700,
                  }}
                >
                  Pages:{" "}
                  {topic.pageFrom}–
                  {topic.pageTo}
                </div>

              </div>

            )
          )}


          {/* MORE TOPICS */}

          {remainingTopics > 0 && (

            <button
              type="button"

              onClick={() => {

                setSelectedDayTopics(
                  logsForDay
                );

                setShowTopicsModal(
                  true
                );

              }}

              style={{
                position: "relative",
                zIndex: 1,

                marginTop: "7px",

                padding: 0,

                border: "none",

                background:
                  "transparent",

                color: "#2563EB",

                fontSize: "10px",

                fontWeight: 800,

                cursor: "pointer",
              }}
            >
              View All Topics (
              {logsForDay.length}) →
            </button>

          )}


          {/* HOMEWORK + ACTIVITY */}

          <div
            style={{
              position: "relative",
              zIndex: 1,

              display: "flex",

              flexWrap: "wrap",

              gap: "5px",

              marginTop: "8px",
            }}
          >

            <div
              style={{
                padding:
                  "4px 6px",

                background:
                  "rgba(255,255,255,0.72)",

                border:
                  "1px solid rgba(148,163,184,0.18)",

                borderRadius:
                  "7px",

                color:
                  "#64748B",

                fontSize:
                  "9px",

                fontWeight:
                  700,
              }}
            >
              HW{" "}

              <strong
                style={{
                  color:
                    "#334155",
                }}
              >
                {logsForDay.some(
                  (item) =>
                    item.homeworkGiven
                )
                  ? "YES"
                  : "NO"}
              </strong>

            </div>


            <div
              style={{
                padding:
                  "4px 6px",

                background:
                  "rgba(255,255,255,0.72)",

                border:
                  "1px solid rgba(148,163,184,0.18)",

                borderRadius:
                  "7px",

                color:
                  "#64748B",

                fontSize:
                  "9px",

                fontWeight:
                  700,
              }}
            >
              ACT{" "}

              <strong
                style={{
                  color:
                    "#334155",
                }}
              >
                {logsForDay.some(
                  (item) =>
                    item.activityConducted
                )
                  ? "YES"
                  : "NO"}
              </strong>

            </div>

          </div>

        </div>

      );

    })}

  </div>


  {/* =====================================================
    CALENDAR REFERENCE
   ===================================================== */}

<div
  style={{
    position: "relative",
    zIndex: 1,

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    flexWrap: "wrap",

    gap: "16px",

    marginTop: "20px",
  }}
>
  {/* LEFT — CALENDAR LEGEND */}

  <div
    style={{
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "18px",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",

        color: "#64748B",

        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      <div
        style={{
          width: "9px",
          height: "9px",

          flexShrink: 0,

          borderRadius: "50%",

          background: "#22C55E",
        }}
      />

      Lecture Conducted
    </div>


    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",

        color: "#64748B",

        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      <div
        style={{
          width: "9px",
          height: "9px",

          flexShrink: 0,

          borderRadius: "50%",

          background: "#FDBA74",
        }}
      />

      No Lecture Conducted
    </div>


    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",

        color: "#64748B",

        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      <div
        style={{
          width: "9px",
          height: "9px",

          flexShrink: 0,

          borderRadius: "50%",

          background: "#F97316",
        }}
      />

      Latest Lecture
    </div>
  </div>


  {/* RIGHT — TEACHER REFERENCE */}

  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",

      flexWrap: "wrap",

      gap: "8px",
    }}
  >
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",

        gap: "7px",

        padding: "6px 9px",

        background:
          "linear-gradient(135deg,#F8FAFC,#FFFFFF)",

        border: "1px solid #E2E8F0",

        borderRadius: "9px",
      }}
    >
      <span
        style={{
          color: "#0F172A",

          fontSize: "10px",
          fontWeight: 800,

          letterSpacing: "0.4px",
        }}
      >
        HW
      </span>

      <span
        style={{
          color: "#CBD5E1",

          fontSize: "11px",
          fontWeight: 700,
        }}
      >
        =
      </span>

      <span
        style={{
          color: "#64748B",

          fontSize: "10px",
          fontWeight: 700,
        }}
      >
        Homework Given After Class
      </span>
    </div>


    <div
      style={{
        display: "inline-flex",
        alignItems: "center",

        gap: "7px",

        padding: "6px 9px",

        background:
          "linear-gradient(135deg,#F8FAFC,#FFFFFF)",

        border: "1px solid #E2E8F0",

        borderRadius: "9px",
      }}
    >
      <span
        style={{
          color: "#0F172A",

          fontSize: "10px",
          fontWeight: 800,

          letterSpacing: "0.4px",
        }}
      >
        ACT
      </span>

      <span
        style={{
          color: "#CBD5E1",

          fontSize: "11px",
          fontWeight: 700,
        }}
      >
        =
      </span>

      <span
        style={{
          color: "#64748B",

          fontSize: "10px",
          fontWeight: 700,
        }}
      >
        Activity Performed In the Class
      </span>
    </div>
  </div>
</div>

</div>

    {/* =====================================================
        TOPICS MODAL
       ===================================================== */}

    {showTopicsModal && (
      <div style={modalOverlayStyle}>
        <div style={modalStyle}>
          <div style={modalHeroStyle}>
            <div
              style={{
                position: "relative",
                zIndex: 1,
              }}
            >
              <div style={eyebrowStyle}>
                CLASSROOM TEACHING HISTORY
              </div>

              <h2
                style={{
                  margin: "7px 0 5px",
                  color: "#0F172A",
                  fontSize: "25px",
                  fontWeight: 800,
                  letterSpacing: "-0.4px",
                }}
              >
                Topics Taught Today
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#64748B",
                  fontSize: "14px",
                  lineHeight: 1.55,
                }}
              >
                {selectedDayTopics.length} topics were
                covered during this lecture day.
              </p>
            </div>
          </div>

          {selectedDayTopics.map(
            (topic, index) => (
              <div
                key={topic.id}
                style={topicModalCard}
              >
                <div
                  style={{
                    color: "#F97316",
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "1px",
                  }}
                >
                  TOPIC {index + 1}
                </div>

                <h3
                  style={{
                    margin: "6px 0 12px",
                    color: "#0F172A",
                    fontSize: "18px",
                    fontWeight: 800,
                  }}
                >
                  {topic.topicName}
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(3, 1fr)",
                    gap: "8px",
                  }}
                >
                  <ModalInfo
                    title="PAGES"
                    value={`${topic.pageFrom}-${topic.pageTo}`}
                  />

                  <ModalInfo
                    title="HOMEWORK"
                    value={
                      topic.homeworkGiven
                        ? "Yes"
                        : "No"
                    }
                  />

                  <ModalInfo
                    title="ACTIVITY"
                    value={
                      topic.activityConducted
                        ? "Yes"
                        : "No"
                    }
                  />
                </div>

                {topic.teacherNotes && (
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "10px",
                      background: "#F8FAFC",
                      border:
                        "1px solid #E2E8F0",
                      borderRadius: "10px",
                    }}
                  >
                    <div
                      style={{
                        color: "#94A3B8",
                        fontSize: "11px",
                        fontWeight: 800,
                        letterSpacing: "0.8px",
                      }}
                    >
                      TEACHER NOTES
                    </div>

                    <div
                      style={{
                        marginTop: "5px",
                        color: "#475569",
                        fontSize: "13px",
                        lineHeight: 1.55,
                      }}
                    >
                      {topic.teacherNotes}
                    </div>
                  </div>
                )}
              </div>
            )
          )}

          <button
            onClick={() => {
              setShowTopicsModal(false);
            }}
            style={closeButtonStyle}
          >
            CLOSE TOPICS
          </button>
        </div>
      </div>
    )}

    {/* =====================================================
        MONTHLY SUMMARY
       ===================================================== */}

    <div style={sectionCardStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        <div>
          <div style={eyebrowStyle}>
            TEACHING INTELLIGENCE
          </div>

          <h2 style={sectionTitleStyle}>
            Monthly Classroom Summary
          </h2>

          <p style={sectionDescriptionStyle}>
            A snapshot of teaching activity recorded across
            the selected classroom.
          </p>
        </div>

        <div style={ledgerLabelStyle}>
          CLASSROOM ACTIVITY LEDGER
        </div>
      </div>

  <div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "14px",
    marginTop: "20px",
  }}
>
        <SummaryCard
          eyebrow="TEACHING RECORD"
          title="Total Lectures"
          value={String(dailyLogs.length)}
          background="#FFF7ED"
          border="#FED7AA"
          color="#EA580C"
        />

        <SummaryCard
          eyebrow="ACADEMIC PRACTICE"
          title="Homework Days"
          value={String(
            dailyLogs.filter(
              (item) => item.homeworkGiven
            ).length
          )}
          background="#EFF6FF"
          border="#BFDBFE"
          color="#2563EB"
        />

        <SummaryCard
          eyebrow="ACTIVE LEARNING"
          title="Activity Days"
          value={String(
            dailyLogs.filter(
              (item) =>
                item.activityConducted
            ).length
          )}
          background="#F0FDF4"
          border="#BBF7D0"
          color="#16A34A"
        />

        <SummaryCard
          eyebrow="CURRICULUM PROGRESS"
          title="Completed Topics"
          value={String(dailyLogs.length)}
          background="#FAF5FF"
          border="#E9D5FF"
          color="#7C3AED"
        />
      </div>
    </div>

    {/* =====================================================
        STUDENTS AT RISK
       ===================================================== */}

    <div style={sectionCardStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        <div>
          <div style={eyebrowStyle}>
            STUDENT LEARNING INTELLIGENCE
          </div>

          <h2 style={sectionTitleStyle}>
            Students Requiring Attention
          </h2>

          <p style={sectionDescriptionStyle}>
            Identify students showing repeated comprehension
            difficulty and requiring academic support.
          </p>
        </div>

        <div style={ledgerLabelStyle}>
          LEARNING RISK LEDGER
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
          gap: "12px",
          marginTop: "18px",
        }}
      >
        <RiskCard
          eyebrow="IMMEDIATE ATTENTION"
          title="Very Critical"
          count={
            studentsAtRisk.veryCritical
              .length
          }
          students={
            studentsAtRisk.veryCritical
          }
          background="#FEF2F2"
          border="#FECACA"
          color="#DC2626"
          description={`3 consecutive "I didn't understand." responses.`}
        />

        <RiskCard
          eyebrow="ACADEMIC SUPPORT"
          title="Critical"
          count={
            studentsAtRisk.critical.length
          }
          students={
            studentsAtRisk.critical
          }
          background="#FFF7ED"
          border="#FED7AA"
          color="#EA580C"
          description={`2 "I didn't understand." and 1 "I partially understood." response.`}
        />

        <RiskCard
          eyebrow="EARLY ATTENTION"
          title="Moderate"
          count={
            studentsAtRisk.moderate.length
          }
          students={
            studentsAtRisk.moderate
          }
          background="#FFFBEB"
          border="#FDE68A"
          color="#CA8A04"
          description={`3 consecutive "I partially understood." responses.`}
        />
      </div>
    </div>
  </div>
);

}

/* =========================================================
   UI COMPONENTS
   ========================================================= */

function InfoCard(props: any) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",

        minHeight: "108px",
        padding: "14px 16px",

        background: `linear-gradient(
          135deg,
          ${props.background} 0%,
          #FFFFFF 145%
        )`,

        border: `1px solid ${props.border}`,
        borderRadius: "16px",

        boxSizing: "border-box",
      }}
    >
      {/* DECORATIVE CORNER */}

      <div
        style={{
          position: "absolute",

          width: "78px",
          height: "78px",

          right: "-27px",
          top: "-31px",

          borderRadius: "50%",

          background: props.color,
          opacity: 0.055,

          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* EYEBROW */}

        <div
          style={{
            color: props.color,

            fontSize: "13px",
            fontWeight: 800,

            letterSpacing: "0.65px",
            textTransform: "uppercase",

            marginBottom: "10px",
          }}
        >
          {props.eyebrow}
        </div>

        {/* SMALL LABEL */}

        <div
          style={{
            color: "#475569",

            fontSize: "14px",
            fontWeight: 700,

            marginBottom: "5px",
          }}
        >
          {props.title}
        </div>

        {/* VALUE */}

        <div
          style={{
            color: props.color,

            fontSize: "27px",
            lineHeight: 1.05,

            fontWeight: 800,
            letterSpacing: "-0.45px",
          }}
        >
          {props.value}
        </div>
      </div>
    </div>
  );
}


/* --------------------------------------------------------- */

function SummaryCard(props: any) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",

        minHeight: "108px",
        padding: "14px 16px",

        background: `linear-gradient(
          135deg,
          ${props.background} 0%,
          #FFFFFF 145%
        )`,

        border: `1px solid ${props.border}`,
        borderRadius: "16px",

        boxSizing: "border-box",
      }}
    >
      {/* DECORATIVE CORNER */}

      <div
        style={{
          position: "absolute",

          width: "78px",
          height: "78px",

          right: "-27px",
          top: "-31px",

          borderRadius: "50%",

          background: props.color,
          opacity: 0.055,

          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* EYEBROW */}

        <div
          style={{
            color: props.color,

            fontSize: "13px",
            fontWeight: 800,

            letterSpacing: "0.65px",
            textTransform: "uppercase",

            marginBottom: "9px",
          }}
        >
          {props.eyebrow}
        </div>

        {/* VALUE */}

        <div
          style={{
            color: props.color,

            fontSize: "34px",
            lineHeight: 1,

            fontWeight: 800,
            letterSpacing: "-0.6px",
          }}
        >
          {props.value}
        </div>

        {/* TITLE */}

        <div
          style={{
            marginTop: "9px",

            color: "#0F172A",

            fontSize: "17px",
            lineHeight: 1.25,

            fontWeight: 800,
          }}
        >
          {props.title}
        </div>
      </div>
    </div>
  );
}


/* --------------------------------------------------------- */

function RiskCard(props: any) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "205px",
        background: props.background,
        border: `1px solid ${props.border}`,
        borderRadius: "16px",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "80px",
          height: "80px",
          right: "-25px",
          top: "-28px",
          borderRadius: "50%",
          background:
            "rgba(255,255,255,0.42)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "16px",
        }}
      >
        <div
          style={{
            color: props.color,
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.8px",
          }}
        >
          {props.eyebrow}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "10px",
            marginTop: "8px",
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "#0F172A",
              fontSize: "18px",
              fontWeight: 800,
            }}
          >
            {props.title}
          </h3>

          <div
            style={{
              minWidth: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 7px",
              borderRadius: "10px",
              background:
                "rgba(255,255,255,0.65)",
              color: props.color,
              fontSize: "16px",
              fontWeight: 800,
            }}
          >
            {props.count}
          </div>
        </div>

        <p
          style={{
            margin: "8px 0 13px",
            minHeight: "30px",
            color: "#64748B",
            fontSize: "12px",
            lineHeight: 1.5,
          }}
        >
          {props.description}
        </p>

        <div
          style={{
            borderTop: `1px solid ${props.border}`,
            paddingTop: "10px",
          }}
        >
          {props.students.length === 0 ? (
            <div
              style={{
                padding: "9px",
                background:
                  "rgba(255,255,255,0.55)",
                borderRadius: "9px",
                color: "#94A3B8",
                fontSize: "12px",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              No students in this category
            </div>
          ) : (
            props.students.map(
              (name: string) => (
                <div
                  key={name}
                  style={{
                    padding: "7px 9px",
                    marginBottom: "6px",
                    background:
                      "rgba(255,255,255,0.75)",
                    borderRadius: "8px",
                    color: "#334155",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  {name}
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}


/* --------------------------------------------------------- */

function Legend(props: any) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        padding: "7px 10px",
        background: props.background,
        border:
          "1px solid rgba(148,163,184,0.22)",
        borderRadius: "999px",
        color: "#475569",
        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      <div
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: props.color,
        }}
      />

      {props.label}
    </div>
  );
}


/* --------------------------------------------------------- */

function ModalInfo(props: any) {
  return (
    <div
      style={{
        padding: "9px",
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
        borderRadius: "9px",
      }}
    >
      <div
        style={{
          color: "#94A3B8",
          fontSize: "10px",
          fontWeight: 800,
          letterSpacing: "0.7px",
        }}
      >
        {props.title}
      </div>

      <div
        style={{
          marginTop: "4px",
          color: "#0F172A",
          fontSize: "13px",
          fontWeight: 800,
        }}
      >
        {props.value}
      </div>
    </div>
  );
}


/* =========================================================
   PAGE STYLES
   ========================================================= */

const heroStyle = {
  position: "relative",
  overflow: "hidden",
  marginBottom: "18px",
  padding: "26px 28px",

  background:
    "linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 72%, #FFF9F3 100%)",

  border: "1px solid #E2E8F0",
  borderRadius: "24px",

  boxShadow:
    "0 10px 30px rgba(15, 23, 42, 0.045)",
} as const;


const heroOrangeCircle = {
  position: "absolute",

  width: "180px",
  height: "180px",

  right: "-60px",
  top: "-85px",

  borderRadius: "50%",

  background:
    "rgba(249, 115, 22, 0.06)",

  pointerEvents: "none",
} as const;


const heroSoftCircle = {
  position: "absolute",

  width: "95px",
  height: "95px",

  right: "120px",
  top: "-50px",

  borderRadius: "50%",

  background:
    "rgba(249, 115, 22, 0.035)",

  pointerEvents: "none",
} as const;


const heroBlueCircle = {
  position: "absolute",

  width: "150px",
  height: "150px",

  right: "180px",
  bottom: "-105px",

  borderRadius: "50%",

  background:
    "rgba(37, 99, 235, 0.04)",

  pointerEvents: "none",
} as const;


const heroBadgeStyle = {
  width: "82px",
  height: "82px",

  flexShrink: 0,

  display: "flex",
  flexDirection: "column",

  alignItems: "center",
  justifyContent: "center",

  background:
    "linear-gradient(145deg, #FFF8F1 0%, #FFFFFF 100%)",

  border: "1px solid #FED7AA",
  borderRadius: "22px",

  color: "#0F172A",

  boxShadow:
    "0 8px 20px rgba(249, 115, 22, 0.07)",
} as const;


const eyebrowStyle = {
  color: "#F97316",

  fontSize: "12px",
  fontWeight: 800,

  letterSpacing: "1.6px",

  textTransform:
    "uppercase" as const,
};


const orangePillStyle = {
  padding: "6px 10px",

  background: "#FFF7ED",

  border: "1px solid #FED7AA",
  borderRadius: "999px",

  color: "#C2410C",

  fontSize: "11px",
  fontWeight: 800,

  letterSpacing: "0.6px",
} as const;


const bluePillStyle = {
  padding: "6px 10px",

  background: "#EFF6FF",

  border: "1px solid #BFDBFE",
  borderRadius: "999px",

  color: "#1D4ED8",

  fontSize: "11px",
  fontWeight: 800,

  letterSpacing: "0.6px",
} as const;


const sectionCardStyle = {
  position: "relative",

  marginBottom: "18px",
  padding: "20px",

  background: "#FFFFFF",

  border: "1px solid #E2E8F0",
  borderRadius: "20px",

  boxShadow:
    "0 7px 24px rgba(15, 23, 42, 0.035)",
} as const;


const sectionTitleStyle = {
  margin: "6px 0 0",

  color: "#0F172A",

  fontSize: "21px",
  fontWeight: 800,

  letterSpacing: "-0.3px",
} as const;


const sectionDescriptionStyle = {
  margin: "5px 0 0",

  color: "#64748B",

  fontSize: "14px",

  lineHeight: 1.55,
} as const;


const ledgerLabelStyle = {
  color: "#94A3B8",

  fontSize: "12px",
  fontWeight: 800,

  letterSpacing: "1px",

  whiteSpace: "nowrap" as const,
};


const fieldLabelStyle = {
  marginBottom: "6px",

  color: "#64748B",

  fontSize: "12px",
  fontWeight: 800,

  letterSpacing: "0.8px",
} as const;


const dropdownStyle = {
  width: "100%",

  padding: "11px 12px",

  background: "#F8FAFC",

  border: "1px solid #CBD5E1",
  borderRadius: "11px",

  color: "#0F172A",

  fontSize: "15px",
  fontWeight: 600,

  outline: "none",

  boxSizing:
    "border-box" as const,
};


const calendarBadgeStyle = {
  display: "flex",

  alignItems: "center",

  gap: "9px",

  flexShrink: 0,

  padding: "9px 12px",

  background:
    "linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)",

  border: "1px solid #FED7AA",
  borderRadius: "13px",

  color: "#F97316",
} as const;


const miniStatusPill = {
  padding: "4px 6px",

  background:
    "rgba(255,255,255,0.75)",

  border:
    "1px solid rgba(148,163,184,0.20)",

  borderRadius: "7px",

  color: "#64748B",

  fontSize: "10px",
  fontWeight: 700,
} as const;


const modalOverlayStyle = {
  position: "fixed",

  top: 0,
  left: 0,
  right: 0,
  bottom: 0,

  display: "flex",

  justifyContent: "center",
  alignItems: "center",

  padding: "20px",

  background:
    "rgba(15, 23, 42, 0.48)",

  backdropFilter: "blur(3px)",

  zIndex: 9999,
} as const;


const modalStyle = {
  width: "480px",
  maxWidth: "100%",

  maxHeight: "78vh",

  overflowY: "auto" as const,

  padding: "18px",

  background: "#FFFFFF",

  border: "1px solid #E2E8F0",

  borderRadius: "22px",

  boxShadow:
    "0 25px 70px rgba(15,23,42,0.22)",
} as const;


const modalHeroStyle = {
  position: "relative",

  overflow: "hidden",

  marginBottom: "14px",

  padding: "17px",

  background:
    "linear-gradient(135deg, #FFFFFF 0%, #FFF7ED 100%)",

  border: "1px solid #FED7AA",

  borderRadius: "16px",
} as const;


const topicModalCard = {
  marginBottom: "10px",

  padding: "14px",

  background: "#FFFFFF",

  border: "1px solid #E2E8F0",

  borderRadius: "14px",

  boxShadow:
    "0 4px 14px rgba(15,23,42,0.03)",
} as const;


const closeButtonStyle = {
  width: "100%",

  marginTop: "4px",

  padding: "11px 16px",

  background:
    "linear-gradient(135deg, #F97316 0%, #FB923C 100%)",

  color: "#FFFFFF",

  border: "none",

  borderRadius: "11px",

  cursor: "pointer",

  fontSize: "13px",
  fontWeight: 800,

  letterSpacing: "0.5px",

  boxShadow:
    "0 7px 16px rgba(249,115,22,0.16)",
} as const;
import { useEffect, useState } from "react";

import {
  getTodaysLectureLogs,
} from "../data/studentGrowthPlanRepository";

import {

UNDERSTANDING_OPTIONS,

}

from "../data/studentUnderstandingOptions";


import {

submitStudentDailyFeedback,

hasStudentSubmittedFeedback,

getStudentFeedbackByLecture,

} from "../data/studentDailyFeedbackRepository";

import {

getPendingDoubtsByStudent,
submitStudentPendingDoubtResponse,

}

from
"../domains/teacherIntelligence/repository/PendingTeacherDoubtRepository";

import {

requireIdentity,

} from "../services/identityService";

export default function DailyLectureFeedback() {
  const [lectureLogs, setLectureLogs] = useState<any[]>([]);


  
const [expandedCard, setExpandedCard] =

useState<string | null>(null);


const [

understandingLevel,

setUnderstandingLevel,

] = useState("");







const [

conceptsNotUnderstood,

setConceptsNotUnderstood,

] = useState<string[]>([]);

const [

somethingElse,

setSomethingElse,

] = useState(false);


const [

somethingElseText,

setSomethingElseText,

] = useState("");

const [

additionalNote,

setAdditionalNote,

] = useState("");

const [

pendingDoubts,

setPendingDoubts,

] = useState<any[]>([]);


const [

selectedResponse,

setSelectedResponse,

] = useState<Record<string,string>>({});


const [submittedFeedback, setSubmittedFeedback] =



useState<Record<string, any>>({});

useEffect(()=>{

loadDailyLogs();

loadPendingDoubts();

},[]);


useEffect(() => {

if (

lectureLogs.length > 0

) {

loadSubmittedFeedback();

}

}, [lectureLogs]);

async function loadDailyLogs() {
  const logs =
await getTodaysLectureLogs();

  console.log(
    "STUDENT DAILY LECTURE LOGS:",
    logs
  );

  setLectureLogs(logs);
}

async function loadPendingDoubts(){

const identity =
requireIdentity();

const doubts =

await getPendingDoubtsByStudent(

identity.studentUuid

);

console.log(
"PENDING DOUBTS",
doubts
);

setPendingDoubts(doubts);

}

async function loadSubmittedFeedback() {

  const feedbackMap: Record<string, any> = {};

  for (const log of lectureLogs) {

    const feedback =

      await getStudentFeedbackByLecture(

        log.id

      );


    if (feedback) {

      feedbackMap[log.id] = feedback;

    }

  }

  setSubmittedFeedback(feedbackMap);

}


async function submitFeedback(

log:any

){

console.log(
"SUBMIT BUTTON CLICKED"
);


if(

understandingLevel.length===0

){

alert(

"Please select your understanding level."

);

return;

}


if(

understandingLevel !==
"I completely understood."

&&

conceptsNotUnderstood.length === 0

&&

!somethingElse

){

alert(

"Please select at least one difficult concept."

);

return;

}

let finalAdditionalNote =

additionalNote;


if(

somethingElse

&&

somethingElseText.trim()

){

finalAdditionalNote =

`${

additionalNote

}

${
additionalNote.trim()
? "\n\n"
: ""
}

Additional Learning Gap:

${somethingElseText}`;

}


await submitStudentDailyFeedback(

log.id,

log.teacher_uuid,

log.school_uuid,

log.class_name,

log.section_name,

log.subject_name,

log.topic_name,

understandingLevel,

conceptsNotUnderstood,

finalAdditionalNote.trim().length > 0
? finalAdditionalNote
: null

);


const feedback =

await getStudentFeedbackByLecture(

log.id

);


setSubmittedFeedback(

(previous)=>({

...previous,

[log.id]:feedback,

})

);


alert(

"Feedback submitted successfully."

);


setExpandedCard(null);


setUnderstandingLevel("");



setConceptsNotUnderstood([]);

setAdditionalNote("");

setSomethingElse(false);

setSomethingElseText("");

}

async function submitPendingDoubt(

doubt:any

){

const response =

selectedResponse[doubt.id];


if(!response){

alert(

"Please select your response."

);

return;

}


await submitStudentPendingDoubtResponse(

doubt.id,
response

);

if(

response ===

"DISCUSSED"

){

alert(

"Great! Your teacher revised the concept."

);

}else{

alert(

"Thank you. Your learning gap has been recorded."

);

}


await loadPendingDoubts();

}

  return (
    <div className="space-y-6">
 {/* Announcement Card */}

<div
  className="relative overflow-hidden border border-slate-200 bg-white shadow-sm"
  style={{
    borderRadius: "24px",
    padding: "30px 34px",
    background:
      "linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 72%, #FFF9F3 100%)",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.045)",
  }}
>
  {/* Decorative orange circle */}

  <div
    className="pointer-events-none absolute rounded-full"
    style={{
      width: "180px",
      height: "180px",
      right: "-60px",
      top: "-85px",
      background: "rgba(249, 115, 22, 0.06)",
    }}
  />

  {/* Decorative soft orange circle */}

  <div
    className="pointer-events-none absolute rounded-full"
    style={{
      width: "95px",
      height: "95px",
      right: "120px",
      top: "-50px",
      background: "rgba(249, 115, 22, 0.035)",
    }}
  />

  {/* Decorative blue circle */}

  <div
    className="pointer-events-none absolute rounded-full"
    style={{
      width: "150px",
      height: "150px",
      right: "180px",
      bottom: "-105px",
      background: "rgba(37, 99, 235, 0.04)",
    }}
  />

  <div className="relative z-10 flex items-center justify-between gap-8">

    {/* LEFT CONTENT */}

    <div className="flex-1">
      <div
        style={{
          color: "#F97316",
          fontSize: "11px",
          fontWeight: 800,
          letterSpacing: "2px",
          textTransform: "uppercase",
        }}
      >
        DAILY LEARNING ROUTINE
      </div>

      <h2
        style={{
          margin: "9px 0 8px",
          color: "#0F172A",
          fontSize: "27px",
          lineHeight: 1.15,
          fontWeight: 800,
          letterSpacing: "-0.6px",
        }}
      >
        Continuous Daily Check-In
      </h2>

      <p
        style={{
          margin: 0,
          maxWidth: "900px",
          color: "#64748B",
          fontSize: "14px",
          lineHeight: 1.65,
        }}
      >
        Spend a few minutes reviewing today's classroom topics
        covered by your teachers and submit your learning audit
        once the Daily Lecture Logs are available.
      </p>

      <div
        className="flex flex-wrap"
        style={{
          gap: "8px",
          marginTop: "16px",
        }}
      >
        <div
          style={{
            padding: "6px 10px",
            background: "#FFF7ED",
            border: "1px solid #FED7AA",
            borderRadius: "999px",
            color: "#C2410C",
            fontSize: "9px",
            fontWeight: 800,
            letterSpacing: "0.6px",
          }}
        >
          HOMEWORK AUDIT
        </div>

        <div
          style={{
            padding: "6px 10px",
            background: "#EFF6FF",
            border: "1px solid #BFDBFE",
            borderRadius: "999px",
            color: "#1D4ED8",
            fontSize: "9px",
            fontWeight: 800,
            letterSpacing: "0.6px",
          }}
        >
          DAILY FEEDBACK
        </div>
      </div>
    </div>

    {/* RIGHT BADGE */}

    <div
      className="flex flex-shrink-0 flex-col items-center justify-center"
      style={{
        width: "90px",
        height: "90px",
        background:
          "linear-gradient(145deg, #FFF8F1 0%, #FFFFFF 100%)",
        border: "1px solid #FED7AA",
        borderRadius: "22px",
        boxShadow: "0 8px 20px rgba(249, 115, 22, 0.07)",
      }}
    >
      <div
        style={{
          fontSize: "28px",
          lineHeight: 1,
        }}
      >
        ✓
      </div>

      <div
        style={{
          marginTop: "9px",
          color: "#F97316",
          fontSize: "8px",
          fontWeight: 800,
          letterSpacing: "1.1px",
          textAlign: "center",
        }}
      >
        DAILY
        <br />
        CHECK-IN
      </div>
    </div>
  </div>
</div>


{
pendingDoubts.length > 0 && (

<>

<div className="px-1">

<h2 className="text-2xl font-bold text-slate-900">

Pending Learning Gaps

</h2>

<p className="mt-2 text-slate-600">

Please let us know whether your teacher revised these
difficult concepts during today's classroom discussion.

</p>

</div>

<div
className="rounded-3xl border border-orange-200 bg-orange-50 p-6 shadow-sm"
>

<div
className="mt-5 space-y-5"
>

{

pendingDoubts.map(

(doubt:any)=>(

<div

key={doubt.id}

className="rounded-2xl bg-white p-5"

>

<div className="space-y-3">

<div>

<p className="text-sm text-slate-500">

Subject

</p>

<p className="font-semibold">

{doubt.subject_name}

</p>

</div>


<div>

<p className="text-sm text-slate-500">

Previous Topic

</p>

<p className="font-semibold">

{doubt.previous_topic_name}

</p>

</div>


<div>

<p className="text-sm text-slate-500">

Difficult Concept

</p>

<p className="font-semibold text-orange-700">

{doubt.previous_difficult_concept}

</p>

</div>

</div>


<div className="mt-4">

<p className="text-sm text-slate-500">

Teacher

</p>

<p className="font-semibold">

{doubt.teacher_name}

</p>

</div> 


<p className="mt-2">

You previously mentioned that this concept was difficult.

</p>


<div
className="mt-5 space-y-3"
>

<label
className="flex gap-3"
>

<input

type="radio"

name={doubt.id}

checked={

selectedResponse[doubt.id]

===

"DISCUSSED"

}

onChange={()=>{

setSelectedResponse(

(previous)=>({

...previous,

[doubt.id]:

"DISCUSSED",

})

);

}}

 />

<span>

Yes, it was discussed today.

</span>

</label>


<label
className="flex gap-3"
>

<input

type="radio"

name={doubt.id}

checked={

selectedResponse[doubt.id]

===

"NOT DISCUSSED"

}

onChange={()=>{

setSelectedResponse(

(previous)=>({

...previous,

[doubt.id]:

"NOT DISCUSSED",

})

);

}}

 />

<span>

No, it was NOT discussed today.

</span>

</label>

</div>


<button

onClick={()=>{

submitPendingDoubt(

doubt

);

}}

className="mt-5 rounded-xl bg-red-600 px-5 py-2 font-bold text-white"

>

Submit Response

</button>


</div>

))

}

</div>

</div>

</>

)

}

{
pendingDoubts.length === 0 && (

<div
className="rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm"
>

<h2
className="text-2xl font-bold text-green-700"
>

No Pending Learning Gaps

</h2>

<p
className="mt-3 text-slate-600"
>

Great work! All your previous difficult concepts
have either been revised by your teacher or have
already been resolved.

</p>

</div>

)

}

<div>

<h2 className="text-2xl font-bold text-slate-900">

Today's Daily Feedback

</h2>

<p className="mt-2 text-slate-600">

Review today's classroom activities and submit your
learning feedback.

</p>

</div>

      {/* Daily Lecture Feed */}

      {lectureLogs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
          <h2 className="text-2xl font-bold uppercase tracking-wide text-slate-800">
            No Daily Lecture Logs Available
          </h2>

          <p className="mt-4 text-slate-500">
            Your teachers have not submitted any classroom lecture
            logs for today.
          </p>

          <p className="mt-2 text-slate-500">
            Once teachers submit their classroom activities, they
            will automatically appear here for your review and
            feedback.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
         {lectureLogs.map((log) => (
  <div
    key={log.id}
    className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm"
  >
    <div className="flex items-start justify-between gap-8">
      {/* LEFT SIDE */}

      <div className="flex-1">
        <div className="inline-flex rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {log.subject_name ?? "Subject Pending"}
        </div>

        <h2 className="mt-3 text-xl font-bold text-slate-900">
          {log.topic_name ?? "Topic Not Available"}
        </h2>

<div className="mt-4 rounded-xl bg-blue-50 p-4">

  <p className="font-semibold text-slate-800">

    Your Teacher Covered Today

  </p>

  <ul className="mt-3 list-disc pl-6 space-y-1">

    {(log.concepts_covered ?? []).map(
      (concept: string) => (

        <li key={concept}>
          {concept}
        </li>

      )
    )}

  </ul>

</div>

        <div className="mt-3 space-y-1 text-sm text-slate-600">
          <p>
            Teacher :{" "}
            <span className="font-semibold">
              {log.teacher_name ?? "Teacher Name Pending"}
            </span>
          </p>

          <p>
            Schoolbook Coverage : Page {log.page_from ?? "-"} to
            Page {log.page_to ?? "-"}
          </p>

          <p>
            Homework Given :{" "}
            <span className="font-semibold">
              {log.homework_given ? "Yes" : "No"}
            </span>
          </p>

          <p>
            Teacher Notes :{" "}
            {log.teacher_notes ?? "No notes provided."}
          </p>

          <p>
            Lecture Date : {log.log_date ?? "Pending"}
          </p>
        </div>
      </div>

     {/* RIGHT SIDE */}

<div className="w-[380px] flex-shrink-0">

  {submittedFeedback[log.id] ? (

    <div className="space-y-3">

      <div className="rounded-full bg-green-50 px-4 py-2 text-center font-bold text-green-700">
        ✓ Feedback Submitted Successfully
      </div>

      <div className="rounded-xl bg-gray-100 p-4 text-sm">

        <p>
          Understanding Level :
        </p>

        <p className="font-semibold">
          {submittedFeedback[log.id]?.understanding_level}
        </p>

      </div>

      {

        submittedFeedback[log.id]
          ?.concepts_not_understood?.length > 0 && (

        <div className="rounded-xl bg-red-50 p-4">

          <p className="font-semibold mb-2">
            Concepts Not Understood
          </p>

          {

            submittedFeedback[log.id]
              ?.concepts_not_understood
              ?.map((concept:string)=>(

                <div
                  key={concept}
                  className="mb-2"
                >
                  • {concept}
                </div>

              ))

          }

        </div>

      )}

      {

        submittedFeedback[log.id]
          ?.additional_note && (

        <div className="rounded-xl bg-orange-50 p-4">

          <p className="font-semibold">
            Additional Note
          </p>

          <p>
            {
              submittedFeedback[log.id]
                ?.additional_note
            }
          </p>

        </div>

      )}

    </div>

  ) : (

    <button

      onClick={() => {

        setExpandedCard(log.id);

        setUnderstandingLevel("");

      

        setConceptsNotUnderstood([]);

        setAdditionalNote("");

setSomethingElse(false);

setSomethingElseText("");

      }}

      className="rounded-xl bg-orange-500 px-5 py-2 font-bold text-white"

    >

      Submit Daily Feedback

    </button>

  )}



  {

    expandedCard === log.id && (

      <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-4">

        <h3 className="font-bold">

          How well did you understand today's class?

        </h3>


        <div className="mt-4 space-y-3">

          {

            UNDERSTANDING_OPTIONS.map((option)=>(

              <label
                key={option}
                className="flex items-center gap-3"
              >

                <input

                  type="radio"

                  name={`understanding-${log.id}`}

                  value={option}

                  checked={
                    understandingLevel === option
                  }

                  onChange={()=>
                    setUnderstandingLevel(option)
                  }

                />

                <span>
                  {option}
                </span>

              </label>

            ))

          }

        </div>


      {

understandingLevel !== ""

&&

understandingLevel !==

"I completely understood."

&& (

<>

<div className="mt-6">

<p className="font-semibold">

Which concepts were difficult today?

</p>

<div className="mt-4 space-y-3">

{

(log.concepts_covered ?? []).map(

(concept:string)=>(

<label

key={concept}

className="flex items-center gap-3"

>

<input

type="checkbox"

checked={

conceptsNotUnderstood.includes(

concept

)

}

onChange={(event)=>{

if(event.target.checked){

setConceptsNotUnderstood([

...conceptsNotUnderstood,

concept

]);

}else{

setConceptsNotUnderstood(

conceptsNotUnderstood.filter(

(item)=>

item !== concept

)

);

}

}}

/>

<span>

{concept}

</span>

</label>

))

}


<label

className="flex items-center gap-3"

>

<input

type="checkbox"

checked={somethingElse}

onChange={(event)=>

setSomethingElse(

event.target.checked

)

}

/>

<span>

Something Else

</span>

</label>

</div>

</div>


{

somethingElse && (

<div className="mt-5">

<p className="font-semibold">

Please tell us what else was difficult.

</p>

<textarea

rows={3}

value={somethingElseText}

onChange={(e)=>

setSomethingElseText(

e.target.value

)

}

className="mt-2 w-full rounded-xl border p-3"

/>

</div>

)

}


<div className="mt-6">

<p className="font-semibold">

Additional Notes (Optional)

</p>

<textarea

rows={3}

value={additionalNote}

onChange={(e)=>

setAdditionalNote(

e.target.value

)

}

className="mt-2 w-full rounded-xl border p-3"

/>

</div>

</>

)

}



        <div className="mt-6 flex gap-3">

          <button

            onClick={() => {

              setExpandedCard(null);

              setUnderstandingLevel("");

              

              setConceptsNotUnderstood([]);

              setAdditionalNote("");

setSomethingElse(false);

setSomethingElseText("");

            }}

            className="rounded-xl border px-4 py-2"

          >

            Cancel

          </button>


          <button

            onClick={()=>
              submitFeedback(log)
            }

            className="rounded-xl bg-orange-500 px-4 py-2 font-bold text-white"

          >

            Submit Feedback

          </button>

        </div>

      </div>

    )

  }

</div>


    </div>
  </div>

))}

        </div>

      )}

    </div>

  );

}
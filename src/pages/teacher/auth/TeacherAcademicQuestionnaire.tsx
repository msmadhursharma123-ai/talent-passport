import React, { useState } from "react";

import {
CLASSES,
SECTIONS,
SUBJECTS,
} from "../../../domains/teacherIntelligence/constants/TeacherMasterData";

import {
createTeacherAssignment,
} from "../../../domains/teacherIntelligence/repository/TeacherAssignmentRepository";

import {
getCurrentTeacher,
} from "../../../services/identityService";

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

export default function TeacherAcademicQuestionnaire({
  onContinue,
  onBack,
}: Props) {

const [currentStep, setCurrentStep] =
useState(1);

const [
selectedClassSections,
setSelectedClassSections,
] = useState<string[]>([]);


const [
selectedSubject,
setSelectedSubject,
] = useState("");

const [loading, setLoading] =
useState(false);


//======================================
// NEXT STEP
//======================================

function goToNextStep() {

if(
currentStep===1 &&
selectedClassSections.length===0
) {

alert(
"Please select your Class & Section."
);

return;

}

setCurrentStep(
currentStep + 1
);

}


//======================================
// PREVIOUS STEP
//======================================

function goToPreviousStep() {

if (currentStep === 1) {
return;
}

setCurrentStep(
currentStep - 1
);

}


//======================================
// COMPLETE QUESTIONNAIRE
//======================================

async function handleComplete() {

if (!selectedSubject) {

alert(
"Please select your subject."
);

return;

}

const teacher =
getCurrentTeacher();

if (!teacher) {

alert(
"Teacher identity not found."
);

return;

}

setLoading(true);

try {

for (

const classroom of
selectedClassSections

) {

const [

className,
sectionName,

] = classroom.split("-");


await createTeacherAssignment({

teacherUuid:
teacher.teacherUuid,

schoolUuid:
teacher.schoolUuid,

className,

sectionName,

subjectName:
selectedSubject,

academicYear:
"2026-2027",

isActive:
true,

});

}

onContinue();

}

catch (error:any) {

alert(

error?.message ??

"Unable to save teacher assignments."

);

}

finally {

setLoading(false);

}

}

return (
<div className="teacher-questionnaire-page"
style={{
minHeight: "100vh",

background:
"linear-gradient(135deg, #F8F7F4 0%, #FCFAF7 38%, #FFF7EE 70%, #F3F6FB 100%)",

padding: 40,

display: "flex",
justifyContent: "center",
alignItems: "center",

position: "relative",
overflow: "hidden",
}}
>

{/* LARGE WARM TOP RIGHT CIRCLE */}

<div
style={{
position: "absolute",
width: "500px",
height: "500px",
borderRadius: "50%",
background:
"rgba(244,166,35,0.085)",
right: "-175px",
top: "-215px",
pointerEvents: "none",
}}
/>

{/* INNER WARM GLOW */}

<div
style={{
position: "absolute",
width: "270px",
height: "270px",
borderRadius: "50%",
background:
"rgba(255,184,76,0.055)",
right: "7%",
top: "18%",
pointerEvents: "none",
}}
/>

{/* LARGE BLUE BOTTOM LEFT CIRCLE */}

<div
style={{
position: "absolute",
width: "410px",
height: "410px",
borderRadius: "50%",
background:
"rgba(20,59,115,0.060)",
left: "-205px",
bottom: "-215px",
pointerEvents: "none",
}}
/>

{/* WARM BOTTOM CIRCLE */}

<div
style={{
position: "absolute",
width: "235px",
height: "235px",
borderRadius: "50%",
background:
"rgba(244,166,35,0.060)",
right: "15%",
bottom: "7%",
pointerEvents: "none",
}}
/>

{/* SOFT CENTER GLOW */}

<div
style={{
position: "absolute",
width: "550px",
height: "550px",
borderRadius: "50%",
background:
"radial-gradient(circle, rgba(244,166,35,0.035) 0%, rgba(244,166,35,0) 70%)",
left: "35%",
top: "20%",
pointerEvents: "none",
}}
/>

<div className="teacher-questionnaire-card"
style={{
width: 680,
background: "white",
borderRadius: 24,
padding: 32,
boxShadow:
"0 10px 30px rgba(0,0,0,0.08)",

position: "relative",
zIndex: 1,
}}
>

{/* BACK BUTTON */}

<button
onClick={onBack}
style={{
background: "transparent",
border: "none",
color: "#143B73",
cursor: "pointer",
fontSize: 18,
fontWeight: 700,
marginBottom: 25,
}}
>
← Back
</button>


{/* TITLE */}

<h1
style={{
margin: 0,
color: "#0F172A",
fontSize: 32,
fontWeight: 400,
}}
>
Teacher Academic Questionnaire
</h1>

<p
style={{
color: "#64748B",
marginTop: 12,
marginBottom: 30,
lineHeight: 1.8,
}}
>
Help us personalize your Teacher
Portal by selecting the Class &
Sections and Subject that you teach.
</p>


{/* PROGRESS BAR */}

<div
style={{
height: 8,
borderRadius: 20,
background: "#E2E8F0",
overflow: "hidden",
marginBottom: 40,
}}
>
<div
style={{
width: `${(currentStep / 2) * 100}%`,
height: "100%",
background: "#F59E0B",
}}
/>
</div>


<h3
style={{
color: "#F59E0B",
}}
>
STEP {currentStep} OF 2
</h3>



{/* STEP 1 */}

{currentStep === 1 && (
<>

<h2>
Which Class & Section do you teach?
</h2>

<div
className="teacher-class-list"
style={{
display:"flex",
flexWrap:"wrap",
gap:16,
marginTop:30,
}}
>

{CLASSES.map((className) => (

<div
key={className}
style={{
width: "100%",
marginBottom: "18px",
}}
>

<h3
style={{
marginBottom: "10px",
color: "#143B73",
fontWeight: 700,
fontSize: 18,
}}
>
CLASS {className}
</h3>

<div
style={{
display: "flex",
flexWrap: "wrap",
gap: 16,
}}
>

{SECTIONS.map((sectionName) => {

const item =
`${className}-${sectionName}`;

return (

<button
key={item}
onClick={() => {

if (
selectedClassSections.includes(item)
) {

setSelectedClassSections(
selectedClassSections.filter(
(x) => x !== item
)
);

} else {

setSelectedClassSections([
...selectedClassSections,
item,
]);

}

}}
style={{
padding: "12px 20px",
borderRadius: 16,
border: "none",
cursor: "pointer",
fontSize: 16,

background:
selectedClassSections.includes(item)
? "#F59E0B"
: "#F1F5F9",

color:
selectedClassSections.includes(item)
? "white"
: "#0F172A",

}}
>
{item}
</button>

);

})}

</div>

</div>

))}

</div>

</>

)}


     {/* STEP 2 */}

{currentStep === 2 && (
  <>
    <h2>
      Which Subject do you teach?
    </h2>

    <div
      className="teacher-subject-list"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        marginTop: 30,
      }}
    >
      {SUBJECTS.map((item) => (
        <button
          key={item}
          onClick={() => {
            setSelectedSubject(item);
          }}
          style={{
            padding: "12px 20px",
            borderRadius: 16,
            border: "none",
            cursor: "pointer",
            fontSize: 18,
            background:
              selectedSubject === item
                ? "#F59E0B"
                : "#F1F5F9",
            color:
              selectedSubject === item
                ? "white"
                : "#0F172A",
          }}
        >
          {item}
        </button>
      ))}
    </div>
  </>
)}

        {/* NAVIGATION BUTTONS */}

        <div
          className="teacher-questionnaire-nav"
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            marginTop: 50,
          }}
        >

          <button
            onClick={goToPreviousStep}
            disabled={currentStep === 1}
            style={buttonStyle}
          >
            Previous
          </button>

        {currentStep !== 2 ? (

  <button
    onClick={goToNextStep}
    style={buttonStyle}
  >
    Next
  </button>

) : (

  <button
    onClick={handleComplete}
    disabled={loading}
    style={buttonStyle}
  >
    {loading
      ? "Saving..."
      : "Complete"}
  </button>

)}
        </div>

      </div>
    
<style>{`
@media (max-width: 1024px) {
  .teacher-questionnaire-page { padding: 28px !important; box-sizing: border-box; overflow-y: auto !important; align-items: flex-start !important; }
  .teacher-questionnaire-card { width: min(680px, 100%) !important; padding: 28px !important; box-sizing: border-box; margin: auto; }
}
@media (max-width: 600px) {
  .teacher-questionnaire-page { min-height: 100dvh !important; padding: 14px !important; }
  .teacher-questionnaire-card { width: 100% !important; padding: 18px 14px !important; border-radius: 18px !important; }
  .teacher-questionnaire-card > button:first-child { font-size: 14px !important; margin-bottom: 14px !important; }
  .teacher-questionnaire-card > h1 { font-size: 25px !important; line-height: 1.12 !important; }
  .teacher-questionnaire-card > p { font-size: 13px !important; line-height: 1.5 !important; margin-bottom: 20px !important; }
  .teacher-questionnaire-card > h3 { font-size: 13px !important; }
  .teacher-questionnaire-card h2 { font-size: 20px !important; line-height: 1.25 !important; }
  .teacher-class-list { gap: 8px !important; margin-top: 18px !important; }
  .teacher-class-list > div { margin-bottom: 10px !important; }
  .teacher-class-list h3 { font-size: 14px !important; margin-bottom: 7px !important; }
  .teacher-class-list button, .teacher-subject-list button { padding: 9px 12px !important; border-radius: 11px !important; font-size: 13px !important; }
  .teacher-subject-list { gap: 8px !important; margin-top: 18px !important; }
  .teacher-questionnaire-nav { margin-top: 26px !important; gap: 10px; }
  .teacher-questionnaire-nav button { flex: 1; }
}
`}</style>
</div>
  );

}

const buttonStyle = {
padding: "12px 22px",
borderRadius: "12px",
border: "none",
cursor: "pointer",
background: "#F59E0B",
color: "white",
fontSize: 14,
fontWeight: 700,
};
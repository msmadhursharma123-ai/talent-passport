import { useState } from "react";

import { useEffect } from "react";

import {
getCurrentTeacher,
} from "../../../services/identityService";

import {
getTeacherAssignmentsByTeacher,
} from "../repository/TeacherAssignmentRepository";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (
    data: Record<string, unknown>
  ) => Promise<void>;
}

export default function TeacherDailyLogDialog({
  open,
  onClose,
  onSave,
}: Props) {
  const [selectedClass, setSelectedClass] =
    useState("");

  const [
    selectedSection,
    setSelectedSection,
  ] = useState("");

  const [
    selectedSubject,
    setSelectedSubject,
  ] = useState("");

const [classes, setClasses] =
useState<string[]>([]);

const [sections, setSections] =
useState<string[]>([]);

const [subjects, setSubjects] =
useState<string[]>([]);

const [assignments, setAssignments] =
useState<any[]>([]);

  const [topicName, setTopicName] =
    useState("");

  const [pageFrom, setPageFrom] =
    useState("");

  const [pageTo, setPageTo] =
    useState("");

  const [
    homeworkGiven,
    setHomeworkGiven,
  ] = useState(false);

  const [
    activityConducted,
    setActivityConducted,
  ] = useState(false);

  const [teacherNotes, setTeacherNotes] =
    useState("");

const [conceptInput, setConceptInput] =
useState("");

const [
conceptsCovered,
setConceptsCovered,
] = useState<string[]>([]);

useEffect(() => {

loadTeacherAssignments();

}, []);

async function loadTeacherAssignments() {

const teacher =
getCurrentTeacher();

if (!teacher) return;

const assignments =

await getTeacherAssignmentsByTeacher(
teacher.teacherUuid
);

setAssignments(assignments);

// CLASSES

const uniqueClasses = [

...new Set(

assignments.map(
item => item.className
)

),

];



// SECTIONS

const uniqueSections = [

...new Set(

assignments.map(
item => item.sectionName
)

),

];



// SUBJECTS

const uniqueSubjects = [

...new Set(

assignments.map(
item => item.subjectName
)

),

];



setClasses(
uniqueClasses
);

setSections(
uniqueSections
);

setSubjects(
uniqueSubjects
);

}

  if (!open) {
    return null;
  }

function addConcept() {

if (
!conceptInput.trim()
){
return;
}

setConceptsCovered(
[
...conceptsCovered,
conceptInput.trim(),
]
);

setConceptInput("");

}


function removeConcept(
index:number
){

setConceptsCovered(

conceptsCovered.filter(

(_,i)=>i!==index

)

);

}

 async function handleSave() {

const selectedAssignment =
assignments.find(
(item) =>
item.className === selectedClass &&
item.sectionName === selectedSection &&
item.subjectName === selectedSubject
);


if (!selectedAssignment) {


alert(
"Invalid Teacher Assignment."
);

return;

}

if(
conceptsCovered.length === 0
){

alert(
"Please add at least one concept."
);

return;

}

await onSave({

teacher_assignment_uuid:
selectedAssignment.id,

class_name:
selectedClass,

section_name:
selectedSection,

subject_name:
selectedSubject,

topic_name:
topicName,

concepts_covered:
conceptsCovered,

page_from:
Number(pageFrom),

page_to:
Number(pageTo),

homework_given:
homeworkGiven,

activity_conducted:
activityConducted,

teacher_notes:
teacherNotes,

log_date:
new Date().toISOString(),

});

onClose();

}

  return (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(3,18,46,0.55)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
      padding: 20,
    }}
  >
    <div
      style={{
        width: "750px",
        maxHeight: "92vh",
        overflowY: "auto",
        background: "white",
        borderRadius: 28,
        boxShadow:
          "0px 30px 80px rgba(0,0,0,0.25)",
        padding: 40,
      }}
    >
      {/* HEADER */}

      <div
        style={{
          marginBottom: 30,
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#F59E0B",
            fontWeight: 700,
            letterSpacing: 2,
            fontSize: 13,
          }}
        >
          DAILY CLASSROOM INTELLIGENCE LOG
        </p>

        <h1
          style={{
            marginTop: 10,
            marginBottom: 10,
            color: "#03122E",
            fontSize: 34,
          }}
        >
          Publish Today's Lecture
        </h1>

        <p
          style={{
            margin: 0,
            color: "#64748B",
            lineHeight: 1.7,
          }}
        >
          Share today's classroom activity,
          topic coverage and homework details
          with students, parents and classroom
          intelligence systems.
        </p>
      </div>

      {/* CLASS */}

      <select
        style={inputStyle}
        value={selectedClass}
      onChange={(e)=>{

const value =
e.target.value;

setSelectedClass(value);


// FILTER SECTIONS

const filteredSections =

[
...new Set(

assignments

.filter(

item=>

item.className === value

)

.map(

item=>item.sectionName

)

)

];


setSections(
filteredSections
);


// RESET

setSelectedSection("");

setSelectedSubject("");

setSubjects([]);

}}
      >
        <option value="">
          Select Class
        </option>

        {classes.map((item) => (
          <option
            key={item}
            value={item}
          >
            Class {item}
          </option>
        ))}
      </select>

      {/* SECTION */}

      <select
        style={inputStyle}
        value={selectedSection}
      onChange={(e)=>{

const value =
e.target.value;

setSelectedSection(
value
);


// FILTER SUBJECTS

const filteredSubjects =

[
...new Set(

assignments

.filter(

item=>

item.className ===
selectedClass &&

item.sectionName ===
value

)

.map(

item=>item.subjectName

)

)

];


setSubjects(
filteredSubjects
);


// RESET

setSelectedSubject("");

}}
      >
        <option value="">
          Select Section
        </option>

        {sections.map((item) => (
          <option
            key={item}
            value={item}
          >
            Section {item}
          </option>
        ))}
      </select>

      {/* SUBJECT */}

      <select
        style={inputStyle}
        value={selectedSubject}
        onChange={(e) =>
          setSelectedSubject(e.target.value)
        }
      >
        <option value="">
          Select Subject
        </option>

        {subjects.map((item) => (
          <option
            key={item}
            value={item}
          >
            {item}
          </option>
        ))}
      </select>

      {/* TOPIC */}

      <input
        style={inputStyle}
        placeholder="Topic Covered"
        value={topicName}
        onChange={(e) =>
          setTopicName(e.target.value)
        }
      />

{/* CONCEPTS COVERED TODAY */}

<div
style={{
marginBottom:25,
}}
>

<h3
style={{
marginBottom:15,
color:"#03122E",
}}
>
Concepts Covered Today *
</h3>


<div
style={{
display:"flex",
gap:12,
}}
>

<input

style={{
...inputStyle,
marginBottom:0,
flex:1,
}}

placeholder=
"Enter concept covered today"

value={conceptInput}

onChange={(e)=>
setConceptInput(
e.target.value
)
}

/>


<button

onClick={addConcept}

style={saveButton}

>

Add

</button>

</div>


<div
style={{
display:"flex",
flexWrap:"wrap",
gap:10,
marginTop:15,
}}
>

{

conceptsCovered.map(
(item,index)=>(

<div

key={index}

style={{

padding:"10px 18px",
borderRadius:30,
background:"#FFF7ED",
fontWeight:700,
color:"#C2410C",
display:"flex",
gap:10,
alignItems:"center",

}}

>

{item}


<button

onClick={()=>
removeConcept(
index
)
}

style={{

border:"none",
background:"transparent",
cursor:"pointer",
fontWeight:700,
color:"red",

}}

>

x

</button>


</div>

)

)

}


</div>

</div>

      {/* PAGES */}

      <div
        style={{
          display: "flex",
          gap: 16,
        }}
      >
        <input
          style={{
            ...inputStyle,
            marginBottom: 0,
            flex: 1,
          }}
          placeholder="Page From"
          value={pageFrom}
          onChange={(e) =>
            setPageFrom(e.target.value)
          }
        />

        <input
          style={{
            ...inputStyle,
            marginBottom: 0,
            flex: 1,
          }}
          placeholder="Page To"
          value={pageTo}
          onChange={(e) =>
            setPageTo(e.target.value)
          }
        />
      </div>

      {/* CHECKBOXES */}

      <div
        style={{
          display: "flex",
          gap: 30,
          marginTop: 25,
          marginBottom: 25,
        }}
      >
        <label
          style={checkboxStyle}
        >
          <input
            type="checkbox"
            checked={homeworkGiven}
            onChange={(e) =>
              setHomeworkGiven(
                e.target.checked
              )
            }
          />

          Homework Given
        </label>

        <label
          style={checkboxStyle}
        >
          <input
            type="checkbox"
            checked={activityConducted}
            onChange={(e) =>
              setActivityConducted(
                e.target.checked
              )
            }
          />

          Activity Conducted
        </label>
      </div>

      {/* NOTES */}

      <textarea
        rows={6}
        style={textareaStyle}
        placeholder="Additional Teaching Notes..."
        value={teacherNotes}
        onChange={(e) =>
          setTeacherNotes(
            e.target.value
          )
        }
      />

      {/* BUTTONS */}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 16,
          marginTop: 30,
        }}
      >
        <button
          onClick={onClose}
          style={cancelButton}
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          style={saveButton}
        >
          Publish Lecture
        </button>
      </div>
    </div>
  </div>
);
}

const inputStyle = {
  width: "100%",
  padding: "18px",
  borderRadius: "16px",
  border: "1px solid #CBD5E1",
  marginBottom: 18,
  fontSize: 16,
  boxSizing: "border-box" as const,
};

const textareaStyle = {
  width: "100%",
  padding: "18px",
  borderRadius: "18px",
  border: "1px solid #CBD5E1",
  fontSize: 16,
  resize: "none" as const,
  boxSizing: "border-box" as const,
};

const checkboxStyle = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  fontSize: 16,
  fontWeight: 600,
};

const cancelButton = {
  padding: "14px 24px",
  borderRadius: "14px",
  border: "1px solid #CBD5E1",
  background: "white",
  cursor: "pointer",
  fontWeight: 600,
};

const saveButton = {
  padding: "14px 28px",
  border: "none",
  borderRadius: "14px",
  background:
    "linear-gradient(90deg,#F59E0B,#FB923C)",
  color: "white",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 16,
};
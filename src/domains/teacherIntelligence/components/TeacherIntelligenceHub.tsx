import { useEffect, useState } from "react";

import {

getRecurringConcepts,
getRecurringTopics,
getRecurringStudents,

} from "../repository/AcademicLearningMemoryRepository";


import {

getTopicTrendHistory,
getConceptTrendHistory,
getClassroomTrendHistory,

} from "../repository/AcademicTrendIntelligenceRepository";



type Props = {

className:string;

sectionName:string;

};


export default function TeacherIntelligenceHub({

className,
sectionName,

}:Props){

const [recurringConcepts,
setRecurringConcepts] =

useState<any[]>([]);


const [recurringTopics,
setRecurringTopics] =

useState<any[]>([]);


const [recurringStudents,
setRecurringStudents] =

useState<any[]>([]);


const [topicTrend,
setTopicTrend] =

useState<any[]>([]);


const [conceptTrend,
setConceptTrend] =

useState<any[]>([]);


const [classroomTrend,
setClassroomTrend] =

useState<any[]>([]);



useEffect(()=>{

if(

!className ||

!sectionName

){

return;

}


loadTeacherIntelligence();


},[
className,
sectionName
]);



async function loadTeacherIntelligence(){


const concepts =

await getRecurringConcepts(

className,
sectionName

);


const topics =

await getRecurringTopics(

className,
sectionName

);


const students =

await getRecurringStudents(

className,
sectionName

);


const topicHistory =

await getTopicTrendHistory(

className,
sectionName

);


const conceptHistory =

await getConceptTrendHistory(

className,
sectionName

);


const classroomHistory =

await getClassroomTrendHistory(

className,
sectionName

);


setRecurringConcepts(
concepts
);


setRecurringTopics(
topics
);


setRecurringStudents(
students
);


setTopicTrend(
topicHistory
);


setConceptTrend(
conceptHistory
);


setClassroomTrend(
classroomHistory
);


}



return(


<div

style={{

background:"white",
padding:30,
borderRadius:24,
marginTop:30,
boxShadow:
"0px 10px 25px rgba(0,0,0,0.05)",

}}

>

<h2>

Teacher Intelligence Hub

</h2>


<hr />


<h3>

Lecture Intelligence Engine

</h3>


<p>

This section displays today's
lecture intelligence from the
Teacher Dashboard.

</p>


<hr />


<h3>

Academic Memory Intelligence

</h3>


<div
style={{
marginTop:20,
display:"grid",
gridTemplateColumns:
"repeat(auto-fit,minmax(280px,1fr))",
gap:20,
}}
>


<div
style={{
padding:20,
background:"#FFF7ED",
borderRadius:18,
}}
>

<h4>

Recurring Difficult Concepts

</h4>


{

recurringConcepts.length === 0 ?

(

<p>

No recurring difficult concepts found.

</p>

)

:

(

recurringConcepts.map((item:any)=>(

<p>

• {item.concept}

({item.count} times)

</p>

))

)

}

</div>



<div
style={{
padding:20,
background:"#EFF6FF",
borderRadius:18,
}}
>

<h4>

Recurring Difficult Topics

</h4>


{

recurringTopics.length === 0 ?

(

<p>

No recurring difficult topics found.

</p>

)

:

(

recurringTopics.map((item:any)=>(

<p>

• {item.topic}

({item.count} times)

</p>

))

)

}

</div>




<div
style={{
padding:20,
background:"#F0FDF4",
borderRadius:18,
}}
>

<h4>

Students Requiring Support

</h4>


{

recurringStudents.length === 0 ?

(

<p>

No recurring student difficulties found.

</p>

)

:

(

recurringStudents.map((item:any)=>(

<p>

• {item[0]}

({item[1]} lectures)

</p>

))

)

}

</div>



</div>

<hr />


<h3>

Academic Trend Intelligence Engine

</h3>


<p>

Topic Trend Entries :

{topicTrend.length}

</p>


<p>

Concept Trend Entries :

{conceptTrend.length}

</p>


<p>

Classroom Trend Entries :

{classroomTrend.length}

</p>


<hr />


<h3>

Parent Intelligence Engine

</h3>


<p>

Coming Soon

</p>


<hr />


<h3>

School Intelligence Engine

</h3>


<p>

Coming Soon

</p>



</div>


);


}
import { getSupabaseClient }
from "../../../supabaseClient";

import {
requireIdentity,
}
from "../../../services/identityService";


function getHighestRiskTopic(
topics:string[]
){

const topicMap =
new Map<string,number>();


for(const topic of topics){

topicMap.set(

topic,

(topicMap.get(topic) ?? 0)+1

);

}


let highestTopic = "";

let highestCount = 0;


topicMap.forEach(

(count,topic)=>{

if(count > highestCount){

highestCount = count;

highestTopic = topic;

}

}

);


return highestTopic;

}



function getAttentionLevel(
count:number
){

if(count >= 6){

return "HIGH";

}


if(count >=3){

return "MEDIUM";

}


return "LOW";

}



export async function
getStudentExamPreparationIntelligence(){

const identity =

requireIdentity();


const supabase =
getSupabaseClient();


const {

data,
error,

} = await (supabase as any)

.from(
"pending_teacher_doubts"
)

.select("*")

.eq(
"student_uuid",
identity.studentUuid
)

.eq(
"status",
"NOT DISCUSSED"

);


if(error){

throw error;

}


if(!data){

return null;

}


/*
------------------------------------

TOTAL UNRESOLVED DOUBTS

------------------------------------
*/

const totalUnresolvedDoubts =

data.length;


/*
------------------------------------

TOPICS

------------------------------------
*/

const topics:string[] =

data.map(

(item:any)=>

item.previous_topic_name

);


/*
------------------------------------

HIGHEST RISK TOPIC

------------------------------------
*/

const highestRiskTopic =

getHighestRiskTopic(
topics
);


/*
------------------------------------

ATTENTION LEVEL

------------------------------------
*/

const attentionLevel =

getAttentionLevel(
totalUnresolvedDoubts
);


return{

totalUnresolvedDoubts,

topics,

highestRiskTopic,

attentionLevel,

};

}

import {

useEffect,
useState,

} from "react";

import {

getStudentExamPreparationIntelligence,

}

from "../repository/StudentExamPreparationRepository";



export default function
StudentExamPreparation(){


const [

data,
setData,

] = useState<any>(null);


useEffect(()=>{

loadData();

},[]);



async function
loadData(){

const response =

await getStudentExamPreparationIntelligence();

setData(
response
);

}


return(

<div
className="rounded-3xl bg-white p-8 shadow-sm"
>

<h2
className="text-xl font-bold uppercase text-slate-800"
>
EXAM PREPARATION INTELLIGENCE
</h2>


<p
className="mt-2 text-slate-500"
>
Track unresolved classroom doubts and
prepare smarter for your upcoming exams.
</p>


<div
className="mt-6 overflow-x-auto"
>

<table
style={{

width:"100%",
borderCollapse:"collapse",

}}
>

<thead>

<tr>

<th
style={metricHeaderStyle}
>
METRICS
</th>

<th
style={studentHeaderStyle}
>
YOU
</th>

</tr>

</thead>


<tbody>


{renderRow(

"Total Unresolved Not Discussed Doubts",

String(

data?.totalUnresolvedDoubts ?? 0

)

)}



{renderRow(

"Topics With Unresolved Doubts",

data?.topics?.join(", ")

?? "-"

)}



{renderRow(

"Highest Risk Topic",

data?.highestRiskTopic ?? "-"

)}



{renderRow(

"Attention Level",

data?.attentionLevel ?? "-"

)}


</tbody>

</table>

</div>

</div>

);


}



function renderRow(

metric:string,
value:string,

){

return(

<tr>

<td
style={metricColumnStyle}
>
{metric}
</td>

<td
style={tableCellStyle}
>
{value}
</td>

</tr>

);

}



const metricHeaderStyle ={

padding:"12px",

background:"#F7F4F9",

color:"#041B4D",

fontWeight:700,

fontSize:"20px",

border:"1px solid #E5E7EB",

} as const;



const studentHeaderStyle ={

padding:"12px",

background:"#F9F4EA",

color:"#041B4D",

fontWeight:700,

fontSize:"20px",

border:"1px solid #E5E7EB",

} as const;



const metricColumnStyle ={

padding:"12px",

fontWeight:700,

border:"1px solid #E5E7EB",

color:"#0F172A",

width:"320px",

textAlign:"left",

} as const;



const tableCellStyle ={

padding:"12px",

border:"1px solid #E5E7EB",

textAlign:"center",

color:"#334155",

fontWeight:600,

lineHeight:1.6,

} as const;

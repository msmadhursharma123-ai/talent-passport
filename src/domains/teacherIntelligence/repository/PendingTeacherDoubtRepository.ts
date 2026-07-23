import { getSupabaseClient } from "../../../supabaseClient";


const TABLE_NAME =
"pending_teacher_doubts";


/* =======================================
GET ALL PENDING DOUBTS OF A STUDENT
======================================= */

export async function getPendingDoubtsByStudent(
studentUuid:string
){

const supabase =
getSupabaseClient();

if(!supabase){

return [];

}


const { data,error } =

await supabase

.from(TABLE_NAME)

.select("*")

.eq(
"student_uuid",
studentUuid
)

.eq(
"status",
"PENDING"
)

.order(
"created_at",
{
ascending:false,
}
);


if(error){

throw error;

}


return data ?? [];

}


/* =======================================
SUBMIT STUDENT RESPONSE
======================================= */

export async function
submitStudentPendingDoubtResponse(

pendingDoubtUuid:string,

studentResponse:string

){

const supabase =
getSupabaseClient();

if(!supabase){

throw new Error(
"Supabase not configured."
);

}


const updates:any = {

student_response:
studentResponse,

revision_checked_at:
new Date().toISOString(),

};


/*
----------------------------------
CONCEPT WAS REVISED
----------------------------------
*/

if(

studentResponse ===
"DISCUSSED"

){

updates.status =
"RESOLVED";

updates.doubt_resolved =
true;

}


/*
----------------------------------
CONCEPT WAS NOT REVISED
----------------------------------
*/

if(

studentResponse ===
"NOT DISCUSSED"

){

updates.status =
"PENDING";

updates.doubt_resolved =
false;

}


const { error } =

await supabase

.from(TABLE_NAME)

.update(
updates as never
)

.eq(
"id",
pendingDoubtUuid
);


if(error){

throw error;

}


return true;

}


/* =======================================
GET RESOLVED DOUBTS OF STUDENT
======================================= */

export async function getResolvedDoubtsByStudent(

studentUuid:string

){

const supabase =
getSupabaseClient();

if(!supabase){

return [];

}


const { data,error } =

await supabase

.from(TABLE_NAME)

.select("*")

.eq(
"student_uuid",
studentUuid
)

.eq(
"status",
"RESOLVED"
);


if(error){

throw error;

}


return data ?? [];

}


/* =======================================
GET PENDING DOUBTS OF A DAILY LOG
======================================= */

export async function
getPendingDoubtsByDailyLog(

dailyLogUuid:string

){

const supabase =
getSupabaseClient();

if(!supabase){

return [];

}


const { data,error } =

await supabase

.from(TABLE_NAME)

.select("*")

.eq(
"daily_log_uuid",
dailyLogUuid
)

.eq(
"status",
"PENDING"
);


if(error){

throw error;

}


return data ?? [];

}
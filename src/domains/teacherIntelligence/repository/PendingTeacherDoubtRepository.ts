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

const response =
String(studentResponse ?? "").trim().toUpperCase();

if(
response !== "DISCUSSED" &&
response !== "NOT DISCUSSED"
){

throw new Error(
"Unsupported Loop-2 response."
);

}

/*
----------------------------------
ATOMIC LOOP-2 -> LIVE SYNC
----------------------------------

The database function owns the complete resolution transaction. The existing
UI flow, response semantics, locks, queue refresh, and all canonical readers
remain unchanged. The function only receives the exact Loop-2 row already
being resolved; it never scans or rewrites unrelated doubts.
*/

const { data, error } =
await (supabase as any)
.rpc(
"tp_resolve_loop2_doubt_and_sync_live",
{
 p_pending_doubt_uuid: pendingDoubtUuid,
 p_student_response: response,
}
);

if(error){

throw error;

}

return data !== false;

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
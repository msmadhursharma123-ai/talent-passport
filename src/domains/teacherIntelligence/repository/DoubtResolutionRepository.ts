import { getSupabaseClient } from "../../../supabaseClient";

const TABLE_NAME = "daily_doubt_resolution";

/* =========================================================
CREATE PENDING DOUBT
========================================================= */

export async function createPendingDoubt(
  doubt: Record<string, unknown>
) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error(
      "Supabase not configured."
    );
  }

  const { error } = await supabase
    .from(TABLE_NAME)
    .insert(doubt as never);

  if (error) {
    throw error;
  }

  return true;
}

/* =========================================================
GET ALL PENDING DOUBTS OF A STUDENT
========================================================= */

export async function getPendingDoubtsByStudent(
  studentUuid: string
) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq(
      "student_uuid",
      studentUuid
    )
    .eq(
      "status",
      "PENDING"
    );

  if (error) {
    throw error;
  }

  return data ?? [];
}

/* =========================================================
MARK DOUBT AS RESOLVED
========================================================= */

export async function markDoubtResolved(
  id: string
) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error(
      "Supabase not configured."
    );
  }

  const { error } = await supabase
    .from(TABLE_NAME)
    .update({
      status: "RESOLVED",
    } as never)
    .eq("id", id);

  if (error) {
    throw error;
  }

  return true;
}

/* =========================================================
SUBMIT STUDENT RESPONSE
========================================================= */

export async function submitStudentDoubtResponse(
  id: string,
  response: string
) {

const supabase = getSupabaseClient();

if (!supabase) {
throw new Error(
"Supabase not configured."
);
}


const isResolved =

response === "DISCUSSED";


const { error } = await supabase
.from(TABLE_NAME)
.update({

student_response: response,

status:

isResolved
? "RESOLVED"
: "NOT DISCUSSED",

doubt_resolved:
isResolved,

revision_checked_at:
new Date().toISOString(),

} as never)
.eq("id", id);


if (error) {
throw error;
}

return true;

}

/* =========================================================
GET ALL PENDING DOUBTS BY DAILY LOG
========================================================= */

export async function getPendingDoubtsByDailyLog(
  dailyLogUuid: string
) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
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

  if (error) {
    throw error;
  }

  return data ?? [];
}

/* =========================================================
GET ALL RESOLVED DOUBTS OF A STUDENT
========================================================= */

export async function getResolvedDoubtsByStudent(
  studentUuid: string
) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
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

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function updatePendingTeacherDoubt(
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


if(

studentResponse ===
"DISCUSSED"

){

updates.status =
"RESOLVED";

updates.doubt_resolved =
true;

}


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

.from(
"pending_teacher_doubts"
)

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

}
import { getSupabaseClient }
from "../supabaseClient";

export async function createStudent(
  student: any
) {
  const supabase =
    getSupabaseClient();

  if (!supabase) return null;

  const { data, error } =
    await (supabase as any)
      .from("students")
      .insert([student])
      .select()
      .single();

  if (error) {
  console.error(
    "CREATE STUDENT ERROR",
    error
  );

  alert(
    JSON.stringify(error)
  );

  return null;
}

  return data;
}

export async function findStudentByEmail(
  email: string
) {
  const supabase =
    getSupabaseClient();

  if (!supabase) return null;

  const { data, error } =
    await (supabase as any)
      .from("students")
      .select("*")
      .eq(
        "parent_email",
        email
      )
      .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getLatestAssessment(
  studentId: string
) {
  const supabase =
    getSupabaseClient();

  if (!supabase) return null;

  const { data, error } =
    await (supabase as any)
     .from(
  "student_assessments"
)
      .select("*")
      .eq(
        "student_id",
        studentId
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      )
      .limit(1)
      .single();

  if (error) {
    return null;
  }

  return data;
}
export async function saveAssessment(
  studentId: string,
  answers: any,
  scores: any,
  passport: any
) {
  const supabase =
    getSupabaseClient();

  if (!supabase) return null;

  const { data, error } =
    await (supabase as any)
      .from("student_assessments")
      .insert([
        {
          student_id: studentId,
          answers,
          scores,
          passport,
        },
      ])
      .select()
      .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}
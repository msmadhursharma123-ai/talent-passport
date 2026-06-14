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
export async function getTimelineAchievements(
  studentId: string
) {
  const supabase =
    getSupabaseClient();

  if (!supabase) return [];

  const { data, error } =
    await (supabase as any)
      .from(
        "student_timeline_achievements"
      )
      .select("*")
      .eq(
        "student_id",
        studentId
      )
      .order(
        "achievement_year",
        {
          ascending: true
        }
      );

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}

export async function saveTimelineAchievement(
  achievement: any
) {
  const supabase =
    getSupabaseClient();

  if (!supabase) return null;

  const { data, error } =
    await (supabase as any)
      .from(
        "student_timeline_achievements"
      )
      .insert([achievement])
      .select()
      .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function getStudentPerformances(
  studentId: string
) {
  const supabase =
    getSupabaseClient();

  if (!supabase) return [];

  const { data, error } =
    await (supabase as any)
      .from("student_performances")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", {
        ascending: false
      });

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}

export async function createPerformance(
  performance: any
) {
  const supabase =
    getSupabaseClient();

  if (!supabase) return null;

  const { data, error } =
    await (supabase as any)
      .from("student_performances")
      .insert([performance])
      .select()
      .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function getStudentProjects(
  studentId: string
) {
  const supabase =
    getSupabaseClient();

  if (!supabase) return [];

  const { data, error } =
    await (supabase as any)
      .from("student_projects")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", {
        ascending: false
      });

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}

export async function createProject(
  project: any
) {
  const supabase =
    getSupabaseClient();

  if (!supabase) return null;

  const { data, error } =
    await (supabase as any)
      .from("student_projects")
      .insert([project])
      .select()
      .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function getStudentSkills(
  studentId: string
) {
  const supabase =
    getSupabaseClient();

  if (!supabase) return [];

  const { data, error } =
    await (supabase as any)
      .from("student_skills")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", {
        ascending: false
      });

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}

export async function createSkill(
  skill: any
) {
  const supabase =
    getSupabaseClient();

  if (!supabase) return null;

  const { data, error } =
    await (supabase as any)
      .from("student_skills")
      .insert([skill])
      .select()
      .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function uploadPerformanceVideo(
  file: File
) {
  const supabase =
    getSupabaseClient();

  if (!supabase) return "";

  const fileName =
    `${Date.now()}-${file.name}`;

  const { error } =
    await supabase.storage
      .from(
        "performance_videos"
      )
      .upload(
  fileName,
  file,
  {
    upsert: true
  }
)

  if (error) {
    console.error(
      "VIDEO UPLOAD ERROR",
      error
    );

    return "";
  }

  const { data } =
    supabase.storage
      .from(
        "performance_videos"
      )
      .getPublicUrl(
        fileName
      );

  return data.publicUrl;
}
export async function createPerformanceOtp(
  studentId: string,
  otpCode: string
) {
  const supabase =
    getSupabaseClient();

  if (!supabase) return null;

  const { data, error } =
    await (supabase as any)
      .from("performance_otps")
      .insert([
        {
          student_id: studentId,
          otp_code: otpCode,
          is_used: false
        }
      ])
      .select()
      .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}
export async function verifyPerformanceOtp(
  studentId: string,
  otpCode: string
) {
  const supabase =
    getSupabaseClient();

  if (!supabase) return false;

  const { data } =
    await (supabase as any)
      .from("performance_otps")
      .select("*")
      .eq("student_id", studentId)
      .eq("otp_code", otpCode)
      .eq("is_used", false)
      .single();

  if (!data) return false;

  await (supabase as any)
    .from("performance_otps")
    .update({
      is_used: true
    })
    .eq("id", data.id);

  await (supabase as any)
    .from("student_performances")
    .update({
      parent_verified: true
    })
    .eq(
      "student_id",
      studentId
    );

  return true;
}



export async function markPerformanceVerified(
  performanceId: string
) {
  const supabase =
    getSupabaseClient();

  if (!supabase) return;

  await (supabase as any)
    .from("student_performances")
    .update({
      parent_verified: true,
      otp_verified_at:
        new Date()
          .toISOString()
    })
    .eq("id", performanceId);
}
import { getSupabaseClient }
from "../supabaseClient";

export async function createStudent(
  student: any
) {
  const supabase =
    getSupabaseClient();

  if (!supabase) return null;

 const studentEmail =
  student.parent_email || "";

const generatedStudentId =
  studentEmail
    .toLowerCase()
    .replace("@", "_")
    .replace(/\./g, "_");

const payload = {
  ...student,
  student_email: studentEmail,
  student_id: generatedStudentId
};

const { data, error } =
  await (supabase as any)
    .from("students")
    .insert([payload])
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

export async function findStudentMasterByEmail(
  email: string
) {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const studentId =
    email
      .toLowerCase()
      .replace("@", "_")
      .replace(/\./g, "_");

  const {
    data,
    error
  } =
    await (supabase as any)
      .from("students_master")
      .select("*")
      .eq(
        "student_id",
        studentId
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

export async function saveStudentDNA(
  studentProfile: any,
  answers: any,
  scores: any
) {

  const supabase =
    getSupabaseClient();

  if (!supabase) return null;

  const communication =
    scores.communication || 0;

  const leadership =
    scores.leadership || 0;

  const confidence =
    scores.confidence || 0;

  const collaboration =
    scores.collaboration || 0;

  const criticalThinking =
    scores.criticalThinking || 0;

  const creativity =
    scores.creativity || 0;

  const dnaIndex =
    Math.round(
      (
        communication +
        leadership +
        confidence +
        collaboration +
        criticalThinking +
        creativity
      ) / 6
    );

  const strengths = [];

  if (communication >= 70)
    strengths.push("Communication");

  if (leadership >= 70)
    strengths.push("Leadership");

  if (confidence >= 70)
    strengths.push("Confidence");

  if (collaboration >= 70)
    strengths.push("Collaboration");

  if (criticalThinking >= 70)
    strengths.push("Critical Thinking");

  if (creativity >= 70)
    strengths.push("Creativity");

  const growthAreas = [];

  if (communication < 60)
    growthAreas.push("Communication");

  if (leadership < 60)
    growthAreas.push("Leadership");

  if (confidence < 60)
    growthAreas.push("Confidence");

  if (collaboration < 60)
    growthAreas.push("Collaboration");

  if (criticalThinking < 60)
    growthAreas.push("Critical Thinking");

  if (creativity < 60)
    growthAreas.push("Creativity");

  const payload = {

    student_id:
      studentProfile.id,

    student_name:
      studentProfile.student_name,

    student_email:
      studentProfile.parent_email,

    school_name:
      studentProfile.school_name,

    class_name:
      studentProfile.class_name,

    dna_index:
      dnaIndex,

    participation:
      0,

    reliability:
      0,

    communication_score:
      communication,

    leadership_score:
      leadership,

    confidence_score:
      confidence,

    collaboration_score:
      collaboration,

    critical_thinking_score:
      criticalThinking,

    creativity_score:
      creativity,

    strengths,

    growth_areas:
      growthAreas,

    answers
  };

  const { data, error } =
    await (supabase as any)
      .from(
        "student_dna_profiles"
      )
      .upsert([payload])
      .select()
      .single();

  if (error) {
    console.error(
      "DNA SAVE ERROR",
      error
    );
    return null;
  }

  console.log(
    "DNA PROFILE SAVED",
    data
  );

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

  console.log(
    "PROJECT INSERT RESULT",
    data
  );

  console.log(
    "PROJECT INSERT ERROR",
    error
  );

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function deleteProject(
  projectId: string
) {
  const supabase =
    getSupabaseClient();

  if (!supabase) return;

  const { error } =
    await (supabase as any)
      .from("student_projects")
      .delete()
      .eq("id", projectId);

  if (error) {
    console.error(error);
    throw error;
  }
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
  performanceId: string,
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
  performance_id: performanceId,
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
  performanceId: string,
  otpCode: string
) {
  const supabase =
    getSupabaseClient();

  if (!supabase) return false;

  const { data } =
    await (supabase as any)
      .from("performance_otps")
      .select("*")
      .eq("performance_id", performanceId)
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
  .eq("id", performanceId);

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
export async function deletePerformance(
  performanceId: string
) {
  const supabase =
    getSupabaseClient();

  if (!supabase) return false;

  const { error } =
    await (supabase as any)
      .from("student_performances")
      .delete()
      .eq("id", performanceId);

  if (error) {
    console.error(error);
    return false;
  }

  return true;
}

export async function updatePerformance(
  performanceId: string,
  updates: any
) {
  const supabase =
    getSupabaseClient();

  if (!supabase) return false;

  const { error } =
    await (supabase as any)
      .from("student_performances")
      .update(updates)
      .eq("id", performanceId);

  if (error) {
    console.error(error);
    return false;
  }

  return true;
}

export async function uploadProjectVideo(
  file: File
) {
  const supabase =
    getSupabaseClient();

  if (!supabase) return "";

  const fileName =
    `${Date.now()}-${file.name}`;

  const { error } =
    await supabase.storage
      .from("project_certificates")
      .upload(
        fileName,
        file,
        {
          upsert: true
        }
      );

  if (error) {
    console.error(error);
    return "";
  }

  const { data } =
    supabase.storage
      .from("project_certificates")
      .getPublicUrl(
        fileName
      );

  return data.publicUrl;
}

export async function uploadSkillCertificate(
  file: File
) {
  const supabase =
    getSupabaseClient();

  if (!supabase) return "";

  const fileName =
    `${Date.now()}-${file.name}`;

  const { error } =
    await supabase.storage
      .from("skill_certificates")
      .upload(
        fileName,
        file,
        {
          upsert: true
        }
      );

  if (error) {
    console.error(error);
    return "";
  }

  const { data } =
    supabase.storage
      .from("skill_certificates")
      .getPublicUrl(
        fileName
      );

  return data.publicUrl;
}
export async function deleteSkill(
  skillId: string
) {
  const supabase =
    getSupabaseClient();

  if (!supabase) return;

  const { error } =
    await (supabase as any)
      .from("student_skills")
      .delete()
      .eq("id", skillId);

  if (error) {
    console.error(error);
    throw error;
  }
}

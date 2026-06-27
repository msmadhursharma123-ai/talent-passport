import { getSupabaseClient }
from "../supabaseClient";

import {
  buildIdentity,
  saveStudentIdentity,
  requireIdentity,
  getTableIdentity
} from "../services/identityService";

/* ============================================================
   REPOSITORY IDENTITY HELPERS
============================================================ */

function currentStudentUuid(): string {
    return getTableIdentity("students");
}

function currentStudentCode(): string {
    return getTableIdentity("talent_passport_scores");
}

function currentMasterStudentId(): string {
    return getTableIdentity("students_master");
}

function currentIdentity() {
    return requireIdentity();
}

export async function createStudent(
  student: any
) {

  const supabase =
    getSupabaseClient();

  if (!supabase) return null;

const studentEmail =
  student.parent_email || "";

const studentCode =
  studentEmail
    .trim()
    .toLowerCase()
    .replace("@", "_")
    .replace(/\./g, "_");

  const payload = {

    ...student,

    student_email:
      studentEmail,

   student_id:
studentCode

  };

  /* ============================================================
     CREATE STUDENT
  ============================================================ */

  const {

    data: studentRow,

    error: studentError

  } = await (supabase as any)

    .from("students")

    .insert([payload])

    .select()

    .single();

  if (studentError) {

    console.error(studentError);

    return null;

  }

  /* ============================================================
     CREATE / UPDATE STUDENT MASTER
  ============================================================ */

  const {

    data: masterRow,

    error: masterError

  } = await (supabase as any)

    .from("students_master")

    .upsert({

      student_id:
studentCode,

      student_name:
        student.student_name,

      student_email:
        student.parent_email,

      school_name:
        student.school_name,

      class_name:
        student.class_name,

      phone:
        student.parent_mobile,

      student_age:
        student.student_age,

      gender:
        student.gender,

      favourite_activity:
        student.favourite_activity,

      residence_city:
        student.residence_city,

      residence_area:
        student.residence_area

    })

    .select()

    .single();

  if (masterError) {

    console.error(masterError);

    return null;

  }

  /* ============================================================
     RETURN COMPLETE IDENTITY
  ============================================================ */

  const identity = buildIdentity({

    authUserId: studentRow.id,

    studentUuid: studentRow.id,

    masterStudentId: masterRow.id,

    studentCode,

    studentName: masterRow.student_name,

    schoolName: masterRow.school_name,

    className: masterRow.class_name,

    parentEmail: masterRow.student_email,

    parentPhone: masterRow.phone,

    email: studentRow.student_email

});

saveStudentIdentity(identity);

return identity;
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

  const { data, error } =
    await (supabase as any)
      .from("students_master")
      .select("*")
      .eq(
        "student_email",
        email
      )
      .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getLatestAssessment() {

  const supabase =
    getSupabaseClient();

  if (!supabase)
    return null;

  const studentUuid =
    currentStudentUuid();

  const { data, error } =
    await (supabase as any)
      .from(
        "student_assessments"
      )
      .select("*")
      .eq(
        "student_id",
        studentUuid
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      )
      .limit(1)
      .single();

  if (error)
    return null;

  return data;

}


export async function saveAssessment(

  answers: any,

  scores: any,

  passport: any

) {

  const supabase =
    getSupabaseClient();

  if (!supabase)
    return null;

  const studentUuid =
    currentStudentUuid();

  const { data, error } =
    await (supabase as any)

      .from("student_assessments")

      .insert([
        {
          student_id:
            studentUuid,

          answers,

          scores,

          passport
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

export async function saveStudentDNA(

  answers: any,

  scores: any

) {

  const supabase =
    getSupabaseClient();

  if (!supabase)
    return null;

  const identity =
    requireIdentity();

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

  const strengths: string[] = [];

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

  const growthAreas: string[] = [];

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
      currentStudentUuid(),

    student_name:
      identity.studentName,

    student_email:
  identity.email,

    school_name:
      identity.schoolName,

    class_name:
      identity.className,

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

      .upsert([
        payload
      ])

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

export async function getTimelineAchievements() {

  const supabase =
    getSupabaseClient();

  if (!supabase) return [];

  const studentUuid =
    currentStudentUuid();

  const { data, error } =
    await (supabase as any)
      .from(
        "student_timeline_achievements"
      )
      .select("*")
      .eq(
        "student_id",
        studentUuid
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

  if (!supabase)
    return null;

  const payload = {

    ...achievement,

    student_id:
      currentStudentUuid()

  };

  const { data, error } =

    await (supabase as any)

      .from(
        "student_timeline_achievements"
      )

      .insert([
        payload
      ])

      .select()

      .single();

  if (error) {

    console.error(error);

    return null;

  }

  return data;

}

export async function getStudentPerformances() {

  const supabase =
    getSupabaseClient();

  if (!supabase) return [];

  const studentUuid =
    currentStudentUuid();

  const { data, error } =
    await (supabase as any)
      .from("student_performances")
      .select("*")
      .eq(
        "student_id",
        studentUuid
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );

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

  const payload = {

    ...performance,

    student_id:
      currentStudentUuid()

  };

  const { data, error } =
    await (supabase as any)
      .from(
        "student_performances"
      )
      .insert([payload])
      .select()
      .single();

  if (error) {

    console.error(error);

    return null;

  }

  return data;

}

export async function getStudentProjects() {

  const supabase =
    getSupabaseClient();

  if (!supabase) return [];

  const studentUuid =
    currentStudentUuid();

  const { data, error } =
    await (supabase as any)
      .from(
        "student_projects"
      )
      .select("*")
      .eq(
        "student_id",
        studentUuid
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );

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

  const payload = {

    ...project,

    student_id:
      currentStudentUuid()

  };

  const { data, error } =
    await (supabase as any)
      .from(
        "student_projects"
      )
      .insert([payload])
      .select()
      .single();

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

export async function getStudentSkills() {

  const supabase =
    getSupabaseClient();

  if (!supabase) return [];

  const studentUuid =
    currentStudentUuid();

  const { data, error } =
    await (supabase as any)
      .from(
        "student_skills"
      )
      .select("*")
      .eq(
        "student_id",
        studentUuid
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );

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

  const payload = {

    ...skill,

    student_id:
      currentStudentUuid()

  };

  const { data, error } =
    await (supabase as any)
      .from(
        "student_skills"
      )
      .insert([payload])
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

  otpCode: string

) {

  const supabase =
    getSupabaseClient();

  if (!supabase)
    return null;

  const studentUuid =
    currentStudentUuid();

  const { data, error } =

    await (supabase as any)

      .from("performance_otps")

      .insert([
        {
          performance_id:
            performanceId,

          student_id:
            studentUuid,

          otp_code:
            otpCode,

          is_used:
            false
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

/* ============================================================
   STUDENT COMPETITION COUNT

   Returns the number of competition submissions
   for the currently authenticated student.

============================================================ */

export async function getStudentCompetitionCount(): Promise<number> {

  const supabase =
    getSupabaseClient();

  if (!supabase)
    return 0;

  const masterStudentId =
    currentMasterStudentId();

  const {
    count,
    error
  } = await (supabase as any)

    .from(
      "submissions"
    )

    .select(
      "*",
      {
        count: "exact",
        head: true
      }
    )

    .eq(
      "student_id",
      masterStudentId
    );

  if (error) {

    console.error(
      error
    );

    return 0;

  }

  return count ?? 0;

}
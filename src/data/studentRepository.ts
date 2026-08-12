import { getSupabaseClient }
from "../supabaseClient";

import {
  buildIdentity,
  saveStudentIdentity,
  requireIdentity,
  getTableIdentity
} from "../services/identityService";

import {
  isStudentRollAuthorizedForSchool
} from "./schoolStudentAllowlistRepository";

function normalizeClassName(
  className: string
) {
  return String(className)
    .trim()
    .split(" ")[0];
}

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
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const studentEmail = String(student.parent_email ?? "").trim();
  const parentPhone = String(
    student.parent_phone ??
    student.parent_mobile ??
    ""
  ).trim();
  const studentMobile = String(
    student.student_mobile ??
    ""
  ).trim();

  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError) {
    console.error("STUDENT PROFILE AUTH LOOKUP ERROR:", authError);
    throw new Error(
      authError.message || "Unable to resolve the authenticated student account."
    );
  }

  const authUserId = authData.user?.id ?? null;

  if (!authUserId) {
    throw new Error(
      "No authenticated student account was found. Please log in again."
    );
  }

  /*
   * The roll number is the School Admin controlled authorization key.
   * It is checked again here, after Auth creation and immediately before
   * profile persistence. This is intentionally kept in the repository so
   * the profile cannot be created by bypassing the registration screen.
   */
  const selectedSchoolUuid = String(
    student.school_uuid ?? ""
  ).trim();

  const normalizedRollNumber = String(
    student.roll_number ?? ""
  ).trim().toUpperCase();

  if (!normalizedRollNumber) {
    throw new Error(
      "A school-approved roll number is required."
    );
  }

  if (!selectedSchoolUuid) {
    throw new Error(
      "The school assigned to this student could not be resolved."
    );
  }

  const authorizedForSchool =
    await isStudentRollAuthorizedForSchool(
      normalizedRollNumber,
      selectedSchoolUuid
    );

  if (!authorizedForSchool) {
    throw new Error(
      "This student roll number is not authorized for the selected school."
    );
  }

  if (!studentMobile) {
    throw new Error(
      "Student mobile number is required."
    );
  }

  if (!parentPhone) {
    throw new Error(
      "Parent mobile number is required for parental verification."
    );
  }

  /*
   * Keep the existing student-code convention unchanged.
   */
  const studentCode = studentEmail
    .toLowerCase()
    .replace("@", "_")
    .replace(/\./g, "_");

  /*
   * IMPORTANT DATABASE BOUNDARY
   * ---------------------------
   * school_uuid and roll_number are not sent to the legacy `students`
   * insert unless they are actual columns there. The canonical school /
   * roll identity is persisted in students_master below.
   *
   * The new contact fields ARE sent to `students`, because the current
   * mobile/parent migration added student_mobile and parent_phone there.
   */
  const {
    school_uuid: _schoolUuid,
    roll_number: _rollNumber,
    ...legacyStudentFields
  } = student;

  const payload = {
    ...legacyStudentFields,

    student_email: studentEmail,
    student_id: studentCode,

    /*
     * Explicit contact separation introduced by the parent-OTP migration.
     * Keep parent_phone populated for the parent-consent flow.
     */
    student_mobile: studentMobile,
    parent_phone: parentPhone
  };

  console.log(
    "STUDENT PROFILE PAYLOAD:",
    JSON.stringify(
      {
        ...payload,
        parent_phone: parentPhone ? "[provided]" : null,
        student_mobile: studentMobile ? "[provided]" : null
      },
      null,
      2
    )
  );

  /*
   * ============================================================
   * CREATE / RESUME STUDENT
   * ============================================================
   *
   * If a previous onboarding attempt already inserted the `students`
   * row for this same Auth account, UPDATE that row instead of creating
   * a duplicate. This makes the flow safe to retry after an interrupted
   * profile creation without changing the existing onboarding model.
   */
  let studentRow: any = null;
  let studentError: any = null;

  const { data: existingStudent, error: existingStudentError } =
    await (supabase as any)
      .from("students")
      .select("*")
      .eq("id", authUserId)
      .maybeSingle();

  if (existingStudentError) {
    console.error(
      "STUDENT EXISTING-ROW LOOKUP ERROR:",
      existingStudentError
    );
    throw new Error(
      existingStudentError.message ||
      "Unable to check the existing student profile."
    );
  }

  if (existingStudent) {
    const result = await (supabase as any)
      .from("students")
      .update(payload)
      .eq("id", authUserId)
      .select()
      .single();

    studentRow = result.data;
    studentError = result.error;
  } else {
    const result = await (supabase as any)
      .from("students")
      .insert([payload])
      .select()
      .single();

    studentRow = result.data;
    studentError = result.error;
  }

  if (studentError) {
    console.error(
      "STUDENT INSERT / UPDATE ERROR:",
      studentError
    );

    throw new Error(
      studentError.message ||
      "Unable to save the student profile."
    );
  }

  if (!studentRow?.student_uuid) {
    console.error(
      "STUDENT PROFILE SAVED WITHOUT STUDENT UUID:",
      studentRow
    );

    throw new Error(
      "Student profile was saved but its canonical identity UUID was not returned."
    );
  }

  console.log("STUDENT PROFILE SAVE SUCCESS:", studentRow);

  /*
   * ============================================================
   * CREATE / UPDATE STUDENT MASTER
   * ============================================================
   *
   * student_uuid is the canonical unique identity key for students_master.
   * Using it as the conflict target makes retries update the same profile
   * instead of creating duplicate master rows.
   *
   * IMPORTANT CONTACT COMPATIBILITY:
   * - student_mobile = student's own mobile
   * - parent_phone   = canonical parent mobile for OTP
   * - phone          = legacy parent-mobile value retained for existing
   *                    marketplace / consultation consumers that still read
   *                    the historical phone field.
   */
  const masterPayload = {
    student_id: studentCode,

    auth_user_id: authUserId,

    student_uuid: studentRow.student_uuid,

    student_name:
      student.student_name,

    student_email:
      studentEmail,

    school_uuid:
      selectedSchoolUuid,

    school_name:
      student.school_name,

    roll_number:
      normalizedRollNumber,

    class_name:
      normalizeClassName(
        student.class_name
      ),

    student_mobile:
      studentMobile,

    /*
     * Legacy compatibility: do NOT erase the parent number from `phone`.
     * The canonical parent field is parent_phone.
     */
    phone:
      parentPhone,

    parent_phone:
      parentPhone,

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
  };

  console.log(
    "STUDENT MASTER PAYLOAD:",
    JSON.stringify(
      {
        ...masterPayload,
        phone: parentPhone ? "[provided]" : null,
        parent_phone: parentPhone ? "[provided]" : null,
        student_mobile: studentMobile ? "[provided]" : null
      },
      null,
      2
    )
  );

  const {
    data: masterRow,
    error: masterError
  } = await (supabase as any)
    .from("students_master")
    .upsert(
      masterPayload,
      {
        onConflict: "student_uuid"
      }
    )
    .select()
    .single();

  if (masterError) {
    console.error(
      "STUDENT MASTER UPSERT ERROR:",
      masterError
    );

    throw new Error(
      masterError.message ||
      "Unable to save the student master profile."
    );
  }

  if (!masterRow?.id) {
    console.error(
      "STUDENT MASTER SAVE RETURNED NO ROW:",
      masterRow
    );

    throw new Error(
      "Student master profile was saved but could not be resolved."
    );
  }

  console.log(
    "STUDENT MASTER SAVE SUCCESS:",
    masterRow
  );

  /*
   * ============================================================
   * RETURN COMPLETE IDENTITY
   * ============================================================
   *
   * parentPhone is deliberately resolved from parent_phone first and
   * phone second. This is the value consumed by:
   * - parental consent OTP
   * - marketplace parent actions
   * - consultation verification
   * - future parent-protected actions
   */
  const identity = buildIdentity({
    authUserId,

    studentUuid:
      studentRow.student_uuid,

    masterStudentId:
      masterRow.id,

    studentCode,

    studentName:
      masterRow.student_name,

    schoolName:
      masterRow.school_name,

    schoolUuid:
      masterRow.school_uuid ?? selectedSchoolUuid,

    className:
      masterRow.class_name,

    parentEmail:
      masterRow.student_email,

    parentPhone:
      masterRow.parent_phone ??
      masterRow.phone,

    studentPhone:
      masterRow.student_mobile ??
      studentRow.student_mobile,

    email:
      studentRow.student_email
  });

  console.log("IDENTITY CREATED");

  console.table({
    authUserId: identity.authUserId,
    studentCode: identity.studentCode,
    masterStudentId: identity.masterStudentId,
    studentUuid: identity.studentUuid,
    parentPhone: identity.parentPhone ? "[provided]" : "[missing]",
    studentPhone: identity.studentPhone ? "[provided]" : "[missing]"
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

  /*
     TalentScores uses capitalized keys:
     Communication, Leadership, Confidence,
     Collaboration, CriticalThinking, Creativity.

     Lowercase fallbacks are retained only for compatibility
     with any older caller that may still send the legacy shape.
  */

  const communication =
    Number(
      scores?.Communication ??
      scores?.communication ??
      0
    );

  const leadership =
    Number(
      scores?.Leadership ??
      scores?.leadership ??
      0
    );

  const confidence =
    Number(
      scores?.Confidence ??
      scores?.confidence ??
      0
    );

  const collaboration =
    Number(
      scores?.Collaboration ??
      scores?.collaboration ??
      0
    );

  const criticalThinking =
    Number(
      scores?.CriticalThinking ??
      scores?.criticalThinking ??
      0
    );

  const creativity =
    Number(
      scores?.Creativity ??
      scores?.creativity ??
      0
    );

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
      identity.parentEmail ??
      identity.email,

    school_name:
      identity.schoolName ?? "",

    class_name:
      identity.className ?? "",

    dna_index:
      dnaIndex,

    participation_index:
      0,

    reliability:
      100,

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

      .upsert(
        [
          payload
        ],
        {
          onConflict: "student_id"
        }
      )

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
      .from("student_projects")
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

  const studentCode =
  currentStudentCode();

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
  studentCode
);

  if (error) {

    console.error(
      error
    );

    return 0;

  }

  return count ?? 0;

}

export async function updateStudentSection(
  sectionName: string
) {

  const supabase =
    getSupabaseClient();

  if (!supabase)
    return;

  const studentUuid =
    currentStudentUuid();

  const { error } =
    await (supabase as any)

      .from("students_master")

      .update({

        section_name:
          sectionName

      })

      .eq(
        "student_uuid",
        studentUuid
      );

  if (error) {

    console.error(
      "SECTION SAVE ERROR",
      error
    );

  }

}

export async function doesStudentProfileExist(
  authUserId: string
) {

  const supabase = getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { data } = await (supabase as any)
    .from("students_master")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  return !!data;

}


export async function isQuestionnaireCompleted(
  studentUuid: string
) {

  const supabase = getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { data } = await (supabase as any)
    .from("student_assessments")
    .select("id")
    .eq("student_id", studentUuid)
    .maybeSingle();

  return !!data;

}
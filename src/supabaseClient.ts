/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  requireIdentity,
  getStudentUuid
} from "./services/identityService";

import { createClient } from '@supabase/supabase-js';
import { Submission } from './types';
import { requestCompetitionEvaluation } from "./services/competitionEvaluationEngine";

const supabaseUrl = ((import.meta as any).env?.VITE_SUPABASE_URL as string) || '';

const supabaseAnonKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || '';

console.log("SUPABASE URL =", supabaseUrl);
console.log("ANON KEY =", supabaseAnonKey.substring(0,30));
/**
 * Checks if the user has configured custom Supabase credentials.
 */
export const isSupabaseConfigured = (): boolean => {
  return (
    !!supabaseUrl &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseUrl.trim() !== '' &&
    !!supabaseAnonKey &&
    supabaseAnonKey !== 'your-anon-key' &&
    supabaseAnonKey.trim() !== ''
  );
};

let supabaseInstance: ReturnType<typeof createClient> | null = null;

console.log(
  "SUPABASE URL =",
  import.meta.env.VITE_SUPABASE_URL
);

console.log(
  "SUPABASE KEY =",
  import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0,25)
);

export const getSupabaseClient = () => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
};

/**
 * Saves a contest submission.
 * If credentials are missing, falls back to client-side localStorage simulation.
 */
export const submitCompetitionEntry = async (
  entry: {
    pathway: string;
    eventName: string;
    description: string;
  },
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ success: boolean; data?: Submission; error?: string; isMock: boolean }> => {
  try {

    const identity =
  requireIdentity();

const studentCode =
  identity.studentCode;

    const isMock = !isSupabaseConfigured();

    if (isMock) {
      // Offline/Local Storage simulation mode
      // Generate a beautiful mock video url (blob URL or mock asset url)
      const mockBlobUrl = URL.createObjectURL(file);
      
      const newSubmission: Submission = {
        id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
      student_name:
    identity.studentName,

student_email:
identity.parentEmail ?? "",
        pathway: entry.pathway as any,
        event_name: entry.eventName,
        video_url: mockBlobUrl,
        description: entry.description,
        video_name: file.name,
        video_size: file.size,
      };

      // Keep in mock log
      const existing = getLocalSubmissions();
      existing.unshift(newSubmission);
      localStorage.setItem('competition_submissions_mock', JSON.stringify(existing));

      // Simulate a small upload lag
      for (let i = 10; i <= 100; i += 30) {
        if (onProgress) onProgress(Math.min(i, 100));
        await new Promise((r) => setTimeout(r, 150));
      }

      return { success: true, data: newSubmission, isMock: true };
    }

    // Live Supabase Mode
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client failed to initialize despite true configuration check.');
    }

    if (onProgress) onProgress(10);

    // 1. Upload Video file to storage
    const fileExt = file.name.split('.').pop() || 'mp4';
    const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
    // Store in flat format or structure
    const filePath = `${cleanFileName}`;

    if (onProgress) onProgress(30);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('submissions')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase Storage error details:', uploadError);
      throw new Error(`Storage upload failed: ${uploadError.message}. Make sure the bucket 'submissions' is created and has suitable policies.`);
    }

    if (onProgress) onProgress(65);

    // 2. Resolve public URL
    const { data: publicUrlData } = supabase.storage
      .from('submissions')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData?.publicUrl;
    if (!publicUrl) {
      throw new Error('Could not retrieve public URL for uploaded video file.');
    }

    if (onProgress) onProgress(80);

    // 3. Save submission metadata in submissions table
const { data, error: insertError } = await (supabase as any)
  .from("submissions")
  .insert([
    {
      student_id: studentCode,

      student_name: identity.studentName,

      student_email: identity.parentEmail ?? "",

      class_name: identity.className,

      school_name: identity.schoolName,

      pathway: entry.pathway,
      event_name: entry.eventName,
      video_url: publicUrl,
      description: entry.description,
      video_name: file.name,
      video_size: file.size,
      transcript: entry.description,
    }
  ])
  .select();
  

    if (insertError) {
      console.error('Supabase Table insert error:', insertError);
      throw new Error(`Database record insert failed: ${insertError.message}`);
    }

    if (onProgress) onProgress(100);
    
await (supabase as any)
  .from("students_master")
  .upsert({
   student_id:
    getStudentUuid(),

student_name:
    identity.studentName,

student_email:
identity.parentEmail ?? "",

school_name:
    identity.schoolName,

class_name:
    identity.className,
  });
  const { data: existingEvents } = await (supabase as any)
  .from("student_events")
  .select("*")
  .eq("student_id", getStudentUuid());

if (!existingEvents || existingEvents.length === 0) {
  const mandatoryEvents = [
    {
      pathway: "Communication",
      event_name: "Communication"
    },
    {
      pathway: "Creative Expression",
      event_name: "Creativity"
    },
    {
      pathway: "Problem Solving",
      event_name: "Critical Thinking"
    },
    {
      pathway: "Teamwork",
      event_name: "Team Event"
    }
  ];

  for (const event of mandatoryEvents) {
    await (supabase as any)
      .from("student_events")
      .insert({
        student_id: getStudentUuid(),
        pathway: event.pathway,
        event_name: event.event_name,
        status: "Pending"
      });
  }
}
// Update student event status

const updateResult = await (supabase as any)
  .from("student_events")
  .update({
    status: "Completed",
    submission_id: data?.[0]?.id
  })
  .eq("student_id", getStudentUuid())
  .eq("pathway", entry.pathway);

console.log("UPDATE RESULT");
console.log(updateResult);

console.log("ENTRY PATHWAY");
console.log(entry.pathway);
console.log("EVENT NAME");
console.log(entry.eventName);
const { data: completedEvents } = await supabase
  .from("student_events")
  .select("*")
  .eq("student_id", getStudentUuid())
  .eq("status", "Completed");

if (completedEvents?.length === 4) {

  console.log("ALL EVENTS COMPLETED");

  await (supabase as any)
    .from("talent_passports_v2")
    .upsert([{
      student_id: getStudentUuid(),
      communication_score: 0,
      creativity_score: 0,
      critical_thinking_score: 0,
      team_score: 0,
      combined_score: 0,
      final_feedback: "Awaiting Evaluation"
    }]);
}

const firstRow = data?.[0] as any;

if (!firstRow) {
  throw new Error(
    "Inserted data could not be returned from database."
  );
}

const insertedData: Submission = {
  id: firstRow.id,
  created_at: firstRow.created_at,
  student_name: firstRow.student_name,
  student_email: firstRow.student_email,
  pathway: firstRow.pathway,
  event_name: firstRow.event_name,
  video_url: firstRow.video_url,
  description: firstRow.description,
  video_name: firstRow.video_name,
  video_size: firstRow.video_size
};

return {
  success: true,
  data: insertedData,
  isMock: false
};
  } catch (error: any) {
    return { success: false, error: error?.message || 'Unknown network error', isMock: false };
  }
};

/**
 * Helper to fetch submissions.
 * Reads live Supabase backend if configured; otherwise reads local storage mock list.
 */
export const fetchAllSubmissions = async (): Promise<{ submissions: Submission[]; isMock: boolean; error?: string }> => {
  try {
    const isMock = !isSupabaseConfigured();
    if (isMock) {
      return { submissions: getLocalSubmissions(), isMock: true };
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { submissions: [], isMock: true };
    }


    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

const parsed: Submission[] = (data || []).map((row: any) => ({
  id: row.id,
  student_id: row.student_id,

  created_at: row.created_at,

  student_name: row.student_name,
  student_email: row.student_email,

  school_name: row.school_name,
  class_name: row.class_name,

  pathway: row.pathway,
  event_name: row.event_name,

  competition_name: row.competition_name,

  video_url: row.video_url,
  description: row.description,

  video_name: row.video_name || "video.mp4",
  video_size: row.video_size || 0,

  overall_score: row.overall_score,
  processing_status: row.processing_status,
}));

    return { submissions: parsed, isMock: false };
  }
  
  catch (err: any) {
    console.error('Error fetching submissions from Supabase:', err);
    return { 
      submissions: getLocalSubmissions(), 
      isMock: true, 
      error: `Could not retrieve from live Supabase: ${err.message}. Showing local backup.` 
    };
  }
};

/**
 * Accesses local items
 */
export const getLocalSubmissions = (): Submission[] => {
  const data = localStorage.getItem('competition_submissions_mock');
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

/**
 * Clears local items
 */
export const clearLocalSubmissions = () => {
  localStorage.removeItem('competition_submissions_mock');
};


export const deleteSubmission = async (id: string) => {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { error: "Supabase not configured" };
  }

  const { error } = await supabase
    .from("submissions")
    .delete()
    .eq("id", id);

  return { error };
  
};
export const evaluateSubmission = async (
  submissionId: string
) => {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      error: "Supabase not configured"
    };
  }

  try {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", submissionId)
      .single();

    if (error) throw error;

    const submission: any = data;

    const { data: existingEvaluation, error: existingEvaluationError } =
      await supabase
        .from("evaluations")
        .select("id")
        .eq("submission_id", submissionId)
        .limit(1);

    if (existingEvaluationError) {
      throw existingEvaluationError;
    }

    if (existingEvaluation && existingEvaluation.length > 0) {
      return {
        error: "Evaluation already exists for this submission"
      };
    }

    // Six-dimension development evaluation. No external API key or Edge Function.
    // The scorer is deterministic and replay-stable; Phase 5 publication below
    // remains identical when a real evaluator is introduced later.
    const evaluation = await requestCompetitionEvaluation(
      supabase as any,
      {
        id: submission.id,
        student_id: submission.student_id,
        pathway: submission.pathway,
        event_name: submission.event_name,
        description: submission.description,
        transcript: submission.transcript,
        video_url: submission.video_url,
      }
    );

    const scores = {
      creativity: evaluation.scores.Creativity,
      communication: evaluation.scores.Communication,
      leadership: evaluation.scores.Leadership,
      confidence: evaluation.scores.Confidence,
      collaboration: evaluation.scores.Collaboration,
      critical_thinking: evaluation.scores.CriticalThinking,
      feedback: evaluation.feedback
    };

    const overall = evaluation.overallScore;

    // Keep the legacy five metric columns populated so the existing
    // CompetitionEntries UI continues to work unchanged.
    const { data: insertedEvaluation, error: evaluationInsertError } =
      await (supabase as any)
        .from("evaluations")
        .insert([
          {
            submission_id: submission.id,
            pathway: submission.pathway,
            event_name: submission.event_name,

            metric_1_name: "Communication",
            metric_1_score: scores.communication,

            metric_2_name: "Confidence",
            metric_2_score: scores.confidence,

            metric_3_name: "Leadership",
            metric_3_score: scores.leadership,

            metric_4_name: "Critical Thinking",
            metric_4_score: scores.critical_thinking,

            metric_5_name: "Collaboration",
            metric_5_score: scores.collaboration,

            creativity_score: scores.creativity,
            communication_score: scores.communication,
            leadership_score: scores.leadership,
            confidence_score: scores.confidence,
            collaboration_score: scores.collaboration,
            critical_thinking_score: scores.critical_thinking,

            overall_score: overall,
            ai_feedback: scores.feedback,

            evaluation_status: "validated",
            evaluator_type: evaluation.evaluatorType,
            evaluation_model: evaluation.model,
            evaluation_version: evaluation.version,
            evaluation_metadata: evaluation.metadata ?? {}
          }
        ])
        .select("id")
        .single();

    if (evaluationInsertError) {
      throw evaluationInsertError;
    }

    const evaluationId = insertedEvaluation?.id;

    if (!evaluationId) {
      throw new Error("Evaluation was saved but no evaluation id was returned.");
    }

    const { error: submissionUpdateError } =
      await (supabase as any)
        .from("submissions")
        .update({
          creativity_score: scores.creativity,
          communication_score: scores.communication,
          confidence_score: scores.confidence,
          leadership_score: scores.leadership,
          critical_thinking_score: scores.critical_thinking,
          collaboration_score: scores.collaboration,
          overall_score: overall,
          ai_feedback: scores.feedback,
          processing_status: "Completed",
        })
        .eq("id", submission.id);

    if (submissionUpdateError) {
      throw submissionUpdateError;
    }

    // Preserve the existing legacy score stream. Creativity is included only
    // if the table has the Phase 5 column; the fallback keeps older schemas working.
    let passportInsertResult =
      await (supabase as any)
        .from("talent_passport_scores")
        .insert([
          {
            student_id: submission.student_id,
            submission_id: submission.id,
            pathway: submission.pathway,
            event_name: submission.event_name,
            creativity_score: scores.creativity,
            communication_score: scores.communication,
            leadership_score: scores.leadership,
            critical_thinking_score: scores.critical_thinking,
            collaboration_score: scores.collaboration,
            confidence_score: scores.confidence,
            overall_score: overall
          }
        ]);

    if (
      passportInsertResult?.error &&
      String(passportInsertResult.error.message ?? "")
        .toLowerCase()
        .includes("creativity_score")
    ) {
      passportInsertResult =
        await (supabase as any)
          .from("talent_passport_scores")
          .insert([
            {
              student_id: submission.student_id,
              submission_id: submission.id,
              pathway: submission.pathway,
              event_name: submission.event_name,
              communication_score: scores.communication,
              leadership_score: scores.leadership,
              critical_thinking_score: scores.critical_thinking,
              collaboration_score: scores.collaboration,
              confidence_score: scores.confidence,
              overall_score: overall
            }
          ]);
    }

    if (passportInsertResult?.error) {
      console.warn(
        "Legacy talent_passport_scores insert failed. Canonical Talent DNA publication will still be attempted.",
        passportInsertResult.error
      );
    }

    // Preserve the legacy aggregate for existing screens, but never use
    // Leadership as Creativity. Creativity always comes from its own dimension.
    const { data: allScores } =
      await (supabase as any)
        .from("talent_passport_scores")
        .select("*")
        .eq("student_id", submission.student_id);

    if (allScores && allScores.length > 0) {
      const average = (field: string) => {
        const valid = allScores
          .map((row: any) => Number(row?.[field]))
          .filter((value: number) => Number.isFinite(value));

        if (valid.length === 0) return null;

        return Math.round(
          valid.reduce((sum: number, value: number) => sum + value, 0) /
            valid.length
        );
      };

      const communicationAvg = average("communication_score");
      const leadershipAvg = average("leadership_score");
      const thinkingAvg = average("critical_thinking_score");
      const collaborationAvg = average("collaboration_score");
      const confidenceAvg = average("confidence_score");
      const creativityAvg = average("creativity_score");
      const overallAvg = average("overall_score");

      const skillCandidates = [
        { name: "Creativity", value: creativityAvg },
        { name: "Communication", value: communicationAvg },
        { name: "Leadership", value: leadershipAvg },
        { name: "Critical Thinking", value: thinkingAvg },
        { name: "Collaboration", value: collaborationAvg },
        { name: "Confidence", value: confidenceAvg },
      ].filter(
        (skill): skill is { name: string; value: number } =>
          skill.value !== null
      );

      const strongestSkill = skillCandidates.sort(
        (a, b) => b.value - a.value
      )[0];

      const legacyPassportPayload: any = {
        student_id: submission.student_id,
        communication_score: communicationAvg ?? 0,
        critical_thinking_score: thinkingAvg ?? 0,
        team_score: collaborationAvg ?? 0,
        combined_score: overallAvg ?? overall,
        final_feedback: strongestSkill
          ? `Current strongest area: ${strongestSkill.name}`
          : scores.feedback
      };

      // Only write real Creativity. Never substitute Leadership.
      if (creativityAvg !== null) {
        legacyPassportPayload.creativity_score = creativityAvg;
      }

      const { error: legacyPassportError } =
        await (supabase as any)
          .from("talent_passports_v2")
          .upsert([legacyPassportPayload]);

      if (legacyPassportError) {
        console.warn(
          "Legacy talent_passports_v2 aggregate update failed. Canonical Talent DNA publication will still be attempted.",
          legacyPassportError
        );
      }
    }

    // Canonical Phase 5 publication. The SQL bridge publishes all six
    // validated scores through record_validated_talent_evidence(), whose
    // source-event uniqueness prevents replay inflation.
    const { data: evidencePublication, error: evidencePublicationError } =
      await (supabase as any).rpc(
        "publish_competition_evaluation_evidence",
        {
          p_evaluation_uuid: evaluationId
        }
      );

    if (evidencePublicationError) {
      throw new Error(
        `Evaluation saved, but Talent DNA evidence publication failed: ${evidencePublicationError.message}`
      );
    }

    console.log("PASSPORT INSERT RESULT", passportInsertResult);
    console.log("TALENT EVIDENCE PUBLICATION", evidencePublication);

    return {
      success: true,
      scores,
      evaluationId,
      evidencePublication
    };
  } catch (err: any) {
    console.error(err);

    return {
      error: err?.message || String(err)
    };
  }
};

export const getEvaluationBySubmissionId = async (
  submissionId: string
) => {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      data: null,
      error: "Supabase not configured"
    };
  }


  
  const { data, error } = await supabase
    .from("evaluations")
    .select("*")
    .eq("submission_id", submissionId)
    .order("created_at", {
      ascending: false
    })
    .limit(1);

  console.log("FOUND EVALUATION", data);

  return {
    data: data?.[0],
    error
  };
};
export const fetchStudentsMaster =
async () => {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data } =
    await supabase
      .from(
        "students_master"
      )
      .select("*");

  return data || [];
};




export const fetchStudentEvents =
async () => {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data } =
    await supabase
      .from(
        "student_events"
      )
      .select("*");

  return data || [];
};

export const fetchTalentPassports =
async () => {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data } =
    await supabase
      .from(
        "talent_passports_v2"
      )
      .select("*");

  return data || [];
};

export async function
fetchTalentPassportScores() {

  const supabase =
    getSupabaseClient();

  if (!supabase) return [];

  const { data, error } =
    await supabase
      .from("talent_passport_scores")
      .select("*");

  console.log(
    "PASSPORT SCORES",
    data
  );

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}

export const fetchDNAProfiles =
async () => {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data } =
    await supabase
      .from(
        "student_dna_profiles"
      )
      .select("*");

  return data || [];
};

export const fetchStudentRegistrationMetrics =
async () => {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return {
      today: 0,
      last7Days: 0,
      last30Days: 0,
    };
  }

  const today = new Date();

  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(
    sevenDaysAgo.getDate() - 7
  );

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(
    thirtyDaysAgo.getDate() - 30
  );

const { data, error } =
await (supabase as any)
  .from("students_master")
  .select("created_at");

const students =
  (data ?? []) as any[];

  if (error || !data) {
    return {
      today: 0,
      last7Days: 0,
      last30Days: 0,
    };
  }

  return {

   today: students.filter(
      row =>
        new Date(row.created_at) >=
        todayStart
    ).length,

last7Days: students.filter(
      row =>
        new Date(row.created_at) >=
        sevenDaysAgo
    ).length,

last30Days: students.filter(
      row =>
        new Date(row.created_at) >=
        thirtyDaysAgo
    ).length,

  };
};

export const fetchCompetitionEntryMetrics =
async () => {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return {
      today: 0,
      last7Days: 0,
      last30Days: 0,
    };
  }

  const today = new Date();

  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(
    sevenDaysAgo.getDate() - 7
  );

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(
    thirtyDaysAgo.getDate() - 30
  );

  const { data, error } =
    await (supabase as any)
      .from("submissions")
      .select("created_at");

  const submissions =
    (data ?? []) as any[];

  if (error) {
    return {
      today: 0,
      last7Days: 0,
      last30Days: 0,
    };
  }

  return {

    today: submissions.filter(
      row =>
        new Date(row.created_at) >=
        todayStart
    ).length,

    last7Days: submissions.filter(
      row =>
        new Date(row.created_at) >=
        sevenDaysAgo
    ).length,

    last30Days: submissions.filter(
      row =>
        new Date(row.created_at) >=
        thirtyDaysAgo
    ).length,

  };
};

export const fetchPartnerRegistrationMetrics =
async () => {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return {
      today: 0,
      last7Days: 0,
      last30Days: 0,
    };
  }

  const today = new Date();

  const todayStart = new Date(today);
  todayStart.setHours(0,0,0,0);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(
    sevenDaysAgo.getDate() - 7
  );

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(
    thirtyDaysAgo.getDate() - 30
  );

  const { data, error } =
    await (supabase as any)
      .from("partners_master")
      .select("created_at");

  const partners =
    (data ?? []) as any[];

  if (error) {
    return {
      today: 0,
      last7Days: 0,
      last30Days: 0,
    };
  }

  return {

    today: partners.filter(
      row =>
        new Date(row.created_at) >=
        todayStart
    ).length,

    last7Days: partners.filter(
      row =>
        new Date(row.created_at) >=
        sevenDaysAgo
    ).length,

    last30Days: partners.filter(
      row =>
        new Date(row.created_at) >=
        thirtyDaysAgo
    ).length,

  };
};

export interface PartnerExecutiveRecord {
  id: string;
  partner_name: string;
  institute_city: string;
  specialization: string;
  status: string;
  created_at: string;
}

export async function fetchPartnersMaster(): Promise<
  PartnerExecutiveRecord[]
> {
  const supabase = getSupabaseClient();

  if (!supabase) return [];

  const { data, error } = await supabase
    .from("partners_master")
    .select(`
      id,
      partner_name,
      institute_city,
      specialization,
      status,
      created_at
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ??
    []) as PartnerExecutiveRecord[];
}
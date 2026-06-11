/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { Submission } from './types';

const supabaseUrl = ((import.meta as any).env?.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || '';
const geminiApiKey =
  ((import.meta as any).env?.VITE_GEMINI_API_KEY as string) || "";
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
  studentName: string;
  studentEmail: string;
  className: string;
  schoolName: string;
  pathway: string;
  eventName: string;
  description: string;
},
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ success: boolean; data?: Submission; error?: string; isMock: boolean }> => {
  try {
    const isMock = !isSupabaseConfigured();

    if (isMock) {
      // Offline/Local Storage simulation mode
      // Generate a beautiful mock video url (blob URL or mock asset url)
      const mockBlobUrl = URL.createObjectURL(file);
      
      const newSubmission: Submission = {
        id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        student_name: entry.studentName,
        student_email: entry.studentEmail,
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
const studentId =
  entry.studentEmail
    .toLowerCase()
    .replace("@", "_")
    .replace(".", "_");
    // 3. Save submission metadata in submissions table
const { data, error: insertError } = await (supabase as any)
  .from('submissions')
  .insert([
    {
      student_id: studentId,
       student_name: entry.studentName,
  student_email: entry.studentEmail,
  class_name: entry.className,
  school_name: entry.schoolName,
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
    student_id: studentId,
    student_name: entry.studentName,
    student_email: entry.studentEmail,
    school_name: entry.schoolName,
    class_name: entry.className
  });
  const { data: existingEvents } = await (supabase as any)
  .from("student_events")
  .select("*")
  .eq("student_id", studentId);

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
        student_id: studentId,
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
  .eq("student_id", studentId)
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
  .eq("student_id", studentId)
  .eq("status", "Completed");

if (completedEvents?.length === 4) {
  console.log("ALL EVENTS COMPLETED");

await (supabase as any)
  .from("talent_passports_v2")
  .upsert([{
    student_id: studentId,
    communication_score: 0,
    creativity_score: 0,
    critical_thinking_score: 0,
    team_score: 0,
    combined_score: 0,
    final_feedback: "Awaiting Evaluation"
  }]);
  

console.log("STUDENT ID");
console.log(studentId);
    const firstRow = data?.[0] as any;
    if (!firstRow) {
      throw new Error('Inserted data could not be returned from database.');
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

    return { success: true, data: insertedData, isMock: false };}
    return {
  success: false,
  error: "Unexpected execution path",
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
      id: row.id || row.created_at,
      created_at: row.created_at,
      student_name: row.student_name,
      student_email: row.student_email,
      pathway: row.pathway,
      event_name: row.event_name,
      video_url: row.video_url,
      description: row.description,
      video_name: row.video_name || 'video.mp4',
      video_size: row.video_size || 0,
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
const { data: existingEvaluation } = await supabase
  .from("evaluations")
  .select("id")
  .eq("submission_id", submissionId)
  .limit(1);

if (
  existingEvaluation &&
  existingEvaluation.length > 0
) {
  return {
    error: "Evaluation already exists for this submission"
  };
}
    const scores = {
      communication: Math.floor(Math.random() * 21) + 70,
      confidence: Math.floor(Math.random() * 21) + 70,
      leadership: Math.floor(Math.random() * 21) + 70,
      critical_thinking: Math.floor(Math.random() * 21) + 70,
      collaboration: Math.floor(Math.random() * 21) + 70,
      feedback:
        "Strong performance. Demonstrates good communication, confidence and leadership potential."
    };

    const overall = Math.round(
      (
        scores.communication +
        scores.confidence +
        scores.leadership +
        scores.critical_thinking +
        scores.collaboration
      ) / 5
    );

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

          overall_score: overall,

          ai_feedback: scores.feedback
        }
      ]);

    return {
      success: true,
      scores
    };
  } catch (err: any) {
    console.error(err);

    return {
      error: String(err)
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
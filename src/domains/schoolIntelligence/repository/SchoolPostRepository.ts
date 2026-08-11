import { getSupabaseClient } from "../../../supabaseClient";
import {
  getCurrentStudent,
  getTableIdentity,
  requireSchoolIdentity,
} from "../../../services/identityService";
import type {
  SchoolPost,
  SchoolPostAudience,
  SchoolPostAudienceOption,
  SchoolPostClassResult,
  SchoolPollType,
} from "../types/SchoolPostModels";

function getClient() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase as any;
}

function normalize(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function currentProfileUuid(table: "students_master" | "teachers_master") {
  /*
   * getTableIdentity() already returns the canonical UUID string.
   * It does NOT return an identity object.
   *
   * The previous implementation treated that string as an object,
   * which produced "" for teachers and caused Supabase to receive:
   *   .eq("teacher_uuid", "")
   * resulting in:
   *   invalid input syntax for type uuid: ""
   */
  const identity = getTableIdentity(table);
  return String(identity ?? "").trim();
}

function mapPost(row: any, targets: any[], responses: any[] = []): SchoolPost {
  const postResponses = responses.filter(
    response => String(response.post_id) === String(row.id),
  );
  const numeric = postResponses
    .map(response => Number(response.response_value))
    .filter(Number.isFinite);

  return {
    id: row.id,
    schoolUuid: row.school_uuid,
    createdBy: row.created_by ?? null,
    createdByName: row.created_by_name ?? null,
    postType: row.post_type,
    title: row.title,
    body: row.body,
    templateKey: row.template_key ?? "clean",
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    rulesText: row.rules_text ?? null,
    pollType: row.poll_type ?? null,
    isActive: row.is_active !== false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    targets: targets
      .filter(target => String(target.post_id) === String(row.id))
      .map(target => ({
        id: target.id,
        postId: target.post_id,
        audience: target.audience,
        className: target.class_name,
        sectionName: target.section_name,
      })),
    responseCount: postResponses.length,
    responseAverage:
      numeric.length > 0
        ? Math.round(
            (numeric.reduce((sum, value) => sum + value, 0) / numeric.length) * 10,
          ) / 10
        : null,
  };
}

export async function getSchoolPostAudienceOptions(): Promise<SchoolPostAudienceOption[]> {
  const identity = requireSchoolIdentity();
  const schoolUuid = identity.schoolUuid;
  const schoolName = identity.schoolName;
  const supabase = getClient();

  const [studentResult, assignmentResult] = await Promise.all([
    supabase
      .from("students_master")
      .select("class_name,section_name")
      .eq("school_name", schoolName),
    supabase
      .from("teacher_classroom_assignments")
      .select("class_name,section_name")
      .eq("school_uuid", schoolUuid)
      .eq("is_active", true),
  ]);

  if (studentResult.error) throw studentResult.error;
  if (assignmentResult.error) throw assignmentResult.error;

  const map = new Map<string, SchoolPostAudienceOption>();

  [...(studentResult.data ?? []), ...(assignmentResult.data ?? [])].forEach(
    (row: any) => {
      const className = String(row.class_name ?? "").trim();
      const sectionName = String(row.section_name ?? "").trim();
      if (!className || !sectionName) return;
      const key = `${className}|||${sectionName}`;
      map.set(key, {
        className,
        sectionName,
        label: `Class ${className} · Section ${sectionName}`,
      });
    },
  );

  return Array.from(map.values()).sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { numeric: true }),
  );
}

export async function listSchoolPosts(): Promise<SchoolPost[]> {
  const identity = requireSchoolIdentity();
  const schoolUuid = identity.schoolUuid;
  const supabase = getClient();

  const [postsResult, targetsResult, responsesResult] = await Promise.all([
    supabase
      .from("school_posts")
      .select(
        "id,school_uuid,created_by,created_by_name,post_type,title,body,template_key,starts_at,ends_at,rules_text,poll_type,is_active,created_at,updated_at",
      )
      .eq("school_uuid", schoolUuid)
      .order("created_at", { ascending: false }),
    supabase
      .from("school_post_targets")
      .select("id,post_id,audience,class_name,section_name")
      .eq("school_uuid", schoolUuid),
    supabase
      .from("school_post_responses")
      .select("id,post_id,responder_uuid,responder_role,response_value,response_text,created_at")
      .eq("school_uuid", schoolUuid),
  ]);

  if (postsResult.error) throw postsResult.error;
  if (targetsResult.error) throw targetsResult.error;
  if (responsesResult.error) throw responsesResult.error;

  return (postsResult.data ?? []).map(row =>
    mapPost(row, targetsResult.data ?? [], responsesResult.data ?? []),
  );
}

export async function createSchoolPost(input: {
  postType: "announcement" | "poll";
  title: string;
  body: string;
  templateKey: string;
  startsAt: string;
  endsAt: string;
  rulesText?: string;
  pollType?: SchoolPollType | null;
  targets: Array<{
    audience: SchoolPostAudience;
    className?: string | null;
    sectionName?: string | null;
  }>;
}): Promise<SchoolPost> {
  const identity = requireSchoolIdentity();
  const schoolUuid = identity.schoolUuid;
  const supabase = getClient();

  if (!schoolUuid) throw new Error("Authenticated school UUID is missing.");
  if (!input.title.trim() || !input.body.trim()) {
    throw new Error("Title and message are required.");
  }
  if (new Date(input.endsAt).getTime() <= new Date(input.startsAt).getTime()) {
    throw new Error("The end time must be after the start time.");
  }
  if (!input.targets.length) {
    throw new Error("Select at least one audience and target.");
  }

  const { data: authData } = await supabase.auth.getUser();
  const createdBy = authData?.user?.id ?? null;

  const postInsert = await supabase
    .from("school_posts")
    .insert({
      school_uuid: schoolUuid,
      created_by: createdBy,
      created_by_name: identity.schoolName,
      post_type: input.postType,
      title: input.title.trim(),
      body: input.body.trim(),
      template_key: input.templateKey,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      rules_text: input.rulesText?.trim() || null,
      poll_type: input.postType === "poll" ? input.pollType ?? "scale_1_10" : null,
      is_active: true,
    })
    .select(
      "id,school_uuid,created_by,created_by_name,post_type,title,body,template_key,starts_at,ends_at,rules_text,poll_type,is_active,created_at,updated_at",
    )
    .single();

  if (postInsert.error) throw postInsert.error;

  const targetRows = input.targets.map(target => ({
    school_uuid: schoolUuid,
    post_id: postInsert.data.id,
    audience: target.audience,
    class_name: target.className ?? null,
    section_name: target.sectionName ?? null,
  }));

  const targetInsert = await supabase
    .from("school_post_targets")
    .insert(targetRows);

  if (targetInsert.error) {
    await supabase.from("school_posts").delete().eq("id", postInsert.data.id);
    throw targetInsert.error;
  }

  return mapPost(postInsert.data, targetRows);
}

export async function updateSchoolPost(
  postId: string,
  input: Partial<{
    title: string;
    body: string;
    templateKey: string;
    startsAt: string;
    endsAt: string;
    rulesText: string;
    pollType: SchoolPollType | null;
    isActive: boolean;
  }>,
) {
  const identity = requireSchoolIdentity();
  const supabase = getClient();

  const payload: any = {};
  if (input.title !== undefined) payload.title = input.title.trim();
  if (input.body !== undefined) payload.body = input.body.trim();
  if (input.templateKey !== undefined) payload.template_key = input.templateKey;
  if (input.startsAt !== undefined) payload.starts_at = input.startsAt;
  if (input.endsAt !== undefined) payload.ends_at = input.endsAt;
  if (input.rulesText !== undefined) payload.rules_text = input.rulesText.trim() || null;
  if (input.pollType !== undefined) payload.poll_type = input.pollType;
  if (input.isActive !== undefined) payload.is_active = input.isActive;

  const result = await supabase
    .from("school_posts")
    .update(payload)
    .eq("id", postId)
    .eq("school_uuid", identity.schoolUuid)
    .select("id")
    .single();

  if (result.error) throw result.error;
}

export async function replaceSchoolPostTargets(
  postId: string,
  targets: Array<{
    audience: SchoolPostAudience;
    className?: string | null;
    sectionName?: string | null;
  }>,
) {
  const identity = requireSchoolIdentity();
  const supabase = getClient();

  if (!targets.length) throw new Error("Select at least one audience and target.");

  const removed = await supabase
    .from("school_post_targets")
    .delete()
    .eq("post_id", postId)
    .eq("school_uuid", identity.schoolUuid);

  if (removed.error) throw removed.error;

  const inserted = await supabase
    .from("school_post_targets")
    .insert(
      targets.map(target => ({
        school_uuid: identity.schoolUuid,
        post_id: postId,
        audience: target.audience,
        class_name: target.className ?? null,
        section_name: target.sectionName ?? null,
      })),
    );

  if (inserted.error) throw inserted.error;
}

export async function deleteSchoolPost(postId: string) {
  const identity = requireSchoolIdentity();
  const supabase = getClient();

  const result = await supabase
    .from("school_posts")
    .delete()
    .eq("id", postId)
    .eq("school_uuid", identity.schoolUuid);

  if (result.error) throw result.error;
}

export async function getActiveSchoolPosts(
  audience: SchoolPostAudience,
): Promise<SchoolPost[]> {
  const supabase = getClient();
  const now = new Date().toISOString();

  let schoolUuid = "";
  let className = "";
  let sectionName = "";
  let teacherClasses: Array<{ className: string; sectionName: string }> = [];
  let profileUuid = "";

  if (audience === "student") {
    const student: any = getCurrentStudent();
    schoolUuid = String(student?.schoolUuid ?? "");
    className = String(student?.className ?? "");
    sectionName = String(student?.sectionName ?? "");
    profileUuid = String(student?.studentUuid ?? student?.uuid ?? "");

    if (schoolUuid && profileUuid && (!className || !sectionName)) {
      const studentResult = await supabase
        .from("students_master")
        .select("school_uuid,school_name,class_name,section_name")
        .eq("student_uuid", profileUuid)
        .maybeSingle();

      if (!studentResult.error && studentResult.data) {
        schoolUuid = String(studentResult.data.school_uuid ?? schoolUuid);
        className = String(studentResult.data.class_name ?? className);
        sectionName = String(studentResult.data.section_name ?? sectionName);
      }
    }
  } else {
    /*
     * IMPORTANT:
     * getTableIdentity("teachers_master") returns the canonical teacher UUID
     * string. Do not treat it as an object.
     */
    profileUuid = currentProfileUuid("teachers_master");

    if (!profileUuid) {
      return [];
    }

    const teacherUuid = profileUuid;

    const teacherResult = await supabase
      .from("teachers_master")
      .select("school_uuid")
      .eq("teacher_uuid", teacherUuid)
      .maybeSingle();

    if (teacherResult.error) throw teacherResult.error;

    schoolUuid = String(teacherResult.data?.school_uuid ?? "").trim();

    /*
     * Never send an empty string to a UUID column.
     * If the teacher record cannot be mapped to a school, there is simply
     * no school feed to display yet.
     */
    if (!schoolUuid) {
      return [];
    }

    const assignments = await supabase
      .from("teacher_classroom_assignments")
      .select("class_name,section_name")
      .eq("teacher_uuid", teacherUuid)
      .eq("school_uuid", schoolUuid)
      .eq("is_active", true);

    if (assignments.error) throw assignments.error;

    teacherClasses = (assignments.data ?? []).map((row: any) => ({
      className: String(row.class_name ?? ""),
      sectionName: String(row.section_name ?? ""),
    }));
  }

  if (!schoolUuid) return [];

  const [postsResult, targetsResult, responseResult] = await Promise.all([
    supabase
      .from("school_posts")
      .select(
        "id,school_uuid,created_by,created_by_name,post_type,title,body,template_key,starts_at,ends_at,rules_text,poll_type,is_active,created_at,updated_at",
      )
      .eq("school_uuid", schoolUuid)
      .eq("is_active", true)
      .lte("starts_at", now)
      .gte("ends_at", now)
      .order("created_at", { ascending: false }),
    supabase
      .from("school_post_targets")
      .select("id,post_id,audience,class_name,section_name")
      .eq("school_uuid", schoolUuid)
      .eq("audience", audience),
    supabase
      .from("school_post_responses")
      .select("id,post_id,responder_uuid,response_value,response_text")
      .eq("school_uuid", schoolUuid)
      .eq("responder_uuid", profileUuid),
  ]);

  if (postsResult.error) throw postsResult.error;
  if (targetsResult.error) throw targetsResult.error;
  if (responseResult.error) throw responseResult.error;

  const relevantTargets = targetsResult.data ?? [];
  const respondedIds = new Set(
    (responseResult.data ?? []).map((row: any) => String(row.post_id)),
  );

  return (postsResult.data ?? [])
    .filter((post: any) => {
      const targets = relevantTargets.filter(
        (target: any) => String(target.post_id) === String(post.id),
      );

      if (audience === "student") {
        return targets.some(
          (target: any) =>
            normalize(target.class_name) === normalize(className) &&
            normalize(target.section_name) === normalize(sectionName),
        );
      }

      if (targets.some((target: any) => !target.class_name && !target.section_name)) {
        return true;
      }

      return targets.some((target: any) =>
        teacherClasses.some(
          classroom =>
            normalize(classroom.className) === normalize(target.class_name) &&
            normalize(classroom.sectionName) === normalize(target.section_name),
        ),
      );
    })
    .filter((post: any) =>
      post.post_type === "announcement" ? true : !respondedIds.has(String(post.id)),
    )
    .map(post => mapPost(post, relevantTargets, []));
}

export async function submitSchoolPostResponse(
  postId: string,
  audience: SchoolPostAudience,
  responseValue: number | null,
  responseText: string,
) {
  const supabase = getClient();
  const profileUuid =
    audience === "student"
      ? String((getCurrentStudent() as any)?.studentUuid ?? (getCurrentStudent() as any)?.uuid ?? "")
      : currentProfileUuid("teachers_master");

  if (!profileUuid) throw new Error("Current profile identity could not be resolved.");

  const postResult = await supabase
    .from("school_posts")
    .select("id,school_uuid,post_type,is_active,starts_at,ends_at")
    .eq("id", postId)
    .single();

  if (postResult.error) throw postResult.error;

  const { data: authData } = await supabase.auth.getUser();
  const authUuid = authData?.user?.id;
  if (!authUuid) throw new Error("Authenticated user could not be resolved.");

  const result = await supabase.from("school_post_responses").upsert(
    {
      school_uuid: postResult.data.school_uuid,
      post_id: postId,
      responder_uuid: profileUuid,
      responder_auth_uuid: authUuid,
      responder_role: audience,
      response_value: responseValue,
      response_text: responseText,
    },
    {
      onConflict: "post_id,responder_uuid",
    },
  );

  if (result.error) throw result.error;
}

export async function getSchoolPostResults(postId: string): Promise<SchoolPostClassResult[]> {
  const identity = requireSchoolIdentity();
  const supabase = getClient();

  const [targetsResult, responsesResult, studentsResult, assignmentsResult] =
    await Promise.all([
      supabase
        .from("school_post_targets")
        .select("audience,class_name,section_name")
        .eq("post_id", postId)
        .eq("audience", "student"),
      supabase
        .from("school_post_responses")
        .select("responder_uuid,response_value,response_text")
        .eq("post_id", postId),
      supabase
        .from("students_master")
        .select("student_uuid,class_name,section_name")
        .eq("school_name", identity.schoolName),
      supabase
        .from("teacher_classroom_assignments")
        .select("class_name,section_name")
        .eq("school_uuid", identity.schoolUuid)
        .eq("is_active", true),
    ]);

  if (targetsResult.error) throw targetsResult.error;
  if (responsesResult.error) throw responsesResult.error;
  if (studentsResult.error) throw studentsResult.error;
  if (assignmentsResult.error) throw assignmentsResult.error;

  const responseMap = new Map<string, any>();
  (responsesResult.data ?? []).forEach((row: any) =>
    responseMap.set(String(row.responder_uuid), row),
  );

  const classrooms = new Map<string, SchoolPostClassResult>();

  const ensure = (className: string, sectionName: string) => {
    const key = `${className}|||${sectionName}`;
    if (!classrooms.has(key)) {
      classrooms.set(key, {
        className,
        sectionName,
        label: `Class ${className} · Section ${sectionName}`,
        responseCount: 0,
        average: null,
        yesCount: 0,
        noCount: 0,
      });
    }
    return classrooms.get(key)!;
  };

  (targetsResult.data ?? []).forEach((target: any) => {
    if (!target.class_name || !target.section_name) return;
    ensure(String(target.class_name), String(target.section_name));
  });

  const valuesByClass = new Map<string, number[]>();

  (studentsResult.data ?? []).forEach((student: any) => {
    const response = responseMap.get(String(student.student_uuid));
    if (!response) return;

    const className = String(student.class_name ?? "");
    const sectionName = String(student.section_name ?? "");
    const result = ensure(className, sectionName);
    result.responseCount += 1;

    const value = Number(response.response_value);
    if (Number.isFinite(value)) {
      const key = `${className}|||${sectionName}`;
      if (!valuesByClass.has(key)) valuesByClass.set(key, []);
      valuesByClass.get(key)!.push(value);
    }

    const text = normalize(response.response_text);
    if (text === "yes") result.yesCount = (result.yesCount ?? 0) + 1;
    if (text === "no") result.noCount = (result.noCount ?? 0) + 1;
  });

  classrooms.forEach((result, key) => {
    const values = valuesByClass.get(key) ?? [];
    result.average =
      values.length > 0
        ? Math.round(
            (values.reduce((sum, value) => sum + value, 0) / values.length) * 10,
          ) / 10
        : null;
  });

  return Array.from(classrooms.values()).sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { numeric: true }),
  );
}

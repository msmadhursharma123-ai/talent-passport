import { getSupabaseClient } from "../supabaseClient";

import {
  getTableIdentity
} from "../services/identityService";

/* ============================================================
   REPOSITORY IDENTITY HELPERS
============================================================ */

function currentStudentId(): string {
  return getTableIdentity(
    "marketplace_reviews"
  );
}

/* ============================================================
   TYPES
============================================================ */

export interface CreateReviewInput {

  studentId?: string;

  partnerId: string;

  mentorId?: string;

  rating: number;

  review: string;

}

/* ============================================================
   CREATE REVIEW
============================================================ */

export async function createReview(
  input: CreateReviewInput
) {

  const supabase =
    getSupabaseClient();

  if (!supabase) {

    throw new Error(
      "Supabase client not initialized"
    );

  }

  const resolvedStudentId =
    input.studentId ??
    currentStudentId();

  const {
    data,
    error
  } =
    await (supabase as any)

      .from("marketplace_reviews")

      .insert({

        student_id:
          resolvedStudentId,

        partner_id:
          input.partnerId,

        mentor_id:
          input.mentorId ?? null,

        rating:
          input.rating,

        review:
          input.review

      })

      .select()

      .single();

  if (error) {
    throw error;
  }

  return data;

}

/* ============================================================
   GET PARTNER REVIEWS
============================================================ */

export async function getPartnerReviews(
  partnerId: string
) {

  const supabase =
    getSupabaseClient();

  if (!supabase) return [];

  const {
    data,
    error
  } =
    await (supabase as any)

      .from("marketplace_reviews")

      .select("*")

      .eq(
        "partner_id",
        partnerId
      )

      .order(
        "created_at",
        { ascending: false }
      );

  if (error) {

    console.error(error);

    return [];

  }

  return data ?? [];

}

/* ============================================================
   GET STUDENT REVIEWS
============================================================ */

export async function getStudentReviews(
  studentId?: string
) {

  const supabase =
    getSupabaseClient();

  if (!supabase) return [];

  const resolvedStudentId =
    studentId ??
    currentStudentId();

  const {
    data,
    error
  } =
    await (supabase as any)

      .from("marketplace_reviews")

      .select("*")

      .eq(
        "student_id",
        resolvedStudentId
      )

      .order(
        "created_at",
        { ascending: false }
      );

  if (error) {

    console.error(error);

    return [];

  }

  return data ?? [];

}

/* ============================================================
   DELETE REVIEW
============================================================ */

export async function deleteReview(
  reviewId: string
) {

  const supabase =
    getSupabaseClient();

  if (!supabase) {

    throw new Error(
      "Supabase client not initialized"
    );

  }

  const { error } =
    await (supabase as any)

      .from("marketplace_reviews")

      .delete()

      .eq("id", reviewId);

  if (error) {

    throw error;

  }

}
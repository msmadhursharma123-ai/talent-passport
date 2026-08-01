import { getSupabaseClient } from "../supabaseClient";

export type SchoolSubscriptionStatus =
    | "ACTIVE"
    | "EXPIRED"
    | "SUSPENDED";

export type SchoolSubscriptionPlan =
    | "TWO_WEEKS"
    | "ONE_MONTH"
    | "THREE_MONTHS"
    | "CUSTOM";

export interface SchoolSubscription {

    schoolUuid: string;

    subscriptionPlan: SchoolSubscriptionPlan | null;

    subscriptionStatus: SchoolSubscriptionStatus | null;

    subscriptionStartDate: string | null;

    subscriptionEndDate: string | null;

    gracePeriodDays: number;

    subscriptionNotes: string | null;

}

export interface UpdateSchoolSubscriptionRequest {

    schoolUuid: string;

    subscriptionPlan: SchoolSubscriptionPlan;

    subscriptionStatus: SchoolSubscriptionStatus;

    subscriptionStartDate: string;

    subscriptionEndDate: string;

    gracePeriodDays: number;

    subscriptionNotes?: string;

}

function getClient() {

    const supabase =
        getSupabaseClient();

    if (!supabase) {

        throw new Error(
            "Supabase is not configured."
        );

    }

    return supabase;

}

/* ============================================================
   FETCH SUBSCRIPTION
============================================================ */

export async function getSchoolSubscription(

    schoolUuid: string

): Promise<SchoolSubscription | null> {

    if (!schoolUuid) {

        return null;

    }

    const supabase =
        getClient();

    const {

        data,

        error

    } = await (supabase as any)

        .from("schools_master")

        .select(`

            school_uuid,

            subscription_plan,

            subscription_status,

            subscription_start_date,

            subscription_end_date,

            grace_period_days,

            subscription_notes

        `)

        .eq(

            "school_uuid",

            schoolUuid

        )

        .maybeSingle();

    if (error) {

        console.error(

            "Unable to fetch subscription.",

            error

        );

        return null;

    }

    if (!data) {

        return null;

    }

    return {

        schoolUuid:
            data.school_uuid,

        subscriptionPlan:
            data.subscription_plan,

        subscriptionStatus:
            data.subscription_status,

        subscriptionStartDate:
            data.subscription_start_date,

        subscriptionEndDate:
            data.subscription_end_date,

        gracePeriodDays:
            Number(
                data.grace_period_days ?? 0
            ),

        subscriptionNotes:
            data.subscription_notes

    };

}
/* ============================================================
   UPDATE SUBSCRIPTION
============================================================ */

export async function updateSchoolSubscription(

    request: UpdateSchoolSubscriptionRequest

): Promise<boolean> {

    const supabase =
        getClient();

    const {

        error

    } = await (supabase as any)

        .from("schools_master")

        .update({

            subscription_plan:
                request.subscriptionPlan,

            subscription_status:
                request.subscriptionStatus,

            subscription_start_date:
                request.subscriptionStartDate,

            subscription_end_date:
                request.subscriptionEndDate,

            grace_period_days:
                request.gracePeriodDays,

            subscription_notes:
                request.subscriptionNotes ?? null

        })

        .eq(

            "school_uuid",

            request.schoolUuid

        );

    if (error) {

        console.error(

            "Unable to update school subscription.",

            error

        );

        return false;

    }

    return true;

}

/* ============================================================
   FETCH SUBSCRIPTION STATUS ONLY

   Lightweight query used during authentication.
============================================================ */

export async function getSchoolSubscriptionStatus(

    schoolUuid: string

): Promise<SchoolSubscriptionStatus | null> {

    if (!schoolUuid) {

        return null;

    }

    const supabase =
        getClient();

    const {

        data,

        error

    } = await (supabase as any)

        .from("schools_master")

        .select(

            "subscription_status"

        )

        .eq(

            "school_uuid",

            schoolUuid

        )

        .maybeSingle();

    if (error) {

        console.error(error);

        return null;

    }

  return (
    (data?.subscription_status as SchoolSubscriptionStatus | null) ??
    null
);

}

/* ============================================================
   FETCH SUBSCRIPTION END DATE

   Used by subscription validation service.
============================================================ */

export async function getSchoolSubscriptionEndDate(

    schoolUuid: string

): Promise<string | null> {

    if (!schoolUuid) {

        return null;

    }

    const supabase =
        getClient();

    const {

        data,

        error

    } = await (supabase as any)

        .from("schools_master")

        .select(

            "subscription_end_date"

        )

        .eq(

            "school_uuid",

            schoolUuid

        )

        .maybeSingle();

    if (error) {

        console.error(error);

        return null;

    }

return (
    (data?.subscription_end_date as string | null) ??
    null
);
}

/* ============================================================
   FETCH GRACE PERIOD

============================================================ */

export async function getSchoolGracePeriod(

    schoolUuid: string

): Promise<number> {

    if (!schoolUuid) {

        return 0;

    }

    const supabase =
        getClient();

    const {

        data,

        error

    } = await (supabase as any)

        .from("schools_master")

        .select(

            "grace_period_days"

        )

        .eq(

            "school_uuid",

            schoolUuid

        )

        .maybeSingle();

    if (error) {

        console.error(error);

        return 0;

    }

    return Number(

        data?.grace_period_days ?? 0

    );

}
/* ============================================================
   FETCH SUBSCRIPTION SUMMARY

   Used by Teacher Registry
============================================================ */

export async function getSchoolSubscriptionSummary(
    schoolUuid: string
): Promise<SchoolSubscription | null> {

    return getSchoolSubscription(
        schoolUuid
    );

}

/* ============================================================
   UPDATE SUBSCRIPTION STATUS ONLY

   Used by Platform Administration.
============================================================ */

export async function updateSubscriptionStatus(
    schoolUuid: string,
    status: SchoolSubscriptionStatus
): Promise<boolean> {

    const supabase =
        getClient();

    const { error } =
        await (supabase as any)

            .from("schools_master")

            .update({

                subscription_status:
                    status

            })

            .eq(

                "school_uuid",

                schoolUuid

            );

    if (error) {

        console.error(
            "Unable to update subscription status.",
            error
        );

        return false;

    }

    return true;

}

/* ============================================================
   UPDATE SUBSCRIPTION NOTES
============================================================ */

export async function updateSubscriptionNotes(
    schoolUuid: string,
    notes: string
): Promise<boolean> {

    const supabase =
        getClient();

    const { error } =
        await (supabase as any)

            .from("schools_master")

            .update({

                subscription_notes:
                    notes

            })

            .eq(

                "school_uuid",

                schoolUuid

            );

    if (error) {

        console.error(
            "Unable to update subscription notes.",
            error
        );

        return false;

    }

    return true;

}

/* ============================================================
   HAS ACTIVE SUBSCRIPTION

   Repository only.
   Business rules such as grace period,
   expiry calculation and Platform Admin
   bypass are intentionally handled inside

       schoolSubscriptionService.ts

============================================================ */

export async function hasSubscriptionRecord(
    schoolUuid: string
): Promise<boolean> {

    const subscription =
        await getSchoolSubscription(
            schoolUuid
        );

    return subscription !== null;

}

/* ============================================================
   DEFAULT EXPORT
============================================================ */

const SubscriptionRepository = {

    getSchoolSubscription,

    getSchoolSubscriptionSummary,

    getSchoolSubscriptionStatus,

    getSchoolSubscriptionEndDate,

    getSchoolGracePeriod,

    updateSchoolSubscription,

    updateSubscriptionStatus,

    updateSubscriptionNotes,

    hasSubscriptionRecord

};

export default SubscriptionRepository;
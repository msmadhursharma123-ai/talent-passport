import SubscriptionRepository, {
    SchoolSubscription,
    SchoolSubscriptionStatus,
    UpdateSchoolSubscriptionRequest
} from "../repositories/subscriptionRepository";

export interface SubscriptionValidationResult {

    allowed: boolean;

    status: SchoolSubscriptionStatus | null;

    message: string | null;

    subscription: SchoolSubscription | null;

}

const EXPIRED_MESSAGE =
    "Your school's subscription has expired. Please contact your school administrator.";

const SUSPENDED_MESSAGE =
    "Your school's subscription has been suspended. Please contact your school administrator.";

function today(): Date {

    const date = new Date();

    date.setHours(

        0,
        0,
        0,
        0

    );

    return date;

}

function addDays(

    date: Date,

    days: number

): Date {

    const value =
        new Date(date);

    value.setDate(

        value.getDate() + days

    );

    return value;

}

export async function getSubscription(

    schoolUuid: string

): Promise<SchoolSubscription | null> {

    return SubscriptionRepository

        .getSchoolSubscription(

            schoolUuid

        );

}

export async function saveSubscription(

    request: UpdateSchoolSubscriptionRequest

): Promise<boolean> {

    return SubscriptionRepository

        .updateSchoolSubscription(

            request

        );

}

export async function updateSubscriptionStatus(

    schoolUuid: string,

    status: SchoolSubscriptionStatus

): Promise<boolean> {

    return SubscriptionRepository

        .updateSubscriptionStatus(

            schoolUuid,

            status

        );

}
/* ============================================================
   SUBSCRIPTION VALIDATION
============================================================ */

export async function validateSchoolSubscription(
    schoolUuid: string
): Promise<SubscriptionValidationResult> {

    const subscription =
        await SubscriptionRepository.getSchoolSubscription(
            schoolUuid
        );

    /*
     * Backward compatibility.
     *
     * Schools created before the subscription
     * feature existed should continue working.
     */
    if (!subscription) {

        return {

            allowed: true,

            status: "ACTIVE",

            message: null,

            subscription: null

        };

    }

    /*
     * Manual suspension always wins.
     */
    if (subscription.subscriptionStatus === "SUSPENDED") {

        return {

            allowed: false,

            status: "SUSPENDED",

            message: SUSPENDED_MESSAGE,

            subscription

        };

    }

    /*
     * Manual expiry always wins.
     */
    if (subscription.subscriptionStatus === "EXPIRED") {

        return {

            allowed: false,

            status: "EXPIRED",

            message: EXPIRED_MESSAGE,

            subscription

        };

    }

    /*
     * Empty / null status means the school
     * has never been configured.
     * Allow access.
     */
    if (
        subscription.subscriptionStatus == null
    ) {

        return {

            allowed: true,

            status: "ACTIVE",

            message: null,

            subscription

        };

    }

    /*
     * No end date means no expiry has been
     * configured yet.
     */
    if (!subscription.subscriptionEndDate) {

        return {

            allowed: true,

            status: subscription.subscriptionStatus,

            message: null,

            subscription

        };

    }

    const endDate =
        new Date(subscription.subscriptionEndDate);

    endDate.setHours(
        0,
        0,
        0,
        0
    );

    const graceEndDate =
        addDays(
            endDate,
            subscription.gracePeriodDays ?? 0
        );

    /*
     * Expired after grace period.
     */
    if (today() > graceEndDate) {

        return {

            allowed: false,

            status: "EXPIRED",

            message: EXPIRED_MESSAGE,

            subscription

        };

    }

    /*
     * Active subscription.
     */
    return {

        allowed: true,

        status: "ACTIVE",

        message: null,

        subscription

    };

}
/* ============================================================
   PROFILE CREATION CHECK

   Used by:
   - Student Profile
   - Teacher Profile
   - School Admin Profile
============================================================ */

export async function canCreateProfile(
    schoolUuid: string
): Promise<SubscriptionValidationResult> {

    return validateSchoolSubscription(
        schoolUuid
    );

}

/* ============================================================
   LOGIN CHECK

   Used by AuthenticationService
============================================================ */

export async function canLogin(
    schoolUuid: string
): Promise<SubscriptionValidationResult> {

    return validateSchoolSubscription(
        schoolUuid
    );

}

/* ============================================================
   SUBSCRIPTION STATUS HELPERS
============================================================ */

export async function isSubscriptionActive(
    schoolUuid: string
): Promise<boolean> {

    const result =
        await validateSchoolSubscription(
            schoolUuid
        );

    return result.allowed;

}

export async function getSubscriptionStatus(
    schoolUuid: string
): Promise<SchoolSubscriptionStatus | null> {

    const subscription =
        await SubscriptionRepository
            .getSchoolSubscription(
                schoolUuid
            );

    return subscription?.subscriptionStatus ?? null;

}

/* ============================================================
   DEFAULT EXPORT
============================================================ */

const SchoolSubscriptionService = {

    getSubscription,

    saveSubscription,

    updateSubscriptionStatus,

    validateSchoolSubscription,

    canCreateProfile,

    canLogin,

    isSubscriptionActive,

    getSubscriptionStatus

};

export default SchoolSubscriptionService;
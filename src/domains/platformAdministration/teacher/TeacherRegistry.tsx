import { useEffect, useState } from "react";

import useTeacherManagementViewModel
from "../teacher/TeacherManagementViewModel";

import type {
    SchoolRecord,
    SchoolSubscriptionDetails
} from "../teacher/TeacherManagementRepository";

import {

    STUDENT_FEATURES,

    TEACHER_FEATURES,

    getSchoolFeatureConfiguration

} from "../../../data/schoolFeatureAccessRepository";

import {
    getStudentOnboardingConfiguration
} from "../../../data/studentOnboardingConfigurationRepository";

import {

    PlatformAccount,

    searchPlatformAccounts,

    setPlatformAccountSuspended

} from "../../../data/platformAccountControlRepository";

import {
    CompetitionAnnouncement,
    CompetitionClassOption,
    createCompetitionAnnouncement,
    getCompetitionAnnouncements,
    getCompetitionClassOptions,
    revokeCompetitionAnnouncement
} from "../../../data/competitionControlRepository";

export default function TeacherRegistry() {

    const {

        schools,

        loading,


        addSchool,

        editSchool,

        removeSchool,
        activateExistingSchool,
        deleteExistingSchool

    } = useTeacherManagementViewModel();

    const [

        schoolName,

        setSchoolName

    ] = useState("");

    const [

        board,

        setBoard

    ] = useState("");

    const [

        city,

        setCity

    ] = useState("");

    const [

        studentProfileLimit,

        setStudentProfileLimit

    ] = useState("");

    const [

        teacherProfileLimit,

        setTeacherProfileLimit

    ] = useState("");

    const [

        schoolAdminProfileLimit,

        setSchoolAdminProfileLimit

    ] = useState("");

const [

    subscriptionPlan,

    setSubscriptionPlan

] = useState("ONE_MONTH");

const [

    subscriptionStartDate,

    setSubscriptionStartDate

] = useState(

    new Date()

        .toISOString()

        .slice(0,10)

);

const [

    subscriptionEndDate,

    setSubscriptionEndDate

] = useState("");

const [

    gracePeriodDays,

    setGracePeriodDays

] = useState("0");

    const [

        editing,

        setEditing

    ] = useState(false);

    const [

        editingSchoolUuid,

        setEditingSchoolUuid

    ] = useState("");

    const [

        studentFeatures,

        setStudentFeatures

    ] = useState<string[]>(

        STUDENT_FEATURES.map(

            x => x.key

        )

    );

    const [

        teacherFeatures,

        setTeacherFeatures

    ] = useState<string[]>(

        TEACHER_FEATURES.map(

            x => x.key

        )

    );

    const [

        studentParentOtpEnabled,

        setStudentParentOtpEnabled

    ] = useState(true);

    const [

        studentQuestionnaireEnabled,

        setStudentQuestionnaireEnabled

    ] = useState(true);

    const [

        q,

        setQ

    ] = useState("");

    const [

        accounts,

        setAccounts

    ] = useState<PlatformAccount[]>([]);

    const [
        competitionSchoolUuid,
        setCompetitionSchoolUuid
    ] = useState("");

    const [
        competitionSchoolName,
        setCompetitionSchoolName
    ] = useState("");

    const [
        competitionClass,
        setCompetitionClass
    ] = useState("");

    const [
        competitionSection,
        setCompetitionSection
    ] = useState("");

    const [
        competitionClasses,
        setCompetitionClasses
    ] = useState<CompetitionClassOption[]>([]);

    const [
        competitionEventName,
        setCompetitionEventName
    ] = useState("");

    const [
        competitionStartAt,
        setCompetitionStartAt
    ] = useState("");

    const [
        competitionEndAt,
        setCompetitionEndAt
    ] = useState("");

    const [
        competitionRules,
        setCompetitionRules
    ] = useState("");

    const [
        competitionAnnouncements,
        setCompetitionAnnouncements
    ] = useState<CompetitionAnnouncement[]>([]);

    const [
        competitionLoading,
        setCompetitionLoading
    ] = useState(false);

    const [
        competitionSaving,
        setCompetitionSaving
    ] = useState(false);

    const loadCompetitionAnnouncements = async () => {
        try {
            setCompetitionLoading(true);

            const rows =
                await getCompetitionAnnouncements();

            setCompetitionAnnouncements(rows);
        } catch (error) {
            console.error(
                "COMPETITION CONTROL LOAD ERROR",
                error
            );
        } finally {
            setCompetitionLoading(false);
        }
    };

    useEffect(() => {
        void loadCompetitionAnnouncements();
    }, []);

    const handleCompetitionSchoolChange =
        async (schoolUuid: string) => {

            const school =
                schools.find(
                    s =>
                        s.schoolUuid ===
                        schoolUuid
                );

            setCompetitionSchoolUuid(
                schoolUuid
            );

            setCompetitionSchoolName(
                school?.schoolName ?? ""
            );

            setCompetitionClass("");
            setCompetitionSection("");
            setCompetitionClasses([]);

            if (!schoolUuid || !school) {
                return;
            }

            try {
                setCompetitionLoading(true);

                const options =
                    await getCompetitionClassOptions(
                        school.schoolName
                    );

                setCompetitionClasses(
                    options
                );
            } catch (error) {
                console.error(
                    "COMPETITION CLASS LOAD ERROR",
                    error
                );
            } finally {
                setCompetitionLoading(false);
            }
        };

    const handleCreateCompetitionAnnouncement =
        async () => {

            if (
                !competitionSchoolUuid ||
                !competitionSchoolName ||
                !competitionClass ||
                !competitionEventName.trim() ||
                !competitionStartAt ||
                !competitionEndAt
            ) {
                alert(
                    "Please select the school, class, competition name, start time and end time."
                );
                return;
            }

            try {

                setCompetitionSaving(true);

                const created =
                    await createCompetitionAnnouncement({
                        schoolUuid:
                            competitionSchoolUuid,

                        schoolName:
                            competitionSchoolName,

                        className:
                            competitionClass,

                        sectionName:
                            competitionSection ||
                            null,

                        eventName:
                            competitionEventName,

                        startsAt:
                            competitionStartAt,

                        endsAt:
                            competitionEndAt,

                        rules:
                            competitionRules
                    });

                if (!created) {
                    alert(
                        "Unable to create competition announcement."
                    );
                    return;
                }

                setCompetitionAnnouncements(
                    prev => [
                        created,
                        ...prev
                    ]
                );

                setCompetitionEventName("");
                setCompetitionStartAt("");
                setCompetitionEndAt("");
                setCompetitionRules("");

                alert(
                    "Competition announcement created successfully."
                );

            } catch (error: any) {

                console.error(
                    "COMPETITION ANNOUNCEMENT SAVE ERROR",
                    error
                );

                alert(
                    error?.message ??
                    "Unable to create competition announcement."
                );

            } finally {

                setCompetitionSaving(false);

            }
        };

    const handleRevokeCompetitionAnnouncement =
        async (
            announcementId: string
        ) => {

            const confirmed =
                window.confirm(
                    "Revoke this competition window? Students will no longer be allowed to submit entries for it."
                );

            if (!confirmed) {
                return;
            }

            const ok =
                await revokeCompetitionAnnouncement(
                    announcementId
                );

            if (!ok) {
                alert(
                    "Unable to revoke competition window."
                );
                return;
            }

            setCompetitionAnnouncements(
                prev =>
                    prev.map(item =>
                        item.id ===
                        announcementId
                            ? {
                                ...item,
                                isActive: false
                            }
                            : item
                    )
            );
        };

    const toggle = (

        key: string,

        list: string[],

        set: (x: string[]) => void

    ) =>

        set(

            list.includes(key)

                ? list.filter(

                      x => x !== key

                  )

                : [

                      ...list,

                      key

                  ]

        );

const reset = () => {

    setSchoolName("");

    setBoard("");

    setCity("");

    setStudentProfileLimit("");

    setTeacherProfileLimit("");

    setSchoolAdminProfileLimit("");

    setSubscriptionPlan("ONE_MONTH");

    setSubscriptionStartDate(

        new Date()

            .toISOString()

            .slice(0,10)

    );

    setSubscriptionEndDate("");

    setGracePeriodDays("0");

    setEditing(false);

    setEditingSchoolUuid("");

    setStudentFeatures(

        STUDENT_FEATURES.map(

            x => x.key

        )

    );

    setTeacherFeatures(

        TEACHER_FEATURES.map(

            x => x.key

        )

    );




    setStudentParentOtpEnabled(true);
    setStudentQuestionnaireEnabled(true);
};

function calculateEndDate(
    plan: string,
    start: string
) {
    if (!start?.trim()) {
        return "";
    }

    const date = new Date(start);

    if (isNaN(date.getTime())) {
        return "";
    }

    switch (plan) {

        case "TWO_WEEKS":
            date.setDate(date.getDate() + 14);
            break;

        case "ONE_MONTH":
            date.setMonth(date.getMonth() + 1);
            break;

        case "THREE_MONTHS":
            date.setMonth(date.getMonth() + 3);
            break;

        default:
            break;
    }

    return date
        .toISOString()
        .slice(0,10);
}

    async function save() {

        if (

            !schoolName ||

            !board ||

            !city ||

            studentProfileLimit === "" ||

            teacherProfileLimit === "" ||

            schoolAdminProfileLimit === ""

        ) {

            alert(

                "Please fill all fields."

            );

            return;

        }

if (!subscriptionStartDate.trim()) {

    alert("Subscription Start Date is required.");

    return;

}

if (

    subscriptionPlan === "CUSTOM" &&

    !subscriptionEndDate.trim()

) {

    alert("Subscription End Date is required.");

    return;

}

        const limits = {

            studentProfileLimit:

                Number(

                    studentProfileLimit

                ),

            teacherProfileLimit:

                Number(

                    teacherProfileLimit

                ),

            schoolAdminProfileLimit:

                Number(

                    schoolAdminProfileLimit

                )

        };

        const subscription: SchoolSubscriptionDetails = {

    subscriptionPlan,

    subscriptionStartDate,

  subscriptionEndDate:

    subscriptionPlan === "CUSTOM"

        ? (
            subscriptionEndDate.trim()
                ? subscriptionEndDate
                : null
          )

        : calculateEndDate(
            subscriptionPlan,
            subscriptionStartDate
        ),

    subscriptionStatus:

        "ACTIVE",

    gracePeriodDays:

        Number(

            gracePeriodDays

        ),

    subscriptionNotes:

        ""

};

console.log("===== SAVE PAYLOAD =====");

console.log({
    schoolName,
    board,
    city,
    limits,
    subscription
});

                const ok = editing

            ? await editSchool(
    editingSchoolUuid,
    schoolName,
    board,
    city,
    limits,
    subscription,
    studentFeatures,
    teacherFeatures,
    studentParentOtpEnabled,
    studentQuestionnaireEnabled

              )

          : await addSchool(

      schoolName,

      board,

      city,

      limits,

      subscription,

      studentFeatures,

      teacherFeatures,
      studentParentOtpEnabled,
      studentQuestionnaireEnabled

  );

        if (!ok) {

            alert(

                "Unable to save."

            );

            return;

        }

        reset();

    }

   async function startEdit(
    s: SchoolRecord
) {

        setEditing(true);

        setEditingSchoolUuid(
            s.schoolUuid
        );

        setSchoolName(
            s.schoolName
        );

        setBoard(
            s.board
        );

        setCity(
            s.city
        );

        setStudentProfileLimit(
            String(
                s.studentProfileLimit
            )
        );

        setTeacherProfileLimit(
            String(
                s.teacherProfileLimit
            )
        );

        setSchoolAdminProfileLimit(
            String(
                s.schoolAdminProfileLimit
            )
        );

        setSubscriptionPlan(
    s.subscriptionPlan ?? "CUSTOM"
);

setSubscriptionStartDate(

    s.subscriptionStartDate

        ? s.subscriptionStartDate.slice(0,10)

        : new Date()
            .toISOString()
            .slice(0,10)

);

setSubscriptionEndDate(

    s.subscriptionEndDate

        ? s.subscriptionEndDate.slice(0,10)

        : ""

);

setGracePeriodDays(
    String(
        s.gracePeriodDays ?? 0
    )
);

        const f =
            await getSchoolFeatureConfiguration(
                s.schoolUuid
            );

        setStudentFeatures(
            f.student
        );

        setTeacherFeatures(
            f.teacher
        );

        const onboardingConfig =
            await getStudentOnboardingConfiguration(
                s.schoolUuid
            );

        setStudentParentOtpEnabled(
            onboardingConfig.parentOtpEnabled
        );

        setStudentQuestionnaireEnabled(
            onboardingConfig.questionnaireEnabled
        );

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }

    async function search() {

        setAccounts(

            await searchPlatformAccounts(
                q
            )

        );

    }

    async function status(
        a: PlatformAccount
    ) {

        await setPlatformAccountSuspended(

            a,

            a.accountStatus.toLowerCase() !==
                "suspended"

        );

        await search();

    }

    return (

        <div

            style={{

                display: "flex",

                flexDirection: "column",

                gap: 28

            }}

        >

            <header>

                <h1

                    style={{

                        margin: 0,

                        fontSize: 32,

                        fontWeight: 800,

                        color: "#143B73"

                    }}

                >

                    School Management & Profile Capacity

                </h1>

                <p

                    style={{

                        color: "#64748B"

                    }}

                >

                    Manage school contracts,

                    portal access and

                    profile capacity.

                </p>

            </header>

            <section style={card}>

                <h3>

                    {

                        editing

                            ? "Edit School"

                            : "Add School"

                    }

                </h3>

                                {

                    [

                        [

                            "School Name",

                            schoolName,

                            setSchoolName

                        ],

                        [

                            "Education Board",

                            board,

                            setBoard

                        ],

                        [

                            "School City",

                            city,

                            setCity

                        ]

                    ].map(

                        ([

                            l,

                            v,

                            s

                        ]: any) => (

                            <div key={l}>

                                <label style={label}>

                                    {l}

                                </label>

                                <input

                                    value={v}

                                    onChange={

                                        e =>

                                            s(

                                                e.target.value

                                            )

                                    }

                                    style={input}

                                />

                            </div>

                        )

                    )

                }

                <div

                    style={{

                        display: "grid",

                        gridTemplateColumns:
                            "repeat(3,minmax(0,1fr))",

                        gap: 12

                    }}

                >

                    {

                        [

                            [

                                "Student Profile Limit",

                                studentProfileLimit,

                                setStudentProfileLimit

                            ],

                            [

                                "Teacher Profile Limit",

                                teacherProfileLimit,

                                setTeacherProfileLimit

                            ],

                            [

                                "School Admin Profile Limit",

                                schoolAdminProfileLimit,

                                setSchoolAdminProfileLimit

                            ]

                        ].map(

                            ([

                                l,

                                v,

                                s

                            ]: any) => (

                                <div key={l}>

                                    <label style={label}>

                                        {l}

                                    </label>

                                    <input

                                        type="number"

                                        min={0}

                                        value={v}

                                        onChange={

                                            e =>

                                                s(

                                                    e.target.value

                                                )

                                        }

                                        style={input}

                                    />

                                </div>

                            )

                        )

                    }

                </div>

          <div
    style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: 18,
        padding: 24,
        marginBottom: 30,
        boxShadow: "0 2px 8px rgba(15,23,42,.05)"
    }}
>

    <div
        style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 22
        }}
    >

        <div>

            <h3
                style={{
                    margin: 0,
                    color: "#143B73",
                    fontSize: 22,
                    fontWeight: 700
                }}
            >
                Portal Access Configuration
            </h3>

            <p
                style={{
                    marginTop: 6,
                    color: "#64748B",
                    fontSize: 14
                }}
            >
                Select the modules available for this school's Student and Teacher portals.
            </p>

        </div>

    </div>

    <div
        style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 28
        }}
    >

        <div
            style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: 14,
                padding: 20
            }}
        >

            <div
                style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#143B73",
                    marginBottom: 18
                }}
            >
                🎓 Student Portal
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(2,minmax(0,1fr))",
                    gap: 12
                }}
            >

                                {

                    STUDENT_FEATURES.map(

                        feature => (

                            <label

                                key={feature.key}

                                style={{

                                    display: "flex",

                                    alignItems: "center",

                                    gap: 10,

                                    padding: "12px 14px",

                                    background: "white",

                                    border: "1px solid #E2E8F0",

                                    borderRadius: 10,

                                    cursor: "pointer",

                                    transition: "all .2s ease"

                                }}

                            >

                                <input

                                    type="checkbox"

                                    checked={

                                        studentFeatures.includes(

                                            feature.key

                                        )

                                    }

                                    onChange={() =>

                                        toggle(

                                            feature.key,

                                            studentFeatures,

                                            setStudentFeatures

                                        )

                                    }

                                />

                                <span

                                    style={{

                                        fontWeight: 600,

                                        color: "#334155"

                                    }}

                                >

                                    {feature.label}

                                </span>

                            </label>

                        )

                    )

                }

            </div>

        </div>

        <div

            style={{

                background: "#F8FAFC",

                border: "1px solid #E2E8F0",

                borderRadius: 14,

                padding: 20

            }}

        >

            <div

                style={{

                    fontSize: 18,

                    fontWeight: 700,

                    color: "#143B73",

                    marginBottom: 18

                }}

            >

                👨‍🏫 Teacher Portal

            </div>

            <div

                style={{

                    display: "grid",

                    gridTemplateColumns:
                        "repeat(2,minmax(0,1fr))",

                    gap: 12

                }}

            >

                {

                    TEACHER_FEATURES.map(

                        feature => (

                            <label

                                key={feature.key}

                                style={{

                                    display: "flex",

                                    alignItems: "center",

                                    gap: 10,

                                    padding: "12px 14px",

                                    background: "white",

                                    border: "1px solid #E2E8F0",

                                    borderRadius: 10,

                                    cursor: "pointer",

                                    transition: "all .2s ease"

                                }}

                            >

                                <input

                                    type="checkbox"

                                    checked={

                                        teacherFeatures.includes(

                                            feature.key

                                        )

                                    }

                                    onChange={() =>

                                        toggle(

                                            feature.key,

                                            teacherFeatures,

                                            setTeacherFeatures

                                        )

                                    }

                                />

                                <span

                                    style={{

                                        fontWeight: 600,

                                        color: "#334155"

                                    }}

                                >

                                    {feature.label}

                                </span>

                            </label>

                        )

                    )

                }

            </div>

        </div>

    </div>

</div>

<div
    style={{
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
        borderRadius: 14,
        padding: 20,
        marginTop: 18,
        marginBottom: 10
    }}
>
    <div style={{ fontSize: 18, fontWeight: 700, color: "#143B73", marginBottom: 8 }}>
        🎓 Student Onboarding
    </div>
    <div style={{ color: "#64748B", fontSize: 12, lineHeight: 1.5, marginBottom: 14 }}>
        Select which onboarding steps new Student Portal accounts complete after the student profile. Teacher onboarding remains unchanged.
    </div>
    <div style={checks}>
        <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "white", border: "1px solid #E2E8F0", borderRadius: 10, cursor: "pointer" }}>
            <input type="checkbox" checked={studentParentOtpEnabled} onChange={() => setStudentParentOtpEnabled(value => !value)} />
            <span style={{ fontWeight: 600, color: "#334155" }}>Parent OTP verification</span>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "white", border: "1px solid #E2E8F0", borderRadius: 10, cursor: "pointer" }}>
            <input type="checkbox" checked={studentQuestionnaireEnabled} onChange={() => setStudentQuestionnaireEnabled(value => !value)} />
            <span style={{ fontWeight: 600, color: "#334155" }}>Student questionnaire</span>
        </label>
    </div>
    <div style={{ color: "#94A3B8", fontSize: 11, lineHeight: 1.45, marginTop: 8 }}>
        Both: Profile → Parent OTP → Questionnaire → Portal. OTP only: Profile → Parent OTP → Portal. Questionnaire only: Profile → Questionnaire → Portal. Neither: Profile → Portal.
    </div>
</div>

<h4
    style={{
        marginTop: 30,
        marginBottom: 18,
        color: "#143B73",
        fontSize: 20,
        fontWeight: 700
    }}
>
    School Subscription
</h4>

<div
    style={{
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
        borderRadius: 14,
        padding: 22,
        marginBottom: 24
    }}
>

    <div
        style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
            gap: 18
        }}
    >

        <div>

            <label style={label}>
                Subscription Plan
            </label>

            <select
                value={subscriptionPlan}
                onChange={e =>
                    setSubscriptionPlan(
                        e.target.value
                    )
                }
                style={input}
            >

                <option value="TWO_WEEKS">
                    Two Weeks
                </option>

                <option value="ONE_MONTH">
                    One Month
                </option>

                <option value="THREE_MONTHS">
                    Three Months
                </option>

                <option value="CUSTOM">
                    Custom Date
                </option>

            </select>

        </div>

        <div>

            <label style={label}>
                Grace Period (Days)
            </label>

            <input
                type="number"
                min={0}
                value={gracePeriodDays}
                onChange={e =>
                    setGracePeriodDays(
                        e.target.value
                    )
                }
                style={input}
            />

        </div>

        <div>

            <label style={label}>
                Subscription Start Date
            </label>

            <input
                type="date"
                value={subscriptionStartDate}
                onChange={e =>
                    setSubscriptionStartDate(
                        e.target.value
                    )
                }
                style={input}
            />

        </div>

        <div>

            <label style={label}>
                Subscription End Date
            </label>

            {

                subscriptionPlan === "CUSTOM"

                    ? (

                        <input
                            type="date"
                            value={subscriptionEndDate}
                            onChange={e =>
                                setSubscriptionEndDate(
                                    e.target.value
                                )
                            }
                            style={input}
                        />

                    )

                    : (

                        <div
                            style={{
                                ...input,
                                display: "flex",
                                alignItems: "center",
                                background: "#F1F5F9",
                                fontWeight: 600,
                                color: "#143B73"
                            }}
                        >

                            {

                                calculateEndDate(

                                    subscriptionPlan,

                                    subscriptionStartDate

                                )

                            }

                        </div>

                    )

            }

        </div>

    </div>

    <div
        style={{
            marginTop: 20,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center"
        }}
    >

        <span
            style={{
                background: "#DCFCE7",
                color: "#166534",
                padding: "8px 16px",
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 13
            }}
        >
            Status : ACTIVE
        </span>

        <span
            style={{
                color: "#64748B",
                fontSize: 13
            }}
        >
            Subscription becomes active immediately after school creation.
        </span>

    </div>

</div>

                <button

                    onClick={save}

                    style={primary}

                >

                    {

                        editing

                            ? "Update School"

                            : "Add School"

                    }

                </button>

                {

                    editing && (

                        <button

                            onClick={reset}

                            style={{

                                ...primary,

                                background:

                                    "#64748B",

                                marginLeft: 10

                            }}

                        >

                            Cancel

                        </button>

                    )

                }

            </section>

      <section
    style={{
        background: "#FFFFFF",
        borderRadius: 20,
        padding: 28,
        boxShadow: "0 4px 14px rgba(15,23,42,.06)"
    }}
>

    <div
        style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 18,
            marginBottom: 28
        }}
    >

        <div>

            <h2
                style={{
                    margin: 0,
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#143B73"
                }}
            >
                Schools
            </h2>

            <div
                style={{
                    marginTop: 6,
                    color: "#64748B",
                    fontSize: 15
                }}
            >
                Manage schools, profile capacity, subscriptions and portal access.
            </div>

        </div>

        <div
            style={{
                background: "#EFF6FF",
                color: "#1D4ED8",
                padding: "10px 18px",
                borderRadius: 999,
                fontWeight: 700
            }}
        >
            {schools.length} Schools
        </div>

    </div>

    {loading && <p>Loading...</p>}

    <div
        style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(430px,1fr))",
            gap: 22
        }}
    >

        {schools.map((s) => (

            <div
                key={s.schoolUuid}
                style={{
                    background: "#FFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: 18,
                    padding: 22,
                    display: "flex",
                    flexDirection: "column",
                    gap: 18,
                    boxShadow: "0 2px 8px rgba(15,23,42,.05)"
                }}
            >

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 18
                    }}
                >

                    <div style={{ flex: 1 }}>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                flexWrap: "wrap"
                            }}
                        >

                            <span
                                style={{
                                    fontSize: 22,
                                    fontWeight: 700,
                                    color: "#143B73"
                                }}
                            >
                                🏫 {s.schoolName}
                            </span>

                            <span
                                style={{
                                    background: s.isActive ? "#DCFCE7" : "#FEE2E2",
                                    color: s.isActive ? "#166534" : "#991B1B",
                                    padding: "6px 12px",
                                    borderRadius: 999,
                                    fontWeight: 700,
                                    fontSize: 11
                                }}
                            >
                                {s.isActive ? "ACTIVE" : "INACTIVE"}
                            </span>

                            <span
                                style={{
                                    background: "#EFF6FF",
                                    color: "#1D4ED8",
                                    padding: "6px 12px",
                                    borderRadius: 999,
                                    fontWeight: 700,
                                    fontSize: 11
                                }}
                            >
                                {s.subscriptionPlan ?? "CUSTOM"}
                            </span>

                        </div>

                        <div
                            style={{
                                marginTop: 8,
                                color: "#64748B"
                            }}
                        >
                            {s.board} • {s.city}
                        </div>

                        <div
                            style={{
                                marginTop: 10,
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 16,
                                color: "#64748B",
                                fontSize: 13
                            }}
                        >

                            <span>
                                📅 Start:
                                {" "}
                                {s.subscriptionStartDate ?? "--"}
                            </span>

                            <span>
                                📅 End:
                                {" "}
                                {s.subscriptionEndDate ?? "Unlimited"}
                            </span>

                            <span>
                                ⏳ Grace:
                                {" "}
                                {s.gracePeriodDays ?? 0}
                                {" "}
                                days
                            </span>

                        </div>

                    </div>

                </div>

                <div
                    style={{
                        display: "grid",
                        gap: 14
                    }}
                >

                    <div>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: 6,
                                fontWeight: 600
                            }}
                        >
                            <span>Students</span>

                            <span>
                                {s.studentProfilesUsed} / {s.studentProfileLimit}
                            </span>

                        </div>

                        <progress
                            value={s.studentProfilesUsed}
                            max={s.studentProfileLimit || 1}
                            style={{
                                width: "100%",
                                height: 10
                            }}
                        />

                    </div>

                    <div>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: 6,
                                fontWeight: 600
                            }}
                        >
                            <span>Teachers</span>

                            <span>
                                {s.teacherProfilesUsed} / {s.teacherProfileLimit}
                            </span>

                        </div>

                        <progress
                            value={s.teacherProfilesUsed}
                            max={s.teacherProfileLimit || 1}
                            style={{
                                width: "100%",
                                height: 10
                            }}
                        />

                    </div>

                    <div>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: 6,
                                fontWeight: 600
                            }}
                        >
                            <span>School Admins</span>

                            <span>
                                {s.schoolAdminProfilesUsed} / {s.schoolAdminProfileLimit}
                            </span>

                        </div>

                        <progress
                            value={s.schoolAdminProfilesUsed}
                            max={s.schoolAdminProfileLimit || 1}
                            style={{
                                width: "100%",
                                height: 10
                            }}
                        />

                    </div>

                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 10,
                        flexWrap: "wrap",
                        gap: 12
                    }}
                >

                    <div
                        style={{
                            fontSize: 12,
                            color: "#94A3B8"
                        }}
                    >
                        {s.schoolUuid}
                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: 10
                        }}
                    >

                        <button
                            onClick={() => startEdit(s)}
                            style={small}
                        >
                            ✏️ Edit
                        </button>

                        {s.isActive ? (

                            <button
                                onClick={async () => {
                                    if (!window.confirm(`Deactivate ${s.schoolName}? This will immediately block Student, Teacher and School Admin portal access for this school.`)) return;
                                    const ok = await removeSchool(s.schoolUuid);
                                    if (!ok) alert("Unable to deactivate the school.");
                                }}
                                style={{
                                    ...small,
                                    background: "#FFFFFF",
                                    color: "#DC2626",
                                    border: "1px solid #DC2626"
                                }}
                            >
                                Deactivate
                            </button>

                        ) : (

                            <button
                                onClick={async () => {
                                    const ok = await activateExistingSchool(s.schoolUuid);
                                    if (!ok) alert("Unable to activate the school.");
                                }}
                                style={{
                                    ...small,
                                    background: "#FFFFFF",
                                    color: "#166534",
                                    border: "1px solid #16A34A"
                                }}
                            >
                                Activate
                            </button>

                        )}

                        <button
                            onClick={async () => {
                                const first = window.confirm(`DELETE ${s.schoolName}? This is permanent and will remove the school's platform data and accounts. This cannot be recovered.`);
                                if (!first) return;
                                const second = window.confirm("Final confirmation: permanently delete this school and all of its stored platform data?");
                                if (!second) return;
                                const ok = await deleteExistingSchool(s.schoolUuid);
                                if (!ok) alert("Unable to delete the school. No destructive client-side deletion was performed.");
                            }}
                            style={{
                                ...small,
                                background: "#DC2626",
                                color: "#FFFFFF",
                                border: "1px solid #DC2626"
                            }}
                        >
                            Delete
                        </button>

                    </div>

                </div>

            </div>

        ))}

    </div>

</section>

                        <section style={card}>

                <h3>

                    Platform Account Control

                </h3>

                <p

                    style={{

                        color: "#64748B"

                    }}

                >

                    Search students,

                    teachers,

                    school administrators

                    and partners,

                    then suspend or

                    reactivate their

                    portal profile.

                </p>

                <div

                    style={{

                        display: "flex",

                        gap: 10

                    }}

                >

                    <input

                        value={q}

                        onChange={

                            e =>

                                setQ(

                                    e.target.value

                                )

                        }

                        onKeyDown={

                            e =>

                                e.key === "Enter" &&

                                search()

                        }

                        placeholder="Search name, email or phone"

                        style={{

                            ...input,

                            marginBottom: 0

                        }}

                    />

                    <button

                        onClick={search}

                        style={primary}

                    >

                        Search

                    </button>

                </div>

                {

                    accounts.map(

                        a => (

                            <div

                                key={

                                    a.sourceTable +

                                    a.profileUuid

                                }

                                style={{

                                    display: "grid",

                                    gridTemplateColumns:

                                        "1.3fr 1fr 1fr auto",

                                    gap: 12,

                                    padding: "14px 0",

                                    borderBottom:

                                        "1px solid #E2E8F0",

                                    alignItems: "center"

                                }}

                            >

                                <div>

                                    <b>

                                        {

                                            a.profileName

                                        }

                                    </b>

                                    <div

                                        style={{

                                            fontSize: 12,

                                            color: "#64748B"

                                        }}

                                    >

                                        {

                                            a.role

                                        }

                                        {" · "}

                                        {

                                            a.schoolName ||

                                            "—"

                                        }

                                    </div>

                                </div>

                                <div>

                                    {

                                        a.email

                                    }

                                </div>

                                <div>

                                    {

                                        a.accountStatus

                                    }

                                </div>

                                <button

                                    onClick={() =>

                                        status(a)

                                    }

                                    style={small}

                                >

                                    {

                                        a.accountStatus

                                            .toLowerCase() ===

                                        "suspended"

                                            ? "Reactivate"

                                            : "Suspend"

                                    }

                                </button>

                            </div>

                        )

                    )

                }

            </section>

            {/* ============================================================
                COMPETITION CONTROL
                Keep this section at the bottom of the existing registry.
            ============================================================ */}

            <section className="competition-admin-control" style={card}>

                <style>{`
                    .competition-admin-control {
                        overflow: hidden;
                    }

                    .competition-admin-grid {
                        display: grid;
                        grid-template-columns:
                            repeat(3, minmax(0, 1fr));
                        gap: 12px;
                    }

                    .competition-admin-span-2 {
                        grid-column: span 2;
                    }

                    .competition-admin-form {
                        background: #F8FAFC;
                        border: 1px solid #E2E8F0;
                        border-radius: 14px;
                        padding: 16px;
                    }

                    .competition-admin-title {
                        color: #143B73;
                        font-size: 20px;
                        font-weight: 800;
                        margin: 0;
                    }

                    .competition-admin-subtitle {
                        margin: 5px 0 16px;
                        color: #64748B;
                        font-size: 12px;
                        line-height: 1.45;
                    }

                    .competition-admin-field label {
                        display: block;
                        margin-bottom: 5px;
                        color: #334155;
                        font-size: 10px;
                        font-weight: 800;
                        letter-spacing: .35px;
                    }

                    .competition-admin-field input,
                    .competition-admin-field select,
                    .competition-admin-field textarea {
                        width: 100%;
                        min-width: 0;
                        box-sizing: border-box;
                        border: 1px solid #CBD5E1;
                        border-radius: 9px;
                        background: #FFFFFF;
                        color: #334155;
                        padding: 9px 10px;
                        font-size: 11px;
                        outline: none;
                    }

                    .competition-admin-field textarea {
                        min-height: 74px;
                        resize: vertical;
                        line-height: 1.4;
                    }

                    .competition-admin-actions {
                        display: flex;
                        justify-content: flex-end;
                        margin-top: 12px;
                    }

                    .competition-admin-list {
                        margin-top: 14px;
                        border-top: 1px solid #E2E8F0;
                    }

                    .competition-admin-row {
                        display: grid;
                        grid-template-columns:
                            minmax(160px, 1.4fr)
                            minmax(90px, .7fr)
                            minmax(160px, 1fr)
                            minmax(140px, .9fr)
                            auto;
                        gap: 10px;
                        align-items: center;
                        padding: 11px 0;
                        border-bottom: 1px solid #E2E8F0;
                    }

                    .competition-admin-row-main {
                        min-width: 0;
                    }

                    .competition-admin-row-title {
                        color: #0F172A;
                        font-size: 11px;
                        font-weight: 800;
                    }

                    .competition-admin-row-meta {
                        margin-top: 3px;
                        color: #64748B;
                        font-size: 9px;
                        line-height: 1.35;
                    }

                    .competition-admin-status {
                        width: fit-content;
                        padding: 4px 7px;
                        border-radius: 999px;
                        font-size: 8px;
                        font-weight: 900;
                        letter-spacing: .5px;
                        text-transform: uppercase;
                    }

                    @media (max-width: 1024px) {
                        .competition-admin-grid {
                            grid-template-columns:
                                repeat(2, minmax(0, 1fr));
                        }

                        .competition-admin-span-2 {
                            grid-column: span 2;
                        }

                        .competition-admin-row {
                            grid-template-columns:
                                minmax(150px, 1.4fr)
                                minmax(80px, .7fr)
                                minmax(140px, 1fr)
                                auto;
                        }

                        .competition-admin-row > div:nth-child(4) {
                            display: none;
                        }
                    }

                    @media (max-width: 767px) {
                        .competition-admin-control {
                            padding: 14px !important;
                            border-radius: 14px !important;
                        }

                        .competition-admin-title {
                            font-size: 16px !important;
                        }

                        .competition-admin-subtitle {
                            font-size: 9px !important;
                            margin-bottom: 12px !important;
                        }

                        .competition-admin-form {
                            padding: 11px !important;
                            border-radius: 11px !important;
                        }

                        .competition-admin-grid {
                            grid-template-columns:
                                repeat(2, minmax(0, 1fr)) !important;
                            gap: 8px !important;
                        }

                        .competition-admin-span-2 {
                            grid-column: span 2 !important;
                        }

                        .competition-admin-field label {
                            font-size: 8px !important;
                            margin-bottom: 3px !important;
                        }

                        .competition-admin-field input,
                        .competition-admin-field select,
                        .competition-admin-field textarea {
                            padding: 7px 8px !important;
                            border-radius: 7px !important;
                            font-size: 9px !important;
                        }

                        .competition-admin-field textarea {
                            min-height: 55px !important;
                        }

                        .competition-admin-row {
                            grid-template-columns:
                                minmax(0, 1fr) auto !important;
                            gap: 7px !important;
                            padding: 9px 0 !important;
                        }

                        .competition-admin-row > div:nth-child(2),
                        .competition-admin-row > div:nth-child(3),
                        .competition-admin-row > div:nth-child(4) {
                            grid-column: span 2 !important;
                        }

                        .competition-admin-row > div:nth-child(3),
                        .competition-admin-row > div:nth-child(4) {
                            display: block !important;
                        }

                        .competition-admin-row-title {
                            font-size: 9px !important;
                        }

                        .competition-admin-row-meta {
                            font-size: 7.5px !important;
                        }

                        .competition-admin-status {
                            font-size: 7px !important;
                            padding: 3px 5px !important;
                        }
                    }
                `}</style>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 12,
                        marginBottom: 14
                    }}
                >
                    <div>
                        <h3 className="competition-admin-title">
                            Competition Command Control
                        </h3>

                        <p className="competition-admin-subtitle">
                            Announce exactly when a school can accept
                            competition entries. Students in the selected
                            class and section will see the live banner and
                            can submit once per event during this window.
                        </p>
                    </div>

                    <div
                        style={{
                            flexShrink: 0,
                            padding: "5px 8px",
                            borderRadius: 999,
                            background: "#FFF7ED",
                            border: "1px solid #FED7AA",
                            color: "#C2410C",
                            fontSize: 8,
                            fontWeight: 900,
                            letterSpacing: .5
                        }}
                    >
                        4 EVENTS
                    </div>
                </div>

                <div className="competition-admin-form">

                    <div className="competition-admin-grid">

                        <div className="competition-admin-field">
                            <label>School</label>

                            <select
                                value={
                                    competitionSchoolUuid
                                }
                                onChange={e =>
                                    void handleCompetitionSchoolChange(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="">
                                    Select school
                                </option>

                                {schools
                                    .filter(
                                        s =>
                                            s.isActive
                                    )
                                    .map(s => (
                                        <option
                                            key={
                                                s.schoolUuid
                                            }
                                            value={
                                                s.schoolUuid
                                            }
                                        >
                                            {
                                                s.schoolName
                                            }
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="competition-admin-field">
                            <label>Class</label>

                            <select
                                value={
                                    competitionClass
                                }
                                disabled={
                                    !competitionSchoolUuid ||
                                    competitionClasses.length === 0
                                }
                                onChange={e => {
                                    setCompetitionClass(
                                        e.target.value
                                    );
                                    setCompetitionSection("");
                                }}
                            >
                                <option value="">
                                    Select class
                                </option>

                                {competitionClasses.map(
                                    item => (
                                        <option
                                            key={
                                                item.className
                                            }
                                            value={
                                                item.className
                                            }
                                        >
                                            {
                                                item.className
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div className="competition-admin-field">
                            <label>Section</label>

                            <select
                                value={
                                    competitionSection
                                }
                                disabled={
                                    !competitionClass
                                }
                                onChange={e =>
                                    setCompetitionSection(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="">
                                    All sections
                                </option>

                                {(
                                    competitionClasses.find(
                                        item =>
                                            item.className ===
                                            competitionClass
                                    )?.sections ??
                                    []
                                ).map(
                                    section => (
                                        <option
                                            key={section}
                                            value={section}
                                        >
                                            Section {section}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div className="competition-admin-field competition-admin-span-2">
                            <label>
                                Competition Banner Heading
                            </label>

                            <input
                                value={
                                    competitionEventName
                                }
                                onChange={e =>
                                    setCompetitionEventName(
                                        e.target.value
                                    )
                                }
                                placeholder="e.g. August Talent Challenge — Submissions Open"
                            />
                        </div>

                        <div className="competition-admin-field">
                            <label>Starting Date & Time</label>

                            <input
                                type="datetime-local"
                                value={
                                    competitionStartAt
                                }
                                onChange={e =>
                                    setCompetitionStartAt(
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                        <div className="competition-admin-field">
                            <label>Ending Date & Time</label>

                            <input
                                type="datetime-local"
                                value={
                                    competitionEndAt
                                }
                                onChange={e =>
                                    setCompetitionEndAt(
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                        <div className="competition-admin-field competition-admin-span-2">
                            <label>
                                Rules / Student Instructions
                            </label>

                            <textarea
                                value={
                                    competitionRules
                                }
                                onChange={e =>
                                    setCompetitionRules(
                                        e.target.value
                                    )
                                }
                                placeholder="Example: One submission per event. Choose any one challenge from this event. Upload your best performance evidence."
                            />
                        </div>

                    </div>

                    <div className="competition-admin-actions">
                        <button
                            type="button"
                            onClick={
                                handleCreateCompetitionAnnouncement
                            }
                            disabled={
                                competitionSaving
                            }
                            style={{
                                ...primary,
                                padding:
                                    "9px 16px",
                                fontSize: 10,
                                opacity:
                                    competitionSaving
                                        ? .6
                                        : 1
                            }}
                        >
                            {
                                competitionSaving
                                    ? "ANNOUNCING..."
                                    : "ANNOUNCE COMPETITION →"
                            }
                        </button>
                    </div>

                </div>

                <div
                    style={{
                        marginTop: 16,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10
                    }}
                >
                    <div
                        style={{
                            color: "#143B73",
                            fontSize: 12,
                            fontWeight: 800
                        }}
                    >
                        Competition Windows
                    </div>

                    <button
                        type="button"
                        onClick={
                            () =>
                                void loadCompetitionAnnouncements()
                        }
                        style={{
                            ...small,
                            padding:
                                "5px 9px",
                            fontSize: 8
                        }}
                    >
                        Refresh
                    </button>
                </div>

                <div className="competition-admin-list">

                    {competitionLoading ? (
                        <div
                            style={{
                                padding: "14px 0",
                                color: "#64748B",
                                fontSize: 9
                            }}
                        >
                            Loading competition controls...
                        </div>
                    ) : competitionAnnouncements.length === 0 ? (
                        <div
                            style={{
                                padding: "14px 0",
                                color: "#94A3B8",
                                fontSize: 9
                            }}
                        >
                            No competition windows have been announced yet.
                        </div>
                    ) : (
                        competitionAnnouncements.map(
                            announcement => {

                                const now =
                                    Date.now();

                                const start =
                                    new Date(
                                        announcement.startsAt
                                    ).getTime();

                                const end =
                                    new Date(
                                        announcement.endsAt
                                    ).getTime();

                                const live =
                                    announcement.isActive &&
                                    now >= start &&
                                    now <= end;

                                const upcoming =
                                    announcement.isActive &&
                                    now < start;

                                const statusLabel =
                                    !announcement.isActive
                                        ? "Revoked"
                                        : live
                                            ? "Live"
                                            : upcoming
                                                ? "Upcoming"
                                                : "Ended";

                                return (
                                    <div
                                        key={
                                            announcement.id
                                        }
                                        className="competition-admin-row"
                                    >
                                        <div className="competition-admin-row-main">
                                            <div className="competition-admin-row-title">
                                                {
                                                    announcement.eventName
                                                }
                                            </div>

                                            <div className="competition-admin-row-meta">
                                                {
                                                    announcement.schoolName
                                                }
                                                {" · "}
                                                {
                                                    announcement.className
                                                }
                                                {" · "}
                                                {
                                                    announcement.sectionName ||
                                                    "All Sections"
                                                }
                                            </div>
                                        </div>

                                        <div>
                                            <span
                                                className="competition-admin-status"
                                                style={{
                                                    background:
                                                        live
                                                            ? "#DCFCE7"
                                                            : upcoming
                                                                ? "#DBEAFE"
                                                                : "#F1F5F9",
                                                    color:
                                                        live
                                                            ? "#15803D"
                                                            : upcoming
                                                                ? "#1D4ED8"
                                                                : "#64748B"
                                                }}
                                            >
                                                {
                                                    statusLabel
                                                }
                                            </span>
                                        </div>

                                        <div className="competition-admin-row-meta">
                                            {new Date(
                                                announcement.startsAt
                                            ).toLocaleString([], {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
                                            {" → "}
                                            {new Date(
                                                announcement.endsAt
                                            ).toLocaleString([], {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
                                        </div>

                                        <div className="competition-admin-row-meta">
                                            {announcement.rules ||
                                                "One entry per event during this window."}
                                        </div>

                                        <div>
                                            {announcement.isActive && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void handleRevokeCompetitionAnnouncement(
                                                            announcement.id
                                                        )
                                                    }
                                                    style={{
                                                        ...small,
                                                        background:
                                                            "#FFF1F2",
                                                        color:
                                                            "#BE123C",
                                                        border:
                                                            "1px solid #FECDD3",
                                                        padding:
                                                            "6px 9px",
                                                        fontSize: 8,
                                                        whiteSpace:
                                                            "nowrap"
                                                    }}
                                                >
                                                    Revoke
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            }
                        )
                    )}

                </div>

            </section>

        </div>

    );

}

const card: React.CSSProperties = {

    background: "white",

    borderRadius: 16,

    padding: 24,

    boxShadow: "0 2px 10px rgba(0,0,0,.06)"

};

const label: React.CSSProperties = {

    display: "block",

    fontWeight: 700,

    fontSize: 13,

    marginBottom: 6,

    color: "#334155"

};

const input: React.CSSProperties = {

    width: "100%",

    padding: 12,

    marginBottom: 12,

    boxSizing: "border-box",

    border: "1px solid #CBD5E1",

    borderRadius: 8

};

const primary: React.CSSProperties = {

    padding: "12px 22px",

    background: "#143B73",

    color: "white",

    border: 0,

    borderRadius: 9,

    cursor: "pointer",

    fontWeight: 700

};

const small: React.CSSProperties = {

    padding: "7px 12px",

    background: "#143B73",

    color: "white",

    border: 0,

    borderRadius: 8,

    cursor: "pointer"

};

const checks: React.CSSProperties = {

    display: "grid",

    gridTemplateColumns:

        "repeat(auto-fit,minmax(190px,1fr))",

    gap: 10,

    marginBottom: 20

};
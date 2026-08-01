import { useState } from "react";

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

    PlatformAccount,

    searchPlatformAccounts,

    setPlatformAccountSuspended

} from "../../../data/platformAccountControlRepository";

export default function TeacherRegistry() {

    const {

        schools,

        loading,

        addSchool,

        editSchool,

        removeSchool

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

        q,

        setQ

    ] = useState("");

    const [

        accounts,

        setAccounts

    ] = useState<PlatformAccount[]>([]);

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

};

function calculateEndDate(
    plan: string,
    start: string
) {

    const date =
        new Date(start);

    switch (plan) {

        case "TWO_WEEKS":

            date.setDate(
                date.getDate() + 14
            );

            break;

        case "ONE_MONTH":

            date.setMonth(
                date.getMonth() + 1
            );

            break;

        case "THREE_MONTHS":

            date.setMonth(
                date.getMonth() + 3
            );

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

            ? subscriptionEndDate

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

                const ok = editing

            ? await editSchool(
    editingSchoolUuid,
    schoolName,
    board,
    city,
    limits,
    subscription,
    studentFeatures,
    teacherFeatures

              )

          : await addSchool(

      schoolName,

      board,

      city,

      limits,

      subscription,

      studentFeatures,

      teacherFeatures

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
    s.subscriptionStartDate ??
    new Date()
        .toISOString()
        .slice(0, 10)
);

setSubscriptionEndDate(
    s.subscriptionEndDate ?? ""
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

                        {s.isActive && (

                            <button
                                onClick={() => removeSchool(s.schoolUuid)}
                                style={{
                                    ...small,
                                    background: "#FFFFFF",
                                    color: "#DC2626",
                                    border: "1px solid #DC2626"
                                }}
                            >
                                Deactivate
                            </button>

                        )}

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
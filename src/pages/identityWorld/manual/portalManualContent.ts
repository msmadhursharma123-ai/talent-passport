export type ManualRole =
  | "overview"
  | "student"
  | "teacher"
  | "school"
  | "parent"
  | "partner"
  | "admin"
  | "account";

export interface ManualSection {
  title: string;
  summary: string;
  steps?: string[];
  bullets?: string[];
}

export interface ManualRoleContent {
  id: Exclude<ManualRole, "overview" | "account">;
  label: string;
  icon: string;
  audience: string;
  intro: string;
  sections: ManualSection[];
}

export const MANUAL_ROLE_CONTENT: ManualRoleContent[] = [
  {
    id: "student",
    label: "Student",
    icon: "🎓",
    audience: "For students using the Student / Parent entry flow",
    intro:
      "Your Student Portal brings your Talent DNA, academic journey, portfolio, events, opportunities, results and growth plan into one workspace.",
    sections: [
      {
        title: "Create your student account",
        summary: "Use the public portal flow when you are a new student.",
        steps: [
          "Open Login to Identity World and choose Student Portal.",
          "Choose New User to start student registration.",
          "Complete the student registration and profile details requested on screen.",
          "Complete the parent consent / OTP step when it is required by the school's onboarding configuration.",
          "Complete the student questionnaire when the school has enabled it.",
          "After onboarding is complete, the Student Portal opens with your enabled modules."
        ]
      },
      {
        title: "Your main Student Portal areas",
        summary: "The current Student navigation exposes these product areas when enabled for the school.",
        bullets: [
          "Talent DNA — your Talent Passport / DNA workspace.",
          "Academics — growth plan and academic learning support.",
          "Talent Marketplace — opportunities and partner interactions.",
          "Achievements — timeline and achievement history.",
          "Portfolio — your portfolio workspace.",
          "Events — competitions and event participation.",
          "Consultations — available consultation opportunities.",
          "Results — your results / homeboard view.",
          "Rankings — analysis and ranking views."
        ]
      },
      {
        title: "How to reach your first daily feedback",
        summary: "Daily Lecture Feedback is part of the student learning loop and is used to capture understanding after classroom learning.",
        steps: [
          "Open the Student Portal after your account and onboarding are complete.",
          "Follow the enabled academic / learning area surfaced by your school.",
          "Open the available daily lecture feedback item for the relevant class or lesson.",
          "Select the understanding response requested by the screen and submit the feedback.",
          "Your submitted feedback is reflected in the student feedback history and credit logic already implemented by the platform."
        ]
      },
      {
        title: "Parent approvals inside the student journey",
        summary: "Some student actions intentionally require parent verification rather than a separate parent portal login.",
        bullets: [
          "Parent consent can be required during student onboarding.",
          "Certain marketplace / partner actions use parent OTP approval before information is shared or a request is sent.",
          "Keep the registered parent mobile / email available when an approval step is shown."
        ]
      }
    ]
  },
  {
    id: "teacher",
    label: "Teacher",
    icon: "👩‍🏫",
    audience: "For teachers using the Teacher Portal",
    intro:
      "The Teacher Portal is designed around daily classroom evidence, teaching workflows, student learning history, planning and parent-teacher collaboration.",
    sections: [
      {
        title: "Create your teacher account",
        summary: "New teachers follow the existing registration and academic onboarding flow.",
        steps: [
          "Choose Teacher Portal from the portal selection screen.",
          "Choose New Teacher.",
          "Complete teacher registration and verify your email when prompted.",
          "Complete the teacher profile.",
          "Complete the Teacher Academic Questionnaire, including the classes / subjects assigned for the academic year.",
          "Once onboarding is complete, the Teacher Portal opens."
        ]
      },
      {
        title: "Reach your first Daily Log",
        summary: "Daily Log is the starting point for recording classroom evidence used by the teacher intelligence workflow.",
        steps: [
          "Open Teacher Portal and select Daily Log from the sidebar.",
          "Choose the relevant assignment / classroom information presented by the page.",
          "Record the day's classroom evidence using the existing Daily Log dialog.",
          "Publish / save the log using the existing controls.",
          "The existing teacher intelligence and doubt-resolution workflows continue to consume this information."
        ]
      },
      {
        title: "Teacher features",
        summary: "Your school can control which modules are enabled for your account.",
        bullets: [
          "Dashboard — teacher workspace and school announcements.",
          "Daily Log — record daily classroom evidence.",
          "Class Health — review classroom health signals.",
          "Pending Doubts — work with unresolved learning signals.",
          "Learning History — inspect learning history.",
          "PTM — parent-teacher meeting workflow.",
          "Lesson Planner — lesson planning.",
          "Worksheet Planner — worksheet creation / planning.",
          "Unit Test Planner — unit-test planning.",
          "Exam Paper Planner — exam-paper planning.",
          "Star Performers — school recognition view."
        ]
      }
    ]
  },
  {
    id: "school",
    label: "School Admin",
    icon: "🏫",
    audience: "For school leadership / school administrators",
    intro:
      "The School Portal is the school intelligence workspace for academic health, teacher activity, classroom feedback, doubt intelligence, planning audits and recognition.",
    sections: [
      {
        title: "School access and setup",
        summary: "The current application routes School Portal access directly to the school login flow.",
        steps: [
          "Choose School Portal from the portal selection screen.",
          "Use the school credentials provided for the institution.",
          "If the school is entering through an invitation / setup link, complete the school invitation validation flow first.",
          "If a password reset is required, complete the reset flow before continuing to the dashboard."
        ]
      },
      {
        title: "School Intelligence areas",
        summary: "The current School Intelligence dashboard contains the following navigation areas.",
        bullets: [
          "School Health — school overview and health signals.",
          "Daily Teacher Logs — teacher intelligence / daily activity.",
          "Classroom Feedback Intelligence — classroom-level feedback intelligence.",
          "Doubt Intelligence — school academic intelligence and doubt signals.",
          "Lesson Planner Audit — lesson-planner audit.",
          "Unit Test Audit — unit-test audit.",
          "Exam Paper Audit — exam-paper audit.",
          "Worksheet Audit — worksheet audit.",
          "Star Performers — recognition view."
        ]
      },
      {
        title: "Academic year",
        summary: "When multiple academic years are available, the existing dashboard exposes an academic-year selector without deleting historical data.",
        bullets: [
          "Use the academic-year control when it is visible to move between available school years.",
          "Review historical intelligence in the relevant year instead of assuming every view is current-year data.",
          "Keep the selected academic year in mind when interpreting analytics."
        ]
      }
    ]
  },
  {
    id: "parent",
    label: "Parent / Family",
    icon: "👨‍👩‍👧",
    audience: "For parents supporting a student's Talent Passport journey",
    intro:
      "The current build does not expose a separate parent login portal. Parent participation is intentionally embedded into student onboarding and protected student actions.",
    sections: [
      {
        title: "Where parents participate",
        summary: "Parent actions are triggered by the student's workflow when verification is required.",
        bullets: [
          "Student onboarding can require parental consent and OTP verification.",
          "Marketplace / partner actions can require parent OTP approval before a request is sent or student information is shared.",
          "The student profile captures parent email and parent mobile details for these protected workflows."
        ]
      },
      {
        title: "What to do when an OTP appears",
        summary: "Use the registered parent mobile / email and complete the verification shown on screen.",
        steps: [
          "Read the action description before approving.",
          "Enter the OTP received through the registered parent verification channel.",
          "Complete the approval only when the action is understood and intended.",
          "Return to the student workflow after successful verification."
        ]
      }
    ]
  },
  {
    id: "partner",
    label: "Partner",
    icon: "🤝",
    audience: "For institutes, organisations and opportunity partners",
    intro:
      "The Partner Portal helps approved partners discover talent, manage incoming requests and move opportunities through a structured lead pipeline.",
    sections: [
      {
        title: "Create your partner account",
        summary: "New partners can register from the Partner Portal entry flow.",
        steps: [
          "Choose Partner Portal from the portal selection screen.",
          "Choose New Partner.",
          "Complete the partner registration details requested on screen.",
          "Continue into the Partner Portal after registration is completed."
        ]
      },
      {
        title: "Partner Portal features",
        summary: "The current partner shell exposes four primary work areas.",
        bullets: [
          "Dashboard — partner home and programme activity.",
          "Talent Discovery — discover relevant student talent.",
          "Incoming Requests — review requests coming into the partner.",
          "Lead Pipeline — manage the partner relationship pipeline."
        ]
      },
      {
        title: "Working with opportunities",
        summary: "Use the partner workspace to move from discovery to structured requests and follow-up rather than relying on separate spreadsheets or messages."
      }
    ]
  },
  {
    id: "admin",
    label: "Platform Admin",
    icon: "⚙️",
    audience: "For Talent Passport platform administrators",
    intro:
      "The Admin Portal is the platform operations workspace for administration, foundation management, competitions and analytics.",
    sections: [
      {
        title: "Admin access",
        summary: "Admin access is kept separate from the student, teacher, school and partner user flows.",
        steps: [
          "Choose Platform Admin from the portal selection screen.",
          "Complete the existing Admin Login flow.",
          "Use the Admin Portal navigation to open the required operational module."
        ]
      },
      {
        title: "Current Admin Portal areas",
        summary: "The current AdminPortal implementation renders these primary modules.",
        bullets: [
          "Dashboard — platform dashboard.",
          "Foundation Hub — foundation management workspace.",
          "Competition Engine — competition operations.",
          "Analytics — platform analytics.",
          "User Management — platform administration / users.",
          "Platform Settings — settings surface."
        ]
      }
    ]
  }
];

export const MANUAL_OVERVIEW_SECTIONS: ManualSection[] = [
  {
    title: "Start here",
    summary: "The manual is a self-service guide to account setup, password recovery, first-use workflows and the main capabilities of each Talent Passport portal.",
    bullets: [
      "Choose the role that matches the person using Talent Passport.",
      "Follow the first-login checklist before exploring the full workspace.",
      "Use the feature map to understand what each portal is designed to help you accomplish.",
      "Use the password section whenever a reset is required."
    ]
  },
  {
    title: "How the portals connect",
    summary: "Talent Passport is designed as a connected ecosystem: students create learning evidence, teachers contribute classroom evidence, schools see intelligence, partners create opportunities, and parents participate in protected approval flows.",
    bullets: [
      "Student learning and participation create evidence used across the ecosystem.",
      "Teacher classroom workflows contribute daily teaching and learning signals.",
      "School Intelligence brings school-level evidence into leadership views.",
      "Partners connect opportunities to talent through the marketplace workflow.",
      "Parents are brought into consent / approval steps where the platform requires them."
    ]
  }
];

export const MANUAL_ACCOUNT_SECTIONS: ManualSection[] = [
  {
    title: "Password reset",
    summary: "The current application provides password recovery for existing accounts through the login flows.",
    steps: [
      "Open the relevant portal login screen and choose the existing Forgot Password option when available.",
      "Complete the verification / recovery flow shown by the application.",
      "Create a password that is at least 8 characters and, for the recovery flow, contains an uppercase letter, lowercase letter and number.",
      "After a successful update, log in again using the new password."
    ]
  },
  {
    title: "New user vs existing user",
    summary: "The public entry flow distinguishes new-user registration from existing-user login for student, teacher and partner roles.",
    bullets: [
      "New User — use registration and onboarding steps.",
      "Existing User — use the existing account login.",
      "School Portal — the current app routes directly to school login / setup validation.",
      "Platform Admin — uses the separate Admin Login flow."
    ]
  }
];

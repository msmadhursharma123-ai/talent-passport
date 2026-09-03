/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  fetchAllSubmissions, 
  submitCompetitionEntry, 
  isSupabaseConfigured,
  getLocalSubmissions 
} from './supabaseClient';
import IdentityWorld from "./pages/IdentityWorld";
import TalentPassport from "./pages/TalentPassport";
import ExistingUserLogin from "./pages/ExistingUserLogin";
import GrowthCenter from "./pages/GrowthCenter";
import StudentProfileForm from "./pages/StudentProfileForm";
import StudentRegistrationAuth from "./pages/StudentRegistrationAuth";
import ParentalOtpVerification from "./pages/ParentalOtpVerification";
import ParentalConsentTerms from "./pages/ParentalConsentTerms";
import AdminLogin from "./pages/AdminLogin";
import RoleSelection from "./pages/RoleSelection";
import UserType from "./pages/UserType";
import QuestionWizard from "./pages/QuestionWizard";
import { studentQuestions } from "./data/studentData";
import { Submission, PathwayType } from './types';
import Leaderboard from "./leaderboard";
import SubmissionForm from './components/SubmissionForm';
import SubmissionsList from './components/SubmissionsList';
import SupabaseGuide from './components/SupabaseGuide';
import AdminDashboard from "./pages/AdminDashboard";
import StudentPortal from "./pages/student/StudentPortal";
import AdminPortal
from "./pages/admin/AdminPortal";
import AppHeader from "./components/AppHeader";

import { 
  Trophy, UploadCloud, Users, HelpCircle, 
  Database, RefreshCw, Layers, Sparkles, Sliders, CheckSquare 
} from 'lucide-react';

import PartnerRegistration
from "./pages/PartnerRegistration";

import PartnerLogin
from "./pages/PartnerLogin";

import PartnerPortal
from "./pages/partner/PartnerPortal";

import {
    getCurrentAdmin,
    clearAdminIdentity
} from "./services/identityService";

import {
    initializeAuth,
    getCurrentUser,
    getCurrentIdentity,
    signOut,
    markPortalActivated
} from "./services/authenticationService";

import {
    getParentalConsentStatus
} from "./services/otpService";

import { getSupabaseClient }
from "./supabaseClient";

import { getStudentOnboardingConfiguration } from "./data/studentOnboardingConfigurationRepository";

import {
    getCurrentTeacher,
} from "./services/identityService";

import {

doesStudentProfileExist,
isQuestionnaireCompleted

} from "./data/studentRepository";

import {
getTeacherAssignmentsByTeacher,
} from "./domains/teacherIntelligence/repository/TeacherAssignmentRepository";

import TeacherRegistrationAuth
from "./pages/teacher/auth/TeacherRegistrationAuth";

import TeacherExistingLogin
from "./pages/teacher/auth/TeacherExistingLogin";

import TeacherVerifyEmail
from "./pages/teacher/auth/TeacherVerifyEmail";

import TeacherProfileForm
from "./pages/teacher/auth/TeacherProfileForm";

import TeacherAcademicQuestionnaire
from "./pages/teacher/auth/TeacherAcademicQuestionnaire";

import TeacherPortal
from "./pages/teacher/TeacherPortal";

import SchoolLogin
from "./domains/school/pages/SchoolLogin";

import SchoolInvitationValidation
from "./domains/platformAdministration/pages/SchoolInvitationValidation";

import SchoolDashboard
from "./domains/school/pages/SchoolDashboard";

import SchoolResetPassword
from "./domains/school/pages/SchoolResetPassword";

import ResetPasswordPage
from "./pages/ResetPassword";

import {
doesTeacherProfileExist
} from "./data/teacherRepository";

const DEMO_ITEMS: Submission[] = [
  {
    id: "demo-1",
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    student_name: "Aarav Sharma",
    student_email: "aarav.sharma@modernschool.edu",
    pathway: "Communication",
    event_name: "Interview Master",
    video_url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    description: "Mock business interview presentation pitching an eco-friendly community waste sorter app designed for housing societies.",
    video_name: "aarav_interview_master.mp4",
    video_size: 14753041, // ~14MB
  },
  {
    id: "demo-2",
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    student_name: "Meera Nair",
    student_email: "meera.nair@artsacademy.org",
    pathway: "Creative Expression",
    event_name: "Navras Live",
    video_url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    description: "A theatrical dance submission representing peace (Shanti rasa) contrasted with the fast pace of modern concrete jungles.",
    video_name: "meera_navras_performance.mov",
    video_size: 26843545, // ~25MB
  },
  {
    id: "demo-3",
    created_at: new Date(Date.now() - 1000 * 60 * 600).toISOString(), // 10 hours ago
    student_name: "Rohan & Siddharth Varma",
    student_email: "varma.bros@stemhigh.net",
    pathway: "Problem Solving",
    event_name: "STEM Project",
    video_url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    description: "An automated solar water disinfection tracker designed to use UV metrics to announce when potable levels have been hit in bottles.",
    video_name: "varma_solar_cleaner.mp4",
    video_size: 47910243, // ~45MB
  }
];

export default function App() {
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedRole, setSelectedRole] =
  useState<string>("");
  const [userType, setUserType] =
useState<"new" | "existing" | null>(null);

const [activeTab, setActiveTab] =
  useState<string>("identity");

const [parentalConsentTermsAccepted, setParentalConsentTermsAccepted] =
  useState(false);

const [studentSchoolName, setStudentSchoolName] =
  useState<string | null>(null);

const [teacherSchoolName, setTeacherSchoolName] =
  useState<string | null>(null);

const [schoolLoginEmail, setSchoolLoginEmail] =
  useState<string>(
    () => sessionStorage.getItem("schoolLoginEmail") ?? ""
  );

const [schoolInvitationToken, setSchoolInvitationToken] =
  useState<string>(
    () => sessionStorage.getItem("schoolInvitationToken") ?? ""
  );

const adminIdentity = getCurrentAdmin();

const clearSchoolHashRoute = () => {
  window.history.replaceState(
    null,
    document.title,
    window.location.pathname + window.location.search
  );
};

/*
 * Portal activation is the boundary between onboarding and Existing User.
 * This is set only when the application actually enters a portal.
 */
const activatePortal = async (
  role: "student" | "teacher" | "partner"
) => {
  const result = await markPortalActivated(role);

  if (!result.success) {
    console.error(
      "PORTAL ACTIVATION MARK FAILED:",
      result.error
    );
  }
};



const routeTeacherAfterLogin = async (
  options: { existingLogin?: boolean } = {}
) => {

  const { existingLogin = false } = options;

  const teacher =
    getCurrentTeacher();

  const user =
    await getCurrentUser();

  if (!user) {

    setTeacherSchoolName(null);

    return;
  }

  if (!teacher) {

    setTeacherSchoolName(null);

    await signOut();

    alert(
      "Unable to restore your teacher session. Please login again."
    );

    setTeacherStage("login");
    setActiveTab("teacher");

    return;
  }

  /*
   * Teacher identity is authenticated.
   *
   * IMPORTANT: An Existing User Login is an authentication flow,
   * not an onboarding flow. A password reset does not make an
   * existing teacher a new teacher. Therefore, when the login was
   * initiated from TeacherExistingLogin, go directly to the portal
   * and do not re-run profile/academic onboarding checks.
   */
  setTeacherSchoolName(
    teacher.schoolName?.trim() || null
  );

  if (existingLogin) {
    setTeacherStage("portal");
    setActiveTab("teacher");
    return;
  }

  const profileExists =
    await doesTeacherProfileExist(
      user.id
    );

  if (!profileExists) {
    setTeacherStage("profile");
    setActiveTab("teacher");
    return;
  }

  const assignments =
    await getTeacherAssignmentsByTeacher(
      teacher.teacherUuid
    );

  if (!assignments.length) {

    setTeacherStage("academic");
    setActiveTab("teacher");

    return;
  }

  await activatePortal("teacher");
  setTeacherStage("portal");
  setActiveTab("teacher");
};

async function routeStudentOnboardingBySchoolConfiguration(schoolUuid: string) {

  const configuration =
    await getStudentOnboardingConfiguration(
      schoolUuid
    );

  if (configuration.parentOtpEnabled) {

    const consent =
      await getParentalConsentStatus();

    if (consent.verified) {
      if (configuration.questionnaireEnabled) {
        setActiveTab("wizard");
      } else {
        await activatePortal("student");
        setActiveTab("passport");
      }
      return;
    }

    setActiveTab("parental-otp");
    return;
  }

  if (configuration.questionnaireEnabled) {
    setActiveTab("wizard");
    return;
  }

  await activatePortal("student");
  setActiveTab("passport");
}

const routeStudentAfterLogin =
async (
  options: { existingLogin?: boolean } = {}
) => {

  const { existingLogin = false } = options;

  const user =
    await getCurrentUser();

  if (!user) {
    setStudentSchoolName(null);
    return;
  }

  const identity =
    await getCurrentIdentity();

  if (!identity) {

    setStudentSchoolName(null);

    setActiveTab(
      "student-profile"
    );

    return;
  }

  const studentIdentity =
    identity as any;

  /*
   * Keep the school identity in App state.
   * AppHeader will receive it only when
   * Student Portal itself is active.
   */
  setStudentSchoolName(
    studentIdentity.schoolName?.trim() || null
  );

  /*
   * EXISTING USER LOGIN IS NEVER ONBOARDING.
   *
   * This is especially important after Forgot Password. Updating a
   * password changes only the authentication credential. It does not
   * create a new student, reset the questionnaire, reset the DNA, or
   * require parental OTP again. The identity has already been resolved
   * from the authenticated Supabase user, so return the student directly
   * to the existing Student Portal.
   */
  if (existingLogin) {
    setActiveTab("passport");
    return;
  }

  const profileExists =
    await doesStudentProfileExist(
      user.id
    );

  if (!profileExists) {
    setActiveTab("student-profile");
    return;
  }

  const questionnaireCompleted =
    await isQuestionnaireCompleted(
      studentIdentity.studentUuid
    );

  if (questionnaireCompleted) {

    await activatePortal("student");

    setActiveTab(
      "passport"
    );

    return;
  }

  try {

    await routeStudentOnboardingBySchoolConfiguration(
      studentIdentity?.schoolUuid ?? ""
    );

  } catch (error) {

    console.error(
      "STUDENT ONBOARDING CONFIGURATION CHECK FAILED",
      error
    );

    // Preserve the existing onboarding path if the new optional
    // school-level configuration cannot be read.
    setActiveTab("parental-otp");

  }

};

const [teacherStage, setTeacherStage] =
useState<
    | "register"
    | "verify"
    | "profile"
    | "academic"
    | "login"
    | "portal"
>(
    "register"
);

const [teacherEmail, setTeacherEmail] =
useState("");

const handleLogout = async () => {

  localStorage.removeItem(
    "studentProfile"
  );

  localStorage.removeItem(
    "student_id"
  );

  localStorage.removeItem(
    "studentCalibration"
  );

  localStorage.removeItem(
    "talentScores"
  );

  localStorage.removeItem(
    "studentPassport"
  );

  localStorage.removeItem(
    "studentAnswers"
  );

  localStorage.removeItem(
  "userRole"
);

setSelectedRole("");

setUserType(null);

setStudentSchoolName(null);

await signOut();

setActiveTab("identity");
};

useEffect(() => {

  const supabase =
    getSupabaseClient();

  /*
   * PASSWORD RECOVERY
   *
   * Register the Supabase auth listener BEFORE initializeAuth().
   * This is important because the recovery link can establish the
   * PASSWORD_RECOVERY session while the application is starting.
   */
  let authSubscription:
    { unsubscribe(): void } | null = null;

  let recoveryFlow =
    window.location.search.includes(
      "reset-password=1"
    ) ||
    window.location.hash.includes(
      "type=recovery"
    ) ||
    new URLSearchParams(window.location.search).has(
      "code"
    );

  if (supabase) {

    const {
      data: authListener
    } = supabase.auth.onAuthStateChange(
      async (event) => {

        if (
          event ===
          "PASSWORD_RECOVERY"
        ) {

          recoveryFlow = true;

          setSelectedRole("");
          setUserType("existing");
          setActiveTab(
            "reset-password"
          );

        }

      }
    );

    authSubscription =
      authListener.subscription;
  }

  async function initializeApplication() {

    try {

      /*
       * School invitation links are public SPA hash routes. Handle them
       * before restoring any existing session so a Platform Admin session in
       * the same browser cannot hijack the School Admin onboarding screen.
       */
      const hash = window.location.hash || "";
      const isLegacySchoolSetupPath =
        window.location.pathname === "/school/setup" &&
        new URLSearchParams(window.location.search).has("token");

      if (hash.startsWith("#school-setup") || isLegacySchoolSetupPath) {
        setSelectedRole("school");
        setUserType("existing");
        setActiveTab("school-setup");
        return;
      }

      if (hash.startsWith("#school-login")) {
        const hashQuery = hash.includes("?")
          ? hash.slice(hash.indexOf("?") + 1)
          : "";
        const params = new URLSearchParams(hashQuery);
        const email = params.get("email")?.trim() || "";
        if (email) {
          setSchoolLoginEmail(email);
          sessionStorage.setItem("schoolLoginEmail", email);
        }
        setSelectedRole("school");
        setUserType("existing");
        setActiveTab("school-login");
        return;
      }

      await initializeAuth();

      /*
       * Never allow normal saved-session routing to take over
       * while a password recovery flow is active.
       */
      if (recoveryFlow) {

        setSelectedRole("");
        setUserType("existing");
        setActiveTab(
          "reset-password"
        );

        return;
      }

      const user =
        await getCurrentUser();

      console.log(
        "AUTH RESTORED:",
        user
      );

if (user) {

  const identity =
    await getCurrentIdentity();

  if (!identity) {

    setActiveTab("identity");
    return;

  }

  switch (identity.role) {

case "student": {

setSelectedRole(
"student"
);

setUserType(
"existing"
);

await routeStudentAfterLogin();

break;

} 

case "teacher": {

setSelectedRole(
"teacher"
);

setUserType(
"existing"
);

await routeTeacherAfterLogin();

break;

}

case "school": {

setSelectedRole(
"school"
);

setUserType(
"existing"
);

setActiveTab(
"school-dashboard"
);

break;

}

    case "partner": {

      setSelectedRole("partner");
      setUserType("existing");
      await activatePortal("partner");
      setActiveTab("partner-portal");
      break;

    }

    case "admin": {

      setSelectedRole("admin");
      setActiveTab("admin");
      break;

    }

    default: {

      setActiveTab("identity");

    }

  }

}

    } catch (error) {

      console.error(
        "AUTH INIT ERROR:",
        error
      );

    }

  }

  initializeApplication();

  return () => {

    authSubscription?.unsubscribe();

  };

}, []);

 useEffect(() => {

}, [activeTab]);
  const [isLoading, setIsLoading] = useState(false);
  const [supabaseDetected, setSupabaseDetected] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Check setup parameters
useEffect(() => {

  const recoveryUrl =
    window.location.search.includes(
      "reset-password=1"
    ) ||
    window.location.hash.includes(
      "type=recovery"
    );

  if (recoveryUrl) {
    return;
  }

  setSupabaseDetected(
    isSupabaseConfigured()
  );

  loadSubmissions();



const savedProfile =
  localStorage.getItem(
    "studentProfile"
  );

const forceDNA =
  localStorage.getItem(
    "forceDNAAssessment"
  );

if (
  savedProfile &&
  savedProfile !== "undefined" &&
  savedProfile !== "null"
) {

  setUserType("existing");
  setSelectedRole("student");

  console.log(
    "FORCE DNA FLAG =",
    forceDNA
  );

  const routeSavedStudent = async () => {

    try {

      if (forceDNA === "true") {

        console.log(
          "GOING TO STUDENT ONBOARDING"
        );

        localStorage.removeItem(
          "forceDNAAssessment"
        );

        const consent =
          await getParentalConsentStatus();

        setActiveTab(
          consent.verified
            ? "wizard"
            : "parental-otp"
        );

        return;
      }

      await routeStudentAfterLogin();

    } catch (error) {

      console.error(
        "STUDENT ROUTING STATUS ERROR",
        error
      );

      setActiveTab("parental-otp");

    }

  };

  routeSavedStudent();

}

}, []);

  const loadSubmissions = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const result = await fetchAllSubmissions();
      setSubmissions(result.submissions);
      if (result.error) {
        setFetchError(result.error);
      }
    } catch (err: any) {
      setFetchError(err?.message || 'Failed to load entries');
    } finally {
      setIsLoading(false);
    }
  };

  // Add demo submissions to local storage for quick testing
  const seedDemoData = () => {
    const existing = getLocalSubmissions();
    const withDemos = [...DEMO_ITEMS, ...existing];
    localStorage.setItem('competition_submissions_mock', JSON.stringify(withDemos));
    loadSubmissions();
  };

  // Clear simulated storage
  const handleClearMock = () => {
    localStorage.removeItem('competition_submissions_mock');
    loadSubmissions();
  };

  const handleCreateSubmission = async (
    entry: {
      studentName: string;
      studentEmail: string;
      className: string;
schoolName: string;
      pathway: string;
      eventName: string;
      description: string;
    },
    videoFile: File,
    onProgress: (percent: number) => void
  ) => {
    const response = await submitCompetitionEntry(entry, videoFile, onProgress);
    if (response.success) {
      // Reload submission database records
      await loadSubmissions();
      return { success: true };
    } else {
      return { success: false, error: response.error };
    }
  };

  // Pathway specific distributions
  const pathwayCounts = submissions.reduce(
    (acc, cur) => {
      acc[cur.pathway] = (acc[cur.pathway] || 0) + 1;
      return acc;
    },
    { Communication: 0, 'Creative Expression': 0, 'Problem Solving': 0, 'Team Event': 0 } as Record<string, number>
  );

 return (
  <div>

{activeTab !== "identity" && (
<AppHeader
  schoolName={
    activeTab === "passport"
      ? studentSchoolName
      : activeTab === "teacher" &&
        teacherStage === "portal"
      ? teacherSchoolName
      : null
  }
  workspaceLabel={
    activeTab === "passport"
      ? "Student Academic Workspace"
      : activeTab === "teacher" &&
        teacherStage === "portal"
      ? "Teacher Academic Workspace"
      : null
  }
/>
)}

{activeTab === "identity" && (

    <IdentityWorld

        onContinue={() =>
            setActiveTab("role-selection")
        }

    />

)}

{activeTab === "role-selection" && (
  <RoleSelection
    onBack={() =>
      setActiveTab("identity")
    }
    onSelect={(role) => {

      setSelectedRole(role);

      if (role === "admin") {

        setActiveTab(
          "admin-login"
        );

        return;
      }

if (role === "school") {

    setActiveTab(
        "school-login"
    );

    return;

}

      setActiveTab(
        "user-type"
      );

    }}
  />
)}



{activeTab === "user-type" && (
  <UserType
    role={selectedRole}
    onBack={() =>
      setActiveTab(
        "role-selection"
      )
    }
    onSelect={(type) => {

      setUserType(type);

if (selectedRole === "teacher") {

    if (type === "new") {

        setTeacherStage("register");

    } else {

        setTeacherStage("login");

    }

    setActiveTab("teacher");

    return;

}

      if (selectedRole === "partner") {

        if (type === "new") {

          setActiveTab(
            "partner-registration"
          );

        } else {

          setActiveTab(
            "partner-login"
          );

        }

        return;
      }

   if (type === "new") {

    setActiveTab(
        "student-register-auth"
    );

} else {

        setActiveTab(
          "existing-login"
        );

      }

    }}
  />
)}

{activeTab === "student-register-auth" && (
  <StudentRegistrationAuth
    onBack={() =>
      setActiveTab("role-selection")
    }

    onLogin={() => {
      setUserType("existing");
      setActiveTab("existing-login");
    }}

    onRegistrationComplete={() =>
      setActiveTab("student-profile")
    }

    onVerificationRequired={(email) => {

      console.log(
        "Verification required for:",
        email
      );

      // Temporary:
      // Next checkpoint will navigate to VerifyEmail.

      setActiveTab("student-profile");

    }}
  />
)}

{activeTab ===
  "student-profile" && (
  <StudentProfileForm
    onBack={() =>
      setActiveTab(
        "user-type"
      )
    }
    onContinue={async () => {
      setParentalConsentTermsAccepted(false);

      try {
        const currentIdentity =
          await getCurrentIdentity();

        await routeStudentOnboardingBySchoolConfiguration(
          String((currentIdentity as any)?.schoolUuid ?? "")
        );
      } catch (error) {
        console.error(
          "STUDENT ONBOARDING CONFIGURATION AFTER PROFILE FAILED",
          error
        );
        setActiveTab("parental-otp");
      }
    }}
  />
)}

{activeTab ===
  "partner-registration" && (

  <PartnerRegistration

    onBack={() =>
      setActiveTab(
        "user-type"
      )
    }

    onContinue={async () => {
      await activatePortal("partner");
      setActiveTab(
        "partner-portal"
      );
    }}

  />

)}

{activeTab === "existing-login" && (
  <ExistingUserLogin

    onBack={() =>
      setActiveTab("user-type")
    }

    onSuccess={async () => {

      await routeStudentAfterLogin({
        existingLogin: true
      });

    }}

    onRegister={() => {

      setUserType("new");

      setSelectedRole("student");

      setActiveTab("student-register-auth");

    }}

      onForgotPasswordVerified={(email: string) => {

        sessionStorage.setItem(
            "resetEmail",
            email
        );

        setActiveTab(
            "reset-password"
        );

    }}

  />
)}

{activeTab ===
  "partner-login" && (

<PartnerLogin

onBack={()=>

    setActiveTab("user-type")

}

onSuccess={()=>

    setActiveTab("partner-portal")

}

onForgotPasswordVerified={(email: string) => {

    sessionStorage.setItem(
        "resetEmail",
        email
    );

    setActiveTab(
        "reset-password"
    );

}}

/>

)}

{activeTab === "school-setup" && (

    <SchoolInvitationValidation
        onContinue={(email, token) => {
            setSchoolLoginEmail(email);
            setSchoolInvitationToken(token);
            sessionStorage.setItem("schoolLoginEmail", email);
            sessionStorage.setItem("schoolInvitationToken", token);
            window.history.replaceState(null, document.title, "#school-login");
            setSelectedRole("school");
            setUserType("existing");
            setActiveTab("school-login");
        }}
        onBack={() => {
            setSchoolLoginEmail("");
            setSchoolInvitationToken("");
            sessionStorage.removeItem("schoolLoginEmail");
            sessionStorage.removeItem("schoolInvitationToken");
            clearSchoolHashRoute();
            setSelectedRole("");
            setUserType(null);
            setActiveTab("identity");
        }}
    />

)}

{activeTab === "school-login" && (

    <SchoolLogin
        initialEmail={schoolLoginEmail}

        onBack={() => {
            setSchoolLoginEmail("");
            sessionStorage.removeItem("schoolLoginEmail");
            clearSchoolHashRoute();
            setActiveTab("role-selection");
        }}

        onSuccess={(result) => {
            if (result.requiresPasswordReset) {
                setActiveTab("school-reset-password");
                return;
            }

            setSchoolInvitationToken("");
            sessionStorage.removeItem("schoolInvitationToken");
            clearSchoolHashRoute();
            setActiveTab("school-dashboard");
        }}

        onResetPassword={() =>
            setActiveTab("reset-password")
        }

    />

)}

{activeTab ===
  "admin-login" && (
  <AdminLogin
    onBack={() =>
      setActiveTab(
        "role-selection"
      )
    }
    onSuccess={() =>
      setActiveTab(
        "admin"
      )
    }
  />
)}


{activeTab === "parental-otp" && (
  <ParentalOtpVerification
    termsAccepted={parentalConsentTermsAccepted}
    onTermsChange={setParentalConsentTermsAccepted}
    onOpenTerms={() =>
      setActiveTab("parental-consent-terms")
    }
    onBack={() =>
      setActiveTab("student-profile")
    }
    onVerified={async () => {
      setParentalConsentTermsAccepted(true);

      try {
        const currentIdentity =
          await getCurrentIdentity();

        const configuration =
          await getStudentOnboardingConfiguration(
            String((currentIdentity as any)?.schoolUuid ?? "")
          );

        if (configuration.questionnaireEnabled) {
          setActiveTab("wizard");
        } else {
          await activatePortal("student");
          setActiveTab("passport");
        }
      } catch (error) {
        console.error(
          "STUDENT ONBOARDING CONFIGURATION AFTER OTP FAILED",
          error
        );
        setActiveTab("wizard");
      }
    }}
  />
)}

{activeTab === "parental-consent-terms" && (
  <ParentalConsentTerms
    onBack={() =>
      setActiveTab("parental-otp")
    }
    onAgree={() => {
      setParentalConsentTermsAccepted(true);
      setActiveTab("parental-otp");
    }}
  />
)}

{activeTab === "wizard" &&
  selectedRole === "student" && (
    <QuestionWizard
      title="STUDENT / PARENT CALIBRATION"
      questions={studentQuestions}
      onBack={() =>
        setActiveTab(
          "student-profile"
        )
      }
      onComplete={async () => {
        console.log("GOING TO PASSPORT");

        await activatePortal("student");

        setActiveTab("passport");

        console.log(
          "SET PASSPORT CALLED"
        );
      }}
    />
)}
    {activeTab === "submit" && (
      <SubmissionForm
        onSubmit={handleCreateSubmission}
      />
    )}

    {activeTab === "list" && (
  <SubmissionsList
    submissions={submissions}
    onRefresh={loadSubmissions}
    isMock={!supabaseDetected}
    onClearMock={handleClearMock}
  />
)}

    {activeTab === "guide" && (
      <SupabaseGuide />
    )}

{activeTab === "admin" && (

  adminIdentity ? (

      <AdminPortal
        onLogout={async () => {

          clearAdminIdentity();

           await signOut();

setActiveTab("identity");

        }}
      />

  ) : (

      <div>
        Access Denied
      </div>

  )

)}

{activeTab === "leaderboard" && (
  <Leaderboard />
)}

{activeTab === "passport" && (
  <StudentPortal
    onLogout={handleLogout}
    onStartDNA={() => {

      setSelectedRole(
        "student"
      );

      setActiveTab(
        "wizard"
      );

    }}
  />
)}

{activeTab ===
  "partner-portal" && (

  <PartnerPortal

  onLogout={async () => {

      localStorage.removeItem(
        "partnerProfile"
      );

      localStorage.removeItem(
        "partner_id"
      );

      localStorage.removeItem(
        "userRole"
      );

      setSelectedRole("");

      setUserType(null);

  await signOut();

setActiveTab("identity");

    }}

  />

)}

{activeTab === "school-reset-password" && (

    <SchoolResetPassword
        invitationToken={schoolInvitationToken}
        onSuccess={() => {
            setSchoolLoginEmail("");
            setSchoolInvitationToken("");
            sessionStorage.removeItem("schoolLoginEmail");
            sessionStorage.removeItem("schoolInvitationToken");
            clearSchoolHashRoute();
            setActiveTab("school-dashboard");
        }}
    />

)}

{activeTab === "reset-password" && (

    <ResetPasswordPage />

)}

{activeTab === "school-dashboard" && (

  <SchoolDashboard
    onLogout={async () => {

        await signOut();

        setSelectedRole("");

        setUserType(null);

        setActiveTab("identity");

    }}
/>

)}

{activeTab === "teacher" && (

    (() => {

        switch (teacherStage) {

            case "register":

                return (

                    <TeacherRegistrationAuth

                        onRegistrationComplete={() =>
                            setTeacherStage("profile")
                        }

                        onVerificationRequired={(email) => {

                            setTeacherEmail(email);

                            setTeacherStage("verify");

                        }}

                        onLogin={() =>
                            setTeacherStage("login")
                        }

                        onBack={() => {

                            setActiveTab("user-type");

                            setTeacherStage("register");

                        }}

                    />

                );

            case "verify":

                return (

                    <TeacherVerifyEmail

                        email={teacherEmail}

                        onContinue={() =>
                            setTeacherStage("profile")
                        }

                        onBackToLogin={() =>
                            setTeacherStage("login")
                        }

                    />

                );

            case "profile":

                return (

                    <TeacherProfileForm

                     onContinue={() =>
setTeacherStage("academic")
}

                     onBack={() => {

alert(
"Your teacher account has already been created. Please complete your profile to continue."
);

}}

                    />

                );

case "academic":

return (

<TeacherAcademicQuestionnaire

onContinue={async () => {

  /*
   * Academic onboarding is now complete.
   *
   * Resolve the teacher identity again so
   * the global AppHeader receives the school
   * before Teacher Portal becomes visible.
   */
  const teacher =
    getCurrentTeacher();

  setTeacherSchoolName(
    teacher?.schoolName?.trim() || null
  );

  await activatePortal("teacher");

  setTeacherStage("portal");

}}

onBack={() => {

alert(
"Your teacher profile has already been saved. Please complete your academic questionnaire to continue."
);

}}

/>

);

         case "login":

    return (

<TeacherExistingLogin

onSuccess={async () => {

    await routeTeacherAfterLogin({
        existingLogin: true
    });

}}

onRegister={() =>

    setTeacherStage("register")

}

onBack={() =>

    setActiveTab("user-type")

}

onForgotPasswordVerified={(email: string) => {

    sessionStorage.setItem(
        "resetEmail",
        email
    );

    setActiveTab(
        "reset-password"
    );

}}

/>

    );
       case "portal":

  return (

    <TeacherPortal

      onLogout={async () => {

        /*
         * Immediately remove teacher school
         * identity from the global AppHeader.
         */
        setTeacherSchoolName(null);

        await signOut();

        setSelectedRole("");

        setUserType(null);

        setTeacherStage("login");

        setTeacherEmail("");

        setActiveTab("identity");

      }}

    />

  );

            default:

                return null;

        }

    })()

)}

  </div>)}


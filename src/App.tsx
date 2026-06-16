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

import { 
  Trophy, UploadCloud, Users, HelpCircle, 
  Database, RefreshCw, Layers, Sparkles, Sliders, CheckSquare 
} from 'lucide-react';

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
 useEffect(() => {

}, [activeTab]);
  const [isLoading, setIsLoading] = useState(false);
  const [supabaseDetected, setSupabaseDetected] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Check setup parameters
useEffect(() => {
  setSupabaseDetected(
    isSupabaseConfigured()
  );

  loadSubmissions();

  const savedProfile =
    localStorage.getItem(
      "studentProfile"
    );

  if (savedProfile) {

    setUserType("existing");

    setActiveTab(
      "passport"
    );

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
    {activeTab !== "identity" &&
 activeTab !== "role-selection" &&
 activeTab !== "user-type" &&
 activeTab !== "wizard" && (

  <div
    style={{
      display: "flex",
      gap: "20px",
      padding: "20px",
      background: "#0B2A4A",
      color: "white",
      fontSize: "20px",
      fontWeight: "600"
    }}
  >
    <button onClick={() => setActiveTab("submit")}>
      Student Portal
    </button>

    <button onClick={() => setActiveTab("list")}>
      Submissions
    </button>

    <button onClick={() => setActiveTab("guide")}>
      Setup
    </button>

    <button
      onClick={() =>
        setActiveTab("leaderboard")
      }
    >
      Leaderboard
    </button>

    <button
      onClick={() => {
        setActiveTab("admin");
      }}
    >
      Dashboard
    </button>
  </div>
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
    onSelect={(role) => {
      setSelectedRole(role);
      setActiveTab("user-type");
    }}
  />
)}

{activeTab === "user-type" && (
  <UserType
    role={selectedRole}
    onSelect={(type) => {

      setUserType(type);

      if (type === "new") {

        setActiveTab(
          "student-profile"
        );

      } else {

        setActiveTab(
          "existing-login"
        );

      }

    }}
  />
)}

{activeTab ===
  "student-profile" && (
  <StudentProfileForm
    onContinue={() =>
      setActiveTab("wizard")
    }
  />
)}
{activeTab ===
  "existing-login" && (
  <ExistingUserLogin
  onSuccess={() =>
    setActiveTab(
      "passport"
    )
  }
  onRegister={() =>
    setActiveTab(
      "student-profile"
    )
  }
/>
)}
{activeTab === "wizard" &&
  selectedRole === "student" && (
   <QuestionWizard
     title="STUDENT / PARENT CALIBRATION"
     questions={studentQuestions}
     onComplete={() => {
       console.log("GOING TO PASSPORT");

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
  <AdminDashboard />
)}

{activeTab === "leaderboard" && (
  <Leaderboard />
)}

{activeTab === "passport" && (
  <StudentPortal />
)}

  </div>)}
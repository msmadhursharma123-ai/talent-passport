
import { useEffect, useState } from "react";

import {
  getSupabaseClient
} from "../../supabaseClient";

import {
  getStudentAchievements
} from "../../data/timelineRepository";

import {
  getStudentPerformances,
  getStudentProjects,
  getStudentSkills
} from "../../data/studentRepository";

import { getRecommendedPartners } from "../../services/marketplaceService";

import {
  syncStudentWallet
} from "../../services/walletService";

import {
  getStudentWallet
} from "../../data/walletRepository";

import {
  bookConsultation
} from "../../services/consultationService";

import {
  calculateCompetitionCredits,
  calculateAchievementCredits,
  calculatePortfolioCredits
} from "../../data/creditEngine";

export default function CreditDashboard() {

const [competitionCredits,
  setCompetitionCredits] =
  useState(0);

const [achievementCredits,
  setAchievementCredits] =
  useState(0);

const [portfolioCredits,
  setPortfolioCredits] =
  useState(0);

  const [walletBalance,
  setWalletBalance] =
  useState(0);

const [totalCredits,
  setTotalCredits] =
  useState(0);

const [selectedCategory, setSelectedCategory] =
  useState<string | null>(null);

const [selectedSkill, setSelectedSkill] =
  useState("");

const [selectedPartner, setSelectedPartner] =
  useState<any>(null);

const [recommendedPartners,
setRecommendedPartners] =
useState<any[]>([]);

const [showPartners,
setShowPartners] =
useState(false);

const [consultationTopic,
setConsultationTopic] =
useState("");

const [loadingPartners, setLoadingPartners] =
  useState(false);

const [
consultationDescription,
setConsultationDescription
] = useState("");

  const consultationCost = 60;

const availableCredits =
  walletBalance;

const remainingCredits =
  availableCredits - consultationCost;

  useEffect(() => {
  loadCredits();
}, []);

const [profile] = useState(()=>

JSON.parse(

localStorage.getItem(
"studentProfile"
)||"{}"

)

);

async function loadCredits() {



  const studentId =
    profile?.id;

  if (!studentId)
    return;

const studentName =
  profile?.student_name ||
  profile?.name ||
  "";

  const supabase =
    getSupabaseClient();

  if (!supabase)
    return;

  const {
    data: submissions
  } = await supabase
    .from("submissions")
    .select("*")
    .eq(
      "student_id",
      studentId
    );

  const achievements =
    await getStudentAchievements(
      studentId
    );

  const performances =
    await getStudentPerformances(
      studentId
    );

  const projects =
    await getStudentProjects(
      studentId
    );

  const skills =
    await getStudentSkills(
      studentId
    );

   

  const verifiedCount =
    achievements.filter(
      (a: any) =>
        a.verification_status ===
        "Verified"
    ).length;

  const competition =
    calculateCompetitionCredits(
      submissions?.length || 0
    );

  const timeline =
    calculateAchievementCredits(
      achievements.length,
      verifiedCount
    );

  const portfolio =
    calculatePortfolioCredits(
      performances.length,
      projects.length,
      skills.length
    );

 const totalEarnedCredits =

  competition +

  timeline +

  portfolio;

setCompetitionCredits(

  competition

);

setAchievementCredits(

  timeline

);

setPortfolioCredits(

  portfolio

);

setTotalCredits(

  totalEarnedCredits

);

/* ============================================
   Sync Student Wallet
============================================ */

try {

  await syncStudentWallet(

    studentId,

    competition,

    timeline,

    portfolio

  );

  const wallet =

    await getStudentWallet(
      studentId
    );

  setWalletBalance(

    wallet.available_credits

  );

} catch (error) {

  console.error(

    "Wallet sync failed",

    error

  );

}
}

async function loadRecommendedPartners(
  category: string,
  skill: string
) {

  setLoadingPartners(true);

  try {

    const partners =
      await getRecommendedPartners(
        category,
        skill
      );

    setRecommendedPartners(partners);

    setShowPartners(true);

  } catch (error) {

    console.error(error);

    setRecommendedPartners([]);

  } finally {

    setLoadingPartners(false);

  }

}

  const [creditView, setCreditView] =
    useState<
      "guidelines" | "rewards"
    >("guidelines");

const activitySkills = [
  "Debate",
  "Public Speaking",
  "Dance",
  "Music",
  "Singing",
  "Acting",
  "Drama",
  "Creative Writing",
  "Painting",
  "Art & Craft",
  "Fine Arts",
  "Music Instrument",
  "Coding",
  "Robotics"
];

const careerTopics = [
  "Scholarship Guidance",
  "College Admissions",
  "Portfolio Review",
  "Competition Strategy",
  "Leadership Coaching",
  "Career Planning"
];

const parentTopics = [
  "Confidence Building",
  "Performance Anxiety",
  "Learning Challenges",
  "Screen Addiction",
  "Career Support",
  "Student Motivation"
];

type MarketplacePartner = {
  id: number;
  name: string;
  city: string;
  rating: number;
  credits: number;
  skills: string[];

  experience: number;
  studentsMentored: number;
  languages: string[];
  consultationDuration: number;
  verified: boolean;
};

const demoPartners: MarketplacePartner[] = [
  {
    id: 1,
    name: "Maestro Performing Arts Academy",
    city: "New Delhi",
    rating: 4.9,
    credits: 60,
    skills: [
      "Debate",
      "Public Speaking",
      "Theatre"
    ],
    experience: 12,
    studentsMentored: 1800,
    languages: [
      "English",
      "Hindi"
    ],
    consultationDuration: 45,
    verified: true
  },

  {
    id: 2,
    name: "Future Leaders Institute",
    city: "Gurugram",
    rating: 4.8,
    credits: 60,
    skills: [
      "Leadership",
      "Debate",
      "Communication"
    ],
    experience: 9,
    studentsMentored: 1200,
    languages: [
      "English",
      "Hindi"
    ],
    consultationDuration: 45,
    verified: true
  },

  {
    id: 3,
    name: "Creative Minds Studio",
    city: "Jaipur",
    rating: 4.7,
    credits: 60,
    skills: [
      "Dance",
      "Music",
      "Drama"
    ],
    experience: 15,
    studentsMentored: 2500,
    languages: [
      "English",
      "Hindi"
    ],
    consultationDuration: 60,
    verified: true
  }
];

  return (
 <div
  style={{
    background: "#f8f7f4",
    color: "#0F172A",
    borderRadius: 32,
    padding: 40,
    minHeight: "1100px",
    border: "1px solid #E2E8F0"
  }}
>
    {/* HEADER */}

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 30
      }}
    >
      <div>
        <div
          style={{
            color: "#FF8A00",
            fontSize: 22,
            letterSpacing: 2,
            fontWeight: 700,
            marginBottom: 8
          }}
        >
          YOUR OPPORTUNITIES ARE IN YOUR HAND 

        </div>

        <h2
          style={{
            margin: 0,
            fontSize: 40,
            fontWeight: 500
          }}
        >
          Earn Credits and Learn From The Best  🚀
        </h2>
      </div>
    </div>
 
  
    {/* CREDIT SUMMARY */}

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(3,1fr)",
        gap: 20,
        marginBottom: 24
      }}
    >
      <div
        style={{
          background: "#FFF8EC",
          border: "1px solid #5E2D00",
          borderRadius: 18,
          padding: 24
        }}
      >
        <div>Total Earned Credits</div>

        <h1
          style={{
            marginTop: 12
    
          }}
        >
          {totalCredits}
        </h1>
      </div>

      <div
        style={{
          background: "#EEF4FF",
          border: "1px solid #5E2D00",
          borderRadius: 18,
          padding: 24
        }}
      >
        <div>Spent Credits</div>

        <h1
          style={{
            marginTop: 12
          }}
        >
          0
        </h1>
      </div>

      <div
        style={{
          background: "#E8F5EE",
          border: "1px solid #5E2D00",
          borderRadius: 18,
          padding: 24
        }}
      >
        <div>
          Available Balance
        </div>

        <h1
          style={{
            marginTop: 12
          }}
        >
          {totalCredits}
        </h1>
      </div>
    </div>

    {/* BREAKDOWN */}

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(3,1fr)",
        gap: 20,
        marginBottom: 30
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
border: "1px solid #5E2D00",
          borderRadius: 18,
          padding: 20
        }}
      >
        <div
          style={{
            color: "#0e131b"
          }}
        >
          Competition Credits
        </div>

        <h2>
          {competitionCredits}
        </h2>
      </div>

      <div
        style={{
          background: "#FFFFFF",
border: "1px solid #5E2D00",
          borderRadius: 18,
          padding: 20
        }}
      >
        <div
          style={{
            color: "#0e131b"
          }}
        >
          Achievement Credits
        </div>

        <h2>
          {achievementCredits}
        </h2>
      </div>

      <div
        style={{
          background: "#FFFFFF",
border: "1px solid #5E2D00",
          borderRadius: 18,
          padding: 20
        }}
      >
        <div
          style={{
            color: "#0e131b"
          }}
        >
          Portfolio Credits
        </div>

        <h2>
          {portfolioCredits}
        </h2>
      </div>
    </div>

    {/* TOGGLE */}

    <div
      style={{
        display: "flex",
        gap: 12,
        marginBottom: 24
      }}
    >
      <button
        onClick={() =>
          setCreditView(
            "guidelines"
          )
        }
        style={{
          background:
            creditView ===
            "guidelines"
              ? "#FF6B00"
              : "#16223D",
          color: "white",
          border: "none",
          padding:
            "12px 18px",
          borderRadius: 12,
          cursor: "pointer"
        }}
      >
        Credit Guidelines
      </button>

      <button
        onClick={() =>
          setCreditView(
            "rewards"
          )
        }
        style={{
          background:
            creditView ===
            "rewards"
              ? "#FF6B00"
              : "#16223D",
          color: "white",
          border: "none",
          padding:
            "12px 18px",
          borderRadius: 12,
          cursor: "pointer"
        }}
      >
        Rewards Marketplace
      </button>
    </div>

    {/* CONTENT */}

    <div
      style={{
        background: "#FFFFFF",
border: "1px solid #E2E8F0",
        borderRadius: 24,
        padding: 28
      }}
    >
      {creditView ===
      "guidelines" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 1fr",
            gap: 24
          }}
        >
          <div>
            <h3>
              📈 Ways To Earn Credits
            </h3>

            {[
              [
                "Competition Submission",
                "+10"
              ],
              [
                "Competition Winner",
                "+50"
              ],
              [
                "Achievement Added",
                "+10"
              ],
              [
                "Verified Achievement",
                "+10"
              ],
              [
                "Portfolio Upload",
                "+10"
              ]
            ].map(
              (item) => (
                <div
                  key={item[0]}
                  style={{
                    background:
                      "#F8FAFC",
                    padding: 16,
                    borderRadius: 14,
                    marginBottom: 12,
                    display:
                      "flex",
                    justifyContent:
                      "space-between"
                  }}
                >
                  <span>
                    {item[0]}
                  </span>

                  <strong>
                    {item[1]}
                  </strong>
                </div>
              )
            )}
          </div>

          <div>
            <h3>
              🎁 Ways To Spend Credits
            </h3>

            {[
              [
                "Expert Consultation",
                "-60"
              ],
              [
                "Partner Reach Out",
                "-80"
              ],
              [
                "Leadership Nomination",
                "-250"
              ],
              [
                "Principal Roundtable",
                "-300"
              ]
            ].map(
              (item) => (
                <div
                  key={item[0]}
                  style={{
                    background:
                      "#F8FAFC",
                    padding: 16,
                    borderRadius: 14,
                    marginBottom: 12,
                    display:
                      "flex",
                    justifyContent:
                      "space-between"
                  }}
                >
                  <span>
                    {item[0]}
                  </span>

                  <strong>
                    {item[1]}
                  </strong>
                </div>
              )
            )}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 14
          }}
        >
          {[
            [
              "Expert Consultation",
              "60 Credits"
            ],
            [
              "Partner Reach-Out",
              "80 Credits"
            ],
            [
              "Leadership Eligibility",
              "250 Credits"
            ],
            [
              "Principal Roundtable",
              "300 Credits"
            ]
          ].map(
            (item) => (
              <div
                key={item[0]}
                style={{
                  background:
                    "#F8FAFC",
                  padding: 20,
                  borderRadius: 14,
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center"
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight:
                        700
                    }}
                  >
                    {item[0]}
                  </div>

                  <div>
                    Cost:
                    {" "}
                    {item[1]}
                  </div>
                </div>

                <button
                  style={{
                    background:
                      "#FF6B00",
                    border: "none",
                    color:
                      "white",
                    padding:
                      "10px 18px",
                    borderRadius:
                      10
                  }}
                >
                  Redeem
                </button>
              </div>
            )
          )}
        </div>
      )}
</div>


{/* ===========================================
      CONSULTATION MARKETPLACE
=========================================== */}

<div
  style={{
    marginTop: 40,
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 28,
    overflow: "hidden"
  }}
>
  {/* HERO */}

  <div
    style={{
      background:
        "linear-gradient(135deg,#FFEDD5,#FFF7ED)",
      padding: 36,
      borderBottom: "1px solid #F1F5F9"
    }}
  >
    <div
      style={{
        color: "#EA580C",
        fontWeight: 700,
        fontSize: 15,
        letterSpacing: 1.5,
        textTransform: "uppercase"
      }}
    >
      CONSULTATION MARKETPLACE
    </div>

    <h2
      style={{
        marginTop: 10,
        marginBottom: 10,
        fontSize: 34,
        color: "#0F172A",
        fontWeight: 600
      }}
    >
      Learn From Experts Using Your Earned Credits
    </h2>

    <div
      style={{
        maxWidth: 850,
        color: "#475569",
        fontSize: 17,
        lineHeight: 1.7
      }}
    >
      Unlock one-on-one guidance from verified
      mentors, institutes and professionals across
      academics, performing arts, leadership,
      competitions and career development.
      <br /><br />
      Every consultation is booked using the
      credits you earn throughout your Talent
      Passport journey.
    </div>

    <div
      style={{
        display: "flex",
        gap: 16,
        marginTop: 26,
        flexWrap: "wrap"
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          padding: "10px 18px",
          borderRadius: 999,
          fontWeight: 700,
          color: "#EA580C"
        }}
      >
        🎯 Credit Based
      </div>

      <div
        style={{
          background: "#FFFFFF",
          padding: "10px 18px",
          borderRadius: 999,
          fontWeight: 700,
          color: "#EA580C"
        }}
      >
        ⭐ Verified Experts
      </div>

      <div
        style={{
          background: "#FFFFFF",
          padding: "10px 18px",
          borderRadius: 999,
          fontWeight: 700,
          color: "#EA580C"
        }}
      >
        🤝 One-on-One Guidance
      </div>
    </div>
  </div>

  {/* CATEGORY CARDS */}

  <div
    style={{
      padding: 30,
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit,minmax(300px,1fr))",
      gap: 24
    }}
  >
    {/* ACTIVITY */}

{/* ACTIVITY */}

<div
  onClick={() => {
    setSelectedCategory("Activity Coaching");
    setSelectedSkill("");
    setSelectedPartner(null);
    setConsultationTopic("");
    setConsultationDescription("");
  }}
  style={{
    border:
      selectedCategory === "Activity Coaching"
        ? "2px solid #FF6B00"
        : "1px solid #E2E8F0",
    borderRadius: 22,
    padding: 26,
    background:
      selectedCategory === "Activity Coaching"
        ? "#FFF7ED"
        : "#FFFDF8",
    transition: ".25s",
    cursor: "pointer",
    boxShadow:
      selectedCategory === "Activity Coaching"
        ? "0 12px 30px rgba(255,107,0,.12)"
        : "none",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: 360
  }}
>
  <div>
    <div style={{ fontSize: 52 }}>
      🎭
    </div>

    <h3
      style={{
        marginTop: 18,
        marginBottom: 14,
        color: "#0F172A"
      }}
    >
      Activity Coaching
    </h3>

    <div
      style={{
        color: "#64748B",
        lineHeight: 1.7
      }}
    >
      Learn directly from verified Debate,
      Dance, Music, Theatre, Coding and
      Public Speaking mentors.
    </div>
  </div>

  <button
    style={{
      marginTop: 30,
      width: "100%",
      padding: 15,
      background:
        selectedCategory === "Activity Coaching"
          ? "#EA580C"
          : "#FF6B00",
      color: "#FFFFFF",
      border: "none",
      borderRadius: 14,
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 15
    }}
  >
    {selectedCategory === "Activity Coaching"
      ? "Selected ✓"
      : "Explore Coaches →"}
  </button>
</div>

  {/* CAREER */}

<div
  onClick={() => {
    setSelectedCategory("Career Guidance");
    setSelectedSkill("");
    setSelectedPartner(null);
    setConsultationTopic("");
    setConsultationDescription("");
  }}
  style={{
    border:
      selectedCategory === "Career Guidance"
        ? "2px solid #143B73"
        : "1px solid #E2E8F0",
    borderRadius: 22,
    padding: 26,
    background:
      selectedCategory === "Career Guidance"
        ? "#EEF4FF"
        : "#FCFCFF",
    transition: ".25s",
    cursor: "pointer",
    boxShadow:
      selectedCategory === "Career Guidance"
        ? "0 12px 30px rgba(20,59,115,.15)"
        : "none",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: 360
  }}
>
  <div>
    <div style={{ fontSize: 52 }}>
      🎓
    </div>

    <h3
      style={{
        marginTop: 18,
        marginBottom: 14,
        color: "#0F172A"
      }}
    >
      Career Guidance
    </h3>

    <div
      style={{
        color: "#64748B",
        lineHeight: 1.7
      }}
    >
      Receive guidance on scholarships,
      admissions, portfolio building,
      competitions, leadership,
      interview preparation and
      future career pathways.
    </div>
  </div>

  <button
    style={{
      marginTop: 30,
      width: "100%",
      padding: 15,
      background:
        selectedCategory === "Career Guidance"
          ? "#0F3D91"
          : "#143B73",
      color: "#FFFFFF",
      border: "none",
      borderRadius: 14,
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 15
    }}
  >
    {selectedCategory === "Career Guidance"
      ? "Selected ✓"
      : "Explore Mentors →"}
  </button>
</div>

    {/* PARENT */}

<div
  onClick={() => {
    setSelectedCategory("Parent Support");
    setSelectedSkill("");
    setSelectedPartner(null);
    setConsultationTopic("");
    setConsultationDescription("");
  }}
  style={{
    border:
      selectedCategory === "Parent Support"
        ? "2px solid #0F766E"
        : "1px solid #E2E8F0",
    borderRadius: 22,
    padding: 26,
    background:
      selectedCategory === "Parent Support"
        ? "#F0FDFA"
        : "#FFFCF5",
    transition: ".25s",
    cursor: "pointer",
    boxShadow:
      selectedCategory === "Parent Support"
        ? "0 12px 30px rgba(15,118,110,.15)"
        : "none",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: 360
  }}
>
  <div>
    <div style={{ fontSize: 52 }}>
      👨‍👩‍👧
    </div>

    <h3
      style={{
        marginTop: 18,
        marginBottom: 14,
        color: "#0F172A"
      }}
    >
      Parent Support
    </h3>

    <div
      style={{
        color: "#64748B",
        lineHeight: 1.7
      }}
    >
      Connect with experienced mentors
      for parenting, confidence building,
      emotional wellbeing, student
      motivation, learning challenges
      and holistic student growth.
    </div>
  </div>

  <button
    style={{
      marginTop: 30,
      width: "100%",
      padding: 15,
      background:
        selectedCategory === "Parent Support"
          ? "#0B5F59"
          : "#0F766E",
      color: "#FFFFFF",
      border: "none",
      borderRadius: 14,
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 15
    }}
  >
    {selectedCategory === "Parent Support"
      ? "Selected ✓"
      : "Explore Experts →"}
  </button>
</div>



  </div>

{/* ===========================================
      CONSULTATION BOOKING PANEL
=========================================== */}

{selectedCategory && (

<div
style={{
marginTop:40,
padding:30,
borderRadius:24,
border:"1px solid #E2E8F0",
background:"#FFFFFF"
}}
>

<div
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:30
}}
>

<div>

<div
style={{
fontSize:13,
fontWeight:700,
letterSpacing:1,
color:"#EA580C",
textTransform:"uppercase"
}}
>

Selected Consultation

</div>

<h2
style={{
marginTop:8,
marginBottom:0
}}
>

{selectedCategory}

</h2>

</div>

<div
style={{
background:"#FFF7ED",
padding:"10px 18px",
borderRadius:999,
fontWeight:700,
color:"#EA580C"
}}
>

{consultationCost} Credits

</div>

</div>

<div
style={{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:24
}}
>

<div>

<label
style={{
fontWeight:700,
fontSize:15
}}
>

Choose Skill

</label>

<select

value={selectedSkill}

onChange={(e)=>
setSelectedSkill(
e.target.value
)
}

style={{
marginTop:10,
width:"100%",
padding:16,
borderRadius:12,
border:"1px solid #CBD5E1",
fontSize:15
}}

>

<option value="">

Select Skill

</option>

{(
selectedCategory==="Activity Coaching"

? activitySkills

: selectedCategory==="Career Guidance"

? careerTopics

: parentTopics

).map(skill=>(

<option
key={skill}
value={skill}
>

{skill}

</option>

))}

</select>

</div>

<div>

<label
style={{
fontWeight:700,
fontSize:15
}}
>

Consultation Topic

</label>

<input

value={consultationTopic}

onChange={(e)=>
setConsultationTopic(
e.target.value
)
}

placeholder="e.g. Improve Debate Structure"

style={{
marginTop:10,
width:"100%",
padding:16,
borderRadius:12,
border:"1px solid #CBD5E1",
fontSize:15
}}

>

</input>

</div>

</div>

<div
style={{
marginTop:28
}}
>

<label
style={{
fontWeight:700,
fontSize:15
}}
>

Describe your requirement

</label>

<textarea

rows={6}

value={consultationDescription}

onChange={(e)=>
setConsultationDescription(
e.target.value
)
}

placeholder="Explain your challenge in detail..."

style={{
marginTop:10,
width:"100%",
padding:18,
borderRadius:14,
border:"1px solid #CBD5E1",
fontSize:15,
resize:"vertical"
}}

>

</textarea>

</div>

<div
style={{
marginTop:36,
display:"flex",
justifyContent:"space-between",
alignItems:"center",
gap:30
}}
>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(3,1fr)",
gap:18,
flex:1
}}
>

<div
style={{
background:"#F8FAFC",
border:"1px solid #E2E8F0",
padding:18,
borderRadius:16
}}
>

<div
style={{
fontSize:13,
color:"#64748B",
marginBottom:8
}}
>

Available Credits

</div>

<div
style={{
fontSize:24,
fontWeight:700,
color:"#0F172A"
}}
>

{availableCredits}

</div>

</div>

<div
style={{
background:"#FFF7ED",
border:"1px solid #FED7AA",
padding:18,
borderRadius:16
}}
>

<div
style={{
fontSize:13,
color:"#EA580C",
marginBottom:8
}}
>

Consultation Cost

</div>

<div
style={{
fontSize:24,
fontWeight:700,
color:"#EA580C"
}}
>

{consultationCost}

</div>

</div>

<div
style={{
background:
remainingCredits >= 0
? "#F0FDF4"
: "#FEF2F2",

border:
remainingCredits >= 0
? "1px solid #BBF7D0"
: "1px solid #FECACA",

padding:18,
borderRadius:16
}}
>

<div
style={{
fontSize:13,
color:
remainingCredits >= 0
? "#15803D"
: "#DC2626",
marginBottom:8
}}
>

Remaining Balance

</div>

<div
style={{
fontSize:24,
fontWeight:700,
color:
remainingCredits >= 0
? "#15803D"
: "#DC2626"
}}
>

{remainingCredits}

</div>

</div>

</div>

<button
onClick={() => {

  loadRecommendedPartners(
    selectedCategory!,
    selectedSkill
  );

}}

disabled={
!selectedSkill ||
remainingCredits < 0
}

style={{

background:

selectedSkill &&
remainingCredits >= 0

? "#FF6B00"

:"#CBD5E1",

color:"#FFFFFF",

padding:"18px 34px",

border:"none",

borderRadius:16,

fontWeight:700,

cursor:

selectedSkill &&
remainingCredits >= 0

? "pointer"

:"not-allowed",

fontSize:16,

minWidth:220

}}

>

Find Experts →

</button>

</div>

</div>

)}

{/* ============================================================
                    RECOMMENDED EXPERTS
============================================================ */}

{showPartners && (

<div
style={{
marginTop:40,
padding:"0 30px 30px"
}}
>

<div
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:24
}}
>

<div>

<div
style={{
fontSize:13,
fontWeight:700,
letterSpacing:1,
textTransform:"uppercase",
color:"#EA580C"
}}
>

RECOMMENDED EXPERTS

</div>

<h2
style={{
margin:"8px 0 0"
}}
>

Choose Your Mentor

</h2>

</div>

<div
style={{
background:"#FFF7ED",
padding:"10px 18px",
borderRadius:999,
fontWeight:700,
color:"#EA580C"
}}
>

{recommendedPartners.length} Experts Found

</div>

</div>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",
gap:24
}}
>

{recommendedPartners.map((partner) => (

<div

key={partner.id}

style={{

background:"#FFFFFF",

border:
selectedPartner?.id===partner.id
?"2px solid #FF6B00"
:"1px solid #E2E8F0",

borderRadius:24,

padding:28,

display:"flex",

flexDirection:"column",

justifyContent:"space-between",

boxShadow:
selectedPartner?.id===partner.id
?"0 16px 36px rgba(255,107,0,.18)"
:"0 8px 24px rgba(15,23,42,.05)",

transition:".25s"

}}

>

<div>

<div
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:20
}}
>

<div>

{partner.verified && (

<div
style={{
display:"inline-block",
background:"#E8F5EE",
color:"#15803D",
padding:"6px 12px",
borderRadius:999,
fontSize:12,
fontWeight:700,
marginBottom:10
}}
>

✔ VERIFIED PARTNER

</div>

)}

<h3
style={{
margin:"0 0 8px",
fontSize:24
}}
>

{partner.name}

</h3>

<div
style={{
color:"#64748B"
}}
>

📍 {partner.city}

</div>

</div>

<div
style={{
background:"#EEF4FF",
padding:"10px 16px",
borderRadius:999,
fontWeight:700,
color:"#143B73"
}}
>

⭐ {partner.rating}

</div>

</div>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(3,1fr)",
gap:12,
marginBottom:24
}}
>

<div
style={{
background:"#F8FAFC",
padding:14,
borderRadius:14,
textAlign:"center"
}}
>

<div
style={{
fontSize:12,
color:"#64748B"
}}
>

Experience

</div>

<div
style={{
fontWeight:700,
marginTop:6
}}
>

{partner.experience} Years

</div>

</div>

<div
style={{
background:"#F8FAFC",
padding:14,
borderRadius:14,
textAlign:"center"
}}
>

<div
style={{
fontSize:12,
color:"#64748B"
}}
>

Students

</div>

<div
style={{
fontWeight:700,
marginTop:6
}}
>

{partner.studentsMentored.toLocaleString()}+

</div>

</div>

<div
style={{
background:"#F8FAFC",
padding:14,
borderRadius:14,
textAlign:"center"
}}
>

<div
style={{
fontSize:12,
color:"#64748B"
}}
>

Session

</div>

<div
style={{
fontWeight:700,
marginTop:6
}}
>

{partner.consultationDuration} Min

</div>

</div>

</div>

<div
style={{
marginBottom:18
}}
>

<div
style={{
fontWeight:700,
marginBottom:12
}}
>

Specializations

</div>

<div
style={{
display:"flex",
gap:8,
flexWrap:"wrap"
}}
>

{(partner.specializations ?? []).map((skill: string) => (

<div
key={skill}
style={{
background:"#FFF7ED",
padding:"7px 14px",
borderRadius:999,
fontSize:13,
fontWeight:600,
color:"#EA580C"
}}
>

{skill}

</div>

))}

</div>

</div>

<div
style={{
marginBottom:24
}}
>

<div
style={{
fontWeight:700,
marginBottom:8
}}
>

Languages

</div>

<div
style={{
color:"#64748B"
}}
>

{(partner.languages ?? []).join(" • ")}

</div>

</div>

</div>

<div
style={{
borderTop:"1px solid #E2E8F0",
paddingTop:20,
display:"flex",
justifyContent:"space-between",
alignItems:"center"
}}
>

<div>

<div
style={{
fontSize:24,
fontWeight:700,
color:"#EA580C"
}}
>

{partner.credits} Credits

</div>

<div
style={{
fontSize:13,
color:"#64748B"
}}
>

One-on-One Consultation

</div>

</div>

<button

onClick={() =>
setSelectedPartner(partner)
}

style={{

background:
selectedPartner?.id===partner.id
? "#15803D"
: "#143B73",

color:"#FFFFFF",

border:"none",

padding:"14px 22px",

borderRadius:14,

cursor:"pointer",

fontWeight:700,

fontSize:15

}}

>

{selectedPartner?.id===partner.id
? "✓ Selected"
: "Select Expert"}

</button>

</div>

</div>

      ))}
    </div>
  </div>
)}

{/* ============================================================
                CONSULTATION SUMMARY
============================================================ */}

{selectedPartner && (

<div
style={{
marginTop:40,
background:"#FFFFFF",
border:"1px solid #E2E8F0",
borderRadius:28,
padding:32
}}
>

<div
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:30
}}
>

<div>

<div
style={{
fontSize:13,
fontWeight:700,
letterSpacing:1,
textTransform:"uppercase",
color:"#EA580C"
}}
>

CONSULTATION SUMMARY

</div>

<h2
style={{
margin:"8px 0 0"
}}
>

Review Before Booking

</h2>

</div>

<div
style={{
background:"#FFF7ED",
padding:"10px 18px",
borderRadius:999,
fontWeight:700,
color:"#EA580C"
}}
>

{selectedPartner.credits} Credits

</div>

</div>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(2,1fr)",
gap:20,
marginBottom:28
}}
>

<div>

<div
style={{
fontSize:13,
color:"#64748B"
}}
>

Expert

</div>

<div
style={{
fontSize:18,
fontWeight:700,
marginTop:6
}}
>

{selectedPartner.name}

</div>

</div>

<div>

<div
style={{
fontSize:13,
color:"#64748B"
}}
>

Category

</div>

<div
style={{
fontSize:18,
fontWeight:700,
marginTop:6
}}
>

{selectedCategory}

</div>

</div>

<div>

<div
style={{
fontSize:13,
color:"#64748B"
}}
>

Skill

</div>

<div
style={{
fontSize:18,
fontWeight:700,
marginTop:6
}}
>

{selectedSkill}

</div>

</div>

<div>

<div
style={{
fontSize:13,
color:"#64748B"
}}
>

Topic

</div>

<div
style={{
fontSize:18,
fontWeight:700,
marginTop:6
}}
>

{consultationTopic}

</div>

</div>

</div>

<div
style={{
marginBottom:28
}}
>

<div
style={{
fontSize:13,
color:"#64748B",
marginBottom:10
}}
>

Description

</div>

<div
style={{
background:"#F8FAFC",
padding:20,
borderRadius:16,
lineHeight:1.7,
color:"#334155"
}}
>

{consultationDescription}

</div>

</div>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(2,1fr)",
gap:20,
marginBottom:30
}}
>

<div
style={{
background:"#FFF7ED",
padding:20,
borderRadius:16,
border:"1px solid #FED7AA"
}}
>

<div
style={{
fontSize:13,
color:"#EA580C"
}}
>

Consultation Cost

</div>

<div
style={{
fontSize:28,
fontWeight:700,
marginTop:10,
color:"#EA580C"
}}
>

{selectedPartner.credits}

</div>

</div>

<div
style={{
background:"#F0FDF4",
padding:20,
borderRadius:16,
border:"1px solid #BBF7D0"
}}
>

<div
style={{
fontSize:13,
color:"#15803D"
}}
>

Remaining Credits

</div>

<div
style={{
fontSize:28,
fontWeight:700,
marginTop:10,
color:"#15803D"
}}
>

{availableCredits-selectedPartner.credits}

</div>

</div>

</div>

<div
style={{
display:"flex",
justifyContent:"flex-end",
gap:16
}}
>

<button

onClick={()=>{
setSelectedPartner(null);
}}

style={{
padding:"14px 26px",
borderRadius:14,
background:"#E2E8F0",
border:"none",
cursor:"pointer",
fontWeight:700
}}
>

Cancel

</button>

<button

onClick={async()=>{

try{

await bookConsultation({

studentId: profile?.id,

partnerId:selectedPartner.id,

category:selectedCategory!,

skill:selectedSkill,

topic:consultationTopic,

description:consultationDescription,

consultationCredits:selectedPartner.credits

});

alert("Consultation request submitted successfully.");

}
catch(error){

console.error(error);

alert("Unable to submit consultation request.");

}

}}

style={{

padding:"14px 32px",

borderRadius:14,

background:"#FF6B00",

color:"#FFFFFF",

border:"none",

cursor:"pointer",

fontWeight:700,

fontSize:16

}}

>

Book Consultation →

</button>

</div>

</div>

)}


    </div>
</div>
);
}
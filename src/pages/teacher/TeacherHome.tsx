export default function TeacherHome() {
  return (
    <div
      style={{
        padding: 32,
        background: "#F6F6F3",
        minHeight: "100%",
      }}
    >
      {/* DARK HEADER */}

      <div
        style={{
          background: "#04122F",
          borderRadius: 28,
          padding: 30,
          marginBottom: 28,
          color: "white",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#F59E0B",
            fontSize: 13,
            letterSpacing: 2,
            fontWeight: 700,
          }}
        >
          CLASSROOM COMPREHENSION LIMIT ALERTS
        </p>

        <h1
          style={{
            marginTop: 12,
            marginBottom: 12,
            fontSize: 34,
          }}
        >
          CLASSROOM INTELLIGENCE DASHBOARD
        </h1>

        <p
          style={{
            margin: 0,
            color: "#D1D5DB",
            lineHeight: 1.8,
          }}
        >
          Review today's classroom feedback and
          identify concepts that require additional
          teaching support.
        </p>
      </div>

      {/* CLASS SELECTOR */}

      <div
        style={{
          marginBottom: 30,
          display: "flex",
          gap: 18,
        }}
      >
        <select style={dropdownStyle}>
          <option>
            Class 10 B
          </option>

          <option>
            Class 8 A
          </option>

          <option>
            Class 12 A
          </option>
        </select>
      </div>

      {/* MOST COMMON DOUBT */}

      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            gap: 20,
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 36,
            }}
          >
            🔥
          </div>

          <div>
            <h3
              style={{
                marginTop: 0,
                color: "#EF4444",
              }}
            >
              MOST COMMON DOUBT ASKED
            </h3>

            <h2
              style={{
                marginTop: 5,
                color: "#0F172A",
              }}
            >
              Parts of Speech
            </h2>

            <p
              style={{
                color: "#64748B",
              }}
            >
              73% students reported confusion
              regarding noun and pronoun usage.
            </p>
          </div>
        </div>
      </div>

      {/* TOP 5 STUDENTS */}

      <div
        style={{
          marginTop: 30,
        }}
      >
        <h2>
          Least Positive Student Responses
        </h2>

        {[1,2,3,4,5].map((item)=>(
          <div
            key={item}
            style={studentCard}
          >
            <h3>
              Student {item}
            </h3>

            <p>
              Feedback :
              Class pacing was too fast.
            </p>

            <p>
              Specific Doubt :
              Unable to understand
              noun classifications.
            </p>

            <div
              style={suggestionBox}
            >
              Tomorrow's Suggested Focus :
              Revise noun categories for
              first 10 minutes.
            </div>

          </div>
        ))}
      </div>

      {/* CLASS HEALTH */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4,1fr)",
          gap: 20,
          marginTop: 35,
        }}
      >
        <DashboardKPI
          title="Comprehension"
          value="92%"
        />

        <DashboardKPI
          title="Positive"
          value="42"
        />

        <DashboardKPI
          title="Negative"
          value="8"
        />

        <DashboardKPI
          title="Homework Issues"
          value="4"
        />
      </div>


      {/* AI SUGGESTION */}

      <div
        style={{
          ...cardStyle,
          marginTop:30,
        }}
      >
        <h2>
          AI Suggested Action
        </h2>

        <p>
          Spend the first 15 minutes tomorrow
          revising Parts of Speech through
          interactive examples before moving
          to the next chapter.
        </p>
      </div>


      {/* TOPIC COVERAGE */}

      <div
        style={{
          ...cardStyle,
          marginTop:30,
        }}
      >
        <h2>
          Today's Topic Coverage
        </h2>

        <p>
          Today's Topic :
          Parts of Speech
        </p>

        <p>
          Previous Topic :
          Articles
        </p>

        <p>
          Last Daily Log Submitted :
          Today 11:42 AM
        </p>
      </div>
    </div>
  );
}


function DashboardKPI(props:any){

return(

<div
style={{
background:"white",
padding:25,
borderRadius:20,
boxShadow:
"0px 10px 25px rgba(0,0,0,0.05)",
}}
>

<h1
style={{
margin:0,
color:"#04122F",
}}
>
{props.value}
</h1>

<p>
{props.title}
</p>

</div>

)

}



const cardStyle={

background:"white",
padding:30,
borderRadius:24,
boxShadow:
"0px 10px 25px rgba(0,0,0,0.05)",

} as const;



const dropdownStyle={

padding:"16px",
minWidth:"260px",
borderRadius:"14px",
border:
"1px solid #CBD5E1",
fontSize:16,

} as const;


const studentCard={

background:"white",
padding:25,
borderRadius:22,
marginBottom:18,
boxShadow:
"0px 10px 25px rgba(0,0,0,0.05)",

} as const;


const suggestionBox={

background:"#FFF7ED",
padding:18,
borderRadius:14,
marginTop:15,
fontWeight:600,
color:"#9A3412",

} as const;

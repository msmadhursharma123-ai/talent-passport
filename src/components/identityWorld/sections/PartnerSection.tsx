import CONTENT from "../data/identityWorldContent";

import SectionContainer from "../shared/SectionContainer";
import FloatingBackground from "../shared/FloatingBackground";
import AnimatedHeading from "../shared/AnimatedHeading";
import GlassCard from "../shared/GlassCard";
import SectionTransition from "../shared/SectionTransition";

import COLORS from "../styles/colors";

export default function PartnerSection() {

    const section = CONTENT.partners.section;


const partnerCardThemes = [

{
background:"linear-gradient(180deg,#FFF9F4,#FFF3EC)",
border:"#F4D7C7",
title:"#B13220",
bullet:"#E85A47"
},

{
background:"linear-gradient(180deg,#FAF7FF,#F4EEFF)",
border:"#DDD2FF",
title:"#5A2E98",
bullet:"#7C4DFF"
},

{
background:"linear-gradient(180deg,#F8FFF5,#EEFBEA)",
border:"#D4F1C6",
title:"#15703A",
bullet:"#21A551"
},

{
background:"linear-gradient(180deg,#F6FAFF,#EDF5FF)",
border:"#D3E5FF",
title:"#2456A7",
bullet:"#4B7DFF"
},

{
background:"linear-gradient(180deg,#FFFDF5,#FFF7E6)",
border:"#F4E0A4",
title:"#B26B00",
bullet:"#D99A00"
},

{
background:"linear-gradient(180deg,#F5FDFF,#EAFBFF)",
border:"#CDEEF8",
title:"#12637C",
bullet:"#2D9BC3"
}

];

    const partnerCards = [
        {
            title: "Dance Academy",
            emoji: "💃",
            offerings: [
                "Classical Dance",
                "Hip-Hop",
                "Stage Shows",
                "Competitions",
                "Workshops",
            ],
        },
        {
            title: "Music School",
            emoji: "🎵",
            offerings: [
                "Vocal Music",
                "Instruments",
                "Band Programs",
                "Performances",
                "Certifications",
            ],
        },
        {
            title: "Sports Academy",
            emoji: "⚽",
            offerings: [
                "Football",
                "Cricket",
                "Athletics",
                "Fitness Camps",
                "Championships",
            ],
        },
        {
            title: "Robotics Lab",
            emoji: "🤖",
            offerings: [
                "Robotics",
                "STEM Labs",
                "Coding",
                "Artificial Intelligence",
                "Innovation Projects",
            ],
        },
        {
            title: "Acting Studio",
            emoji: "🎬",
            offerings: [
                "Theatre",
                "Public Speaking",
                "Drama",
                "Expression",
                "Confidence Building",
            ],
        },
        {
            title: "Coding Institute",
            emoji: "💻",
            offerings: [
                "Programming",
                "Web Development",
                "App Development",
                "AI & ML",
                "Future Skills",
            ],
        },
    ];

    return (

   <SectionContainer
    id="partners"
    background="linear-gradient(180deg,#FCFBF8 0%,#F8F5EE 45%,#FBFAF7 100%)"
    style={{
        position: "relative",
        overflow: "hidden",

        paddingTop: "clamp(42px,6vw,70px)",
        paddingBottom: "clamp(52px,7vw,90px)"
    }}
>



{/* PREMIUM DESKTOP BACKGROUND */}

<div
    className="partner-desktop-background"
    style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden"
    }}
>
<FloatingBackground
    style={{
        opacity:0.18
    }}
/>

    {/* soft blue glow */}

    <div
        style={{
            position: "absolute",
            inset: 0,
            background: `
                radial-gradient(circle at 18% 20%,rgba(23,63,122,.05),transparent 34%),
                radial-gradient(circle at 82% 22%,rgba(197,137,26,.05),transparent 34%),
                radial-gradient(circle at 50% 100%,rgba(23,63,122,.03),transparent 45%)
            `
        }}
    />

    {/* watermark image */}

<img
    src="/partner-watermark-desktop.png"
    alt=""
    style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "96%",
        maxWidth: "2000px",
        height: "auto",
        opacity:0.35,
        mixBlendMode: "multiply",
        pointerEvents: "none",
        userSelect: "none"
    }}
/>

</div>

    <div
        style={{
            width: "100%",
            maxWidth: 1480,
            margin: "0 auto",
            paddingInline: "clamp(14px,3vw,60px)",
            position: "relative",
            zIndex: 2,
            boxSizing: "border-box"
        }}
    >

        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}

        <div
            className="partner-hero"
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: "clamp(24px,4vw,40px)"
            }}
        >

       <div className="partner-heading">

    <AnimatedHeading
        badge="BECOME A PARTNER"

        title="Bring Great Learning Opportunities To Every Student."

        subtitle="Talent Passport connects trusted academies, institutes and learning partners with schools and students to create meaningful opportunities beyond the classroom. A marketplace where students and institutes find each other and reach out for workshops, auditions and scholarships."

        align="center"

        maxWidth={920}
    />

</div>
        </div>

        <style>{`

#partners *{
box-sizing:border-box;
}

/* ========================================= */
/* Tablet */
/* ========================================= */

@media (max-width:1024px){

#partners{

padding-top:48px;

padding-bottom:60px;

}

.partner-hero{

transform:scale(.94);

transform-origin:top center;

margin-bottom:20px;

}

}

/* ========================================= */
/* Mobile */
/* ========================================= */

@media (max-width:768px){

#partners{

overflow-x:hidden;

}

.partner-hero{

transform:scale(.82);

transform-origin:top center;

margin-bottom:-8px;

}

#partners h1{

font-size:clamp(28px,7vw,40px)!important;

line-height:1.12!important;

}

#partners h2{

font-size:clamp(18px,5vw,24px)!important;

}

#partners h3{

font-size:clamp(18px,5vw,22px)!important;

}

#partners p{

font-size:14px!important;

line-height:1.55!important;

}

}

/* ================================================= */
/* GOLDEN SHINING SUBTITLE */
/* ================================================= */

.partner-heading p{

background:
linear-gradient(
90deg,
#5F6B86 0%,
#7B6A43 18%,
#C5891A 34%,
#F2D27A 50%,
#C5891A 66%,
#7B6A43 82%,
#5F6B86 100%
);

background-size:220% auto;

-webkit-background-clip:text;
-webkit-text-fill-color:transparent;
background-clip:text;

animation:partnerGoldenFlow 7s linear infinite;

font-weight:500;

}

@keyframes partnerGoldenFlow{

0%{
background-position:0% center;
}

100%{
background-position:220% center;
}

}

`}</style>

                {/* =====================================================

                    PACKAGE 11 PART 2 STARTS HERE

                ===================================================== */}

          <div
className="partner-network"

    style={{

        position: "relative",

        width: "100%",

        maxWidth: 1220,

        height: 620,

        margin: "0 auto"

    }}

>

    {/* ===================================================== */}

    {/* CENTRAL VERIFIED NETWORK */}

    {/* ===================================================== */}

    <GlassCard

        hover={false}

        style={{

            position: "absolute",

            left: "50%",

            top: 200,

            transform: "translateX(-50%)",

            width: 310,

            padding: 30,

            textAlign: "center",

            background:
                "linear-gradient(180deg,#FFFDFC 0%,#FFF6EC 100%)",

            border:
"1px solid rgba(214,162,60,.22)",

            boxShadow:
                "0 18px 45px rgba(23,63,122,.08)",

            zIndex: 3

        }}

    >

        <div

            style={{

                color: "#B7791F",

                fontWeight: 800,

                letterSpacing: 2,

                textTransform: "uppercase",

                marginBottom: 18

            }}

        >

            VERIFIED NETWORK

        </div>

        <div

            style={{

                fontSize: 24,

                color: "#173F7A",

                fontWeight: 900,

                lineHeight: 1.15

            }}

        >

            Talent Passport

            <br />

            Partner Platform

        </div>

        <div

            style={{

                marginTop: 24,

                color: "#667085",

                lineHeight: 1.8,

                fontSize: 15

            }}

        >

            A trusted network where verified learning

            institutes connect with schools, students

            and parents through meaningful educational

            opportunities.

        </div>

    </GlassCard>

    {/* ===================================================== */}
    {/* CONNECTION LINES */}
    {/* ===================================================== */}

    <svg
        width="100%"
        height="620"
        style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
        }}
    >
        {/* Top Left */}
        <line
            x1="610"
            y1="300"
            x2="240"
            y2="110"
            stroke="rgba(214,162,60,.22)"
            strokeWidth="2"
        />

        {/* Top Right */}
        <line
            x1="610"
            y1="300"
            x2="980"
            y2="110"
            stroke="rgba(214,162,60,.22)"
            strokeWidth="2"
        />

        {/* Middle Left */}
        <line
            x1="610"
            y1="300"
            x2="200"
            y2="300"
            stroke="rgba(214,162,60,.22)"
            strokeWidth="2"
        />

        {/* Middle Right */}
        <line
            x1="610"
            y1="300"
            x2="1020"
            y2="300"
            stroke="rgba(214,162,60,.22)"
            strokeWidth="2"
        />

        {/* Bottom Left */}
        <line
            x1="610"
            y1="300"
            x2="250"
            y2="520"
            stroke="rgba(214,162,60,.22)"
            strokeWidth="2"
        />

        {/* Bottom Right */}
        <line
            x1="610"
            y1="300"
            x2="970"
            y2="520"
            stroke="rgba(214,162,60,.22)"
            strokeWidth="2"
        />
    </svg>


   {/* ===================================================== */}
{/* PARTNER TYPES */}
{/* ===================================================== */}



{partnerCards.map((partner, index) => {

const desktopPosition = [

{ left:110, top: -60 },

{ right:110, top:-60 },

{ left:60, top:220 },

{ right:60, top:220 },

{ left:110, top:500 },

{ right:110, top:500 }

][index];


return (

    <GlassCard
        key={partner.title}
        hover={false}
        style={{
            position: "absolute",
            zIndex: 2,
            width: 250,
            padding: 22,
            borderRadius: 24,
            background:partnerCardThemes[index].background,
            border:`1px solid ${partnerCardThemes[index].border}`,
            boxShadow:
                "0 12px 30px rgba(17,24,39,.06)",
           left: desktopPosition.left,

right: desktopPosition.right,

top: desktopPosition.top,
        }}
    >
        <div
            style={{
                fontSize: 28,
                marginBottom: 14,
            }}
        >
            {partner.emoji}
        </div>

        <div
            style={{
                color:partnerCardThemes[index].title,
                fontWeight: 800,
                fontSize: 18,
                marginBottom: 14,
            }}
        >
            {partner.title}
        </div>

        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
            }}
        >
            {partner.offerings.map((item) => (
                <div
                    key={item}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "#667085",
                        fontSize: 14,
                        lineHeight: 1.4,
                    }}
                >
                    <span
                        style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background:partnerCardThemes[index].bullet,
                            flexShrink: 0,
                        }}
                    />

                    <span>{item}</span>
                </div>
            ))}
        </div>
    </GlassCard>

);

})
}
</div>

{/* ===================================================== */}
{/* MOBILE / TABLET NETWORK */}
{/* ===================================================== */}

<div className="partner-network-mobile">

    <GlassCard
        hover={false}
        style={{
            padding:18,
borderRadius:20,
marginBottom:14,
            textAlign:"center",
            background:
"linear-gradient(180deg,#FFFFFF 0%,#FCFBF8 100%)",
            border:"1px solid rgba(214,162,60,.14)"
        }}
    >

        <div
            style={{
                color:"#B7791F",
                fontWeight:800,
                letterSpacing:2,
                marginBottom:12
            }}
        >
            VERIFIED NETWORK
        </div>

        <div
            style={{
                fontSize:22,
                fontWeight:900,
                color:"#173F7A",
                lineHeight:1.2
            }}
        >
            Talent Passport
            <br/>
            Partner Platform
        </div>

        <p
            style={{
                marginTop:14,
                color:"#667085",
                lineHeight:1.6,
                fontSize:14
            }}
        >
            Trusted educational institutes connected
            with schools, parents and students.
        </p>

    </GlassCard>

    <div className="partner-mobile-grid">

       {partnerCards.map((partner)=>(

<GlassCard
    key={partner.title}
    hover={false}
    style={{
        padding:10,
        borderRadius:16,
background:
"linear-gradient(180deg,#FFFFFF 0%,#FFFDFC 100%)",
        border:"1px solid rgba(214,162,60,.10)",
        minHeight:92,
        display:"flex",
        flexDirection:"column",
        justifyContent:"center",
        alignItems:"center",
        textAlign:"center"
    }}
>

<div
style={{
fontSize:24,
marginBottom:6
}}
>
{partner.emoji}
</div>

<div
style={{
fontSize:15,
fontWeight:800,
lineHeight:1.15,
color:"#173F7A"
}}
>
{partner.title}
</div>

</GlassCard>

))}

    </div>

</div>

                {/* =====================================================

                    PACKAGE 11 PART 3 STARTS HERE

                ===================================================== */}

<div

    className="partner-content"

    style={{

        marginTop:180,

        display:"flex",

        flexDirection:"column",

        alignItems:"center",

        textAlign:"center"

    }}

>

    {/* ================================================= */}

    {/* PARTNER GROWTH JOURNEY */}

    {/* ================================================= */}

    <div
className="partner-journey"

        style={{

            width:"100%",

            maxWidth:1280,

            display:"grid",

           gridTemplateColumns:

    "repeat(4,minmax(0,1fr))",

gap:20

        }}

    >

        {

            [

              {

    icon:"✅",

    title:"Verified Institute",

    text:"Build trust with schools through a verified institutional profile."

},
{

    icon:"🤝",

    title:"School Partnerships",

    text:"Connect with schools seeking workshops, enrichment and academic programs."

},
{

    icon:"🎯",

    title:"Student Discovery",

    text:"Help interested students discover your programs through Talent Passport."

},
{

    icon:"📈",

    title:"Sustainable Growth",

    text:"Expand your reach through long-term educational partnerships."

}

            ].map(

                item=>(

                    <GlassCard

                        key={item.title}

                        style={{

    padding:24,

    borderRadius:22,

    background:
        "linear-gradient(180deg,#FFFFFF 0%,#FCFBF8 100%)",

    border:"1px solid rgba(214,162,60,.10)",

    boxShadow:
        "0 12px 30px rgba(17,24,39,.05)",

    minHeight:180,

    display:"flex",

    flexDirection:"column",

    justifyContent:"flex-start",

    alignItems:"center",

    textAlign:"center"

}}

                    >

                        <div

                            style={{

                                fontSize:28,

                                marginBottom:14

                            }}

                        >

                            {item.icon}

                        </div>

                        <div

                            style={{

                                color:"#173F7A",

fontWeight:800,

fontSize:18,

marginBottom:12

                            }}

                        >

                            {item.title}

                        </div>

                        <div

                            style={{

                                color:"#667085",

fontSize:14,

lineHeight:1.7

                            }}

                        >

                            {item.text}

                        </div>

                    </GlassCard>

                )

            )

        }

    </div>

 

{/* ================================================= */}
{/* MAIN MESSAGE */}
{/* ================================================= */}


{/* ================================================= */}
{/* FINAL VISION CARD */}
{/* ================================================= */}



</div>


<style>{`
/* ========================================= */
/* DESKTOP */
/* ========================================= */

.partner-network-mobile{
display:none;
}

.partner-desktop-background{

display:block;

}

@media (max-width:1024px){

.partner-desktop-background{

display:none;

}

}

/* ========================================= */
/* TABLET */
/* ========================================= */

@media (max-width:1024px){

.partner-network{
display:none;
}

.partner-network-mobile{
display:block;
max-width:620px;
margin:0 auto 20px;
}

.partner-content{
margin-top:30px !important;
}

/* Hero */

/* Hero */

.partner-hero{
transform:none !important;
padding:0;
width:100%;
margin-bottom:20px;
}

#partners .partner-hero h2{
font-size:38px !important;
line-height:1.18 !important;
letter-spacing:-1px !important;
max-width:650px !important;
margin:0 auto 24px !important;
}

#partners .partner-hero p{
font-size:16px !important;
line-height:1.6 !important;
max-width:600px !important;
margin:0 auto !important;
}

/* Grid */

.partner-mobile-grid{
display:grid;
grid-template-columns:repeat(2,minmax(0,1fr));
gap:12px;
align-items:stretch;
}

.partner-mobile-grid>*{
min-height:170px;
display:flex;
flex-direction:column;
justify-content:flex-start;
}

/* Journey */

.partner-journey{
grid-template-columns:repeat(2,1fr)!important;
gap:14px!important;
}

/* Services */

.partner-services{
display:grid!important;
grid-template-columns:repeat(2,minmax(0,1fr));
column-gap:12px;
row-gap:4px;
margin-top:20px!important;
}

.partner-services>*{
width:100%!important;
min-width:0!important;
padding:6px 8px!important;
min-height:auto!important;
}

.partner-services>* div{
font-size:13px!important;
font-weight:700!important;
line-height:1.25!important;
}

}

/* ========================================= */
/* MOBILE */
/* ========================================= */

@media (max-width:768px){

#partners{
overflow-x:hidden;
}

/* Hero */

.partner-hero{
transform:none !important;
padding:0;
width:100%;
margin-bottom:16px;
}

#partners .partner-hero h2{
font-size:44px !important;
line-height:1.08 !important;
letter-spacing:-2px !important;
max-width:360px !important;
margin:0 auto 30px !important;
}

#partners .partner-hero p{
font-size:14px !important;
line-height:1.55 !important;
max-width:340px !important;
margin:0 auto !important;
}

/* Verified Card */

.partner-network{
display:none;
}

.partner-network-mobile{
display:block;
max-width:560px;
margin:auto;
}

.partner-network-mobile>div:first-child{
padding:18px!important;
margin-bottom:18px!important;
}

/* Partner Cards */

.partner-mobile-grid{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:8px;
margin-top:10px;
}

.partner-mobile-grid>*{
padding:10px!important;
min-height:92px!important;
border-radius:16px!important;
display:flex;
justify-content:center;
align-items:center;
flex-direction:column;
}

.partner-mobile-grid div{
text-align:center;
}

.partner-mobile-grid p{
display:none!important;
}

/* Journey */

.partner-journey{
grid-template-columns:repeat(2,1fr)!important;
gap:10px!important;
}

.partner-journey>*{
padding:12px!important;
min-height:135px!important;
}

.partner-journey>* div:nth-child(1){
font-size:26px!important;
}

.partner-journey>* div:nth-child(2){
font-size:16px!important;
}

.partner-journey>* div:nth-child(3){
font-size:13px!important;
line-height:1.45!important;
}

/* Services */

.partner-services{
display:grid!important;
grid-template-columns:repeat(2,minmax(0,1fr));
column-gap:12px;
row-gap:2px;
margin-top:18px!important;
}

.partner-services>*{
width:100%!important;
min-width:0!important;
padding:4px 6px!important;
min-height:auto!important;
height:auto!important;
}

.partner-services>* div{
font-size:12px!important;
font-weight:700!important;
line-height:1.2!important;
}

}

}
`}</style>


<SectionTransition />

            </div>

        </SectionContainer>

    );

}
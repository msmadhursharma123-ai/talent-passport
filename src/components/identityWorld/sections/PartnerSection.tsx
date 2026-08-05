import CONTENT from "../data/identityWorldContent";

import SectionContainer from "../shared/SectionContainer";
import FloatingBackground from "../shared/FloatingBackground";
import AnimatedHeading from "../shared/AnimatedHeading";
import GlassCard from "../shared/GlassCard";
import SectionTransition from "../shared/SectionTransition";

import COLORS from "../styles/colors";

export default function PartnerSection() {

    const section = CONTENT.partners.section;




const scrollingJourney = [

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

];

const scrollingCards=[

...scrollingJourney,

...scrollingJourney,

...scrollingJourney

];

    return (

  <SectionContainer
    id="partners"
    background="#FFFFFF"
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
        position:"absolute",
        inset:0,
        background:"#FFFFFF",
        zIndex:0
    }}
/>

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

/* =====================================================
   MOBILE PARTNER GRID
===================================================== */

.partner-network-mobile{
display:none;
}

.partner-mobile-grid{
    display:grid;
    grid-template-columns:repeat(3,1fr);
    gap:14px;
}

.partner-mobile-card{
    width:100%;
}

.partner-mobile-icon{
    width:52px;
    height:52px;
    border-radius:16px;
    display:flex;
    align-items:center;
    justify-content:center;
    margin:0 auto 10px;
    font-size:24px;
}

.partner-mobile-title{
    text-align:center;
    font-weight:800;
    line-height:1.12;
}

/* ========================================= */
/* TABLET */
/* ========================================= */



@media (max-width:1024px){

.partner-content{
margin-top:26px!important;
}

/* ---------------- Hero ---------------- */

.partner-hero{
transform:none!important;
margin-bottom:18px!important;
}

#partners .partner-hero h2{
font-size:34px!important;
line-height:1.12!important;
max-width:720px!important;
margin:0 auto 18px!important;
}

#partners .partner-hero p{
font-size:15px!important;
line-height:1.6!important;
max-width:700px!important;
margin:0 auto!important;
}

/* ---------------- Ecosystem ---------------- */

.partner-ecosystem{

display:grid;

grid-template-columns:repeat(2,minmax(0,1fr));

grid-template-areas:

"hub hub"

"left right";

gap:18px;

max-width:760px;

margin:22px auto;

}

.partner-left{
grid-area:left;
}

.partner-right{
grid-area:right;
}

.partner-hub{

grid-area:hub;

display:flex;

justify-content:center;

margin-bottom:6px;

}

.partner-hub>div{

width:220px!important;

height:220px!important;

padding:22px!important;

}

.partner-hub>div div:nth-child(2){

font-size:22px!important;

}

.partner-hub>div div:nth-child(3){

font-size:15px!important;

}

.partner-hub-text{

font-size:12px!important;

line-height:1.5!important;

max-width:150px!important;

}

.partner-network-mobile{
display:block;
margin:18px auto 24px;
max-width:560px;
}

.partner-ecosystem{
display:none !important;
}

/* ---------------- Label ---------------- */

.partner-ecosystem-label{

margin:18px auto 12px!important;

}

.partner-ecosystem-label>div:nth-child(2){

font-size:12px!important;

padding:8px 18px!important;

}

/* ---------------- Services ---------------- */

.partner-services{

grid-template-columns:repeat(2,1fr)!important;

gap:10px!important;

margin-bottom:18px!important;

}

.partner-services>*{

padding:12px!important;

font-size:13px!important;

}

/* ---------------- Marquee ---------------- */

.partner-journey-track{

gap:14px!important;

animation-duration:22s!important;

}

.partner-journey-track>div{

width:170px!important;

min-height:112px!important;

padding:12px!important;

border-radius:16px!important;

}

.partner-journey-track>div div:first-child{

width:42px!important;

height:42px!important;

font-size:20px!important;

margin-bottom:8px!important;

}

.partner-journey-track>div div:nth-child(2){

font-size:14px!important;

margin-bottom:6px!important;

}

.partner-journey-track>div div:nth-child(3){

font-size:11px!important;

line-height:1.4!important;

}

}

/* ========================================= */
/* MOBILE */
/* ========================================= */

@media (max-width:768px){

.partner-network-mobile{
max-width:360px;
margin:18px auto;
}

#partners{
overflow-x:hidden;
padding-top:36px!important;
padding-bottom:44px!important;
}

/* ---------------- Hero ---------------- */

.partner-hero{
transform:none!important;
margin-bottom:14px!important;
padding:0!important;
}

#partners .partner-hero h2{

font-size:28px!important;

line-height:1.12!important;

letter-spacing:-1px!important;

max-width:330px!important;

margin:0 auto 14px!important;

}

#partners .partner-hero p{

font-size:13px!important;

line-height:1.55!important;

max-width:320px!important;

margin:0 auto!important;

}

/* ---------------- Ecosystem ---------------- */



.partner-left{
grid-area:left;
}

.partner-right{
grid-area:right;
}

.partner-hub{

grid-area:hub;

display:flex;

justify-content:center;

margin-bottom:4px;

}

.partner-hub>div{

width:170px!important;

height:170px!important;

padding:16px!important;

}

.partner-hub>div div:nth-child(2){

font-size:17px!important;

}

.partner-hub>div div:nth-child(3){

font-size:12px!important;

margin-top:4px!important;

}

.partner-hub-text{

font-size:10px!important;

line-height:1.4!important;

max-width:120px!important;

margin-top:10px!important;

}



/* ---------------- Label ---------------- */

.partner-ecosystem-label{

margin:14px auto 10px!important;

gap:8px!important;

}

.partner-ecosystem-label>div:first-child,
.partner-ecosystem-label>div:last-child{

width:38px!important;

}

.partner-ecosystem-label>div:nth-child(2){

padding:7px 14px!important;

font-size:10px!important;

letter-spacing:1px!important;

}

/* ---------------- Services ---------------- */

.partner-services{

display:grid!important;

grid-template-columns:repeat(2,1fr);

gap:8px!important;

margin-bottom:14px!important;

}

.partner-services>*{

padding:9px!important;

font-size:11px!important;

border-radius:12px!important;

}

.partner-services>* span{

font-size:13px!important;

}

/* ---------------- Journey ---------------- */

.partner-journey-marquee{

margin-top:12px!important;

}

.partner-journey-track{

gap:10px!important;

animation-duration:18s!important;

}

.partner-journey-track>div{

width:145px!important;

min-height:96px!important;

padding:9px!important;

border-radius:12px!important;

}

.partner-journey-track>div div:first-child{

width:34px!important;

height:34px!important;

font-size:16px!important;

margin-bottom:7px!important;

}

.partner-journey-track>div div:nth-child(2){

font-size:12px!important;

margin-bottom:4px!important;

}

.partner-journey-track>div div:nth-child(3){

font-size:10px!important;

line-height:1.35!important;

}

}

/* ================================================= */
/* GOLDEN SHINING SUBTITLE */
/* ================================================= */

.partner-heading p{

color:#444B5D !important;

background:none !important;

-webkit-text-fill-color:unset !important;

-webkit-background-clip:border-box !important;

background-clip:border-box !important;

animation:none !important;

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

     {/* =======================================================
    PARTNER ECOSYSTEM V2
======================================================= */}

<div
className="partner-ecosystem"
style={{

width:"100%",

maxWidth:1320,

margin:"0 auto",

display:"grid",

gridTemplateColumns:"1fr 300px 1fr",

gap:34,

alignItems:"center"

}}
>

{/* ========================================= */}
{/* LEFT COLUMN */}
{/* ========================================= */}

<div
className="partner-side partner-left"
>

{[
{
emoji:"💃",
title:"Dance Academies",
text:"Classical • Hip-Hop • Stage Shows • Workshops"
},
{
emoji:"🎵",
title:"Music Schools",
text:"Vocals • Instruments • Performances • Certifications"
},
{
emoji:"⚽",
title:"Sports Academies",
text:"Football • Cricket • Athletics • Championships"
}
].map(item=>(

<GlassCard
key={item.title}
hover={false}
style={{

padding:20,

display:"flex",

alignItems:"center",

gap:18,

borderRadius:22,

background:"#FFFFFF",

border:"1px solid rgba(23,63,122,.08)",

boxShadow:"0 10px 24px rgba(17,24,39,.05)"

}}
>

<div
className="partner-node-icon"
style={{

width:62,

height:62,

borderRadius:18,

background:"linear-gradient(180deg,#FFF8EA,#FFF2D7)",

display:"flex",

justifyContent:"center",

alignItems:"center",

fontSize:28,

flexShrink:0

}}
>

{item.emoji}

</div>

<div
style={{
flex:1
}}
>

<div
style={{

fontWeight:800,

fontSize:18,

color:"#173F7A",

marginBottom:6

}}
>

{item.title}

</div>

<div
style={{

fontSize:14,

lineHeight:1.55,

color:"#667085"

}}
>

{item.text}

</div>

</div>

</GlassCard>

))}

</div>

{/* ========================================= */}
{/* CENTER HUB */}
{/* ========================================= */}

<div
className="partner-hub"
>

<div
className="partner-hub-circle"
style={{

width:280,

height:280,

borderRadius:"50%",

background:"linear-gradient(180deg,#FFFFFF,#FFF9EF)",

border:"2px solid rgba(214,162,60,.22)",

display:"flex",

flexDirection:"column",

justifyContent:"center",

alignItems:"center",

textAlign:"center",

padding:30,

position:"relative",

boxShadow:"0 18px 40px rgba(17,24,39,.08)"

}}
>

<div
style={{

position:"absolute",

inset:-14,

borderRadius:"50%",

border:"1px dashed rgba(214,162,60,.28)"

}}
/>

<div
style={{

fontSize:46,

marginBottom:10

}}
>

🎓

</div>

<div
style={{

fontWeight:900,

fontSize:25,

lineHeight:1.1,

color:"#173F7A"

}}
>

Talent Passport

</div>

<div
style={{

fontWeight:700,

fontSize:17,

color:"#B7791F",

marginTop:6

}}
>

Partner Network

</div>

<div
className="partner-hub-text"
style={{

marginTop:16,

fontSize:13,

lineHeight:1.55,

color:"#667085",

maxWidth:170

}}
>

Connecting institutes,
schools,
students and parents
through one verified
ecosystem.

</div>

</div>

</div>

{/* ========================================= */}
{/* RIGHT COLUMN */}
{/* ========================================= */}

<div
className="partner-side partner-right"
>

{[
{
emoji:"🤖",
title:"Robotics Labs",
text:"STEM • Coding • AI • Innovation Projects"
},
{
emoji:"🎭",
title:"Acting Studios",
text:"Theatre • Drama • Public Speaking • Expression"
},
{
emoji:"💻",
title:"Coding Institutes",
text:"Programming • Web • App • AI • Future Skills"
}
].map(item=>(

<GlassCard
key={item.title}
hover={false}
style={{

padding:20,

display:"flex",

alignItems:"center",

gap:18,

borderRadius:22,

background:"#FFFFFF",

border:"1px solid rgba(23,63,122,.08)",

boxShadow:"0 10px 24px rgba(17,24,39,.05)"

}}
>

<div
className="partner-node-icon"
style={{

width:62,

height:62,

borderRadius:18,

background:"linear-gradient(180deg,#EEF6FF,#F8FBFF)",

display:"flex",

justifyContent:"center",

alignItems:"center",

fontSize:28,

flexShrink:0

}}
>

{item.emoji}

</div>

<div
style={{
flex:1
}}
>

<div
style={{

fontWeight:800,

fontSize:18,

color:"#173F7A",

marginBottom:6

}}
>

{item.title}

</div>

<div
style={{

fontSize:14,

lineHeight:1.55,

color:"#667085"

}}
>

{item.text}

</div>

</div>

</GlassCard>

))}

</div>

</div>

{/* ================================================= */}
{/* MOBILE / TABLET NETWORK */}
{/* ================================================= */}

<div className="partner-network-mobile">

    <div className="partner-mobile-hub">

        <div className="partner-mobile-badge">
            VERIFIED NETWORK
        </div>

        <h3>
            Talent Passport
            <br />
            Partner Platform
        </h3>

        <p>
            Trusted educational institutes
            connected with schools,
            parents and students.
        </p>

    </div>

    <div className="partner-mobile-grid">

        {[
            {
                emoji:"💃",
                title:"Dance\nAcademy",
                color:"#FFEFE8",
                text:"#B53320"
            },
            {
                emoji:"🎵",
                title:"Music\nSchool",
                color:"#F2ECFF",
                text:"#5C36B8"
            },
            {
                emoji:"⚽",
                title:"Sports\nAcademy",
                color:"#EEFFE8",
                text:"#1E7A3C"
            },
            {
                emoji:"🤖",
                title:"Robotics\nLab",
                color:"#EEF5FF",
                text:"#2957A6"
            },
            {
                emoji:"🎬",
                title:"Acting\nStudio",
                color:"#FFF6E3",
                text:"#B36B00"
            },
            {
                emoji:"💻",
                title:"Coding\nInstitute",
                color:"#ECFAFF",
                text:"#17607D"
            }

        ].map(item=>(

            <div
                key={item.title}
                className="partner-mobile-card"
                style={{
                    border:`1px solid ${item.color}`,
                    background:"#fff"
                }}
            >

                <div
                    className="partner-mobile-icon"
                    style={{
                        background:item.color
                    }}
                >
                    {item.emoji}
                </div>

                <div
                    className="partner-mobile-title"
                    style={{
                        color:item.text
                    }}
                >
                    {item.title.split("\n").map(line=>(

                        <div key={line}>
                            {line}
                        </div>

                    ))}
                </div>

            </div>

        ))}

    </div>

</div>

{/* ========================================= */}
{/* VERIFIED ECOSYSTEM LABEL */}
{/* ========================================= */}

<div
className="partner-ecosystem-label"
style={{

display:"flex",

justifyContent:"center",

alignItems:"center",

gap:18,

margin:"28px auto 16px",

flexWrap:"wrap"

}}
>

<div
style={{

width:80,

height:2,

background:"linear-gradient(90deg,transparent,#D6A23C)"

}}
/>

<div
style={{

padding:"10px 22px",

borderRadius:999,

background:"#FFF8EC",

border:"1px solid rgba(214,162,60,.22)",

fontWeight:800,

fontSize:13,

letterSpacing:1.3,

textTransform:"uppercase",

color:"#B7791F"

}}
>

Verified Educational Ecosystem

</div>

<div
style={{

width:80,

height:2,

background:"linear-gradient(90deg,#D6A23C,transparent)"

}}
/>

</div>

{/* ========================================= */}
{/* VALUE CHIPS */}
{/* ========================================= */}

<div
className="partner-services"
style={{

display:"grid",

gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",

gap:18,

marginBottom:28

}}
>

{[
"Verified Partner Identity",
"Trusted School Network",
"Student Discovery Engine",
"Scholarships & Workshops"
].map(item=>(

<div
key={item}
style={{

padding:"16px 20px",

borderRadius:18,

background:"#FFFFFF",

border:"1px solid rgba(23,63,122,.08)",

boxShadow:"0 8px 20px rgba(17,24,39,.04)",

display:"flex",

alignItems:"center",

justifyContent:"center",

gap:10,

fontWeight:700,

fontSize:15,

color:"#173F7A"

}}
>

<span
style={{
fontSize:17
}}
>

✓

</span>

{item}

</div>

))}

</div>

{/* ===================================================== */
/* PACKAGE 11 PART 3 STARTS HERE */
/* ===================================================== */}

{/* =======================================================
END OF NEW PARTNER ECOSYSTEM
======================================================= */}

                {/* =====================================================

                    PACKAGE 11 PART 3 STARTS HERE

                ===================================================== */}

<div

    className="partner-content"

    style={{

        marginTop:60,

        display:"flex",

        flexDirection:"column",

        alignItems:"center",

        textAlign:"center"

    }}

>

    {/* ================================================= */}

    {/* PARTNER GROWTH JOURNEY */}

    {/* ================================================= */}

  <div className="partner-journey-marquee">

<div className="partner-journey-track">

{

scrollingCards.map((item,index)=>(

<GlassCard

key={index}

style={{

position:"relative",

width:230,

flexShrink:0,

padding:16,

borderRadius:18,

background:
"linear-gradient(180deg,#173F7A 0%,#224E93 100%)",

border:"1px solid rgba(255,255,255,.10)",

boxShadow:
`
0 12px 28px rgba(23,63,122,.16),
0 5px 16px rgba(0,0,0,.08)
`,

minHeight:145,

display:"flex",

flexDirection:"column",

alignItems:"center",

textAlign:"center"

}}
>

    

<div
style={{

fontSize:24,

width:48,

height:48,

borderRadius:"50%",

background:"rgba(255,255,255,.08)",

display:"flex",

alignItems:"center",

justifyContent:"center",

margin:"0 auto 12px",

backdropFilter:"blur(12px)"

}}
>

{item.icon}

</div>

<div
style={{

color:"#FFFFFF",

fontWeight:800,

fontSize:16,

letterSpacing:"-.02em",

marginBottom:8

}}
>

{item.title}

</div>

<div
style={{

fontSize:12,

lineHeight:1.45,

color:"rgba(255,255,255,.82)"

}}
>

{item.text}

</div>

</GlassCard>

))

}

</div>

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



.partner-journey-marquee{

overflow:hidden;

width:100%;

margin-top:20px;

}

.partner-journey-track{

display:flex;

gap:22px;

width:max-content;

animation:partnerJourneyScroll 28s linear infinite;

}

.partner-journey-marquee:hover .partner-journey-track{

animation-play-state:paused;

}

@keyframes partnerJourneyScroll{

0%{

transform:translateX(0);

}

100%{

transform:translateX(-33.333%);

}

}

/* =========================================================
   PARTNER ECOSYSTEM V2
========================================================= */

.partner-ecosystem{

display:grid;

grid-template-columns:1fr 300px 1fr;

gap:34px;

align-items:center;

margin:20px auto 36px;

max-width:1320px;

}

.partner-side{

display:flex;

flex-direction:column;

gap:18px;

}

.partner-side > div{

transition:.35s ease;

}

.partner-side > div:hover{

transform:translateY(-4px);

box-shadow:
0 18px 40px rgba(17,24,39,.08)!important;

}

.partner-hub{

display:flex;

justify-content:center;

align-items:center;

}

.partner-hub>div{

transition:.35s ease;

}

.partner-hub>div:hover{

transform:scale(1.03);

}

.partner-ecosystem svg{

overflow:visible;

}

@media (max-width:1024px){

.partner-ecosystem{

grid-template-columns:1fr;

gap:22px;

max-width:760px;

}

.partner-side{

gap:14px;

}

.partner-side>div{

padding:16px!important;

}

.partner-side>div>div:first-child{

width:54px!important;

height:54px!important;

font-size:24px!important;

}

.partner-side>div>div:last-child div:first-child{

font-size:17px!important;

}

.partner-side>div>div:last-child div:last-child{

font-size:13px!important;

line-height:1.55!important;

}

.partner-hub{

order:-1;

margin-bottom:6px;

}

.partner-hub>div{

width:220px!important;

height:220px!important;

padding:24px!important;

}

.partner-hub>div div:nth-child(2){

font-size:22px!important;

}

.partner-hub>div div:nth-child(3){

font-size:16px!important;

}

.partner-hub>div div:nth-child(4){

font-size:13px!important;

line-height:1.55!important;

}

}

@media (max-width:768px){

.partner-ecosystem{

grid-template-columns:1fr;

gap:16px;

margin-bottom:22px;

}

.partner-side{

gap:10px;

}

.partner-side>div{

padding:12px!important;

border-radius:16px!important;

}

.partner-side>div>div:first-child{

width:42px!important;

height:42px!important;

font-size:20px!important;

border-radius:12px!important;

}

.partner-side>div>div:last-child div:first-child{

font-size:15px!important;

margin-bottom:4px!important;

}

.partner-side>div>div:last-child div:last-child{

font-size:12px!important;

line-height:1.45!important;

}

.partner-hub{

margin:10px 0;

}

.partner-hub>div{

width:180px!important;

height:180px!important;

padding:18px!important;

}

.partner-hub>div div:nth-child(2){

font-size:18px!important;

}

.partner-hub>div div:nth-child(3){

font-size:13px!important;

}

.partner-hub>div div:nth-child(4){

font-size:11px!important;

line-height:1.4!important;

}
}

/* =========================================================
   PACKAGE 4
   PREMIUM POLISH
========================================================= */

/* ---------- Center Hub ---------- */

.partner-hub>div{

position:relative;

overflow:visible;

}

.partner-hub>div::before{

content:"";

position:absolute;

inset:-20px;

border-radius:50%;

border:1px dashed rgba(214,162,60,.22);

animation:hubRotate 28s linear infinite;

}

.partner-hub>div::after{

content:"";

position:absolute;

inset:-38px;

border-radius:50%;

border:1px dashed rgba(23,63,122,.08);

animation:hubRotateReverse 40s linear infinite;

}

@keyframes hubRotate{

from{

transform:rotate(0deg);

}

to{

transform:rotate(360deg);

}

}

@keyframes hubRotateReverse{

from{

transform:rotate(360deg);

}

to{

transform:rotate(0deg);

}

}

/* ---------- Floating ---------- */

.partner-side>div:nth-child(1){

animation:float1 5s ease-in-out infinite;

}

.partner-side>div:nth-child(2){

animation:float2 6s ease-in-out infinite;

}

.partner-side>div:nth-child(3){

animation:float3 7s ease-in-out infinite;

}

@keyframes float1{

0%,100%{

transform:translateY(0);

}

50%{

transform:translateY(-6px);

}

}

@keyframes float2{

0%,100%{

transform:translateY(0);

}

50%{

transform:translateY(6px);

}

}

@keyframes float3{

0%,100%{

transform:translateY(0);

}

50%{

transform:translateY(-4px);

}

}

/* ---------- Value Chips ---------- */

.partner-ecosystem + div{

max-width:980px;

margin-left:auto;

margin-right:auto;

}

/* ---------- Desktop ---------- */

@media(min-width:1200px){

.partner-ecosystem{

column-gap:46px;

}

.partner-side{

gap:22px;

}

.partner-side>div{

min-height:118px;

}

}

/* ---------- Tablet ---------- */

@media(max-width:1024px){

.partner-side>div{

min-height:92px;

}

.partner-hub>div::before,

.partner-hub>div::after{

display:none;

}

}

/* ---------- Mobile ---------- */

@media(max-width:768px){

.partner-side>div{

min-height:78px;

}

.partner-side>div:hover{

transform:none;

}

.partner-side>div{

animation:none;

}

.partner-hub{

margin-bottom:18px;

}

.partner-hub>div{

box-shadow:
0 14px 30px rgba(23,63,122,.10)!important;

}

.partner-hub>div::before,

.partner-hub>div::after{

display:none;

}

}

@media (max-width:1024px){

.partner-journey-track{

animation-duration:22s;

}

.partner-journey-track>div{

width:210px!important;

min-height:140px!important;

padding:14px!important;

}



}

@media (max-width:768px){

.partner-journey-track{

animation-duration:18s;

gap:12px;

}

.partner-journey-track>div{

width:145px!important;

min-height:100px!important;

padding:10px!important;

border-radius:14px!important;

}

.partner-journey-track>div div:first-child{

font-size:24px!important;

width:46px!important;

height:46px!important;

margin-bottom:10px!important;

}

.partner-journey-track>div div:nth-child(3){

font-size:15px!important;

margin-bottom:8px!important;

}

.partner-journey-track>div div:nth-child(4){

font-size:12px!important;

line-height:1.45!important;

}



}



`}</style>


<SectionTransition />

            </div>

        </SectionContainer>

    );

}
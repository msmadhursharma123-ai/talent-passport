import founderImage from "../../assets/founder.jpg";
import "../../styles/founder.css";

export default function FounderSection() {

return (

<section
    id="founder"
    className="founder-section"
>

<div className="founder-container">

<div className="founder-heading">

<div className="founder-tag">

A MESSAGE FROM OUR FOUNDER

</div>

<h2>

We're Not Building Another Education Platform.

</h2>

<h3>

We're Building The Identity Layer For Every Student.

</h3>

</div>

<div className="founder-intro">

<div className="founder-photo">

<img

src={founderImage}

alt="Founder"

/>

</div>

<div className="founder-name-block">

<h4>

Madhur Sharma

</h4>

<p>

Founder & Creator

</p>

<span>

Talent Passport

</span>

</div>

</div>

<div className="founder-message">

    <p>

Every day, teachers introduce new concepts, students develop questions, parents wonder whether their child has truly understood what was taught, and schools struggle to identify learning gaps before they become exam-time problems. These small moments shape a student's future, yet they often remain invisible until it's too late.








</p>

<p>

Talent Passport brings these moments together into one connected ecosystem. By capturing daily classroom progress, teacher feedback and student understanding, it gives parents complete visibility into the topics their child is learning, helps teachers identify and resolve doubts long before examinations, and enables schools to make data-driven academic decisions. Alongside this, competitions, portfolios, scholarships, workshops and career opportunities ensure that every meaningful experience contributes to a student's continuous growth journey.

</p>

<p>

Our goal is not simply to build another education platform.


We are building the operating system for student growth—one that helps schools teach better, students learn with confidence, teachers make informed decisions, parents stay meaningfully connected to their child's learning every day, and every learner build a verified identity that opens doors to future opportunities.



</p>

<p>

Because every student deserves more than good grades.

Parents gain visibility.

Teachers gain meaningful insights.

Schools understand holistic growth.

Partners discover talent.

Most importantly—

students finally receive recognition for everything they become,
not just what they score.

</p>

<div className="founder-quote">

“One Passport. One Identity. Endless Possibilities.”

</div>





</div>

</div>

</section>

);

}
import "../../styles/testimonials.css";

const testimonials = [

{
    quote:
        "Talent Passport finally gave our daughter one verified place where every competition, certificate and achievement lives together. It feels like her own digital growth journey.",
    name:"Priya Mehta",
    role:"Parent",
    city:"Indore",
    icon:"👩"
},

{
    quote:
        "I never knew communication and leadership could actually be measured. The feedback helped me improve beyond marks.",
    name:"Aarav Singh",
    role:"Student",
    city:"Delhi",
    icon:"🎓"
},

{
    quote:
        "Our school finally has one platform connecting students, teachers and parents together. Everything feels organised.",
    name:"Ritika Sharma",
    role:"Principal",
    city:"Jaipur",
    icon:"🏫"
},

{
    quote:
        "Instead of collecting certificates in cupboards, my son now has one lifelong verified portfolio he proudly shares.",
    name:"Rohan Kapoor",
    role:"Parent",
    city:"Bengaluru",
    icon:"👨"
},

{
    quote:
        "Every activity I participated in automatically became part of my Talent Passport. I finally feel recognised beyond academics.",
    name:"Ananya Verma",
    role:"Student",
    city:"Mumbai",
    icon:"🎯"
},

{
    quote:
        "The analytics gave us visibility into confidence, participation and communication—not just exam scores.",
    name:"Sneha Joshi",
    role:"Teacher",
    city:"Pune",
    icon:"👩‍🏫"
},

{
    quote:
        "Managing competitions, achievements and portfolios across hundreds of students became incredibly simple.",
    name:"Rahul Gupta",
    role:"School Admin",
    city:"Lucknow",
    icon:"💼"
},

{
    quote:
        "Talent Passport motivates students to participate because every effort gets recognised and preserved forever.",
    name:"Neha Verma",
    role:"Parent",
    city:"Indore",
    icon:"🌟"
},

{
    quote:
        "Instead of preparing only for exams, I now focus on projects, leadership and communication too.",
    name:"Kabir Jain",
    role:"Student",
    city:"Ahmedabad",
    icon:"🚀"
},

{
    quote:
        "Parents finally understand what their children are becoming—not just what percentage they scored.",
    name:"Sonal Kapoor",
    role:"Parent",
    city:"Chandigarh",
    icon:"❤️"
},

{
    quote:
        "As an educator this is the first platform that genuinely showcases student growth over time.",
    name:"Anjali Nair",
    role:"Teacher",
    city:"Kochi",
    icon:"📘"
},

{
    quote:
        "Scholarships, workshops and opportunities now come to students based on their verified journey.",
    name:"Vikram Rao",
    role:"Partner",
    city:"Hyderabad",
    icon:"🤝"
},

{
    quote:
        "This is what modern education should look like—a lifelong identity rather than disconnected report cards.",
    name:"Karan Malhotra",
    role:"Education Consultant",
    city:"Noida",
    icon:"💡"
}

];

/* Duplicate for infinite marquee */

const firstRow=[
    ...testimonials.slice(0,7),
    ...testimonials.slice(0,7)
];

const secondRow=[
    ...testimonials.slice(7),
    ...testimonials.slice(7)
];

export default function TestimonialsSection() {

    return (

        <section className="testimonials-section">

            <div className="testimonials-container">

                {/* ========================= */}
                {/* HEADER */}
                {/* ========================= */}

                <div className="section-header">

                    <div className="section-tag">

                        TRUSTED BY STUDENTS • PARENTS • SCHOOLS

                    </div>

                    <h2>

                        Real Stories.
                        <br />
                        Real Growth.

                    </h2>

                    <p>

                        Thousands of learning journeys.
                        One Talent Passport.

                    </p>

                </div>

                {/* ========================= */}
                {/* ROW 1 */}
                {/* ========================= */}

                <div className="testimonial-marquee">

                    <div className="testimonial-track">

                        {

                            firstRow.map(

                                (item,index)=>(

                                    <div

                                        key={index}

                                        className="testimonial-card"

                                    >

                                        <div className="testimonial-top">

                                            <div className="testimonial-avatar">

                                                {item.icon}

                                            </div>

                                            <div>

                                                <h4>

                                                    {item.name}

                                                </h4>

                                                <span>

                                                    {item.role}

                                                </span>

                                            </div>

                                            <div className="testimonial-city">

                                                {item.city}

                                            </div>

                                        </div>

                                        <div className="testimonial-stars">

                                            ★★★★★

                                        </div>

                                        <p>

                                            {item.quote}

                                        </p>

                                    </div>

                                )

                            )

                        }

                    </div>

                </div>

                {/* ========================= */}
                {/* ROW 2 */}
                {/* ========================= */}

                <div className="testimonial-marquee reverse">

                    <div className="testimonial-track">

                        {

                            secondRow.map(

                                (item,index)=>(

                                    <div

                                        key={index}

                                        className="testimonial-card"

                                    >

                                        <div className="testimonial-top">

                                            <div className="testimonial-avatar">

                                                {item.icon}

                                            </div>

                                            <div>

                                                <h4>

                                                    {item.name}

                                                </h4>

                                                <span>

                                                    {item.role}

                                                </span>

                                            </div>

                                            <div className="testimonial-city">

                                                {item.city}

                                            </div>

                                        </div>

                                        <div className="testimonial-stars">

                                            ★★★★★

                                        </div>

                                        <p>

                                            {item.quote}

                                        </p>

                                    </div>

                                )

                            )

                        }

                    </div>

                </div>

            </div>

        </section>

    );

}
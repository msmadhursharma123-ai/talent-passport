interface Props {

    activePage:string;

    onNavigate:

    (page:string)=>void;

}

export default function TeacherSidebar({

    activePage,

    onNavigate

}:Props){

const items = [

    {
        id: "home",
        label: "Home"
    },

    {
        id: "students",
        label: "Students"
    },

    {
        id: "class-health",
        label: "Class Health"
    },

    {
        id: "analytics",
        label: "Analytics"
    },

    {
        id: "profile",
        label: "Profile"
    }

];

    return(

        <div
            style={{

                width:260,

                background:"#143B73",

                color:"white",

                padding:24

            }}
        >

            {

               items.map(item => (

    <button

        key={item.id}

        onClick={() =>

            onNavigate(item.id)

        }

        style={{

            display: "block",

            width: "100%",

            marginBottom: 12,

            padding: 12,

            background:

                activePage === item.id

                    ? "#F4A623"

                    : "transparent",

            border: "none",

            color: "white",

            cursor: "pointer",

            borderRadius: 8,

            fontWeight: 600,

            fontSize: 16,

            textTransform: "capitalize"

        }}

    >

        {item.label}

    </button>

))

            }

        </div>

    );

}
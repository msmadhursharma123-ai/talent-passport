interface Props {

    onLogout: () => void;

}

export default function TeacherHeader({

    onLogout

}: Props) {

    return (

        <div
            style={{

                height:72,

                background:"white",

                borderBottom:"1px solid #ECECEC",

                display:"flex",

                alignItems:"center",

                justifyContent:"space-between",

                padding:"0 30px"

            }}
        >

            <h2>

                Teacher Portal

            </h2>

            <button

                onClick={onLogout}

                style={{

                    background:"#DC2626",

                    color:"white",

                    border:"none",

                    padding:"10px 20px",

                    borderRadius:8,

                    cursor:"pointer",

                    fontWeight:600

                }}

            >

                Logout

            </button>

        </div>

    );

}
import { useState } from "react";

import useTeacherManagementViewModel
from "../teacher/TeacherManagementViewModel";

export default function TeacherRegistry() {

const {

    schools,

    loading,

    addSchool,

    editSchool,

    removeSchool

}
=
useTeacherManagementViewModel();

    const [

        schoolName,

        setSchoolName

    ] = useState("");

    const [

        board,

        setBoard

    ] = useState("");

    const [

        city,

        setCity

    ] = useState("");

    const [studentProfileLimit, setStudentProfileLimit] = useState("");
    const [teacherProfileLimit, setTeacherProfileLimit] = useState("");
    const [schoolAdminProfileLimit, setSchoolAdminProfileLimit] = useState("");

const [

    editing,

    setEditing

] = useState(false);

const [

    editingSchoolUuid,

    setEditingSchoolUuid

] = useState("");

async function handleSave(){

    if(

        !schoolName ||

        !board ||

        !city ||
        studentProfileLimit === "" ||
        teacherProfileLimit === "" ||
        schoolAdminProfileLimit === ""

    ){

        alert(

            "Please fill all fields."

        );

        return;

    }

    let success=false;

    if(editing){

        success=

        await editSchool(

            editingSchoolUuid,

            schoolName,

            board,

            city,

            {
                studentProfileLimit: Number(studentProfileLimit),
                teacherProfileLimit: Number(teacherProfileLimit),
                schoolAdminProfileLimit: Number(schoolAdminProfileLimit)
            }

        );

    }

    else{

        success=

        await addSchool(

            schoolName,

            board,

            city,

            {
                studentProfileLimit: Number(studentProfileLimit),
                teacherProfileLimit: Number(teacherProfileLimit),
                schoolAdminProfileLimit: Number(schoolAdminProfileLimit)
            }

        );

    }

    if(!success){

        alert(

            "Unable to save."

        );

        return;

    }

    setSchoolName("");

    setBoard("");

    setCity("");
    setStudentProfileLimit("");
    setTeacherProfileLimit("");
    setSchoolAdminProfileLimit("");

    setEditing(false);

    setEditingSchoolUuid("");

}

    
    return (
   <div style={pageStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={titleStyle}>
            School Management & Profile Capacity
          </h1>

          <p style={subtitleStyle}>
           Manage school contracts, registration access and profile capacity for students, teachers and school administrators.
          </p>
        </div>
      </header>



<div
    style={{
        background:"white",
        borderRadius:16,
        padding:24,
        boxShadow:"0 2px 10px rgba(0,0,0,.06)",
        marginBottom:30
    }}
>

                <h3>

    {

        editing

        ?

        "Edit School"

        :

        "Add School"

    }

</h3>

            <label style={fieldLabelStyle}>School Name</label>
            <input

                placeholder="Enter School Name"

                value={schoolName}

                onChange={(e)=>

                    setSchoolName(

                        e.target.value

                    )

                }

                style={{

                    width:"100%",

                    padding:12,

                    marginBottom:12

                }}

            />

            <label style={fieldLabelStyle}>Education Board</label>
            <input

                placeholder="Enter Board (CBSE / ICSE)"

                value={board}

                onChange={(e)=>

                    setBoard(

                        e.target.value

                    )

                }

                style={{

                    width:"100%",

                    padding:12,

                    marginBottom:12

                }}

            />

            <label style={fieldLabelStyle}>School City</label>
            <input

                placeholder="Enter City"

                value={city}

                onChange={(e)=>

                    setCity(

                        e.target.value

                    )

                }

                style={{

                    width:"100%",

                    padding:12,

                    marginBottom:20

                }}

            />

            <div style={{
                display:"grid",
                gridTemplateColumns:"repeat(3, minmax(0, 1fr))",
                gap:12,
                marginBottom:20
            }}>
                <div>
                <label style={fieldLabelStyle}>Student Profile Limit</label>
                <div style={fieldHelpStyle}>Maximum student profiles allowed under this school contract.</div>
                <input
                    type="number"
                    min={0}
                    step={1}
                    placeholder="Maximum Students"
                    value={studentProfileLimit}
                    onChange={(e)=>setStudentProfileLimit(e.target.value)}
                    style={{width:"100%",padding:12,boxSizing:"border-box"}}
                />
                </div>

                <div>
                <label style={fieldLabelStyle}>Teacher Profile Limit</label>
                <div style={fieldHelpStyle}>Maximum teacher profiles allowed under this school contract.</div>
                <input
                    type="number"
                    min={0}
                    step={1}
                    placeholder="Maximum Teachers"
                    value={teacherProfileLimit}
                    onChange={(e)=>setTeacherProfileLimit(e.target.value)}
                    style={{width:"100%",padding:12,boxSizing:"border-box"}}
                />
                </div>

                <div>
                <label style={fieldLabelStyle}>School Admin Profile Limit</label>
                <div style={fieldHelpStyle}>Maximum school administrator profiles allowed.</div>
                <input
                    type="number"
                    min={0}
                    step={1}
                    placeholder="Maximum School Admins"
                    value={schoolAdminProfileLimit}
                    onChange={(e)=>setSchoolAdminProfileLimit(e.target.value)}
                    style={{width:"100%",padding:12,boxSizing:"border-box"}}
                />
                </div>
            </div>

            <button

                onClick={handleSave}

               style={{
    padding:"14px 28px",
    background:"#143B73",
    color:"white",
    border:"none",
    borderRadius:10,
    cursor:"pointer",
    fontWeight:600
}}

            >

                {

editing

?

"Update School"

:

"Add School"

}

            </button>
</div>
          <div
    style={{
        height:24
    }}
/>
<div
    style={{
        display:"flex",
        gap:20,
        marginBottom:24
    }}
>

<div style={cardStyle}>

    <h4>Total Schools</h4>

    <h2>{schools.length}</h2>

</div>

<div style={cardStyle}>

    <h4>

        Active Schools

    </h4>

    <h2>

        {

            schools.filter(

                s => s.isActive

            ).length

        }

    </h2>

</div>

<div style={cardStyle}>

    <h4>Inactive</h4>

    <h2>

        {
            schools.filter(
                s=>!s.isActive
            ).length
        }

    </h2>

</div>

</div>

            <h3>

                Schools

            </h3>

            {

                loading

                &&

                <p>

                    Loading...

                </p>

            }

<div
    style={{
        background:"white",
        borderRadius:16,
        padding:20,
        boxShadow:"0 2px 10px rgba(0,0,0,.06)"
    }}
>

            <table

                width="100%"

                cellPadding={12}

            >

                <thead>

                    <tr>

                        <th align="left">

                            School

                        </th>

                        <th align="left">

                            Board

                        </th>

                        <th align="left">

                            City

                        </th>

                        <th align="left">Student Profiles<br/><small>Used / Limit</small></th>
                        <th align="left">Teacher Profiles<br/><small>Used / Limit</small></th>
                        <th align="left">School Admin Profiles<br/><small>Used / Limit</small></th>

                        <th align="left">

                            Status

                        </th>

                        <th/>

                    </tr>

                </thead>

                <tbody>

                    {

                        schools.map(

                            school=>(

                                <tr

                                    key={

                                        school.schoolUuid

                                    }

                                >

                                    <td>

                                        {

                                            school.schoolName

                                        }

                                    </td>

                                    <td>

                                        {

                                            school.board

                                        }

                                    </td>

                                    <td>

                                        {

                                            school.city

                                        }

                                    </td>

                                    <td>
                                        {school.studentProfilesUsed} / {school.studentProfileLimit}
                                    </td>

                                    <td>
                                        {school.teacherProfilesUsed} / {school.teacherProfileLimit}
                                    </td>

                                    <td>
                                        {school.schoolAdminProfilesUsed} / {school.schoolAdminProfileLimit}
                                    </td>

                                    <td>

                                        {

                                            school.isActive

                                            ?

                                            "ACTIVE"

                                            :

                                            "INACTIVE"

                                        }

                                    </td>

                                 <td>

    <button

        style={{

            padding:"6px 12px",

            border:"none",

            borderRadius:8,

            background:"#143B73",

            color:"white",

            cursor:"pointer"

        }}

        onClick={()=>{

            setEditing(true);

            setEditingSchoolUuid(

                school.schoolUuid

            );

            setSchoolName(

                school.schoolName

            );

            setBoard(

                school.board

            );

            setCity(

                school.city

            );

            setStudentProfileLimit(String(school.studentProfileLimit));
            setTeacherProfileLimit(String(school.teacherProfileLimit));
            setSchoolAdminProfileLimit(String(school.schoolAdminProfileLimit));

        }}

    >

        Edit

    </button>

    {

        school.isActive &&

        <button

            style={{

                marginLeft:10,

                padding:"6px 12px",

                borderRadius:8,

                border:"1px solid #DC2626",

                color:"#DC2626",

                background:"white",

                cursor:"pointer"

            }}

            onClick={()=>

                removeSchool(

                    school.schoolUuid

                )

            }

        >

            Deactivate

        </button>

    }

</td>

                                </tr>

                            )

                        )

                    }

                </tbody>

            </table>
</div>
        </div>

    );

}

const cardStyle={

    background:"white",

    padding:20,

    borderRadius:12,

    minWidth:180,

    boxShadow:"0 2px 8px rgba(0,0,0,.05)"

};

const pageStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "28px",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "32px",
  fontWeight: 800,
  color: "#143B73",
};

const subtitleStyle: React.CSSProperties = {
  marginTop: "8px",
  color: "#64748B",
  fontSize: "15px",
};

const fieldLabelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 6,
  color: "#334155",
  fontSize: 12,
  fontWeight: 800,
};

const fieldHelpStyle: React.CSSProperties = {
  minHeight: 30,
  marginBottom: 7,
  color: "#64748B",
  fontSize: 10,
  lineHeight: 1.4,
};

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

        !city

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

            city

        );

    }

    else{

        success=

        await addSchool(

            schoolName,

            board,

            city

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

    setEditing(false);

    setEditingSchoolUuid("");

}

    
    return (
   <div style={pageStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={titleStyle}>
            Teacher Management
          </h1>

          <p style={subtitleStyle}>
           Manage schools available during Teacher Registration.
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

            <input

                placeholder="School Name"

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

            <input

                placeholder="Board"

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

            <input

                placeholder="City"

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
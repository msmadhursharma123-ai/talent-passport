import React,
{
    useState
}
from "react";

import TeacherHeader
from "./TeacherHeader";

import TeacherSidebar
from "./TeacherSidebar";

import TeacherHome
from "./TeacherHome";

interface Props {

    onLogout: () => void;

}

export default function TeacherLayout({

    onLogout

}: Props) {

    const [

        activePage,

        setActivePage

    ] = useState(
        "home"
    );

    return (

        <div
            style={{

                display:"flex",

                height:"100vh",

                background:"#F8F7F4"

            }}
        >

            <TeacherSidebar

                activePage={
                    activePage
                }

                onNavigate={
                    setActivePage
                }

            />

            <div
                style={{

                    flex:1,

                    display:"flex",

                    flexDirection:"column"

                }}
            >

                <TeacherHeader
    onLogout={onLogout}
/>

                <TeacherHome />

            </div>

        </div>

    );

}
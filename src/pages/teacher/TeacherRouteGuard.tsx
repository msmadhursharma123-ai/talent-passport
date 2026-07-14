import {

    requireTeacherIdentity

}

from "../../services/authenticationService";

interface Props{

    children:

    React.ReactNode;

}

export default function TeacherRouteGuard({

    children

}:Props){

    requireTeacherIdentity();

    return <>{children}</>;

}
import TeacherLayout
from "./TeacherLayout";

interface Props {

    onLogout: () => void;

}

export default function TeacherPortal({

    onLogout

}: Props) {

    return (

        <TeacherLayout
            onLogout={onLogout}
        />

    );

}
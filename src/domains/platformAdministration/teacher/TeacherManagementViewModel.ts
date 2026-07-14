import { useEffect, useState } from "react";

import {

    SchoolRecord,

    getSchools,

    createSchool,

    updateSchool,

    deactivateSchool

} from "./TeacherManagementRepository";

export default function useTeacherManagementViewModel() {

    const [schools, setSchools] =

        useState<SchoolRecord[]>([]);

    const [loading, setLoading] =

        useState(false);

    async function loadSchools() {

        setLoading(true);

        const data = await getSchools();

        setSchools(data);

        setLoading(false);

    }

    async function addSchool(

        schoolName: string,

        board: string,

        city: string

    )
    
    
    
    {

        const success = await createSchool(

            schoolName,

            board,

            city

        );

        if (success) {

            await loadSchools();

        }

        return success;

    }

    async function editSchool(

        schoolUuid: string,

        schoolName: string,

        board: string,

        city: string

    ) {

        const success = await updateSchool(

            schoolUuid,

            schoolName,

            board,

            city

        );

        if (success) {

            await loadSchools();

        }

        return success;

    }

    async function removeSchool(

        schoolUuid: string

    ) {

        const success = await deactivateSchool(

            schoolUuid

        );

        if (success) {

            await loadSchools();

        }

        return success;

    }

    useEffect(() => {

        loadSchools();

    }, []);

    return {

        schools,

        loading,

        loadSchools,

        addSchool,

        editSchool,

        removeSchool

    };

}
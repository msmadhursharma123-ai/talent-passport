import { useEffect, useState } from "react";

import {
  SchoolRecord,
  SchoolProfileLimits,
  SchoolSubscriptionDetails,
  getSchools,
  createSchool,
  updateSchool,
  deactivateSchool
} from "./TeacherManagementRepository";

import {
  saveSchoolFeatures
} from "../../../data/schoolFeatureAccessRepository";

export default function useTeacherManagementViewModel() {

  const [schools, setSchools] =
    useState<SchoolRecord[]>([]);

  const [loading, setLoading] =
    useState(false);

  async function loadSchools() {

    setLoading(true);

    try {

      setSchools(
        await getSchools()
      );

    }

    finally {

      setLoading(false);

    }

  }

  async function addSchool(

    name: string,

    board: string,

    city: string,

    limits: SchoolProfileLimits,

    subscription: SchoolSubscriptionDetails,

    studentFeatures: string[],

    teacherFeatures: string[]

  ) {

    const uuid = await createSchool(

      name,

      board,

      city,

      limits,

      subscription

    );

    if (!uuid) {

      return false;

    }

    const ok = await saveSchoolFeatures(

      uuid,

      studentFeatures,

      teacherFeatures

    );

    if (ok) {

      await loadSchools();

    }

    return ok;

  }

 async function editSchool(

    uuid: string,

    name: string,

    board: string,

    city: string,

    limits: SchoolProfileLimits,

    subscription: SchoolSubscriptionDetails,

    studentFeatures: string[],

    teacherFeatures: string[]

) {

    const ok =

        await updateSchool(

            uuid,

            name,

            board,

            city,

            limits,

            subscription

        );

    if (!ok) {

        return false;

    }

    const featuresOk =

        await saveSchoolFeatures(

            uuid,

            studentFeatures,

            teacherFeatures

        );

    if (featuresOk) {

        await loadSchools();

    }

    return featuresOk;

}

  async function removeSchool(
    uuid: string
  ) {

    const ok =
      await deactivateSchool(
        uuid
      );

    if (ok) {

      await loadSchools();

    }

    return ok;

  }

  useEffect(() => {

    void loadSchools();

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
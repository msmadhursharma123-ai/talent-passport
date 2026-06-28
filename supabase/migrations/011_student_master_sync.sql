BEGIN;

INSERT INTO students_master (
    student_uuid,
    student_id,
    student_name,
    student_email,
    school_name,
    class_name,
    created_at,
    phone,
    favourite_activity,
    student_age,
    residence_city,
    residence_area,
    gender
)
SELECT
    COALESCE(
        s.student_uuid,
        gen_random_uuid()
    ) AS student_uuid,

    s.student_id,
    s.student_name,
    s.student_email,
    s.school_name,
    s.class_name,
    s.created_at,
    s.parent_mobile,
    s.favourite_activity,
    s.student_age,
    s.residence_city,
    s.residence_area,
    s.gender

FROM students s

LEFT JOIN students_master sm
       ON sm.student_id = s.student_id

WHERE sm.student_id IS NULL;

COMMIT;
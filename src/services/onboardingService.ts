import { getSupabaseClient } from "../supabaseClient";
import { getTableIdentity } from "./identityService";

export type StudentOnboardingStage =
    | "PROFILE_PENDING"
    | "DNA_PENDING"
    | "COMPLETE";

export async function getStudentOnboardingStage(): Promise<StudentOnboardingStage> {

    const supabase = getSupabaseClient();

    if (!supabase) {
        throw new Error("Supabase not configured.");
    }

    /**
     * Identity Kernel
     * ----------------------------------
     * Never hardcode identity fields.
     * Always resolve through the kernel.
     */

    const masterStudentId =
        getTableIdentity("students_master");

    const studentUuid =
        getTableIdentity("student_dna_profiles");

    /**
     * ==========================================
     * STEP 1
     * Student Profile Completed?
     * ==========================================
     */

    const {
        data: profile,
        error: profileError
    } = await supabase
        .from("students_master")
        .select("id")
        .eq("id", masterStudentId)
        .maybeSingle();

    if (profileError) {
        throw profileError;
    }

    if (!profile) {
        return "PROFILE_PENDING";
    }

    /**
     * ==========================================
     * STEP 2
     * DNA Completed?
     * ==========================================
     */

    const {
        data: dna,
        error: dnaError
    } = await supabase
        .from("student_dna_profiles")
        .select("id")
        .eq("student_id", studentUuid)
        .maybeSingle();

    if (dnaError) {
        throw dnaError;
    }

    if (!dna) {
        return "DNA_PENDING";
    }

    /**
     * ==========================================
     * STEP 3
     * Everything Complete
     * ==========================================
     */

    return "COMPLETE";
}
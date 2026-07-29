import {
    buildPersonalGrowthActionPlan,
    type PersonalGrowthActionInput,
    type PersonalGrowthActionPlan,
} from "../engines/personalGrowthActionEngine";

/* ============================================================
   PERSONAL GROWTH ACTION SERVICE

   Thin orchestration boundary for the Passport action layer.

   - No Supabase writes
   - No Talent DNA scoring changes
   - No random recommendations
   - Uses the already assembled authenticated Passport signals
============================================================ */

export function getPersonalGrowthActionPlan(
    input: PersonalGrowthActionInput
): PersonalGrowthActionPlan {
    return buildPersonalGrowthActionPlan(input);
}

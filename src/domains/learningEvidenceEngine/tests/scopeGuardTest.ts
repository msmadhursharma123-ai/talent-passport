import { assertSchoolScope } from "../repository/ScopeGuard";

const assert = (condition: unknown, message: string) => { if (!condition) throw new Error(message); };
assertSchoolScope([{ school_uuid: "school-a" }, { school_uuid: "school-a" }], "school-a", "test rows");
let rejected = false;
try { assertSchoolScope([{ school_uuid: "school-a" }, { school_uuid: "school-b" }], "school-a", "test rows"); }
catch (error) { rejected = String(error).includes("outside the authenticated school scope"); }
assert(rejected, "must fail closed if any row belongs to another school");
rejected = false;
try { assertSchoolScope([{ school_uuid: null }], "school-a", "test rows"); }
catch { rejected = true; }
assert(rejected, "must fail closed if school scope is missing");
console.log("PASS: school-scope defense-in-depth guard tests.");

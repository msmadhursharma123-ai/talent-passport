/**
 * Bounded combinatorial audit of resolution predicates and aggregation contracts.
 * This complements fixed vectors; it is not a substitute for consumer parity tests.
 */
import {
  isDoubtResolved,
  classifyDoubtResolution,
  calculateDoubtClosureRate,
  calculatePooledPercentage,
  calculateUnweightedAveragePercentage,
} from "./LearningAnalyticsCanonicalService";

export function runLearningAnalyticsCombinatorialAudit(): string[] {
  const failures: string[] = [];
  const bools = [false, true];
  const statuses = [undefined, null, '', 'RESOLVED', ' resolved ', 'NOT DISCUSSED', 'OTHER'];
  const responses = [undefined, null, '', 'DISCUSSED', ' discussed ', 'NOT DISCUSSED', 'OTHER'];
  let combinations = 0;
  for (const doubt_resolved of [...bools, undefined, null]) {
    for (const status of statuses) {
      for (const student_response of responses) {
        combinations++;
        const row = { doubt_resolved, status, student_response };
        const expected = doubt_resolved === true || String(status ?? '').trim().toUpperCase() === 'RESOLVED' || String(student_response ?? '').trim().toUpperCase() === 'DISCUSSED';
        if (isDoubtResolved(row) !== expected) failures.push(`resolution:combination:${String(doubt_resolved)}:${String(status)}:${String(student_response)}`);
        const source = classifyDoubtResolution(row);
        if ((source === 'UNRESOLVED') === expected) failures.push(`resolution:classification-consistency:${String(doubt_resolved)}:${String(status)}:${String(student_response)}`);
      }
    }
  }
  // All ordered 3-row sets from a compact state domain; verify count/rate stay coherent.
  const rows = [
    {},
    { doubt_resolved: true },
    { status: 'RESOLVED' },
    { status: 'NOT DISCUSSED' },
    { student_response: 'DISCUSSED' },
    { student_response: 'NOT DISCUSSED' },
  ];
  let triples = 0;
  for (const a of rows) for (const b of rows) for (const c of rows) {
    triples++;
    const batch = [a, b, c];
    const count = batch.filter(isDoubtResolved).length;
    const expectedRate = Math.round((count / batch.length) * 100);
    if (calculateDoubtClosureRate(batch) !== expectedRate) failures.push(`closure:triple:${triples}`);
  }
  // Check aggregation semantics over all pairs of rates in {0, 25, 50, 75, 100}.
  const rates = [0, 25, 50, 75, 100];
  let pairs = 0;
  for (const left of rates) for (const right of rates) {
    pairs++;
    if (calculateUnweightedAveragePercentage([left, right]) !== Math.round((left + right) / 2)) failures.push(`aggregate:unweighted:${left}:${right}`);
    // Pooled rate is deliberately not inferred from the mean of two percentages.
    const pooled = calculatePooledPercentage(left + right, 2);
    if (!Number.isFinite(pooled)) failures.push(`aggregate:pooled-finite:${left}:${right}`);
  }
  // Also exercise empty/invalid numeric inputs and guarantee finite bounded output.
  for (const n of [-2, -1, 0, 1, 2, 10, Number.NaN, Number.POSITIVE_INFINITY]) {
    for (const d of [-1, 0, 1, 2, 10, Number.NaN, Number.POSITIVE_INFINITY]) {
      const result = calculatePooledPercentage(n, d);
      if (!Number.isFinite(result)) failures.push(`percentage:nonfinite:${String(n)}:${String(d)}`);
    }
  }
  if (combinations !== 196) failures.push(`audit:expected-196-combinations-got-${combinations}`);
  if (triples !== 216) failures.push(`audit:expected-216-triples-got-${triples}`);
  if (pairs !== 25) failures.push(`audit:expected-25-rate-pairs-got-${pairs}`);
  return failures;
}

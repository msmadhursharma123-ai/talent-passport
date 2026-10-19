/** Shared row budget for one report run. A report must fail closed rather than
 * silently return a partial result when a configured safety limit is reached.
 */
export interface ReadBudget { totalRows: number; }

export const PAGE_SIZE = 500;
export const MAX_ROWS_PER_QUERY = 10_000;
export const MAX_TOTAL_ROWS_PER_REPORT = 25_000;

export async function readPaged<T>(
  buildQuery: () => any,
  sourceLabel: string,
  budget: ReadBudget,
): Promise<T[]> {
  const all: T[] = [];
  let queryRows = 0;

  while (queryRows < MAX_ROWS_PER_QUERY) {
    const queryRemaining = MAX_ROWS_PER_QUERY - queryRows;
    const reportRemaining = MAX_TOTAL_ROWS_PER_REPORT - budget.totalRows;
    if (reportRemaining <= 0) {
      throw new Error(`Learning Evidence Engine: report exceeded the ${MAX_TOTAL_ROWS_PER_REPORT.toLocaleString()}-row total safety cap. Narrow the date window or review workload before retrying.`);
    }

    // Never request more rows than either remaining budget allows. If a query
    // fills the final permitted page, fail closed because more rows may exist.
    const requested = Math.min(PAGE_SIZE, queryRemaining, reportRemaining);
    const { data, error } = await buildQuery().range(queryRows, queryRows + requested - 1);
    if (error) throw new Error(`Learning Evidence Engine: failed to read ${sourceLabel}: ${error.message ?? String(error)}`);
    const rows = (data ?? []) as T[];
    all.push(...rows);
    queryRows += rows.length;
    budget.totalRows += rows.length;

    if (rows.length < requested) return all;
    if (queryRows >= MAX_ROWS_PER_QUERY) {
      throw new Error(`Learning Evidence Engine: ${sourceLabel} reached the ${MAX_ROWS_PER_QUERY.toLocaleString()}-row per-query safety cap. Narrow the date window or review workload before retrying.`);
    }
    if (budget.totalRows >= MAX_TOTAL_ROWS_PER_REPORT) {
      throw new Error(`Learning Evidence Engine: report reached the ${MAX_TOTAL_ROWS_PER_REPORT.toLocaleString()}-row total safety cap. Narrow the date window or review workload before retrying.`);
    }
  }
  throw new Error(`Learning Evidence Engine: ${sourceLabel} reached its per-query safety cap.`);
}

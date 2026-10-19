import { readPaged, type ReadBudget, MAX_TOTAL_ROWS_PER_REPORT } from "../repository/BoundedRead";

const assert = (condition: unknown, message: string) => { if (!condition) throw new Error(message); };

function fakeQuery(rows: number[]) {
  return () => ({ range: async (from: number, to: number) => ({ data: rows.slice(from, to + 1), error: null }) });
}

async function run() {
  const budget: ReadBudget = { totalRows: 0 };
  const first = await readPaged<number>(fakeQuery(Array.from({ length: 700 }, (_, i) => i)), "first test source", budget);
  assert(first.length === 700, "pagination must return all rows below caps");
  assert(budget.totalRows === 700, "budget must count rows from the first query");

  // Many small batches share one report budget; reaching it must fail closed.
  const batchBudget: ReadBudget = { totalRows: MAX_TOTAL_ROWS_PER_REPORT - 1 };
  let rejected = false;
  try {
    await readPaged<number>(fakeQuery([1, 2, 3]), "last test batch", batchBudget);
  } catch (error) {
    rejected = String(error).includes("total safety cap");
  }
  assert(rejected, "shared report budget must reject a batch that fills the remaining cap");
  assert(batchBudget.totalRows === MAX_TOTAL_ROWS_PER_REPORT, "must not fetch/count beyond the global row budget");
  console.log("PASS: pagination, shared cumulative budget, and fail-closed cap checks.");
}

void run();

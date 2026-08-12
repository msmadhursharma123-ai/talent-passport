import * as XLSX from "xlsx";

export type AccessImportKind = "email" | "roll";

function normalizeValue(value: unknown): string {
  return String(value ?? "").trim();
}

function parseCsvFirstColumn(text: string): string[] {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (quoted && next === '"') {
        current += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") i += 1;
      values.push(current.trim());
      current = "";
      continue;
    }

    if (!quoted && char === ",") {
      values.push(current.trim());
      while (i + 1 < text.length && text[i + 1] !== "\n" && text[i + 1] !== "\r") {
        i += 1;
      }
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) values.push(current.trim());
  return values.filter(Boolean);
}

function removeHeader(values: string[], kind: AccessImportKind): string[] {
  if (!values.length) return values;
  const first = values[0].trim().toLowerCase();
  const headers =
    kind === "email"
      ? ["email", "email id", "email_id", "teacher email", "teacher_email"]
      : ["roll", "roll no", "roll number", "roll_number", "roll no.", "student roll number"];

  return headers.includes(first) ? values.slice(1) : values;
}

export async function parseAccessFile(
  file: File,
  kind: AccessImportKind
): Promise<string[]> {
  const extension = file.name.toLowerCase().split(".").pop() ?? "";
  let values: string[];

  if (extension === "csv" || file.type.includes("csv")) {
    values = parseCsvFirstColumn(await file.text());
  } else if (["xlsx", "xls"].includes(extension)) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(firstSheet, {
      header: 1,
      raw: false,
      defval: "",
    }) as unknown[][];

    values = rows
      .map(row => normalizeValue(row[0]))
      .filter(Boolean);
  } else {
    throw new Error("Please select a CSV, XLS, or XLSX file.");
  }

  const cleaned = removeHeader(values, kind)
    .map(normalizeValue)
    .filter(Boolean);

  return Array.from(new Set(cleaned));
}

export function downloadAccessTemplate(kind: AccessImportKind): void {
  const header = kind === "email" ? "email" : "roll_number";
  const example = kind === "email" ? "teacher@example.com" : "STU-001";
  const blob = new Blob([`${header}\n${example}\n`], {
    type: "text/csv;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = kind === "email" ? "teacher_email_template.csv" : "student_roll_number_template.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

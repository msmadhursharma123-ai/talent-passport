import * as XLSX from "xlsx";
import { downloadOrShareBlob } from "./platform/nativeDocumentService";

export const ASSIGN_STUDENT_ACCOUNT_HEADERS = [
  "roll_number",
  "email",
  "password",
  "confirm_password",
  "student_name",
  "student_mobile",
  "parent_mobile",
  "class",
  "section",
  "age",
  "gender",
  "favourite_activity",
  "residence_city",
  "area",
] as const;

export interface AssignStudentAccountRow {
  rollNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  studentName: string;
  studentMobile: string;
  parentMobile: string;
  className: string;
  section: string;
  age: string;
  gender: string;
  favouriteActivity: string;
  residenceCity: string;
  area: string;
}

const WIDTH = ASSIGN_STUDENT_ACCOUNT_HEADERS.length;

function value(value: unknown): string {
  return String(value ?? "").replace(/^\uFEFF/, "").trim();
}

function isHeaderRow(row: string[]): boolean {
  return (
    value(row[0]).toLowerCase() === "roll_number" &&
    value(row[1]).toLowerCase() === "email" &&
    value(row[2]).toLowerCase() === "password" &&
    value(row[3]).toLowerCase() === "confirm_password"
  );
}

function mapRow(row: string[], rowNumber: number): AssignStudentAccountRow {
  if (row.length > WIDTH && row.slice(WIDTH).some(item => value(item))) {
    throw new Error(
      `Row ${rowNumber} contains data after the required 14 columns. Please use the exact column sequence.`
    );
  }

  const cells = Array.from({ length: WIDTH }, (_, index) => value(row[index]));

  return {
    rollNumber: cells[0],
    email: cells[1],
    password: cells[2],
    confirmPassword: cells[3],
    studentName: cells[4],
    studentMobile: cells[5],
    parentMobile: cells[6],
    className: cells[7],
    section: cells[8].toUpperCase(),
    age: cells[9],
    gender: cells[10],
    favouriteActivity: cells[11],
    residenceCity: cells[12],
    area: cells[13],
  };
}

export async function parseStudentAccountAssignmentFile(
  file: File,
): Promise<AssignStudentAccountRow[]> {
  const extension = file.name.toLowerCase().split(".").pop() ?? "";
  if (!["csv", "xls", "xlsx"].includes(extension)) {
    throw new Error("Please select a CSV, XLS, or XLSX file.");
  }

  let rows: unknown[][];
  if (extension === "csv") {
    const workbook = XLSX.read(await file.arrayBuffer(), {
      type: "array",
      raw: false,
    });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
      defval: "",
      blankrows: false,
    }) as unknown[][];
  } else {
    const workbook = XLSX.read(await file.arrayBuffer(), {
      type: "array",
      raw: false,
    });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
      defval: "",
      blankrows: false,
    }) as unknown[][];
  }

  const normalized = rows
    .map(row => row.map(value))
    .filter(row => row.some(Boolean));

  if (!normalized.length) {
    throw new Error("The selected file does not contain any student rows.");
  }

  const dataRows = isHeaderRow(normalized[0])
    ? normalized.slice(1)
    : normalized;

  if (!dataRows.length) {
    throw new Error("The selected file contains a header but no student rows.");
  }

  return dataRows.map((row, index) => mapRow(row, index + (isHeaderRow(normalized[0]) ? 2 : 1)));
}

export async function downloadStudentAccountAssignmentTemplate(): Promise<void> {
  const header = ASSIGN_STUDENT_ACCOUNT_HEADERS.join(",");
  const example = [
    "STU-001",
    "Student@example.com",
    "Password123",
    "Password123",
    "Student Name",
    "9876543210",
    "9123456780",
    "10",
    "A",
    "15",
    "Female",
    "Debate",
    "Gurugram",
    "Sector 1",
  ].join(",");

  const blob = new Blob([`${header}\n${example}\n`], {
    type: "text/csv;charset=utf-8",
  });

  await downloadOrShareBlob(
    blob,
    "student_account_assignment_template.csv",
    "Talent Passport — Student Account Assignment Template",
  );
}

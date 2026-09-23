import Papa from "papaparse";
import * as XLSX from "xlsx";

import type { Player } from "./types";

export interface ImportResult {
  success: boolean;
  players?: Player[];
  error?: string;
}

type Row = Record<string, unknown>;

const NAME_COLUMNS = ["name", "names", "participant", "participants"];
const EMAIL_COLUMNS = ["email", "emails", "e-mail", "e-mail address"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

// Normalize column names for flexible matching
function normalizeColumnName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replaceAll(/[_\s]+/gu, "");
}

// Find column key by normalized name
function findColumn(headers: string[], targetNames: string[]): string | null {
  const normalizedHeaders = headers.map(normalizeColumnName);
  for (const target of targetNames) {
    const index = normalizedHeaders.indexOf(normalizeColumnName(target));
    if (index !== -1) {
      return headers[index];
    }
  }
  return null;
}

// Turn parsed spreadsheet rows into players, skipping incomplete or invalid rows
function rowsToPlayers(rows: Row[], fileLabel: string): ImportResult {
  if (rows.length === 0) {
    return {
      error: `${fileLabel} is empty or contains no valid rows`,
      success: false,
    };
  }

  const headers = Object.keys(rows[0]);
  const nameKey = findColumn(headers, NAME_COLUMNS);
  const emailKey = findColumn(headers, EMAIL_COLUMNS);

  if (!nameKey || !emailKey) {
    return {
      error: `${fileLabel} must contain "name" and "email" columns`,
      success: false,
    };
  }

  const players: Player[] = [];

  for (const row of rows) {
    const name = String(row[nameKey] ?? "").trim();
    const email = String(row[emailKey] ?? "").trim();

    if (!name || !email || !EMAIL_PATTERN.test(email)) {
      continue;
    }

    players.push({
      email,
      id: crypto.randomUUID(),
      // First valid participant is admin
      isAdmin: players.length === 0,
      name,
    });
  }

  if (players.length === 0) {
    return {
      error: `No valid participants found in ${fileLabel}`,
      success: false,
    };
  }

  return { players, success: true };
}

async function parseCSV(file: File): Promise<ImportResult> {
  const results = Papa.parse<Row>(await file.text(), {
    header: true,
    skipEmptyLines: true,
  });

  if (results.data.length === 0 && results.errors.length > 0) {
    return {
      error: `Failed to parse CSV: ${results.errors[0].message}`,
      success: false,
    };
  }

  return rowsToPlayers(results.data, "CSV file");
}

async function parseExcel(file: File): Promise<ImportResult> {
  try {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const [firstSheetName] = workbook.SheetNames;
    const worksheet = workbook.Sheets[firstSheetName];

    if (!worksheet) {
      return { error: "Excel file contains no sheets", success: false };
    }

    return rowsToPlayers(
      XLSX.utils.sheet_to_json<Row>(worksheet),
      "Excel file"
    );
  } catch (error) {
    return {
      error: `Failed to parse Excel file: ${error instanceof Error ? error.message : "Unknown error"}`,
      success: false,
    };
  }
}

export function importParticipants(file: File): Promise<ImportResult> {
  const extension = file.name.toLowerCase().split(".").pop();

  if (extension === "csv") {
    return parseCSV(file);
  }
  if (extension === "xlsx" || extension === "xls") {
    return parseExcel(file);
  }
  return Promise.resolve({
    error:
      "Unsupported file type. Please upload a CSV or Excel (.xlsx, .xls) file.",
    success: false,
  });
}

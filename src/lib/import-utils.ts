import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import type { Player } from './types'

export interface ImportResult {
  success: boolean
  players?: Player[]
  error?: string
}

// Normalize column names for flexible matching
function normalizeColumnName(name: string): string {
  return name.trim().toLowerCase().replace(/[_\s]+/g, '')
}

// Find column index by normalized name
function findColumnIndex(headers: string[], targetNames: string[]): number {
  const normalizedHeaders = headers.map(normalizeColumnName)
  for (const target of targetNames) {
    const normalizedTarget = normalizeColumnName(target)
    const index = normalizedHeaders.indexOf(normalizedTarget)
    if (index !== -1) return index
  }
  return -1
}

// Parse CSV file
async function parseCSV(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as Record<string, string>[]
        if (data.length === 0) {
          resolve({
            success: false,
            error: 'CSV file is empty or contains no valid rows',
          })
          return
        }

        const headers = Object.keys(data[0])
        const nameIndex = findColumnIndex(headers, ['name', 'names', 'participant', 'participants'])
        const emailIndex = findColumnIndex(headers, ['email', 'emails', 'e-mail', 'e-mail address'])

        if (nameIndex === -1 || emailIndex === -1) {
          resolve({
            success: false,
            error: 'CSV must contain "name" and "email" columns',
          })
          return
        }

        const nameKey = headers[nameIndex]
        const emailKey = headers[emailIndex]

        const players: Player[] = []

        for (let i = 0; i < data.length; i++) {
          const row = data[i]
          const name = row[nameKey]?.trim()
          const email = row[emailKey]?.trim()

          if (!name || !email) {
            continue // Skip rows with missing data
          }

          // Basic email validation
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            continue // Skip invalid emails
          }

          players.push({
            id: crypto.randomUUID(),
            name: name,
            email: email,
            isAdmin: i === 0, // First player is admin
          })
        }

        if (players.length === 0) {
          resolve({
            success: false,
            error: 'No valid participants found in CSV file',
          })
          return
        }

        resolve({
          success: true,
          players,
        })
      },
      error: (error) => {
        resolve({
          success: false,
          error: `Failed to parse CSV: ${error.message}`,
        })
      },
    })
  })
}

// Parse Excel file
async function parseExcel(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        if (!data) {
          resolve({
            success: false,
            error: 'Failed to read Excel file',
          })
          return
        }

        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        if (!worksheet) {
          resolve({
            success: false,
            error: 'Excel file contains no sheets',
          })
          return
        }

        const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet)

        if (jsonData.length === 0) {
          resolve({
            success: false,
            error: 'Excel file is empty or contains no valid rows',
          })
          return
        }

        const headers = Object.keys(jsonData[0])
        const nameIndex = findColumnIndex(headers, ['name', 'names', 'participant', 'participants'])
        const emailIndex = findColumnIndex(headers, ['email', 'emails', 'e-mail', 'e-mail address'])

        if (nameIndex === -1 || emailIndex === -1) {
          resolve({
            success: false,
            error: 'Excel file must contain "name" and "email" columns',
          })
          return
        }

        const nameKey = headers[nameIndex]
        const emailKey = headers[emailIndex]

        const players: Player[] = []

        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i]
          const name = row[nameKey]?.toString().trim()
          const email = row[emailKey]?.toString().trim()

          if (!name || !email) {
            continue // Skip rows with missing data
          }

          // Basic email validation
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            continue // Skip invalid emails
          }

          players.push({
            id: crypto.randomUUID(),
            name: name,
            email: email,
            isAdmin: i === 0, // First player is admin
          })
        }

        if (players.length === 0) {
          resolve({
            success: false,
            error: 'No valid participants found in Excel file',
          })
          return
        }

        resolve({
          success: true,
          players,
        })
      } catch (error) {
        resolve({
          success: false,
          error: `Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        })
      }
    }

    reader.onerror = () => {
      resolve({
        success: false,
        error: 'Failed to read Excel file',
      })
    }

    reader.readAsArrayBuffer(file)
  })
}

// Main import function
export async function importParticipants(file: File): Promise<ImportResult> {
  const fileName = file.name.toLowerCase()
  const extension = fileName.split('.').pop()

  if (extension === 'csv') {
    return parseCSV(file)
  } else if (extension === 'xlsx' || extension === 'xls') {
    return parseExcel(file)
  } else {
    return {
      success: false,
      error: 'Unsupported file type. Please upload a CSV or Excel (.xlsx, .xls) file.',
    }
  }
}


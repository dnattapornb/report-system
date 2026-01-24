// Define all available report types as a constant
export const REPORT_TYPES = ['revenue', 'hotels'] as const;

// Automatically derive Type from REPORT_TYPES values
export type ReportType = (typeof REPORT_TYPES)[number];

// Structure: { [type]: { [year]: { [month]: value } } }
export type MonthlyReport = Record<string, number>;
export type YearlyReport = Record<string, MonthlyReport>;
export type AllReportData = Record<string, YearlyReport>;

export class ReportDomain {
  // Transform raw data from Google Sheets with explicit year and month
  static transformRawToReports(rows: any[][]) {
    if (!rows || rows.length < 2) return [];
    const [, ...data] = rows;

    return data
      .map((row, index) => {
        // Check if date exists
        if (!row[0]) return null;

        const dateStr = String(row[0]);
        const date = new Date(dateStr);

        // Validate if Date is valid
        if (isNaN(date.getTime())) {
          console.warn(`[Row ${index + 2}] Invalid Date format: ${dateStr}`);
          return null;
        }

        return {
          year: date.getFullYear().toString(),
          month: (date.getMonth() + 1).toString().padStart(2, '0'),
          revenue: parseFloat(String(row[1]).replace(/,/g, '')) || 0, // Handle commas
          hotels: parseInt(String(row[2])) || 0,
        };
      })
      .filter((item) => item !== null);
  }
}

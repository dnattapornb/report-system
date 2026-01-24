export type ReportType = 'revenue' | 'hotels';

export interface MonthlyData {
  month: string;
  value: number;
}

export interface GlobalReportResponse {
  type: ReportType;
  years: {
    [year: string]: { [month: string]: number };
  };
}

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

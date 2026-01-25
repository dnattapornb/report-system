export type MonthlyReport = Record<string, number>;
export type YearlyReport = Record<string, MonthlyReport>;

export interface AllReportData {
  years: string[];
  categories: string[];
  types: Record<string, string[]>;
  displayNames: Record<string, string>;
  data: Record<string, Record<string, YearlyReport>>;
}

export interface StatsItem {
  year: string;
  month: string;
  hotelTotal: number;
  hotelNew: number;
  hotelCanceled: number;
  revenue: number;
  otas: Record<string, number>;
}

export class ReportDomain {
  static transformRawToStats(rows: any[][]): StatsItem[] {
    if (!rows || rows.length < 2) return [];

    const headers = rows[0].map((h) => String(h).trim());
    const dataRows = rows.slice(1);

    return dataRows
      .map((row) => {
        if (!row[0]) return null;
        const date = new Date(row[0]);

        const item: StatsItem = {
          year: date.getFullYear().toString(),
          month: (date.getMonth() + 1).toString().padStart(2, '0'),
          hotelTotal: parseInt(row[1]) || 0,
          hotelNew: parseInt(row[2]) || 0,
          hotelCanceled: parseInt(row[3]) || 0,
          revenue: parseFloat(String(row[4]).replace(/,/g, '')) || 0,
          otas: {},
        };

        // Extract OTA name from Header as Key, Index start at row 5
        for (let i = 5; i < headers.length; i++) {
          const otaName = headers[i];
          item.otas[otaName] =
            parseFloat(String(row[i]).replace(/,/g, '')) || 0;
        }

        return item;
      })
      .filter(Boolean) as StatsItem[];
  }

  static sanitizeKey(rawName: string): string {
    return rawName
      .toLowerCase()
      .trim()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_+|_+$/g, '');
  }
}

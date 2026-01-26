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

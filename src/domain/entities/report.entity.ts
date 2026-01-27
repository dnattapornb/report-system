export type MonthlyReport = Record<string, number>;

export interface StatsItem {
  year: string;
  month: string;
  hotelTotal: number;
  hotelNew: number;
  hotelCanceled: number;
  revenue: number;
  otas: Record<string, number>;
}

export interface SaaSMetricItem {
  year: string;
  month: string;
  mrr: number;
  expansion: number;
  churnAmount: number;
  contraction: number;
  nrrPercent: number;
  grrPercent: number;
  churnRatePercent: number;
  actualProfit: number;
  targetProfit: number;
  newClientsOrganic: number;
  newClientsBusinessPartner: number;
  totalRevenue: number;
}

export type SaaSMetricsData = Record<string, Record<string, SaaSMetricItem>>;

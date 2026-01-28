export type MonthlyReport = Record<string, number>;

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
  totalRevenue: number;
  newClientsOrganic: number;
  newClientsBusinessPartner: number;
  clientsDropOut: number;
  clientsFreeTrial: number;
  clientsPendingSetup: number;
  actualHotels: number;
  targetHotels: number;
  totalSalesRep: number;
}

export type SaaSMetricsData = Record<string, Record<string, SaaSMetricItem>>;

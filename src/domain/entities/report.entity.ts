export type MonthlyReport = Record<string, number>;

export interface SaaSMetricItem {
  year: string;
  month: string;
  mrr: number;
  expansionAmount: number;
  churnAmount: number;
  contractionAmount: number;
  nrrPercent: number;
  grrPercent: number;
  churnRatePercent: number;
  clientNewOrganicCount: number;
  clientNewPartnerCount: number;
  clientChurnCount: number;
  clientFreeTrialCount: number;
  clientPendingSetupCount: number;
  hotelTarget: number;
  hotelActual: number;
  salesRepCount: number;
  revenueTarget: number;
  revenueActual: number;
  cmpayChargeTarget: number;
  cmpayChargeActual: number;
  cmpayProfitTarget: number;
  cmpayProfitActual: number;
  cmpayActiveUserCount: number;
}

export type SaaSMetricsData = Record<string, Record<string, SaaSMetricItem>>;

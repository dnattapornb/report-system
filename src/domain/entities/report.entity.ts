export interface ReportMetricItem {
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
  hotelgruCommissionTarget: number;
  hotelgruCommissionActual: number;
  hotelgruHotelCount: number;
}

/**
 * @example
 * {
 *   "2024": {
 *     "01": { mrr: 1000, nrrPercent: 105, ... },
 *     "02": { mrr: 1200, nrrPercent: 106, ... }
 *   }
 * }
 */
export type ReportMetricsData = Record<string, Record<string, ReportMetricItem>>;

export type DistributionItem = Record<string, number>;

export interface ReportBreakdownData {
  thailandProvinceDistribution: DistributionItem;
  internationalCountryDistribution: DistributionItem;
  packageDistribution: DistributionItem;
  paymentConditionDistribution: DistributionItem;
  revenueModelDistribution: DistributionItem;
  salesChannelDistribution: DistributionItem;
  closedDealDistribution: DistributionItem;
}

export interface DashboardData {
  metrics?: ReportMetricsData;
  breakdown?: ReportBreakdownData;
}

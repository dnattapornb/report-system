import {
  ReportBreakdownData,
  ReportMetricItem,
} from './entities/report.entity';

export class ReportDomain {
  static transformRawToSaaSMetrics(
    rows: any[][],
    cutoffDate: string | null,
  ): ReportMetricItem[] {
    if (!rows || rows.length < 2) return [];

    const headers = rows[0].map((h) => String(h).trim());
    const dataRows = rows.slice(2);

    const columnIndexMap = {
      month: headers.indexOf('Month'),
      mrr: headers.indexOf('mrr'),
      expansionAmount: headers.indexOf('expansionAmount'),
      churnAmount: headers.indexOf('churnAmount'),
      contractionAmount: headers.indexOf('contractionAmount'),
      nrrPercent: headers.indexOf('nrrPercent'),
      grrPercent: headers.indexOf('grrPercent'),
      churnRatePercent: headers.indexOf('churnRatePercent'),
      clientNewOrganicCount: headers.indexOf('clientNewOrganicCount'),
      clientNewPartnerCount: headers.indexOf('clientNewPartnerCount'),
      clientChurnCount: headers.indexOf('clientChurnCount'),
      clientFreeTrialCount: headers.indexOf('clientFreeTrialCount'),
      clientPendingSetupCount: headers.indexOf('clientPendingSetupCount'),
      hotelTarget: headers.indexOf('hotelTarget'),
      hotelActual: headers.indexOf('hotelActual'),
      salesRepCount: headers.indexOf('salesRepCount'),
      revenueTarget: headers.indexOf('revenueTarget'),
      revenueActual: headers.indexOf('revenueActual'),
      cmpayChargeTarget: headers.indexOf('cmpayChargeTarget'),
      cmpayChargeActual: headers.indexOf('cmpayChargeActual'),
      cmpayProfitTarget: headers.indexOf('cmpayProfitTarget'),
      cmpayProfitActual: headers.indexOf('cmpayProfitActual'),
      cmpayActiveUserCount: headers.indexOf('cmpayActiveUsers'),
      hotelgruCommissionTarget: headers.indexOf('hotelgruCommissionTarget'),
      hotelgruCommissionActual: headers.indexOf('hotelgruCommissionActual'),
      hotelgruHotelTarget: headers.indexOf('hotelgruHotelTarget'),
      hotelgruHotelActual: headers.indexOf('hotelgruHotelActual'),
      hotelgruHotelChurnCount: headers.indexOf('hotelgruHotelChurnCount'),
      partnerHotelTarget: headers.indexOf('partnerHotelTarget'),
      partnerHotelActual: headers.indexOf('partnerHotelActual'),
      partnerRevenueTarget: headers.indexOf('partnerRevenueTarget'),
      partnerRevenueActual: headers.indexOf('partnerRevenueActual'),
    };

    const parseFloatOrZero = (val: any) =>
      parseFloat(String(val).replace(/,/g, '')) || 0;
    const parseIntOrZero = (val: any) =>
      parseInt(String(val).replace(/,/g, ''), 10) || 0;

    return dataRows
      .map((row) => {
        const monthStr = row[columnIndexMap.month];
        if (!monthStr) return null;

        const [monthName, yearStr] = monthStr.split('-');
        const dateNameStr = Date.parse(monthName + ' 1, 2012');
        const monthNum = new Date(dateNameStr).getMonth() + 1;
        const monthPadded = monthNum.toString().padStart(2, '0');

        const itemDateStr = `${yearStr}-${monthPadded}`;
        if (cutoffDate && itemDateStr >= cutoffDate) {
          return null;
        }

        return {
          year: yearStr,
          month: monthNum.toString().padStart(2, '0'),
          mrr: parseFloatOrZero(row[columnIndexMap.mrr]),
          expansionAmount: parseFloatOrZero(
            row[columnIndexMap.expansionAmount],
          ),
          churnAmount: parseFloatOrZero(row[columnIndexMap.churnAmount]),
          contractionAmount: parseFloatOrZero(
            row[columnIndexMap.contractionAmount],
          ),
          nrrPercent: parseFloatOrZero(row[columnIndexMap.nrrPercent]),
          grrPercent: parseFloatOrZero(row[columnIndexMap.grrPercent]),
          churnRatePercent: parseFloatOrZero(
            row[columnIndexMap.churnRatePercent],
          ),
          clientNewOrganicCount: parseIntOrZero(
            row[columnIndexMap.clientNewOrganicCount],
          ),
          clientNewPartnerCount: parseIntOrZero(
            row[columnIndexMap.clientNewPartnerCount],
          ),
          clientChurnCount: parseIntOrZero(
            row[columnIndexMap.clientChurnCount],
          ),
          clientFreeTrialCount: parseIntOrZero(
            row[columnIndexMap.clientFreeTrialCount],
          ),
          clientPendingSetupCount: parseIntOrZero(
            row[columnIndexMap.clientPendingSetupCount],
          ),
          hotelTarget: parseIntOrZero(row[columnIndexMap.hotelTarget]),
          hotelActual: parseIntOrZero(row[columnIndexMap.hotelActual]),
          salesRepCount: parseIntOrZero(row[columnIndexMap.salesRepCount]),
          revenueTarget: parseFloatOrZero(row[columnIndexMap.revenueTarget]),
          revenueActual: parseFloatOrZero(row[columnIndexMap.revenueActual]),
          cmpayChargeTarget: parseFloatOrZero(
            row[columnIndexMap.cmpayChargeTarget],
          ),
          cmpayChargeActual: parseFloatOrZero(
            row[columnIndexMap.cmpayChargeActual],
          ),
          cmpayProfitTarget: parseFloatOrZero(
            row[columnIndexMap.cmpayProfitTarget],
          ),
          cmpayProfitActual: parseFloatOrZero(
            row[columnIndexMap.cmpayProfitActual],
          ),
          cmpayActiveUserCount: parseFloatOrZero(
            row[columnIndexMap.cmpayActiveUserCount],
          ),
          hotelgruCommissionTarget: parseFloatOrZero(
            row[columnIndexMap.hotelgruCommissionTarget],
          ),
          hotelgruCommissionActual: parseFloatOrZero(
            row[columnIndexMap.hotelgruCommissionActual],
          ),
          hotelgruHotelTarget: parseFloatOrZero(
            row[columnIndexMap.hotelgruHotelTarget],
          ),
          hotelgruHotelActual: parseFloatOrZero(
            row[columnIndexMap.hotelgruHotelActual],
          ),
          hotelgruHotelChurnCount: parseIntOrZero(
            row[columnIndexMap.hotelgruHotelChurnCount],
          ),
          partnerHotelTarget: parseIntOrZero(
            row[columnIndexMap.partnerHotelTarget],
          ),
          partnerHotelActual: parseIntOrZero(
            row[columnIndexMap.partnerHotelActual],
          ),
          partnerRevenueTarget: parseFloatOrZero(
            row[columnIndexMap.partnerRevenueTarget],
          ),
          partnerRevenueActual: parseFloatOrZero(
            row[columnIndexMap.partnerRevenueActual],
          ),
        };
      })
      .filter(Boolean) as ReportMetricItem[];
  }

  static transformRawToBreakdown(rows: any[][]): ReportBreakdownData {
    const processColumns = (nameCol: number, valueCol: number) => {
      const distribution: Record<string, number> = {};
      for (const row of rows) {
        const name = row[nameCol]?.trim();
        const value = row[valueCol];
        if (name && name.toLowerCase() !== 'total') {
          distribution[name] =
            parseInt(String(value).replace(/,/g, ''), 10) || 0;
        }
      }
      return distribution;
    };

    return {
      thailandProvinceDistribution: processColumns(0, 1), // A, B
      internationalCountryDistribution: processColumns(3, 4), // D, E
      packageDistribution: processColumns(6, 7), // G, H
      paymentConditionDistribution: processColumns(9, 10), // J, K
      revenueModelDistribution: processColumns(12, 13), // M, N
      salesChannelDistribution: processColumns(15, 16), // P, Q
      closedDealDistribution: processColumns(18, 19), // S, T
    };
  }
}

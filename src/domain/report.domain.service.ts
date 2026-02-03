import { SaaSMetricItem } from './entities/report.entity';

export class ReportDomain {
  static transformRawToSaaSMetrics(
    rows: any[][],
    cutoffDate: string | null,
  ): SaaSMetricItem[] {
    if (!rows || rows.length < 2) return [];

    const headers = rows[0].map((h) => String(h).trim());
    const dataRows = rows.slice(2);

    const columnIndexMap = {
      month: headers.indexOf('Month'),
      mrr: headers.indexOf('Monthly Recurring Revenue (MRR)'),
      expansionAmount: headers.indexOf('Expansion (Upgrade)'),
      churnAmount: headers.indexOf('Chrun Rate Amount'),
      contractionAmount: headers.indexOf('Contractions (Downgrade)'),
      nrrPercent: headers.indexOf('NRR%'),
      grrPercent: headers.indexOf('GRR %'),
      churnRatePercent: headers.indexOf('Churn rate %'),
      clientNewOrganicCount: headers.indexOf(
        'New Organic Sales Clients Acquired  / Month',
      ),
      clientNewPartnerCount: headers.indexOf(
        'New No. of Hotel by Business Partner Clients Acquired  / Month',
      ),
      clientChurnCount: headers.indexOf(
        'Total Hotel by Organic Sales and Business Partner Drop Out / Month',
      ),
      clientFreeTrialCount: headers.indexOf('Live Free trial'),
      clientPendingSetupCount: headers.indexOf(
        'Pending Setup (waiting for online)',
      ),
      hotelTarget: headers.indexOf('Set All Target'),
      hotelActual: headers.indexOf(
        'Total Hotel by Organic Sales and Business Partner',
      ),
      salesRepCount: headers.indexOf('No. of Sales Rep'),
      revenueTarget: headers.indexOf('Total Target Revenue'),
      revenueActual: headers.indexOf('Total Revenue'),
      cmpayChargeTarget: headers.indexOf('Forecast Target Total Charge'),
      cmpayChargeActual: headers.indexOf('Total Charge'),
      cmpayProfitTarget: headers.indexOf('Target Profit'),
      cmpayProfitActual: headers.indexOf('Profits'),
      cmpayActiveUserCount: headers.indexOf('CM Pay Active User'),
    };

    // Helper function for safe parsing
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
          expansionAmount: parseFloatOrZero(row[columnIndexMap.expansionAmount]),
          churnAmount: parseFloatOrZero(row[columnIndexMap.churnAmount]),
          contractionAmount: parseFloatOrZero(row[columnIndexMap.contractionAmount]),
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
          clientChurnCount: parseIntOrZero(row[columnIndexMap.clientChurnCount]),
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
        };
      })
      .filter(Boolean) as SaaSMetricItem[];
  }
}

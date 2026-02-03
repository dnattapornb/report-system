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
      expansion: headers.indexOf('Expansion (Upgrade)'),
      churnAmount: headers.indexOf('Chrun Rate Amount'),
      contraction: headers.indexOf('Contractions (Downgrade)'),
      nrrPercent: headers.indexOf('NRR%'),
      grrPercent: headers.indexOf('GRR %'),
      churnRatePercent: headers.indexOf('Churn rate %'),
      newClientsOrganic: headers.indexOf(
        'New Organic Sales Clients Acquired  / Month',
      ),
      newClientsBusinessPartner: headers.indexOf(
        'New No. of Hotel by Business Partner Clients Acquired  / Month',
      ),
      clientsDropOut: headers.indexOf(
        'Total Hotel by Organic Sales and Business Partner Drop Out / Month',
      ),
      clientsFreeTrial: headers.indexOf('Live Free trial'),
      clientsPendingSetup: headers.indexOf(
        'Pending Setup (waiting for online)',
      ),
      targetHotels: headers.indexOf('Set All Target'),
      actualHotels: headers.indexOf(
        'Total Hotel by Organic Sales and Business Partner',
      ),
      totalSalesRep: headers.indexOf('No. of Sales Rep'),
      totalTargetRevenue: headers.indexOf('Total Target Revenue'),
      totalActualRevenue: headers.indexOf('Total Revenue'),
      targetProfit: headers.indexOf('Target Profit'),
      actualProfit: headers.indexOf('Profits'),
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
          expansion: parseFloatOrZero(row[columnIndexMap.expansion]),
          churnAmount: parseFloatOrZero(row[columnIndexMap.churnAmount]),
          contraction: parseFloatOrZero(row[columnIndexMap.contraction]),
          nrrPercent: parseFloatOrZero(row[columnIndexMap.nrrPercent]),
          grrPercent: parseFloatOrZero(row[columnIndexMap.grrPercent]),
          churnRatePercent: parseFloatOrZero(
            row[columnIndexMap.churnRatePercent],
          ),
          newClientsOrganic: parseIntOrZero(
            row[columnIndexMap.newClientsOrganic],
          ),
          newClientsBusinessPartner: parseIntOrZero(
            row[columnIndexMap.newClientsBusinessPartner],
          ),
          clientsDropOut: parseIntOrZero(row[columnIndexMap.clientsDropOut]),
          clientsFreeTrial: parseIntOrZero(
            row[columnIndexMap.clientsFreeTrial],
          ),
          clientsPendingSetup: parseIntOrZero(
            row[columnIndexMap.clientsPendingSetup],
          ),
          targetHotels: parseIntOrZero(row[columnIndexMap.targetHotels]),
          actualHotels: parseIntOrZero(row[columnIndexMap.actualHotels]),
          targetProfit: parseFloatOrZero(row[columnIndexMap.targetProfit]),
          actualProfit: parseFloatOrZero(row[columnIndexMap.actualProfit]),
          totalTargetRevenue: parseFloatOrZero(
            row[columnIndexMap.totalTargetRevenue],
          ),
          totalActualRevenue: parseFloatOrZero(
            row[columnIndexMap.totalActualRevenue],
          ),
          totalSalesRep: parseIntOrZero(row[columnIndexMap.totalSalesRep]),
        };
      })
      .filter(Boolean) as SaaSMetricItem[];
  }
}

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
      actualProfit: headers.indexOf('Profits'),
      targetProfit: headers.indexOf('Target Profit'),
      newClientsOrganic: headers.indexOf(
        'New Organic Sales Clients Acquired  / Month',
      ),
      newClientsBusinessPartner: headers.indexOf(
        'New No. of Hotel by Business Partner Clients Acquired  / Month',
      ),
      totalRevenue: headers.indexOf('Total Revenue'),
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
        const monthNum = new Date(Date.parse(monthName + ' 1, 2012')).getMonth() + 1;
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
          actualProfit: parseFloatOrZero(row[columnIndexMap.actualProfit]),
          targetProfit: parseFloatOrZero(row[columnIndexMap.targetProfit]),
          newClientsOrganic: parseIntOrZero(
            row[columnIndexMap.newClientsOrganic],
          ),
          newClientsBusinessPartner: parseIntOrZero(
            row[columnIndexMap.newClientsBusinessPartner],
          ),
          totalRevenue: parseFloatOrZero(row[columnIndexMap.totalRevenue]),
        };
      })
      .filter(Boolean) as SaaSMetricItem[];
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

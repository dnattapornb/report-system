import { Injectable, Logger } from '@nestjs/common';
import { GoogleSheetsService } from '../../infrastructure/google/google-sheets.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { ReportGateway } from './report.gateway';
import {
  REPORT_TYPES,
  MonthlyReport,
  AllReportData,
  ReportType,
  ReportDomain,
} from '../../domain/entities/report.entity';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);
  private readonly spreadsheetId =
    '1dm58io1Hk0iRKu7rTcYimmQ5LZHZJF5YulN0lQ1jlcY';
  private readonly range = 'REPORT!A:D';

  constructor(
    private readonly googleSheets: GoogleSheetsService,
    private readonly redis: RedisService,
    private readonly gateway: ReportGateway,
  ) {}

  /**
   * Get all data in the system (Types -> Years -> Months)
   */
  async getAllReportData(): Promise<AllReportData> {
    await this.checkAndSyncData();

    const types = await this.redis.smembers('report:types');
    const result: AllReportData = {};

    for (const type of types) {
      result[type] = {};

      const years = await this.redis.smembers(`report:${type}:years`);

      for (const year of years.sort()) {
        const monthlyData = await this.redis.hgetall(`report:${type}:${year}`);
        result[type][year] = this.formatFullYear(monthlyData);
      }
    }

    return result;
  }

  /**
   * Fetch all available years for a specific type
   */
  async getAllYearsReport(type: ReportType) {
    await this.checkAndSyncData();

    const yearsKey = `report:${type}:years`;
    // Get year list from Set
    const availableYears = await this.redis.smembers(yearsKey);

    const globalData = {};
    for (const year of availableYears.sort()) {
      const yearKey = `report:${type}:${year}`;
      const monthlyData = await this.redis.hgetall(yearKey);
      globalData[year] = this.formatFullYear(monthlyData);
    }

    return { type, years: globalData };
  }

  /**
   * Fetch data for a specific year (12 months)
   */
  async getAnnualReport(type: ReportType, year: string) {
    await this.checkAndSyncData();

    const key = `report:${type}:${year}`;
    const data = await this.redis.hgetall(key);
    return this.formatFullYear(data);
  }

  /**
   * Fetch data by month period
   */
  async getPeriodReport(
    type: ReportType,
    year: string,
    start: number,
    end: number,
  ) {
    await this.checkAndSyncData();

    const key = `report:${type}:${year}`;
    const fields = Array.from({ length: end - start + 1 }, (_, i) =>
      (start + i).toString().padStart(2, '0'),
    );
    const values = await this.redis.hmget(key, fields);

    return fields.reduce((acc, month, index) => {
      acc[month] = parseFloat(values[index] || '0');
      return acc;
    }, {});
  }

  /**
   * Sync data and update the Index Set
   */
  async syncFromSheets() {
    this.logger.log('Starting data sync from Google Sheets...');

    const rawRows = await this.googleSheets.getSheetValues(
      this.spreadsheetId,
      this.range,
    );

    const reports = ReportDomain.transformRawToReports(rawRows);

    // Inspect reports before Redis sync
    // View first 20 rows in table
    console.log('--- Debug reports ---');
    console.table(reports.slice(0, 20));

    for (const type of REPORT_TYPES) {
      // Store Master Index for types
      await this.redis.sadd('report:types', type);
    }

    for (const item of reports) {
      // "2024", "2025", ...
      const yearStr = item.year;
      // "01", "02", ...
      const monthStr = item.month;

      const revenueKey = `report:revenue:${yearStr}`;
      const hotelsKey = `report:hotels:${yearStr}`;

      // Store monthly data
      await this.redis.hset(revenueKey, monthStr, item.revenue.toString());
      await this.redis.hset(hotelsKey, monthStr, item.hotels.toString());

      // Store Year Index
      await this.redis.sadd(`report:revenue:years`, yearStr);
      await this.redis.sadd(`report:hotels:years`, yearStr);

      this.gateway.broadcastReportUpdate(await this.getAllReportData());
    }
  }

  private async checkAndSyncData(): Promise<void> {
    const types = await this.redis.smembers('report:types');
    if (types.length === 0) {
      this.logger.log(
        'Cache is empty. Triggering data sync from Google Sheets...',
      );
      await this.syncFromSheets();
    }
  }

  private formatFullYear(data: Record<string, string>): MonthlyReport {
    const result: Record<string, number> = {};
    for (let i = 1; i <= 12; i++) {
      const m = i.toString().padStart(2, '0');
      result[m] = parseFloat(data[m] || '0');
    }
    return result;
  }
}

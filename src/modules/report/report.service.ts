import { Injectable, Logger } from '@nestjs/common';
import { GoogleSheetsService } from '../../infrastructure/google/google-sheets.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { ReportGateway } from './report.gateway';
import { ReportDomain, ReportType } from '../../domain/entities/report.entity';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);
  private readonly cacheKey = 'REPORT_PRIMARY_DATA';
  private readonly spreadsheetId =
    '1dm58io1Hk0iRKu7rTcYimmQ5LZHZJF5YulN0lQ1jlcY';
  private readonly range = 'REPORT!A:D';

  constructor(
    private readonly googleSheets: GoogleSheetsService,
    private readonly redis: RedisService,
    private readonly gateway: ReportGateway,
  ) {}

  /**
   * Fetch all available years for a specific type
   */
  async getAllYearsReport(type: ReportType) {
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
    const raw = await this.googleSheets.getSheetValues(
      this.spreadsheetId,
      this.range,
    );

    const reports = ReportDomain.transformRawToReports(raw);

    // Inspect reports before Redis sync
    // View first 15 rows in table
    console.log('--- Debug reports ---');
    console.table(reports.slice(0, 15));

    for (const item of reports) {
      const revKey = `report:revenue:${item.year}`;
      const hotelKey = `report:hotels:${item.year}`;

      // Store monthly data
      await this.redis.hset(revKey, item.month, item.revenue.toString());
      await this.redis.hset(hotelKey, item.month, item.hotels.toString());

      // Update Index Set (Stores which years have data)
      await this.redis.sadd(`report:revenue:years`, item.year);
      await this.redis.sadd(`report:hotels:years`, item.year);
    }
  }

  private formatFullYear(data: Record<string, string>) {
    const result = {};
    for (let i = 1; i <= 12; i++) {
      const m = i.toString().padStart(2, '0');
      result[m] = parseFloat(data[m] || '0');
    }
    return result;
  }
}

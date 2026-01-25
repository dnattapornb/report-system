import { Injectable, Logger } from '@nestjs/common';
import { GoogleSheetsService } from '../../infrastructure/google/google-sheets.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { ReportGateway } from './report.gateway';
import {
  MonthlyReport,
  AllReportData,
  ReportDomain,
} from '../../domain/entities/report.entity';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    private readonly googleSheets: GoogleSheetsService,
    private readonly redis: RedisService,
    private readonly gateway: ReportGateway,
  ) {}

  async getAllReportData(
    spreadsheetId: string,
    range: string,
  ): Promise<AllReportData> {
    const years = (await this.redis.smembers('report:years')).sort();
    const categories = await this.redis.smembers('report:categories');
    const displayNames = await this.redis.hgetall('report:ota_display_names');

    const result: AllReportData = {
      years,
      categories,
      types: {},
      displayNames,
      data: {},
    };

    for (const category of categories) {
      result.data[category] = {};

      const types = await this.redis.smembers(`report:types:${category}`);
      result.types[category] = types;

      for (const type of types) {
        result.data[category][type] = {};

        for (const year of years) {
          const key = `report:data:${category}:${type}:${year}`;
          const rawMonthly = await this.redis.hgetall(key);

          result.data[category][type][year] = this.formatFullYear(rawMonthly);
        }
      }
    }

    return result;
  }

  async syncFromSheets(spreadsheetId: string, range: string) {
    this.logger.log('Starting data sync from Google Sheets...');

    const raw = await this.googleSheets.getSheetValues(spreadsheetId, range);

    const stats = ReportDomain.transformRawToStats(raw);

    // Inspect stats before Redis sync
    // View first 15 rows in table
    // console.log('--- Debug stats ---');
    // console.table(stats.slice(0, 15));

    for (const item of stats) {
      const { year, month } = item;

      await this.redis.sadd('report:years', year);
      await this.redis.sadd('report:categories', 'revenue', 'hotels', 'otas');
      await this.redis.sadd('report:types:revenue', 'total');
      await this.redis.sadd('report:types:hotels', 'total', 'new', 'canceled');

      await this.redis.hset(
        `report:data:revenue:total:${year}`,
        month,
        item.revenue.toString(),
      );

      await this.redis.hset(
        `report:data:hotels:total:${year}`,
        month,
        item.hotelTotal.toString(),
      );
      await this.redis.hset(
        `report:data:hotels:new:${year}`,
        month,
        item.hotelNew.toString(),
      );
      await this.redis.hset(
        `report:data:hotels:canceled:${year}`,
        month,
        item.hotelCanceled.toString(),
      );

      for (const [originalName, value] of Object.entries(item.otas)) {
        const sanitizedKey = ReportDomain.sanitizeKey(originalName);

        await this.redis.hset(
          'report:ota_display_names',
          sanitizedKey,
          originalName,
        );

        await this.redis.sadd('report:types:otas', sanitizedKey);

        await this.redis.hset(
          `report:data:otas:${sanitizedKey}:${year}`,
          month,
          value.toString(),
        );
      }
    }

    // Broadcast Real-time signal with new Data to UI
    const allData = await this.getAllReportData(spreadsheetId, range);
    this.gateway.broadcastReportUpdate(allData);
    return allData;
  }

  private async checkAndSyncData(
    spreadsheetId: string,
    range: string,
  ): Promise<void> {
    const types = await this.redis.smembers('report:types');
    if (types.length === 0) {
      this.logger.log(
        'Cache is empty. Triggering data sync from Google Sheets...',
      );
      await this.syncFromSheets(spreadsheetId, range);
    }
  }

  private formatFullYear(data: Record<string, string>): MonthlyReport {
    const result: MonthlyReport = {};
    for (let i = 1; i <= 12; i++) {
      const m = i.toString().padStart(2, '0');
      result[m] = parseFloat(data[m] || '0');
    }
    return result;
  }
}

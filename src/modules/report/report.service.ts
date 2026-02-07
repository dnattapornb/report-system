import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleSheetsService } from '../../infrastructure/google/google-sheets.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import {
  DashboardData,
  ReportBreakdownData,
  ReportMetricItem,
  ReportMetricsData,
} from '../../domain/entities/report.entity';
import { ReportDomain } from '../../domain/report.domain.service';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    private readonly googleSheets: GoogleSheetsService,
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async getAllReport() {
    const result: DashboardData = {};
    result['metrics'] = await this.getMetrics();
    result['breakdown'] = await this.getBreakdown();

    return result;
  }

  async getMetrics() {
    const result: ReportMetricsData = {};
    const years = await this.redis.smembers('saas:metrics:years');

    years.sort();

    for (const year of years) {
      result[year] = {};
      const months = await this.redis.smembers(`saas:metrics:months:${year}`);

      months.sort();

      for (const month of months) {
        const redisKey = `saas:metrics:${year}:${month}`;
        const data = await this.redis.hgetall(redisKey);

        const formattedData: any = {};
        for (const key in data) {
          formattedData[key] = parseFloat(data[key]);
        }
        result[year][month] = formattedData as ReportMetricItem;
      }
    }

    return result;
  }

  async getBreakdown(): Promise<ReportBreakdownData & { lastUpdated: string }> {
    const result: any = {};
    const redisKey = 'saas:breakdown';
    const rawData = await this.redis.hgetall(redisKey);

    for (const key in rawData) {
      if (key === 'lastUpdated') {
        result[key] = rawData[key];
      } else {
        try {
          result[key] = JSON.parse(rawData[key]);
        } catch (e) {
          this.logger.error(`Failed to parse JSON for key ${key}`, e);
          result[key] = {};
        }
      }
    }

    return result;
  }

  async syncReportMetricsFromGoogleSheet(
    spreadsheetId: string,
    spreadsheetRange: string,
  ): Promise<ReportMetricItem[]> {
    this.logger.log(
      `Starting Report Metrics sync from Google Sheets [${spreadsheetRange}]...`,
    );

    const cutoffDate = this.configService.get<string>(
      'GOOGLE_SPREADSHEET_DATA_SYNC_CUTOFF_DATE',
    );

    if (cutoffDate) {
      this.logger.log(`Applying data cutoff date: ${cutoffDate}`);
    }

    const rawRows = await this.googleSheets.getSheetValues(
      spreadsheetId,
      spreadsheetRange,
    );

    const metrics = ReportDomain.transformRawToSaaSMetrics(
      rawRows,
      cutoffDate || null,
    );

    const pipeline = this.redis.pipeline();

    for (const item of metrics) {
      const { year, month, ...data } = item;
      const redisKey = `saas:metrics:${year}:${month}`;

      pipeline.sadd('saas:metrics:years', year);
      pipeline.sadd(`saas:metrics:months:${year}`, month);

      const hashData = Object.entries(data).flat().map(String);
      pipeline.hset(redisKey, ...hashData);
    }

    await pipeline.exec();
    this.logger.log(
      `Report Metrics sync completed. ${metrics.length} months processed.`,
    );

    return metrics;
  }

  async syncReportBreakdownFromGoogleSheet(
    spreadsheetId: string,
    spreadsheetRange: string,
  ): Promise<ReportBreakdownData> {
    this.logger.log(
      `Starting Breakdown data sync from Google Sheets [${spreadsheetRange}]...`,
    );

    const rawRows = await this.googleSheets.getSheetValues(
      spreadsheetId,
      spreadsheetRange,
    );

    const breakdownData = ReportDomain.transformRawToBreakdown(rawRows);

    const redisKey = 'saas:breakdown';
    const dataToStore: Record<string, string> = {};

    for (const key in breakdownData) {
      dataToStore[key] = JSON.stringify(breakdownData[key]);
    }

    await this.redis.hmset(redisKey, dataToStore);
    this.logger.log('Report Breakdown sync completed.');

    return breakdownData;
  }
}

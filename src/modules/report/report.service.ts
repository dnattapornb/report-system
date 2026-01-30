import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleSheetsService } from '../../infrastructure/google/google-sheets.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { ReportGateway } from './report.gateway';
import {
  MonthlyReport,
  SaaSMetricItem,
  SaaSMetricsData,
} from '../../domain/entities/report.entity';
import { ReportDomain } from '../../domain/report.domain.service';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    private readonly googleSheets: GoogleSheetsService,
    private readonly redis: RedisService,
    private readonly gateway: ReportGateway,
    private readonly configService: ConfigService,
  ) {}

  async getAllSaaSMetrics(
    spreadsheetId: string,
    range: string,
  ): Promise<SaaSMetricsData> {
    const result: SaaSMetricsData = {};
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
        result[year][month] = formattedData as SaaSMetricItem;
      }
    }

    return result;
  }

  async syncSaaSMetricsFromSheet(
    spreadsheetId: string,
    range: string,
  ): Promise<void> {
    this.logger.log('Starting SaaS Metrics sync from Google Sheets...');

    const cutoffDate = this.configService.get<string>(
      'GOOGLE_SPREADSHEET_DATA_SYNC_CUTOFF_DATE',
    );
    if (cutoffDate) {
      this.logger.log(`Applying data cutoff date: ${cutoffDate}`);
    }

    const rawRows = await this.googleSheets.getSheetValues(
      spreadsheetId,
      range,
    );

    const metrics = ReportDomain.transformRawToSaaSMetrics(
      rawRows,
      cutoffDate || null,
    );

    // Inspect metrics before Redis sync
    // View first 15 rows in table
    // console.log('--- Debug metrics ---');
    // console.table(metrics.slice(0, 15));

    const pipeline = this.redis.pipeline();

    for (const item of metrics) {
      const { year, month, ...data } = item;
      const redisKey = `saas:metrics:${year}:${month}`;

      pipeline.sadd('saas:metrics:years', year);
      pipeline.sadd(`saas:metrics:months:${year}`, month);

      // object to [key, value, key, value, ...] for pipeline(batch)
      const hashData = Object.entries(data).flat().map(String);
      pipeline.hset(redisKey, ...hashData);
    }

    await pipeline.exec();
    this.logger.log(
      `SaaS Metrics sync completed. ${metrics.length} months processed.`,
    );

    // Broadcast to clients that new SaaS data is available --> update:saas:metrics
    this.gateway.broadcastSaaSMetricsUpdate(
      await this.getAllSaaSMetrics(spreadsheetId, range),
    );
  }
}

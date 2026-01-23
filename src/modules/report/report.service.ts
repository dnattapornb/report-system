import { Injectable, Logger } from '@nestjs/common';
import { GoogleSheetsService } from '../../infrastructure/google/google-sheets.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { ReportGateway } from './report.gateway';
import { ReportDomain, ReportItem } from '../../domain/entities/report.entity';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);
  private readonly cacheKey = 'REPORT_PRIMARY_DATA';
  private readonly spreadsheetId =
    '1dm58io1Hk0iRKu7rTcYimmQ5LZHZJF5YulN0lQ1jlcY';
  private readonly range = 'CM-HOTEL!B:I';

  constructor(
    private readonly googleSheets: GoogleSheetsService,
    private readonly redis: RedisService,
    private readonly gateway: ReportGateway,
  ) {}

  /**
   * Get main report data (Using Redis as primary storage)
   */
  async getReportData(): Promise<ReportItem[]> {
    try {
      const cached = await this.redis.get(this.cacheKey);

      if (cached) {
        this.logger.log('Fetching from Redis');
        return JSON.parse(cached);
      }

      return await this.syncAndCacheData();
    } catch (error) {
      this.logger.error(`Can't fetch data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Force sync new data from Google Sheets (Internal Logic)
   */
  async syncAndCacheData(): Promise<ReportItem[]> {
    this.logger.log('Starting data sync from Google Sheets...');

    const rawRows = await this.googleSheets.getSheetValues(
      this.spreadsheetId,
      this.range,
    );

    const entities = ReportDomain.transformRawToEntity(rawRows);

    // (TTL 1 hour)
    await this.redis.set(this.cacheKey, JSON.stringify(entities), 3600);

    // UI WebSocket
    this.gateway.broadcastReportUpdate(entities);

    return entities;
  }
}

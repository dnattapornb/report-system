import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReportService } from './report.service';

@Controller('reports')
export class ReportController {
  private readonly spreadsheetId: string;
  private readonly range: string;

  constructor(private readonly reportService: ReportService) {
    const spreadsheetIdFromEnv = process.env.GOOGLE_SPREADSHEET_ID;
    const rangeFromEnv = process.env.GOOGLE_SPREADSHEET_RANGE;

    if (!spreadsheetIdFromEnv || !rangeFromEnv) {
      throw new Error(
        'Missing required environment variables: GOOGLE_SPREADSHEET_ID or GOOGLE_SPREADSHEET_RANGE',
      );
    }

    this.spreadsheetId = spreadsheetIdFromEnv;
    this.range = rangeFromEnv;
  }

  // GET /reports
  @Get()
  async getAll() {
    return await this.reportService.getAllSaaSMetrics(
      this.spreadsheetId,
      this.range,
    );
  }

  // Post /reports/sync
  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async sync() {
    return this.reportService.syncSaaSMetricsFromSheet(
      this.spreadsheetId,
      this.range,
    );
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() payload: any) {
    await this.reportService.syncSaaSMetricsFromSheet(
      this.spreadsheetId,
      this.range,
    );
    return {
      success: true,
      message: 'Data synced and UI notified',
    };
  }
}

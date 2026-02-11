import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportGateway } from './report.gateway';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@Controller('reports')
export class ReportController {
  private readonly logger = new Logger(ReportController.name);
  private readonly spreadsheetId: string;
  private readonly spreadsheetReportMetricsRange: string;
  private readonly spreadsheetReportBreakdownRange: string;

  constructor(
    private readonly reportService: ReportService,
    private readonly gateway: ReportGateway,
  ) {
    const spreadsheetIdFromEnv = process.env.GOOGLE_SPREADSHEET_ID;
    const spreadsheetReportMetricsRangeFromEnv =
      process.env.GOOGLE_SPREADSHEET_REPORT_METRICS_RANGE;
    const spreadsheetReportBreakdownRangeFromEnv =
      process.env.GOOGLE_SPREADSHEET_REPORT_BREAKDOWN_RANGE;

    if (
      !spreadsheetIdFromEnv ||
      !spreadsheetReportMetricsRangeFromEnv ||
      !spreadsheetReportBreakdownRangeFromEnv
    ) {
      throw new Error(
        'Missing required environment variables: GOOGLE_SPREADSHEET_ID ,GOOGLE_SPREADSHEET_REPORT_METRICS_RANGE, GOOGLE_SPREADSHEET_REPORT_BREAKDOWN_RANGE',
      );
    }

    this.spreadsheetId = spreadsheetIdFromEnv;
    this.spreadsheetReportMetricsRange = spreadsheetReportMetricsRangeFromEnv;
    this.spreadsheetReportBreakdownRange =
      spreadsheetReportBreakdownRangeFromEnv;
  }

  // GET /reports
  @Get()
  async getAllReport() {
    return await this.reportService.getAllReport();
  }

  // GET /reports/metrics
  @Get('metrics')
  async getMetrics() {
    return await this.reportService.getMetrics();
  }

  // GET /reports/breakdown
  @Get('breakdown')
  async getBreakdown() {
    return await this.reportService.getBreakdown();
  }

  // Post /reports/metrics/sync
  @Post('metrics/sync')
  @HttpCode(HttpStatus.OK)
  async syncMetrics() {
    const result = await this.reportService.syncReportMetricsFromGoogleSheet(
      this.spreadsheetId,
      this.spreadsheetReportMetricsRange,
    );

    return {
      success: true,
      message: 'Report Metrics Sync started',
      result: result,
    };
  }

  // Post /reports/breakdown/sync
  @Post('breakdown/sync')
  @HttpCode(HttpStatus.OK)
  async syncBreakdown() {
    const result = await this.reportService.syncReportBreakdownFromGoogleSheet(
      this.spreadsheetId,
      this.spreadsheetReportBreakdownRange,
    );

    return {
      success: true,
      message: 'Report Breakdown Sync started',
      result: result,
    };
  }

  // Post /reports/webhook
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyGuard)
  async handleWebhook(@Body() payload: any) {
    this.logger.log('Received Webhook: ', payload);
    this.gateway.broadcastSheetUpdate(payload);

    await this.reportService.syncReportMetricsFromGoogleSheet(
      this.spreadsheetId,
      this.spreadsheetReportMetricsRange,
    );

    await this.reportService.syncReportBreakdownFromGoogleSheet(
      this.spreadsheetId,
      this.spreadsheetReportBreakdownRange,
    );

    this.gateway.broadcastReportUpdate(await this.getAllReport());

    return {
      success: true,
      message: 'Data synced and UI notified',
    };
  }
}

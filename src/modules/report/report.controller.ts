import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportType } from '../../domain/entities/report.entity';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // GET /reports/all?type=revenue
  @Get('all')
  async getAll(@Query('type') type: ReportType) {
    return await this.reportService.getAllYearsReport(type);
  }

  // GET /reports/annual?type=revenue&year=2025
  @Get('annual')
  async getAnnual(
    @Query('type') type: ReportType,
    @Query('year') year: string,
  ) {
    return await this.reportService.getAnnualReport(type, year);
  }

  // GET /reports/period?type=revenue&year=2025&start=1&end=5
  @Get('period')
  async getPeriod(
    @Query('type') type: ReportType,
    @Query('year') year: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return await this.reportService.getPeriodReport(type, year, +start, +end);
  }

  // Post /reports/sync
  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async sync() {
    return this.reportService.syncFromSheets();
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() payload: any) {
    await this.reportService.syncFromSheets();
    return {
      success: true,
      message: 'Data synced and UI notified',
    };
  }
}

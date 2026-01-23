import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { ReportGateway } from './report.gateway';

@Module({
  controllers: [ReportController],
  providers: [ReportService, ReportGateway],
  exports: [ReportService],
})
export class ReportModule {}

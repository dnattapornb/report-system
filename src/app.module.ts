import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisProvider } from './infrastructure/redis/redis.provider';
import { RedisService } from './infrastructure/redis/redis.service';
import { GoogleSheetsService } from './infrastructure/google/google-sheets.service';
import { ReportModule } from './modules/report/report.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ReportModule, // Import newly created ReportModule
  ],
  providers: [RedisProvider, RedisService, GoogleSheetsService],
  exports: [RedisService, GoogleSheetsService],
})
export class AppModule {}

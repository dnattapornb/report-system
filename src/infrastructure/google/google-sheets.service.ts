import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { google, sheets_v4 } from 'googleapis';
import * as path from 'path';

@Injectable()
export class GoogleSheetsService implements OnModuleInit {
  private readonly logger = new Logger(GoogleSheetsService.name);
  private sheets: sheets_v4.Sheets;

  onModuleInit() {
    // Initialize authentication once the module is loaded
    this.initGoogleAuth();
  }

  private initGoogleAuth() {
    try {
      // Define the path to the Key file
      const keyPath = path.join(process.cwd(), 'google-key.json');

      const auth = new google.auth.GoogleAuth({
        keyFile: keyPath,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });

      this.sheets = google.sheets({ version: 'v4', auth });
      this.logger.log(
        'Google Auth initialized successfully',
      );
    } catch (error) {
      this.logger.error(`Auth Error: ${error.message}`);
      throw new InternalServerErrorException(
        'Failed to initialize Google Auth',
      );
    }
  }

  /**
   * Fetch values from a spreadsheet within a specific range
   */
  async getSheetValues(spreadsheetId: string, range: string): Promise<any[][]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      // Return data as a 2D array
      return response.data.values ?? [];
    } catch (error) {
      this.logger.error(`Fetch Error: ${error.message}`);
      throw new InternalServerErrorException(
        `Could not fetch Google Sheet data: ${error.message}`,
      );
    }
  }
}

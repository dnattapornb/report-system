import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);

  // Inject ConfigService to read values from .env
  constructor(private readonly configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Extract Request Object from Context
    const request = context.switchToHttp().getRequest();

    // Get 'x-api-key' header (NestJS converts headers to lowercase)
    const apiKey = request.headers['x-api-key'];

    // Get the valid Key from .env
    const validApiKey = this.configService.get<string>('WEBHOOK_API_KEY');

    // Security check: If server Key is not configured, block immediately
    if (!validApiKey) {
      console.error(
        'FATAL: WEBHOOK_API_KEY is not set in environment variables.',
      );
      this.logger.error(
        'FATAL: WEBHOOK_API_KEY is not set in environment variables.',
      );

      return false;
    }

    // If Keys match, allow access (return true)
    if (apiKey === validApiKey) {
      return true;
    }

    // If mismatch, throw 401 Unauthorized Error
    throw new UnauthorizedException('Invalid API Key');
  }
}

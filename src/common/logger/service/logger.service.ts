import { Injectable } from '@nestjs/common';
import { createLogger, format, Logger, transports } from 'winston';
import LokiTransport from 'winston-loki';

@Injectable()
export class LoggerService {
  private logger: Logger;

  constructor() {
    const isTestEnv: boolean = process.env.NODE_ENV === 'test';

    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.json()
      ),
      transports: [
        new transports.Console(), 
        ...(isTestEnv ? [] : [
          new LokiTransport({
            host: 'http://loki:3100',
            json: true,
            labels: {
              app_name: "bank-transaction-api",
            }
          }),
        ]),
      ],
    });
  }

  info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  error(message: string, meta?: any) {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: any) {
    this.logger.debug(message, meta);
  }
}

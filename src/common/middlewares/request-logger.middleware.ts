import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, url } = req;
    const start = Date.now();

    const originalSend = res.send;
    let responseBody: string | object | undefined;

    res.send = function (body: string | object) {
      responseBody = body;
      return originalSend.call(this, body);
    };

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - start;
      const message = `${method} ${url} ${statusCode} - ${duration}ms`;

      let logMessage = message;
      try {
        if (typeof responseBody === 'string') {
          const parsedBody = JSON.parse(responseBody);
          logMessage += ` | Response: ${parsedBody?.message ?? 'N/A'}`;
        } else if (typeof responseBody === 'object') {
          logMessage += ` | Response: ${(responseBody as { message?: string })?.message ?? 'N/A'}`;
        }
      } catch {
        logMessage += ` | Response: ${responseBody ?? 'N/A'}`;
      }

      if (statusCode >= 500) {
        this.logger.error(logMessage);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }
}

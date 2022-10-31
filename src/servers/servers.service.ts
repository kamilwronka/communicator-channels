import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { catchError } from 'rxjs';

@Injectable()
export class ServersService {
  constructor(private readonly httpService: HttpService) {}
  private readonly logger = new Logger(ServersService.name);

  updateLastMessageDate(channelId: string, date: string): void {
    const requestData = { date };

    this.httpService.patch(`/private/channels/${channelId}`, requestData).pipe(
      catchError(() => {
        Logger.error('Unable to update last message date');
        return 'error';
      }),
    );
  }
}

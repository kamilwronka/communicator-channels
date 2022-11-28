import { HttpService } from '@nestjs/axios';
import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';

import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(private readonly httpService: HttpService) {}
  private readonly logger = new Logger(UsersService.name);

  async getUserData(userId: string): Promise<any> {
    const { data } = await firstValueFrom(
      this.httpService.get(`/internal/${userId}`).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.message);
          throw new BadGatewayException(error.message);
        }),
      ),
    );

    return data;
  }
}

import { HttpService } from '@nestjs/axios';
import { BadGatewayException, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';

import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(private readonly httpService: HttpService) {}

  async getUserData(userId: string): Promise<any> {
    const { data } = await firstValueFrom(
      this.httpService.get(`/${userId}`).pipe(
        catchError((error: AxiosError) => {
          throw new BadGatewayException(error.message);
        }),
      ),
    );

    return data;
  }
}

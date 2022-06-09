import { HttpService } from '@nestjs/axios';

export const updateLastMessageDate = async (
  channelId: string,
  date: string,
): Promise<any> => {
  const response = new HttpService().patch(
    `http://servers:4000/private/channels/${channelId}`,
    { date },
  );
  const channel = await response.toPromise();

  return channel.data;
};

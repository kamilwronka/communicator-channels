import { UsersService } from '@communicator/common';
import { Injectable } from '@nestjs/common';
import { GCPubSubClient } from 'nestjs-google-pubsub-microservice';
import { MessageDto } from './dto/message.dto';

export type TMessageData = {
  userId: string;
  serverId: string;
  channelId: string;
  message: MessageDto;
};

const client = new GCPubSubClient({
  client: {
    projectId: 'communicator-dev-329611',
  },
  topic: 'message',
});

@Injectable()
export class MessagesService {
  constructor(private usersService: UsersService) {}

  async handleMessage({ userId, serverId, channelId, message }: TMessageData) {
    // const userData = await this.usersService.getUserData(userId);

    try {
      await client
        .emit('message', { userId, serverId, channelId, message })
        .toPromise();
      // await client.send('message', JSON.stringify(message)).toPromise();
    } catch (error) {
      console.log(error);
      return { msg: 'nie udało sie' };
    }

    // client
    //   .send('message', message)
    //   .subscribe((response) => console.log(response));
    // console.log(userData);

    return { userId, serverId, channelId, message };
  }
}
import { registerAs } from '@nestjs/config';
import { IServicesConfig } from './types';

export default registerAs('services', (): IServicesConfig => {
  const { ENV, CDN_URL } = process.env;

  const isLocal = ENV === 'local';
  const mockSvcUrl = 'http://mockserver.mockserver:1080';

  let config: IServicesConfig;

  if (isLocal) {
    config = {
      servers: `${mockSvcUrl}/servers`,
      users: `${mockSvcUrl}/users`,
      cdn: CDN_URL,
    };
  } else {
    config = {
      servers: 'http://servers:4000',
      users: 'http://users:4000',
      cdn: CDN_URL,
    };
  }

  return config;
});

import { registerAs } from '@nestjs/config';
import { ServicesConfig } from './types';

export default registerAs('services', (): ServicesConfig => {
  const { ENV } = process.env;

  const isLocal = ENV === 'local';
  const mockSvcUrl = 'http://mockserver.mockserver:1080';

  let config: ServicesConfig;

  if (isLocal) {
    config = {
      servers: `${mockSvcUrl}/servers`,
      users: `${mockSvcUrl}/users`,
    };
  } else {
    config = {
      servers: 'http://servers:4000',
      users: 'http://users:4000',
    };
  }

  return config;
});

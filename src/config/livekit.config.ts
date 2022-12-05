import { registerAs } from '@nestjs/config';
import { LivekitConfig } from './types';

export default registerAs('livekit', (): LivekitConfig => {
  const { LIVEKIT_API_KEY, LIVEKIT_API_SECRET } = process.env;

  return {
    apiKey: LIVEKIT_API_KEY,
    secret: LIVEKIT_API_SECRET,
  };
});

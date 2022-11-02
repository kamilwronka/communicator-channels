import { registerAs } from '@nestjs/config';
import { ILivekitConfig } from './types';

export default registerAs('livekit', (): ILivekitConfig => {
  const { LIVEKIT_API_KEY, LIVEKIT_API_SECRET } = process.env;

  return {
    apiKey: LIVEKIT_API_KEY,
    secret: LIVEKIT_API_SECRET,
  };
});

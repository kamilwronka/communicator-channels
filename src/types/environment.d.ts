import { RuntimeEnvironment } from './common';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number;
      ENV: RuntimeEnvironment;

      RABBITMQ_USER: string;
      RABBITMQ_PASSWORD: string;
      RABBITMQ_HOST: string;
      RABBITMQ_ACCESS_PORT: string;

      MONGODB_PASSWORD: string;
      MONGODB_USER: string;
      MONGODB_HOST: string;
      MONGODB_ACCESS_PORT: number;
      MONGODB_DATABASE: string;

      LIVEKIT_API_KEY: string;
      LIVEKIT_API_SECRET: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};

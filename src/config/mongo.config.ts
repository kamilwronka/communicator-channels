import { registerAs } from '@nestjs/config';
import { IMongoConfig } from './types';

export default registerAs('mongodb', (): IMongoConfig => {
  const {
    MONGODB_HOST,
    MONGODB_PASSWORD,
    MONGODB_ACCESS_PORT,
    MONGODB_USER,
    MONGODB_DATABASE,
  } = process.env;

  return {
    host: MONGODB_HOST,
    port: MONGODB_ACCESS_PORT,
    password: MONGODB_PASSWORD,
    user: MONGODB_USER,
    database: MONGODB_DATABASE,
  };
});

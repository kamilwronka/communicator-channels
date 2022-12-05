import { registerAs } from '@nestjs/config';
import { MongoConfig } from './types';

export default registerAs('mongodb', (): MongoConfig => {
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

import { registerAs } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export default registerAs('mongodb', (): MongooseModuleOptions => {
  const {
    MONGODB_HOST,
    MONGODB_PASSWORD,
    MONGODB_ACCESS_PORT,
    MONGODB_USER,
    MONGODB_DATABASE,
  } = process.env;

  return {
    uri: `mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_ACCESS_PORT}`,
    ssl: false,
    dbName: MONGODB_DATABASE,
  };
});

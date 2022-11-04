export enum EEnvironment {
  LOCAL = 'local',
  DEV = 'dev',
  PROD = 'prod',
}

export interface IRabbitMqConfig {
  host: string;
  port: string;
  password: string;
  user: string;
  queue: string;
}

export interface IAppConfig {
  env: string;
  port: number;
}

export interface IMongoConfig {
  port: number;
  host: string;
  user: string;
  password: string;
  database: string;
}

export interface IServicesConfig {
  servers: string;
  users: string;
  cdn: string;
}

export interface IAWSConfig {
  accessKeyId: string;
  secret: string;
  bucketName: string;
}

export interface ILivekitConfig {
  apiKey: string;
  secret: string;
}

export interface RabbitMqConfig {
  host: string;
  port: string;
  password: string;
  user: string;
  queue: string;
}

export interface AppConfig {
  env: string;
  port: number;
}

export interface MongoConfig {
  port: number;
  host: string;
  user: string;
  password: string;
  database: string;
}

export interface ServicesConfig {
  servers: string;
  users: string;
  cdn: string;
}

export interface AWSConfig {
  accessKeyId: string;
  secret: string;
  bucketName: string;
}

export interface LivekitConfig {
  apiKey: string;
  secret: string;
}

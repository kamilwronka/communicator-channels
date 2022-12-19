export interface RabbitMqConfig {
  host: string;
  port: string;
  password: string;
  user: string;
}

export interface AppConfig {
  env: string;
  port: number;
}

export interface ServicesConfig {
  servers: string;
  users: string;
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

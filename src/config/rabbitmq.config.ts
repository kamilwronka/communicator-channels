import { registerAs } from '@nestjs/config';
import { IRabbitMqConfig } from './types';

export default registerAs('rabbitmq', (): IRabbitMqConfig => {
  const {
    RABBITMQ_USER,
    RABBITMQ_PASSWORD,
    RABBITMQ_HOST,
    RABBITMQ_ACCESS_PORT,
  } = process.env;

  return {
    host: RABBITMQ_HOST,
    port: RABBITMQ_ACCESS_PORT,
    password: RABBITMQ_PASSWORD,
    user: RABBITMQ_USER,
    queue: 'gateway_queue',
  };
});

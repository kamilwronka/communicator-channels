import { registerAs } from '@nestjs/config';
import { AWSConfig } from './types';

export default registerAs('aws', (): AWSConfig => {
  const { AWS_ACCESS_KEY_ID, AWS_S3_BUCKET_NAME, AWS_SECRET_ACCESS_KEY } =
    process.env;

  return {
    secret: AWS_SECRET_ACCESS_KEY,
    accessKeyId: AWS_ACCESS_KEY_ID,
    bucketName: AWS_S3_BUCKET_NAME,
  };
});

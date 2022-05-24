import * as dotenv from 'dotenv';
import { retrieveSecret } from '@communicator/common';

dotenv.config();

export type TDatabaseConfig = {
  MONGO_CONNECTION_URI: string;
  MONGO_DATABASE: string;
};

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  config: TDatabaseConfig = {} as TDatabaseConfig;

  public async setup(keys: string[]) {
    this.ensureValues(keys);
    await this.retrieveSecrets();

    return this;
  }

  public async retrieveSecrets() {
    const data = await retrieveSecret<TDatabaseConfig>(
      'projects/464228375192/secrets/communicator-dev-servers',
    );

    this.config = data;
  }

  private getValue(key: string, throwOnMissing = false): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }

    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  public getPort() {
    return this.getValue('PORT', true);
  }

  public getEnvironment() {
    return this.getValue('ENV', false);
  }

  public getPubSubConfig() {
    const env = this.getEnvironment();

    return {
      topic: `gateway-${env}`,
      subscription: `gateway-${env}-sub`,
      client: {
        projectId: 'vaulted-acolyte-348710',
      },
    };
  }

  public getMongoConnectionConfig() {
    const connectionUri = this.config.MONGO_CONNECTION_URI;
    const database = this.config.MONGO_DATABASE;

    return { connectionUri, database };
  }
}

const configService = new ConfigService(process.env).ensureValues([
  'ENV',
  'PORT',
]);

export { configService };

import * as dotenv from 'dotenv';

dotenv.config();

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

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
}

const configService = new ConfigService(process.env).ensureValues([
  'ENV',
  'PORT',
]);

export { configService };

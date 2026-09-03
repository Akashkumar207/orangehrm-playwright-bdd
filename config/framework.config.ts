import 'dotenv/config';
import devConfig from './environments/dev.config';
import qaConfig from './environments/qa.config';
import prodConfig from './environments/prod.config';

type Environment = 'dev' | 'qa' | 'prod';

interface EnvironmentConfig {
  baseURL: string;
}

const ENVIRONMENT_CONFIGS: Record<Environment, EnvironmentConfig> = {
  dev: devConfig,
  qa: qaConfig,
  prod: prodConfig,
};

function resolveEnvironment(): Environment {
  const requested = process.env.TEST_ENV;
  if (requested === 'dev' || requested === 'qa' || requested === 'prod') {
    return requested;
  }
  return 'qa';
}

const environment = resolveEnvironment();

/**
 * Single source of truth for configuration values, merging (in priority
 * order) explicit environment variables, then the selected environment's
 * config file, then a hardcoded fallback. Everything else in the framework
 * — playwright.config.ts, step definitions — reads from here instead of
 * touching `process.env` directly, so there is exactly one place that knows
 * how configuration is resolved.
 */
export const frameworkConfig = {
  environment,
  baseURL: process.env.BASE_URL ?? ENVIRONMENT_CONFIGS[environment].baseURL,
  adminUsername: process.env.ADMIN_USERNAME ?? 'Admin',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'admin123',
};

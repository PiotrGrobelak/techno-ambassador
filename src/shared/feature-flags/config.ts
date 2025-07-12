import type { FeatureFlagsConfig } from './types';

/**
 * Feature flags configuration for all environments
 *
 * Environment-specific settings:
 * - local: All features enabled for local development
 * - remote-development: Features enabled for testing, some may be restricted
 * - production: Conservative settings, most features disabled by default
 */
export const featureFlagsConfig: FeatureFlagsConfig = {
  local: {
    events: true,
  },
  'remote-development': {
    events: true,
  },
  production: {
    events: false,
  },
};

/**
 * Available environments for feature flags
 */
export type Environment = 'local' | 'remote-development' | 'production';

/**
 * Available feature flag names
 */
export type FeatureFlagName = 'events';

/**
 * Feature flag configuration for a single environment
 */
export type EnvironmentConfig = {
  [K in FeatureFlagName]: boolean;
};

/**
 * Complete feature flags configuration for all environments
 */
export type FeatureFlagsConfig = {
  [K in Environment]: EnvironmentConfig;
};

/**
 * Feature flag check result
 */
export interface FeatureFlagResult {
  enabled: boolean;
  environment: Environment | null;
  flagName: FeatureFlagName;
}

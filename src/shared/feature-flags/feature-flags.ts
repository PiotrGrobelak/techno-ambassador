import type { Environment, FeatureFlagName, FeatureFlagResult } from './types';
import { featureFlagsConfig } from './config';

/**
 * Get the current environment from environment variables
 * Works in both Node.js (process.env) and browser/Astro (import.meta.env)
 */
function getCurrentEnvironment(): Environment | null {
  return (import.meta.env.PUBLIC_ENV_NAME as Environment) || null;
}

/**
 * Check if a feature flag is enabled
 *
 * @param flagName - Name of the feature flag to check
 * @returns Boolean indicating if the feature is enabled
 */
export function isFeatureEnabled(flagName: FeatureFlagName): boolean {
  try {
    const environment = getCurrentEnvironment();
    console.log('environment', environment);
    if (!environment) {
      return false;
    }
    const environmentConfig = featureFlagsConfig[environment];

    if (!environmentConfig) {
      console.warn(
        `[FeatureFlags] No configuration found for environment "${environment}", feature "${flagName}" disabled`
      );
      return false;
    }

    const isEnabled = environmentConfig[flagName];

    if (!isEnabled) {
      console.warn(
        `[FeatureFlags] Feature "${flagName}" is disabled in environment "${environment}"`
      );
    }

    return isEnabled;
  } catch (error) {
    console.error(
      `[FeatureFlags] Error checking feature flag "${flagName}":`,
      error
    );
    return false;
  }
}

/**
 * Get detailed information about a feature flag
 *
 * @param flagName - Name of the feature flag to check
 * @returns Detailed information about the flag state
 */
export function getFeatureFlagInfo(
  flagName: FeatureFlagName
): FeatureFlagResult {
  const environment = getCurrentEnvironment();
  const enabled = isFeatureEnabled(flagName);

  return {
    enabled,
    environment,
    flagName,
  };
}

/**
 * Get all feature flags for the current environment
 *
 * @returns Object with all feature flags and their states
 */
export function getAllFeatureFlags(): Record<FeatureFlagName, boolean> {
  const environment = getCurrentEnvironment();
  const environmentConfig = environment
    ? featureFlagsConfig[environment]
    : null;

  if (!environmentConfig) {
    console.warn(
      `[FeatureFlags] No configuration found for environment "${environment}"`
    );
    return {
      events: false,
    };
  }

  return { ...environmentConfig };
}

/**
 * Debug helper to log all feature flags
 */
export function debugFeatureFlags(): void {
  const environment = getCurrentEnvironment();
  const flags = getAllFeatureFlags();

  console.log(`[FeatureFlags] Environment: ${environment}`);
  console.log('[FeatureFlags] Feature flags state:');

  Object.entries(flags).forEach(([flagName, enabled]) => {
    console.log(`  ${flagName}: ${enabled ? '✅ enabled' : '❌ disabled'}`);
  });
}

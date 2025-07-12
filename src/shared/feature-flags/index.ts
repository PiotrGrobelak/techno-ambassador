/**
 * Feature Flags Module
 *
 * Universal TypeScript module for managing feature flags across frontend and backend.
 * Supports multiple environments (local, remote-development, production) with fail-safe behavior.
 *
 */

export {
  isFeatureEnabled,
  getFeatureFlagInfo,
  getAllFeatureFlags,
  debugFeatureFlags,
} from './feature-flags';

export { featureFlagsConfig } from './config';

export type {
  Environment,
  FeatureFlagName,
  EnvironmentConfig,
  FeatureFlagsConfig,
  FeatureFlagResult,
} from './types';

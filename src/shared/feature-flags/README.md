# Feature Flags System

Universal TypeScript module for managing feature flags across frontend and backend components in the Techno Ambassador application.

## Overview

The feature flags system allows you to safely deploy code while keeping features disabled until they're ready for production. This enables decoupling deployments from releases and provides fine-grained control over feature availability across different environments.

## Architecture

```
src/shared/feature-flags/
├── types.ts           # TypeScript type definitions
├── config.ts          # Environment-specific configuration
├── feature-flags.ts   # Core functionality
├── index.ts          # Main module exports
└── README.md         # This documentation
```

## Environment Configuration

The system supports three environments controlled by the `ENV_NAME` environment variable:

- **`local`** - Local development environment (all features enabled)
- **`remote-development`** - Remote development/staging environment
- **`production`** - Production environment (conservative defaults)

## Available Feature Flags

| Flag Name | Description                | Local | Remote-Dev | Production |
| --------- | -------------------------- | ----- | ---------- | ---------- |
| `events`  | Events management features | ✅    | ❌         | ❌         |

## Basic Usage

### Import the module

```typescript
import { isFeatureEnabled } from '@/shared/feature-flags';
```

### Check if a feature is enabled

```typescript
if (isFeatureEnabled('events')) {
  // Feature is enabled - execute feature code
  console.log('Events feature is available');
} else {
  // Feature is disabled - handle gracefully
  console.log('Events feature is disabled');
}
```

## Integration Examples

### 1. Astro Pages (SSR)

```astro
---
// src/pages/dj/events.astro
import { isFeatureEnabled } from '@/shared/feature-flags';

// Check if events feature is enabled
const isEventsEnabled = isFeatureEnabled('events');
if (!isEventsEnabled) {
  return Astro.redirect('/');
}
---

<Layout title="Events Management">
  <!-- Page content -->
</Layout>
```

### 2. Vue Components (Client-side)

```vue
<template>
  <nav>
    <BaseButton
      v-if="isEventsEnabled"
      label="Events Management"
      @click="navigateToEvents"
    />
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { isFeatureEnabled } from '@/shared/feature-flags';

const isEventsEnabled = computed(() => {
  return isFeatureEnabled('events');
});
</script>
```

### 3. API Endpoints (Server-side)

```typescript
// src/pages/api/events.ts
import { isFeatureEnabled } from '@/shared/feature-flags';

export async function POST(context: APIContext): Promise<Response> {
  try {
    // Check if events feature is enabled
    if (!isFeatureEnabled('events')) {
      throw ApiErrors.forbidden(
        'Events management feature is currently disabled.'
      );
    }

    // Continue with API logic...
  } catch (error) {
    return await handleApiError(error, context);
  }
}
```

## Advanced Usage

### Get detailed feature flag information

```typescript
import { getFeatureFlagInfo } from '@/shared/feature-flags';

const flagInfo = getFeatureFlagInfo('events');
console.log(flagInfo);
// Output: { enabled: true, environment: 'local', flagName: 'events' }
```

### Get all feature flags

```typescript
import { getAllFeatureFlags } from '@/shared/feature-flags';

const allFlags = getAllFeatureFlags();
console.log(allFlags);
// Output: { events: true }
```

### Debug feature flags

```typescript
import { debugFeatureFlags } from '@/shared/feature-flags';

debugFeatureFlags();
// Console output:
// [FeatureFlags] Environment: local
// [FeatureFlags] Feature flags state:
//   events: ✅ enabled
```

## Environment Setup

Set the `ENV_NAME` environment variable in your deployment configuration:

### Local Development (.env.local)

```bash
ENV_NAME=local
```

### Remote Development (.env.development)

```bash
ENV_NAME=remote-development
```

### Production (.env.production)

```bash
ENV_NAME=production
```

## Error Handling

The system is designed with fail-safe behavior:

- **Missing ENV_NAME**: Falls back to `local` environment
- **Invalid ENV_NAME**: Falls back to `local` environment with warning
- **Runtime errors**: Return `false` (feature disabled) and log error
- **Missing configuration**: Return `false` and log warning

## Logging

The system provides helpful logging for debugging:

```typescript
// When feature is disabled
console.warn(
  '[FeatureFlags] Feature "events" is disabled in environment "production"'
);

// When environment is not set
console.warn(
  '[FeatureFlags] ENV_NAME not set, falling back to default environment: local'
);

// When configuration is missing
console.warn('[FeatureFlags] No configuration found for environment "unknown"');
```

## Adding New Features

1. **Update types** in `src/shared/feature-flags/types.ts`:

```typescript
export type FeatureFlagName = 'events' | 'new-feature';
```

2. **Update configuration** in `src/shared/feature-flags/config.ts`:

```typescript
export const featureFlagsConfig: FeatureFlagsConfig = {
  local: {
    events: true,
    'new-feature': true, // Add new feature
  },
  // ... other environments
};
```

3. **Use in your code**:

```typescript
if (isFeatureEnabled('new-feature')) {
  // New feature logic
}
```

## Best Practices

1. **Fail-safe by default**: Always handle the case when features are disabled
2. **Descriptive error messages**: Provide helpful messages when features are disabled
3. **Conservative production defaults**: Keep new features disabled in production until tested
4. **Consistent naming**: Use kebab-case for feature names
5. **Environment-specific testing**: Test feature behavior in all environments

## Integration with CI/CD

The feature flags system integrates seamlessly with your deployment pipeline:

1. **Development**: Features can be enabled for testing
2. **Staging**: Selective feature enablement for validation
3. **Production**: Conservative rollout with granular control

This allows for safe deployment of code while maintaining control over feature availability.

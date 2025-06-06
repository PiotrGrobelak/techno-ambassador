# Base Components - Apple Human Interface Guidelines

This collection of Vue components follows Apple Human Interface Guidelines (HIG) principles to provide consistent, intuitive, and accessible user interface elements.

## Design Principles

Our components implement the following Apple HIG principles:

- **Clear Visual Hierarchy** - Typography and spacing that guides user attention
- **Consistent Interaction Patterns** - Predictable behavior across all components
- **Appropriate Feedback** - Visual and interactive feedback for user actions
- **Accessibility** - Built-in support for screen readers and keyboard navigation
- **Forgiveness** - Easy recovery from mistakes with clear actions
- **Predictable Behavior** - Components behave as users expect them to

## Available Components

### BaseButton

Button component with Apple HIG variants and interaction patterns.

```vue
<BaseButton
  label="Primary Action"
  variant="primary"
  size="medium"
  :pulse="true"
  @click="handleClick"
/>
```

**Props:**

- `variant`: `'primary'` | `'secondary'` | `'destructive'` | `'ghost'` | `'link'`
- `size`: `'small'` | `'medium'` | `'large'`
- `pulse`: Boolean - Highlights most likely choice (Apple HIG principle)
- `loading`: Boolean - Shows loading state
- `disabled`: Boolean

### BaseInput

Input field component with validation, feedback, and Apple HIG formatting.

```vue
<BaseInput
  v-model="value"
  label="Email Address"
  variant="email"
  :clearable="true"
  helper-text="We'll never share your email"
  :error-message="errorMessage"
  @blur="validate"
/>
```

**Props:**

- `variant`: `'default'` | `'search'` | `'email'` | `'password'` | `'number'` | `'tel'` | `'url'`
- `size`: `'small'` | `'medium'` | `'large'`
- `clearable`: Boolean - Adds clear button (forgiveness principle)
- `multiline`: Boolean - Uses textarea for longer text
- `iconLeading` / `iconTrailing`: Icon components

### BaseTypography

Typography component implementing Apple's SF font system with proper hierarchy.

```vue
<BaseTypography variant="h1" weight="semibold" color="primary" :mono="false">
  Heading Text
</BaseTypography>
```

**Props:**

- `variant`: `'h1'` | `'h2'` | `'h3'` | `'h4'` | `'h5'` | `'h6'` | `'body-large'` | `'body'` | `'body-small'` | `'caption'` | `'label'` | `'overline'`
- `weight`: `'light'` | `'regular'` | `'medium'` | `'semibold'` | `'bold'`
- `color`: `'primary'` | `'secondary'` | `'success'` | `'warning'` | `'danger'` | `'muted'`
- `mono`: Boolean - Uses SF Mono for code

### BaseModal

Modal/dialog component with Apple HIG presentation styles and friction levels.

**Note:** This component uses the `v-if` pattern for visibility control instead of `v-model`. The parent component controls visibility and listens to close/confirm/cancel events.

```vue
<BaseDialogV2
  v-if="showModal"
  variant="sheet"
  friction="low"
  header="Confirm Action"
  :persistent="false"
  @confirm="handleConfirm"
  @cancel="handleCancel"
  @close="showModal = false"
>
  <template #default>
    Modal content goes here
  </template>
</BaseDialogV2>
```

**Props:**

- `variant`: `'sheet'` | `'alert'` | `'fullscreen'` | `'drawer'`
- `friction`: `'high'` | `'low'` | `'none'` - Controls how easy it is to dismiss
- `size`: `'small'` | `'medium'` | `'large'` | `'xlarge'`
- `persistent`: Boolean - High friction modals require explicit decisions
- `highlightPrimary`: Boolean - Pulses primary action button
- `header`: String - Header text (can be overridden with header slot)

**Events:**

- `@close` - Emitted when dialog is closed (ESC, close button, backdrop click)
- `@confirm` - Emitted when confirm button is clicked
- `@cancel` - Emitted when cancel button is clicked or dialog is closed

### BaseCard

Card component for organizing content with Apple HIG spacing and visual hierarchy.

```vue
<BaseCard
  title="Card Title"
  subtitle="Card subtitle"
  variant="elevated"
  :interactive="true"
  :shadow="true"
  @click="handleCardClick"
>
  <template #default>
    Card content
  </template>
  
  <template #footer>
    <BaseButton label="Action" size="small" />
  </template>
</BaseCard>
```

**Props:**

- `variant`: `'elevated'` | `'outlined'` | `'filled'` | `'ghost'`
- `size`: `'small'` | `'medium'` | `'large'`
- `interactive`: Boolean - Makes card clickable with hover effects
- `selected`: Boolean - Shows selected state
- `loading`: Boolean - Shows loading shimmer

## Usage Examples

### Basic Form with Validation

```vue
<template>
  <form @submit="handleSubmit">
    <div class="space-y-4">
      <BaseInput
        v-model="form.email"
        label="Email"
        variant="email"
        :error-message="errors.email"
        :clearable="true"
        required
      />

      <BaseInput
        v-model="form.password"
        label="Password"
        variant="password"
        :error-message="errors.password"
        required
      />

      <BaseButton
        type="submit"
        label="Sign In"
        variant="primary"
        :loading="isLoading"
        :pulse="true"
        full-width
      />
    </div>
  </form>
</template>
```

### Content Card Grid

```vue
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <BaseCard
      v-for="item in items"
      :key="item.id"
      :title="item.title"
      :subtitle="item.subtitle"
      variant="elevated"
      :interactive="true"
      @click="() => selectItem(item)"
    >
      <BaseTypography variant="body" color="secondary">
        {{ item.description }}
      </BaseTypography>

      <template #footer>
        <div class="flex justify-between">
          <BaseTypography variant="caption" color="muted">
            {{ item.date }}
          </BaseTypography>
          <BaseButton label="View" variant="ghost" size="small" />
        </div>
      </template>
    </BaseCard>
  </div>
</template>
```

### Confirmation Modal

```vue
<template>
  <BaseDialogV2
    v-if="showDeleteModal"
    variant="alert"
    friction="high"
    header="Delete Item"
    confirm-text="Delete"
    confirm-variant="destructive"
    :persistent="true"
    :highlight-primary="true"
    @confirm="confirmDelete"
    @cancel="showDeleteModal = false"
    @close="showDeleteModal = false"
  >
    <BaseTypography variant="body" color="secondary">
      Are you sure you want to delete this item? This action cannot be undone.
    </BaseTypography>
  </BaseDialogV2>
</template>
```

## Styling Integration

These components are designed to work with:

- **Tailwind CSS 4** for utility classes
- **PrimeVue** for base component functionality
- **Apple SF Fonts** with proper fallbacks

The components automatically apply:

- Anti-aliasing for crisp text rendering
- Proper focus management for keyboard navigation
- Responsive design following Apple HIG breakpoints
- Smooth animations and transitions

## Accessibility Features

All components include:

- Proper ARIA attributes
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management
- Semantic HTML structure

## Contributing

When adding new components:

1. Follow Apple HIG principles
2. Implement proper TypeScript types
3. Add comprehensive props for flexibility
4. Include accessibility features
5. Document usage examples
6. Test with screen readers and keyboard navigation

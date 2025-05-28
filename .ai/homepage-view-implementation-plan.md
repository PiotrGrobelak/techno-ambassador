# Homepage View Implementation Plan

## 1. Overview

The Homepage is the main entry point to the Techno Ambassador platform, offering a central place for searching DJs. The view consists of a hero section with platform description and an interactive search module with filters and results. It allows users to browse all registered DJs, search by artist name, filter by music styles, and paginate results. Access is public without requiring authorization.

## 2. View Routing

The view will be available at the main path:

- **Path**: `/`
- **File**: `src/pages/index.astro`
- **Access**: Public (no authorization required)

## 3. Component Structure

```
HomePage (Astro)
└── DJSearchWidget (Vue)
    ├── SearchFilters (Vue)
    │   ├── SearchInput (Vue)
    │   └── MusicStyleFilter (Vue)
    ├── DJList (Vue)
    │   ├── LoadingSkeletons (Vue)
    │   └── DJCard[] (Vue)
    └── LoadMoreButton (Vue)
```

## 4. Component Details

### HomePage (Astro)

- **Component description**: Main page container connecting static hero section with interactive DJ search module
- **Main elements**: Layout wrapper, HeroSection, DJSearchWidget with client-side hydration
- **Supported interactions**: None (static component)
- **Supported validation**: None
- **Types**: None
- **Props**: None

### DJSearchWidget (Vue)

- **Component description**: Main interactive module managing search, filters, and DJ results display
- **Main elements**: SearchFilters, DJList, LoadMoreButton, loading and error state handling
- **Supported interactions**: Component initialization, search and filter coordination
- **Supported validation**: Coordination of validation from child components
- **Types**: `SearchState`, `FilterOptions`, `PaginationState`, `UsersListResponseDto`
- **Props**: None (main component)

### SearchFilters (Vue)

- **Component description**: Container for search and filter controls with clear functionality
- **Main elements**: SearchInput, MusicStyleFilter, "Clear filters" button
- **Supported interactions**: Filter change aggregation, clearing all filters
- **Supported validation**: Search text length validation (1-100 characters), music style UUID validation
- **Types**: `UsersQueryParams`, `MusicStyleDto[]`, `SearchState`
- **Props**: `musicStyles: MusicStyleDto[]`, `isLoading: boolean`

### SearchInput (Vue)

- **Component description**: Text field for searching DJs by artist name with debouncing
- **Main elements**: InputText from PrimeVue, search icon, placeholder
- **Supported interactions**: Text input with 300ms debouncing, field clearing
- **Supported validation**: Minimum length 1 character, maximum 100 characters, whitespace trimming
- **Types**: `string` for search value
- **Props**: `modelValue: string`, `placeholder: string`, `disabled: boolean`

### MusicStyleFilter (Vue)

- **Component description**: Select your favorite music styles
- **Main elements**: Modal window with list of music styles and a button to select styles
- **Supported interactions**: Multiple style selection, modal window closing
- **Supported validation**: Verification that selected styles exist in available options
- **Types**: `MusicStyleDto[]`, `string[]` for selected IDs
- **Props**: `musicStyles: MusicStyleDto[]`, `modelValue: string[]`, `disabled: boolean`

### DJList (Vue)

- **Component description**: Search results list for DJs with loading and empty state handling
- **Main elements**: DJCard grid, LoadingSkeletons, no results message
- **Supported interactions**: Results display, empty state handling
- **Supported validation**: None (data presentation only)
- **Types**: `UserListItemDto[]`, `boolean` for loading states
- **Props**: `djList: UserListItemDto[]`, `isLoading: boolean`, `isEmpty: boolean`

### DJCard (Vue)

- **Component description**: Individual DJ card with basic information and profile link
- **Main elements**: Artist name, biography (truncated), music styles, upcoming events count, profile link
- **Supported interactions**: Click leading to DJ profile
- **Supported validation**: None (data presentation only)
- **Types**: `UserListItemDto`
- **Props**: `dj: UserListItemDto`

### LoadMoreButton (Vue)

- **Component description**: Button for loading additional results with pagination
- **Main elements**: Button from PrimeVue, loading spinner, dynamic text
- **Supported interactions**: Click loading next page of results
- **Supported validation**: Check `has_next` before button activation
- **Types**: `PaginationDto`, `boolean` for loading state
- **Props**: `pagination: PaginationDto`, `isLoading: boolean`

### LoadingSkeletons (Vue)

- **Component description**: Skeleton components for result loading states
- **Main elements**: Skeleton from PrimeVue mimicking DJCard
- **Supported interactions**: None (visual only)
- **Supported validation**: None
- **Types**: `number` for skeleton count
- **Props**: `count: number`

## 5. Types

### SearchState (ViewModel)

```typescript
interface SearchState {
  searchTerm: string; // Current search text
  selectedMusicStyles: string[]; // List of selected music style IDs
  isLoading: boolean; // Results loading state
  hasError: boolean; // Whether an error occurred
  errorMessage: string; // Error message
}
```

### FilterOptions (ViewModel)

```typescript
interface FilterOptions {
  musicStyles: MusicStyleDto[]; // Available music styles
  isLoadingMusicStyles: boolean; // Music styles loading state
}
```

### PaginationState (ViewModel)

```typescript
interface PaginationState {
  currentPage: number; // Current page
  hasMore: boolean; // Whether there are more pages
  isLoadingMore: boolean; // Next page loading state
}
```

### API Types Used

- `UserListItemDto` - DJ data for results list
- `UsersListResponseDto` - API response with DJ list and pagination
- `MusicStyleDto` - Music style data
- `PaginationDto` - Pagination metadata
- `UsersQueryParams` - API query parameters

## 6. State Management

The view will use Pinia stores with setup syntax for centralized state management, following domain-based logical separation:

### useSearchStore (Pinia Store)

- **Purpose**: Search functionality with debouncing and validation
- **Store Definition**: Using setup syntax with proper TypeScript annotations
- **State**:
  - `searchTerm: Ref<string>`
  - `debouncedSearchTerm: Ref<string>`
  - `isSearching: Ref<boolean>`
- **Actions**:
  - `setSearchTerm(term: string): void`
  - `clearSearch(): void`
  - `initializeDebouncing(): void`
- **Getters**:
  - `hasValidSearchTerm: ComputedRef<boolean>`
  - `trimmedSearchTerm: ComputedRef<string>`
- **Reactive Subscriptions**: Using `$subscribe` for search term changes
- **Reset Support**: Implementing `$reset()` for clearing search state
- **Logic**: 300ms debouncing using helper composable, text trimming, search validation

### useMusicStylesStore (Pinia Store)

- **Purpose**: Music styles data management and selection state
- **Store Definition**: Setup syntax with TypeScript return type annotations
- **State**:
  - `musicStyles: Ref<MusicStyleDto[]>`
  - `selectedStyles: Ref<string[]>`
  - `isLoading: Ref<boolean>`
  - `error: Ref<string | null>`
- **Actions**:
  - `fetchMusicStyles(): Promise<void>`
  - `toggleStyle(styleId: string): void`
  - `clearStyles(): void`
  - `setSelectedStyles(styleIds: string[]): void`
- **Getters**:
  - `selectedStylesCount: ComputedRef<number>`
  - `hasSelectedStyles: ComputedRef<boolean>`
  - `availableStyles: ComputedRef<MusicStyleDto[]>`
- **Cross-store Usage**: Consumed by `useDJListStore` for filtering
- **Reset Support**: Implementing `$reset()` for clearing selection
- **Logic**: Async API integration, style selection management, error handling

### useDJListStore (Pinia Store)

- **Purpose**: DJ list data, pagination, and filtering coordination
- **Store Definition**: Setup syntax with composable store integration
- **State**:
  - `djList: Ref<UserListItemDto[]>`
  - `pagination: Ref<PaginationDto>`
  - `isLoading: Ref<boolean>`
  - `isLoadingMore: Ref<boolean>`
  - `error: Ref<string | null>`
  - `filters: Ref<UsersQueryParams>`
- **Actions**:
  - `fetchDJs(params?: UsersQueryParams): Promise<void>`
  - `loadMoreDJs(): Promise<void>`
  - `resetList(): void`
  - `updateFilters(filters: Partial<UsersQueryParams>): void`
- **Getters**:
  - `hasMorePages: ComputedRef<boolean>`
  - `totalResults: ComputedRef<number>`
  - `isEmpty: ComputedRef<boolean>`
  - `currentFilters: ComputedRef<UsersQueryParams>`
- **Store Composition**: Uses `useSearchStore` and `useMusicStylesStore` for reactive filtering
- **Subscriptions**: `$subscribe` to search and music style stores for automatic filtering
- **Reset Support**: Implementing `$reset()` for clearing list and pagination
- **Logic**: Reactive filtering based on other stores, pagination accumulation, error state management

### Store Integration Pattern

- **Reactive Store Composition**: DJ list store subscribes to search and music styles changes
- **TypeScript Safety**: All stores use proper return type annotations and generic types
- **State Persistence**: Using Pinia plugins for filter state persistence across sessions
- **DevTools Integration**: Full Pinia devtools support for debugging
- **StoreToRefs Usage**: Components use `storeToRefs()` to maintain reactivity when destructuring

### Helper Composables

#### useDebounce()

- **Purpose**: Utility for debouncing reactive values
- **Parameters**: `value: Ref<string>`, `delay: number`
- **Returns**: `{ debouncedValue: Ref<string> }`
- **TypeScript**: Proper generic type support
- **Usage**: Used by search store for debouncing search input

#### useApiClient()

- **Purpose**: HTTP client wrapper with error handling
- **Methods**: `get<T>()`, `post<T>()` with generic return types
- **Returns**: `Promise<T>` with standardized error handling
- **TypeScript**: Full type safety for API responses
- **Usage**: Used by stores for API integration

#### useToast()

- **Purpose**: Toast notification management with PrimeVue integration
- **Methods**: `showSuccess()`, `showError()`, `showWarning()`
- **Returns**: Toast management utilities
- **Usage**: Used by stores for user feedback and error display

## 7. API Integration

### GET /api/music-styles

- **Purpose**: Fetch available music styles for filter
- **When**: On component initialization
- **Response**: `{ data: MusicStyleDto[], total: number }`
- **Error handling**: Fallback to empty list, error message

### GET /api/users

- **Purpose**: Search and filter DJs
- **When**: On search/filter changes, pagination
- **Parameters**:
  - `search` - search text (string)
  - `music_styles` - selected styles (comma-separated string)
  - `page` - page number (number)
  - `limit` - results per page (number, default: 20)
- **Response**: `UsersListResponseDto`
- **Error handling**: Display message, preserve previous results

## 8. User Interactions

### Text Search

- **Action**: Text input in SearchInput
- **Reaction**: 300ms debouncing, automatic search, pagination reset
- **Feedback**: Loading icon in field, results update

### Music Style Filtering

- **Action**: Style selection/deselection in MultiSelect
- **Reaction**: Immediate filtering, pagination reset
- **Feedback**: Selected styles count, results update

### Pagination

- **Action**: Click "Load more"
- **Reaction**: Load next page, add to existing results
- **Feedback**: Button spinner, new results added to list

### Clear Filters

- **Action**: Click "Clear filters"
- **Reaction**: Reset all filters, return to default results
- **Feedback**: Remove all filters, reload results

### Profile Navigation

- **Action**: Click on DJCard
- **Reaction**: Redirect to `/dj/{artist-name}`
- **Feedback**: Hover effect on card

## 9. Conditions and Validation

### SearchInput

- **Condition**: Search text 1-100 characters
- **Component**: SearchInput
- **UI Impact**: Block search for empty text, length message

### MusicStyleFilter

- **Condition**: Selected styles must exist in available list
- **Component**: MusicStyleFilter
- **UI Impact**: Option filtering, validation before query

### LoadMoreButton

- **Condition**: `pagination.has_next === true`
- **Component**: LoadMoreButton
- **UI Impact**: Hide button when no more pages

### API Query Validation

- **Condition**: Query parameters must be valid (page >= 1, limit 1-100)
- **Component**: useDJList composable
- **UI Impact**: Fallback to default values, error messages

## 10. Error Handling

### Network Errors

- **Scenario**: No API connection
- **Handling**: Toast with error message, retry button
- **Components**: DJSearchWidget, useDJList

### API Validation Errors

- **Scenario**: Invalid query parameters
- **Handling**: Parameter sanitization, fallback to defaults
- **Components**: useDJList composable

### Empty Results

- **Scenario**: No DJs matching criteria
- **Handling**: No results message, filter change suggestions
- **Components**: DJList

### Music Styles Loading Errors

- **Scenario**: GET /api/music-styles failure
- **Handling**: Disable style filter, problem message
- **Components**: useMusicStyles, MusicStyleFilter

### Pagination Errors

- **Scenario**: Error loading next page
- **Handling**: Preserve previous results, error message
- **Components**: LoadMoreButton, useDJList

## 11. Implementation Steps

1. **Create file structure**

   - `src/pages/index.astro` - main page
   - `src/features/home/components/` - Vue components
   - `src/shared/composables/` - custom composables

2. **Implement composables**

   - `useSearch.ts` - search management with debouncing
   - `useMusicStyles.ts` - music styles fetching
   - `useDJList.ts` - DJ list and pagination management

3. **Implement base components**

   - `SearchInput.vue` - search field with validation
   - `MusicStyleFilter.vue` - music styles multi-select
   - `LoadingSkeletons.vue` - skeleton components

4. **Implement presentation components**

   - `DJCard.vue` - DJ card with data and link
   - `DJList.vue` - results list with state handling
   - `LoadMoreButton.vue` - pagination

5. **Implement container components**

   - `SearchFilters.vue` - filter aggregation
   - `DJSearchWidget.vue` - main search module

6. **Implement layout**

   - `HeroSection.astro` - introductory section
   - `index.astro` - main page with component integration

7. **Implement responsiveness**

   - Tailwind styles for mobile-first
   - Testing on different devices
   - Touch interaction optimization

8. **Implement accessibility**

   - ARIA labels for all interactive elements
   - Keyboard navigation
   - Screen reader support
   - Focus management

9. **Testing and optimization**
   - Unit tests for composables
   - Integration tests for components
   - Performance optimization
   - SEO optimization

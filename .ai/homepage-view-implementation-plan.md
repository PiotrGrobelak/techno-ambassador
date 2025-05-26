# Homepage View Implementation Plan

## 1. Overview

Homepage is the main entry point to the Techno Ambassador platform, allowing users to search and browse DJ profiles. The view contains an integrated hero section with platform description and basic search by artist name, which is always available. Advanced filtering options (music style, location, availability) are available in an easy-to-use modal window with buttons instead of traditional form controls. The page displays results as a list of DJ cards with pagination support.

## 2. View Routing

View available at path: `/` (main path)

## 3. Component Structure

```
HomePage (Astro page)
├── HeroWithSearch (Vue component)
│   ├── SearchInput (Vue component using PrimeVue InputText)
│   └── FiltersButton (Vue component using PrimeVue Button)
├── AdvancedFiltersModal (Vue component using PrimeVue Dialog)
│   ├── MusicStyleButtons (Vue component using PrimeVue Button/ToggleButton)
│   ├── LocationButtons (Vue component using PrimeVue Button/ToggleButton)
│   └── AvailabilityFilter (Vue component using PrimeVue Calendar)
├── DJList (Vue component)
│   ├── DJCard (Vue component using PrimeVue Card) - multiple instances
│   └── SkeletonLoader (Vue component using PrimeVue Skeleton) - during loading
└── LoadMoreButton (Vue component using PrimeVue Button)
```

## 4. Component Details

### HomePage (Astro page)

- **Component description:** Main application page connecting all sections and managing global search state
- **Main elements:** Container with integrated hero section, search form, results list and pagination
- **Supported interactions:** Data initialization, global state management
- **Supported validation:** URL parameter validation on first load
- **Types:** UsersListResponseDto, UsersQueryParams, HomePageState
- **Props:** None (main container)

### HeroWithSearch

- **Component description:** Integrated welcome section containing platform description and main search by artist name, always available to the user
- **Main elements:** h1 header, platform description, SearchInput, FiltersButton ("Advanced Filters"), CTA buttons ("Find DJ", "I'm a DJ")
- **Supported interactions:** Typing in search field, clicking navigation buttons, opening filters modal
- **Supported validation:** Search text length validation (min 2 characters)
- **Types:** SearchState, string (search query)
- **Props:**
  - `searchQuery: string`
  - `loading: boolean`
  - `onSearchChange: (query: string) => void`
  - `onFiltersClick: () => void`

### SearchInput

- **Component description:** Text field for searching by artist name with debouncing, always visible and available (uses PrimeVue InputText)
- **Main elements:** PrimeVue InputText with search icon, clear button, loading indicator
- **Supported interactions:** Text typing, field clearing, Enter key handling
- **Supported validation:** Minimum 2 characters for search activation, maximum 100 characters
- **Types:** string, ValidationError
- **Props:**
  - `modelValue: string`
  - `placeholder: string`
  - `loading: boolean`
  - `debounceMs: number` (default: 300)

### FiltersButton

- **Component description:** Button opening modal with advanced filtering options, with active filters counter (uses PrimeVue Button)
- **Main elements:** PrimeVue Button with filter icon, Badge with active filters count
- **Supported interactions:** Click opens modal, hover shows tooltip with active filters
- **Supported validation:** Check if there are active filters to display badge
- **Types:** number (active filters count)
- **Props:**
  - `activeFiltersCount: number`
  - `onClick: () => void`

### AdvancedFiltersModal

- **Component description:** Modal window with all advanced filtering options in the form of easy-to-use buttons and controls (uses PrimeVue Dialog)
- **Main elements:** PrimeVue Dialog with sections: MusicStyleButtons, LocationButtons, AvailabilityFilter, Apply/Clear/Cancel buttons
- **Supported interactions:** Opening/closing modal, applying filters, clearing filters, canceling changes
- **Supported validation:**
  - Check if selected styles exist in available options
  - Date range validation (from <= to)
  - Check if selected locations exist in data
- **Types:** AdvancedFiltersState, MusicStyleButton[], LocationButton[], ValidationErrors
- **Props:**
  - `visible: boolean`
  - `filters: AdvancedFiltersState`
  - `musicStyles: MusicStyleButton[]`
  - `locations: LocationButton[]`
  - `loading: boolean`
  - `onClose: () => void`
  - `onApply: (filters: AdvancedFiltersState) => void`
  - `onClear: () => void`

### MusicStyleButtons

- **Component description:** "Vibes" section with large music style cards inspired by music app design, enabling multiple style selection through attractive, colorful cards (uses PrimeVue ToggleButton or Button)
- **Main elements:** Grid of large cards with style names, characteristic colors and graphics, DJ counters, selection indicators, "Select All"/"Clear All" buttons
- **Supported interactions:** Toggle single style by clicking card, select all, clear all, search in styles, hover effects with animations
- **Supported validation:** Check if selected IDs exist in available options, maximum selections limit, visual feedback for disabled states
- **Types:** string[], MusicStyleButton[], ValidationError
- **Props:**
  - `modelValue: string[]`
  - `options: MusicStyleButton[]`
  - `loading: boolean`
  - `maxSelections?: number`
  - `displayMode: 'cards' | 'buttons'` (default: 'cards')

### LocationButtons

- **Component description:** Group of buttons for location selection (countries and cities) based on event data, with multiple selection capability (uses PrimeVue ToggleButton)
- **Main elements:** "Countries" and "Cities" sections with location buttons, event counters, search box for each section
- **Supported interactions:** Toggle countries/cities, search by location, clear selection for each category
- **Supported validation:** Check if selected locations exist in event data, validate country-city dependencies
- **Types:** string[], LocationButton[], ValidationError
- **Props:**
  - `selectedCountries: string[]`
  - `selectedCities: string[]`
  - `countryOptions: LocationButton[]`
  - `cityOptions: LocationButton[]`
  - `loading: boolean`
  - `onCountriesChange: (countries: string[]) => void`
  - `onCitiesChange: (cities: string[]) => void`

### AvailabilityFilter

- **Component description:** Pair of date fields for checking DJ availability in specified range with calendar (uses PrimeVue Calendar)
- **Main elements:** Two PrimeVue Calendar components (from/to), quick selection buttons (This Weekend, Next Week, Next Month)
- **Supported interactions:** Date selection from calendar, date typing, using preset buttons, clearing dates
- **Supported validation:**
  - YYYY-MM-DD format
  - available_from <= available_to
  - Dates cannot be in the past
  - Maximum range 1 year
- **Types:** string (ISO date), ValidationError, DatePreset[]
- **Props:**
  - `availableFrom: string`
  - `availableTo: string`
  - `onFromChange: (date: string) => void`
  - `onToChange: (date: string) => void`

### DJList

- **Component description:** Search results list of DJs with loading states and empty results handling
- **Main elements:** Grid/list container with DJCard components, SkeletonLoader during loading, EmptyState when no results
- **Supported interactions:** Scroll to element, refresh list, hover effects on cards
- **Supported validation:** Check if there are results to display, validate DJ data
- **Types:** UserListItemDto[], boolean (loading), string (error)
- **Props:**
  - `djs: UserListItemDto[]`
  - `loading: boolean`
  - `error: string | null`
  - `searchQuery: string` (for highlighting)

### DJCard

- **Component description:** Single DJ card with basic information and profile link (uses PrimeVue Card)
- **Main elements:** PrimeVue Card container with avatar, artist name, biography (shortened), music styles list, upcoming events count, social links
- **Supported interactions:** Click leads to DJ profile, hover effects, click on social links
- **Supported validation:** Check if required fields are filled, validate social URLs
- **Types:** UserListItemDto
- **Props:**
  - `dj: UserListItemDto`
  - `searchQuery?: string` (for highlighting)

### LoadMoreButton

- **Component description:** Button for loading next pages of results with infinite scrolling support (uses PrimeVue Button)
- **Main elements:** PrimeVue Button with loading state, information about remaining results
- **Supported interactions:** Click loads next page, scroll-to-load handling on mobile
- **Supported validation:** Check pagination.has_next before showing, check if not loading
- **Types:** PaginationDto, boolean (loading)
- **Props:**
  - `pagination: PaginationDto`
  - `loading: boolean`
  - `onLoadMore: () => void`

### SkeletonLoader

- **Component description:** Placeholder displayed during results loading, mimicking DJCard structure (uses PrimeVue Skeleton)
- **Main elements:** PrimeVue Skeleton components mimicking DJCard structure
- **Supported interactions:** None
- **Supported validation:** None
- **Types:** number (count)
- **Props:**
  - `count: number` (how many skeletons to display)

## 5. Types

### SearchState (ViewModel)

```typescript
interface SearchState {
  query: string; // Search by artist name
  selectedMusicStyles: string[]; // Array of selected music style IDs
  selectedCountries: string[]; // Array of selected countries
  selectedCities: string[]; // Array of selected cities
  availableFrom: string; // Availability date from (YYYY-MM-DD)
  availableTo: string; // Availability date to (YYYY-MM-DD)
}
```

### HomePageState (ViewModel)

```typescript
interface HomePageState {
  djs: UserListItemDto[]; // List of DJs from API
  pagination: PaginationDto; // Pagination metadata
  loading: boolean; // Loading state
  error: string | null; // Error message
  searchState: SearchState; // Current search state
  modalOpen: boolean; // Whether filters modal is open
  initialLoad: boolean; // Whether this is first load
}
```

### AdvancedFiltersState (ViewModel)

```typescript
interface AdvancedFiltersState {
  selectedMusicStyles: string[]; // Selected music styles
  selectedCountries: string[]; // Selected countries
  selectedCities: string[]; // Selected cities
  availableFrom: string; // Availability date from
  availableTo: string; // Availability date to
}
```

### MusicStyleButton (ViewModel)

```typescript
interface MusicStyleButton {
  id: string; // Music style ID
  name: string; // Style name for display
  count: number; // Number of DJs playing this style
  selected: boolean; // Whether style is selected
  color: string; // Main card color (hex)
  gradientColors?: string[]; // Optional gradient colors
  icon?: string; // Optional icon or emoji
  image?: string; // Optional background image URL
}
```

### LocationButton (ViewModel)

```typescript
interface LocationButton {
  value: string; // Location name (country or city)
  count: number; // Number of events in this location
  selected: boolean; // Whether location is selected
  type: 'country' | 'city'; // Location type
}
```

### ValidationError (ViewModel)

```typescript
interface ValidationError {
  field: string; // Field name with error
  message: string; // Error message
}
```

### ApiCallState (ViewModel)

```typescript
interface ApiCallState {
  loading: boolean; // Whether API call is in progress
  error: string | null; // API error
  lastCall: Date | null; // Last call timestamp
}
```

### DatePreset (ViewModel)

```typescript
interface DatePreset {
  label: string; // Preset label (e.g. "This Weekend")
  from: string; // Start date
  to: string; // End date
}
```

## 6. State Management

State will be managed globally using Pinia store for better organization and ability to share state between components.

### Pinia Store - useHomeStore:

```typescript
// src/stores/home.store.ts
import { defineStore } from 'pinia';
import type {
  HomePageState,
  SearchState,
  AdvancedFiltersState,
  UserListItemDto,
  UsersListResponseDto,
  MusicStyleButton,
  LocationButton,
} from '../types';

export const useHomeStore = defineStore('home', () => {
  // State
  const state = reactive<HomePageState>({
    djs: [],
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      total_pages: 0,
      has_next: false,
      has_prev: false,
    },
    loading: false,
    error: null,
    searchState: {
      query: '',
      selectedMusicStyles: [],
      selectedCountries: [],
      selectedCities: [],
      availableFrom: '',
      availableTo: '',
    },
    modalOpen: false,
    initialLoad: true,
  });

  const musicStyles = ref<MusicStyleButton[]>([]);
  const musicStylesLoading = ref(false);
  const locations = ref<{
    countries: LocationButton[];
    cities: LocationButton[];
  }>({
    countries: [],
    cities: [],
  });
  const locationsLoading = ref(false);

  // Getters
  const hasResults = computed(() => state.djs.length > 0);
  const canLoadMore = computed(
    () => state.pagination.has_next && !state.loading
  );
  const isFiltered = computed(() => {
    const {
      query,
      selectedMusicStyles,
      selectedCountries,
      selectedCities,
      availableFrom,
      availableTo,
    } = state.searchState;
    return (
      query ||
      selectedMusicStyles.length > 0 ||
      selectedCountries.length > 0 ||
      selectedCities.length > 0 ||
      availableFrom ||
      availableTo
    );
  });
  const activeFiltersCount = computed(() => {
    const {
      selectedMusicStyles,
      selectedCountries,
      selectedCities,
      availableFrom,
      availableTo,
    } = state.searchState;
    let count = 0;
    if (selectedMusicStyles.length > 0) count++;
    if (selectedCountries.length > 0) count++;
    if (selectedCities.length > 0) count++;
    if (availableFrom || availableTo) count++;
    return count;
  });

  // Actions
  const searchDJs = async (resetPagination = true) => {
    try {
      state.loading = true;
      state.error = null;

      const params = buildApiParams(
        state.searchState,
        resetPagination ? 1 : state.pagination.page + 1
      );

      const response = await fetch(`/api/users?${new URLSearchParams(params)}`);

      if (!response.ok) throw new Error('Failed to fetch DJs');

      const data: UsersListResponseDto = await response.json();

      if (resetPagination) {
        state.djs = data.data;
      } else {
        state.djs.push(...data.data);
      }

      state.pagination = data.pagination;
      state.initialLoad = false;
    } catch (error) {
      state.error = 'Error while searching for DJs';
    } finally {
      state.loading = false;
    }
  };

  const updateSearchQuery = (query: string) => {
    state.searchState.query = query;
    searchDJs(true);
  };

  const updateAdvancedFilters = (filters: AdvancedFiltersState) => {
    Object.assign(state.searchState, filters);
    state.modalOpen = false;
    searchDJs(true);
  };

  const resetFilters = () => {
    state.searchState = {
      query: '',
      selectedMusicStyles: [],
      selectedCountries: [],
      selectedCities: [],
      availableFrom: '',
      availableTo: '',
    };
    searchDJs(true);
  };

  const toggleModal = () => {
    state.modalOpen = !state.modalOpen;
  };

  const loadMore = () => {
    if (canLoadMore.value) {
      searchDJs(false);
    }
  };

  const fetchMusicStyles = async () => {
    try {
      musicStylesLoading.value = true;
      const response = await fetch('/api/music-styles');

      if (!response.ok) throw new Error('Failed to fetch music styles');

      const data = await response.json();
      musicStyles.value = data.data.map((style: any) => ({
        id: style.id,
        name: style.style_name,
        count: style.user_count,
        selected: state.searchState.selectedMusicStyles.includes(style.id),
      }));
    } catch (error) {
      console.error('Error fetching music styles:', error);
    } finally {
      musicStylesLoading.value = false;
    }
  };

  const fetchLocations = async () => {
    try {
      locationsLoading.value = true;
      const response = await fetch('/api/events');

      if (!response.ok) throw new Error('Failed to fetch locations');

      const data = await response.json();
      const locationCounts = extractLocationCounts(data.data);

      locations.value = {
        countries: locationCounts.countries.map((loc) => ({
          value: loc.name,
          count: loc.count,
          selected: state.searchState.selectedCountries.includes(loc.name),
          type: 'country' as const,
        })),
        cities: locationCounts.cities.map((loc) => ({
          value: loc.name,
          count: loc.count,
          selected: state.searchState.selectedCities.includes(loc.name),
          type: 'city' as const,
        })),
      };
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      locationsLoading.value = false;
    }
  };

  return {
    // State
    state: readonly(state),
    musicStyles: readonly(musicStyles),
    musicStylesLoading: readonly(musicStylesLoading),
    locations: readonly(locations),
    locationsLoading: readonly(locationsLoading),

    // Getters
    hasResults,
    canLoadMore,
    isFiltered,
    activeFiltersCount,

    // Actions
    searchDJs,
    updateSearchQuery,
    updateAdvancedFilters,
    resetFilters,
    toggleModal,
    loadMore,
    fetchMusicStyles,
    fetchLocations,
  };
});
```

### Helper composables:

- **useDebouncedSearch composable:** Hook for search debouncing
- **useUrlSync composable:** Synchronization of Pinia state with URL parameters
- **useLocationExtractor composable:** Location extraction from event data

### URL Synchronization:

- Filters will be synchronized with URL query parameters through useUrlSync composable
- This will enable bookmarking and sharing search results
- Browser history will reflect filter changes
- Store will be updated based on URL changes

## 7. API Integration

### GET /api/users

**Request type:** `UsersQueryParams`

```typescript
interface UsersQueryParams {
  search?: string; // Full-text search
  music_styles?: string; // List of style IDs separated by commas
  location?: string; // Search in event locations
  available_from?: string; // Date from (YYYY-MM-DD)
  available_to?: string; // Date to (YYYY-MM-DD)
  page?: number; // Page number (default: 1)
  limit?: number; // Limit per page (default: 20, max: 100)
}
```

**Response type:** `UsersListResponseDto`

### GET /api/music-styles

**Request type:** `MusicStylesQueryParams`
**Response type:** `MusicStylesListResponseDto`

### GET /api/events

**Request type:** `EventsQueryParams` (for location extraction)
**Response type:** `EventsListResponseDto`

### Call implementation:

```typescript
// In useHomeStore
const searchDJs = async (resetPagination = true) => {
  try {
    state.loading = true;
    state.error = null;

    const params = buildApiParams(
      state.searchState,
      resetPagination ? 1 : state.pagination.page + 1
    );
    const response = await fetch(`/api/users?${new URLSearchParams(params)}`);

    if (!response.ok) throw new Error('Failed to fetch DJs');

    const data: UsersListResponseDto = await response.json();

    if (resetPagination) {
      state.djs = data.data;
    } else {
      state.djs.push(...data.data);
    }

    state.pagination = data.pagination;
  } catch (error) {
    state.error = 'Error while searching for DJs';
  } finally {
    state.loading = false;
  }
};
```

## 8. User Interactions

### Text search:

1. User types text in SearchInput in HeroWithSearch
2. 300ms debouncing delays API call
3. After 2+ characters, request is sent with `search` parameter
4. Results replace current list (pagination reset)
5. URL is updated with new search parameter

### Opening advanced filters:

1. User clicks "Advanced Filters" button in HeroWithSearch
2. AdvancedFiltersModal opens
3. Modal displays current filter state with editing capability
4. Badge on button shows number of active filters

### Music style filtering:

1. User clicks style buttons in MusicStyleButtons
2. Toggle selection in selectedMusicStyles
3. Active filters counter updates
4. After clicking "Apply" modal closes and calls API

### Location filtering:

1. User clicks country/city buttons in LocationButtons
2. Toggle selection in selectedCountries/selectedCities
3. Ability to search within available locations
4. Country-city dependency validation

### Availability filtering:

1. User selects date range in AvailabilityFilter
2. Validation: from <= to, dates not in past
3. Ability to use preset buttons (This Weekend, Next Week)
4. API call with `available_from` and `available_to` parameters

### Pagination (Load More):

1. User clicks LoadMoreButton
2. Check `pagination.has_next`
3. API call with `page = currentPage + 1`
4. New results are added to existing list
5. Pagination metadata update

### Navigation to DJ profile:

1. User clicks on DJCard
2. Navigation to `/dj/{artist-name}` (SEO-friendly URL)
3. Passing DJ ID as parameter

## 9. Conditions and Validation

### SearchInput:

- **Condition:** Minimum 2 characters for search activation
- **Component:** SearchInput
- **UI Impact:** Search button deactivation, hint text display
- **Validation:** `value.length >= 2 || value.length === 0`

### MusicStyleButtons:

- **Condition:** Selected IDs must exist in available options, maximum selection limit
- **Component:** MusicStyleButtons
- **UI Impact:** Highlight invalid selections, error message display, disable additional selections when limit reached
- **Validation:** `selectedIds.every(id => availableOptions.some(opt => opt.id === id))`

### LocationButtons:

- **Condition:** Selected locations must exist in event data, country-city dependency validation
- **Component:** LocationButtons
- **UI Impact:** Highlight invalid selections, filter cities based on selected countries
- **Validation:** `selectedLocations.every(loc => availableLocations.includes(loc))`

### AvailabilityFilter:

- **Condition:** available_from <= available_to, dates not in past, maximum range 1 year
- **Component:** AvailabilityFilter
- **UI Impact:** Highlight invalid dates, display error messages, disable apply button
- **Validation:**
  ```typescript
  const isValidDateRange = (from: string, to: string) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const today = new Date();
    const oneYearFromNow = new Date(
      today.getFullYear() + 1,
      today.getMonth(),
      today.getDate()
    );
    return fromDate >= today && fromDate <= toDate && toDate <= oneYearFromNow;
  };
  ```

### AdvancedFiltersModal:

- **Condition:** Combined validation of all filters before applying
- **Component:** AdvancedFiltersModal
- **UI Impact:** Disable "Apply" button when validation errors exist, display error summary
- **Validation:** Aggregation of validation from all child components

### LoadMoreButton:

- **Condition:** pagination.has_next === true and no active loading
- **Component:** LoadMoreButton
- **UI Impact:** Hide button when no more pages, display remaining results information
- **Validation:** `pagination.has_next && !loading`

### DJList:

- **Condition:** Check if there are results to display
- **Component:** DJList
- **UI Impact:** Display EmptyState component when no results
- **Validation:** `djs.length > 0 || loading`

## 10. Error Handling

### API errors (4xx, 5xx):

- **Handling:** Toast notification with error message
- **Action:** Retry button in toast
- **Fallback:** Keep previous results if available

### Validation errors (400):

- **Handling:** Inline error messages at appropriate fields
- **Action:** Highlight invalid fields
- **Fallback:** Disable submit until fixed

### Network errors (timeout, offline):

- **Handling:** Offline indicator in header
- **Action:** Automatic retry after connection returns
- **Fallback:** Cache last results in localStorage

### No results:

- **Handling:** EmptyState component with suggestions
- **Action:** "Clear filters" button, "Browse all DJs" link
- **Fallback:** Display popular DJs

### Music styles loading errors:

- **Handling:** Fallback to basic styles list
- **Action:** Retry button in MusicStyleButtons
- **Fallback:** Disable music style filtering

### Location loading errors:

- **Handling:** Fallback to text input instead of buttons
- **Action:** Retry button in LocationButtons
- **Fallback:** Basic text filtering by location

### Search timeout:

- **Handling:** Loading timeout after 10 seconds
- **Action:** "Try again" button
- **Fallback:** Display cached results if available

### Filter modal errors:

- **Handling:** Fallback to inline filters if modal cannot open
- **Action:** Message about advanced filters problem
- **Fallback:** Basic filtering in main view

## 11. Implementation Steps

1. **File structure preparation:**

   - Create `src/pages/index.astro`
   - Create folders `src/features/home/`, `src/shared/components/` and `src/shared/composables/`
   - Add types to `src/features/home/types/index.ts`
   - Create `src/stores/home.store.ts`

2. **Pinia store implementation:**

   - `useHomeStore` - main state management
   - Actions for search, filtering and pagination
   - Getters for computed values

3. **Helper composables implementation:**

   - `useDebouncedSearch` - debouncing for search input
   - `useUrlSync` - store synchronization with URL parameters
   - `useLocationExtractor` - location extraction from events

4. **Basic components implementation:**

   - HeroWithSearch (integrated component)
   - SearchInput with debouncing and store integration (using PrimeVue InputText)
   - FiltersButton with active filters counter (using PrimeVue Button)
   - SkeletonLoader (reusable component using PrimeVue Skeleton)
   - EmptyState component

5. **Filtering components implementation:**

   - AdvancedFiltersModal as container for all filters (using PrimeVue Dialog)
   - MusicStyleButtons with buttons instead of select (using PrimeVue ToggleButton)
   - LocationButtons with country and city buttons (using PrimeVue ToggleButton)
   - AvailabilityFilter with date validation and preset buttons (using PrimeVue Calendar)

6. **Results components implementation:**

   - DJCard with responsive design and profile link (using PrimeVue Card)
   - DJList with grid layout and state handling
   - LoadMoreButton with pagination integration (using PrimeVue Button)

7. **API integration and error handling:**

   - API calls implementation in store actions
   - Centralized error handling
   - Response transformation

8. **HomePage implementation (Astro):**

   - Server-side rendering of first page
   - Vue components hydration with Pinia
   - SEO meta tags and structured data

9. **Responsiveness implementation:**

   - Mobile-first approach for all components
   - Responsive breakpoints and touch-friendly interactions
   - Modal adaptation for mobile devices

10. **Accessibility implementation:**

    - ARIA labels and keyboard navigation
    - Screen reader support and focus management
    - Color contrasts and text sizes

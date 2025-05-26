# UI Architecture for Techno Ambassador

## 1. UI Structure Overview

Techno Ambassador is a calendar platform for DJs built on Astro 5 with Vue 3 components for interactivity. The UI architecture uses PrimeVue as the main component library, Tailwind 4 for styling, and a mobile-first approach with progressive enhancement. The structure is based on two main user groups: DJs managing their profiles and calendars, and fans/event organizers browsing and searching for artists.

## 2. View List

### 2.1 Homepage (/)

- **Main goal**: Entry point to the platform with central DJ search functionality
- **Key information**: Hero section with platform description, DJ search, default results list display
- **Key components**:
  - Hero section with platform description
  - SearchFilters (DJ name, music style)
  - DJList with DJCard components
  - LoadMoreButton for pagination
- **UX/Accessibility/Security**:
  - Debouncing (300ms) for search
  - Skeleton loading for results
  - ARIA labels for search
  - Public access without authorization

### 2.2 DJ List (/djs)

- **Main goal**: Complete list of all DJs with advanced filters
- **Key information**: Complete DJ list, filters by location, music style, availability, name
- **Key components**:
  - AdvancedSearchFilters (all filtering options)
  - DJList in list format (no grid view)
  - FilterSidebar on desktop, FilterDrawer on mobile
  - Pagination with load more button
- **UX/Accessibility/Security**:
  - Responsive filters with PrimeVue Sidebar on mobile
  - Keyboard navigation for filters
  - Empty state "No data found"
  - Real-time results update

### 2.3 DJ Profile (/dj/{artist-name})

- **Main goal**: Detailed DJ information and event calendar
- **Key information**: Biography, music styles, social media, event list (upcoming and past)
- **Key components**:
  - DJProfileHeader (photo, name, biography)
  - MusicStylesList
  - SocialMediaLinks (direct links)
  - EventsList (split into upcoming/past)
  - ContactSection
- **UX/Accessibility/Security**:
  - SEO-friendly URL structure
  - Direct links to social media (no modals)
  - Screen reader support for all sections
  - Public access

### 2.4 DJ Registration (/register)

- **Main goal**: Creating a new DJ account in the system
- **Key information**: Registration form with required fields
- **Key components**:
  - RegistrationForm (artist name, biography, music styles)
  - MusicStyleSelector
  - SocialMediaInputs
  - FormValidation
- **UX/Accessibility/Security**:
  - Inline validation with real-time feedback
  - Artist name uniqueness validation
  - WCAG compliance for forms
  - Supabase Auth integration

### 2.5 Login (/login)

- **Main goal**: Authorization of existing users
- **Key information**: Login form
- **Key components**:
  - LoginForm
  - AuthErrorHandling
  - RedirectLogic
- **UX/Accessibility/Security**:
  - Focus management
  - Error handling with PrimeVue Toast
  - Secure authentication with Supabase
  - Redirect after successful login

### 2.6 DJ Dashboard (/dashboard)

- **Main goal**: Main management panel for DJs
- **Key information**: Event calendar (main element), basic profile management
- **Key components**:
  - DashboardSidebar (navigation)
  - EventsCalendarOverview (at the top)
  - ProfileManagementSection (at the bottom)
  - QuickActions
- **UX/Accessibility/Security**:
  - Sidebar navigation with collapsible menu on mobile
  - Calendar as the most important element
  - No statistics in MVP
  - Authorization required (RLS)

### 2.7 Event Management (/dashboard/events)

- **Main goal**: CRUD operations on DJ events
- **Key information**: Event list with editing options, form for adding new events
- **Key components**:
  - EventsList (with edit/delete options)
  - AddEventForm
  - EditEventForm
  - EventValidation
- **UX/Accessibility/Security**:
  - Real-time date validation (future only)
  - Inline validation
  - PrimeVue Calendar component
  - No bulk actions in MVP
  - Only own events (RLS)

### 2.8 Profile Editing (/dashboard/profile)

- **Main goal**: Updating DJ profile information
- **Key information**: Edit form for all profile data
- **Key components**:
  - ProfileEditForm
  - MusicStyleSelector
  - SocialMediaInputs
  - ProfilePreview
- **UX/Accessibility/Security**:
  - Standard forms without preview
  - Inline validation
  - Required field validation
  - Only own profile (RLS)

## 3. User Journey Map

### 3.1 Fan/Event Organizer Path

1. **Homepage** → Enter DJ name or select music style (US-010, US-012, US-021)
2. **Search Results** → Browse DJ list, apply filters (US-008, US-009, US-010, US-011, US-012)
3. **DJ Profile** → Check biography, event calendar (US-013, US-014)
4. **Contact** → Click social media link, go to external platform (US-015)

### 3.2 DJ Path - First Visit

1. **Homepage** → Click "I'm a DJ" (US-021)
2. **Registration** → Fill out profile data form (US-001)
3. **Dashboard** → Review main panel (US-003, US-007)
4. **Event Management** → Add first events to calendar (US-004)
5. **Profile Editing** → Complete additional information (US-002)

### 3.3 DJ Path - Returning User

1. **Login** → System authorization
2. **Dashboard** → Review calendar and updates (US-003, US-007)
3. **Event Management** → Add/edit events (US-004, US-005, US-006)
4. **Profile Editing** → Update information as needed (US-002)

### 3.4 General Browsing Path

1. **Homepage** → Browse default DJ list (US-008, US-021)
2. **DJ List** → Use advanced filters (US-008, US-009, US-010, US-011)
3. **DJ Profile** → Detailed information about selected artist (US-013, US-014)
4. **Return to List** → Continue browsing (US-008)

## 4. Layout and Navigation Structure

### 4.1 Main Navigation (MenuBar with PrimeVue)

- **Desktop**: Horizontal navigation bar with logo, main menu, login buttons
- **Mobile**: Hamburger menu with collapsible navigation
- **Elements**:
  - Logo (link to homepage)
  - "Find DJ" (link to DJ list)
  - "I'm a DJ" (link to registration/dashboard)
  - Login/User profile

### 4.2 Dashboard Navigation (Sidebar)

- **Desktop**: Fixed sidebar on the left side
- **Mobile**: Collapsible sidebar with overlay
- **Elements**:
  - Dashboard (overview)
  - Event Management
  - Profile Editing
  - Account Settings
  - Logout

### 4.3 Breadcrumbs

- Implemented on deeper navigation levels
- Especially in dashboard and edit forms
- Format: Homepage > Dashboard > Event Management

### 4.4 Bottom Navigation (Mobile)

- To be determined during implementation
- Potential elements: Homepage, Search, Dashboard (for DJs)

## 5. Key Components

### 5.1 DJCard

- **Purpose**: Present basic DJ information in lists
- **Content**: Artist name, music styles, next event, profile link
- **Usage**: Homepage, DJ list
- **Features**: Hover effects, responsive design, accessibility support

### 5.2 EventCard

- **Purpose**: Display single event information
- **Content**: Event name, location, date, time
- **Usage**: DJ profiles, dashboard, event management
- **Features**: Status (upcoming/past), edit options for owner

### 5.3 SearchFilters

- **Purpose**: Filter DJ list
- **Content**: Text field (name), selector (music styles), location and availability filters
- **Usage**: Homepage, DJ list
- **Features**: Debouncing, real-time results, clear filters

### 5.4 EventForm

- **Purpose**: Add and edit events
- **Content**: Event name, location (country, city, venue), date, time
- **Usage**: Event management
- **Features**: Real-time validation, date picker with constraints, inline errors

### 5.5 ProfileForm

- **Purpose**: Create and edit DJ profiles
- **Content**: Artist name, biography, music styles, social media
- **Usage**: Registration, profile editing
- **Features**: Multi-select for styles, URL validation, character counters

### 5.6 Navigation

- **Purpose**: Main application navigation
- **Content**: Logo, main menu, user actions
- **Usage**: All pages
- **Features**: Responsive design, active states, accessibility

### 5.7 DashboardSidebar

- **Purpose**: Navigation in DJ panel
- **Content**: Dashboard options menu, user info, logout
- **Usage**: All dashboard pages
- **Features**: Collapsible on mobile, active states, role-based visibility

### 5.8 LoadingStates

- **Purpose**: Skeleton loading for different content types
- **Content**: Skeleton for lists, cards, forms
- **Usage**: All pages with dynamic content
- **Features**: PrimeVue Skeleton component, responsive placeholders

### 5.9 ErrorHandling

- **Purpose**: Error handling and messaging
- **Content**: Toast messages, error boundaries, empty states
- **Usage**: Entire application
- **Features**: PrimeVue Toast, Message components, graceful degradation

### 5.10 AuthGuard

- **Purpose**: Protect routes requiring authorization
- **Content**: Authorization state checking, redirects
- **Usage**: Dashboard and all protected routes
- **Features**: Supabase Auth integration, automatic redirects, session management

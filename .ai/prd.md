# Product Requirements Document (PRD) - Techno Ambassador

## 1. Product Overview

Techno Ambassador is a global calendar platform dedicated to DJs that enables artists to showcase their availability and upcoming events while allowing fans and event organizers to discover and contact DJs for booking performances.

The platform connects three main user groups:

- DJs (artists) managing their calendars
- Fans seeking information about their favorite artists' performances
- Event organizers looking for DJs for their events

The system provides a simple way to manage performance calendars and search for artists by location, music style, and availability.

## 2. User Problem

Currently, DJs lack a centralized tool to showcase their availability and upcoming performances. Fans and event organizers have difficulties with:

- Finding information about DJ availability for specific dates
- Discovering new artists in their area
- Checking performance schedules of favorite DJs
- Contacting artists for potential bookings

DJs, on the other hand, struggle with:

- Lack of platform to showcase their schedule
- Difficulties in reaching potential clients
- Need to manage multiple communication channels
- Lack of tools for professional presentation of their availability

## 3. Functional Requirements

### 3.1 DJ Profile Management

- Creating and editing DJ profiles with mandatory fields: biography and music styles
- Adding social media links (Instagram/Facebook) as contact method
- Optional profile photo upload
- Presentation of music style and biographical information

### 3.2 Calendar System

- Displaying calendar as a simple list of events
- Planning horizon: one year ahead
- Preserving event history for portfolio purposes
- Adding events with fields: name, location, date and time
- Editing and deleting future events
- Public access to all calendar information

### 3.3 Search and Filtering

- Page with list of all DJs
- Filtering by: location, music style, availability on specific dates, DJ name
- Text search by artist name
- Browsing DJ profiles with calendars

### 3.4 Platform and Accessibility

- Support for web and mobile applications
- Global availability without geographic restrictions
- SEO-friendly URL structure (e.g., /dj/dj-name)

## 4. Product Boundaries

### 4.1 Features NOT included in MVP:

- Social features (comments, likes, sharing)
- Event organizer accounts
- Automatic event addition from external sources
- Interactive planning calendar (only simple date selection)
- User verification process
- Conflict resolution for overlapping events
- Marking unavailable days
- Editing or deleting past events
- Internal messaging system
- Payment or booking system
- Integration with external calendars (in MVP)

### 4.2 Technical Limitations:

- No real-time conflict resolution
- DJs responsible for managing overlapping events
- Simple, form-based event creation method
- Contact exclusively through social media

## 5. User Stories

### Group: DJ Registration and Profile Management

#### US-001: Creating DJ Profile

Title: Registration of new DJ in the system
Description: As a DJ I want to create my profile in the system so I can showcase my skills and performance calendar.
Acceptance Criteria:

- System enables profile creation with mandatory fields: artist name, biography, at least one music style after registration
- Ability to add Instagram and/or Facebook links after profile creation
- After profile creation, DJ is redirected to profile management page
- Profile is immediately visible on the list of all DJs

#### US-002: Editing DJ Profile

Title: Updating profile information
Description: As a DJ I want to be able to edit information in my profile to keep it current and attractive.
Acceptance Criteria:

- Ability to edit biography, music styles, and social media links
- Ability to change or add profile photo
- Validation of required fields during saving
- Changes are immediately visible in public profile
- System notifies about successful save

#### US-003: Viewing Own Profile

Title: Profile preview from user perspective
Description: As a DJ I want to see how my profile looks from visitors' perspective to evaluate its attractiveness.
Acceptance Criteria:

- Ability to switch to public view of own profile
- View identical to what other users see
- Easy return to management panel
- Display of all information: biography, styles, calendar, social links

### Group: DJ Calendar Management

#### US-004: Adding New Event

Title: Adding performance to calendar
Description: As a DJ I want to add a new event to my calendar to inform about upcoming performance.
Acceptance Criteria:

- Form with fields: event name, location, date, time
- Validation of all required fields
- Ability to select date maximum one year ahead
- Inability to add past events
- After adding, event is visible in public calendar
- Confirmation of successful event addition

#### US-005: Editing Future Event

Title: Modifying upcoming performance details
Description: As a DJ I want to be able to edit details of my future events to keep information current.
Acceptance Criteria:

- Ability to edit only future events
- Editing all fields: name, location, date, time
- Validation of entered data
- Past events are marked as non-editable
- Changes are immediately visible in public calendar

#### US-006: Deleting Future Event

Title: Removing cancelled performance
Description: As a DJ I want to be able to delete future events from calendar when performance is cancelled.
Acceptance Criteria:

- Ability to delete only future events
- Confirmation of deletion operation
- Past events cannot be deleted
- After deletion, event disappears from public calendar
- No ability to undo deletion operation

#### US-007: Viewing Own Calendar

Title: Managing performance calendar
Description: As a DJ I want to browse my calendar with management options to control my performances.
Acceptance Criteria:

- List of all events (past and future) in chronological order
- Marking of past and future events
- Edit and delete buttons for future events
- No edit options for past events
- Add new event button

### Group: Search and Browsing (Fans/Organizers)

#### US-008: Browsing List of All DJs

Title: Discovering available DJs
Description: As a fan/event organizer I want to browse the list of all DJs to find interesting artists.
Acceptance Criteria:

- List of all registered DJs
- Basic information: artist name, music styles, photo (if available)
- Link to full profile of each DJ
- Pagination for large number of DJs
- Responsive design for mobile devices

#### US-009: Filtering DJs by Music Style

Title: Searching for DJs of specific genre
Description: As a fan/organizer I want to filter DJs by music style to find artists playing preferred music.
Acceptance Criteria:

- List of available music styles to choose from
- Ability to select multiple styles simultaneously
- Filtering DJs having selected styles in profile
- Result counter for each style
- Ability to clear filters

#### US-010: Filtering DJs by Availability

Title: Finding available DJs on specific dates
Description: As an event organizer I want to check which DJs are available at a specific time.
Acceptance Criteria:

- Date range selection to check availability
- List of DJs without events in selected period
- Information about potential availability (no guarantee)
- Ability to extend date range
- Link to DJ profile for further details

#### US-011: Searching DJ by Name

Title: Finding specific DJ
Description: As a fan I want to search for a specific DJ by name to quickly find their profile.
Acceptance Criteria:

- Text search field
- Partial search (full name not required)
- List of results matching the query
- Highlighting of matching name fragments
- Direct link to found DJ profile

#### US-012: Browsing DJ Profile

Title: Detailed DJ information
Description: As a fan/organizer I want to browse DJ profile to learn their details and calendar.
Acceptance Criteria:

- Display of full biography and profile photo
- List of all music styles
- Social media links (Instagram/Facebook)
- Performance calendar as event list
- Division into upcoming events and performance history

#### US-013: Browsing DJ Calendar

Title: Checking performance schedule
Description: As a fan/organizer I want to browse DJ calendar to see their upcoming performances and availability.
Acceptance Criteria:

- List of all events in chronological order
- Clear marking of upcoming events and history
- Details of each event: name, location, date, time
- Ability to scroll between months
- Information about no events in selected period

#### US-014: Contacting DJ

Title: Establishing contact for performance
Description: As an event organizer I want to contact DJ to inquire about performance possibility.
Acceptance Criteria:

- Clearly visible social media links of DJ
- Opening links in new tabs/applications
- Information about preferred contact method
- "Quick contact" feature generating pre-filled message with event date
- Instructions for copying message to social media

### Group: Mobile Access and Responsiveness

#### US-015: Mobile Access for DJs

Title: Calendar management on mobile devices
Description: As a DJ I want to be able to manage my profile and calendar on mobile devices.
Acceptance Criteria:

- Full functionality available on mobile devices
- Responsive design adapted to small screens
- Easy adding and editing events on phone
- Quick access to most important functions
- Loading speed optimization on mobile devices

#### US-016: Mobile Browsing for Fans

Title: Searching DJs on mobile devices
Description: As a fan/organizer I want to be able to browse DJ profiles and their calendars on mobile devices.
Acceptance Criteria:

- All search functions available on mobile
- Touch filters and navigation
- Clear calendar display on small screens
- Easy switching between DJ profiles
- Quick connection to social media

### Group: Security and Data Quality

#### US-017: Secure Access and Authentication

Title: Secure Access
Description: As a user, I want to be able to register and log into the system in a way that ensures the security of my data.
Acceptance Criteria:

- Login and registration are handled on dedicated pages.
- Logging in requires providing an email address and a password.
- Registration requires providing an email address, a password, and password confirmation.
- The user **CAN** browse the list of DJs and the profile of a specific DJ.
- The user **CANNOT** use the profile editing feature without logging into the system (US-001, US-002).
- The user **CANNOT** use event management features without logging into the system (US-004, US-005, US-006).
- The user can log into the system via a button in the top-right corner.
- The user can log out of the system via a button in the top-right corner of the main `@Layout.astro`.
- External login services (e.g., Google, GitHub) are not used.
- Password recovery should be possible.

#### US-018: Profile Data Validation

Title: Ensuring minimum profile quality
Description: As a system user I want to be sure that DJ profiles contain basic required information.
Acceptance Criteria:

- Validation of mandatory biography and at least one music style
- Checking correctness of social media links
- Validation error information is clear and helpful
- Inability to save incomplete profile
- Suggesting corrections in case of errors

#### US-019: Protection Against Duplicates

Title: Avoiding DJ profile duplication
Description: As an administrator I want to prevent creation of duplicate profiles by the same DJs.
Acceptance Criteria:

- Warning when trying to create profile with existing artist name
- Suggesting similar existing profiles
- Ability to continue despite warning (no blocking)
- Information about one DJ = one profile policy
- Instructions for recovering access to existing profile

### Group: Usability and Navigation

#### US-020: Platform Navigation

Title: Intuitive navigation structure
Description: As a user I want to easily navigate the platform between different sections.
Acceptance Criteria:

- Main menu with access to: DJ list, search, DJ login
- Logo leading to homepage
- "Back" button on detail pages
- Consistent placement of navigation elements

#### US-021: Platform Homepage

Title: Platform entry point
Description: As a new user I want to understand the platform's purpose and know how to use it.
Acceptance Criteria:

- Description of platform and its main features
- Clear options: "Find DJ" and "I'm a DJ"
- Examples of DJ profiles or featured DJs
- Registration instructions for DJs
- Information about how to contact artists

## 6. Success Metrics

- 90% of DJ users have filled calendars in the current month (at least one event)
- Percentage of profiles with complete biography and music styles: 95%
- Percentage of profiles with added social media contacts: 80%

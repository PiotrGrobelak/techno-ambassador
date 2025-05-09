# Product Requirements Document (PRD) - Techno Ambassador

## 1. Product Overview

Techno Ambassador is a platform bringing together all event cycles and events related to techno music. The main purpose of the product is to enable users to check event ratings and provide ratings and comments on completed events. The system integrates event location data retrieved from Facebook using AI technology, and administrators have the ability to approve or supplement this data. The platform also enables monitoring of user activities through integration with analytical tools.

## 2. User Problem

Techno music event users do not have a central place where they could rate and comment on events, as well as learn about the details of such events. This problem causes:

- Lack of reliable event ratings, making it difficult to choose valuable events.
- Lack of opportunity to share opinions and experiences after the event ends.
- Users do not have insight into the ratings of other participants, which makes it difficult to evaluate potential events.
- Event organizers do not know in which direction to develop events.

## 3. Functional Requirements

1. User must be logged in to cast a vote and add a comment.
2. The system allows casting one vote on a completed event per user, however, the user can edit their vote without time constraints.
3. Administrator (root) has the right to add events by entering required data: date, description, and location.
4. Integration with AI for retrieving event location data from Facebook, with the possibility of approval or manual supplementation of missing information by the administrator.
5. Integration with analytical tools (e.g., Google Analytics) to monitor key success indicators.
6. The system enables registration of new users through a registration form that does not require additional verification steps, however, data entered during registration is validated to ensure secure access.

## 4. Product Boundaries

1. The system does not include advanced registration and account management mechanisms; it is limited to basic authentication.
2. The functionality of adding events is available only to the administrator (root), and users cannot submit their own events.
3. AI data integration concerns only retrieving locations from Facebook, and other event data is entered manually.
4. The system does not provide for additional user roles beyond the role of a regular user and administrator.

## 5. User Stories

US-001
Title: Account Registration
Description: As a new user, I want to be able to register my account to gain access to the full functionality of the platform, including voting and commenting on events.
Acceptance Criteria:

- The registration form should include fields: email address, username, password, password confirmation.
- Data entered in the form must be validated, including email format correctness and password consistency.
- After successful registration, the user is automatically logged in or redirected to the login page.
- In case of errors, the user receives clear error messages.

US-002
Title: User logs into the system
Description: As a user, I want to be able to log into the system to access the ability to rate events.
Acceptance Criteria:

- The user must enter correct login credentials.
- The system allows password recovery.
- Authentication is done securely.

US-003
Title: User browses the list of events
Description: As a user (both logged-in and not logged-in), I want to be able to browse the list of completed events to see their details and ratings. As a logged-in user, I can then decide which events to vote on and add comments to.
Acceptance Criteria:

- The list of events is up-to-date and contains all events.
- The user sees basic information such as date, description, and event location.
- The interface is responsive and intuitive.

US-004
Title: User casts a vote and adds a comment to the event
Description: As a logged-in user, I want to be able to cast one vote (on a scale of 1-5) on a completed event and add a comment to it to express my opinion.
Acceptance Criteria:

- The user can cast only one vote per event.
- The vote is on a scale of 1-5.
- A comment can be added simultaneously with casting a vote.
- After casting a vote, the user can edit their vote and comment without time constraints.

US-005
Title: User edits cast vote and comment
Description: As a logged-in user, I want to be able to edit my vote and comment that I have already cast to update my opinion after reflection or changes.
Acceptance Criteria:

- Vote editing is not time limited.
- The user sees the editing option for every completed event they have already voted on.
- Changes are immediately saved and visible.
- Can cast only one vote.

US-006
Title: Administrator adds a new event
Description: As an administrator, I want to be able to add a new event by entering required data such as date, description, and location to make the event publicly available.
Acceptance Criteria:

- The event addition form includes fields: date, description, location.
- Entered data is validated before saving.
- The administrator receives confirmation of event addition.

US-007
Title: Administrator approves or supplements data from AI integration
Description: As an administrator, I want to be able to approve location data retrieved from AI integration (Facebook) or supplement missing information to ensure the completeness of event data.
Acceptance Criteria:

- The system retrieves event location data from Facebook.
- If the data is incomplete, the administrator has the option to supplement it.
- After approval, the data is visible in event details.

US-008
Title: Secure user authentication
Description: As a user, I want to be sure that my data is protected when logging into the system, ensuring secure access to the application.
Acceptance Criteria:

- The system applies security when transmitting login data.
- Authentication is done using secure protocols (e.g., HTTPS).
- In case of a failed login attempt, the user receives a clear error message.

## 6. Success Metrics

1. At least 65% of logged-in users cast one vote on completed events each week.
2. At least 33% of users who cast a vote also add a comment.
3. These indicators are monitored through integration with analytical tools (e.g., Google Analytics).

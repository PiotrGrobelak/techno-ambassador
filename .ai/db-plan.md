# PostgreSQL Database Schema for Techno Ambassador

## 1. Tables

### `users`

This table is managed by Supabase Auth

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() |
| email | varchar(255) | NOT NULL, UNIQUE |
| username | varchar(100) | NOT NULL, UNIQUE |
| password_hash | varchar(255) | NOT NULL |
| role | user_role | NOT NULL, DEFAULT 'user' |
| created_at | timestamptz | NOT NULL, DEFAULT now() |
| last_login_at | timestamptz | NULL |

### `events`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() |
| title | varchar(255) | NOT NULL |
| description | text | NOT NULL |
| date | timestamptz | NOT NULL |
| status | event_status | NOT NULL, DEFAULT 'planned' |
| location_city | varchar(100) | NOT NULL |
| location_street | varchar(255) | NOT NULL |
| location_postal_code | varchar(20) | NOT NULL |
| avg_rating | numeric(3,2) | NULL |
| vote_count | integer | NOT NULL, DEFAULT 0 |
| created_at | timestamptz | NOT NULL, DEFAULT now() |
| updated_at | timestamptz | NOT NULL, DEFAULT now() |
| created_by | uuid | NOT NULL, REFERENCES users(id) |

### `votes`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() |
| event_id | uuid | NOT NULL, REFERENCES events(id) |
| user_id | uuid | NOT NULL, REFERENCES users(id) |
| rating | integer | NOT NULL, CHECK (rating BETWEEN 1 AND 5) |
| comment | varchar(500) | NULL |
| created_at | timestamptz | NOT NULL, DEFAULT now() |
| updated_at | timestamptz | NOT NULL, DEFAULT now() |


## 2. Relationships

1. **Users to Events (1:N)**
   - One administrator can create multiple events
   - Foreign key: `events.created_by` references `users.id`

2. **Users to Votes (1:N)**
   - One user can cast multiple votes (one per event)
   - Foreign key: `votes.user_id` references `users.id`

3. **Events to Votes (1:N)**
   - One event can receive multiple votes
   - Foreign key: `votes.event_id` references `events.id`

## 3. Indexes

1. **Users Table Indexes**
   - Index on `email` field for efficient user lookup during authentication
   - Index on `username` field for username searches and uniqueness checks
   - Index on `role` field for filtering users by role (admins vs. regular users)

2. **Events Table Indexes**
   - Index on `status` field for filtering events by status (planned vs. completed)
   - Index on `date` field for chronological sorting and date-based filtering
   - Index on `location_city` field for geographical filtering
   - Index on `created_by` field for finding events created by a specific administrator
   - Indexes on `avg_rating` and `vote_count` fields for sorting by popularity

3. **Votes Table Indexes**
   - Index on `event_id` field for retrieving all votes for a specific event
   - Index on `user_id` field for retrieving all votes cast by a specific user
   - Index on `rating` field for filtering votes by rating value

These indexes improve query performance for the most common access patterns while balancing the overhead of index maintenance during data modifications.

## 4. PostgreSQL Rules and Triggers

1. **Event Statistics Update Trigger**
   - Automatically updates the `avg_rating` and `vote_count` fields in the `events` table whenever votes are added, updated, or deleted
   - Calculates the average rating and count of votes for the affected event
   - Executes after INSERT, UPDATE, or DELETE operations on the `votes` table

2. **Update Timestamp Triggers**
   - Automatically updates the `updated_at` timestamp field in the `events` table whenever an event record is modified
   - Automatically updates the `updated_at` timestamp field in the `votes` table whenever a vote record is modified
   - Ensures that the last modification time is always tracked accurately

These triggers maintain data integrity and consistency by automatically updating derived fields and timestamps without requiring application code to handle these operations.

## 5. Row Level Security Policies

1. **Users Table Policies**
   - Select: All user can view all records
   - Update: Users can only update their own profile data
   - No direct insert/delete policies (handled by authentication system)

2. **Events Table Policies**
   - Select: All users (including non-authenticated) can view all events
   - Insert/Update/Delete: Only administrators have permission to add, modify, or remove events

3. **Votes Table Policies**
   - Select: All users can view all votes and associated comments
   - Insert: Authenticated users can add votes only for their own user ID
   - Update/Delete: Users can only modify or remove their own votes

These policies enforce security at the database level, ensuring that users can only access and modify data according to their role and ownership, regardless of the application logic.

## 6. Additional Notes

1. The schema leverages Supabase's authentication system, which is reflected in the RLS policies using the `auth.uid()` function.

2. The `avg_rating` and `vote_count` fields in the `events` table are denormalized for performance reasons. They are automatically maintained by triggers when votes are added, updated, or deleted.

3. The database is designed to handle approximately 600 events per year as specified in the requirements. The schema should be efficient for this scale without requiring partitioning in the initial phase.

4. For improved security, consider implementing additional validation at the application level beyond what's defined in database constraints.

5. This schema follows the 3NF (Third Normal Form) to minimize data redundancy while maintaining reasonable query performance.

6. Events are not organized into cycles or categories as specified in the requirements, but additional tables could be added later if needed.

7. The schema supports the sorting requirements mentioned in the session notes (by date, popularity, status, and city) through appropriate indexes. 
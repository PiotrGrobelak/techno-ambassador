-- Migration: Initial Database Schema for Techno Ambassador
-- Description: Creates the core tables, relationships, indexes, triggers, and RLS policies
-- Date: 2025-05-13

-- custom types
create type user_role as enum ('user', 'admin');
create type event_status as enum ('planned', 'completed', 'cancelled');

-- enable required extensions
create extension if not exists "uuid-ossp";

-- events table
create table events (
    id uuid primary key default gen_random_uuid(),
    title varchar(255) not null,
    description text not null,
    date timestamptz not null,
    status event_status not null default 'planned',
    location_city varchar(100) not null,
    location_street varchar(255) not null,
    location_postal_code varchar(20) not null,
    avg_rating numeric(3,2) null,
    vote_count integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    created_by uuid not null references auth.users(id)
);

-- create indexes for events table
create index events_status_idx on events(status);
create index events_date_idx on events(date);
create index events_location_city_idx on events(location_city);
create index events_created_by_idx on events(created_by);
create index events_avg_rating_idx on events(avg_rating);
create index events_vote_count_idx on events(vote_count);

-- votes table
create table votes (
    id uuid primary key default gen_random_uuid(),
    event_id uuid not null references events(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    rating integer not null check (rating between 1 and 5),
    comment varchar(500) null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint unique_user_event unique (user_id, event_id)
);

-- create indexes for votes table
create index votes_event_id_idx on votes(event_id);
create index votes_user_id_idx on votes(user_id);
create index votes_rating_idx on votes(rating);

-- update timestamp function
create or replace function update_modified_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- create trigger for events updated_at
create trigger set_updated_at_events
before update on events
for each row
execute function update_modified_column();

-- create trigger for votes updated_at
create trigger set_updated_at_votes
before update on votes
for each row
execute function update_modified_column();

-- function to calculate event stats after vote changes
create or replace function update_event_stats()
returns trigger as $$
declare
    event_id uuid;
begin
    -- determine which event needs updating
    if tg_op = 'DELETE' then
        event_id := old.event_id;
    else
        event_id := new.event_id;
    end if;

    -- update the event stats
    update events
    set 
        avg_rating = (select coalesce(avg(rating), null) from votes where event_id = events.id),
        vote_count = (select count(*) from votes where event_id = events.id)
    where id = event_id;
    
    return null;
end;
$$ language plpgsql;

-- create triggers for updating event stats
create trigger update_event_stats_after_insert
after insert on votes
for each row
execute function update_event_stats();

create trigger update_event_stats_after_update
after update on votes
for each row
execute function update_event_stats();

create trigger update_event_stats_after_delete
after delete on votes
for each row
execute function update_event_stats();

-- enable row level security
alter table events enable row level security;
alter table votes enable row level security;

-- Drop all RLS policies from events table
drop policy if exists "Events are viewable by anonymous users" on events;
drop policy if exists "Events are viewable by authenticated users" on events;
drop policy if exists "Only admins can create events" on events;
drop policy if exists "Only admins can update events" on events;
drop policy if exists "Only admins can delete events" on events;

-- Drop all RLS policies from votes table
drop policy if exists "Votes are viewable by anonymous users" on votes;
drop policy if exists "Votes are viewable by authenticated users" on votes;
drop policy if exists "Users can add their own votes" on votes;
drop policy if exists "Users can update their own votes" on votes;
drop policy if exists "Users can delete their own votes" on votes;

-- Disable RLS on both tables
alter table events disable row level security;
alter table votes disable row level security; 
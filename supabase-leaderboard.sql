create table if not exists public.leaderboard_scores (
    user_id uuid primary key references auth.users (id) on delete cascade,
    username text not null check (length(username) between 1 and 32),
    xp integer not null default 0 check (xp >= 0),
    updated_at timestamptz not null default now()
);

create index if not exists leaderboard_scores_ranking
    on public.leaderboard_scores (xp desc, updated_at asc);

alter table public.leaderboard_scores enable row level security;

grant select on public.leaderboard_scores to anon, authenticated;
grant insert, update on public.leaderboard_scores to authenticated;

drop policy if exists "Leaderboard scores are publicly readable"
    on public.leaderboard_scores;
create policy "Leaderboard scores are publicly readable"
    on public.leaderboard_scores for select
    using (true);

drop policy if exists "Users can add their own leaderboard score"
    on public.leaderboard_scores;
create policy "Users can add their own leaderboard score"
    on public.leaderboard_scores for insert
    to authenticated
    with check (auth.uid() = user_id);

drop policy if exists "Users can update their own leaderboard score"
    on public.leaderboard_scores;
create policy "Users can update their own leaderboard score"
    on public.leaderboard_scores for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);


-- Create revenue_ledger table
create table public.revenue_ledger (
    id uuid default gen_random_uuid() primary key,
    team_id uuid references public.teams(id),
    stripe_payment_intent_id text,
    amount_cents bigint, -- amount in cents
    currency text default 'usd',
    description text,
    created_at timestamp with time zone default now()
);

-- Enable RLS (though for now we might just allow service role to write)
alter table public.revenue_ledger enable row level security;

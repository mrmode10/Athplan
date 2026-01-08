-- Create a table to track chat interactions (WhatsApp/AI)
create table if not exists public.chat_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  query text not null,
  answer text,
  source text default 'whatsapp',
  status text default 'Answered', -- 'Answered', 'Pending', 'Failed'
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.chat_logs enable row level security;

-- Policy: Users can view their own chat logs
create policy "Users can view their own chat logs"
on public.chat_logs for select
using (auth.uid() = user_id);

-- Policy: Users can insert logs (e.g. for simulation or if the bot runs as the user)
-- In a real prod environment, this might be restricted to a service role, 
-- but for this "user owns their agent" model, allowing insert is fine.
create policy "Users can insert their own chat logs"
on public.chat_logs for insert
with check (auth.uid() = user_id);

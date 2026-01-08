-- Create a private bucket for user documents
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Set up Row Level Security (RLS) for the storage bucket
-- Policy: Users can only view/upload/delete their own files (in their own folder)
-- The folder structure is expected to be: userId/filename

create policy "Users can upload their own documents"
on storage.objects for insert
with check (
  bucket_id = 'documents' and
  auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can view their own documents"
on storage.objects for select
using (
  bucket_id = 'documents' and
  auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update their own documents"
on storage.objects for update
using (
  bucket_id = 'documents' and
  auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own documents"
on storage.objects for delete
using (
  bucket_id = 'documents' and
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create a table to track document metadata for AI usage
create table if not exists public.user_documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  filename text not null,
  file_path text not null,
  content_type text,
  size_bytes bigint,
  uploaded_at timestamptz default now(),
  
  -- Add any AI-specific columns here later (e.g., embedding status)
  embedding_status text default 'pending'
);

-- RLS for user_documents table
alter table public.user_documents enable row level security;

create policy "Users can see their own document metadata"
on public.user_documents for select
using (auth.uid() = user_id);

create policy "Users can insert their own document metadata"
on public.user_documents for insert
with check (auth.uid() = user_id);

create policy "Users can delete their own document metadata"
on public.user_documents for delete
using (auth.uid() = user_id);

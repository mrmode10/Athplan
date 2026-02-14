-- Allow authenticated users to insert into groups
create policy "Authenticated users can insert groups"
on public.groups for insert
with check (auth.role() = 'authenticated');

-- Allow authenticated users to view groups
create policy "Authenticated users can view groups"
on public.groups for select
using (auth.role() = 'authenticated');

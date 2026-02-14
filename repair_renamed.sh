#!/bin/bash

# Revert old filenames (using version numbers where possible, or full names if needed)
# Since I only have the version prefix '20260112' which was ambiguous, I might need to rely on what `db repair` accepts.
# `db repair` takes the version prefix. Since the old ones had duplicate prefixes, I might have to revert '20260112', '20260113', etc.
# But `revert` on a prefix reverts ALL entries with that prefix? 
# If I revert '20260112', it reverts all 3 files. That's actually what I want, since I'm replacing them all.

npx supabase migration repair --status reverted 20260112
npx supabase migration repair --status reverted 20260113
npx supabase migration repair --status reverted 20260126
npx supabase migration repair --status reverted 20260212

# Mark new filenames as applied
npx supabase migration repair --status applied 20260112000001
npx supabase migration repair --status applied 20260112000002
npx supabase migration repair --status applied 20260112000003
npx supabase migration repair --status applied 20260113000001
npx supabase migration repair --status applied 20260113000002
npx supabase migration repair --status applied 20260113000003
npx supabase migration repair --status applied 20260113000004
npx supabase migration repair --status applied 20260126000001
npx supabase migration repair --status applied 20260126000002
npx supabase migration repair --status applied 20260126000003
npx supabase migration repair --status applied 20260212000001
npx supabase migration repair --status applied 20260212000002
npx supabase migration repair --status applied 20260212000003
npx supabase migration repair --status applied 20260212000004

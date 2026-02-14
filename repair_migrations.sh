#!/bin/bash

# Revert migrations present on remote but missing locally
npx supabase migration repair --status reverted 20260113125357
npx supabase migration repair --status reverted 20260113125402
npx supabase migration repair --status reverted 20260113125406
npx supabase migration repair --status reverted 20260113125421
npx supabase migration repair --status reverted 20260113125427
npx supabase migration repair --status reverted 20260113125431
npx supabase migration repair --status reverted 20260113125443
npx supabase migration repair --status reverted 20260113125451
npx supabase migration repair --status reverted 20260113125452
npx supabase migration repair --status reverted 20260115150849
npx supabase migration repair --status reverted 20260126091033
npx supabase migration repair --status reverted 20260126100032
npx supabase migration repair --status reverted 20260126101042
npx supabase migration repair --status reverted 20260126101405
npx supabase migration repair --status reverted 20260130094145
npx supabase migration repair --status reverted 20260130094333
npx supabase migration repair --status reverted 20260130094753
npx supabase migration repair --status reverted 20260130095308
npx supabase migration repair --status reverted 20260209132845
npx supabase migration repair --status reverted 20260211081209
npx supabase migration repair --status reverted 20260212121501
npx supabase migration repair --status reverted 20260212122116
npx supabase migration repair --status reverted 20260212124543

# Mark local migrations as applied on remote
npx supabase migration repair --status applied 20240107_init_storage.sql
npx supabase migration repair --status applied 20240108_chat_logs.sql
npx supabase migration repair --status applied 20260112_add_plan_to_teams.sql
npx supabase migration repair --status applied 20260112_create_revenue_ledger.sql
npx supabase migration repair --status applied 20260112_create_teams.sql
npx supabase migration repair --status applied 20260113_add_increment_usage.sql
npx supabase migration repair --status applied 20260113_create_alerts.sql
npx supabase migration repair --status applied 20260113_create_legal_shield.sql
npx supabase migration repair --status applied 20260113_create_tier_logic.sql
npx supabase migration repair --status applied 20260126_phase1_bot_setup.sql
npx supabase migration repair --status applied 20260126_phase3_allow_group_insert.sql
npx supabase migration repair --status applied 20260126_phase4_unique_name_check.sql
npx supabase migration repair --status applied 20260130111000_security_fixes.sql
npx supabase migration repair --status applied 20260130133000_add_admin_column.sql
npx supabase migration repair --status applied 20260209_schedule_updates.sql
npx supabase migration repair --status applied 20260211_fix_schedule_updates_rls.sql
npx supabase migration repair --status applied 20260212_add_username.sql
npx supabase migration repair --status applied 20260212_create_churn_surveys.sql
npx supabase migration repair --status applied 20260212_unify_teams.sql

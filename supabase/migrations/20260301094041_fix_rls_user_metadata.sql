-- 1. `bot_users` table
DROP POLICY IF EXISTS "Authenticated delete bot_users" ON "public"."bot_users";
CREATE POLICY "Authenticated delete bot_users" ON "public"."bot_users" FOR DELETE TO "authenticated" 
USING ("group_name" IN (SELECT "t"."name" FROM "public"."teams" "t" JOIN "public"."users" "u" ON ("u"."team_id" = "t"."id") WHERE ("u"."id" = "auth"."uid"())));

DROP POLICY IF EXISTS "Authenticated insert bot_users" ON "public"."bot_users";
CREATE POLICY "Authenticated insert bot_users" ON "public"."bot_users" FOR INSERT TO "authenticated" 
WITH CHECK ("group_name" IN (SELECT "t"."name" FROM "public"."teams" "t" JOIN "public"."users" "u" ON ("u"."team_id" = "t"."id") WHERE ("u"."id" = "auth"."uid"())));

DROP POLICY IF EXISTS "Authenticated read bot_users" ON "public"."bot_users";
CREATE POLICY "Authenticated read bot_users" ON "public"."bot_users" FOR SELECT TO "authenticated" 
USING ("group_name" IN (SELECT "t"."name" FROM "public"."teams" "t" JOIN "public"."users" "u" ON ("u"."team_id" = "t"."id") WHERE ("u"."id" = "auth"."uid"())));

DROP POLICY IF EXISTS "Authenticated update bot_users" ON "public"."bot_users";
CREATE POLICY "Authenticated update bot_users" ON "public"."bot_users" FOR UPDATE TO "authenticated" 
USING ("group_name" IN (SELECT "t"."name" FROM "public"."teams" "t" JOIN "public"."users" "u" ON ("u"."team_id" = "t"."id") WHERE ("u"."id" = "auth"."uid"())));

-- 2. `whatsapp_users` table
DROP POLICY IF EXISTS "Authenticated users can delete team members" ON "public"."whatsapp_users";
CREATE POLICY "Authenticated users can delete team members" ON "public"."whatsapp_users" FOR DELETE TO "authenticated" 
USING ("group_name" IN (SELECT "t"."name" FROM "public"."teams" "t" JOIN "public"."users" "u" ON ("u"."team_id" = "t"."id") WHERE ("u"."id" = "auth"."uid"())));

DROP POLICY IF EXISTS "Authenticated users can insert team members" ON "public"."whatsapp_users";
CREATE POLICY "Authenticated users can insert team members" ON "public"."whatsapp_users" FOR INSERT TO "authenticated" 
WITH CHECK ("group_name" IN (SELECT "t"."name" FROM "public"."teams" "t" JOIN "public"."users" "u" ON ("u"."team_id" = "t"."id") WHERE ("u"."id" = "auth"."uid"())));

DROP POLICY IF EXISTS "Authenticated users can read team members" ON "public"."whatsapp_users";
CREATE POLICY "Authenticated users can read team members" ON "public"."whatsapp_users" FOR SELECT TO "authenticated" 
USING ("group_name" IN (SELECT "t"."name" FROM "public"."teams" "t" JOIN "public"."users" "u" ON ("u"."team_id" = "t"."id") WHERE ("u"."id" = "auth"."uid"())));

DROP POLICY IF EXISTS "Authenticated users can update team members" ON "public"."whatsapp_users";
CREATE POLICY "Authenticated users can update team members" ON "public"."whatsapp_users" FOR UPDATE TO "authenticated" 
USING ("group_name" IN (SELECT "t"."name" FROM "public"."teams" "t" JOIN "public"."users" "u" ON ("u"."team_id" = "t"."id") WHERE ("u"."id" = "auth"."uid"())));

-- 3. `teams` table
DROP POLICY IF EXISTS "Users can insert their own team" ON "public"."teams";
-- Since during insert the user might not be linked to the team yet via users table, we must handle team creation differently.
-- Usually, anyone can create a team, and the trigger handles adding the user as admin. So we allow team insert.
CREATE POLICY "Users can insert their own team" ON "public"."teams" FOR INSERT TO "authenticated" 
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own team" ON "public"."teams";
CREATE POLICY "Users can update their own team" ON "public"."teams" FOR UPDATE TO "authenticated" 
USING ("id" IN (SELECT "users"."team_id" FROM "public"."users" WHERE ("users"."id" = "auth"."uid"())));

DROP POLICY IF EXISTS "Users can view their own team" ON "public"."teams";
CREATE POLICY "Users can view their own team" ON "public"."teams" FOR SELECT TO "authenticated" 
USING ("id" IN (SELECT "users"."team_id" FROM "public"."users" WHERE ("users"."id" = "auth"."uid"())));

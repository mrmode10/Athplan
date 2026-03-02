DROP POLICY IF EXISTS "Users can insert their own team" ON "public"."teams";

CREATE POLICY "Users can insert their own team" 
ON "public"."teams" 
FOR INSERT TO "authenticated" 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE TABLE IF NOT EXISTS public.churn_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  
  -- Question 1: Financial & Value Perception
  primary_reason text,
  primary_reason_other text,
  
  -- Question 2: Usage & Lifestyle Fit
  usage_frequency text,
  usage_frequency_other text,
  
  -- Question 3: Product & Results
  goals_met text,
  goals_met_other text,
  
  -- Question 4: Experience & Support
  improvement_suggestion text,
  improvement_suggestion_other text,
  
  created_at timestamp with time zone default now()
);

ALTER TABLE public.churn_surveys ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own survey responses
CREATE POLICY "Users can insert their own survey" ON public.churn_surveys
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Allow admins (if any) to view all, but for now just insert is critical

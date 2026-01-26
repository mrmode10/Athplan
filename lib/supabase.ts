
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ppjzhesecvagtwfbvoek.supabase.co'
const supabaseKey = 'sb_publishable_CuhiPd8Q8xUXc1l44MddOA_wdLoR9c4'

export const supabase = createClient(supabaseUrl, supabaseKey)

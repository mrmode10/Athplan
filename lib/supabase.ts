
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://haicfgsgimpwnukympab.supabase.co'
const supabaseKey = 'sb_publishable_TlM38PD842aKFHGgUvmrdQ_wWrdhweW'

export const supabase = createClient(supabaseUrl, supabaseKey)

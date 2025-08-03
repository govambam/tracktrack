import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jktbmygutktbjjuzuwgq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprdGJteWd1dGt0Ympqanp1d2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzMzI1NzYsImV4cCI6MjA0ODkwODU3Nn0.WVSjYNrT7Y8vOXpkUCG_VwEVrPX8pxzLAOOLUzElCho';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

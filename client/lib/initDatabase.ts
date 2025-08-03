import { supabase } from '@/lib/supabase';

export async function ensureTablesExist() {
  const tables = [
    {
      name: 'event_courses',
      createSql: `
        CREATE TABLE IF NOT EXISTS event_courses (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
          course_id UUID DEFAULT NULL,
          name TEXT NOT NULL,
          par INTEGER DEFAULT NULL,
          yardage INTEGER DEFAULT NULL,
          description TEXT DEFAULT NULL,
          image_url TEXT DEFAULT NULL,
          weather_note TEXT DEFAULT NULL,
          display_order INTEGER DEFAULT 1,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
      `
    },
    {
      name: 'event_customization',
      createSql: `
        CREATE TABLE IF NOT EXISTS event_customization (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL UNIQUE,
          home_headline TEXT DEFAULT NULL,
          home_enabled BOOLEAN DEFAULT true,
          courses_enabled BOOLEAN DEFAULT true,
          rules_enabled BOOLEAN DEFAULT true,
          leaderboard_enabled BOOLEAN DEFAULT true,
          travel_enabled BOOLEAN DEFAULT true,
          logo_url TEXT DEFAULT NULL,
          custom_domain TEXT DEFAULT NULL,
          is_private BOOLEAN DEFAULT false NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
      `
    },
    {
      name: 'event_rules',
      createSql: `
        CREATE TABLE IF NOT EXISTS event_rules (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
          rule_text TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
      `
    }
  ];

  for (const table of tables) {
    try {
      // Check if table exists
      const { error: checkError } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true });

      if (checkError?.code === '42P01') {
        console.log(`Table ${table.name} does not exist, attempting to create...`);
        
        // Note: We can't execute DDL statements through the Supabase client
        // This would need to be done through the SQL editor or server-side
        console.error(`Please create the ${table.name} table manually in Supabase SQL Editor`);
        console.log(`SQL to create ${table.name}:`, table.createSql);
      } else if (checkError) {
        console.error(`Error checking ${table.name}:`, {
          message: checkError.message,
          code: checkError.code,
          details: checkError.details
        });
      } else {
        console.log(`Table ${table.name} exists and is accessible`);
      }
    } catch (error) {
      console.error(`Error checking table ${table.name}:`, error);
    }
  }
}

export async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    return !error || error.code !== '42P01';
  } catch {
    return false;
  }
}

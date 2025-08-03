import { RequestHandler } from "express";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jktbmygutktbjjuzuwgq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprdGJteWd1dGt0YmpqdXp1d2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjExMzEsImV4cCI6MjA2OTczNzEzMX0.WNrC3L-WSZEu68DtFPBDFzBZzB29th2Nvou5Vlwq6Lg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface TestMessageRequest {
  message: string;
}

export const handleSupabaseTest: RequestHandler = async (req, res) => {
  try {
    const { message } = req.body as TestMessageRequest;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Message is required and must be a string' 
      });
    }

    const { data, error } = await supabase
      .from('test_messages')
      .insert([{ message }])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(400).json({ 
        error: 'Failed to insert message', 
        details: error.message 
      });
    }

    res.json({ 
      success: true, 
      data: data[0],
      message: 'Message successfully saved to Supabase!'
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

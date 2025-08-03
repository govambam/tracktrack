import { RequestHandler } from "express";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jktbmygutktbjjuzuwgq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprdGJteWd1dGt0YmpqdXp1d2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjExMzEsImV4cCI6MjA2OTczNzEzMX0.WNrC3L-WSZEu68DtFPBDFzBZzB29th2Nvou5Vlwq6Lg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const handleAuthTest: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    console.log('Testing auth with:', {
      email,
      supabaseUrl: supabaseUrl,
      keyLength: supabaseAnonKey.length,
      keyPrefix: supabaseAnonKey.substring(0, 20) + '...'
    });

    // First test basic Supabase connection
    try {
      console.log('Testing basic Supabase connection...');
      const { data: testData, error: testError } = await supabase
        .from('test_messages')
        .select('count')
        .limit(1);

      console.log('Supabase connection test:', { testData, testError });
    } catch (connError) {
      console.log('Supabase connection failed:', connError);
    }

    // Test multiple approaches
    console.log('Attempting Supabase auth signup...');

    // Approach 1: Basic signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    console.log('Auth test result:');
    console.log('- Data:', JSON.stringify(data, null, 2));
    console.log('- Error:', JSON.stringify(error, null, 2));

    // If that fails, let's try with additional options
    if (error && !data.user) {
      console.log('Trying signup with additional options...');
      const { data: data2, error: error2 } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
          data: {}
        }
      });

      console.log('Second attempt result:');
      console.log('- Data2:', JSON.stringify(data2, null, 2));
      console.log('- Error2:', JSON.stringify(error2, null, 2));

      if (error2) {
        return res.status(400).json({
          error: 'Both auth attempts failed',
          firstAttempt: { error: error.message },
          secondAttempt: { error: error2.message },
          details: `First: ${error.message}, Second: ${error2.message}`
        });
      }
    }

    if (error) {
      console.error('Supabase auth error:', error);
      return res.status(400).json({
        error: 'Auth test failed',
        details: error.message,
        code: error.status || 'unknown',
        supabaseError: {
          message: error.message,
          status: error.status,
          statusCode: error.statusCode
        }
      });
    }

    res.json({ 
      success: true, 
      message: 'Auth test successful',
      user: data.user ? {
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at,
        email_confirmed_at: data.user.email_confirmed_at
      } : null
    });
  } catch (error) {
    console.error('Auth test error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

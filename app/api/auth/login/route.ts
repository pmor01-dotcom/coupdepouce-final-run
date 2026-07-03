import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data: authData, error: authError } = await supabase!.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.session) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Get user profile from users table
    const { data: userData, error: userError } = await supabase!
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({
      user: userData,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

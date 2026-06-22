import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client not initialized' }, { status: 500 });
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.session) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabase
      .from('clients')
      .select('*')
      .eq('email', email)
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

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    // Use service role client to bypass RLS for database insert
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const {
      name,
      email,
      password,
      role,
      ville,
      metier,
      phone
    } = body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1️⃣ Create Supabase Auth user with email verification
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          role,
          name
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
      }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "User creation failed" },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // Check if email confirmation is required
    const needsEmailVerification = !authData.session;

    // 2️⃣ Hash password for your own table
    const password_hash = await bcrypt.hash(password, 10);

    // 3️⃣ Prepare insert data for users table
    let insertData: any = {
      id: userId,
      name,
      email,
      location: ville || null, // Map 'ville' to 'location' column in schema
      phone: phone || null,
      password_hash,
      role: role.toUpperCase(), // Convert to uppercase to match schema (CLIENT/ARTISAN)
      metier: metier || null,
      updated_at: new Date().toISOString() // Add updated_at timestamp
    };

    // 4️⃣ Insert into users table using service role client (bypasses RLS)
    const { error } = await supabaseAdmin.from('users').insert(insertData);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: needsEmailVerification 
        ? "Signup successful. Please check your email to verify your account."
        : "Signup successful",
      needsEmailVerification
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

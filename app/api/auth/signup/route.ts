import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const body = await request.json();
    const {
      name,
      email,
      password,
      role,
      location,
      department,
      metier,
      phone
    } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1️⃣ Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role }
      }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // 2️⃣ Ensure user exists
    if (!authData.user) {
      return NextResponse.json(
        { error: "User creation failed" },
        { status: 500 }
      );
    }

    // 3️⃣ NOW we can safely use userId
    const userId = authData.user.id;

    // 4️⃣ Hash password for your own table
    const password_hash = await bcrypt.hash(password, 10);

    // 5️⃣ Prepare insert data
    let insertData: any = {
      id: userId,
      nom: name,
      email,
      password_hash,
      city: location,
      department,
      telephone: phone
    };

    if (role === "artisan") {
      insertData.metier = metier;
    }

    const table = role === "artisan" ? "artisans" : "clients";

    // 6️⃣ Insert into your own table
    const { error } = await supabase.from(table).insert(insertData);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 7️⃣ Success — user is logged in
    return NextResponse.json({
      success: true,
      message: "Signup successful"
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

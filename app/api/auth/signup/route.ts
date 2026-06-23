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

    // 1️⃣ CREATE AUTH USER
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

    const userId = authData.user.id;

    // 2️⃣ HASH PASSWORD FOR YOUR OWN TABLE
    const password_hash = await bcrypt.hash(password, 10);

    // 3️⃣ PREPARE INSERT DATA
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

    // 4️⃣ INSERT INTO YOUR OWN TABLE
    const { error } = await supabase.from(table).insert(insertData);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 5️⃣ SUCCESS — USER IS NOW LOGGED IN
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

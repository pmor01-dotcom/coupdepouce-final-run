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

    // Basic validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const password_hash = await bcrypt.hash(password, 10);

   let insertData: any = {
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


    // Add artisan-only fields
    if (role === "artisan") {
      insertData.metier = metier;
    }

    // Insert into correct table
    const table = role === "artisan" ? "artisans" : "clients";

    const { error } = await supabase.from(table).insert(insertData);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Signup successful"
    });

  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

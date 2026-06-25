import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const body = await request.json();
    const {
      name,      // full name from form, e.g. "Paul Morland"
      email,
      password,
      role,      // "client" | "artisan"
      ville,
      metier,    // only for artisan
      phone      // if your artisans table has it
    } = body;

    // 🔐 Basic validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 🧩 Split full name into nom + prenom
    const parts = name.trim().split(" ");
    const prenom = parts[0] || "";
    const nom = parts.slice(1).join(" ") || "";

    // 1️⃣ Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          nom,
          prenom,
          ville: ville || null
        },
        emailRedirectTo: `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/auth/callback`
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

    const needsEmailVerification = !authData.session;

    // 2️⃣ Hash password for your own tables
    const password_hash = await bcrypt.hash(password, 10);

    // 3️⃣ Build insert payload — ⚠️ no `id` here, Supabase sets it (auth.uid())
    const isArtisan = role === "artisan";
    const table = isArtisan ? "artisans" : "clients";

    let insertData: any = {
      nom,
      prenom,
      email,
      ville: ville || "",
      password_hash,
      role
    };

    if (isArtisan) {
      insertData.metier = metier || "";
      if (phone) insertData.phone = phone;
    }

    // 4️⃣ Insert into correct table
    const { error } = await supabase.from(table).insert(insertData);

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

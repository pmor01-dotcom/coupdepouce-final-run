import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }

    // Create reset token
    const resetToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 30).toISOString(); // 30 min

    await supabase
      .from("users")
      .update({
        reset_token: resetToken,
        reset_token_expires: expires,
      })
      .eq("id", user.id);

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;

    // ⭐ FIXED — email object is now valid
    const emailPayload = {
      from: `Coup de Pouce <no-reply@coupdepouce.com>`,
      to: email,
      subject: "Réinitialisation de votre mot de passe",
      html: `
        <!DOCTYPE html>
        <html>
          <body>
            <p>Bonjour,</p>
            <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
            <p><a href="${resetUrl}">Réinitialiser le mot de passe</a></p>
            <p>Ce lien expire dans 30 minutes.</p>
          </body>
        </html>
      `,
    };

    const emailResult = await resend.emails.send(emailPayload);

    console.log("=== EMAIL SEND RESULT ===");
    console.log(JSON.stringify(emailResult, null, 2));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

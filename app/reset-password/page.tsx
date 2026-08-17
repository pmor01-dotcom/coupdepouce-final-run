import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

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
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, name")
      .eq("email", email)
      .single();

    // Security: never reveal if user exists
    if (userError || !user) {
      return NextResponse.json({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Create reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 30).toISOString(); // 30 min

    const { error: updateError } = await supabase
      .from("users")
      .update({
        reset_token: resetToken,
        reset_token_expires: expires,
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to store reset token" },
        { status: 500 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      `https://${req.headers.get("host")}`;

    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    // If Resend is not configured, still return success
    if (!process.env.RESEND_API_KEY) {
      console.log("RESEND_API_KEY missing — reset URL:", resetUrl);
      return NextResponse.json({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Send email
    const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
    const fromName = process.env.RESEND_FROM_NAME || "Coup de Pouce";

    const emailPayload = {
      from: `${fromName} <${fromEmail}>`,
      to: email,
      subject: "Réinitialisation de votre mot de passe",
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Réinitialisation du mot de passe</h2>
            <p>Bonjour ${user.name},</p>
            <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
            <p><a href="${resetUrl}">Réinitialiser mon mot de passe</a></p>
            <p>Ou copiez ce lien dans votre navigateur :</p>
            <p>${resetUrl}</p>
            <p>Ce lien expire dans 30 minutes.</p>
          </body>
        </html>
      `,
    };

    const emailResult = await resend.emails.send(emailPayload);

    console.log("=== EMAIL SEND RESULT ===");
    console.log(JSON.stringify(emailResult, null, 2));

    return NextResponse.json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (err: any) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// ⭐ FIX: use named import, not default import
import { sendNewDemandNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { senderId, receiverId, demandId } = await request.json();

    if (!senderId || !receiverId || !demandId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch sender
    const { data: sender } = await supabase
      .from("users")
      .select("id, name, email")
      .eq("id", senderId)
      .single();

    // Fetch receiver
    const { data: receiver } = await supabase
      .from("users")
      .select("id, name, email")
      .eq("id", receiverId)
      .single();

    // Fetch demand
    const { data: demand } = await supabase
      .from("demands")
      .select("id, title")
      .eq("id", demandId)
      .single();

    if (!sender || !receiver || !demand) {
      return NextResponse.json(
        { error: "Invalid sender, receiver, or demand" },
        { status: 400 }
      );
    }

    // ⭐ FIX: call the named function
    const emailSent = await sendNewDemandNotification(
      receiver.email,
      sender.name,
      demand.title
    );

    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send notification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification sent successfully"
    });
  } catch (error) {
    console.error("Notification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

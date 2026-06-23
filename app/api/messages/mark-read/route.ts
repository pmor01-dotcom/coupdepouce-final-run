import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const body = await request.json();
    const { conversationId, userId } = body;

    if (!conversationId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId);

    // Parse conversation ID: "id1-id2-demandId"
    const [id1, id2, demandId] = conversationId.split("-").map(Number);

    // Verify user is part of this conversation
    if (userIdNum !== id1 && userIdNum !== id2) {
      return NextResponse.json(
        { error: "Unauthorized access to conversation" },
        { status: 403 }
      );
    }

    // Build filter for messages to update
    const filter: any = {
      receiver_id: userIdNum,
      read_at: null
    };

    // demandId can be 0 (no demand)
    if (demandId) {
      filter["demand_id"] = demandId;
    } else {
      filter["demand_id"] = null;
    }

    // Mark messages as read
    const { data, error } = await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .match(filter);

    if (error) {
      console.error("Error marking messages as read:", error);
      return NextResponse.json(
        { error: "Failed to mark messages as read" },
        { status: 500 }
      );
    }

    // Supabase returns updated rows OR null depending on config
    const updatedCount = Array.isArray(data) ? data.length : 0;

    return NextResponse.json({
      success: true,
      updatedCount
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { error: "Failed to mark messages as read" },
      { status: 500 }
    );
  }
}

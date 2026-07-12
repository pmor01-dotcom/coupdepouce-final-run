import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId);

    // Fetch all messages where user is sender or receiver
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select(
        `
        id,
        content,
        sender_id,
        receiver_id,
        demand_id,
        created_at,
        read_at,
        sender:users!messages_sender_id_fkey(id, name, role, metier, location),
        receiver:users!messages_receiver_id_fkey(id, name, role, metier, location),
        demand:demands!messages_demand_id_fkey(id, title, description, category, budget_range, location, department, status)
      `
      )
      .or(`sender_id.eq.${userIdNum},receiver_id.eq.${userIdNum}`)
      .order("created_at", { ascending: false });

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    // Group messages into conversations
    const conversationMap = new Map();

    messages.forEach((message) => {
      const otherUserId =
        message.sender_id === userIdNum
          ? message.receiver_id
          : message.sender_id;

      const demandId = message.demand_id || 0;

      const conversationKey = `${Math.min(
        userIdNum,
        otherUserId
      )}-${Math.max(userIdNum, otherUserId)}-${demandId}`;

      const otherUser =
        message.sender_id === userIdNum
          ? message.receiver
          : message.sender;

      if (!conversationMap.has(conversationKey)) {
        conversationMap.set(conversationKey, {
          conversationId: conversationKey,
          otherUser,
          demand: message.demand,
          lastMessage: {
            id: message.id,
            content: message.content,
            senderId: message.sender_id,
            createdAt: message.created_at,
          },
          unreadCount:
            message.read_at === null && message.receiver_id === userIdNum
              ? 1
              : 0,
        });
      } else {
        const conv = conversationMap.get(conversationKey);

        // Update last message if newer
        if (
          new Date(message.created_at) >
          new Date(conv.lastMessage.createdAt)
        ) {
          conv.lastMessage = {
            id: message.id,
            content: message.content,
            senderId: message.sender_id,
            createdAt: message.created_at,
          };
        }

        // Update unread count
        if (message.read_at === null && message.receiver_id === userIdNum) {
          conv.unreadCount++;
        }
      }
    });

    const conversations = Array.from(conversationMap.values());

    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

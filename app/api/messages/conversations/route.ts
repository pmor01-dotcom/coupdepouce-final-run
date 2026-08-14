import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Fetch all messages where user is sender or receiver
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    console.log('Messages fetched for user', userId, ':', messages?.length);

    // Group messages into conversations
    const conversationMap = new Map();

    for (const message of messages) {
      const otherUserId =
        message.sender_id === userId
          ? message.receiver_id
          : message.sender_id;

      if (!conversationMap.has(otherUserId)) {
        // Fetch other user info
        const { data: otherUser } = await supabase
          .from('users')
          .select('id, name')
          .eq('id', otherUserId)
          .limit(1);

        conversationMap.set(otherUserId, {
          id: otherUserId,
          otherUser: otherUser && otherUser.length > 0 ? otherUser[0] : { id: otherUserId, name: 'Unknown User' },
          lastMessage: message,
          messages: [message]
        });
      } else {
        const conv = conversationMap.get(otherUserId);
        // Add message to conversation
        conv.messages.push(message);
        // Update last message if newer
        if (new Date(message.created_at) > new Date(conv.lastMessage.created_at)) {
          conv.lastMessage = message;
        }
      }
    }

    // Sort messages within each conversation by created_at
    const conversations = Array.from(conversationMap.values()).map(conv => ({
      ...conv,
      messages: conv.messages.sort((a: any, b: any) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    }));

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

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Delete all messages between current user and other user
    const { error } = await supabase
      .from("messages")
      .delete()
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    if (error) {
      console.error("Error deleting conversation:", error);
      return NextResponse.json(
        { error: "Failed to delete conversation" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Conversation deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}

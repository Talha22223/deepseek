import { auth } from "@clerk/nextjs";
import connectDB from "@/public/config/db";
import Chat from "@/public/models/chat";

// Get all chats for the current user
export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    await connectDB();
    
    const chats = await Chat.find({ userId, isActive: true })
      .select('title updatedAt messages')
      .sort({ updatedAt: -1 })
      .lean();
    
    // Format chats for the frontend
    const formattedChats = chats.map(chat => ({
      id: chat._id.toString(),
      title: chat.title,
      lastMessage: chat.messages[chat.messages.length - 1]?.content || '',
      updatedAt: chat.updatedAt
    }));
    
    return Response.json(formattedChats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return Response.json({ error: "Failed to fetch chats" }, { status: 500 });
  }
}

// Create a new chat
export async function POST(req) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    await connectDB();
    
    const { message, model } = await req.json();
    
    if (!message) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }
    
    // Create new chat with initial message
    const newChat = await Chat.create({
      userId,
      model: model || "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }]
    });
    
    return Response.json({
      id: newChat._id.toString(),
      title: newChat.title,
      model: newChat.model
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating chat:", error);
    return Response.json({ error: "Failed to create chat" }, { status: 500 });
  }
}

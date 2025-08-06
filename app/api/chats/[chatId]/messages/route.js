import { auth } from "@clerk/nextjs";
import connectDB from "@/public/config/db";
import Chat from "@/public/models/chat";
import { generateAIResponse } from "@/public/services/ai";

// Send a message and get AI response
export async function POST(req, { params }) {
  try {
    const { userId } = auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = params;
    const { message } = await req.json();
    
    if (!message) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    await connectDB();
    
    // Find the chat
    const chat = await Chat.findOne({ _id: chatId, userId, isActive: true });
    
    if (!chat) {
      return Response.json({ error: "Chat not found" }, { status: 404 });
    }
    
    // Add user message
    chat.messages.push({
      role: "user",
      content: message
    });
    
    // Get AI response
    const aiResponse = await generateAIResponse(chat.messages, chat.model);
    console.log("Generated AI response:", aiResponse);
    
    // Add AI response to chat
    chat.messages.push({
      role: "assistant",
      content: aiResponse
    });
    
    await chat.save();
    
    return Response.json({
      id: chat._id.toString(),
      userMessage: message,
      aiResponse: aiResponse
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return Response.json({ error: "Failed to process message" }, { status: 500 });
  }
}

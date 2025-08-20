import { auth } from "@clerk/nextjs";
import connectDB from "@/public/config/db";
import Chat from "@/public/models/chat";
import { generateChatTitle } from "@/public/services/ai";

// Get a specific chat
export async function GET(req, { params }) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { chatId } = params;
    
    await connectDB();
    
    const chat = await Chat.findOne({ 
      _id: chatId, 
      userId, 
      isActive: true 
    });
    
    if (!chat) {
      return Response.json({ error: "Chat not found" }, { status: 404 });
    }
    
    return Response.json({
      id: chat._id.toString(),
      title: chat.title,
      messages: chat.messages,
      model: chat.model
    });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return Response.json({ error: "Failed to fetch chat" }, { status: 500 });
  }
}

// Update chat title
export async function PATCH(req, { params }) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { chatId } = params;
    const { title, model } = await req.json();
    
    await connectDB();
    
    const chat = await Chat.findOne({ _id: chatId, userId, isActive: true });
    
    if (!chat) {
      return Response.json({ error: "Chat not found" }, { status: 404 });
    }
    
    // Update fields if provided
    if (title) chat.title = title;
    if (model) chat.model = model;
    
    await chat.save();
    
    return Response.json({
      id: chat._id.toString(),
      title: chat.title,
      model: chat.model
    });
  } catch (error) {
    console.error("Error updating chat:", error);
    return Response.json({ error: "Failed to update chat" }, { status: 500 });
  }
}

// Delete a chat (soft delete)
export async function DELETE(req, { params }) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { chatId } = params;
    
    await connectDB();
    
    const result = await Chat.findOneAndUpdate(
      { _id: chatId, userId },
      { isActive: false },
      { new: true }
    );
    
    if (!result) {
      return Response.json({ error: "Chat not found" }, { status: 404 });
    }
    
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return Response.json({ error: "Failed to delete chat" }, { status: 500 });
  }
}

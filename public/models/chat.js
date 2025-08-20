import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const ChatSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'New Chat'
  },
  messages: [MessageSchema],
  model: {
    type: String,
    enum: ['gpt-3.5-turbo', 'gpt-4'],
    default: 'gpt-3.5-turbo'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Method to get title from first message if not set
ChatSchema.pre('save', function(next) {
  if (this.title === 'New Chat' && this.messages.length > 0) {
    const firstUserMsg = this.messages.find(m => m.role === 'user')?.content;
    if (firstUserMsg) {
      // Generate title from first message (max 30 chars)
      this.title = firstUserMsg.substring(0, 30) + (firstUserMsg.length > 30 ? '...' : '');
    }
  }
  next();
});

// Prevent model redefinition during hot reload in development
const Chat = mongoose.models.Chat || mongoose.model('Chat', ChatSchema);

export default Chat;

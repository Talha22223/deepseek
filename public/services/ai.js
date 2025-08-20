import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to generate AI response
export async function generateAIResponse(messages, model = 'gpt-3.5-turbo') {
  try {
    // Format messages for OpenAI
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Ensure there's a system message
    if (!formattedMessages.some(msg => msg.role === 'system')) {
      formattedMessages.unshift({
        role: 'system',
        content: 'You are DeepSeek, a helpful and professional AI assistant. You provide concise, accurate, and helpful responses.'
      });
    }
    
    console.log("Calling OpenAI with:", formattedMessages);
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: model,
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    console.log("OpenAI response:", response);

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error in generateAIResponse:", error);
    
    // Return appropriate error message based on error type
    if (error.code === 'context_length_exceeded') {
      return "I'm sorry, but this conversation has become too long for me to process. Please start a new chat or summarize your question.";
    } else if (error.code === 'rate_limit_exceeded') {
      return "I'm currently experiencing high demand. Please try again in a moment.";
    } else {
      return "I apologize, but I encountered an error processing your request. Please try again.";
    }
  }
}

// Function to generate chat title
export async function generateChatTitle(messages) {
  try {
    // Get first user message
    const firstUserMessage = messages.find(msg => msg.role === 'user')?.content;
    
    if (!firstUserMessage) return "New Chat";
    
    // If message is short, use it directly
    if (firstUserMessage.length < 30) {
      return firstUserMessage;
    }
    
    // Generate title using OpenAI
    const titleResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Generate a short, concise title (max 5 words) for this conversation.' },
        { role: 'user', content: `First message: "${firstUserMessage}"` }
      ],
      temperature: 0.7,
      max_tokens: 20,
    });
    
    return titleResponse.choices[0].message.content.replace(/"/g, '');
  } catch (error) {
    console.error('Error generating chat title:', error);
    // Fallback to truncated first message
    return firstUserMessage.substring(0, 30) + '...';
  }
}

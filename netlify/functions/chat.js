const { OpenAI } = require('openai');

// Initialize OpenAI with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Load the knowledge base
const knowledgeBase = require('./knowledge-base/qa_database.json');

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { message } = JSON.parse(event.body);
    
    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' })
      };
    }

    console.log('Received message:', message);

    // Create a comprehensive knowledge base context for GPT-3.5
    const knowledgeContext = knowledgeBase.qa_pairs.map((qa, index) => 
      `Q${index + 1}: ${qa.question}\nA${index + 1}: ${qa.answer}\nCategory: ${qa.category}`
    ).join('\n\n');

    // Use GPT-3.5 to intelligently respond using the knowledge base
    const systemPrompt = `You are Sakis Athan's AI assistant. Sakis builds custom AI agents and automation solutions.

KNOWLEDGE BASE:
${knowledgeContext}

INSTRUCTIONS:
1. You have access to comprehensive Q&A information about Sakis's services
2. When a user asks a question, find the most relevant information from the knowledge base
3. Provide helpful, accurate answers based on this information
4. If the question relates to multiple Q&A pairs, combine the information intelligently
5. If no relevant information exists in the knowledge base, provide a helpful general response about AI agents and automation
6. Always be professional, friendly, and helpful
7. Never mention "NO_MATCH_FOUND" or technical errors to users
8. Remove any asterisks (*) or formatting characters from your responses
9. Keep responses conversational and natural for voice synthesis

ABOUT SAKIS:
- Builds custom AI agents using GPT-3.5, GPT-4, Claude, and other AI models
- Specializes in automation, chatbots, document processing, and business workflows
- Uses Python, JavaScript, and Visual Basic
- Offers consulting and custom development services
- Contact: aiagent@dr.com

Respond naturally and helpfully to the user's question.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 400,
        temperature: 0.7
      });

      let response = completion.choices[0].message.content.trim();
      
      // Clean up the response for voice synthesis
      response = response
        .replace(/\*/g, '') // Remove asterisks
        .replace(/\#/g, '') // Remove hash symbols
        .replace(/\[.*?\]/g, '') // Remove bracketed references
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      console.log('Generated response:', response);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          response: response,
          timestamp: new Date().toISOString()
        })
      };

    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      
      // Fallback response without revealing technical details
      const fallbackResponse = "I'm here to help you learn about AI agents and automation solutions. Sakis specializes in building custom AI assistants that can automate tasks, handle emails, process documents, and much more. For specific questions about your project, please contact Sakis directly at aiagent@dr.com.";
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          response: fallbackResponse,
          timestamp: new Date().toISOString()
        })
      };
    }

  } catch (error) {
    console.error('Error processing chat request:', error);
    
    // User-friendly error response
    const errorResponse = "I apologize for the technical difficulty. Please try asking your question again, or contact Sakis directly at aiagent@dr.com for immediate assistance.";
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        response: errorResponse,
        timestamp: new Date().toISOString()
      })
    };
  }
};


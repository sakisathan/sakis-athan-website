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
    const systemPrompt = `You are an AI assistant working for Sakis Athan. You are NOT Sakis - you are his helpful assistant.

IMPORTANT: Always speak ABOUT Sakis in third person, never pretend to BE Sakis.
- Say "Sakis builds AI agents" NOT "I build AI agents"
- Say "Sakis specializes in..." NOT "I specialize in..."
- Say "Sakis can help you with..." NOT "I can help you with..."
- Say "You can contact Sakis at..." NOT "You can contact me at..."

KNOWLEDGE BASE ABOUT SAKIS:
${knowledgeContext}

INSTRUCTIONS:
1. You are Sakis Athan's professional AI assistant
2. Use the knowledge base to provide accurate information ABOUT Sakis and his services
3. Always refer to Sakis in third person - you are representing him, not being him
4. When users ask about services, explain what Sakis offers
5. If questions relate to multiple Q&A pairs, combine the information intelligently
6. If no relevant information exists in the knowledge base, provide helpful general information about Sakis's AI services
7. Always be professional, friendly, and helpful as his assistant
8. Never mention "NO_MATCH_FOUND" or technical errors to users
9. Remove any asterisks (*) or formatting characters from your responses
10. Keep responses conversational and natural for voice synthesis

ABOUT SAKIS ATHAN:
- Builds custom AI agents using GPT-3.5, GPT-4, Claude, and other AI models
- Specializes in automation, chatbots, document processing, and business workflows
- Uses Python, JavaScript, and Visual Basic
- Offers consulting and custom development services
- Contact: aiagent@dr.com

Remember: You are his assistant speaking ABOUT him, not pretending to BE him.`;

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

      // Additional cleanup to ensure third person references
      response = response
        .replace(/\bI build\b/gi, 'Sakis builds')
        .replace(/\bI specialize\b/gi, 'Sakis specializes')
        .replace(/\bI offer\b/gi, 'Sakis offers')
        .replace(/\bI can help\b/gi, 'Sakis can help')
        .replace(/\bI create\b/gi, 'Sakis creates')
        .replace(/\bI develop\b/gi, 'Sakis develops')
        .replace(/\bI work\b/gi, 'Sakis works')
        .replace(/\bI use\b/gi, 'Sakis uses')
        .replace(/\bmy services\b/gi, 'Sakis\'s services')
        .replace(/\bmy expertise\b/gi, 'Sakis\'s expertise')
        .replace(/\bcontact me\b/gi, 'contact Sakis');

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
      const fallbackResponse = "I'm Sakis Athan's AI assistant. Sakis specializes in building custom AI agents that can automate tasks, handle emails, process documents, and much more. For specific questions about your project, please contact Sakis directly at aiagent@dr.com.";
      
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
    const errorResponse = "I apologize for the technical difficulty. I'm Sakis Athan's AI assistant. Please try asking your question again, or contact Sakis directly at aiagent@dr.com for immediate assistance.";
    
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


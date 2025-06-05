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

    // First, try to find relevant answers from knowledge base using GPT-3.5
    let response;
    
    try {
      // Use GPT-3.5 to analyze the question and find the best matching Q&A pairs
      const analysisPrompt = `You are an AI assistant for Sakis Athan, who builds custom AI agents and automation solutions.

User question: "${message}"

Below are available Q&A pairs from the knowledge base:
${knowledgeBase.qa_pairs.map((qa, index) => `${index + 1}. Q: ${qa.question}\nA: ${qa.answer}\nCategory: ${qa.category}\n`).join('\n')}

Your task:
1. Analyze the user's question carefully
2. Find the most relevant Q&A pair(s) that answer the question
3. If you find relevant matches, provide a comprehensive answer based on those Q&A pairs
4. If no good matches exist, respond with "NO_MATCH_FOUND"
5. Always be helpful and provide the most accurate information

Respond with either:
- A helpful answer based on the knowledge base
- "NO_MATCH_FOUND" if no relevant information exists

Answer:`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant for Sakis Athan who builds custom AI agents. Use the provided knowledge base to answer questions accurately.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      response = completion.choices[0].message.content.trim();
      
      // If GPT couldn't find a match in the knowledge base, provide a general helpful response
      if (response === "NO_MATCH_FOUND") {
        console.log('No knowledge base match found, using general OpenAI response');
        
        const generalCompletion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an AI assistant for Sakis Athan, a developer who specializes in building custom AI agents and automation solutions. 

Key information about Sakis:
- He builds custom AI agents using GPT-3.5, GPT-4, Claude, and other AI models
- He specializes in automation, chatbots, document processing, and business workflows
- He uses Python, JavaScript, and Visual Basic
- He offers consulting and custom development services
- He's based in Denmark but works with clients worldwide
- Contact: aiagent@dr.com

Respond helpfully to user questions about AI agents, automation, or related services. If the question is outside your expertise, politely redirect them to contact Sakis directly.`
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        });
        
        response = generalCompletion.choices[0].message.content;
      } else {
        console.log('Found knowledge base match, using enhanced response');
      }

    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      response = "I apologize, but I'm experiencing technical difficulties. Please contact Sakis directly at aiagent@dr.com for assistance.";
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        response: response,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Error processing chat request:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: 'Please try again later or contact support.'
      })
    };
  }
};




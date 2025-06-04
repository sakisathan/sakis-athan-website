const { OpenAI } = require('openai');

// Initialize OpenAI with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Load the knowledge base - FIXED PATH
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

    console.log(`Received message: ${message}`);

    // Search knowledge base first
    const lowerMessage = message.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;

    for (const qa of knowledgeBase.qa_pairs) {
      const questionLower = qa.question.toLowerCase();
      
      // Simple keyword matching
      const messageWords = lowerMessage.split(' ');
      const questionWords = questionLower.split(' ');
      
      let matchCount = 0;
      for (const word of messageWords) {
        if (word.length > 2 && questionWords.some(qw => qw.includes(word) || word.includes(qw))) {
          matchCount++;
        }
      }
      
      const score = matchCount / Math.max(messageWords.length, questionWords.length);
      
      if (score > bestScore && score > 0.3) {
        bestScore = score;
        bestMatch = qa;
      }
    }

    let response;

    if (bestMatch) {
      console.log(`Found knowledge base match: ${bestMatch.question}`);
      response = bestMatch.answer;
    } else {
      console.log('No knowledge base match found, using OpenAI');
      
      // Use OpenAI as fallback
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are Sakis Athan, an expert AI Agent Engineer. You build intelligent systems that automate business processes, optimize workflows, and assist with real tasks. You provide fast delivery, fair pricing, and 100% hands-on development.

Your expertise includes:
- Custom AI agents and chatbots
- Business process automation
- Workflow optimization
- AI integration solutions
- Vibe programming (your unique approach)

Always respond in plain text without any formatting, asterisks, or markdown. Keep responses concise and professional. Your email is aiagent@dr.com for direct contact.`
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      });

      response = completion.choices[0].message.content;
    }

    // Clean up response - remove any formatting
    response = response
      .replace(/\*\*/g, '')  // Remove bold asterisks
      .replace(/\*/g, '')    // Remove single asterisks
      .replace(/###/g, '')   // Remove headers
      .replace(/##/g, '')    // Remove headers
      .replace(/#/g, '')     // Remove headers
      .replace(/__/g, '')    // Remove underlines
      .replace(/_/g, '')     // Remove underlines
      .trim();

    console.log(`Sending response: ${response}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ response })
    };

  } catch (error) {
    console.error('Error processing chat request:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        response: 'I apologize, but I am experiencing technical difficulties. Please contact Sakis directly at aiagent@dr.com for assistance.'
      })
    };
  }
};



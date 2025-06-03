import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 3001;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: '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'
});

app.use(cors());
app.use(express.json());

// Load Q&A knowledge base
let qaDatabase = [];
try {
  const qaPath = path.join(process.cwd(), 'knowledge-base', 'qa_database.json');
  const qaData = fs.readFileSync(qaPath, 'utf8');
  qaDatabase = JSON.parse(qaData);
  console.log(`Loaded ${qaDatabase.length} Q&A pairs from knowledge base`);
} catch (error) {
  console.error('Error loading Q&A database:', error);
}

// Improved similarity calculation function
function calculateSimilarity(str1, str2) {
  const words1 = str1.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  const words2 = str2.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  
  let exactMatches = 0;
  let partialMatches = 0;
  
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1 === word2) {
        exactMatches++;
        break;
      } else if (word1.includes(word2) || word2.includes(word1)) {
        partialMatches += 0.5;
        break;
      }
    }
  }
  
  const totalMatches = exactMatches + partialMatches;
  return totalMatches / Math.max(words1.length, words2.length);
}

// Function to find the best matching Q&A pair
function findBestMatch(userQuestion) {
  let bestMatch = null;
  let bestScore = 0;
  const threshold = 0.6; // Increased threshold for better precision
  
  for (const qa of qaDatabase) {
    const score = calculateSimilarity(userQuestion, qa.question);
    if (score > bestScore && score >= threshold) {
      bestScore = score;
      bestMatch = qa;
    }
  }
  
  return { match: bestMatch, score: bestScore };
}

// Function to categorize questions and provide intelligent responses
function getIntelligentResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // First, try to find exact matches in knowledge base
  const result = findBestMatch(message);
  if (result.match) {
    console.log(`Found knowledge base match (score: ${result.score.toFixed(2)}): ${result.match.question}`);
    return result.match.answer;
  }
  
  // Fallback to category-based responses for common topics
  if (lowerMessage.includes('service') || (lowerMessage.includes('what') && lowerMessage.includes('do'))) {
    return "Sakis offers custom AI agents, GPT/Claude-powered chatbots, workflow automation, API integrations, personalized LLM solutions, and much more. He specializes in combining modern AI tools with traditional coding and his unique 'vibe programming' approach.";
  }
  
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('pricing')) {
    return "Pricing depends on complexity. Simple bots start around $500-1000, advanced ones can be $2000-5000+. Sakis offers fair pricing with fast delivery and 100% hands-on development.";
  }
  
  if (lowerMessage.includes('vibe programming') || lowerMessage.includes('vibe')) {
    return "Vibe programming is Sakis's creative, intuitive approach to solving complex problems efficiently. It combines traditional coding techniques with modern AI tools and a personal touch to create solutions that truly help people work smarter.";
  }
  
  if (lowerMessage.includes('delivery') || lowerMessage.includes('fast') || lowerMessage.includes('time')) {
    return "Most projects take 1-3 weeks, depending on features and integrations needed. Sakis provides fast delivery with 100% hands-on development and personally handles every project from design to deployment.";
  }
  
  if (lowerMessage.includes('contact') || lowerMessage.includes('email') || lowerMessage.includes('reach')) {
    return "You can reach Sakis directly at aiagent@dr.com. He personally handles all communication and will respond to discuss your AI project needs.";
  }
  
  console.log(`No knowledge base match found (best score: ${result.score.toFixed(2)}), using OpenAI`);
  return null; // No match found, will use OpenAI
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    console.log(`User question: ${message}`);
    
    // Check knowledge base and intelligent categorization first
    const intelligentResponse = getIntelligentResponse(message);
    if (intelligentResponse) {
      return res.json({ response: intelligentResponse });
    }
    
    // If no match found, use OpenAI with enhanced context
    console.log('Using OpenAI for response...');
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are Sakis Athan's AI assistant. Sakis is an AI Agent Engineer who builds intelligent systems to automate real-world tasks.

IMPORTANT: Never use asterisks (*), markdown formatting, HTML tags, or any special formatting symbols in your responses. Use only plain text. When listing steps or items, use simple numbered lists (1. 2. 3.) or bullet points with dashes (-) but NO asterisks or bold formatting.

Key information about Sakis Athan:
- He delivers fast, useful, and custom-built automation solutions for individuals and businesses
- He combines modern AI tools (GPT, Claude, Manus, Perplexity) with traditional coding (Visual Basic, Python, JavaScript)
- He uses "vibe programming" - a creative, intuitive approach to solving complex problems efficiently
- He personally handles every step from design to deployment
- He offers fair pricing with fast delivery and 100% hands-on development
- Contact: aiagent@dr.com

Services include:
- Custom AI agents for business, tasks, and communication
- GPT/Claude-powered chatbots for websites or systems
- Workflow and data automation (email, Excel, reports)
- API integrations with platforms and tools
- Personalized LLM solutions using OpenAI and Anthropic
- Voice-enabled assistants and much more

Pricing:
- Simple solutions: $500-1000
- Advanced systems: $2000-5000+
- Timeline: 1-3 weeks typically
- 24/7 operation once deployed
- 100% code ownership
- Ongoing support available

Keep responses helpful, professional, and focused on Sakis's services. Always encourage direct contact for specific needs. Remember: NO asterisks or formatting symbols - plain text only!`
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    let response = completion.choices[0].message.content;
    
    // Remove all asterisks and other formatting symbols
    response = response.replace(/\*\*/g, ''); // Remove double asterisks
    response = response.replace(/\*/g, ''); // Remove single asterisks
    response = response.replace(/\#\#\#/g, ''); // Remove triple hashes
    response = response.replace(/\#\#/g, ''); // Remove double hashes
    response = response.replace(/\#/g, ''); // Remove single hashes
    response = response.replace(/\_\_/g, ''); // Remove double underscores
    response = response.replace(/\_/g, ''); // Remove single underscores
    
    console.log(`OpenAI response (cleaned): ${response}`);
    res.json({ response });
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ 
      response: "I'm having trouble connecting right now. Please contact Sakis directly at aiagent@dr.com for immediate assistance." 
    });
  }
});

// Contact form endpoint with message storage
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    // Create timestamp
    const timestamp = new Date().toISOString();
    
    // Create message entry
    const messageEntry = {
      timestamp,
      name,
      email,
      message,
      id: Date.now().toString()
    };
    
    // Log the contact form submission
    console.log('Contact form submission:');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Message:', message);
    console.log('Timestamp:', timestamp);
    console.log('---');
    
    // Save to messages file
    try {
      const messagesPath = path.join(process.cwd(), 'contact-messages.json');
      let messages = [];
      
      // Read existing messages if file exists
      if (fs.existsSync(messagesPath)) {
        const existingData = fs.readFileSync(messagesPath, 'utf8');
        messages = JSON.parse(existingData);
      }
      
      // Add new message
      messages.push(messageEntry);
      
      // Write back to file
      fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));
      
      console.log(`Message saved to ${messagesPath}`);
    } catch (fileError) {
      console.error('Error saving message to file:', fileError);
    }
    
    // Send success response
    res.json({ 
      success: true, 
      message: `Thank you ${name}! Your message has been received and saved. Sakis will review it and get back to you at ${email} soon.` 
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Sorry, there was an error sending your message. Please try again or contact aiagent@dr.com directly.' 
    });
  }
});

// Endpoint to retrieve messages (for Sakis to check)
app.get('/api/messages', (req, res) => {
  try {
    const messagesPath = path.join(process.cwd(), 'contact-messages.json');
    
    if (fs.existsSync(messagesPath)) {
      const messagesData = fs.readFileSync(messagesPath, 'utf8');
      const messages = JSON.parse(messagesData);
      res.json({ success: true, messages });
    } else {
      res.json({ success: true, messages: [] });
    }
  } catch (error) {
    console.error('Error reading messages:', error);
    res.status(500).json({ success: false, error: 'Failed to read messages' });
  }
});

app.listen(port, () => {
  console.log(`Enhanced Chat API server running on port ${port}`);
  console.log(`Knowledge base loaded with ${qaDatabase.length} Q&A pairs`);
});


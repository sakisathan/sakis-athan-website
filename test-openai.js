import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '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'
});

async function testOpenAI() {
  try {
    console.log('Testing OpenAI connection...');
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Say hello and confirm you are working"
        }
      ],
      max_tokens: 50
    });

    console.log('OpenAI Response:', completion.choices[0].message.content);
    console.log('✅ OpenAI connection working!');
  } catch (error) {
    console.error('❌ OpenAI connection failed:', error.message);
  }
}

testOpenAI();


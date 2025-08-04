import { Request, Response } from 'express';

export const generateDescription = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.OPENAI_API_KEY || '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';
    
    console.log('Making OpenAI API call');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 300
      })
    });

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('OpenAI API error:', errorBody);
      return res.status(response.status).json({ 
        error: 'OpenAI API error', 
        details: errorBody 
      });
    }

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content?.trim();

    if (!generatedText) {
      return res.status(500).json({ error: 'No text generated' });
    }

    res.json({ description: generatedText });

  } catch (error) {
    console.error('Error in generateDescription:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

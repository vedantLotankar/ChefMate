import express from 'express';
import OpenAI from 'openai';
import { validateChatRequest } from '../middleware/validation';

const router = express.Router();

// Initialize OpenRouter AI
const API_KEY = process.env.OPENROUTER_API_KEY || '';
console.log('🤖 OpenRouter AI initializing...');
console.log('🔑 API Key exists:', !!API_KEY);
console.log('🔑 API Key length:', API_KEY.length);
console.log('🔑 API Key starts with:', API_KEY.substring(0, 10) + '...');

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'ChefMate'
  }
});

if (!API_KEY) {
  console.error('❌ NO OPENROUTER API KEY FOUND!');
}

// Recipe-specific chat endpoint
router.post('/recipe', validateChatRequest, async (req, res) => {
  try {
    const { message, recipeContext } = req.body;
    
    console.log('🍳 Recipe chat request received:', {
      messageLength: message?.length || 0,
      hasRecipeContext: !!recipeContext,
      recipeName: recipeContext?.name || 'Unknown'
    });

    if (!process.env.OPENROUTER_API_KEY) {
      console.log('❌ OpenRouter API key not configured');
      return res.status(500).json({ 
        error: 'AI service not configured',
        message: 'Please configure the OpenRouter API key'
      });
    }

    // Create context-aware prompt
    const prompt = `
You are ChefMate, an AI cooking assistant. The user is currently cooking this recipe:

Recipe: ${recipeContext?.name || 'Unknown Recipe'}
Description: ${recipeContext?.description || 'No description available'}
Ingredients: ${recipeContext?.ingredients?.map((ing: any) => `${ing.name} - ${ing.amount}`).join(', ') || 'No ingredients listed'}
Current Step: ${recipeContext?.currentStep || 'Not specified'}

User's question: ${message}

Please provide helpful, accurate cooking advice related to this recipe. Keep responses concise but informative. Include food safety reminders when relevant.
`;

    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-oss-20b:free',
      messages: [
        {
          role: 'system',
          content: 'You are ChefMate, an AI cooking assistant.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    const text = completion.choices[0]?.message?.content || 'No response generated';

    console.log('✅ Recipe chat response generated:', {
      responseLength: text.length,
      recipeName: recipeContext?.name
    });

    res.json({
      success: true,
      response: text,
      timestamp: new Date().toISOString(),
      context: 'recipe'
    });

  } catch (error) {
    console.error('❌ Recipe chat error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('quota') || error.message.includes('rate limit')) {
        console.log('⚠️ OpenRouter API quota exceeded');
        return res.status(429).json({
          error: 'API quota exceeded',
          message: 'Daily API limit reached. Please try again tomorrow.',
          retryAfter: '24 hours'
        });
      }
      
      if (error.message.includes('API key') || error.message.includes('unauthorized')) {
        console.log('🔑 Invalid OpenRouter API key');
        return res.status(401).json({
          error: 'Invalid API key',
          message: 'Please check your OpenRouter API configuration'
        });
      }
    }

    res.status(500).json({
      error: 'AI service error',
      message: 'Failed to generate response. Please try again.'
    });
  }
});

// Cooking Mode - Get detailed steps for entire recipe
router.post('/cooking-details', async (req, res) => {
  console.log('\n📨 ========== COOKING DETAILS REQUEST ==========');
  console.log('📥 Headers:', req.headers);
  console.log('📥 Request body keys:', Object.keys(req.body || {}));
  
  try {
    const { recipe } = req.body;
    
    console.log('🍳 Cooking mode request received:', {
      recipeName: recipe?.name || 'Unknown',
      stepCount: recipe?.steps?.length || 0
    });

    if (!process.env.OPENROUTER_API_KEY) {
      console.log('❌ OpenRouter API key not configured');
      return res.status(500).json({ 
        error: 'AI service not configured',
        message: 'Please configure the OpenRouter API key'
      });
    }

    if (!recipe || !recipe.steps || recipe.steps.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Recipe and steps are required'
      });
    }

    // Create detailed prompt to get step-by-step instructions
    const stepsList = recipe.steps.map((step: any, index: number) => 
      `Step ${step.stepNumber}: ${step.description}`
    ).join('\n');

    const prompt = `
You are ChefMate, a professional cooking assistant. For the recipe below, generate detailed step-by-step instructions.

Recipe Name: ${recipe.name}
Description: ${recipe.description || 'No description'}
Total Cook Time: ${recipe.cookTime} minutes
Prep Time: ${recipe.prepTime || 'Not specified'} minutes

RECIPE STEPS:
${stepsList}

For EACH step above, provide:
1. A brief step title (similar to the original)
2. 3-6 detailed substeps explaining HOW to perform it
3. An estimated time in minutes for that specific step (distribute the total ${recipe.cookTime} minutes intelligently across all steps)

IMPORTANT: Return ONLY valid JSON in this exact format:
{
  "all_steps": [
    {
      "step_title": "Step 1: [title]",
      "detailed_steps": ["substep 1", "substep 2", "substep 3"],
      "estimated_time_minutes": 10
    },
    {
      "step_title": "Step 2: [title]",
      "detailed_steps": ["substep 1", "substep 2"],
      "estimated_time_minutes": 5
    }
  ]
}

Ensure the total estimated time for all steps is approximately ${recipe.cookTime} minutes.
Make the instructions clear, actionable, and suitable for home cooks. Include safety tips when relevant.
`;

    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-oss-20b:free',
      messages: [
        {
          role: 'system',
          content: 'You are ChefMate, a professional cooking assistant. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.7
    });

    const text = completion.choices[0]?.message?.content || 'No response generated';

    console.log('✅ Cooking details generated:', {
      responseLength: text.length,
      recipeName: recipe.name
    });

    // Parse the JSON response
    let parsedResponse;
    try {
      // OpenRouter sometimes returns markdown code blocks, extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : text;
      parsedResponse = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('❌ Failed to parse OpenRouter response:', parseError);
      return res.status(500).json({
        error: 'Response parsing error',
        message: 'Failed to parse AI response. Please try again.'
      });
    }

    res.json({
      success: true,
      all_steps: parsedResponse.all_steps || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Cooking details error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('quota') || error.message.includes('rate limit')) {
        console.log('⚠️ OpenRouter API quota exceeded');
        return res.status(429).json({
          error: 'API quota exceeded',
          message: 'Daily API limit reached. Please try again tomorrow.',
          retryAfter: '24 hours'
        });
      }
      
      if (error.message.includes('API key') || error.message.includes('unauthorized')) {
        console.log('🔑 Invalid OpenRouter API key');
        return res.status(401).json({
          error: 'Invalid API key',
          message: 'Please check your OpenRouter API configuration'
        });
      }
    }

    res.status(500).json({
      error: 'AI service error',
      message: 'Failed to generate cooking details. Please try again.'
    });
  }
});

// General cooking chat endpoint
router.post('/general', validateChatRequest, async (req, res) => {
  try {
    const { message } = req.body;
    
    console.log('👨‍🍳 General chat request received:', {
      messageLength: message?.length || 0
    });

    if (!process.env.OPENROUTER_API_KEY) {
      console.log('❌ OpenRouter API key not configured');
      return res.status(500).json({ 
        error: 'AI service not configured',
        message: 'Please configure the OpenRouter API key'
      });
    }

    const prompt = `
You are ChefMate, an AI cooking assistant. Help the user with their cooking question.

User's question: ${message}

Please provide helpful, accurate cooking advice. Keep responses concise but informative. Include food safety reminders when relevant.
`;

    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-oss-20b:free',
      messages: [
        {
          role: 'system',
          content: 'You are ChefMate, an AI cooking assistant.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    const text = completion.choices[0]?.message?.content || 'No response generated';

    console.log('✅ General chat response generated:', {
      responseLength: text.length
    });

    res.json({
      success: true,
      response: text,
      timestamp: new Date().toISOString(),
      context: 'general'
    });

  } catch (error) {
    console.error('❌ General chat error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('quota') || error.message.includes('rate limit')) {
        console.log('⚠️ OpenRouter API quota exceeded');
        return res.status(429).json({
          error: 'API quota exceeded',
          message: 'Daily API limit reached. Please try again tomorrow.',
          retryAfter: '24 hours'
        });
      }
      
      if (error.message.includes('API key') || error.message.includes('unauthorized')) {
        console.log('🔑 Invalid OpenRouter API key');
        return res.status(401).json({
          error: 'Invalid API key',
          message: 'Please check your OpenRouter API configuration'
        });
      }
    }

    res.status(500).json({
      error: 'AI service error',
      message: 'Failed to generate response. Please try again.'
    });
  }
});

export default router;

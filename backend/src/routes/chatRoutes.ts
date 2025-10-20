import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { validateChatRequest } from '../middleware/validation';

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

console.log('🤖 Gemini AI initialized:', process.env.GEMINI_API_KEY ? 'API Key loaded' : 'No API Key');

// Recipe-specific chat endpoint
router.post('/recipe', validateChatRequest, async (req, res) => {
  try {
    const { message, recipeContext } = req.body;
    
    console.log('🍳 Recipe chat request received:', {
      messageLength: message?.length || 0,
      hasRecipeContext: !!recipeContext,
      recipeName: recipeContext?.name || 'Unknown'
    });

    if (!process.env.GEMINI_API_KEY) {
      console.log('❌ Gemini API key not configured');
      return res.status(500).json({ 
        error: 'AI service not configured',
        message: 'Please configure the Gemini API key'
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

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
      if (error.message.includes('quota')) {
        console.log('⚠️ Gemini API quota exceeded');
        return res.status(429).json({
          error: 'API quota exceeded',
          message: 'Daily API limit reached. Please try again tomorrow.',
          retryAfter: '24 hours'
        });
      }
      
      if (error.message.includes('API key')) {
        console.log('🔑 Invalid Gemini API key');
        return res.status(401).json({
          error: 'Invalid API key',
          message: 'Please check your Gemini API configuration'
        });
      }
    }

    res.status(500).json({
      error: 'AI service error',
      message: 'Failed to generate response. Please try again.'
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

    if (!process.env.GEMINI_API_KEY) {
      console.log('❌ Gemini API key not configured');
      return res.status(500).json({ 
        error: 'AI service not configured',
        message: 'Please configure the Gemini API key'
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
You are ChefMate, an AI cooking assistant. Help the user with their cooking question.

User's question: ${message}

Please provide helpful, accurate cooking advice. Keep responses concise but informative. Include food safety reminders when relevant.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

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
      if (error.message.includes('quota')) {
        console.log('⚠️ Gemini API quota exceeded');
        return res.status(429).json({
          error: 'API quota exceeded',
          message: 'Daily API limit reached. Please try again tomorrow.',
          retryAfter: '24 hours'
        });
      }
      
      if (error.message.includes('API key')) {
        console.log('🔑 Invalid Gemini API key');
        return res.status(401).json({
          error: 'Invalid API key',
          message: 'Please check your Gemini API configuration'
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

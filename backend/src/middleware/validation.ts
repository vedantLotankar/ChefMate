import { Request, Response, NextFunction } from 'express';

interface ChatRequest {
  message: string;
  recipeContext?: {
    name: string;
    description?: string;
    ingredients?: Array<{ name: string; amount: string }>;
    currentStep?: string;
  };
}

export const validateChatRequest = (req: Request, res: Response, next: NextFunction) => {
  console.log('🔍 Validating chat request...');
  
  const { message, recipeContext } = req.body as ChatRequest;

  // Validate message
  if (!message || typeof message !== 'string') {
    console.log('❌ Invalid message:', { message, type: typeof message });
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Message is required and must be a string'
    });
  }

  // Validate message length
  if (message.trim().length === 0) {
    console.log('❌ Empty message');
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Message cannot be empty'
    });
  }

  if (message.length > 1000) {
    console.log('❌ Message too long:', message.length);
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Message is too long (max 1000 characters)'
    });
  }

  // Validate recipe context if provided
  if (recipeContext) {
    if (!recipeContext.name || typeof recipeContext.name !== 'string') {
      console.log('❌ Invalid recipe context - missing name');
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Recipe context must include a valid name'
      });
    }

    // Sanitize recipe context
    req.body.recipeContext = {
      name: recipeContext.name.trim().substring(0, 200),
      description: recipeContext.description?.trim().substring(0, 500),
      ingredients: recipeContext.ingredients?.slice(0, 50), // Limit to 50 ingredients
      currentStep: recipeContext.currentStep?.trim().substring(0, 200)
    };
  }

  // Sanitize message
  req.body.message = message.trim().substring(0, 1000);

  console.log('✅ Chat request validation passed');
  next();
};

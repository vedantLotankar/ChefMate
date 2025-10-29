# 🚀 OpenRouter DeepSeek:R1 Migration Guide

## 📋 **Required Information:**

### **1. Get OpenRouter API Key** (FREE)
- Go to: https://openrouter.ai
- Sign up (FREE)
- Go to Dashboard → Keys
- Create a new API key
- Copy the key

### **2. API Configuration:**

**Base URL:** `https://openrouter.ai/api/v1/chat/completions`

**Model:** `deepseek/deepseek-r1:free`

**Headers:**
```javascript
{
  "Authorization": "Bearer YOUR_API_KEY",
  "HTTP-Referer": "http://localhost:3000", // Your app URL
  "X-Title": "ChefMate" // Your app name
}
```

### **3. Request Format:**

OpenRouter uses OpenAI-compatible API:

```javascript
POST https://openrouter.ai/api/v1/chat/completions
Headers:
  Authorization: Bearer YOUR_API_KEY
  HTTP-Referer: http://localhost:3000
  X-Title: ChefMate

Body:
{
  "model": "deepseek/deepseek-r1:free",
  "messages": [
    {
      "role": "system",
      "content": "You are ChefMate..."
    },
    {
      "role": "user",
      "content": "Your prompt here"
    }
  ],
  "max_tokens": 2000,
  "temperature": 0.7
}
```

### **4. Response Format:**
```javascript
{
  "id": "gen-xxx",
  "model": "deepseek/deepseek-r1:free",
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "Response text here"
    }
  }],
  "usage": {
    "prompt_tokens": 100,
    "completion_tokens": 200
  }
}
```

---

## 🔄 **What Needs to Change:**

### **Backend Files:**
1. `backend/.env` - Change API key configuration
2. `backend/src/routes/chatRoutes.ts` - Switch from Gemini to OpenAI SDK
3. Update request format for cooking-details endpoint
4. Update general chat endpoint

### **No Frontend Changes Needed!**
The frontend will work as-is because it just calls backend APIs.

---

## 📝 **Step-by-Step:**

### **Step 1: Update backend/.env**
```env
# Change from Gemini to OpenRouter
OPENROUTER_API_KEY=your_openrouter_api_key_here
PORT=3000
NODE_ENV=development
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
CORS_ORIGIN=*
```

### **Step 2: Install OpenAI Package**
```bash
cd backend
npm install openai
```

### **Step 3: Update chatRoutes.ts**
- Replace `@google/generative-ai` with `openai`
- Update request format
- Update response parsing

---

## ✅ **Benefits:**
- ✅ FREE API
- ✅ Same functionality
- ✅ Better support
- ✅ Simple migration
- ✅ No quota limits (reasonable use)

---

## 🎯 **Ready to Implement?**

I'll:
1. Update backend to use OpenRouter
2. Change all Gemini calls to OpenAI format
3. Test the integration
4. Update your .env file

Say "yes" and I'll implement it now!


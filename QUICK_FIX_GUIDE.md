# 🔧 Quick Fix Guide - Network Errors

## ✅ What I Fixed

1. **Updated API URL for Android** - Changed from `localhost:3000` to `10.0.2.2:3000`
2. **Restructured Cooking Screen** - Now matches your wireframe design
3. **Added Fallback Mode** - App works even without backend running (shows basic instructions)

## 🚀 To Fix Network Errors:

### Step 1: Create Backend .env File

Create a file at `backend/.env` with this content:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3000
NODE_ENV=development
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
CORS_ORIGIN=*
```

**Replace `your_actual_gemini_api_key_here` with your real Gemini API key.**

### Step 2: Start Backend Server

Open a new terminal and run:

```bash
cd backend
npm run dev
```

You should see:
```
✅ ChefMate Backend Server running on port 3000
```

### Step 3: Test the App

The app should now work! The Cooking Mode will:
- Use fallback instructions if backend is down
- Use AI-generated instructions if backend is running and has API key

## 📱 Current UI Features (Based on Wireframe):

✅ **Top Section**: Step title box (left) + Timer box (right)
✅ **Timer Controls**: Play/pause and skip buttons
✅ **Ingredients Section**: Shows ingredients for current step
✅ **AI Description Box**: Shows detailed instructions
✅ **Navigation**: Previous Step / Next Step buttons at bottom
✅ **Complete Alert**: Shows when finished

## 🎯 Next Steps (Chat Window):

The chat window is ready to implement. We'll create it in the next session with:
- AI chat functionality
- Recipe tagging/search feature
- Matching wireframe design

## ❓ Questions?

If network errors persist:
1. Check if backend is running on port 3000
2. Verify GEMINI_API_KEY is set in backend/.env
3. Try restarting the Expo app


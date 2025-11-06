# ChefMate - AI-Powered Cooking Assistant

ChefMate is a React Native Expo app that provides an AI-enhanced cooking experience with recipe discovery, step-by-step cooking guidance, and contextual AI chat assistance.

## 🚀 Features

### 🆕 **NEW: OpenRouter Integration**
- **FREE AI API**: No more quota limits or costs
- **DeepSeek R1 Model**: Advanced reasoning capabilities
- **Better Performance**: More reliable than previous AI provider
- **Easy Setup**: Simple API key configuration

### ✅ Implemented (MVP)
- **Recipe Discovery**: Browse 8+ dummy recipes with search and filtering
- **Recipe Details**: View ingredients, nutrition, cooking steps, and serving adjustments
- **AI Chat Integration**: Contextual chat with OpenRouter DeepSeek R1 AI for recipe-specific help
- **Independent Chat**: General cooking assistance via AI
- **Glassmorphic UI**: Modern blurred glass design with expo-blur
- **State Management**: Zustand stores with AsyncStorage persistence
- **Navigation**: Bottom tabs + stack navigation with TypeScript
- **Error Handling**: Comprehensive error boundaries and loading states
- **Backend Proxy**: Secure Express server for OpenRouter API calls

### 🔄 In Progress
- **Full Screen Implementation**: Complete RecipeDetail, Cooking, and Chat screens
- **Image Management**: Recipe photo upload and optimization
- **Performance Optimization**: FlatList optimizations and blur performance tuning

### 📋 Future Enhancements
- **Streaming Chat**: Real-time AI response streaming
- **Voice Mode**: Voice-guided cooking instructions
- **Meal Planning**: Personalized meal planning and grocery lists
- **Recipe Creation**: AI-assisted recipe generation from ingredients
- **Timer Integration**: Smart cooking timers with notifications
- **Cloud Sync**: Multi-device recipe synchronization
- **Social Features**: Recipe sharing and community features

## 🛠 Tech Stack

### Frontend (React Native Expo)
- **Framework**: React Native with Expo SDK 51
- **Language**: TypeScript
- **Styling**: StyleSheet with utility functions (no NativeWind for stability)
- **Navigation**: React Navigation v6 (Stack + Bottom Tabs)
- **State Management**: Zustand with persistence
- **Storage**: AsyncStorage for local data
- **UI Effects**: expo-blur for glassmorphic design
- **Icons**: @expo/vector-icons
- **Validation**: Zod schemas

### Backend (Node.js/Express)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **AI Integration**: OpenRouter API with DeepSeek R1 model
- **Security**: Helmet, CORS, rate limiting
- **Logging**: Morgan for request logging
- **Environment**: dotenv for configuration

### Development Tools
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode
- **Package Manager**: npm
- **Version Control**: Git

## 📁 Project Structure

```
ChefMate/
├── backend/                 # Express backend server
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/      # Express middleware
│   │   └── server.ts       # Main server file
│   ├── .env.example       # Environment variables template
│   └── package.json       # Backend dependencies
├── src/                    # React Native app source
│   ├── api/               # API client and types
│   ├── components/        # Reusable UI components
│   ├── screens/          # App screens
│   ├── navigation/       # Navigation configuration
│   ├── store/           # Zustand state stores
│   ├── utils/           # Utilities and constants
│   └── assets/          # Images and static assets
├── App.tsx               # Main app entry point
└── package.json         # Mobile app dependencies
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android development)
- OpenRouter API key (for AI features - FREE)

### ⚡ Quick Setup Checklist

Before running the app, make sure you:
1. ✅ Install dependencies (mobile app + backend)
2. ✅ Create `backend/.env` with OpenRouter API key
3. ✅ **Configure IP address in `src/utils/constants.ts`** (see Step 3 below)
4. ✅ Start backend server
5. ✅ Start Expo development server
6. ✅ Run app on device/emulator

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd ChefMate

# Install mobile app dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Environment Setup

#### Backend Environment
Create `backend/.env`:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
PORT=3000
NODE_ENV=development
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
CORS_ORIGIN=http://localhost:8081
```

**Get your FREE OpenRouter API key:**
1. Go to https://openrouter.ai
2. Sign up (FREE)
3. Go to Dashboard → Keys
4. Create a new API key
5. Copy the key to your `.env` file

### 3. Configure IP Address (IMPORTANT!)

**⚠️ You must configure the IP address before running the app, especially if you switch networks.**

The mobile app needs to know your development machine's IP address to connect to the backend server. This needs to be updated in the code.

#### Step 1: Find Your IP Address

**Windows:**
```bash
ipconfig
```
Look for `IPv4 Address` under your active network adapter (usually Wi-Fi or Ethernet).

**macOS/Linux:**
```bash
ifconfig
# or
ip addr show
```
Look for `inet` address (usually starts with `192.168.x.x` or `10.x.x.x`).

**Example output:**
```
IPv4 Address. . . . . . . . . . . : 192.168.1.100
```

#### Step 2: Update IP Address in Code

Open `src/utils/constants.ts` and update the IP address:

**For Android Emulator:**
- Use `10.0.2.2` (special IP that always points to host machine)
- No need to change when switching networks

**For iOS Simulator:**
- Use `localhost` or `127.0.0.1`
- No need to change when switching networks

**For Physical Devices (Android/iOS):**
- Use your machine's actual IP address (e.g., `192.168.1.100`)
- **You must update this every time you switch networks!**

**Example configuration in `src/utils/constants.ts`:**
```typescript
if (__DEV__) {
  if (Platform.OS === 'android') {
    // For Android Emulator: use '10.0.2.2'
    // For Physical Android Device: use your machine's IP (e.g., '192.168.1.100')
    const url = 'http://192.168.1.100:3000';  // ← Update this IP
    console.log('🔧 Using Android URL:', url);
    return url;
  } else {
    // For iOS Simulator: use 'localhost'
    // For Physical iOS Device: use your machine's IP (e.g., '192.168.1.100')
    const url = 'http://192.168.1.100:3000';  // ← Update this IP
    console.log('🔧 Using iOS URL:', url);
    return url;
  }
}
```

#### Step 3: Update Backend Server Binding (Optional but Recommended)

To ensure the backend is accessible from your network, update `backend/src/server.ts`:

```typescript
// Change from:
app.listen(PORT, () => {

// To:
app.listen(PORT, '0.0.0.0', () => {
```

This makes the server listen on all network interfaces, not just localhost.

#### Quick Reference: IP Configuration by Platform

| Platform | IP Address | Notes |
|----------|-----------|-------|
| Android Emulator | `10.0.2.2` | Always use this, never changes |
| iOS Simulator | `localhost` | Always use this, never changes |
| Physical Android Device | Your machine's IP | Update when network changes |
| Physical iOS Device | Your machine's IP | Update when network changes |

**💡 Tip:** If you frequently switch networks, keep a note of common IP ranges you use, or check your IP before each development session.

### 4. Start Development Servers

#### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```

You should see:
```
✅ ChefMate Backend Server running on port 3000
🌐 Health check: http://localhost:3000/health
💬 Chat API: http://localhost:3000/api/chat
```

#### Terminal 2 - Mobile App
```bash
npm start
```

### 5. Run on Device

- **Android**: Press `a` in the Expo CLI terminal
- **iOS**: Press `i` in the Expo CLI terminal (requires macOS)
- **Web**: Press `w` in the Expo CLI terminal

## 🔧 Configuration

### Backend Configuration

The backend server runs on port 3000 by default. Key configuration options:

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for Expo development server
- **Logging**: Morgan combined format
- **Security**: Helmet for security headers
- **Server Binding**: Configure to listen on `0.0.0.0` for network access (see IP Configuration section)

### Mobile App Configuration

- **API Base URL**: Configured in `src/utils/constants.ts` - **must be updated when switching networks**
- **Blur Effects**: Configurable intensity and platform-specific behavior
- **Storage**: AsyncStorage for persistence
- **Navigation**: Bottom tabs + stack navigation

### IP Address Configuration

**Location:** `src/utils/constants.ts`

**When to update:**
- ✅ Every time you switch Wi-Fi networks
- ✅ When connecting to a different network (home, office, mobile hotspot)
- ✅ When your router assigns a new IP address
- ❌ Not needed for Android Emulator (always use `10.0.2.2`)
- ❌ Not needed for iOS Simulator (always use `localhost`)

**How to verify your IP is correct:**
1. Check the console logs when the app starts - it will show the configured URL
2. Test the backend health endpoint: `http://YOUR_IP:3000/health` in a browser
3. If you see network errors, verify the IP matches your current network IP

## 📱 App Architecture

### State Management

**Recipe Store** (`useRecipeStore`):
- Recipe list (dummy + custom)
- Search and filter state
- Favorites management
- Current recipe and servings

**Chat Store** (`useChatStore`):
- Recipe-specific chat messages
- General chat messages
- Loading and error states
- Current recipe context

### Component Architecture

**Reusable Components**:
- `RecipeCard`: Recipe display with blur overlay
- `SearchBar`: Blurred search input
- `StepCard`: Cooking step with blur background
- `ChatBubble`: User/AI message display
- `ChatInput`: Message input with blur
- `LoadingSpinner`: Loading indicator
- `ErrorBoundary`: Error handling

### Navigation Flow

```
Home Tab
├── Home Screen (recipe list)
├── Recipe Detail Screen
├── Cooking Screen
└── Chat Screen (contextual)

Chat Tab
└── Independent Chat Screen

Add Recipe Tab
└── Add Recipe Screen
```

## 🔒 Security & Privacy

### Backend Security
- **API Key Protection**: OpenRouter API key stored server-side only
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Zod schemas for request validation
- **CORS**: Configured for specific origins
- **Security Headers**: Helmet middleware

### Mobile Security
- **No Secrets**: No API keys in mobile app
- **Local Storage**: AsyncStorage for user data only
- **Input Sanitization**: Client-side validation
- **Error Handling**: No sensitive data in error messages

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Mobile Testing
```bash
npm test
```

### Manual Testing Checklist
- [ ] Recipe list loads and displays correctly
- [ ] Search functionality works
- [ ] Navigation between screens
- [ ] Blur effects render properly
- [ ] Backend API responds correctly
- [ ] Chat functionality works
- [ ] Error handling displays properly

## 🐛 Troubleshooting

### Common Issues

**Backend won't start**:
- Check if port 3000 is available
- Verify OPENROUTER_API_KEY is set in `backend/.env`
- Run `npm install` in backend directory
- Check if another process is using port 3000: `lsof -i :3000` (macOS/Linux) or `netstat -ano | findstr :3000` (Windows)

**Mobile app won't load**:
- Ensure backend is running on port 3000
- Clear Expo cache: `expo start -c`
- Restart the Expo development server

**Network errors / API calls failing**:
- ✅ **Most common issue**: IP address mismatch
  - Verify your current IP address matches the one in `src/utils/constants.ts`
  - Update the IP if you switched networks
  - For physical devices, ensure both your computer and device are on the same Wi-Fi network
- Verify backend is running (check Terminal 1)
- Test backend health endpoint: Open `http://YOUR_IP:3000/health` in a browser
- Check firewall settings - ensure port 3000 is not blocked
- For Android Emulator: Use `10.0.2.2` instead of your actual IP
- For iOS Simulator: Use `localhost` instead of your actual IP
- Verify OpenRouter API key is valid
- Check rate limiting (429 errors)

**IP Address Issues**:
- **"Network Error" in app**: Your IP address in `constants.ts` doesn't match your current network IP
- **"Connection refused"**: Backend not running or wrong IP address
- **"Timeout"**: Firewall blocking port 3000 or wrong IP address
- **Solution**: 
  1. Find your current IP: `ipconfig` (Windows) or `ifconfig` (macOS/Linux)
  2. Update `src/utils/constants.ts` with the correct IP
  3. Restart the Expo app (press `r` in terminal or reload)

**Blur effects not working**:
- Check BLUR_CONFIG.enabled in constants
- Verify expo-blur is installed
- Test on physical device (blur may not work in simulator)

### Debug Mode

Enable debug logging by setting `DEBUG_CONFIG.enableLogs = true` in `src/utils/constants.ts`.

### Network Debugging

When debugging network issues, check the console logs for:
- `🔧 Platform.OS:` - Shows which platform is running
- `🔧 Using Android/iOS URL:` - Shows the configured backend URL
- `🔧 Final API_BASE_URL:` - Shows the final URL being used
- `📤 API Request:` - Shows outgoing API requests
- `❌ API Error:` - Shows API errors with status codes

If you see `undefined` in the URL logs, the IP configuration is incorrect.

## 📊 Performance Considerations

### Current Optimizations
- **FlatList**: Optimized with proper keyExtractor and windowSize
- **Blur Effects**: Platform-specific implementation
- **Image Loading**: Placeholder components for now
- **State Management**: Efficient Zustand stores

### Future Optimizations
- **Image Caching**: react-native-fast-image
- **Code Splitting**: Lazy loading for screens
- **Memory Management**: Proper cleanup in useEffect
- **Bundle Size**: Tree shaking and optimization

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make changes with proper TypeScript types
4. Test on both iOS and Android
5. Submit a pull request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Follow configured rules
- **Prettier**: Consistent formatting
- **Commits**: Conventional commit messages
- **Testing**: Unit tests for new features

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimers

### AI Cooking Advice
- AI responses are for informational purposes only
- Always follow proper food safety guidelines
- Consult professional chefs for complex techniques
- Verify cooking temperatures and times
- Be aware of food allergies and dietary restrictions

### Development Status
- This is an MVP (Minimum Viable Product)
- Some features are placeholder implementations
- Performance may vary on different devices
- Blur effects may impact performance on older devices

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the code documentation
- Test on physical devices when possible

---

**Built with ❤️ using React Native, Expo, and OpenRouter DeepSeek R1 AI**

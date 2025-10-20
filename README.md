# ChefMate - AI-Powered Cooking Assistant

ChefMate is a React Native Expo app that provides an AI-enhanced cooking experience with recipe discovery, step-by-step cooking guidance, and contextual AI chat assistance.

## 🚀 Features

### ✅ Implemented (MVP)
- **Recipe Discovery**: Browse 8+ dummy recipes with search and filtering
- **Recipe Details**: View ingredients, nutrition, cooking steps, and serving adjustments
- **AI Chat Integration**: Contextual chat with Gemini AI for recipe-specific help
- **Independent Chat**: General cooking assistance via AI
- **Glassmorphic UI**: Modern blurred glass design with expo-blur
- **State Management**: Zustand stores with AsyncStorage persistence
- **Navigation**: Bottom tabs + stack navigation with TypeScript
- **Error Handling**: Comprehensive error boundaries and loading states
- **Backend Proxy**: Secure Express server for Gemini API calls

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
- **AI Integration**: Google Gemini API
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
- Gemini API key (for AI features)

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
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
NODE_ENV=development
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
CORS_ORIGIN=http://localhost:8081
```

#### Mobile Environment
Create `.env`:
```env
BACKEND_URL=http://localhost:3000
APP_NAME=ChefMate
APP_VERSION=1.0.0
```

### 3. Start Development Servers

#### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```

#### Terminal 2 - Mobile App
```bash
npm start
```

### 4. Run on Device

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

### Mobile App Configuration

- **API Base URL**: Points to backend server
- **Blur Effects**: Configurable intensity and platform-specific behavior
- **Storage**: AsyncStorage for persistence
- **Navigation**: Bottom tabs + stack navigation

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
- **API Key Protection**: Gemini API key stored server-side only
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
- Verify GEMINI_API_KEY is set
- Run `npm install` in backend directory

**Mobile app won't load**:
- Ensure backend is running on port 3000
- Check BACKEND_URL in .env
- Clear Expo cache: `expo start -c`

**Blur effects not working**:
- Check BLUR_CONFIG.enabled in constants
- Verify expo-blur is installed
- Test on physical device (blur may not work in simulator)

**API calls failing**:
- Verify backend is running
- Check network connectivity
- Verify Gemini API key is valid
- Check rate limiting (429 errors)

### Debug Mode

Enable debug logging by setting `DEBUG_CONFIG.enableLogs = true` in `src/utils/constants.ts`.

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

**Built with ❤️ using React Native, Expo, and Google Gemini AI**

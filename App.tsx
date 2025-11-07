import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator } from 'react-native';
import 'react-native-gesture-handler';

import { AppNavigator } from './src/navigation/AppNavigator';
import { COLORS, SPACING } from './src/utils/constants';
import { initDatabase } from './src/utils/database';
import { logAllRecipes } from './src/utils/databaseDebug';

export default function App() {
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize database on app start
    initDatabase()
      .then(() => {
        console.log('✅ Database initialized successfully');
        setIsDbReady(true);
        
        // Call this to see all database content
        logAllRecipes();
      })
      .catch((error) => {
        console.error('❌ Database initialization failed:', error);
        setDbError('Failed to initialize database');
        setIsDbReady(true); // Still show app, but with error
      });
  }, []);

  if (!isDbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: SPACING.md, color: COLORS.text }}>Initializing database...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppNavigator />
        <StatusBar style="dark" backgroundColor={COLORS.background} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

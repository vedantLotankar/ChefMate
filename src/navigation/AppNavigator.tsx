import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { BottomTabBar, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';

import { RootStackParamList, TabParamList } from '../api/types';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BLUR_CONFIG } from '../utils/constants';

// Import screens (we'll create these next)
import HomeScreen from '../screens/HomeScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import CookingScreen from '../screens/CookingScreen';
import ChatScreen from '../screens/ChatScreen';
import IndependentChatScreen from '../screens/IndependentChatScreen';
import AddRecipeScreen from '../screens/AddRecipeScreen';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// Home Stack Navigator (nested inside Home tab)
const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen 
        name="RecipeDetail" 
        component={RecipeDetailScreen}
        options={{
          headerShown: false,
          headerStyle: {
            backgroundColor: COLORS.surface,
          },
          headerTintColor: COLORS.text,
          headerTitleStyle: {
            fontSize: FONT_SIZES.lg,
            fontWeight: FONT_WEIGHTS.semibold,
          },
        }}
      />
      <Stack.Screen 
        name="Cooking" 
        component={CookingScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: COLORS.surface,
          },
          headerTintColor: COLORS.text,
          headerTitleStyle: {
            fontSize: FONT_SIZES.lg,
            fontWeight: FONT_WEIGHTS.semibold,
          },
        }}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: COLORS.surface,
          },
          headerTintColor: COLORS.text,
          headerTitleStyle: {
            fontSize: FONT_SIZES.lg,
            fontWeight: FONT_WEIGHTS.semibold,
          },
        }}
      />
    </Stack.Navigator>
  );
};

// Custom Tab Bar with Blur Effect
const CustomTabBar = (props: any) => {
  if (BLUR_CONFIG.enabled && Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={BLUR_CONFIG.intensities.medium}
        tint={BLUR_CONFIG.tints.light}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 90,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
        }}
      >
        <BottomTabBar {...props} />
      </BlurView>
    );
  }

  return <BottomTabBar {...props} />;
};

// Main Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={CustomTabBar}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ChatTab') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'AddRecipeTab') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: {
          fontSize: FONT_SIZES.xs,
          fontWeight: FONT_WEIGHTS.medium,
          marginTop: 4,
        },
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
        },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStack}
        options={{
          title: 'Recipes',
        }}
      />
      <Tab.Screen 
        name="ChatTab" 
        component={IndependentChatScreen}
        options={{
          title: 'Chat',
        }}
      />
      <Tab.Screen 
        name="AddRecipeTab" 
        component={AddRecipeScreen}
        options={{
          title: 'Add Recipe',
        }}
      />
    </Tab.Navigator>
  );
};

// Main App Navigator
export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
};

// Default export for easier importing
export default AppNavigator;

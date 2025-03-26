import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, ActivityIndicator } from "react-native";
import { COLORS } from "../constants";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

// Import screens
// Auth screens
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";

// Main app screens
import HomeScreen from "../screens/HomeScreen";
import ReRollScreen from "../screens/ReRollScreen";
import SettingsScreen from "../screens/SettingsScreen";
import RestaurantDetailScreen from "../screens/RestaurantDetailScreen";

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth navigator
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.background,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}>
      <Stack.Screen name='Login' component={LoginScreen} options={{ title: "Welcome to IDK" }} />
      <Stack.Screen name='Register' component={RegisterScreen} options={{ title: "Create Account" }} />
      <Stack.Screen name='ForgotPassword' component={ForgotPasswordScreen} options={{ title: "Reset Password" }} />
    </Stack.Navigator>
  );
};

// Main tab navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "restaurant" : "restaurant-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.background,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      })}>
      <Tab.Screen
        name='Home'
        component={HomeStackNavigator}
        options={{
          headerShown: false,
          title: "Find Food",
        }}
      />
      <Tab.Screen name='Settings' component={SettingsScreen} options={{ title: "Settings" }} />
    </Tab.Navigator>
  );
};

// Home stack navigator (nested inside the tab navigator)
const HomeStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.background,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}>
      <Stack.Screen name='HomeScreen' component={HomeScreen} options={{ title: "IDK - Find Food" }} />
      <Stack.Screen name='ReRoll' component={ReRollScreen} options={{ title: "Try Again" }} />
      <Stack.Screen
        name='RestaurantDetail'
        component={RestaurantDetailScreen}
        options={({ route }) => ({ title: route.params?.name || "Restaurant Details" })}
      />
    </Stack.Navigator>
  );
};

// Root navigator
const RootNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size='large' color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.text }}>Loading...</Text>
      </View>
    );
  }

  return <NavigationContainer>{user ? <MainTabNavigator /> : <AuthNavigator />}</NavigationContainer>;
};

export default RootNavigator;

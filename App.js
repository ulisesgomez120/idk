import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, LogBox, View, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { COLORS } from "./src/constants";
import RootNavigator from "./src/navigation";
import { initializeAdMob } from "./src/services/adService";

// Ignore specific warnings
LogBox.ignoreLogs([
  "AsyncStorage has been extracted from react-native core",
  "Setting a timer for a long period of time",
  "VirtualizedLists should never be nested inside plain ScrollViews",
]);

// Keep the splash screen visible while we initialize the app
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize services
        await initializeAdMob();

        // Artificial delay for splash screen
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn("Error initializing app:", e);
        setInitError(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error initializing app</Text>
        <Text style={styles.errorDetails}>{initError.message}</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style='light' backgroundColor={COLORS.primary} />
      <RootNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.error,
    marginBottom: 10,
  },
  errorDetails: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: "center",
  },
});

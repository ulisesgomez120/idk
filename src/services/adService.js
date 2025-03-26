import { Platform, View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SEARCHES_BEFORE_AD } from "../constants";

// Storage key for search count
const SEARCH_COUNT_KEY = "search_count";

// Initialize AdMob - temporarily disabled due to compatibility issues
export const initializeAdMob = async () => {
  console.log("AdMob initialization skipped due to compatibility issues");
  return { success: true };
};

// Get the banner ad component - temporarily returns a placeholder
export const getBannerAd = () => {
  return (
    <View style={{ padding: 10, backgroundColor: "#f0f0f0", alignItems: "center" }}>
      <Text>Ad Placeholder - AdMob temporarily disabled</Text>
    </View>
  );
};

// Show interstitial ad based on search count - temporarily disabled
export const showInterstitialAd = async () => {
  try {
    // Get current search count
    const countStr = await AsyncStorage.getItem(SEARCH_COUNT_KEY);
    let count = countStr ? parseInt(countStr, 10) : 0;

    // Increment count
    count += 1;
    await AsyncStorage.setItem(SEARCH_COUNT_KEY, count.toString());

    // Log instead of showing ad
    if (count % SEARCHES_BEFORE_AD === 0) {
      console.log("Interstitial ad would show here (temporarily disabled)");
    }

    return { success: true, adShown: false, count };
  } catch (error) {
    console.error("Error in showInterstitialAd:", error);
    return { success: false, error };
  }
};

// Reset search count (e.g., for testing)
export const resetSearchCount = async () => {
  try {
    await AsyncStorage.setItem(SEARCH_COUNT_KEY, "0");
    return { success: true };
  } catch (error) {
    console.error("Error resetting search count:", error);
    return { success: false, error };
  }
};

// Get current search count
export const getSearchCount = async () => {
  try {
    const countStr = await AsyncStorage.getItem(SEARCH_COUNT_KEY);
    const count = countStr ? parseInt(countStr, 10) : 0;
    return { success: true, count };
  } catch (error) {
    console.error("Error getting search count:", error);
    return { success: false, error };
  }
};

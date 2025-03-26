import { Linking, Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { DELIVERY_APPS } from "../constants";

// Check if a specific app is installed
export const isAppInstalled = async (scheme) => {
  try {
    const canOpen = await Linking.canOpenURL(scheme);
    return canOpen;
  } catch (error) {
    console.error("Error checking if app is installed:", error);
    return false;
  }
};

// Open a restaurant in Uber Eats
export const openInUberEats = async (restaurantName, restaurantAddress) => {
  try {
    const { scheme, fallbackUrl } = DELIVERY_APPS.UBER_EATS;
    const query = encodeURIComponent(`${restaurantName} ${restaurantAddress}`);

    // Check if Uber Eats is installed
    const isInstalled = await isAppInstalled(`${scheme}search`);

    if (isInstalled) {
      // Open in Uber Eats app
      await Linking.openURL(`${scheme}search?q=${query}`);
      return { success: true, opened: true, app: "Uber Eats" };
    } else {
      // Open in browser
      await WebBrowser.openBrowserAsync(`${fallbackUrl}${query}`);
      return { success: true, opened: false, app: "Uber Eats", fallback: true };
    }
  } catch (error) {
    console.error("Error opening Uber Eats:", error);
    return { success: false, error };
  }
};

// Open a restaurant in DoorDash
export const openInDoorDash = async (restaurantName, restaurantAddress) => {
  try {
    const { scheme, fallbackUrl } = DELIVERY_APPS.DOORDASH;
    const query = encodeURIComponent(`${restaurantName} ${restaurantAddress}`);

    // Check if DoorDash is installed
    const isInstalled = await isAppInstalled(scheme);

    if (isInstalled) {
      // Open in DoorDash app
      // Note: DoorDash deep linking is limited, this is a best effort
      await Linking.openURL(scheme);
      return { success: true, opened: true, app: "DoorDash" };
    } else {
      // Open in browser
      await WebBrowser.openBrowserAsync(`${fallbackUrl}${query}`);
      return { success: true, opened: false, app: "DoorDash", fallback: true };
    }
  } catch (error) {
    console.error("Error opening DoorDash:", error);
    return { success: false, error };
  }
};

// Open a restaurant in Grubhub
export const openInGrubhub = async (restaurantName, restaurantAddress) => {
  try {
    const { scheme, fallbackUrl } = DELIVERY_APPS.GRUBHUB;
    const query = encodeURIComponent(`${restaurantName} ${restaurantAddress}`);

    // Check if Grubhub is installed
    const isInstalled = await isAppInstalled(scheme);

    if (isInstalled) {
      // Open in Grubhub app
      // Note: Grubhub deep linking is limited, this is a best effort
      await Linking.openURL(scheme);
      return { success: true, opened: true, app: "Grubhub" };
    } else {
      // Open in browser
      await WebBrowser.openBrowserAsync(`${fallbackUrl}${query}`);
      return { success: true, opened: false, app: "Grubhub", fallback: true };
    }
  } catch (error) {
    console.error("Error opening Grubhub:", error);
    return { success: false, error };
  }
};

// Open restaurant in maps app for directions
export const openInMaps = async (restaurantName, latitude, longitude) => {
  try {
    const label = encodeURIComponent(restaurantName);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
    });

    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      await Linking.openURL(url);
      return { success: true };
    } else {
      // Fallback to Google Maps in browser
      const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${label}`;
      await WebBrowser.openBrowserAsync(fallbackUrl);
      return { success: true, fallback: true };
    }
  } catch (error) {
    console.error("Error opening maps:", error);
    return { success: false, error };
  }
};

// Open restaurant website
export const openWebsite = async (url) => {
  try {
    if (!url) {
      return { success: false, error: "No website URL provided" };
    }

    // Ensure URL has proper protocol
    const properUrl = url.startsWith("http") ? url : `https://${url}`;

    await WebBrowser.openBrowserAsync(properUrl);
    return { success: true };
  } catch (error) {
    console.error("Error opening website:", error);
    return { success: false, error };
  }
};

// Try to open in any available delivery app
export const openInDeliveryApp = async (restaurantName, restaurantAddress) => {
  try {
    // Check which delivery apps are installed
    const uberEatsInstalled = await isAppInstalled(DELIVERY_APPS.UBER_EATS.scheme);
    const doorDashInstalled = await isAppInstalled(DELIVERY_APPS.DOORDASH.scheme);
    const grubhubInstalled = await isAppInstalled(DELIVERY_APPS.GRUBHUB.scheme);

    // Try to open in the first available app
    if (uberEatsInstalled) {
      return await openInUberEats(restaurantName, restaurantAddress);
    } else if (doorDashInstalled) {
      return await openInDoorDash(restaurantName, restaurantAddress);
    } else if (grubhubInstalled) {
      return await openInGrubhub(restaurantName, restaurantAddress);
    } else {
      // If no apps are installed, default to Uber Eats website
      return await openInUberEats(restaurantName, restaurantAddress);
    }
  } catch (error) {
    console.error("Error opening delivery app:", error);
    return { success: false, error };
  }
};

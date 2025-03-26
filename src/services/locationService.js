import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../constants";

// Request location permissions
export const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    // Store the permission status
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS + ".locationEnabled", status === "granted" ? "true" : "false");

    return {
      success: true,
      granted: status === "granted",
      status,
    };
  } catch (error) {
    console.error("Error requesting location permission:", error);
    return { success: false, error };
  }
};

// Check if location permissions are granted
export const checkLocationPermission = async () => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return {
      success: true,
      granted: status === "granted",
      status,
    };
  } catch (error) {
    console.error("Error checking location permission:", error);
    return { success: false, error };
  }
};

// Get the current location
export const getCurrentLocation = async () => {
  try {
    const permissionResponse = await checkLocationPermission();

    if (!permissionResponse.success || !permissionResponse.granted) {
      return {
        success: false,
        error: "Location permission not granted",
        permissionStatus: permissionResponse.status,
      };
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      success: true,
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      },
    };
  } catch (error) {
    console.error("Error getting current location:", error);
    return { success: false, error: error.message };
  }
};

// Get the address from coordinates (reverse geocoding)
export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    const addresses = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (addresses && addresses.length > 0) {
      return { success: true, address: addresses[0] };
    } else {
      return { success: false, error: "No address found" };
    }
  } catch (error) {
    console.error("Error getting address from coordinates:", error);
    return { success: false, error: error.message };
  }
};

// Get coordinates from address (forward geocoding)
export const getCoordinatesFromAddress = async (address) => {
  try {
    const locations = await Location.geocodeAsync(address);

    if (locations && locations.length > 0) {
      return {
        success: true,
        coordinates: {
          latitude: locations[0].latitude,
          longitude: locations[0].longitude,
        },
      };
    } else {
      return { success: false, error: "No coordinates found" };
    }
  } catch (error) {
    console.error("Error getting coordinates from address:", error);
    return { success: false, error: error.message };
  }
};

// Calculate distance between two coordinates in miles
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  // Haversine formula
  const R = 3958.8; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in miles

  return distance;
};

// Format distance for display
export const formatDistance = (distance) => {
  if (distance < 0.1) {
    // Convert to feet if less than 0.1 miles
    const feet = Math.round(distance * 5280);
    return `${feet} ft`;
  } else {
    // Round to 1 decimal place
    return `${distance.toFixed(1)} mi`;
  }
};

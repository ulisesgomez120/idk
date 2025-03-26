import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { API } from "../constants";

// REALLY IMPORTANT: This key should be stored securely and not in client-side code
// For production, use a backend proxy or environment variables
const API_KEY_STORAGE = process.env.GOOGLE_PLACES_API_KEY;

// Helper to get the API key from secure storage
const getApiKey = async () => {
  try {
    return await SecureStore.getItemAsync(API_KEY_STORAGE);
  } catch (error) {
    console.error("Error retrieving API key:", error);
    throw new Error("Failed to retrieve API key");
  }
};

// Helper to set the API key in secure storage
export const setApiKey = async (apiKey) => {
  try {
    await SecureStore.setItemAsync(API_KEY_STORAGE, apiKey);
    return { success: true };
  } catch (error) {
    console.error("Error storing API key:", error);
    return { success: false, error };
  }
};

// Convert miles to meters for the API
const milesToMeters = (miles) => Math.round(miles * 1609.34);

// Fetch nearby restaurants based on location and filters
export const fetchNearbyRestaurants = async (location, filters = {}) => {
  try {
    const apiKey = await getApiKey();

    if (!apiKey) {
      throw new Error("Google Places API key not found");
    }

    const { radius = API.DEFAULT_RADIUS, priceRange = API.DEFAULT_PRICE_RANGE, excludedCuisines = [] } = filters;

    // Convert radius from miles to meters
    const radiusInMeters = typeof radius === "number" ? milesToMeters(radius) : API.DEFAULT_RADIUS;

    // Build the URL for nearby search
    const url = `${API.PLACES_BASE_URL}/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=${radiusInMeters}&type=restaurant&key=${apiKey}`;

    // Add price level filter if specified
    const priceFilter =
      priceRange && priceRange.length > 0
        ? `&minprice=${Math.min(...priceRange)}&maxprice=${Math.max(...priceRange)}`
        : "";

    const response = await fetch(`${url}${priceFilter}`);
    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Places API error: ${data.status} - ${data.error_message || "Unknown error"}`);
    }

    // Filter out excluded cuisines if any
    let restaurants = data.results || [];

    if (excludedCuisines && excludedCuisines.length > 0) {
      restaurants = restaurants.filter((restaurant) => {
        // Check if any of the restaurant's types match excluded cuisines
        if (!restaurant.types) return true;

        const hasExcludedCuisine = restaurant.types.some((type) =>
          excludedCuisines.some((cuisine) => type.toLowerCase().includes(cuisine.toLowerCase()))
        );

        return !hasExcludedCuisine;
      });
    }

    return { success: true, restaurants };
  } catch (error) {
    console.error("Error fetching nearby restaurants:", error);
    return { success: false, error: error.message };
  }
};

// Get detailed information about a specific restaurant
export const getRestaurantDetails = async (placeId) => {
  try {
    const apiKey = await getApiKey();

    if (!apiKey) {
      throw new Error("Google Places API key not found");
    }

    // Fields to request (customize as needed)
    const fields = [
      "name",
      "formatted_address",
      "geometry",
      // "photos",
      "price_level",
      "rating",
      "user_ratings_total",
      "opening_hours",
      "website",
      "formatted_phone_number",
      "types",
      "delivery",
      "dine_in",
      "takeout",
    ].join(",");

    const url = `${API.PLACES_BASE_URL}/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      throw new Error(`Places API error: ${data.status} - ${data.error_message || "Unknown error"}`);
    }

    return { success: true, details: data.result };
  } catch (error) {
    console.error("Error fetching restaurant details:", error);
    return { success: false, error: error.message };
  }
};

// Get a photo for a restaurant
export const getRestaurantPhoto = async (photoReference, maxWidth = 400) => {
  return { success: false, error: error.message };
  // try {
  //   const apiKey = await getApiKey();

  //   if (!apiKey) {
  //     throw new Error("Google Places API key not found");
  //   }

  //   const url = `${API.PLACES_BASE_URL}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${apiKey}`;

  //   // For React Native, we just return the URL since we'll use it in an Image component
  //   return { success: true, photoUrl: url };
  // } catch (error) {
  //   console.error("Error getting restaurant photo URL:", error);
  //   return { success: false, error: error.message };
  // }
};

// Search for restaurants by text query (useful for specific searches)
export const searchRestaurants = async (query, location) => {
  try {
    const apiKey = await getApiKey();

    if (!apiKey) {
      throw new Error("Google Places API key not found");
    }

    const url = `${API.PLACES_BASE_URL}/textsearch/json?query=${encodeURIComponent(query)}&location=${
      location.latitude
    },${location.longitude}&radius=${API.DEFAULT_RADIUS}&type=restaurant&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Places API error: ${data.status} - ${data.error_message || "Unknown error"}`);
    }

    return { success: true, restaurants: data.results || [] };
  } catch (error) {
    console.error("Error searching restaurants:", error);
    return { success: false, error: error.message };
  }
};

// Get autocomplete suggestions for restaurant search
export const getAutocompleteSuggestions = async (input, location) => {
  try {
    const apiKey = await getApiKey();

    if (!apiKey) {
      throw new Error("Google Places API key not found");
    }

    const url = `${API.PLACES_BASE_URL}/autocomplete/json?input=${encodeURIComponent(input)}&location=${
      location.latitude
    },${location.longitude}&radius=${API.DEFAULT_RADIUS}&types=establishment&strictbounds=true&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Places API error: ${data.status} - ${data.error_message || "Unknown error"}`);
    }

    return { success: true, suggestions: data.predictions || [] };
  } catch (error) {
    console.error("Error getting autocomplete suggestions:", error);
    return { success: false, error: error.message };
  }
};

// App-wide constants

// Colors
export const COLORS = {
  primary: "#FF5722", // Orange
  secondary: "#2196F3", // Blue
  background: "#FFFFFF",
  text: "#212121",
  textLight: "#757575",
  accent: "#FFC107", // Amber
  success: "#4CAF50",
  error: "#F44336",
  border: "#E0E0E0",
};

// Fonts
export const FONTS = {
  regular: "System",
  medium: "System",
  bold: "System",
};

// Sizes
export const SIZES = {
  base: 8,
  small: 12,
  font: 14,
  medium: 16,
  large: 18,
  extraLarge: 24,
  xxl: 32,
  xxxl: 40,
};

// API
export const API = {
  PLACES_BASE_URL: "https://maps.googleapis.com/maps/api/place",
  DEFAULT_RADIUS: 5000, // 5km or ~3 miles
  DEFAULT_PRICE_RANGE: [1, 2, 3], // $, $$, $$$
};

// Storage Keys
export const STORAGE_KEYS = {
  USER_PROFILE: "user_profile",
  RECENT_RESTAURANTS: "recent_restaurants",
  SETTINGS: "settings",
};

// Default Settings
export const DEFAULT_SETTINGS = {
  searchRadius: 5, // miles
  priceRange: [1, 2, 3], // $, $$, $$$
  excludedCuisines: [],
  locationEnabled: true,
};

// Re-roll reasons
export const REROLL_REASONS = ["Too far", "Not in the mood", "Don't like this cuisine", "Too expensive", "Other"];

// Food delivery apps
export const DELIVERY_APPS = {
  UBER_EATS: {
    name: "Uber Eats",
    scheme: "ubereats://",
    fallbackUrl: "https://www.ubereats.com/search?q=",
  },
  DOORDASH: {
    name: "DoorDash",
    scheme: "doordash://",
    fallbackUrl: "https://www.doordash.com/search/",
  },
  GRUBHUB: {
    name: "Grubhub",
    scheme: "grubhub://",
    fallbackUrl: "https://www.grubhub.com/search?queryText=",
  },
};

// Time to live for recently suggested restaurants (7 days in milliseconds)
export const RECENT_RESTAURANT_TTL = 7 * 24 * 60 * 60 * 1000;

// Number of searches before showing an ad
export const SEARCHES_BEFORE_AD = 3;

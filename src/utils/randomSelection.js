import * as Crypto from "expo-crypto";

/**
 * Cryptographically secure random selection algorithm
 * Uses the crypto module to generate secure random values
 *
 * @param {Array} items - Array of items to select from
 * @param {Array} excludeIds - Optional array of IDs to exclude from selection
 * @param {String} idField - Optional field name to use for ID comparison (default: 'place_id')
 * @returns {Object} The randomly selected item
 */
export const secureRandomSelection = async (items, excludeIds = [], idField = "place_id") => {
  try {
    if (!items || items.length === 0) {
      throw new Error("No items provided for selection");
    }

    // Filter out excluded items
    const availableItems = excludeIds.length > 0 ? items.filter((item) => !excludeIds.includes(item[idField])) : items;

    if (availableItems.length === 0) {
      throw new Error("No items available after exclusion");
    }

    // Generate a cryptographically secure random number
    const randomBytes = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Date.now().toString() + Math.random().toString()
    );

    // Convert the first 4 bytes of the hash to an integer
    const randomValue = parseInt(randomBytes.substring(0, 8), 16);

    // Use the random value to select an item
    const selectedIndex = randomValue % availableItems.length;

    return availableItems[selectedIndex];
  } catch (error) {
    console.error("Error in secure random selection:", error);
    throw error;
  }
};

/**
 * Weighted random selection algorithm
 * Gives higher probability to items with higher weights
 *
 * @param {Array} items - Array of items to select from
 * @param {Function} weightFn - Function that returns the weight for an item
 * @param {Array} excludeIds - Optional array of IDs to exclude from selection
 * @param {String} idField - Optional field name to use for ID comparison (default: 'place_id')
 * @returns {Object} The randomly selected item
 */
export const weightedRandomSelection = async (items, weightFn, excludeIds = [], idField = "place_id") => {
  try {
    if (!items || items.length === 0) {
      throw new Error("No items provided for selection");
    }

    // Filter out excluded items
    const availableItems = excludeIds.length > 0 ? items.filter((item) => !excludeIds.includes(item[idField])) : items;

    if (availableItems.length === 0) {
      throw new Error("No items available after exclusion");
    }

    // Calculate weights for each item
    const itemsWithWeights = availableItems.map((item) => ({
      item,
      weight: weightFn(item),
    }));

    // Calculate total weight
    const totalWeight = itemsWithWeights.reduce((sum, { weight }) => sum + weight, 0);

    // Generate a cryptographically secure random number between 0 and totalWeight
    const randomBytes = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Date.now().toString() + Math.random().toString()
    );

    // Convert the first 4 bytes of the hash to an integer and scale to totalWeight
    const randomValue = (parseInt(randomBytes.substring(0, 8), 16) / 2 ** 32) * totalWeight;

    // Select an item based on the weights
    let cumulativeWeight = 0;
    for (const { item, weight } of itemsWithWeights) {
      cumulativeWeight += weight;
      if (randomValue <= cumulativeWeight) {
        return item;
      }
    }

    // Fallback to the last item (should rarely happen due to floating point precision)
    return itemsWithWeights[itemsWithWeights.length - 1].item;
  } catch (error) {
    console.error("Error in weighted random selection:", error);
    throw error;
  }
};

/**
 * Default weight function for restaurants
 * Combines rating and distance into a single weight
 *
 * @param {Object} restaurant - Restaurant object
 * @param {Object} userLocation - User's location {latitude, longitude}
 * @returns {Number} Weight value
 */
export const defaultRestaurantWeightFn = (restaurant, userLocation) => {
  // Default rating if not available
  const rating = restaurant.rating || 3;

  // Calculate distance if location is available
  let distanceWeight = 1;
  if (userLocation && restaurant.geometry && restaurant.geometry.location) {
    const restaurantLocation = restaurant.geometry.location;

    // Calculate distance using Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = ((restaurantLocation.lat - userLocation.latitude) * Math.PI) / 180;
    const dLon = ((restaurantLocation.lng - userLocation.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLocation.latitude * Math.PI) / 180) *
        Math.cos((restaurantLocation.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Convert distance to a weight (closer = higher weight)
    distanceWeight = 1 / (1 + distance);
  }

  // Combine rating and distance weights
  // Rating has a range of 1-5, so we normalize it to 0-1 range
  const ratingWeight = (rating - 1) / 4;

  // Final weight is a combination of rating and distance
  // We give more importance to rating (0.7) than distance (0.3)
  return ratingWeight * 0.7 + distanceWeight * 0.3;
};

/**
 * Get recently suggested restaurant IDs
 *
 * @param {Array} recentRestaurants - Array of recently suggested restaurants
 * @param {String} idField - Field name to use for ID (default: 'place_id')
 * @returns {Array} Array of restaurant IDs
 */
export const getRecentRestaurantIds = (recentRestaurants, idField = "place_id") => {
  if (!recentRestaurants || recentRestaurants.length === 0) {
    return [];
  }

  return recentRestaurants.map((restaurant) => restaurant[idField]);
};

/**
 * Filter restaurants by cuisine
 *
 * @param {Array} restaurants - Array of restaurants
 * @param {Array} excludedCuisines - Array of cuisine types to exclude
 * @returns {Array} Filtered restaurants
 */
export const filterByCuisine = (restaurants, excludedCuisines) => {
  if (!excludedCuisines || excludedCuisines.length === 0) {
    return restaurants;
  }

  return restaurants.filter((restaurant) => {
    // Skip if restaurant has no types
    if (!restaurant.types || restaurant.types.length === 0) {
      return true;
    }

    // Check if any of the restaurant's types match excluded cuisines
    const hasExcludedCuisine = restaurant.types.some((type) =>
      excludedCuisines.some((cuisine) => type.toLowerCase().includes(cuisine.toLowerCase()))
    );

    return !hasExcludedCuisine;
  });
};

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants";
import { fetchNearbyRestaurants, getRestaurantDetails, getRestaurantPhoto } from "../services/placesApi";
import { getCurrentLocation } from "../services/locationService";
import { secureRandomSelection, getRecentRestaurantIds } from "../utils/randomSelection";
import {
  getRecentRestaurants,
  addRecentRestaurant,
  getCurrentUser,
  recordSearch,
  recordSelection,
} from "../services/firebase";
import { openInMaps, openInDeliveryApp } from "../services/deepLinkService";
import { showInterstitialAd } from "../services/adService";
import { formatDistance, calculateDistance } from "../services/locationService";

const { width } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [location, setLocation] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [restaurantPhoto, setRestaurantPhoto] = useState(null);
  const [distance, setDistance] = useState(null);
  const [searchCount, setSearchCount] = useState(0);

  useEffect(() => {
    // Get user's location when component mounts
    const getLocation = async () => {
      const result = await getCurrentLocation();
      if (result.success) {
        setLocation(result.location);
      } else {
        Alert.alert(
          "Location Required",
          "This app needs your location to find restaurants near you. Please enable location services in your settings.",
          [{ text: "OK" }]
        );
      }
    };

    getLocation();
  }, []);

  const handleFindFood = async () => {
    if (!location) {
      Alert.alert("Location Required", "Please enable location services to find restaurants.");
      return;
    }

    setIsSearching(true);
    setIsLoading(true);
    setRestaurant(null);
    setRestaurantPhoto(null);
    setDistance(null);

    try {
      // Increment search count
      const newCount = searchCount + 1;
      setSearchCount(newCount);

      // Show ad if needed
      if (newCount % 3 === 0) {
        await showInterstitialAd();
      }

      // Get user's recent restaurants to avoid repeats
      const user = getCurrentUser();
      let recentRestaurantIds = [];

      if (user) {
        const recentResult = await getRecentRestaurants(user.uid);
        if (recentResult.success) {
          recentRestaurantIds = getRecentRestaurantIds(recentResult.restaurants);
        }
      }

      // Fetch nearby restaurants
      const result = await fetchNearbyRestaurants(location);

      if (!result.success || !result.restaurants || result.restaurants.length === 0) {
        throw new Error("No restaurants found nearby. Please try again later.");
      }

      // Record search analytics if user is logged in
      if (user) {
        await recordSearch(user.uid, location, {}, result.restaurants.length);
      }

      // Select a random restaurant, avoiding recent ones
      const selectedRestaurant = await secureRandomSelection(result.restaurants, recentRestaurantIds);

      // Get detailed information about the selected restaurant
      const detailsResult = await getRestaurantDetails(selectedRestaurant.place_id);

      if (!detailsResult.success) {
        throw new Error("Failed to get restaurant details. Please try again.");
      }

      const restaurantDetails = detailsResult.details;

      // Get restaurant photo if available
      if (restaurantDetails.photos && restaurantDetails.photos.length > 0) {
        const photoResult = await getRestaurantPhoto(restaurantDetails.photos[0].photo_reference);
        if (photoResult.success) {
          setRestaurantPhoto(photoResult.photoUrl);
        }
      }

      // Calculate distance
      if (restaurantDetails.geometry && restaurantDetails.geometry.location) {
        const restaurantLocation = restaurantDetails.geometry.location;
        const distanceInMiles = calculateDistance(
          location.latitude,
          location.longitude,
          restaurantLocation.lat,
          restaurantLocation.lng
        );
        setDistance(formatDistance(distanceInMiles));
      }

      // Save to recent restaurants if user is logged in
      if (user) {
        await addRecentRestaurant(user.uid, {
          place_id: restaurantDetails.place_id,
          name: restaurantDetails.name,
          suggestedAt: new Date().toISOString(),
        });
      }

      // Set the selected restaurant
      setRestaurant(restaurantDetails);

      // Record selection analytics if user is logged in
      if (user) {
        await recordSelection(user.uid, restaurantDetails.place_id, "view");
      }
    } catch (error) {
      console.error("Error finding restaurant:", error);
      Alert.alert("Error", error.message || "Failed to find a restaurant. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReRoll = () => {
    // Record reroll action if user is logged in
    const user = getCurrentUser();
    if (user && restaurant) {
      recordSelection(user.uid, restaurant.place_id, "reroll");
    }

    navigation.navigate("ReRoll", { restaurant });
  };

  const handleGetDirections = () => {
    if (restaurant && restaurant.geometry && restaurant.geometry.location) {
      // Record directions action if user is logged in
      const user = getCurrentUser();
      if (user) {
        recordSelection(user.uid, restaurant.place_id, "directions");
      }

      openInMaps(restaurant.name, restaurant.geometry.location.lat, restaurant.geometry.location.lng);
    }
  };

  const handleOrderOnline = () => {
    if (restaurant) {
      // Record order action if user is logged in
      const user = getCurrentUser();
      if (user) {
        recordSelection(user.uid, restaurant.place_id, "order");
      }

      openInDeliveryApp(restaurant.name, restaurant.formatted_address);
    }
  };

  const handleRestaurantDetails = () => {
    if (restaurant) {
      // Record details view action if user is logged in
      const user = getCurrentUser();
      if (user) {
        recordSelection(user.uid, restaurant.place_id, "details");
      }

      navigation.navigate("RestaurantDetail", { restaurant, photo: restaurantPhoto });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>IDK</Text>
          <Text style={styles.subtitle}>Let us decide where to eat</Text>
        </View>

        {!isSearching ? (
          <View style={styles.startContainer}>
            <Image source={require("../../assets/icon.png")} style={styles.logo} resizeMode='contain' />
            <TouchableOpacity style={styles.findFoodButton} onPress={handleFindFood} disabled={isLoading || !location}>
              <Text style={styles.findFoodButtonText}>Find Food</Text>
            </TouchableOpacity>
            {!location && (
              <Text style={styles.locationWarning}>Location services are required to find restaurants near you.</Text>
            )}
          </View>
        ) : (
          <View style={styles.resultContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size='large' color={COLORS.primary} />
                <Text style={styles.loadingText}>Finding the perfect spot...</Text>
              </View>
            ) : restaurant ? (
              <View style={styles.restaurantContainer}>
                <TouchableOpacity onPress={handleRestaurantDetails} style={styles.restaurantCard}>
                  {restaurantPhoto ? (
                    <Image source={{ uri: restaurantPhoto }} style={styles.restaurantImage} />
                  ) : (
                    <View style={styles.noImageContainer}>
                      <Ionicons name='restaurant' size={60} color={COLORS.primary} />
                      <Text style={styles.noImageText}>No Image Available</Text>
                    </View>
                  )}

                  <View style={styles.restaurantInfo}>
                    <Text style={styles.restaurantName}>{restaurant.name}</Text>

                    <View style={styles.detailRow}>
                      {restaurant.types && restaurant.types.length > 0 && (
                        <Text style={styles.cuisineText}>{restaurant.types[0].replace(/_/g, " ")}</Text>
                      )}

                      {restaurant.price_level && (
                        <Text style={styles.priceText}>{"$".repeat(restaurant.price_level)}</Text>
                      )}

                      {distance && <Text style={styles.distanceText}>{distance}</Text>}
                    </View>

                    {restaurant.rating && (
                      <View style={styles.ratingContainer}>
                        <Ionicons name='star' size={16} color={COLORS.accent} />
                        <Text style={styles.ratingText}>
                          {restaurant.rating.toFixed(1)}
                          {restaurant.user_ratings_total && (
                            <Text style={styles.ratingsCount}> ({restaurant.user_ratings_total})</Text>
                          )}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>

                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity style={styles.actionButton} onPress={handleGetDirections}>
                    <Ionicons name='navigate' size={24} color={COLORS.background} />
                    <Text style={styles.actionButtonText}>Directions</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionButton} onPress={handleOrderOnline}>
                    <Ionicons name='cart' size={24} color={COLORS.background} />
                    <Text style={styles.actionButtonText}>Order Online</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.reRollButton} onPress={handleReRoll}>
                  <Ionicons name='refresh' size={20} color={COLORS.background} />
                  <Text style={styles.reRollButtonText}>Try Another</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.errorContainer}>
                <Ionicons name='warning' size={60} color={COLORS.error} />
                <Text style={styles.errorText}>Couldn't find any restaurants. Please try again.</Text>
                <TouchableOpacity style={styles.findFoodButton} onPress={handleFindFood}>
                  <Text style={styles.findFoodButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SIZES.large,
  },
  header: {
    alignItems: "center",
    marginBottom: SIZES.xxl,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
  },
  startContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: SIZES.xxl,
  },
  findFoodButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.base,
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.large,
    alignItems: "center",
    width: "80%",
  },
  findFoodButtonText: {
    color: COLORS.background,
    fontSize: SIZES.large,
    fontWeight: "bold",
  },
  locationWarning: {
    color: COLORS.error,
    textAlign: "center",
    marginTop: SIZES.large,
    paddingHorizontal: SIZES.large,
  },
  resultContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    alignItems: "center",
  },
  loadingText: {
    marginTop: SIZES.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  restaurantContainer: {
    width: "100%",
    alignItems: "center",
  },
  restaurantCard: {
    width: "100%",
    backgroundColor: COLORS.background,
    borderRadius: SIZES.base,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SIZES.medium,
  },
  restaurantImage: {
    width: "100%",
    height: 200,
  },
  noImageContainer: {
    width: "100%",
    height: 200,
    backgroundColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  noImageText: {
    color: COLORS.textLight,
    marginTop: SIZES.small,
  },
  restaurantInfo: {
    padding: SIZES.medium,
  },
  restaurantName: {
    fontSize: SIZES.large,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SIZES.small,
  },
  detailRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: SIZES.small,
  },
  cuisineText: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    backgroundColor: COLORS.border,
    paddingHorizontal: SIZES.small,
    paddingVertical: 2,
    borderRadius: SIZES.base,
    marginRight: SIZES.small,
    marginBottom: SIZES.small,
    textTransform: "capitalize",
  },
  priceText: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    backgroundColor: COLORS.border,
    paddingHorizontal: SIZES.small,
    paddingVertical: 2,
    borderRadius: SIZES.base,
    marginRight: SIZES.small,
    marginBottom: SIZES.small,
  },
  distanceText: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    backgroundColor: COLORS.border,
    paddingHorizontal: SIZES.small,
    paddingVertical: 2,
    borderRadius: SIZES.base,
    marginBottom: SIZES.small,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginLeft: SIZES.small,
  },
  ratingsCount: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: SIZES.medium,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.base,
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.medium,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    flex: 1,
    marginHorizontal: SIZES.small,
  },
  actionButtonText: {
    color: COLORS.background,
    fontSize: SIZES.medium,
    fontWeight: "600",
    marginLeft: SIZES.small,
  },
  reRollButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.base,
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.large,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    width: "100%",
  },
  reRollButtonText: {
    color: COLORS.background,
    fontSize: SIZES.medium,
    fontWeight: "600",
    marginLeft: SIZES.small,
  },
  errorContainer: {
    alignItems: "center",
    padding: SIZES.large,
  },
  errorText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    textAlign: "center",
    marginVertical: SIZES.large,
  },
});

export default HomeScreen;

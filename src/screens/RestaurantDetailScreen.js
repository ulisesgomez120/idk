import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
  ActivityIndicator,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants";
import { openInMaps, openInDeliveryApp, openWebsite } from "../services/deepLinkService";

const RestaurantDetailScreen = ({ route, navigation }) => {
  const { restaurant, photo } = route.params || {};
  const [isLoading, setIsLoading] = useState(false);

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name='warning' size={60} color={COLORS.error} />
        <Text style={styles.errorText}>Restaurant information not available</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleGetDirections = () => {
    if (restaurant && restaurant.geometry && restaurant.geometry.location) {
      openInMaps(restaurant.name, restaurant.geometry.location.lat, restaurant.geometry.location.lng);
    }
  };

  const handleOrderOnline = () => {
    if (restaurant) {
      openInDeliveryApp(restaurant.name, restaurant.formatted_address);
    }
  };

  const handleOpenWebsite = () => {
    if (restaurant && restaurant.website) {
      openWebsite(restaurant.website);
    }
  };

  const handleCall = () => {
    if (restaurant && restaurant.formatted_phone_number) {
      const phoneNumber = restaurant.formatted_phone_number.replace(/\D/g, "");
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleShare = async () => {
    try {
      const message = `Check out ${restaurant.name}!\n${restaurant.formatted_address}\n${restaurant.website || ""}`;
      await Share.share({
        message,
        title: restaurant.name,
      });
    } catch (error) {
      console.error("Error sharing restaurant:", error);
    }
  };

  const formatOpeningHours = (openingHours) => {
    if (!openingHours || !openingHours.weekday_text) {
      return "Opening hours not available";
    }

    return openingHours.weekday_text;
  };

  const isOpenNow = () => {
    if (!restaurant.opening_hours) {
      return null;
    }

    return restaurant.opening_hours.open_now;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Restaurant Image */}
        {photo ? (
          <Image source={{ uri: photo }} style={styles.restaurantImage} />
        ) : (
          <View style={styles.noImageContainer}>
            <Ionicons name='restaurant' size={60} color={COLORS.primary} />
            <Text style={styles.noImageText}>No Image Available</Text>
          </View>
        )}

        {/* Restaurant Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>

          {/* Rating */}
          {restaurant.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name='star' size={20} color={COLORS.accent} />
              <Text style={styles.ratingText}>
                {restaurant.rating.toFixed(1)}
                {restaurant.user_ratings_total && (
                  <Text style={styles.ratingsCount}> ({restaurant.user_ratings_total} reviews)</Text>
                )}
              </Text>
            </View>
          )}

          {/* Price Level */}
          {restaurant.price_level && <Text style={styles.priceText}>{"$".repeat(restaurant.price_level)}</Text>}

          {/* Cuisine Types */}
          {restaurant.types && restaurant.types.length > 0 && (
            <View style={styles.cuisineContainer}>
              {restaurant.types.slice(0, 3).map((type, index) => (
                <Text key={index} style={styles.cuisineText}>
                  {type.replace(/_/g, " ")}
                </Text>
              ))}
            </View>
          )}

          {/* Open Now */}
          {isOpenNow() !== null && (
            <Text style={[styles.openStatusText, isOpenNow() ? styles.openText : styles.closedText]}>
              {isOpenNow() ? "Open Now" : "Closed Now"}
            </Text>
          )}

          {/* Address */}
          {restaurant.formatted_address && (
            <View style={styles.addressContainer}>
              <Ionicons name='location' size={20} color={COLORS.primary} />
              <Text style={styles.addressText}>{restaurant.formatted_address}</Text>
            </View>
          )}

          {/* Phone */}
          {restaurant.formatted_phone_number && (
            <TouchableOpacity style={styles.phoneContainer} onPress={handleCall}>
              <Ionicons name='call' size={20} color={COLORS.primary} />
              <Text style={styles.phoneText}>{restaurant.formatted_phone_number}</Text>
            </TouchableOpacity>
          )}

          {/* Website */}
          {restaurant.website && (
            <TouchableOpacity style={styles.websiteContainer} onPress={handleOpenWebsite}>
              <Ionicons name='globe' size={20} color={COLORS.primary} />
              <Text style={styles.websiteText} numberOfLines={1} ellipsizeMode='tail'>
                {restaurant.website.replace(/^https?:\/\//, "")}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Opening Hours */}
        {restaurant.opening_hours && restaurant.opening_hours.weekday_text && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Opening Hours</Text>
            {formatOpeningHours(restaurant.opening_hours).map((day, index) => (
              <Text key={index} style={styles.hoursText}>
                {day}
              </Text>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleGetDirections}>
            <Ionicons name='navigate' size={24} color={COLORS.background} />
            <Text style={styles.actionButtonText}>Directions</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleOrderOnline}>
            <Ionicons name='cart' size={24} color={COLORS.background} />
            <Text style={styles.actionButtonText}>Order Online</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name='share' size={24} color={COLORS.background} />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
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
  },
  restaurantImage: {
    width: "100%",
    height: 250,
  },
  noImageContainer: {
    width: "100%",
    height: 250,
    backgroundColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  noImageText: {
    color: COLORS.textLight,
    marginTop: SIZES.small,
  },
  infoContainer: {
    padding: SIZES.large,
  },
  restaurantName: {
    fontSize: SIZES.xxl,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SIZES.small,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.small,
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
  priceText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: SIZES.small,
  },
  cuisineContainer: {
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
  openStatusText: {
    fontSize: SIZES.medium,
    fontWeight: "bold",
    marginBottom: SIZES.medium,
  },
  openText: {
    color: COLORS.success,
  },
  closedText: {
    color: COLORS.error,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SIZES.medium,
  },
  addressText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginLeft: SIZES.small,
    flex: 1,
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.medium,
  },
  phoneText: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
    marginLeft: SIZES.small,
    textDecorationLine: "underline",
  },
  websiteContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.medium,
  },
  websiteText: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
    marginLeft: SIZES.small,
    textDecorationLine: "underline",
    flex: 1,
  },
  sectionContainer: {
    padding: SIZES.large,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SIZES.medium,
  },
  hoursText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: SIZES.small,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: SIZES.large,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.base,
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.medium,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: SIZES.small,
    flexDirection: "row",
  },
  actionButtonText: {
    color: COLORS.background,
    fontSize: SIZES.medium,
    fontWeight: "600",
    marginLeft: SIZES.small,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.large,
  },
  errorText: {
    fontSize: SIZES.large,
    color: COLORS.text,
    textAlign: "center",
    marginVertical: SIZES.large,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.base,
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.large,
    alignItems: "center",
  },
  backButtonText: {
    color: COLORS.background,
    fontSize: SIZES.medium,
    fontWeight: "bold",
  },
});

export default RestaurantDetailScreen;

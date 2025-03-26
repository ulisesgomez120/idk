import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES, REROLL_REASONS } from "../constants";
import { getCurrentUser, updateUserSettings, getUserProfile, addFeedback } from "../services/firebase";

const ReRollScreen = ({ route, navigation }) => {
  const { restaurant } = route.params || {};
  const [selectedReason, setSelectedReason] = useState(null);
  const [excludeSimilar, setExcludeSimilar] = useState(false);

  const handleReasonSelect = (reason) => {
    setSelectedReason(reason);
  };

  const handleExcludeSimilarToggle = () => {
    setExcludeSimilar(!excludeSimilar);
  };

  const handleFindAnother = async () => {
    if (!selectedReason) {
      Alert.alert("Please Select a Reason", "Please select a reason for re-rolling before continuing.");
      return;
    }

    try {
      const user = getCurrentUser();

      // Record feedback if user is logged in
      if (user && restaurant && restaurant.place_id) {
        // Determine which cuisine to exclude (if any)
        const excludedCuisine =
          excludeSimilar && restaurant.types && restaurant.types.length > 0 ? restaurant.types[0] : null;

        // Add feedback to Firestore
        await addFeedback(user.uid, restaurant.place_id, selectedReason, excludedCuisine);
      }

      // If user is logged in and they want to exclude similar cuisines
      if (excludeSimilar && restaurant && restaurant.types && restaurant.types.length > 0) {
        const user = getCurrentUser();

        if (user) {
          // Get current user settings
          const profileResult = await getUserProfile(user.uid);

          if (profileResult.success && profileResult.profile) {
            const currentSettings = profileResult.profile.settings || {};
            const currentExcludedCuisines = currentSettings.excludedCuisines || [];

            // Add the primary cuisine type to excluded cuisines if it exists
            if (restaurant.types && restaurant.types[0]) {
              const cuisineToExclude = restaurant.types[0];

              if (!currentExcludedCuisines.includes(cuisineToExclude)) {
                const updatedExcludedCuisines = [...currentExcludedCuisines, cuisineToExclude];

                // Update user settings
                await updateUserSettings(user.uid, {
                  ...currentSettings,
                  excludedCuisines: updatedExcludedCuisines,
                });

                // Inform the user
                Alert.alert(
                  "Cuisine Excluded",
                  `You won't see "${cuisineToExclude.replace(
                    /_/g,
                    " "
                  )}" restaurants in future searches. You can change this in Settings.`,
                  [{ text: "OK" }]
                );
              }
            }
          }
        }
      }

      // Navigate back to home screen to find another restaurant
      navigation.navigate("HomeScreen");
    } catch (error) {
      console.error("Error updating excluded cuisines:", error);
      // Still navigate back even if there was an error
      navigation.navigate("HomeScreen");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Why are you re-rolling?</Text>
          <Text style={styles.subtitle}>Help us understand your preferences better</Text>
        </View>

        <View style={styles.reasonsContainer}>
          {REROLL_REASONS.map((reason) => (
            <TouchableOpacity
              key={reason}
              style={[styles.reasonButton, selectedReason === reason && styles.selectedReasonButton]}
              onPress={() => handleReasonSelect(reason)}>
              <Text style={[styles.reasonText, selectedReason === reason && styles.selectedReasonText]}>{reason}</Text>
              {selectedReason === reason && (
                <Ionicons name='checkmark-circle' size={24} color={COLORS.background} style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {restaurant && restaurant.types && restaurant.types.length > 0 && (
          <View style={styles.excludeContainer}>
            <View style={styles.excludeRow}>
              <Text style={styles.excludeText}>Exclude similar cuisines in the future</Text>
              <Switch
                value={excludeSimilar}
                onValueChange={handleExcludeSimilarToggle}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.background}
              />
            </View>
            {excludeSimilar && restaurant && restaurant.types && restaurant.types[0] && (
              <Text style={styles.excludeNote}>
                This will add "{restaurant.types[0].replace(/_/g, " ")}" to your excluded cuisines list.
              </Text>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.findButton, !selectedReason && styles.disabledButton]}
          onPress={handleFindAnother}
          disabled={!selectedReason}>
          <Ionicons name='search' size={24} color={COLORS.background} />
          <Text style={styles.findButtonText}>Find Another Restaurant</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
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
    fontSize: SIZES.xxl,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SIZES.small,
    textAlign: "center",
  },
  subtitle: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    textAlign: "center",
  },
  reasonsContainer: {
    marginBottom: SIZES.xxl,
  },
  reasonButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
  },
  selectedReasonButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  reasonText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    flex: 1,
  },
  selectedReasonText: {
    color: COLORS.background,
    fontWeight: "bold",
  },
  checkIcon: {
    marginLeft: SIZES.small,
  },
  excludeContainer: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    marginBottom: SIZES.xxl,
  },
  excludeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  excludeText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    flex: 1,
    marginRight: SIZES.medium,
  },
  excludeNote: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginTop: SIZES.small,
    fontStyle: "italic",
  },
  findButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: SIZES.medium,
  },
  disabledButton: {
    opacity: 0.5,
  },
  findButtonText: {
    color: COLORS.background,
    fontSize: SIZES.medium,
    fontWeight: "bold",
    marginLeft: SIZES.small,
  },
  cancelButton: {
    padding: SIZES.medium,
    alignItems: "center",
  },
  cancelButtonText: {
    color: COLORS.textLight,
    fontSize: SIZES.medium,
  },
});

export default ReRollScreen;

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { COLORS, SIZES, DEFAULT_SETTINGS } from "../constants";
import { getCurrentUser, getUserProfile, updateUserSettings, signOut } from "../services/firebase";
import { requestLocationPermission, checkLocationPermission } from "../services/locationService";
import { setApiKey } from "../services/placesApi";
import { resetSearchCount } from "../services/adService";

const SettingsScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [excludedCuisines, setExcludedCuisines] = useState([]);
  const [locationPermission, setLocationPermission] = useState(false);
  const [apiKeyModalVisible, setApiKeyModalVisible] = useState(false);
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    loadSettings();
    checkLocationStatus();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const user = getCurrentUser();

      if (user) {
        const result = await getUserProfile(user.uid);

        if (result.success && result.profile && result.profile.settings) {
          setSettings(result.profile.settings);
          setExcludedCuisines(result.profile.settings.excludedCuisines || []);
        } else {
          // Use default settings if no settings found
          setSettings(DEFAULT_SETTINGS);
          setExcludedCuisines([]);
        }
      } else {
        // Use default settings if not logged in
        setSettings(DEFAULT_SETTINGS);
        setExcludedCuisines([]);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      Alert.alert("Error", "Failed to load settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const checkLocationStatus = async () => {
    try {
      const result = await checkLocationPermission();
      setLocationPermission(result.granted);
    } catch (error) {
      console.error("Error checking location permission:", error);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const user = getCurrentUser();

      if (user) {
        const updatedSettings = {
          ...settings,
          excludedCuisines,
        };

        const result = await updateUserSettings(user.uid, updatedSettings);

        if (result.success) {
          Alert.alert("Success", "Settings saved successfully.");
        } else {
          Alert.alert("Error", "Failed to save settings. Please try again.");
        }
      } else {
        Alert.alert("Not Logged In", "You need to be logged in to save settings.");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      Alert.alert("Error", "Failed to save settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationToggle = async () => {
    try {
      if (!locationPermission) {
        const result = await requestLocationPermission();
        setLocationPermission(result.granted);

        // Update settings
        setSettings({
          ...settings,
          locationEnabled: result.granted,
        });
      } else {
        // If already granted, just toggle the setting
        setSettings({
          ...settings,
          locationEnabled: !settings.locationEnabled,
        });
      }
    } catch (error) {
      console.error("Error toggling location permission:", error);
    }
  };

  const handleRemoveCuisine = (cuisine) => {
    setExcludedCuisines(excludedCuisines.filter((c) => c !== cuisine));
  };

  const handleRadiusChange = (value) => {
    setSettings({
      ...settings,
      searchRadius: value,
    });
  };

  const handlePriceToggle = (price) => {
    const currentPriceRange = settings.priceRange || [];

    if (currentPriceRange.includes(price)) {
      // Remove price if already included
      setSettings({
        ...settings,
        priceRange: currentPriceRange.filter((p) => p !== price),
      });
    } else {
      // Add price if not included
      setSettings({
        ...settings,
        priceRange: [...currentPriceRange, price].sort(),
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigation will handle redirect to login screen
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert("Error", "Please enter a valid API key.");
      return;
    }

    try {
      const result = await setApiKey(apiKey.trim());

      if (result.success) {
        Alert.alert("Success", "API key saved successfully.");
        setApiKeyModalVisible(false);
      } else {
        Alert.alert("Error", "Failed to save API key. Please try again.");
      }
    } catch (error) {
      console.error("Error saving API key:", error);
      Alert.alert("Error", "Failed to save API key. Please try again.");
    }
  };

  const handleResetSearchCount = async () => {
    try {
      await resetSearchCount();
      Alert.alert("Success", "Search count reset successfully.");
    } catch (error) {
      console.error("Error resetting search count:", error);
      Alert.alert("Error", "Failed to reset search count. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Preferences</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Search Radius</Text>
            <Text style={styles.settingValue}>{settings.searchRadius} miles</Text>
          </View>

          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={25}
            step={1}
            value={settings.searchRadius}
            onValueChange={handleRadiusChange}
            minimumTrackTintColor={COLORS.primary}
            maximumTrackTintColor={COLORS.border}
            thumbTintColor={COLORS.primary}
          />

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Price Range</Text>
            <View style={styles.priceContainer}>
              {[1, 2, 3, 4].map((price) => (
                <TouchableOpacity
                  key={price}
                  style={[
                    styles.priceButton,
                    settings.priceRange && settings.priceRange.includes(price) && styles.priceButtonActive,
                  ]}
                  onPress={() => handlePriceToggle(price)}>
                  <Text
                    style={[
                      styles.priceButtonText,
                      settings.priceRange && settings.priceRange.includes(price) && styles.priceButtonTextActive,
                    ]}>
                    {"$".repeat(price)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Excluded Cuisines</Text>

          {excludedCuisines.length === 0 ? (
            <Text style={styles.noCuisinesText}>No cuisines excluded</Text>
          ) : (
            <View style={styles.cuisinesList}>
              {excludedCuisines.map((cuisine) => (
                <View key={cuisine} style={styles.cuisineItem}>
                  <Text style={styles.cuisineText}>{cuisine.replace(/_/g, " ")}</Text>
                  <TouchableOpacity style={styles.removeCuisineButton} onPress={() => handleRemoveCuisine(cuisine)}>
                    <Ionicons name='close-circle' size={24} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Enable Location Services</Text>
            <Switch
              value={settings.locationEnabled}
              onValueChange={handleLocationToggle}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.background}
              disabled={!locationPermission}
            />
          </View>

          {!locationPermission && (
            <Text style={styles.locationWarning}>
              Location permission is required for this app to function properly. Please enable location services in your
              device settings.
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Configuration</Text>

          <TouchableOpacity style={styles.apiKeyButton} onPress={() => setApiKeyModalVisible(true)}>
            <Ionicons name='key' size={24} color={COLORS.primary} />
            <Text style={styles.apiKeyButtonText}>Set Google Places API Key</Text>
          </TouchableOpacity>

          <Text style={styles.apiKeyNote}>
            You need to provide your own Google Places API key to use this app. The key will be stored securely on your
            device.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name='log-out' size={24} color={COLORS.background} />
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Debug</Text>

          <TouchableOpacity style={styles.debugButton} onPress={handleResetSearchCount}>
            <Text style={styles.debugButtonText}>Reset Ad Counter</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={apiKeyModalVisible}
        transparent={true}
        animationType='slide'
        onRequestClose={() => setApiKeyModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Google Places API Key</Text>

            <TextInput
              style={styles.apiKeyInput}
              placeholder='Enter your API key'
              value={apiKey}
              onChangeText={setApiKey}
              autoCapitalize='none'
              autoCorrect={false}
            />

            <Text style={styles.modalNote}>
              You can get an API key from the Google Cloud Console. Make sure to enable the Places API for your project.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setApiKeyModalVisible(false)}>
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalSaveButton} onPress={handleSaveApiKey}>
                <Text style={styles.modalSaveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SIZES.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SIZES.large,
  },
  section: {
    marginBottom: SIZES.xxl,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SIZES.medium,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.medium,
  },
  settingLabel: {
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  settingValue: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  slider: {
    width: "100%",
    height: 40,
    marginBottom: SIZES.medium,
  },
  priceContainer: {
    flexDirection: "row",
  },
  priceButton: {
    width: 40,
    height: 40,
    borderRadius: SIZES.base,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: SIZES.small,
  },
  priceButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  priceButtonText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  priceButtonTextActive: {
    color: COLORS.background,
  },
  noCuisinesText: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    fontStyle: "italic",
  },
  cuisinesList: {
    marginTop: SIZES.small,
  },
  cuisineItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    marginBottom: SIZES.small,
  },
  cuisineText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    textTransform: "capitalize",
  },
  removeCuisineButton: {
    padding: SIZES.small,
  },
  locationWarning: {
    fontSize: SIZES.small,
    color: COLORS.error,
    marginTop: SIZES.small,
  },
  apiKeyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
  },
  apiKeyButtonText: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
    marginLeft: SIZES.small,
  },
  apiKeyNote: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.error,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
  },
  signOutButtonText: {
    fontSize: SIZES.medium,
    color: COLORS.background,
    fontWeight: "bold",
    marginLeft: SIZES.small,
  },
  debugButton: {
    backgroundColor: COLORS.border,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    alignItems: "center",
  },
  debugButtonText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    alignItems: "center",
    marginTop: SIZES.large,
    marginBottom: SIZES.xxl,
  },
  saveButtonText: {
    fontSize: SIZES.medium,
    color: COLORS.background,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: COLORS.background,
    borderRadius: SIZES.base,
    padding: SIZES.large,
  },
  modalTitle: {
    fontSize: SIZES.large,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SIZES.medium,
  },
  apiKeyInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    fontSize: SIZES.medium,
    marginBottom: SIZES.medium,
  },
  modalNote: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: SIZES.large,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalCancelButton: {
    padding: SIZES.medium,
    alignItems: "center",
    flex: 1,
    marginRight: SIZES.small,
  },
  modalCancelButtonText: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
  },
  modalSaveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    alignItems: "center",
    flex: 1,
    marginLeft: SIZES.small,
  },
  modalSaveButtonText: {
    fontSize: SIZES.medium,
    color: COLORS.background,
    fontWeight: "bold",
  },
});

export default SettingsScreen;

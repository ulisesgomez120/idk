import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES } from "../constants";
import { resetPassword } from "../services/firebase";

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleResetPassword = async () => {
    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword(email);

      if (result.success) {
        Alert.alert("Password Reset Email Sent", "Check your email for instructions to reset your password.", [
          { text: "OK", onPress: () => navigation.navigate("Login") },
        ]);
      } else {
        Alert.alert("Error", result.error || "Failed to send password reset email. Please try again.");
      }
    } catch (error) {
      console.error("Error sending password reset:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.logoContainer}>
            <Image source={require("../../assets/icon.png")} style={styles.logo} resizeMode='contain' />
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter your email to receive a password reset link</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder='Enter your email'
              placeholderTextColor={COLORS.textLight}
              keyboardType='email-address'
              autoCapitalize='none'
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={isLoading}>
              <Text style={styles.buttonText}>{isLoading ? "Sending..." : "Send Reset Link"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Login")}>
              <Text style={styles.backButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    padding: SIZES.large,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: SIZES.xxl,
    marginBottom: SIZES.xxl,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: SIZES.medium,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: SIZES.small,
  },
  subtitle: {
    fontSize: SIZES.large,
    color: COLORS.textLight,
    textAlign: "center",
    marginHorizontal: SIZES.large,
  },
  formContainer: {
    marginBottom: SIZES.xxl,
  },
  label: {
    fontSize: SIZES.medium,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SIZES.small,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: SIZES.large,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    alignItems: "center",
    marginTop: SIZES.medium,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: SIZES.medium,
    fontWeight: "600",
  },
  backButton: {
    alignItems: "center",
    marginTop: SIZES.xxl,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: SIZES.medium,
    fontWeight: "600",
  },
});

export default ForgotPasswordScreen;

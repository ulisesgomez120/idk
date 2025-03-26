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
import { registerUser } from "../services/firebase";

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleRegister = async () => {
    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      Alert.alert("Invalid Password", "Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match. Please try again.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser(email, password);

      if (result.success) {
        Alert.alert("Registration Successful", "Your account has been created successfully.", [
          { text: "OK", onPress: () => navigation.navigate("Login") },
        ]);
      } else {
        Alert.alert("Registration Failed", result.error || "Failed to register. Please try again.");
      }
    } catch (error) {
      console.error("Error registering:", error);
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>
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

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder='Create a password'
                placeholderTextColor={COLORS.textLight}
                secureTextEntry={!showPassword}
                autoCapitalize='none'
                autoCorrect={false}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity style={styles.showPasswordButton} onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.showPasswordText}>{showPassword ? "Hide" : "Show"}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder='Confirm your password'
                placeholderTextColor={COLORS.textLight}
                secureTextEntry={!showPassword}
                autoCapitalize='none'
                autoCorrect={false}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}>
              <Text style={styles.buttonText}>{isLoading ? "Creating Account..." : "Create Account"}</Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.base,
    marginBottom: SIZES.large,
  },
  passwordInput: {
    flex: 1,
    padding: SIZES.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  showPasswordButton: {
    paddingHorizontal: SIZES.medium,
  },
  showPasswordText: {
    color: COLORS.primary,
    fontSize: SIZES.small,
    fontWeight: "600",
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SIZES.large,
  },
  loginText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  loginLink: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
    fontWeight: "600",
  },
});

export default RegisterScreen;

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
import { loginUser, resetPassword } from "../services/firebase";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      Alert.alert("Invalid Password", "Please enter a valid password (at least 6 characters).");
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginUser(email, password);

      if (result.success) {
        // User is now logged in, navigation will handle the redirect
      } else {
        Alert.alert("Login Failed", result.error || "Failed to login. Please try again.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const handleRegister = () => {
    navigation.navigate("Register");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.logoContainer}>
            <Image source={require("../../assets/icon.png")} style={styles.logo} resizeMode='contain' />
            <Text style={styles.title}>IDK</Text>
            <Text style={styles.subtitle}>Let us decide where to eat</Text>
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
                placeholder='Enter your password'
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

            <TouchableOpacity style={styles.forgotPasswordButton} onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}>
              <Text style={styles.buttonText}>{isLoading ? "Signing in..." : "Sign In"}</Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={handleRegister}>
                <Text style={styles.registerLink}>Register</Text>
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
    marginBottom: SIZES.medium,
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
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: SIZES.large,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: SIZES.small,
    fontWeight: "600",
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    alignItems: "center",
    marginTop: SIZES.small,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: SIZES.medium,
    fontWeight: "600",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SIZES.large,
  },
  registerText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  registerLink: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
    fontWeight: "600",
  },
});

export default LoginScreen;

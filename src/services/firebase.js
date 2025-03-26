import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

// import { getAnalytics } from "firebase/analytics";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS, RECENT_RESTAURANT_TTL, DEFAULT_SETTINGS } from "../constants";

// Your Firebase configuration
// IMPORTANT: This should be replaced with your actual Firebase config
// and ideally loaded from environment variables or a secure storage
// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBSavVparuO0E48GI2xzu25RoYaEjUsKas",
  authDomain: "idk-app-5a3a3.firebaseapp.com",
  projectId: "idk-app-5a3a3",
  storageBucket: "idk-app-5a3a3.firebasestorage.app",
  messagingSenderId: "475305927133",
  appId: "1:475305927133:web:e12df270d5a051df4e5634",
  measurementId: "G-V8MLKFF7GK",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const db = getFirestore(app);
// const analytics = getAnalytics(app);

// Authentication functions
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Create user profile in Firestore
    await createUserProfile(userCredential.user.uid, { email: userCredential.user.email });

    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Error registering user:", error);
    let errorMessage = "Failed to register. Please try again.";

    if (error.code === "auth/email-already-in-use") {
      errorMessage = "This email is already registered. Please sign in instead.";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email address.";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Password is too weak. Please use a stronger password.";
    }

    return { success: false, error: errorMessage };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Error signing in:", error);
    let errorMessage = "Failed to sign in. Please check your credentials and try again.";

    if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
      errorMessage = "Invalid email or password.";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email address.";
    } else if (error.code === "auth/user-disabled") {
      errorMessage = "This account has been disabled.";
    }

    return { success: false, error: errorMessage };
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    let errorMessage = "Failed to send password reset email.";

    if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email address.";
    } else if (error.code === "auth/user-not-found") {
      errorMessage = "No account found with this email.";
    }

    return { success: false, error: errorMessage };
  }
};

export const signOut = async () => {
  try {
    await auth.signOut();
    return { success: true };
  } catch (error) {
    console.error("Error signing out:", error);
    return { success: false, error };
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

// Firestore functions
export const createUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create new user profile
      await setDoc(userRef, {
        ...userData,
        settings: DEFAULT_SETTINGS,
        recentRestaurants: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      // Update existing user profile
      await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating/updating user profile:", error);
    return { success: false, error };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { success: true, profile: userSnap.data() };
    } else {
      return { success: false, error: "User profile not found" };
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    return { success: false, error };
  }
};

export const updateUserSettings = async (userId, settings) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      settings,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating user settings:", error);
    return { success: false, error };
  }
};

export const addRecentRestaurant = async (userId, restaurant) => {
  try {
    const userRef = doc(db, "users", userId);

    // Add restaurant with timestamp
    await updateDoc(userRef, {
      recentRestaurants: arrayUnion({
        ...restaurant,
        suggestedAt: new Date().toISOString(),
      }),
      updatedAt: serverTimestamp(),
    });

    // Clean up old restaurants (older than 7 days)
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    if (userData && userData.recentRestaurants) {
      const now = new Date().getTime();
      const outdatedRestaurants = userData.recentRestaurants.filter((r) => {
        const suggestedAt = new Date(r.suggestedAt).getTime();
        return now - suggestedAt > RECENT_RESTAURANT_TTL;
      });

      // Remove outdated restaurants
      for (const restaurant of outdatedRestaurants) {
        await updateDoc(userRef, {
          recentRestaurants: arrayRemove(restaurant),
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error adding recent restaurant:", error);
    return { success: false, error };
  }
};

export const getRecentRestaurants = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return {
        success: true,
        restaurants: userData.recentRestaurants || [],
      };
    } else {
      return { success: false, error: "User profile not found" };
    }
  } catch (error) {
    console.error("Error getting recent restaurants:", error);
    return { success: false, error };
  }
};

// Feedback functions
export const addFeedback = async (userId, restaurantId, reason, excludedCuisine = null) => {
  try {
    const feedbackRef = collection(db, "feedback");

    await addDoc(feedbackRef, {
      userId,
      restaurantId,
      reason,
      excludedCuisine,
      timestamp: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error adding feedback:", error);
    return { success: false, error };
  }
};

export const getUserFeedback = async (userId, limit = 10) => {
  try {
    const feedbackRef = collection(db, "feedback");
    const q = query(feedbackRef, where("userId", "==", userId), orderBy("timestamp", "desc"), limit(limit));

    const querySnapshot = await getDocs(q);
    const feedback = [];

    querySnapshot.forEach((doc) => {
      feedback.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return { success: true, feedback };
  } catch (error) {
    console.error("Error getting user feedback:", error);
    return { success: false, error };
  }
};

// Analytics functions
export const recordSearch = async (userId, location, filters, resultCount) => {
  try {
    const searchesRef = collection(db, "analytics", "searches", userId);

    await addDoc(searchesRef, {
      userId,
      location,
      filters,
      resultCount,
      timestamp: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error recording search:", error);
    return { success: false, error };
  }
};

export const recordSelection = async (userId, restaurantId, action) => {
  try {
    const selectionsRef = collection(db, "analytics", "selections", userId);

    await addDoc(selectionsRef, {
      userId,
      restaurantId,
      action, // "view", "directions", "order", "reroll"
      timestamp: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error recording selection:", error);
    return { success: false, error };
  }
};

export const getUserSearchHistory = async (userId, limit = 10) => {
  try {
    const searchesRef = collection(db, "analytics", "searches", userId);
    const q = query(searchesRef, orderBy("timestamp", "desc"), limit(limit));

    const querySnapshot = await getDocs(q);
    const searches = [];

    querySnapshot.forEach((doc) => {
      searches.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return { success: true, searches };
  } catch (error) {
    console.error("Error getting user search history:", error);
    return { success: false, error };
  }
};

// Helper function to clean up old data (can be called periodically)
export const cleanupOldData = async (userId) => {
  try {
    // Clean up old restaurants (older than 7 days)
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    if (userData && userData.recentRestaurants) {
      const now = new Date().getTime();
      const outdatedRestaurants = userData.recentRestaurants.filter((r) => {
        const suggestedAt = new Date(r.suggestedAt).getTime();
        return now - suggestedAt > RECENT_RESTAURANT_TTL;
      });

      // Remove outdated restaurants
      for (const restaurant of outdatedRestaurants) {
        await updateDoc(userRef, {
          recentRestaurants: arrayRemove(restaurant),
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error cleaning up old data:", error);
    return { success: false, error };
  }
};

// Export Firebase instances
export { app, auth, db };

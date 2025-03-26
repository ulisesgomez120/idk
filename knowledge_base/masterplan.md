"IDK" Restaurant Randomizer - Knowledge Base
Project Overview
"IDK" (short for "I Don't Know") is a mobile application built with Expo and React Native that helps users decide where to eat by randomly suggesting restaurants near their location. The app uses a cryptographically secure random selection algorithm and integrates with various services to provide a seamless user experience.

Core Architecture
Tech Stack
Frontend Framework: React Native with Expo (v52)
Navigation: React Navigation v7 (Stack and Tab navigators)
Backend/Database: Firebase (Authentication and Firestore)
API Integration: Google Places API
Monetization: Google AdMob (currently implemented as placeholders)
Project Structure
/
├── assets/ # App icons and images
├── src/
│ ├── components/ # Reusable UI components
│ ├── constants/ # App-wide constants (colors, sizes, API settings)
│ ├── navigation/ # Navigation configuration
│ ├── screens/ # App screens
│ ├── services/ # API and service integrations
│ └── utils/ # Utility functions
├── App.js # Main app component
└── app.json # Expo configuration
Key Features

1. Restaurant Discovery
   Uses Google Places API to fetch nearby restaurants based on user location
   Implements filters for price range, search radius, and cuisine types
   Displays essential restaurant information (name, cuisine, price level, rating, etc.)
2. Random Selection Algorithm
   Uses a cryptographically secure random selection algorithm (via expo-crypto)
   Maintains a list of recently suggested restaurants to avoid repetition
   Implements a weighted selection option that considers ratings and distance
3. User Preferences
   Allows users to set search radius (in miles)
   Enables filtering by price range ($, $$, $$$, $$$$)
   Supports excluding specific cuisines
   Stores preferences in user profiles (Firebase)
4. Re-Roll Functionality
   Allows users to skip a suggestion and get a new one
   Collects feedback on why the user is re-rolling (too far, not in the mood, etc.)
   Option to permanently exclude similar cuisines
5. Integration with External Services
   Deep linking to food delivery apps (Uber Eats, DoorDash, Grubhub)
   Integration with maps for directions
   Sharing functionality for restaurant details
6. User Authentication
   Email/password authentication via Firebase
   User profile management
   Password reset functionality
   Technical Implementation Details
   Authentication Flow
   Uses Firebase Authentication with AsyncStorage persistence
   Implements login, registration, and password reset screens
   Maintains user session state across app restarts
   Data Storage
   User profiles stored in Firestore
   Settings and preferences synced with cloud
   Recently suggested restaurants tracked with TTL (7 days)
   Location Services
   Uses Expo Location for accessing device location
   Implements permission handling and fallbacks
   Calculates distances between user and restaurants
   API Security
   Google Places API key stored securely using expo-secure-store
   API calls optimized to minimize usage
   Monetization
   AdMob integration (currently implemented as placeholders)
   Shows interstitial ads after every 3 searches
   User Interface
   Design System
   Custom color scheme with primary orange (#FF5722) and secondary blue (#2196F3)
   Consistent spacing and typography
   Responsive layouts for different device sizes
   Screen Flow
   Authentication Screens:

Login
Registration
Forgot Password
Main App Screens:

Home (with Find Food button and restaurant display)
Re-Roll (for providing feedback and getting new suggestions)
Restaurant Details (comprehensive information about selected restaurant)
Settings (user preferences and app configuration)
Current Status and Limitations
The app is fully functional but has some placeholder implementations
AdMob integration is currently disabled due to compatibility issues
Restaurant photo retrieval is commented out in the Places API service
The app requires users to provide their own Google Places API key
Future Enhancements (Potential)
Complete AdMob integration
Implement restaurant photo retrieval
Add user reviews and favorites
Enhance the algorithm with machine learning for better suggestions
Implement social features (share suggestions with friends)
Add offline support for basic functionality

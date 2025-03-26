# IDK - Restaurant Randomizer

A mobile app built with Expo and React Native that helps users decide where to eat by randomly suggesting restaurants based on their location and preferences.

## Features

- **Random Restaurant Selection**: Uses a cryptographically secure random selection algorithm to suggest restaurants
- **Location-Based**: Finds restaurants near the user's current location
- **Customizable Preferences**: Filter by price range, distance, and cuisine types
- **Re-Roll Option**: Skip suggestions and provide feedback on why
- **Delivery Integration**: Deep links to popular food delivery apps (Uber Eats, DoorDash, Grubhub)
- **Maps Integration**: Get directions to the suggested restaurant
- **User Accounts**: Firebase authentication with magic link sign-in
- **Persistent Settings**: User preferences stored in Firebase Firestore
- **Ad Integration**: Google AdMob for monetization

## Tech Stack

- **Expo**: SDK 52
- **React Native**: 0.76.7
- **Firebase**: Authentication and Firestore
- **Google Places API**: Restaurant data
- **Google AdMob**: Advertisements
- **Deep Linking**: Integration with food delivery apps

## Setup Instructions

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Firebase account
- Google Cloud Platform account (for Places API)
- Google AdMob account

### Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   cd idk-restaurant-randomizer
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up Firebase:

   - Create a new Firebase project
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Add a web app to your Firebase project
   - Copy the Firebase configuration to `src/services/firebase.js`

4. Set up Google Places API:

   - Create a new project in Google Cloud Platform
   - Enable the Places API
   - Create an API key with appropriate restrictions
   - In the app, go to Settings and enter your API key

5. Set up AdMob:

   - Create a new AdMob account
   - Create a new app in AdMob
   - Replace the test ad unit IDs in `src/services/adService.js` with your actual ad unit IDs

6. Update app configuration:

   - Update the bundle identifier and package name in `app.json`
   - Update the Google Maps API keys in `app.json`

7. Start the development server:
   ```
   npm start
   ```

## Building for Production

### iOS

1. Configure app.json:

   - Update the bundleIdentifier
   - Add your Apple Developer Team ID

2. Build the app:
   ```
   expo build:ios
   ```

### Android

1. Configure app.json:

   - Update the package name
   - Generate a keystore file for signing

2. Build the app:
   ```
   expo build:android
   ```

## Project Structure

```
idk-restaurant-randomizer/
├── assets/                 # App assets (icons, splash screen)
├── src/
│   ├── components/         # Reusable UI components
│   ├── constants/          # App-wide constants
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # App screens
│   ├── services/           # API and service integrations
│   └── utils/              # Utility functions
├── App.js                  # Main app component
├── app.json                # Expo configuration
└── package.json            # Dependencies
```

## Security Considerations

- The Google Places API key is stored securely using Expo SecureStore
- Firebase authentication uses magic links for passwordless sign-in
- All API requests use HTTPS
- User data is stored in Firestore with appropriate security rules

## License

[MIT License](LICENSE)

## Acknowledgements

- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [Firebase](https://firebase.google.com/)
- [Google Places API](https://developers.google.com/maps/documentation/places/web-service/overview)

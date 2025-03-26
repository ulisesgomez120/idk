# Firestore Database Structure for IDK Restaurant Randomizer

This document outlines the Firestore database structure for the IDK Restaurant Randomizer app, including collections, security rules, and deployment instructions.

## Collections Structure

### 1. `users` Collection

The primary collection storing user profiles and preferences.

```
users/
  {userId}/
    email: string
    createdAt: timestamp
    updatedAt: timestamp
    settings: {
      searchRadius: number (miles)
      priceRange: array<number> (1-4)
      excludedCuisines: array<string>
      locationEnabled: boolean
    }
    recentRestaurants: array<{
      place_id: string
      name: string
      suggestedAt: string (ISO date)
    }>
```

### 2. `feedback` Collection

Stores user feedback from re-rolls to analyze patterns and improve the app.

```
feedback/
  {feedbackId}/
    userId: string
    restaurantId: string
    reason: string (from REROLL_REASONS)
    excludedCuisine: string (optional)
    timestamp: timestamp
```

### 3. `analytics` Collection

Stores usage analytics for monitoring app performance and user behavior.

```
analytics/
  searches/
    {searchId}/
      userId: string
      timestamp: timestamp
      location: {
        latitude: number
        longitude: number
      }
      filters: {
        radius: number
        priceRange: array<number>
        excludedCuisines: array<string>
      }
      resultCount: number

  selections/
    {selectionId}/
      userId: string
      restaurantId: string
      timestamp: timestamp
      action: string (e.g., "view", "directions", "order", "reroll")
```

## Security Rules

The `firestore.rules` file contains security rules that:

1. Ensure users can only read and write their own data
2. Validate data structure and field types
3. Restrict access to analytics data to admins only
4. Allow users to create feedback but restrict reading to the user and admins

## Indexes

The `firestore.indexes.json` file defines composite indexes for efficient querying of:

1. User data by email and creation date
2. Feedback by user ID and timestamp
3. Analytics searches by user ID and timestamp
4. Analytics selections by user ID and timestamp

## Helper Functions

The `src/services/firebase.js` file has been updated with helper functions for:

1. User profile management
2. Feedback recording and retrieval
3. Analytics tracking
4. Data cleanup for old records

## Deployment Instructions

To deploy the Firestore rules and indexes:

```bash
# Make sure you're in the project root directory
cd /path/to/your/project

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

## Usage Examples

### Recording User Feedback

```javascript
import { addFeedback } from "../services/firebase";

// When a user re-rolls and provides feedback
const handleReRoll = async (reason, excludeCuisine) => {
  const user = getCurrentUser();
  if (user) {
    await addFeedback(user.uid, restaurant.place_id, reason, excludeCuisine ? restaurant.types[0] : null);
    // Continue with re-roll logic
  }
};
```

### Recording Analytics

```javascript
import { recordSearch, recordSelection } from "../services/firebase";

// When a user searches for restaurants
const handleSearch = async () => {
  const user = getCurrentUser();
  if (user) {
    const result = await fetchNearbyRestaurants(location, filters);
    await recordSearch(user.uid, location, filters, result.restaurants.length);
    // Continue with search logic
  }
};

// When a user selects a restaurant action
const handleViewDetails = async () => {
  const user = getCurrentUser();
  if (user) {
    await recordSelection(user.uid, restaurant.place_id, "view");
    // Continue with view details logic
  }
};
```

## Data Cleanup

The `cleanupOldData` function can be called periodically to remove outdated data:

```javascript
import { cleanupOldData } from "../services/firebase";

// Call this function when the app starts or periodically
const performMaintenance = async () => {
  const user = getCurrentUser();
  if (user) {
    await cleanupOldData(user.uid);
  }
};
```

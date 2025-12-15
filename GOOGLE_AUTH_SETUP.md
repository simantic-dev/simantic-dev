# Google Authentication Setup Guide

## Firebase Console Setup

To enable Google authentication alongside GitHub, follow these steps:

### 1. Enable Google Sign-In Provider

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** → **Sign-in method** tab
4. Under "Sign-in providers", find **Google**
5. Click on it and toggle **Enable**
6. Add your project's public-facing name and support email
7. Click **Save**

### 2. Configure Authorized Domains

1. In the same **Sign-in method** tab, scroll to **Authorized domains**
2. Make sure your domain (e.g., `localhost`, `yourdomain.com`) is listed
3. Add any additional domains where your app will be hosted

## Features Implemented

### Login Page
- **Google Sign-In**: Users can sign in with their Google account
- **GitHub Sign-In**: Users can sign in with their GitHub account
- Accounts with the same email can be linked together

### Account Settings Page
- View all linked providers (Google and/or GitHub)
- **Link Account**: Connect a Google or GitHub account to your existing account
- **Unlink Account**: Remove a provider (requires at least one provider to remain)
- Protection: Cannot unlink the only sign-in method

## How Account Linking Works

### Automatic Linking
When a user signs in with a provider and an account with the same email already exists with a different provider, they'll see an error message instructing them to:
1. Sign in with the existing provider first
2. Go to Account Settings
3. Link the new provider

### Manual Linking
Users can proactively link accounts in Account Settings:
1. Navigate to Account page
2. Click "Link" next to Google or GitHub
3. Complete the authentication flow
4. Both providers are now linked to the same account

### Benefits of Linking
- Sign in with either Google or GitHub
- Access the same account and data from both providers
- Flexibility to use whichever authentication method is convenient

## User Flow Examples

### Example 1: New User Signs Up
1. User clicks "Sign in with Google"
2. User is logged in and taken to dashboard
3. In Account Settings, they can optionally link GitHub

### Example 2: Existing User Adds Provider
1. User logged in with GitHub
2. Goes to Account Settings
3. Clicks "Link" next to Google
4. Authenticates with Google
5. Now can sign in with either provider

### Example 3: Account Exists Conflict
1. User has account with GitHub using email@example.com
2. User tries to sign in with Google using same email@example.com
3. Error message: "Account already exists..."
4. User signs in with GitHub (existing provider)
5. Links Google account in Account Settings
6. Now can sign in with both

## Security Notes

- Firebase handles the secure authentication flow
- Account linking requires authentication with both providers
- Users must keep at least one provider linked
- Email verification status may differ between providers

## Testing

1. **Test Google Sign-In**: Click "Sign in with Google" on login page
2. **Test GitHub Sign-In**: Click "Sign in with GitHub" on login page
3. **Test Account Linking**: 
   - Sign in with one provider
   - Go to Account page
   - Click "Link" for the other provider
   - Verify both show as "Linked"
4. **Test Unlinking**: Try to unlink a provider (ensure you have 2+ linked first)
5. **Test Same Email**: Create accounts with the same email using different providers and verify linking works

## Firestore Rules

Remember to keep your Firestore security rules to allow the waitlist check:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /acceptedUsers/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false;
    }
  }
}
```

The authentication UID remains consistent across linked providers, so the waitlist system continues to work seamlessly.

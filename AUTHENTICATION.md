# GitHub Authentication Setup Guide

This guide explains how to set up and use GitHub authentication in your Simantic application.

## Files Created

1. **`src/contexts/AuthContext.tsx`** - Manages authentication state globally
2. **`src/components/ProtectedRoute.tsx`** - Wraps routes that require authentication
3. **`src/pages/Login.tsx`** - Login page with GitHub sign-in button
4. **`src/pages/Login.css`** - Styling for the login page
5. **`src/pages/Dashboard.tsx`** - Example protected page showing user info
6. **`src/pages/Dashboard.css`** - Styling for the dashboard
7. **`src/firebase.ts`** - Updated to include Firebase Auth

## Firebase Console Setup

Before using GitHub authentication, you need to configure it in Firebase:

### 1. Enable GitHub Authentication in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **simantic**
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **GitHub** and enable it
5. You'll need to register a GitHub OAuth App

### 2. Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the details:
   - **Application name**: Simantic (or your preferred name)
   - **Homepage URL**: `https://simantic.firebaseapp.com` (or your domain)
   - **Authorization callback URL**: Copy this from Firebase Console (it will look like `https://simantic.firebaseapp.com/__/auth/handler`)
4. Click **Register application**
5. Copy the **Client ID** and generate a **Client Secret**
6. Go back to Firebase Console and paste these values
7. Click **Save**

## Usage

### Basic Login Flow

Users can now navigate to `/login` and sign in with their GitHub account. After successful authentication, they'll be redirected to the home page.

### Protecting Routes

To require authentication for a route, wrap it with `ProtectedRoute`:

```tsx
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';

// In your routes:
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

### Using Authentication in Components

```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { currentUser, signOut } = useAuth();

  if (currentUser) {
    return (
      <div>
        <p>Welcome, {currentUser.displayName}!</p>
        <button onClick={signOut}>Sign Out</button>
      </div>
    );
  }

  return <p>Please log in</p>;
}
```

### Available User Properties

When a user is authenticated, `currentUser` provides:

- `uid` - Unique user ID
- `email` - User's email address
- `displayName` - User's GitHub username
- `photoURL` - User's GitHub avatar
- `emailVerified` - Whether email is verified

## Example: Add Dashboard Route

Update `src/main.tsx` to add a protected dashboard:

```tsx
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

// In your Routes:
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

## Testing

1. Start your development server: `npm run dev`
2. Navigate to `/login`
3. Click "Sign in with GitHub"
4. Authorize the application
5. You'll be redirected and authenticated

## Error Handling

The login page handles common errors:
- Popup closed by user
- Cancelled popup requests
- Account exists with different credentials
- Network errors

## Security Notes

1. **Never commit** Firebase credentials to version control (already in `.env`)
2. The `.env` file contains sensitive API keys - keep it secure
3. In production, use environment variables for all Firebase config
4. Consider adding additional security rules in Firebase Security Rules

## Additional Features You Can Add

### 1. Persist User Data
Store additional user info in Firestore:

```tsx
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// After successful login:
await setDoc(doc(db, 'users', result.user.uid), {
  displayName: result.user.displayName,
  email: result.user.email,
  photoURL: result.user.photoURL,
  createdAt: new Date(),
});
```

### 2. Add Navigation Links
Update your navbar to include login/logout:

```tsx
const { currentUser, signOut } = useAuth();

{currentUser ? (
  <button onClick={signOut}>Sign Out</button>
) : (
  <a href="/login">Sign In</a>
)}
```

### 3. Conditional Navbar Items
Show different menu items based on auth state:

```tsx
{currentUser && (
  <a href="/dashboard">Dashboard</a>
)}
```

## Troubleshooting

### "Popup blocked" error
- Ensure popups are not blocked in browser settings
- Consider using `signInWithRedirect` instead of `signInWithPopup`

### Authentication state not persisting
- Firebase Auth automatically persists sessions
- Check browser's localStorage/indexedDB settings

### GitHub OAuth errors
- Verify callback URL matches exactly in GitHub OAuth app settings
- Ensure Client ID and Secret are correct in Firebase Console

## Next Steps

1. Set up Firebase Console with GitHub OAuth
2. Test the login flow
3. Add protected routes as needed
4. Customize the UI to match your brand
5. Consider adding additional auth providers (Google, etc.)

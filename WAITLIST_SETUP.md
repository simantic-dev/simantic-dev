# Waitlist System Setup

## Overview
The waitlist system checks if a user's UID exists in the Firestore `acceptedUsers` collection. If accepted, they see the full dashboard; otherwise, they see a waitlist message.

## Firebase Setup

### 1. Create the Firestore Collection
In your Firebase Console:
1. Go to Firestore Database
2. Create a collection named `acceptedUsers`

### 2. Accept a User
To accept a user from the waitlist, add a document to the `acceptedUsers` collection:
- **Document ID**: Use the user's UID (e.g., `abc123xyz`)
- **Fields**: You can optionally add fields like:
  - `acceptedAt`: timestamp
  - `email`: user's email
  - `displayName`: user's name
  
**Example document:**
```
Collection: acceptedUsers
Document ID: abc123xyz
Fields:
  acceptedAt: December 12, 2025 at 12:00:00 PM UTC
  email: user@example.com
  displayName: John Doe
```

### 3. Remove a User (Send Back to Waitlist)
Simply delete the document with the user's UID from the `acceptedUsers` collection.

## How It Works

1. **User logs in** → Firebase Authentication creates a user with a UID
2. **Dashboard loads** → `useWaitlistStatus` hook checks Firestore
3. **Check**: Does `acceptedUsers/{uid}` document exist?
   - **Yes** → Show full dashboard
   - **No** → Show waitlist message
4. **User experience**:
   - Waitlisted users see: "Thank you for joining the waitlist. We'll let you know when you are in."
   - Accepted users see: Full dashboard with their content

## Code Structure

- `src/hooks/useWaitlistStatus.ts` - Hook that checks Firestore for user acceptance
- `src/pages/Dashboard.tsx` - Dashboard component with conditional rendering
- `src/pages/Dashboard.css` - Styling for both dashboard and waitlist screens

## Testing

### To test the waitlist screen:
1. Log in with a new GitHub account
2. Note the UID in the console or dashboard
3. Don't add the UID to `acceptedUsers` collection
4. You should see the waitlist message

### To test the accepted user dashboard:
1. Get the user's UID
2. In Firebase Console, add a document to `acceptedUsers` with the UID as the document ID
3. Refresh the dashboard
4. You should see the full dashboard

## Security Rules (REQUIRED)

You MUST add these Firestore security rules to allow users to check their own acceptance status:

1. Go to Firebase Console → Firestore Database → Rules
2. Replace or add these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /acceptedUsers/{userId} {
      // Users can only read their own acceptance status
      allow read: if request.auth != null && request.auth.uid == userId;
      // Only admins can write (manage via Firebase Console or admin SDK)
      allow write: if false;
    }
  }
}
```

3. Click "Publish" to apply the rules

**Without these rules, users will get a "Missing or insufficient permissions" error.**

## Future Enhancements

Consider adding:
- Admin panel to manage waitlist
- Email notifications when users are accepted
- Waitlist position/estimated wait time
- Automatic acceptance based on criteria
- Analytics on waitlist conversion rates

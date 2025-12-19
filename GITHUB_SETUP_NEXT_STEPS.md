# GitHub Integration - Next Steps

✅ **Completed:**
- Firebase Cloud Function deployed successfully
- Dashboard code updated with function URL
- Function URL: `https://us-central1-simantic.cloudfunctions.net/githubOauth`

## Required Setup Steps:

### 1. Create GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Simantic Dashboard
   - **Homepage URL**: `https://yourdomain.com`
   - **Authorization callback URL**: `https://yourdomain.com/dashboard`
4. Click "Register application"
5. Copy the **Client ID** and generate a **Client Secret**

### 2. Add Environment Variables

#### For Frontend (.env file):
```bash
VITE_GITHUB_CLIENT_ID=your_github_client_id_here
```

#### For Firebase Functions:
Set the environment variables in Firebase:

```bash
firebase functions:secrets:set GITHUB_CLIENT_ID
firebase functions:secrets:set GITHUB_CLIENT_SECRET
```

When prompted, enter the values from your GitHub OAuth app.

Then update `functions/src/index.ts` to use secrets instead of environment variables:

```typescript
import {defineSecret} from "firebase-functions/params";

const githubClientId = defineSecret("GITHUB_CLIENT_ID");
const githubClientSecret = defineSecret("GITHUB_CLIENT_SECRET");

export const githubOauth = onRequest(
  {
    cors: true,
    secrets: [githubClientId, githubClientSecret],
  },
  async (req, res) => {
    // ... rest of the code
    const clientId = githubClientId.value();
    const clientSecret = githubClientSecret.value();
    // ...
  }
);
```

### 3. Redeploy Functions
```bash
firebase deploy --only functions
```

### 4. Update Firestore Rules

Add rules to allow users to store their GitHub tokens:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Deploy the rules:
```bash
firebase deploy --only firestore:rules
```

### 5. Test the Integration

1. Build your app: `npm run build`
2. Deploy or run locally: `npm run dev`
3. Login to dashboard
4. Click "Connect GitHub"
5. Authorize on GitHub
6. Browse your repositories!

## Notes:

- The function uses Firebase Functions v2 (2nd Gen)
- CORS is enabled for all origins (you may want to restrict this in production)
- GitHub tokens are stored in Firestore per user
- Rate limit: 5,000 GitHub API requests per hour per user

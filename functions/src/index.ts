import {onRequest} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import * as admin from "firebase-admin";

admin.initializeApp();

const githubClientId = defineSecret("GITHUB_CLIENT_ID");
const githubClientSecret = defineSecret("GITHUB_CLIENT_SECRET");

export const githubOauth = onRequest(
  {
    cors: true,
    secrets: [githubClientId, githubClientSecret],
  },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    const {code} = req.body;

    if (!code) {
      res.status(400).json({error: "Code is required"});
      return;
    }

    const clientId = githubClientId.value();
    const clientSecret = githubClientSecret.value();

    if (!clientId || !clientSecret) {
      res.status(500).json({
        error: "GitHub credentials not configured",
      });
      return;
    }

    try {
      // Exchange code for access token
      const tokenResponse = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
          }),
        }
      );

      const tokenData = await tokenResponse.json() as {
        access_token?: string;
        error?: string;
      };

      if (tokenData.access_token) {
        res.json({access_token: tokenData.access_token});
      } else {
        res.status(400).json({
          error: "Failed to get access token",
          details: tokenData.error,
        });
      }
    } catch (error) {
      console.error("Error exchanging code for token:", error);
      res.status(500).json({error: "Internal server error"});
    }
  }
);

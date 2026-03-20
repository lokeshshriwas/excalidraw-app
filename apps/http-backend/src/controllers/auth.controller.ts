
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prismaClient } from "@repo/db";
import { CreateUserSchema, SigninSchema } from "@repo/common";
import { JWT_SECRET } from "@repo/backend-common/config";
import { Request, Response } from "express";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns a minimal HTML page that postMessages a result to the opener window
 * and closes itself. FRONTEND_URL is read at call-time from env so it always
 * reflects the current environment.
 */
function sendPostMessageHtml(
  res: import("express").Response,
  payload: Record<string, unknown>
): void {
  const targetOrigin = process.env.FRONTEND_URL || "*";
  const html = `<!DOCTYPE html>
<html>
<body>
<script>
  try {
    if (window.opener) {
      window.opener.postMessage(${JSON.stringify(payload)}, ${JSON.stringify(targetOrigin)});
    }
  } catch (e) {
    console.error("postMessage failed", e);
  }
  window.close();
</script>
</body>
</html>`;
  // COOP: unsafe-none is required so the popup can still access window.opener
  // when the callback page is served from a different origin (the backend).
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
}

// ---------------------------------------------------------------------------
// Traditional auth
// ---------------------------------------------------------------------------

export const signupController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = CreateUserSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      error: "Invalid input",
      details: result.error.errors,
    });
    return;
  }

  try {
    const { email, name, password } = result.data;

    const existingUser = await prismaClient.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const user = await prismaClient.user.create({
      data: { email, name, password: hashedPassword },
      select: { id: true, email: true, name: true, avatar: true },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const signinController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = SigninSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      error: "Invalid input",
      details: result.error.errors,
    });
    return;
  }

  const { email, password } = result.data;

  try {
    const userData = await prismaClient.user.findFirst({ where: { email } });

    if (!userData) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    if (!userData.password) {
      res.status(400).json({
        message:
          "This account uses OAuth login. Please use Google or GitHub to sign in.",
      });
      return;
    }

    const isPasswordValid = bcrypt.compareSync(password, userData.password);

    if (!isPasswordValid) {
      res.status(400).json({ message: "Invalid password" });
      return;
    }

    if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");

    const token = jwt.sign({ userId: userData.id }, JWT_SECRET);
    res.status(200).json({
      token,
      message: "Login successful",
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        avatar: userData.avatar,
      },
    });
  } catch (error) {
    console.error("Error in signin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ---------------------------------------------------------------------------
// Shared: find-or-create user from OAuth profile
// ---------------------------------------------------------------------------

async function findOrCreateOAuthUser(profile: {
  email: string;
  name: string;
  avatar?: string | null;
}): Promise<{ token: string; user: Record<string, unknown>; isNew: boolean }> {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");

  let user = await prismaClient.user.findFirst({
    where: { email: profile.email },
  });

  if (user) {
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    const { password, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword, isNew: false };
  }

  // New user — generate a random password they'll never use
  const generatedPassword =
    Math.random().toString(36).slice(-8) +
    Math.random().toString(36).slice(-8);
  const hashedPassword = bcrypt.hashSync(generatedPassword, 10);

  const newUser = await prismaClient.user.create({
    data: {
      email: profile.email,
      name: profile.name,
      password: hashedPassword,
      avatar: profile.avatar || null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const token = jwt.sign({ userId: newUser.id }, JWT_SECRET);
  return { token, user: newUser as Record<string, unknown>, isNew: true };
}

// ---------------------------------------------------------------------------
// Google OAuth — initiation
// ---------------------------------------------------------------------------

export const googleInitiateController = (
  req: Request,
  res: Response
): void => {
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    res.status(500).send("BASE_URL env var is not configured");
    return;
  }

  const redirectUri = `${baseUrl}/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "email profile",
    access_type: "offline",
    prompt: "select_account",
  });

  console.log("🔵 Google OAuth initiate → redirect_uri:", redirectUri);
  res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
};

// ---------------------------------------------------------------------------
// Google OAuth — callback
// ---------------------------------------------------------------------------

export const googleCallbackController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { code, error: oauthError } = req.query as Record<string, string>;

  if (oauthError || !code) {
    console.error("❌ Google OAuth callback error from Google:", oauthError);
    sendPostMessageHtml(res, {
      type: "GOOGLE_OAUTH_ERROR",
      message: oauthError || "No authorization code received",
    });
    return;
  }

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    sendPostMessageHtml(res, {
      type: "GOOGLE_OAUTH_ERROR",
      message: "Server misconfiguration: BASE_URL not set",
    });
    return;
  }

  const redirectUri = `${baseUrl}/auth/google/callback`;

  try {
    // 1. Exchange code for tokens
    console.log("🔵 Google OAuth: exchanging code for tokens…");
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });

    const tokens = (await tokenRes.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (tokens.error || !tokens.access_token) {
      console.error("❌ Google token exchange error:", tokens.error);
      sendPostMessageHtml(res, {
        type: "GOOGLE_OAUTH_ERROR",
        message: tokens.error_description || tokens.error || "Token exchange failed",
      });
      return;
    }

    // 2. Fetch user profile
    console.log("🔵 Google OAuth: fetching user profile…");
    const profileRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );

    if (!profileRes.ok) {
      sendPostMessageHtml(res, {
        type: "GOOGLE_OAUTH_ERROR",
        message: `Google API error: ${profileRes.status}`,
      });
      return;
    }

    const profile = (await profileRes.json()) as {
      email: string;
      name: string;
      picture?: string;
    };

    console.log("🔵 Google OAuth: profile received for", profile.email);

    // 3. Find-or-create user, sign JWT
    const { token, user, isNew } = await findOrCreateOAuthUser({
      email: profile.email,
      name: profile.name,
      avatar: profile.picture,
    });

    console.log(
      `✅ Google OAuth: ${isNew ? "created" : "found"} user`,
      profile.email
    );

    sendPostMessageHtml(res, {
      type: "GOOGLE_OAUTH_SUCCESS",
      token,
      user,
    });
  } catch (error) {
    console.error("❌ Google OAuth callback exception:", error);
    sendPostMessageHtml(res, {
      type: "GOOGLE_OAUTH_ERROR",
      message: "Internal server error during Google authentication",
    });
  }
};

// ---------------------------------------------------------------------------
// GitHub OAuth — initiation
// ---------------------------------------------------------------------------

export const githubInitiateController = (
  req: Request,
  res: Response
): void => {
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    res.status(500).send("BASE_URL env var is not configured");
    return;
  }

  const redirectUri = `${baseUrl}/auth/github/callback`;

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID || "",
    redirect_uri: redirectUri,
    scope: "user:email",
  });

  console.log("🟣 GitHub OAuth initiate → redirect_uri:", redirectUri);
  res.redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`
  );
};

// ---------------------------------------------------------------------------
// GitHub OAuth — callback
// ---------------------------------------------------------------------------

export const githubCallbackController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { code, error: oauthError, error_description } = req.query as Record<
    string,
    string
  >;

  if (oauthError || !code) {
    console.error("❌ GitHub OAuth callback error from GitHub:", oauthError);
    sendPostMessageHtml(res, {
      type: "GITHUB_OAUTH_ERROR",
      message: error_description || oauthError || "No authorization code received",
    });
    return;
  }

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    sendPostMessageHtml(res, {
      type: "GITHUB_OAUTH_ERROR",
      message: "Server misconfiguration: BASE_URL not set",
    });
    return;
  }

  const redirectUri = `${baseUrl}/auth/github/callback`;

  try {
    // 1. Exchange code for access token
    console.log("🟣 GitHub OAuth: exchanging code for access token…");
    const tokenRes = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: redirectUri,
        }),
      }
    );

    const tokens = (await tokenRes.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (tokens.error || !tokens.access_token) {
      console.error("❌ GitHub token exchange error:", tokens.error);
      sendPostMessageHtml(res, {
        type: "GITHUB_OAUTH_ERROR",
        message: tokens.error_description || tokens.error || "Token exchange failed",
      });
      return;
    }

    // 2. Fetch user profile
    console.log("🟣 GitHub OAuth: fetching user profile…");
    const [userRes, emailsRes] = await Promise.all([
      fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }),
      fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }),
    ]);

    if (!userRes.ok) {
      sendPostMessageHtml(res, {
        type: "GITHUB_OAUTH_ERROR",
        message: `GitHub API error: ${userRes.status}`,
      });
      return;
    }

    const userInfo = (await userRes.json()) as {
      login: string;
      name?: string;
      email?: string;
      avatar_url?: string;
    };

    // Prefer the primary verified email from the emails endpoint
    let primaryEmail = userInfo.email;

    if (!primaryEmail && emailsRes.ok) {
      const emails = (await emailsRes.json()) as Array<{
        email: string;
        primary: boolean;
        verified: boolean;
      }>;
      const primary = emails.find((e) => e.primary && e.verified);
      primaryEmail = primary?.email || emails[0]?.email;
    }

    if (!primaryEmail) {
      console.error("❌ GitHub OAuth: no email found");
      sendPostMessageHtml(res, {
        type: "GITHUB_OAUTH_ERROR",
        message: "No email found in your GitHub account. Please make your email public or add a primary verified email.",
      });
      return;
    }

    console.log("🟣 GitHub OAuth: profile received for", primaryEmail);

    // 3. Find-or-create user, sign JWT
    const { token, user, isNew } = await findOrCreateOAuthUser({
      email: primaryEmail,
      name: userInfo.name || userInfo.login,
      avatar: userInfo.avatar_url,
    });

    console.log(
      `✅ GitHub OAuth: ${isNew ? "created" : "found"} user`,
      primaryEmail
    );

    sendPostMessageHtml(res, {
      type: "GITHUB_OAUTH_SUCCESS",
      token,
      user,
    });
  } catch (error) {
    console.error("❌ GitHub OAuth callback exception:", error);
    sendPostMessageHtml(res, {
      type: "GITHUB_OAUTH_ERROR",
      message: "Internal server error during GitHub authentication",
    });
  }
};
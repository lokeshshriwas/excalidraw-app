
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prismaClient } from "@repo/db";
import { CreateUserSchema, SigninSchema } from "@repo/common";
import { JWT_SECRET } from "@repo/backend-common/config";
import { Request, Response } from 'express';

interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
}

export const signupController = async (req: Request, res: Response): Promise<void> => {
    const result = CreateUserSchema.safeParse(req.body);

    if (!result.success) {
        res.status(400).json({
            error: "Invalid input",
            details: result.error.errors
        });
        return;
    }

    try {
        const { email, name, password } = result.data;

        const existingUser = await prismaClient.user.findFirst({
            where: { email }
        });

        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const user = await prismaClient.user.create({
            data: {
                email,
                name,
                password: hashedPassword
            },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true
            }
        });

        res.status(201).json(user);
        return;
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
};

export const signinController = async (req: Request, res: Response): Promise<void> => {
    const result = SigninSchema.safeParse(req.body);

    if (!result.success) {
        res.status(400).json({
            error: "Invalid input",
            details: result.error.errors
        });
        return;
    }

    const { email, password } = result.data;

    try {
        const userData = await prismaClient.user.findFirst({
            where: { email }
        });

        if (!userData) {
            res.status(400).json({ message: "User not found" });
            return;
        }

        if (!userData.password) {
            res.status(400).json({
                message: "This account uses OAuth login. Please use Google or GitHub to sign in."
            });
            return;
        }

        const isPasswordValid = bcrypt.compareSync(password, userData.password);

        if (!isPasswordValid) {
            res.status(400).json({ message: "Invalid password" });
            return;
        }

        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        const token = jwt.sign({ userId: userData.id }, JWT_SECRET);
        res.status(200).json({
            token: token,
            message: "Login successful",
            user: {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                avatar: userData.avatar
            }
        });
        return;
    } catch (error) {
        console.error("Error in signin:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
};

export const googleOAuthController = async (req: Request, res: Response): Promise<void> => {
    console.log("👉 Google OAuth Controller HIT. Body:", req.body);
    const { email, name, avatar } = req.body;

    try {
        console.log("👉 Looking for existing user:", email);
        let user = await prismaClient.user.findFirst({
            where: { email }
        });
        console.log("👉 User lookup result:", user ? "Found" : "Not Found");

        if (user) {
            console.log("👉 User exists. Signing JWT...");
            if (!JWT_SECRET) console.error("❌ JWT_SECRET IS MISSING in controller!");

            const token = jwt.sign({ userId: user.id }, JWT_SECRET!);
            const { password, ...userWithoutPassword } = user;
            console.log("👉 JWT Signed. Sending success response.");

            res.status(200).json({
                token,
                message: "Login successful",
                user: userWithoutPassword
            });
            return;
        } else {
            console.log("👉 User does NOT exist. Creating new user.");
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

            console.log("👉 Hashing password...");
            const hashedPassword = bcrypt.hashSync(generatedPassword, 10);
            console.log("👉 Password hashed. Creating in DB...");

            const newUser = await prismaClient.user.create({
                data: {
                    email,
                    name,
                    password: hashedPassword,
                    avatar: avatar || null
                }
            });
            console.log("👉 User created:", newUser.id);

            console.log("👉 Signing JWT for new user...");
            const token = jwt.sign({ userId: newUser.id }, JWT_SECRET!);

            res.status(201).json({
                token,
                message: "Account created and login successful",
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.name,
                    avatar: newUser.avatar
                }
            });
            return;
        }
    } catch (error) {
        console.error("❌ Google OAuth error CAUGHT:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
};

export const githubCallbackController = async (req: Request, res: Response): Promise<void> => {
    const { code } = req.body;

    if (!code) {
        res.status(400).json({ message: 'Authorization code is required' });
        return;
    }

    try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code
            })
        });

        const tokens = await tokenResponse.json();

        if (tokens.error) {
            res.status(400).json({
                message: tokens.error_description || tokens.error
            });
            return;
        }

        if (!tokens.access_token) {
            res.status(400).json({
                message: 'No access token received from GitHub'
            });
            return;
        }

        // Get user info
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${tokens.access_token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!userResponse.ok) {
            res.status(400).json({
                message: `GitHub API error: ${userResponse.status}`
            });
            return;
        }

        const userInfo = await userResponse.json();

        // Get user email
        let primaryEmail = userInfo.email;

        if (!primaryEmail) {
            const emailResponse = await fetch('https://api.github.com/user/emails', {
                headers: {
                    'Authorization': `Bearer ${tokens.access_token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (emailResponse.ok) {
                const emails = await emailResponse.json();
                primaryEmail = emails.find((email: any) => email.primary)?.email || emails[0]?.email;
            }
        }

        if (!primaryEmail) {
            res.status(400).json({
                message: 'No email found in GitHub account. Please make sure your GitHub account has a public email or primary email set.'
            });
            return;
        }

        // Create or find user
        let user = await prismaClient.user.findFirst({
            where: { email: primaryEmail }
        });

        if (user) {
            const token = jwt.sign({ userId: user.id }, JWT_SECRET!);
            const { password, ...userWithoutPassword } = user;

            res.status(200).json({
                token,
                message: "Login successful",
                user: userWithoutPassword
            });
            return;
        } else {
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = bcrypt.hashSync(generatedPassword, 10);

            const newUser = await prismaClient.user.create({
                data: {
                    email: primaryEmail,
                    name: userInfo.name || userInfo.login,
                    password: hashedPassword,
                    avatar: userInfo.avatar_url || null
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    avatar: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            const token = jwt.sign({ userId: newUser.id }, JWT_SECRET!);

            res.status(201).json({
                token,
                message: "Account created and login successful",
                user: newUser
            });
            return;
        }
    } catch (error) {
        console.error("GitHub OAuth backend error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return;
    }
};
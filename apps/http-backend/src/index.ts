import { prismaClient } from "@repo/db";
import express from "express";
import authRouter from "./routes/auth.router";
import roomRouter from "./routes/room.router";
import reqRouter from "./routes/request.router";
import adminRouter from "./routes/admin.router";
import userRouter from "./routes/user.router";
import subscriptionRouter from "./routes/subscription.router";
import cors from "cors"

// CORS configuration - support environment variable for production
const defaultOrigins = ['http://localhost:3000', 'http://localhost:5173'];
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : defaultOrigins;

console.log('🔧 CORS Origins configured:', corsOrigins);
console.log('🔧 Environment:', process.env.NODE_ENV);
console.log('🔧 OAuth Config:', {
  googleClientId: process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Missing',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? '✓ Set' : '✗ Missing',
  githubClientId: process.env.GITHUB_CLIENT_ID ? '✓ Set' : '✗ Missing',
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET ? '✓ Set' : '✗ Missing',
});

const corsOptions = {
  origin: corsOrigins,
  credentials: true, // Required for OAuth cookies/sessions
  optionsSuccessStatus: 200
};

const app = express();
app.set("trust proxy", 1); // Trust Nginx headers

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

app.use(cors(corsOptions))

// Subscription webhook must be registered before express.json() for raw body access
app.use("/v1/subscription", subscriptionRouter);

app.use(express.json());

app.use("/v1/auth", authRouter);
app.use("/v1/room", roomRouter);
app.use("/v1/req", reqRouter);
app.use("/v1/admin", adminRouter);
app.use("/v1/user", userRouter);

app.get("/v1/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

app.listen(3002, "0.0.0.0", async () => {
  await prismaClient.$connect();
  console.log("Server is running on http://0.0.0.0:3002");
});
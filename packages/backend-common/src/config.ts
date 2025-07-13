import { config } from "dotenv"

config()

export const JWT_SECRET = process.env.JWT_SECRET
export const BASE_URL = 'http://localhost:3002/v1'
import { z } from "zod";

export const CreateUserSchema = z.object({
    email: z.string().email(),
    name: z.string(),
    password: z.string()
})

export const SigninSchema = z.object({
    email: z.string().email(),
    password: z.string(),
})

export const CreateRoomSchema = z.object({
  name: z
    .string()
    .regex(
      /^room-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      "Invalid room name format. Expected format: room-<uuid>"
    )
})
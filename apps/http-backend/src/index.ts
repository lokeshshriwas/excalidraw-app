import {prismaClient} from "@repo/db";
import express from "express";
import authRouter from "./routes/auth.router";
import roomRouter from "./routes/room.router";

const app = express();

app.use(express.json());

app.use("/v1/auth", authRouter);
app.use("/v1/room", roomRouter);

app.listen(3002, async () => {
    // await prismaClient.$connect();
    console.log("Server is running on http://localhost:3002");
});
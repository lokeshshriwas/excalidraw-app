import {prismaClient} from "@repo/db";
import express from "express";
import authRouter from "./routes/auth.router";
import roomRouter from "./routes/room.router";
import reqRouter from "./routes/request.router";
import cors from "cors"
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173'] // Replace with your frontend origin
};

const app = express();
app.use(cors(corsOptions))

app.use(express.json());

app.use("/v1/auth", authRouter);
app.use("/v1/room", roomRouter);
app.use("/v1/req", reqRouter);

app.listen(3002, async () => {
    await prismaClient.$connect();
    console.log("Server is running on http://localhost:3002");
});
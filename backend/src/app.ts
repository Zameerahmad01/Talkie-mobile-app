import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import userRoutes from "./routes/user.routes";
dotenv.config();

const app: Express = express();

app.use(cors());
//json middleware | parse incoming requests with JSON payloads
app.use(express.json());
//urlencoded middleware | parse incoming requests with URL encoded payloads
app.use(express.urlencoded({ extended: true }));
//cookie parser middleware | parse incoming requests with cookie payloads
app.use(cookieParser());

//routes
app.use("/api/v1/users", userRoutes);
// app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/chats", chatRoutes);
// app.use("/api/v1/messages", messageRoutes);

export default app;

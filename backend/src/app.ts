import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { clerkMiddleware } from "@clerk/express";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import { errorHandler } from "./middlewares/errorHandler";

const app: Express = express();

app.use(cors());
//json middleware | parse incoming requests with JSON payloads
app.use(express.json());
//urlencoded middleware | parse incoming requests with URL encoded payloads
app.use(express.urlencoded({ extended: true }));
//cookie parser middleware | parse incoming requests with cookie payloads
app.use(cookieParser());
//clerk middleware
app.use(clerkMiddleware());

//routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/chats", chatRoutes);
// app.use("/api/v1/messages", messageRoutes);

//error handler middleware
app.use(errorHandler);
export default app;

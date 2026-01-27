import express, { type Router } from "express";
import { protectRoute } from "../middlewares/auth";
import { getAllMessages } from "../controllers/message.controller";

const router: Router = express.Router();

router.get("/chat/:chatId", protectRoute, getAllMessages);

export default router;

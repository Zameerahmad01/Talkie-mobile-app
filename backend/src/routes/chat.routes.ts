import express, { type Router } from "express";
import { protectRoute } from "../middlewares/auth";
import { getChats, getOrCreateChat } from "../controllers/chat.controller";

const router: Router = express.Router();

router.use(protectRoute);

router.get("/", getChats);
router.get("/:participantId", getOrCreateChat);

export default router;

import express, { type Router } from "express";
import { authCallback, getAuthUser } from "../controllers/auth.controller";
import { protectRoute } from "../middlewares/auth";

const router: Router = express.Router();

router.get("/me", protectRoute, getAuthUser);
router.post("/callback", authCallback);

export default router;

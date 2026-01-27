import express, { type Router } from "express";
import { protectRoute } from "../middlewares/auth";
import { getAllUsers } from "../controllers/user.controller";

const router: Router = express.Router();

router.get("/", protectRoute, getAllUsers);

export default router;

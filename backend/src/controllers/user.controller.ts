import type { Response, NextFunction } from "express";
import { User } from "../models/user.model";
import type { AuthRequest } from "../middlewares/auth";

export const getAllUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const users = await User.find({ _id: { $ne: userId } })
      .select("name email avatar")
      .limit(50);

    res.status(200).json(users);
  } catch (error) {
    console.log("error", error);

    next(error);
  }
};

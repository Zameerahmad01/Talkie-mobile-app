import type { AuthRequest } from "../middlewares/auth";
import type { NextFunction, Response, Request } from "express";
import { User } from "../models/user.model";
import { clerkClient, getAuth } from "@clerk/express";

export async function getAuthUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500);
    next(error);
  }
}

export async function authCallback(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    let user = await User.findOne({
      clerkId,
    });
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      user = await User.create({
        clerkId: clerkId,
        name: clerkUser.firstName
          ? (clerkUser.firstName + " " + clerkUser.lastName).trim()
          : clerkUser.emailAddresses[0]?.emailAddress.split("@")[0],
        email: clerkUser.emailAddresses[0]?.emailAddress,
        avatar: clerkUser.imageUrl,
      });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500);
    next(error);
  }
}

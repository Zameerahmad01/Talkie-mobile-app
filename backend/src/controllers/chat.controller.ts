import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middlewares/auth";
import { Chat } from "../models/chat.model";

export const getChats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    const chats = await Chat.find({
      participants: userId,
    })
      .populate("participants", "name email avatar")
      .populate("latestMessage")
      .sort({
        latestMessage: -1,
      });

    const formatChats = chats.map((chat) => {
      const participant = chat.participants.find(
        (participant) => participant._id.toString() !== userId,
      );
      return {
        _id: chat._id,
        participant,
        lastMessage: chat?.lastMessage,
        createdAt: chat.createdAt,
      };
    });

    res.status(200).json(formatChats);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

export const getOrCreateChat = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    const { participantId } = req.params;

    let chat = await Chat.findOne({
      participants: {
        $all: [userId, participantId],
      },
    })
      .populate("participants", "name email avatar")
      .populate("latestMessage");

    if (!chat) {
      let newChat = new Chat({
        participants: [userId, participantId],
      });
      await newChat.save();

      chat = await newChat.populate("participants", "name email avatar");
    }

    const otherParticipant = chat.participants.find(
      (participant) => participant._id.toString() !== userId,
    );

    return res.status(200).json({
      _id: chat._id,
      participant: otherParticipant,
      lastMessage: chat?.lastMessage,
      lastMessageAt: chat?.lastMessageAt,
      createdAt: chat.createdAt,
    });
  } catch (error) {
    res.status(500);
    next(error);
  }
};

import { Socket, Server as socketServer } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyToken } from "@clerk/express";
import { User } from "../models/user.model";
import { Chat } from "../models/chat.model";
import { Message } from "../models/message.model";

//store online users in memory : userId -> socketId
const onlineUsers: Map<string, string> = new Map();

export const initializeSocket = (httpServer: HttpServer) => {
  const io = new socketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token; // this is what we get from the frontend send by user
    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const session = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      }); //
      const clerkId = session?.sub;
      if (!clerkId) {
        return next(new Error("Authentication error"));
      }

      const user = await User.findOne({ clerkId });
      if (!user) {
        return next(new Error("user not found"));
      }
      socket.data.userId = user._id.toString();
      next();
    } catch (error: any) {
      next(new Error(error));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId;

    //send list of online users to the newly connected user
    socket.emit("online-users", {
      userIds: Array.from(onlineUsers.keys()),
    });

    //add user to online users
    onlineUsers.set(userId, socket.id);

    //send online user to all other users
    socket.broadcast.emit("user-online", {
      userId,
    });

    //join user room
    socket.join(`user:${userId}`);

    socket.on("join-chat", (chatId: string) => {
      socket.join(`chat:${chatId}`);
    });
    socket.on("leave-chat", (chatId: string) => {
      socket.leave(`chat:${chatId}`);
    });

    //handle incoming messages
    socket.on(
      "send-message",
      async (data: { chatId: string; content: string }) => {
        try {
          const { chatId, content } = data;

          const chat = await Chat.findOne({
            _id: chatId,
            participants: userId,
          });

          if (!chat) {
            return socket.emit("error", "Chat not found");
          }

          const message = await Message.create({
            chat: chat._id,
            content,
            sender: userId,
          });

          chat.lastMessage = message._id;
          chat.lastMessageAt = message.createdAt;
          await chat.save();

          //populate the message with sender and chat details
          await message.populate("sender", "name username avatar");
          await message.populate("chat");

          //emit new message to all users in the chat room
          io.to(`chat:${chatId}`).emit("new-message", message);

          for (const participantId of chat.participants) {
            if (participantId.toString() !== userId) {
              io.to(`user:${participantId}`).emit("chat-updated", message);
            }
          }
        } catch (error) {
          console.log(error);
          socket.emit("error", "Failed to send message");
        }
      },
    );

    socket.on("typing", (data: { chatId: string; isTyping: boolean }) => {
      const { chatId, isTyping } = data;
      io.to(`chat:${chatId}`).emit("typing", {
        chatId,
        isTyping,
        userId,
      });
    });

    //handle disconnection
    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      socket.broadcast.emit("user-offline", {
        userId,
      });
    });
  });

  return io;
};

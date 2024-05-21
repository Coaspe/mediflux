import express, { Express } from "express";
import { Server } from "socket.io";
import http from "http";
import { CHANGED_RECORD, CONNECTED_USERS, CONNECTION, CREATE_RECORD, DELETE_RECORD, JOIN_ROOM, SAVE_RECORD, USER_JOINED } from '../shared-constants/index'

const app: Express = express();

const PORT = 5001;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const roomUsers: { [key: string]: { [key: number]: string } } = {};

io.on(CONNECTION, (socket) => {
  socket.on(
    JOIN_ROOM,
    ({
      roomId,
      userId,
      username,
    }: {
      roomId: string;
      userId: number;
      username: string;
    }) => {
      socket.join(roomId);

      if (!(roomId in roomUsers)) {
        roomUsers[roomId] = { [userId]: username };
      }

      if (!(userId in roomUsers[roomId])) {
        roomUsers[roomId][userId] = username;
        socket.broadcast.to(roomId).emit(USER_JOINED, userId);
      }

      io.in(roomId).emit(CONNECTED_USERS, Object.keys(roomUsers[roomId]));

    }
  );

  socket.on(CHANGED_RECORD, ({ recordId, roomId, userId }) => {
    io.in(roomId).emit(CHANGED_RECORD, { recordId, userId })
  })

  socket.on(SAVE_RECORD, ({ recordId, roomId, userId }) => {
    io.in(roomId).emit(SAVE_RECORD, { recordId, userId })
  })

  socket.on(CREATE_RECORD, ({ }) => {

  })

  socket.on(DELETE_RECORD, ({ recordId, roomId }) => {

  })
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
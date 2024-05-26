import express, { Express } from "express";
import { Server } from "socket.io";
import http from "http";
import {
  CONNECTED_USERS,
  CONNECTION,
  CREATE_RECORD,
  DELETE_RECORD,
  JOIN_ROOM,
  LOCK_RECORD,
  SAVE_RECORD,
  USER_JOINED,
  UNLOCK_RECORD,
  ROOM_ID,
} from "./contants";

const app: Express = express();

const PORT = 5004;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let id = 11
const roomUsers: { [key: string]: { [key: string]: string } } = {};
roomUsers[ROOM_ID] = {}
io.on(CONNECTION, (socket) => {
  socket.on(
    JOIN_ROOM,
    ({
      userId,
      username,
    }: {
      userId: number;
      username: string;
    }) => {
      socket.join(ROOM_ID);

      if (!(ROOM_ID in roomUsers)) {
        roomUsers[ROOM_ID] = { [userId]: username };
      }

      if (!(userId in roomUsers[ROOM_ID])) {
        roomUsers[ROOM_ID][userId] = username;
        socket.broadcast.to(ROOM_ID).emit(USER_JOINED, userId);
      }

      io.in(ROOM_ID).emit(CONNECTED_USERS, Object.keys(roomUsers[ROOM_ID]));
    }
  );

  socket.on(LOCK_RECORD, ({ recordId, locker, isLocked }) => {
    socket.broadcast.to(ROOM_ID).emit(LOCK_RECORD, { recordId, locker, isLocked })
  });

  socket.on(DELETE_RECORD, ({ recordId }) => {
    socket.broadcast.to(ROOM_ID).emit(DELETE_RECORD, { recordId })
  });

  socket.on(SAVE_RECORD, ({ recordId, record }) => {
    socket.broadcast.to(ROOM_ID).emit(SAVE_RECORD, { recordId, record })
  });

  socket.on(UNLOCK_RECORD, ({ recordId }) => {
    socket.broadcast.to(ROOM_ID).emit(UNLOCK_RECORD, { recordId })
  });

  socket.on(CREATE_RECORD, ({ record }) => {
    let precord = JSON.parse(record)
    precord['id'] = id.toString()
    id += 1
    record = JSON.stringify(precord)
    socket.broadcast.to(ROOM_ID).emit(CREATE_RECORD, { record })
  })
});

server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

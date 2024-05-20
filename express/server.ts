import express, { Express, Request, Response } from "express";
import { Server } from "socket.io";
import http from "http";

const app: Express = express();

const port = 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const roomUsers: { [key: string]: { [key: number]: string } } = {};

io.on("connection", (socket) => {
  socket.on(
    "join-room",
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
        socket.broadcast.to(roomId).emit("user-joined", userId);
      }

      io.in(roomId).emit("connected-users", Object.keys(roomUsers[roomId]));

    }
  );

  socket.on('lock-record', ({ recordId, roomId, username }) => {
    io.in(roomId).emit("lock-record", { recordId, username })
  })

  socket.on('unlock-record', ({ recordId, roomId, username }) => {
    io.in(roomId).emit("unlock-record", { recordId, username })
  })

  socket.on('create-record', ({ }) => {

  })

  socket.on('delete-record', ({ recordId, roomId }) => {

  })

  socket.on('change-record', ({ delta, roomId, username }) => {

  })
});

app.get("/", (req: Request, res: Response) => {
  res.send("Node.js + Express Server");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

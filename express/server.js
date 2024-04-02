"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const app = (0, express_1.default)();
const port = 5000;
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
const roomUsers = {};
io.on("connection", (socket) => {
    socket.on("join-room", ({ roomId, userId, username, }) => {
        socket.join(roomId);
        if (!(roomId in roomUsers)) {
            roomUsers[roomId] = { [userId]: username };
        }
        if (!(userId in roomUsers[roomId])) {
            roomUsers[roomId][userId] = username;
            socket.broadcast.to(roomId).emit("user-joined", userId);
        }
        io.in(roomId).emit("connecte-users", Object.keys(roomUsers[roomId]));
    });
});
app.get("/", (req, res) => {
    res.send("Node.js + Express Server");
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

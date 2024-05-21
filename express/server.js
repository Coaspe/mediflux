"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const index_1 = require("../shared-constants/index");
const app = (0, express_1.default)();
const PORT = 5001;
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
const roomUsers = {};
io.on(index_1.CONNECTION, (socket) => {
    socket.on(index_1.JOIN_ROOM, ({ roomId, userId, username, }) => {
        socket.join(roomId);
        if (!(roomId in roomUsers)) {
            roomUsers[roomId] = { [userId]: username };
        }
        if (!(userId in roomUsers[roomId])) {
            roomUsers[roomId][userId] = username;
            socket.broadcast.to(roomId).emit(index_1.USER_JOINED, userId);
        }
        io.in(roomId).emit(index_1.CONNECTED_USERS, Object.keys(roomUsers[roomId]));
    });
    socket.on(index_1.CHANGED_RECORD, ({ recordId, roomId, userId }) => {
        io.in(roomId).emit(index_1.CHANGED_RECORD, { recordId, userId });
    });
    socket.on(index_1.SAVE_RECORD, ({ recordId, roomId, userId }) => {
        io.in(roomId).emit(index_1.SAVE_RECORD, { recordId, userId });
    });
    socket.on(index_1.CREATE_RECORD, ({}) => {
    });
    socket.on(index_1.DELETE_RECORD, ({ recordId, roomId }) => {
    });
});
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

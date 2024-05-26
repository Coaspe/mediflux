"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const contants_1 = require("./contants");
const app = (0, express_1.default)();
const PORT = 5004;
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
let id = 11;
const roomUsers = {};
roomUsers[contants_1.ROOM_ID] = {};
io.on(contants_1.CONNECTION, (socket) => {
    socket.on(contants_1.JOIN_ROOM, ({ userId, username, }) => {
        socket.join(contants_1.ROOM_ID);
        if (!(contants_1.ROOM_ID in roomUsers)) {
            roomUsers[contants_1.ROOM_ID] = { [userId]: username };
        }
        if (!(userId in roomUsers[contants_1.ROOM_ID])) {
            roomUsers[contants_1.ROOM_ID][userId] = username;
            socket.broadcast.to(contants_1.ROOM_ID).emit(contants_1.USER_JOINED, userId);
        }
        io.in(contants_1.ROOM_ID).emit(contants_1.CONNECTED_USERS, Object.keys(roomUsers[contants_1.ROOM_ID]));
    });
    socket.on(contants_1.LOCK_RECORD, ({ recordId, locker, isLocked }) => {
        socket.broadcast.to(contants_1.ROOM_ID).emit(contants_1.LOCK_RECORD, { recordId, locker, isLocked });
    });
    socket.on(contants_1.DELETE_RECORD, ({ recordId }) => {
        socket.broadcast.to(contants_1.ROOM_ID).emit(contants_1.DELETE_RECORD, { recordId });
    });
    socket.on(contants_1.SAVE_RECORD, ({ recordId, record }) => {
        socket.broadcast.to(contants_1.ROOM_ID).emit(contants_1.SAVE_RECORD, { recordId, record });
    });
    socket.on(contants_1.UNLOCK_RECORD, ({ recordId }) => {
        socket.broadcast.to(contants_1.ROOM_ID).emit(contants_1.UNLOCK_RECORD, { recordId });
    });
    socket.on(contants_1.CREATE_RECORD, ({ record }) => {
        let precord = JSON.parse(record);
        precord['id'] = id.toString();
        id += 1;
        record = JSON.stringify(precord);
        socket.broadcast.to(contants_1.ROOM_ID).emit(contants_1.CREATE_RECORD, { record });
    });
});
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

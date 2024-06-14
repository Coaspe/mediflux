import express from "express";
import { Server } from "socket.io";
import http from "http";
import { CONNECTED_USERS, CONNECTION, CREATE_RECORD, DELETE_RECORD, JOIN_ROOM, LOCK_RECORD, SAVE_RECORD, USER_JOINED, UNLOCK_RECORD, ROOM_ID, PORT } from "shared";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});
let id = 11;
const roomUsers = {};
roomUsers[ROOM_ID] = {};
io.on(CONNECTION, (socket) => {
    socket.on(JOIN_ROOM, ({ userId, username, }) => {
        socket.join(ROOM_ID);
        if (!(ROOM_ID in roomUsers)) {
            roomUsers[ROOM_ID] = { [userId]: username };
        }
        if (!(userId in roomUsers[ROOM_ID])) {
            roomUsers[ROOM_ID][userId] = username;
            socket.broadcast.to(ROOM_ID).emit(USER_JOINED, userId);
        }
        io.in(ROOM_ID).emit(CONNECTED_USERS, Object.keys(roomUsers[ROOM_ID]));
    });
    socket.on(LOCK_RECORD, ({ recordId, locker, isLocked, tableType }) => {
        socket.broadcast.to(ROOM_ID).emit(LOCK_RECORD, { recordId, locker, isLocked, tableType });
    });
    socket.on(DELETE_RECORD, ({ recordId, tableType }) => {
        socket.broadcast.to(ROOM_ID).emit(DELETE_RECORD, { recordId, tableType });
    });
    socket.on(SAVE_RECORD, ({ recordId, record, tableType }) => {
        socket.broadcast.to(ROOM_ID).emit(SAVE_RECORD, { recordId, record, tableType });
    });
    socket.on(UNLOCK_RECORD, ({ recordId, tableType }) => {
        socket.broadcast.to(ROOM_ID).emit(UNLOCK_RECORD, { recordId, tableType });
    });
    socket.on(CREATE_RECORD, ({ record, tableType }) => {
        let precord = JSON.parse(record);
        precord['id'] = id.toString();
        id += 1;
        record = JSON.stringify(precord);
        socket.broadcast.to(ROOM_ID).emit(CREATE_RECORD, { record, tableType });
    });
});
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

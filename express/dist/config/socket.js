import { Server } from "socket.io";
import { JOIN_ROOM, LOCK_RECORD, DELETE_RECORD, SAVE_RECORD, UNLOCK_RECORD, CREATE_RECORD, USER_JOINED, CONNECTED_USERS, CONNECTION, SCHEDULING_ROOM_ID, ARCHIVE_ROOM_ID } from "shared";
const room = {};
export const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
        },
        path: "/socket",
    });
    io.on(CONNECTION, (socket) => {
        socket.on(JOIN_ROOM, ({ userId, username, roomId, clinic }) => {
            if (!userId || !username || !roomId || !clinic)
                return;
            socket.join(clinic + roomId);
            if (!(clinic in room)) {
                room[clinic] = {};
                room[clinic][SCHEDULING_ROOM_ID] = {};
                room[clinic][ARCHIVE_ROOM_ID] = {};
            }
            if (!(userId in room[clinic][roomId])) {
                room[clinic][roomId][userId] = username;
                socket.broadcast.to(roomId).emit(USER_JOINED, userId);
            }
            io.in(roomId).emit(CONNECTED_USERS, Object.keys(room[clinic][roomId]));
        });
        socket.on(LOCK_RECORD, ({ recordId, locker, tableType, roomId }) => {
            socket.broadcast.to(roomId).emit(LOCK_RECORD, { recordId, locker, tableType });
        });
        socket.on(DELETE_RECORD, ({ recordIds, tableType, roomId }) => {
            socket.broadcast.to(roomId).emit(DELETE_RECORD, { recordIds, tableType });
        });
        socket.on(SAVE_RECORD, ({ records, tableType, roomId }) => {
            socket.broadcast.to(roomId).emit(SAVE_RECORD, { records, tableType });
        });
        socket.on(UNLOCK_RECORD, ({ recordId, tableType, roomId }) => {
            socket.broadcast.to(roomId).emit(UNLOCK_RECORD, { recordId, tableType });
        });
        socket.on(CREATE_RECORD, ({ records, tableType, roomId }) => {
            socket.broadcast.to(roomId).emit(CREATE_RECORD, { records, tableType });
        });
    });
};

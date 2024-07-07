import { LOCK_RECORD, SCHEDULING_ROOM_ID, DELETE_RECORD, SAVE_RECORD, CREATE_RECORD, UNLOCK_RECORD } from "shared";
import { Socket } from "socket.io-client";
import { TableType, PRecord, User } from "~/type";

export const emitLockRecord = (recordId: String, tableType: TableType, socket: Socket | null, user: User, roomId: string) => {
  const locker = { id: user.id, name: user.name };
  socket?.emit(LOCK_RECORD, { recordId, locker, roomId: SCHEDULING_ROOM_ID, tableType });
};

export const emitDeleteRecord = (recordId: String, tableType: TableType, socket: Socket | null, user: User, roomId: string) => {
  socket?.emit(DELETE_RECORD, {
    recordId,
    userId: user.id,
    roomId,
    tableType,
  });
};

export const emitSaveRecord = (record: PRecord, tableType: TableType, socket: Socket | null, roomId: string) => {
  socket?.emit(SAVE_RECORD, {
    recordId: record.id,
    roomId,
    record: JSON.stringify(record),
    tableType,
  });
};

export const emitCreateRecord = (record: PRecord, tableType: TableType, socket: Socket | null, roomId: string) => {
  socket?.emit(CREATE_RECORD, {
    record: JSON.stringify(record),
    roomId,
    tableType,
  });
};

export const emitUnLockRecord = (recordId: String, tableType: TableType, socket: Socket | null, roomId: string) => {
  socket?.emit(UNLOCK_RECORD, { recordId, roomId, tableType });
};

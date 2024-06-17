import {
  LOCK_RECORD,
  ROOM_ID,
  DELETE_RECORD,
  SAVE_RECORD,
  CREATE_RECORD,
  UNLOCK_RECORD,
} from "shared";
import { Socket } from "socket.io-client";
import { TableType, PRecord, User } from "~/type";

export const emitLockRecord = (
  recordId: String,
  tableType: TableType,
  socket: Socket | null,
  user: User
) => {
  const locker = { id: user.id, name: user.name };
  socket?.emit(LOCK_RECORD, { recordId, locker, roomId: ROOM_ID, tableType });
  console.log("Lock", recordId);
};

export const emitDeleteRecord = (
  recordId: String,
  tableType: TableType,
  socket: Socket | null,
  user: User
) => {
  socket?.emit(DELETE_RECORD, {
    recordId,
    userId: user.id,
    roomId: ROOM_ID,
    tableType,
  });
};

export const emitSaveRecord = (
  record: PRecord,
  tableType: TableType,
  socket: Socket | null
) => {
  socket?.emit(SAVE_RECORD, {
    recordId: record.id,
    roomId: ROOM_ID,
    record: JSON.stringify(record),
    tableType,
  });
};

export const emitCreateRecord = (
  record: PRecord,
  tableType: TableType,
  socket: Socket | null
) => {
  socket?.emit(CREATE_RECORD, {
    record: JSON.stringify(record),
    roomId: ROOM_ID,
    tableType,
  });
};

export const emitUnLockRecord = (
  recordId: String,
  tableType: TableType,
  socket: Socket | null
) => {
  socket?.emit(UNLOCK_RECORD, { recordId, roomId: ROOM_ID, tableType });
};

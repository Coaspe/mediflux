import { UseMutateFunction } from "@tanstack/react-query";
import { MRT_TableInstance } from "material-react-table";
import { LOCK_RECORD, SCHEDULING_ROOM_ID, DELETE_RECORD, SAVE_RECORD, CREATE_RECORD, UNLOCK_RECORD } from "shared";
import { Socket } from "socket.io-client";
import { TableType, PRecord, User } from "~/type";

export const emitLockRecord = (recordId: string, tableType: TableType, socket: Socket | null, user: User, roomId: string) => {
  const locker = { id: user.id, name: user.name };
  socket?.emit(LOCK_RECORD, { recordId, locker, roomId: SCHEDULING_ROOM_ID, tableType });
};

export const emitDeleteRecord = (recordId: string, tableType: TableType, socket: Socket | null, user: User, roomId: string) => {
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

export const emitUnLockRecord = (recordId: string, tableType: TableType, socket: Socket | null, roomId: string) => {
  socket?.emit(UNLOCK_RECORD, { recordId, roomId, tableType });
};

export const onLockRecord = ({ recordId, locker, table, updateFn }: { recordId: string; locker: User; table: MRT_TableInstance<PRecord>, updateFn: UseMutateFunction<void, Error, PRecord, void> }) => {
  const row = JSON.parse(JSON.stringify(table.getRow(recordId).original))
  if (row) {
    row.LockingUser = locker;
    updateFn(row)
  }
};
export const onUnlockRecord = ({ recordId, table, updateFn }: { recordId: string; tableType: TableType; table: MRT_TableInstance<PRecord>, updateFn: UseMutateFunction<void, Error, PRecord, void> }) => {
  const row = JSON.parse(JSON.stringify(table.getRow(recordId).original))
  if (row) {
    row.LockingUser = null;
    updateFn(row)
  }
};
export const onSaveRecord = ({ recordId, record, table, updateFn }: { recordId: string; record: string; table: MRT_TableInstance<PRecord>, updateFn: UseMutateFunction<void, Error, PRecord, void> }) => {
  const precord: PRecord = JSON.parse(record);
  precord.LockingUser = null;
  const row = JSON.parse(JSON.stringify(table.getRow(recordId).original))
  if (row) {
    row = precord;
    updateFn(row)
  }
};
export const onCreateRecord = ({ record, createFn }: { record: string, createFn: UseMutateFunction<void, Error, PRecord, void> }) => {
  const precord: PRecord = JSON.parse(record);
  precord.LockingUser = null;
  createFn(precord)
  if (precord.opReadiness === "Y") {
    playAudio();
  }
};

export const onDeleteRecord = ({ recordId, deleteFn }: { recordId: string; deleteFn: UseMutateFunction<void, Error, PRecord, void> }) => {
  deleteFn(recordId)
};
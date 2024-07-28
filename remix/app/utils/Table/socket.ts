/** @format */

import { UseMutateFunction } from "@tanstack/react-query";
import { CellPosition } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { MutableRefObject, RefObject } from "react";
import { LOCK_RECORD, DELETE_RECORD, SAVE_RECORD, CREATE_RECORD, UNLOCK_RECORD } from "shared";
import { Socket } from "socket.io-client";
import { TableType, PRecord, User } from "~/type";

export const emitLockRecord = (recordId: string | undefined, tableType: TableType, socket: Socket | null, user: User | undefined, roomId: string) => {
  if (!user || !recordId) {
    return;
  }
  const locker = { id: user.id, name: user.name };
  socket?.emit(LOCK_RECORD, { recordId, locker, roomId, tableType });
};

export const emitDeleteRecord = (recordId: string, tableType: TableType, socket: Socket | null, user: User | undefined, roomId: string) => {
  if (!user) {
    return;
  }
  socket?.emit(DELETE_RECORD, {
    recordId,
    userId: user.id,
    roomId,
    tableType,
  });
};

export const emitSaveRecord = (tableType: TableType, id: string | undefined, socket: Socket | null, roomId: string, propertyName: string | undefined, newValue: any) => {
  if (propertyName && id) {
    socket?.emit(SAVE_RECORD, {
      recordId: id,
      roomId,
      newValue,
      propertyName,
      tableType,
    });
  }
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

export const onLockRecord = ({ recordId, locker, tableType }: { recordId: string; locker: User; tableType: TableType }, gridRef: RefObject<AgGridReact<any>>, curTableType: TableType) => {
  if (curTableType !== tableType) return;
  const row = gridRef.current?.api.getRowNode(recordId);
  if (row) {
    row.setDataValue("lockingUser", locker);
  }
};

export const onUnlockRecord = ({ recordId, tableType }: { recordId: string; tableType: TableType }, gridRef: RefObject<AgGridReact<any>>, curTableType: TableType) => {
  if (curTableType !== tableType) return;
  const row = gridRef.current?.api.getRowNode(recordId);
  if (row) {
    row.setDataValue("lockingUser", null);
  }
};

export const onSaveRecord = (
  { record, recordId, tableType, propertyName, newValue }: { record: string; recordId: string; tableType: TableType; propertyName: string; newValue: any },
  gridRef: RefObject<AgGridReact<any>>,
  curTableType: TableType
) => {
  if (curTableType !== tableType || !recordId) return;
  try {
    const row = gridRef.current?.api.getRowNode(recordId);

    if (row) {
      row.setDataValue("lockingUser", null);
      row.setDataValue(propertyName, newValue);
    }
  } catch (error) {
    if (gridRef.current) {
      const precord: PRecord = JSON.parse(record);
      precord.lockingUser = null;
      gridRef.current.api.applyTransaction({
        add: [record],
        addIndex: 0,
      });
    }
  }
};
export const onCreateRecord = (
  { record, tableType }: { record: string; tableType: TableType },
  gridRef: RefObject<AgGridReact<any>>,
  curTableType: TableType,
  focusedCellRef: MutableRefObject<CellPosition | null>
) => {
  if (curTableType !== tableType) return;
  if (gridRef.current) {
    const precord: PRecord = JSON.parse(record);
    precord.lockingUser = null;
    gridRef.current.api.applyTransaction({
      add: [precord],
      addIndex: 0,
    });
    if (focusedCellRef.current) {
      gridRef.current.api.setFocusedCell(focusedCellRef.current.rowIndex, focusedCellRef.current.column.getId());
      gridRef.current.api.startEditingCell({
        rowIndex: focusedCellRef.current.rowIndex,
        colKey: focusedCellRef.current.column.getId(),
      });
    }
  }
};
export const onDeleteRecord = ({ recordId, tableType }: { recordId: string; tableType: TableType }, deleteFn: UseMutateFunction<void, Error, string, void>, curTableType: TableType) => {
  if (tableType !== curTableType) return;
  deleteFn(recordId);
};

/** @format */

import { AgGridReact } from "ag-grid-react";
import { MutableRefObject, RefObject } from "react";
import { LOCK_RECORD, DELETE_RECORD, SAVE_RECORD, CREATE_RECORD, UNLOCK_RECORD } from "shared";
import { Socket } from "socket.io-client";
import { TableType, PRecord, User, FocusedRow } from "~/type";
import { checkIsInvaildRecord, moveRecord } from "../utils";

export const emitLockRecord = async (recordId: string | undefined, tableType: TableType, socket: Socket | null, user: User | undefined, roomId: string) => {
  if (!user || !recordId) {
    return;
  }
  const locker = { id: user.id, name: user.name };
  socket?.emit(LOCK_RECORD, { recordId, locker, roomId, tableType });
};

export const emitDeleteRecords = (recordIds: string[], tableType: TableType, socket: Socket | null, user: User | undefined, roomId: string) => {
  if (!user) {
    return;
  }
  socket?.emit(DELETE_RECORD, {
    recordIds,
    userId: user.id,
    roomId,
    tableType,
  });
};

export const emitSaveRecord = async (record: PRecord | undefined, tableType: TableType, socket: Socket | null, roomId: string, propertyName: string | undefined, newValue: any) => {
  if (propertyName && record) {
    socket?.emit(SAVE_RECORD, {
      record,
      roomId,
      newValue,
      propertyName,
      tableType,
    });
  }
};

export const emitCreateRecords = (records: PRecord[], tableType: TableType, socket: Socket | null, roomId: string) => {
  socket?.emit(CREATE_RECORD, {
    records,
    roomId,
    tableType,
  });
};

export const emitUnlockRecord = async (recordId: string, tableType: TableType, socket: Socket | null, roomId: string) => {
  socket?.emit(UNLOCK_RECORD, { recordId, roomId, tableType });
};

export const onLockRecord = ({ recordId, locker, tableType }: { recordId: string; locker: User; tableType: TableType }, gridRef: RefObject<AgGridReact<any>>, curTableType: TableType) => {
  if (curTableType !== tableType) return;
  const row = gridRef.current?.api.getRowNode(recordId);

  if (row) {
    row.setDataValue("lockingUser", locker.id);
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
  { record, tableType, propertyName, newValue }: { record: PRecord; tableType: TableType; propertyName: string; newValue: any },
  gridRef: RefObject<AgGridReact<any>>,
  theOtherGridRef: RefObject<AgGridReact<any>>,
  curTableType: TableType
) => {
  if (curTableType !== tableType || !record) return;

  try {
    if (record) {
      const { etrcondition, rtecondition1, rtecondition2 } = checkIsInvaildRecord(curTableType, record);

      if (etrcondition || rtecondition1 || rtecondition2) {
        moveRecord(gridRef, theOtherGridRef, record);
      } else {
        const row = gridRef.current?.api.getRowNode(record.id);
        if (row) {
          row.setDataValue("lockingUser", null);
          row.setDataValue(propertyName, newValue);
        }
      }
    }
  } catch (error) {}
};
export const onCreateRecord = (
  { records, tableType }: { records: PRecord[]; tableType: TableType },
  gridRef: RefObject<AgGridReact<any>>,
  curTableType: TableType,
  focusedRowRef: MutableRefObject<FocusedRow | null>,
  isEditingRef: MutableRefObject<boolean>,
  audioRef: RefObject<HTMLAudioElement>
) => {
  if (curTableType !== tableType) return;
  if (gridRef.current) {
    gridRef.current.api.applyTransaction({
      add: records,
      addIndex: 0,
    });
    focusEditingRecord(gridRef, focusedRowRef, isEditingRef);
    if (audioRef.current) {
      audioRef.current.play();
    }
  }
};
export const onDeleteRecord = (
  { recordIds, tableType }: { recordIds: string[]; tableType: TableType },
  gridRef: RefObject<AgGridReact<any>>,
  curTableType: TableType,
  focusedRowRef: MutableRefObject<FocusedRow | null>,
  isEditingRef: MutableRefObject<boolean>
) => {
  if (tableType !== curTableType) return;
  if (gridRef.current) {
    gridRef.current?.api.applyTransaction({
      remove: recordIds.map((id) => {
        return {
          id,
        } as PRecord;
      }),
    });
    focusEditingRecord(gridRef, focusedRowRef, isEditingRef);
  }
};

const focusEditingRecord = (gridRef: RefObject<AgGridReact<any>>, focusedRowRef: MutableRefObject<FocusedRow | null>, isEditingRef: MutableRefObject<boolean>) => {
  if (gridRef.current && focusedRowRef.current && isEditingRef.current) {
    const focusedRecord = gridRef.current.api.getRowNode(focusedRowRef.current.rowId);
    if (focusedRecord && focusedRecord.rowIndex) {
      gridRef.current.api.setFocusedCell(focusedRecord.rowIndex, focusedRowRef.current.cellPosition.column.getId());
      gridRef.current.api.startEditingCell({
        rowIndex: focusedRecord.rowIndex,
        colKey: focusedRowRef.current.cellPosition.column.getId(),
      });
    }
  }
};

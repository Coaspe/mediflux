/** @format */

import { AgGridReact } from "ag-grid-react";
import { MutableRefObject, RefObject } from "react";
import { LOCK_RECORD, DELETE_RECORD, SAVE_RECORD, CREATE_RECORD, UNLOCK_RECORD } from "shared";
import { Socket } from "socket.io-client";
import { TableType, PRecord, User, FocusedRow, PRecordWithFocusedRow, ServerPRecord } from "~/type";
import { checkIsInvaildRecord, convertServerPRecordtToPRecord, moveRecord } from "../utils";
import { RowDataTransaction } from "ag-grid-community";

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

export const emitSaveRecord = async (records: PRecord[] | undefined, tableType: TableType, socket: Socket | null, roomId: string) => {
  console.log(records);

  if (records && records?.length > 0) {
    socket?.emit(SAVE_RECORD, {
      records,
      roomId,
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
  { records, tableType }: { records: PRecord[]; tableType: TableType; propertyName: string; newValue: any },
  gridRef: RefObject<AgGridReact<any>>,
  theOtherGridRef: RefObject<AgGridReact<any>>,
  curTableType: TableType
) => {
  if (curTableType !== tableType || !records) return;

  try {
    if (records.length > 0) {
      records.forEach((record) => {
        const { etrcondition, rtecondition1, rtecondition2 } = checkIsInvaildRecord(curTableType, record);

        if (etrcondition || rtecondition1 || rtecondition2) {
          moveRecord(gridRef, theOtherGridRef, record);
        } else {
          const row = gridRef.current?.api.getRowNode(record.id);
          if (row) {
            row.setData(record);
          }
        }
      });
    }
  } catch (error) {}
};

const applyTransactionWithEvent = (gridRef: RefObject<AgGridReact<any>>, transaction: RowDataTransaction, eventFlag: boolean = true) => {
  if (gridRef.current) {
    const api = gridRef.current.api;
    if (eventFlag) {
      const event = new CustomEvent("onLineChangingTransactionApplied");
      api.dispatchEvent(event);
    }
    api.applyTransaction(transaction);
  }
};

export const onCreateRecord = (
  { records, tableType }: { records: PRecord[]; tableType: TableType },
  gridRef: RefObject<AgGridReact<any>>,
  curTableType: TableType,
  editingRowRef: MutableRefObject<PRecordWithFocusedRow | null>,
  audioRef: RefObject<HTMLAudioElement>
) => {
  if (curTableType !== tableType) return;
  if (gridRef.current) {
    const transaction = {
      add: records,
      addIndex: 0,
    } as RowDataTransaction<any>;

    applyTransactionWithEvent(gridRef, transaction);
    focusEditingRecord(gridRef, editingRowRef);
    if (audioRef.current && tableType === "Ready") {
      audioRef.current.play();
    }
  }
};
export const onDeleteRecord = (
  { recordIds, tableType }: { recordIds: string[]; tableType: TableType },
  gridRef: RefObject<AgGridReact<any>>,
  curTableType: TableType,
  editingRowRef: MutableRefObject<PRecordWithFocusedRow | null>
) => {
  if (tableType !== curTableType) return;
  if (gridRef.current) {
    let eventFlag = false;
    let transaction = {
      remove: recordIds.map((id) => {
        return { id } as PRecord;
      }),
    } as RowDataTransaction<any>;

    if (editingRowRef.current) {
      const editingRecordIndex = gridRef.current.api.getRowNode(editingRowRef.current.id)?.rowIndex;
      if (typeof editingRecordIndex === "number" && editingRecordIndex >= 0) {
        const recordIndice = recordIds.map((id) => gridRef.current?.api.getRowNode(id)?.rowIndex);
        eventFlag = recordIndice.some((value) => typeof value === "number" && value < editingRecordIndex);
      }
    }
    applyTransactionWithEvent(gridRef, transaction, eventFlag);
    focusEditingRecord(gridRef, editingRowRef);
  }
};

const focusEditingRecord = (gridRef: RefObject<AgGridReact<any>>, editingRowRef: MutableRefObject<FocusedRow | null>) => {
  if (gridRef.current && editingRowRef.current) {
    const focusedRecord = gridRef.current.api.getRowNode(editingRowRef.current.rowId);
    if (focusedRecord && typeof focusedRecord.rowIndex === "number") {
      gridRef.current.api.setFocusedCell(focusedRecord.rowIndex, editingRowRef.current.cellPosition.column.getId());
      gridRef.current.api.startEditingCell({
        rowIndex: focusedRecord.rowIndex,
        colKey: editingRowRef.current.cellPosition.column.getId(),
      });
    }
  }
};

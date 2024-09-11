/** @format */

import { RefObject } from "react";
import { LOCK_RECORD, DELETE_RECORD, SAVE_RECORD, CREATE_RECORD, UNLOCK_RECORD } from "shared";
import { Socket } from "socket.io-client";
import { TableType, PRecord, User, CustomAgGridReactProps } from "~/types/type";
import { checkIsInvaildRecord, focusEditingRecord, getEditingCell, moveRecord } from "../utils";
import { RowDataTransaction } from "ag-grid-community";
import { LOCKING_USER } from "~/constant";

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

export const onLockRecord = ({ recordId, locker, tableType }: { recordId: string; locker: User; tableType: TableType }, gridRef: RefObject<CustomAgGridReactProps<any>>, curTableType: TableType) => {
  if (curTableType !== tableType) return;
  const row = gridRef.current?.api.getRowNode(recordId);

  if (row) {
    row.setDataValue(LOCKING_USER, locker.id);
    row.setSelected(false);
  }
};

export const onUnlockRecord = ({ recordId, tableType }: { recordId: string; tableType: TableType }, gridRef: RefObject<CustomAgGridReactProps<any>>, curTableType: TableType) => {
  if (curTableType !== tableType) return;
  const row = gridRef.current?.api.getRowNode(recordId);
  if (row) {
    row.setDataValue(LOCKING_USER, null);
  }
};

export const onSaveRecord = (
  { records, tableType }: { records: PRecord[]; tableType: TableType; propertyName: string; newValue: any },
  gridRef: RefObject<CustomAgGridReactProps<any>>,
  curTableType: TableType,
  audioRef: RefObject<HTMLAudioElement>,
  theOtherGridRef?: RefObject<CustomAgGridReactProps<any>>
) => {
  if (curTableType !== tableType || !records) return;

  try {
    if (records.length > 0) {
      records.forEach((record) => {
        const { etrcondition, rtecondition1, rtecondition2 } = checkIsInvaildRecord(curTableType, record);
        if (theOtherGridRef && (etrcondition || rtecondition1 || rtecondition2)) {
          moveRecord(gridRef, theOtherGridRef, record);
          if (theOtherGridRef.current?.tableType === "Ready") {
            audioRef.current?.play();
          }
        } else {
          const row = gridRef.current?.api.getRowNode(record.id);
          if (row) {
            row.setData(record);
            if (record.lockingUser) {
              row.setSelected(false);
            }
          }
        }
      });
    }
  } catch (error) {}
};

const applyTransactionWithEvent = (gridRef: RefObject<CustomAgGridReactProps<any>>, transaction: RowDataTransaction, eventFlag: boolean = true) => {
  if (gridRef.current) {
    const api = gridRef.current.api;
    const editingCells = gridRef.current.api.getEditingCells();
    const needFocus = eventFlag && editingCells && editingCells.length > 0;
    let editingRowId = undefined;

    if (needFocus) {
      const event = new CustomEvent("onLineChangingTransactionApplied");
      api.dispatchEvent(event);
      editingRowId = api.getDisplayedRowAtIndex(editingCells[0].rowIndex)?.id;
    }

    api.applyTransaction(transaction);

    if (needFocus) {
      return { id: editingRowId, columnId: editingCells[0].column.getColId() };
    }
  }
  return { id: undefined, columnId: undefined };
};

export const onCreateRecord = ({ records, tableType }: { records: PRecord[]; tableType: TableType }, gridRef: RefObject<CustomAgGridReactProps<any>>, curTableType: TableType) => {
  if (curTableType !== tableType) return;
  if (gridRef.current) {
    const transaction = {
      add: records,
      addIndex: 0,
    } as RowDataTransaction<any>;
    const { id, columnId } = applyTransactionWithEvent(gridRef, transaction);
    focusEditingRecord(gridRef, id, columnId);
  }
};
export const onDeleteRecord = ({ recordIds, tableType }: { recordIds: string[]; tableType: TableType }, gridRef: RefObject<CustomAgGridReactProps<any>>, curTableType: TableType) => {
  if (tableType !== curTableType) return;
  if (gridRef.current) {
    let eventFlag = false;
    let transaction = {
      remove: recordIds.map((id) => {
        return { id } as PRecord;
      }),
    } as RowDataTransaction<any>;

    const editingCell = getEditingCell(gridRef);
    if (editingCell) {
      const editingRecordIndex = editingCell.rowIndex;
      if (typeof editingRecordIndex === "number" && editingRecordIndex >= 0) {
        const recordIndice = recordIds.map((id) => gridRef.current?.api.getRowNode(id)?.rowIndex);
        eventFlag = recordIndice.some((value) => typeof value === "number" && value < editingRecordIndex);
      }
    }
    const { id, columnId } = applyTransactionWithEvent(gridRef, transaction, eventFlag);
    focusEditingRecord(gridRef, id, columnId);
  }
};

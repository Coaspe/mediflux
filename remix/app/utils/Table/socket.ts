import { AgGridReact } from "ag-grid-react";
import { MutableRefObject, RefObject } from "react";
import { LOCK_RECORD, DELETE_RECORD, SAVE_RECORD, CREATE_RECORD, UNLOCK_RECORD } from "shared";
import { Socket } from "socket.io-client";
import { TableType, PRecord, User, FocusedRow } from "~/type";

export const emitLockRecord = (recordId: string | undefined, tableType: TableType, socket: Socket | null, user: User | undefined, roomId: string) => {
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

export const emitCreateRecords = (records: PRecord[], tableType: TableType, socket: Socket | null, roomId: string) => {
  socket?.emit(CREATE_RECORD, {
    records,
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
  theOtherGridRef: RefObject<AgGridReact<any>>,
  curTableType: TableType
) => {
  if (curTableType !== tableType || !recordId) return;
  try {
    const row = gridRef.current?.api.getRowNode(recordId);

    if (row) {
      // row.setDataValue("lockingUser", null);
      // row.setDataValue(propertyName, newValue);
      console.log(propertyName, newValue);

      if ((curTableType === "ExceptReady" && propertyName === "opReadiness" && newValue === "Y") || (curTableType === "Ready" && propertyName === "doctor" && newValue)) {
        gridRef.current?.api.applyTransaction({
          remove: [row.data],
        });
        row.data.lockingUser = null;
        row.data[propertyName] = newValue;
        theOtherGridRef.current?.api.applyTransaction({
          add: [row.data],
          addIndex: 0,
        });
      }
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
  { records, tableType }: { records: PRecord[]; tableType: TableType },
  gridRef: RefObject<AgGridReact<any>>,
  curTableType: TableType,
  focusedRow: MutableRefObject<FocusedRow | null>
) => {
  if (curTableType !== tableType) return;
  if (gridRef.current) {
    gridRef.current.api.applyTransaction({
      add: records,
      addIndex: 0,
    });

    if (focusedRow.current) {
      const focusedRecord = gridRef.current.api.getRowNode(focusedRow.current.rowId);
      if (focusedRecord && focusedRecord.rowIndex) {
        gridRef.current.api.setFocusedCell(focusedRecord.rowIndex, focusedRow.current.cellPosition.column.getId());
        gridRef.current.api.startEditingCell({
          rowIndex: focusedRecord.rowIndex,
          colKey: focusedRow.current.cellPosition.column.getId(),
        });
      }
    }
  }
};
export const onDeleteRecord = (
  { recordIds, tableType }: { recordIds: string[]; tableType: TableType },
  gridRef: RefObject<AgGridReact<any>>,
  curTableType: TableType,
  focusedCellRef: MutableRefObject<FocusedRow | null>
) => {
  if (tableType !== curTableType) return;
  gridRef.current?.api.applyTransaction({
    remove: recordIds.map((id) => {
      return {
        id,
      } as PRecord;
    }),
  });
};

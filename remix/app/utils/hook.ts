import { useCallback, useRef } from "react";
import { useSetRecoilState } from "recoil";
import { globalSnackbarState } from "~/recoil_state";
import { MessageSeverity } from "~/types/type";
import { useEffect, MutableRefObject, RefObject } from "react";
import { Socket } from "socket.io-client";
import { onLockRecord, onUnlockRecord, onSaveRecord, onDeleteRecord, onCreateRecord } from "~/utils/Table/socket";
import { LOCK_RECORD, UNLOCK_RECORD, SAVE_RECORD, CREATE_RECORD, DELETE_RECORD } from "shared";
import { CustomAgGridReactProps, TableType } from "~/types/type";
import { PRecord } from "shared";
import { GridApi, CellEditingStoppedEvent, CellEditingStartedEvent } from "ag-grid-community";
import { checkIsInvalidRecord, getEditingCell, moveRecord, refreshTreatmentCells, statusTransition } from "~/utils/utils";
import { lockOrUnlockRecords, updateRecord } from "~/utils/request.client";
import { emitLockRecord, emitSaveRecord } from "~/utils/Table/socket";
import { LOCKING_USER, ON_LINE_CHANGING_TRANSACTION_APPLIED } from "~/constants/constant";

export const useGlobalSnackbar = () => {
  const setGlobalSnackBar = useSetRecoilState(globalSnackbarState);

  const showErrorSnackbar = useCallback(
    (message: string, severity: MessageSeverity = "error") => {
      setGlobalSnackBar({ open: true, msg: message, severity });
    },
    [setGlobalSnackBar]
  );

  return showErrorSnackbar;
};

export const useSocket = (
  socket: Socket | null,
  gridRef: RefObject<CustomAgGridReactProps<PRecord>>,
  tableType: TableType,
  audioRef: MutableRefObject<HTMLAudioElement | null>,
  theOtherGridRef?: RefObject<CustomAgGridReactProps<PRecord>>
) => {
  useEffect(() => {
    if (!socket) return;

    socket.on(UNLOCK_RECORD, (arg) => onUnlockRecord(arg, gridRef, tableType));
    socket.on(LOCK_RECORD, (arg) => onLockRecord(arg, gridRef, tableType));
    socket.on(SAVE_RECORD, (arg) => onSaveRecord(arg, gridRef, tableType, audioRef, theOtherGridRef));
    socket.on(CREATE_RECORD, (arg) => onCreateRecord(arg, gridRef, tableType));
    socket.on(DELETE_RECORD, (arg) => onDeleteRecord(arg, gridRef, tableType));

    return () => {
      socket.off(LOCK_RECORD);
      socket.off(UNLOCK_RECORD);
      socket.off(SAVE_RECORD);
      socket.off(CREATE_RECORD);
      socket.off(DELETE_RECORD);
      socket.disconnect();
    };
  }, [socket, gridRef, tableType, audioRef, theOtherGridRef]);
};
export const useGridEvents = (
  gridRef: RefObject<CustomAgGridReactProps<PRecord>>,
  theOtherGridRef: RefObject<CustomAgGridReactProps<PRecord>> | undefined,
  socket: Socket | null,
  user: any,
  tableType: TableType,
  roomId: string
) => {
  const showErrorSnackbar = useGlobalSnackbar();
  const onLineChangingdEditingStoppedRef = useRef(false);
  const isTabPressed = useRef<boolean>(false);

  useEffect(() => {
    if (socket && gridRef.current && user) {
      const saveRecord = async (record: PRecord, originRecord: PRecord, api: GridApi<PRecord>) => {
        if (!api.getRowNode(record.id)) return;
        record.lockingUser = null;
        record.opReadiness = statusTransition(record);

        const { etrCondition, rteCondition } = checkIsInvalidRecord(tableType, record);

        const result = await updateRecord(record, user.clinic, window.ENV.FRONT_BASE_URL);

        if (result.statusCode === 200) {
          emitSaveRecord([record], tableType, socket, user.clinic + roomId);
          if (theOtherGridRef && (etrCondition || rteCondition)) {
            moveRecord(gridRef, theOtherGridRef, record);
          } else {
            gridRef.current?.api.applyTransaction({
              update: [record],
            });
            refreshTreatmentCells(api, record.id);
          }
        } else {
          originRecord[LOCKING_USER] = null;
          await updateRecord(originRecord, user.clinic, window.ENV.FRONT_BASE_URL);
          api.applyTransaction({
            update: [originRecord],
          });
          result.body.error && showErrorSnackbar(result.body.error);
        }
      };
      gridRef.current.saveRecord = saveRecord;
    }
  }, [socket, gridRef.current, user, theOtherGridRef]);

  useEffect(() => {
    const handleLineChangingTransactionApplied = (onLineChangingdEditingStoppedRef: MutableRefObject<boolean>) => {
      onLineChangingdEditingStoppedRef.current = true;
    };

    let handleBeforeUnload = undefined;

    if (gridRef.current && gridRef.current.api) {
      const api = gridRef.current.api;
      handleBeforeUnload = () => {
        api.stopEditing();
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      api.addEventListener<any>(ON_LINE_CHANGING_TRANSACTION_APPLIED, () => handleLineChangingTransactionApplied(onLineChangingdEditingStoppedRef));
    }

    return () => {
      if (gridRef.current && gridRef.current.api) {
        const api = gridRef.current.api;
        if (handleBeforeUnload) {
          window.removeEventListener("beforeunload", handleBeforeUnload);
        }
        api.removeEventListener<any>(ON_LINE_CHANGING_TRANSACTION_APPLIED, () => handleLineChangingTransactionApplied(onLineChangingdEditingStoppedRef));
      }
    };
  }, [gridRef.current, gridRef.current?.api]);

  const onCellEditingStopped = async (event: CellEditingStoppedEvent<PRecord, any>) => {
    if (isTabPressed.current) {
      isTabPressed.current = false;
      return;
    }

    if (onLineChangingdEditingStoppedRef.current) {
      onLineChangingdEditingStoppedRef.current = false;
      return;
    }

    if (event.data && event.colDef.field && gridRef.current) {
      const data: PRecord = JSON.parse(JSON.stringify(event.data));
      const originData: PRecord = JSON.parse(JSON.stringify(event.data));
      originData[event.colDef.field] = event.oldValue;
      gridRef.current.saveRecord?.(data, originData, gridRef.current.api);
    }
  };

  const onCellEditingStarted = async (event: CellEditingStartedEvent<PRecord, any>) => {
    onLineChangingdEditingStoppedRef.current = false;
    isTabPressed.current = false;

    const theOtherEditingCell = getEditingCell(theOtherGridRef);
    if (theOtherGridRef && theOtherEditingCell) {
      theOtherGridRef.current?.api.stopEditing();
    }

    if (user && event.data && !event.data.lockingUser) {
      const result = await lockOrUnlockRecords([event.data.id], user.id, user.clinic, window.ENV.FRONT_BASE_URL);
      if (result.statusCode === 200) {
        emitLockRecord(event.data?.id, tableType, socket, user, user.clinic + roomId);
        event.data.lockingUser = user.id;
        gridRef.current?.api.applyTransaction({
          update: [event.data],
        });
      } else {
        result.body.error && showErrorSnackbar(result.body.error);
      }
    }
  };

  return {
    onCellEditingStopped,
    onCellEditingStarted,
    isTabPressed,
  };
};

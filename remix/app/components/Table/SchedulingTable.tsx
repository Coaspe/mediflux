/** @format */

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridReact } from "ag-grid-react";
import { MutableRefObject, RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ColDef, RowClassParams, RowStyle, CellEditingStoppedEvent, CellEditingStartedEvent, GridApi, TabToNextCellParams } from "ag-grid-community";
import { CustomAgGridReactProps, PRecord, SearchHelp, TableType } from "~/types/type";
import {
  anesthesiaNoteColumn,
  chartNumberColumn,
  createdAtColumn,
  commentCautionColumn,
  consultantColumn,
  coordinatorColumn,
  doctorColumn,
  nursingStaff1Column,
  nursingStaff2Column,
  opReadinessColumn,
  patientNameColumn,
  quantitytreat1Column,
  skincareSpecialist1Column,
  skincareSpecialist2Column,
  treatmentColumn,
  treatmentRoomColumn,
} from "~/utils/Table/columnDef";
import "../../css/Table.css";
import { LOCK_RECORD, UNLOCK_RECORD, SAVE_RECORD, CREATE_RECORD, DELETE_RECORD } from "shared";
import { onLockRecord, onUnlockRecord, onSaveRecord, onDeleteRecord, emitLockRecord, emitSaveRecord, onCreateRecord, emitUnlockRecord } from "~/utils/Table/socket";
import { Socket } from "socket.io-client";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { globalSnackbarState, userState } from "~/recoil_state";
import { TableAction } from "./TableAction";
import { checkIsInvaildRecord, getEditingCell, moveRecord, refreshTreatmentCells, statusTransition } from "~/utils/utils";
import { lockOrUnlockRecords, updateRecord } from "~/utils/request.client";
import { LOCKING_USER, TREATMENT1, TREATMENT1_H, TREATMENT2, TREATMENT2_H, TREATMENT3, TREATMENT3_H, TREATMENT4, TREATMENT4_H, TREATMENT5, TREATMENT5_H, TEST_TAG } from "~/constant";
import dayjs from "dayjs";
import LoadingOverlay from "../Loading";

type SchedulingTableProps = {
  socket: Socket | null;
  gridRef: RefObject<CustomAgGridReactProps<PRecord>>;
  theOtherGridRef?: RefObject<CustomAgGridReactProps<PRecord>>;
  tableType: TableType;
  roomId: string;
  records: PRecord[];
  treatmentSearchHelp: SearchHelp[];
  doctorSearchHelp: SearchHelp[];
};

const SchedulingTable: React.FC<SchedulingTableProps> = ({ socket, gridRef, theOtherGridRef, tableType, roomId, records, treatmentSearchHelp, doctorSearchHelp }) => {
  const user = useRecoilValue(userState);
  const setGlobalSnackBar = useSetRecoilState(globalSnackbarState);
  const [rowData, setRowData] = useState<PRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const onLineChangingdEditingStoppedRef = useRef(false);
  const isTabPressed = useRef<boolean>(false);
  const [colDefs, setColDefs] = useState<ColDef<PRecord, any>[]>([]);

  const showErrorSnackbar = useCallback(
    (message: string) => {
      setGlobalSnackBar({ open: true, msg: message, severity: "error" });
    },
    [setGlobalSnackBar]
  );

  // Add custom tracnsaction event listener
  useEffect(() => {
    const handleLineChangingTransactionApplied = (onLineChangingdEditingStoppedRef: MutableRefObject<boolean>) => {
      onLineChangingdEditingStoppedRef.current = true;
    };

    if (gridRef.current && gridRef.current.api) {
      const api = gridRef.current.api;
      const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        api.stopEditing();
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      api.addEventListener<any>("onLineChangingTransactionApplied", () => handleLineChangingTransactionApplied(onLineChangingdEditingStoppedRef));
    }

    return () => {
      if (gridRef.current && gridRef.current.api) {
        const api = gridRef.current.api;
        api.removeEventListener<any>("onLineChangingTransactionApplied", () => handleLineChangingTransactionApplied(onLineChangingdEditingStoppedRef));
      }
    };
  }, [gridRef.current]);

  // Socket setting
  useEffect(() => {
    if (!socket) return;
    socket.on(LOCK_RECORD, (arg) => onLockRecord(arg, gridRef, tableType));
    socket.on(UNLOCK_RECORD, (arg) => onUnlockRecord(arg, gridRef, tableType));
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
  }, [socket]);

  useEffect(() => {
    setColDefs([
      { field: "id", headerName: "id", hide: true },
      createdAtColumn,
      chartNumberColumn,
      patientNameColumn,
      opReadinessColumn,
      treatmentColumn(TREATMENT1, TREATMENT1_H, tableType, treatmentSearchHelp),
      treatmentColumn(TREATMENT2, TREATMENT2_H, tableType, treatmentSearchHelp),
      treatmentColumn(TREATMENT3, TREATMENT3_H, tableType, treatmentSearchHelp),
      treatmentColumn(TREATMENT4, TREATMENT4_H, tableType, treatmentSearchHelp),
      treatmentColumn(TREATMENT5, TREATMENT5_H, tableType, treatmentSearchHelp),
      quantitytreat1Column,
      treatmentRoomColumn,
      doctorColumn(doctorSearchHelp, setGlobalSnackBar),
      anesthesiaNoteColumn,
      skincareSpecialist1Column,
      skincareSpecialist2Column,
      nursingStaff1Column,
      nursingStaff2Column,
      coordinatorColumn,
      consultantColumn,
      commentCautionColumn,
      { field: LOCKING_USER, headerName: "lock", hide: true },
    ]);
  }, [doctorSearchHelp, treatmentSearchHelp]);

  // Get records and process unlocked records.
  useEffect(() => {
    if (!socket || !user || !records) return;
    const processData = async () => {
      setIsLoading(true);
      const mustBeUnlocked = [];

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        if (record.lockingUser === user?.id) {
          record.lockingUser = null;
          mustBeUnlocked.push(record.id);
          break;
        }
      }

      let result = await lockOrUnlockRecords(mustBeUnlocked, null, TEST_TAG, window.ENV.FRONT_BASE_URL);
      if (result.statusCode === 200) {
        mustBeUnlocked.forEach((id) => emitUnlockRecord(id, tableType, socket, roomId));
        records.sort((a, b) => {
          const dateA = dayjs(a.createdAt ?? 0).valueOf();
          const dateB = dayjs(b.createdAt ?? 0).valueOf();
          return dateB - dateA;
        });

        setRowData(records);
      } else {
        result.body.error && showErrorSnackbar(result.body.error);
      }
      setIsLoading(false);
    };
    processData();
  }, [user, socket, records]);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      editable: true,
    };
  }, []);

  const getRowStyle = (params: RowClassParams<PRecord>): RowStyle | undefined => {
    const transition = "all 0.2s ease, color 0.2s ease";
    if (params.data?.lockingUser && params.data?.lockingUser !== user?.id) {
      return {
        background: "lightgray",
        pointerEvents: "none",
        transition,
      };
    }
    if (params.data?.deleteYN) {
      return {
        display: "none",
      };
    }
    return {
      transition,
    };
  };

  const saveRecord = async (record: PRecord, oldValue: any, newValue: any, field: string, api: GridApi<PRecord>) => {
    record.lockingUser = null;

    const copyRecord: PRecord = JSON.parse(JSON.stringify(record));

    record.opReadiness = statusTransition(record);
    const { etrcondition, rtecondition1, rtecondition2 } = checkIsInvaildRecord(tableType, record);

    const result = await updateRecord(record, TEST_TAG, window.ENV.FRONT_BASE_URL);

    if (result.statusCode === 200) {
      emitSaveRecord([record], tableType, socket, roomId);
      if (theOtherGridRef && (etrcondition || rtecondition1 || rtecondition2)) {
        moveRecord(gridRef, theOtherGridRef, record);
      } else {
        gridRef.current?.api.applyTransaction({
          update: [record],
        });
        refreshTreatmentCells(api, record.id);
      }
    } else if (field) {
      copyRecord[field] = oldValue;
      copyRecord["lockingUser"] = null;
      await updateRecord(copyRecord, TEST_TAG, window.ENV.FRONT_BASE_URL);
      api.applyTransaction({
        update: [copyRecord],
      });
      result.body.error && showErrorSnackbar(result.body.error);
    }
  };

  const onCellEditingStopped = async (event: CellEditingStoppedEvent<PRecord, any>) => {
    if (isTabPressed.current) {
      isTabPressed.current = false;
      return;
    }

    // Prevents edit mode to be stopped when line changed.
    if (onLineChangingdEditingStoppedRef.current) {
      onLineChangingdEditingStoppedRef.current = false;
      return;
    }

    if (event.data && event.colDef.field && gridRef.current) {
      const data: PRecord = JSON.parse(JSON.stringify(event.data));
      saveRecord(data, event.oldValue, event.newValue, event.colDef.field, gridRef.current.api);
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
      const result = await lockOrUnlockRecords([event.data.id], user.id, TEST_TAG, window.ENV.FRONT_BASE_URL);
      if (result.statusCode === 200) {
        emitLockRecord(event.data?.id, tableType, socket, user, roomId);
        event.data.lockingUser = user.id;
        gridRef.current?.api.applyTransaction({
          update: [event.data],
        });
      } else {
        result.body.error && showErrorSnackbar(result.body.error);
      }
    }
  };

  const tabToNextCell = (params: TabToNextCellParams<PRecord, any>) => {
    isTabPressed.current = true;
    return params.nextCellPosition;
  };

  const noRowsOverlayComponent = () => {
    return <span>차트가 존재하지 않습니다</span>;
  };

  const rowStyle = {
    fontSize: "0.75rem" /* 12px */,
    lineheight: "1rem" /* 16px */,
  };

  return (
    <div className="ag-theme-quartz" style={{ height: "50%", display: "flex", flexDirection: "column" }}>
      {tableType === "Ready" && <audio className="hidden" ref={audioRef} src={"/assets/sounds/new_record_ready_noti.mp3"} controls />}
      <TableAction gridRef={gridRef} tableType={tableType} socket={socket} />
      <AgGridReact
        ref={gridRef}
        onCellEditingStopped={onCellEditingStopped}
        onCellEditingStarted={onCellEditingStarted}
        defaultColDef={defaultColDef}
        rowData={rowData}
        columnDefs={colDefs}
        getRowId={(params) => params.data.id}
        pagination={true}
        paginationPageSize={20}
        getRowStyle={getRowStyle}
        rowSelection={"multiple"}
        rowStyle={rowStyle}
        tabToNextCell={tabToNextCell}
        loading={isLoading}
        loadingOverlayComponent={LoadingOverlay}
        noRowsOverlayComponent={noRowsOverlayComponent}
        className="animate-fadeIn"
      />
    </div>
  );
};

export default SchedulingTable;

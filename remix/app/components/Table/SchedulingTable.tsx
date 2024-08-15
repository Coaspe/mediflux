/** @format */

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridReact } from "ag-grid-react";
import { MutableRefObject, RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ColDef, RowClassParams, RowStyle, CellEditingStoppedEvent, CellEditingStartedEvent, GridApi, TabToNextCellParams } from "ag-grid-community";
import { CustomAgGridReactProps, PRecord, TableType } from "~/type";
import {
  anesthesiaNoteColumn,
  chartNumberColumn,
  checkinTimeColumn,
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
import "../css/Table.css";
import { LOCK_RECORD, UNLOCK_RECORD, SAVE_RECORD, CREATE_RECORD, DELETE_RECORD } from "shared";
import { onLockRecord, onUnlockRecord, onSaveRecord, onDeleteRecord, emitLockRecord, emitSaveRecord, onCreateRecord, emitUnlockRecord } from "~/utils/Table/socket";
import { Socket } from "socket.io-client";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { globalSnackbarState, userState } from "~/recoil_state";
import { TableAction } from "./TableAction";
import { checkIsInvaildRecord, convertServerPRecordtToPRecord, getEditingCell, moveRecord } from "~/utils/utils";
import { getSchedulingRecords, lockRecord, unlockRecord, updateRecord } from "~/utils/request.client";
import {
  LOCKING_USER,
  OPREADINESS_C,
  OPREADINESS_Y,
  OP_READINESS,
  TREATMENT1,
  TREATMENT1_H,
  TREATMENT2,
  TREATMENT2_H,
  TREATMENT3,
  TREATMENT3_H,
  TREATMENT4,
  TREATMENT4_H,
  TREATMENT5,
  TREATMENT5_H,
} from "~/constant";
import { Dayjs } from "dayjs";

type SchedulingTableProps = {
  socket: Socket | null;
  gridRef: RefObject<CustomAgGridReactProps<PRecord>>;
  theOtherGridRef?: RefObject<CustomAgGridReactProps<PRecord>>;
  tableType: TableType;
  roomId: string;
  startDate?: Dayjs;
  endDate?: Dayjs;
  data?: PRecord[];
};

const SchedulingTable: React.FC<SchedulingTableProps> = ({ socket, gridRef, theOtherGridRef, tableType, startDate, endDate, roomId, data }) => {
  const user = useRecoilValue(userState);
  const setGlobalSnackBar = useSetRecoilState(globalSnackbarState);
  const [rowData, setRowData] = useState<PRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const onLineChangingdEditingStoppedRef = useRef(false);
  const isTabPressed = useRef<boolean>(false);

  const showErrorSnackbar = useCallback(
    (message: string) => {
      setGlobalSnackBar({ open: true, msg: message, severity: "error" });
    },
    [setGlobalSnackBar]
  );

  // Add custom tracnsaction event listener
  useEffect(() => {
    const handleLineChangingTransactionApplied = (onLineChangingdEditingStoppedRef: MutableRefObject<boolean>) => {
      if (getEditingCell(gridRef)) {
        onLineChangingdEditingStoppedRef.current = true;
      }
    };

    if (gridRef.current && gridRef.current.api) {
      const api = gridRef.current.api;
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
    socket.on(SAVE_RECORD, (arg) => onSaveRecord(arg, gridRef, tableType, theOtherGridRef));
    socket.on(CREATE_RECORD, (arg) => onCreateRecord(arg, gridRef, tableType, audioRef));
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

  // Get records and process unlocked records.
  useEffect(() => {
    if (!socket || !user || data) return;
    const getData = async () => {
      try {
        setIsLoading(true);
        let where = "";
        if (tableType === "Ready") {
          where = " AND op_readiness = 'Y'";
        } else if (tableType === "ExceptReady") {
          where = " AND op_readiness != 'Y'";
        }

        if (startDate) {
          console.log(startDate.toISOString());

          where += ` and check_in_time >= '${startDate.toISOString()}'`;
        }
        if (endDate) {
          where += ` and check_in_time <= '${endDate.toISOString()}'`;
        }

        const { data } = await getSchedulingRecords(where);
        const records: PRecord[] = data.rows.map((record: any) => convertServerPRecordtToPRecord(record));

        const mustBeUnlocked = [];

        for (let i = 0; i < records.length; i++) {
          const record = records[i];
          if (record.lockingUser === user?.id) {
            record.lockingUser = null;
            mustBeUnlocked.push(record);
            break;
          }
        }

        const promised = mustBeUnlocked.map((record) => unlockRecord(record.id));
        await Promise.all(promised);

        mustBeUnlocked.forEach((record) => emitUnlockRecord(record.id, tableType, socket, roomId));
        records.sort((a, b) => (b.checkInTime ?? 0) - (a.checkInTime ?? 0));
        setRowData(records);

        return records;
      } catch (error) {
        console.log(error);

        showErrorSnackbar("Internal server error");
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      getData();
    }
  }, [user, socket]);

  const [colDefs, setColDefs] = useState<ColDef<PRecord, any>[]>([
    { field: "id", headerName: "id", hide: true },
    checkinTimeColumn,
    chartNumberColumn,
    patientNameColumn,
    opReadinessColumn,
    treatmentColumn(TREATMENT1, TREATMENT1_H, tableType),
    treatmentColumn(TREATMENT2, TREATMENT2_H, tableType),
    treatmentColumn(TREATMENT3, TREATMENT3_H, tableType),
    treatmentColumn(TREATMENT4, TREATMENT4_H, tableType),
    treatmentColumn(TREATMENT5, TREATMENT5_H, tableType),
    quantitytreat1Column,
    treatmentRoomColumn,
    doctorColumn(gridRef),
    anesthesiaNoteColumn,
    skincareSpecialist1Column(gridRef),
    skincareSpecialist2Column(gridRef),
    nursingStaff1Column(gridRef),
    nursingStaff2Column(gridRef),
    coordinatorColumn(gridRef),
    consultantColumn(gridRef),
    commentCautionColumn,
    { field: LOCKING_USER, headerName: "lock", hide: true },
  ]);

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

    // Open modal
    if ((field === OP_READINESS && oldValue !== OPREADINESS_Y && newValue === OPREADINESS_Y) || (oldValue !== OPREADINESS_C && newValue === OPREADINESS_C)) {
      return;
    }

    const copyRecord: PRecord = JSON.parse(JSON.stringify(record));

    try {
      const { etrcondition, rtecondition1, rtecondition2 } = checkIsInvaildRecord(tableType, record);
      const updateResult = await updateRecord(record);

      if (updateResult.status === 200) {
        emitSaveRecord([record], tableType, socket, roomId);
        gridRef.current?.api.applyTransaction({
          update: [record],
        });
        if (theOtherGridRef && (etrcondition || rtecondition1 || rtecondition2)) {
          moveRecord(gridRef, theOtherGridRef, record);
        }
      }
    } catch (error) {
      if (field) {
        copyRecord[field] = oldValue;
        copyRecord["lockingUser"] = null;
        await updateRecord(copyRecord);
        api.applyTransaction({
          update: [copyRecord],
        });
      }
      showErrorSnackbar("Internal server error");
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

    try {
      const theOtherEditingCell = getEditingCell(theOtherGridRef);
      if (theOtherGridRef && theOtherEditingCell) {
        theOtherGridRef.current?.api.stopEditing();
      }

      if (user && event.data && !event.data.lockingUser) {
        const result = await lockRecord(event.data.id, user.id);
        if (result.status === 200) {
          emitLockRecord(event.data?.id, tableType, socket, user, roomId);
          event.data.lockingUser = user.id;
          gridRef.current?.api.applyTransaction({
            update: [event.data],
          });
        }
      }
    } catch (error) {
      showErrorSnackbar("Internal server error");
    }
  };

  const tabToNextCell = (params: TabToNextCellParams<PRecord, any>) => {
    isTabPressed.current = true;

    return params.nextCellPosition;
  };

  const noRowsOverlayComponent = () => {
    return <span>차트가 존재하지 않습니다</span>;
  };

  return (
    <div className="ag-theme-quartz" style={{ height: "50%", display: "flex", flexDirection: "column" }}>
      {tableType === "Ready" && <audio className="hidden" ref={audioRef} src={"../../assets/sounds/new_record_ready_noti.mp3"} controls />}
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
        tabToNextCell={tabToNextCell}
        loading={isLoading}
        noRowsOverlayComponent={noRowsOverlayComponent}
      />
    </div>
  );
};

export default SchedulingTable;

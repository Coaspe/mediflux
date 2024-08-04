import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { MutableRefObject, RefObject, useEffect, useMemo, useRef, useState } from "react";
import { ColDef, RowClassParams, RowStyle, CellEditingStoppedEvent, CellEditingStartedEvent } from "ag-grid-community";
import { FocusedRow, PRecord, TableType } from "~/type";
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
import { LOCK_RECORD, UNLOCK_RECORD, SAVE_RECORD, CREATE_RECORD, DELETE_RECORD, SCHEDULING_ROOM_ID } from "shared";
import { onLockRecord, onUnlockRecord, onSaveRecord, onDeleteRecord, emitLockRecord, emitSaveRecord, onCreateRecord, emitUnlockRecord } from "~/utils/Table/socket";
import { Socket } from "socket.io-client";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { globalSnackbarState, userState } from "~/recoil_state";
import { TableAction } from "./TableAction";
import { checkIsInvaildRecord, convertServerPRecordtToPRecord, moveRecord } from "~/utils/utils";
import { getSchedulingRecords, lockRecord, unlockRecord, updateRecord } from "~/utils/request.client";
import { SetTreatmentReadyModal } from "../Modals";
import { TREATMENT1, TREATMENT1_H, TREATMENT2, TREATMENT2_H, TREATMENT3, TREATMENT3_H, TREATMENT4, TREATMENT4_H, TREATMENT5, TREATMENT5_H } from "~/constant";

type SchedulingTableProps = {
  socket: Socket | null;
  gridRef: RefObject<AgGridReact<PRecord>>;
  theOtherGridRef: RefObject<AgGridReact<PRecord>>;
  tableType: TableType;
};
const SchedulingTable: React.FC<SchedulingTableProps> = ({ socket, gridRef, theOtherGridRef, tableType }) => {
  const user = useRecoilValue(userState);
  const setGlobalSnackBar = useSetRecoilState(globalSnackbarState);
  const [rowData, setRowData] = useState<PRecord[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const focusedRowRef = useRef<FocusedRow | null>(null);
  const editingRecordIdRef = useRef("");
  const onLineChangingdEditingStoppedRef = useRef(false);
  const [setTreatmentReadyModalOpen, setSetTreatmentReadyModalOpen] = useState(false);

  // Add custom add tracnsaction event listener
  useEffect(() => {
    const handleLineChangingTransactionApplied = (onLineChangingdEditingStoppedRef: MutableRefObject<boolean>) => {
      onLineChangingdEditingStoppedRef.current = true;
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

  useEffect(() => {
    if (!socket) return;
    socket.on(LOCK_RECORD, (arg) => onLockRecord(arg, gridRef, tableType));
    socket.on(UNLOCK_RECORD, (arg) => onUnlockRecord(arg, gridRef, tableType));
    socket.on(SAVE_RECORD, (arg) => onSaveRecord(arg, gridRef, theOtherGridRef, tableType));
    socket.on(CREATE_RECORD, (arg) => onCreateRecord(arg, gridRef, tableType, focusedRowRef, editingRecordIdRef, audioRef));
    socket.on(DELETE_RECORD, (arg) => onDeleteRecord(arg, gridRef, tableType, focusedRowRef, editingRecordIdRef));

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
    if (!socket || !user) return;
    const getData = async () => {
      try {
        const op = tableType === "Ready" ? "=" : "!=";
        const { data } = await getSchedulingRecords(op);
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

        mustBeUnlocked.forEach((record) => emitUnlockRecord(record.id, tableType, socket, SCHEDULING_ROOM_ID));
        records.sort((a, b) => (b.checkInTime ?? 0) - (a.checkInTime ?? 0));
        setRowData(records);
        return records;
      } catch (error) {
        setGlobalSnackBar({ open: true, msg: "Internal server error", severity: "error" });
      }
    };
    if (user?.id) {
      getData();
    }
  }, [user, socket]);
  const handleCloseSetTreatmentReadyModal = () => {
    setSetTreatmentReadyModalOpen(false);
  };
  const handleOpenSetTreatmentReadyModal = () => {
    setSetTreatmentReadyModalOpen(true);
  };
  const [colDefs, setColDefs] = useState<ColDef<PRecord, any>[]>([
    { field: "id", headerName: "id", hide: true },
    checkinTimeColumn,
    chartNumberColumn,
    patientNameColumn,
    opReadinessColumn(gridRef, handleOpenSetTreatmentReadyModal),
    treatmentColumn(TREATMENT1, TREATMENT1_H, gridRef),
    treatmentColumn(TREATMENT2, TREATMENT2_H, gridRef),
    treatmentColumn(TREATMENT3, TREATMENT3_H, gridRef),
    treatmentColumn(TREATMENT4, TREATMENT4_H, gridRef),
    treatmentColumn(TREATMENT5, TREATMENT5_H, gridRef),
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
    { field: "lockingUser", headerName: "lock", hide: true },
  ]);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      editable: true,
    };
  }, []);

  const getRowStyle = (params: RowClassParams<PRecord>): RowStyle | undefined => {
    if (params.data?.lockingUser && params.data?.lockingUser !== user?.id) {
      return {
        background: "lightgray",
        pointerEvents: "none",
      };
    }
    if (params.data?.deleteYN) {
      return {
        display: "none",
      };
    }
  };

  const onCellEditingStopped = async (event: CellEditingStoppedEvent<PRecord, any>) => {
    if (event.colDef.field == "opReadiness" && event.oldValue != "Y" && event.newValue == "Y") {
      return;
    }
    if (!event.data || onLineChangingdEditingStoppedRef.current) {
      onLineChangingdEditingStoppedRef.current = false;
      return;
    }

    const copyRecord: PRecord = JSON.parse(JSON.stringify(event.data));
    editingRecordIdRef.current = "";
    try {
      event.data.lockingUser = null;
      const { etrcondition, rtecondition1, rtecondition2 } = checkIsInvaildRecord(tableType, event.data);

      if (rtecondition1) {
        event.data.opReadiness = "P";
      }

      const updateResult = await updateRecord(event.data);

      if (updateResult.status === 200) {
        emitSaveRecord(event.data, tableType, socket, SCHEDULING_ROOM_ID, event.column.getColDef().field, event.newValue);
        if (etrcondition || rtecondition1 || rtecondition2) {
          moveRecord(gridRef, theOtherGridRef, event.data);
        }
      }
    } catch (error) {
      if (event.colDef.field) {
        copyRecord[event.colDef.field] = event.oldValue;
        copyRecord["lockingUser"] = null;
        event.api.applyTransaction({
          update: [copyRecord],
        });
      }
      setGlobalSnackBar({ open: true, msg: "Internal server error", severity: "error" });
    } finally {
    }
  };

  const onCellEditingStarted = async (event: CellEditingStartedEvent<PRecord, any>) => {
    try {
      if (user && event.data) {
        const result = await lockRecord(event.data.id, user.id);
        if (result.status === 200) {
          emitLockRecord(event.data?.id, tableType, socket, user, SCHEDULING_ROOM_ID);
          if (gridRef.current) {
            editingRecordIdRef.current = event.data.id;
            focusedRowRef.current = { cellPosition: gridRef.current.api.getFocusedCell(), rowId: event.data?.id } as FocusedRow;
          }
        }
      }
    } catch (error) {
      setGlobalSnackBar({ open: true, msg: "Internal server error", severity: "error" });
    }
  };
  return (
    <div className="ag-theme-quartz" style={{ height: "50%", display: "flex", flexDirection: "column" }}>
      <SetTreatmentReadyModal open={setTreatmentReadyModalOpen} handleClose={handleCloseSetTreatmentReadyModal} gridRef={gridRef} recordIdRef={editingRecordIdRef} />
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
      />
    </div>
  );
};

export default SchedulingTable;

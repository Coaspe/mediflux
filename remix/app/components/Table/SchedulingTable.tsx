/** @format */

import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the Data Grid
import "ag-grid-community/styles/ag-theme-quartz.css";
import { RefObject, useEffect, useMemo, useRef, useState } from "react";
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
  treatment1Column,
  treatmentRoomColumn,
} from "~/utils/Table/columnDef";
import "../css/Table.css";
import { LOCK_RECORD, UNLOCK_RECORD, SAVE_RECORD, CREATE_RECORD, DELETE_RECORD, SCHEDULING_ROOM_ID } from "shared";
import { onLockRecord, onUnlockRecord, onSaveRecord, onDeleteRecord, emitLockRecord, emitSaveRecord, onCreateRecord, emitUnlockRecord } from "~/utils/Table/socket";
import { Socket } from "socket.io-client";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { globalSnackbarState, userState } from "~/recoil_state";
import { TableAction } from "./TableAction";
import axios from "axios";
import { checkIsInvaildRecord, convertServerPRecordtToPRecord, moveRecord } from "~/utils/utils";
import { lockRecord, unlockRecord, updateRecord } from "~/utils/request.client";
import { ChangeStatusModal } from "../Modals";

type SchedulingTableProps = {
  socket: Socket | null;
  gridRef: RefObject<AgGridReact<PRecord>>;
  theOtherGridRef: RefObject<AgGridReact<PRecord>>;
  tableType: TableType;
};
const SchedulingTable: React.FC<SchedulingTableProps> = ({ socket, gridRef, theOtherGridRef, tableType }) => {
  const user = useRecoilValue(userState);
  const focusedRowRef = useRef<FocusedRow | null>(null);
  const [rowData, setRowData] = useState<PRecord[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const setGlobalSnackBar = useSetRecoilState(globalSnackbarState);

  useEffect(() => {
    if (!socket) return;
    socket.on(LOCK_RECORD, (arg) => onLockRecord(arg, gridRef, tableType));
    socket.on(UNLOCK_RECORD, (arg) => onUnlockRecord(arg, gridRef, tableType));
    socket.on(SAVE_RECORD, (arg) => onSaveRecord(arg, gridRef, theOtherGridRef, tableType));
    socket.on(CREATE_RECORD, (arg) => onCreateRecord(arg, gridRef, tableType, focusedRowRef, isEditingRef, audioRef));
    socket.on(DELETE_RECORD, (arg) => onDeleteRecord(arg, gridRef, tableType, focusedRowRef, isEditingRef));

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
        const { data } = await axios.post("http://localhost:5000/api/getRecords", { where: `AND op_readiness ${op} 'Y'` });
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

  const [colDefs, setColDefs] = useState<ColDef<PRecord, any>[]>([
    { field: "id", headerName: "id", hide: true },
    checkinTimeColumn,
    chartNumberColumn,
    patientNameColumn,
    opReadinessColumn(tableType),
    treatment1Column(gridRef),
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
    if (event.data) {
      isEditingRef.current = false;
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
          const row = event.api.getRowNode(event.data.id);
          row?.setDataValue(event.colDef.field, event.oldValue);
          row?.setDataValue("lockingUser", null);
        }
        setGlobalSnackBar({ open: true, msg: "Internal server error", severity: "error" });
      } finally {
      }
    }
  };

  const onCellEditingStarted = async (event: CellEditingStartedEvent<PRecord, any>) => {
    try {
      if (user && event.data) {
        const result = await lockRecord(event.data.id, user.id);
        if (result.status === 200) {
          emitLockRecord(event.data?.id, tableType, socket, user, SCHEDULING_ROOM_ID);
          if (gridRef.current) {
            isEditingRef.current = true;
            focusedRowRef.current = { cellPosition: gridRef.current.api.getFocusedCell(), rowId: event.data?.id } as FocusedRow;
          }
        }
      }
    } catch (error) {
      setGlobalSnackBar({ open: true, msg: "Internal server error", severity: "error" });
    }
  };

  const isEditingRef = useRef(false);
  const [openChangeStatusModal, setOpenChangeStatusModal] = useState(false);
  const handleCloseChangeStatusModal = () => setOpenChangeStatusModal(false);
  const changeStatusRef = useRef<PRecord | null>(null);

  return (
    <div className="ag-theme-quartz" style={{ height: "50%", display: "flex", flexDirection: "column" }}>
      <ChangeStatusModal recordRef={changeStatusRef} open={openChangeStatusModal} handleClose={handleCloseChangeStatusModal} handleComfirm={() => {}} />
      {tableType === "Ready" && <audio className="hidden" ref={audioRef} src={"../../assets/sounds/new_record_ready_noti.mp3"} controls />}
      <TableAction gridRef={gridRef} tableType={tableType} socket={socket} />
      <AgGridReact
        ref={gridRef}
        onCellEditingStopped={onCellEditingStopped}
        onCellEditingStarted={onCellEditingStarted}
        defaultColDef={defaultColDef}
        onCellDoubleClicked={(event) => {
          if (event.colDef.field === "opReadiness") {
            if (event.data) {
              changeStatusRef.current = event.data;
              setOpenChangeStatusModal(true);
            }
          }
        }}
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

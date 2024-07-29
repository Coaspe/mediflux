import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the Data Grid
import "ag-grid-community/styles/ag-theme-quartz.css";
import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import { ColDef, RowClassParams, RowStyle } from "ag-grid-community";
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
import { onLockRecord, onUnlockRecord, onSaveRecord, onDeleteRecord, emitLockRecord, emitUnLockRecord, emitSaveRecord, emitCreateRecords, onCreateRecord } from "~/utils/Table/socket";
import { Socket } from "socket.io-client";
import { useRecoilValue } from "recoil";
import { userState } from "~/recoil_state";
import { TableAction } from "./TableAction";
import axios from "axios";
import { convertServerPRecordtToPRecord, moveRecord } from "~/utils/utils";

type props = {
  socket: Socket | null;
  gridRef: RefObject<AgGridReact<PRecord>>;
  theOtherGridRef: RefObject<AgGridReact<PRecord>>;
  tableType: TableType;
};
const SchedulingTable: React.FC<props> = ({ socket, gridRef, theOtherGridRef, tableType }: props) => {
  const user = useRecoilValue(userState);
  const focusedRowRef = useRef<FocusedRow | null>(null);
  const [rowData, setRowData] = useState<PRecord[]>([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const op = tableType === "Ready" ? "=" : "!=";
        const { data } = await axios.post("http://localhost:5000/api/getRecords", { where: `AND op_readiness ${op} 'Y'` });
        const records = data.rows.map((record: any) => convertServerPRecordtToPRecord(record));
        setRowData(records);
      } catch (error) {
        console.log(error);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on(LOCK_RECORD, (arg) => onLockRecord(arg, gridRef, tableType));
    socket.on(UNLOCK_RECORD, (arg) => onUnlockRecord(arg, gridRef, tableType));
    socket.on(SAVE_RECORD, (arg) => onSaveRecord(arg, gridRef, theOtherGridRef, tableType));
    socket.on(CREATE_RECORD, (arg) => onCreateRecord(arg, gridRef, tableType, focusedRowRef));
    socket.on(DELETE_RECORD, (arg) => onDeleteRecord(arg, gridRef, tableType, focusedRowRef));

    return () => {
      socket.off(LOCK_RECORD);
      socket.off(UNLOCK_RECORD);
      socket.off(SAVE_RECORD);
      socket.off(CREATE_RECORD);
      socket.off(DELETE_RECORD);
      socket.disconnect();
    };
  }, [socket]);

  const [colDefs, setColDefs] = useState<ColDef<PRecord, any>[]>([
    { field: "id", headerName: "id", hide: true },
    checkinTimeColumn,
    chartNumberColumn,
    patientNameColumn,
    opReadinessColumn(tableType),
    treatment1Column,
    quantitytreat1Column,
    treatmentRoomColumn,
    doctorColumn,
    anesthesiaNoteColumn,
    skincareSpecialist1Column,
    skincareSpecialist2Column,
    nursingStaff1Column,
    nursingStaff2Column,
    coordinatorColumn,
    consultantColumn,
    commentCautionColumn,
    { field: "lockingUser", headerName: "lock", hide: true },
  ]);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      editable: true,
    };
  }, []);

  const getRowStyle = (params: RowClassParams<PRecord>): RowStyle | undefined => {
    if (params.data?.lockingUser) {
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

  return (
    // wrapping container with theme & size
    <div
      className="ag-theme-quartz" // applying the Data Grid theme
      style={{ height: "50%", display: "flex", flexDirection: "column" }} // the Data Grid will fill the size of the parent container
    >
      <TableAction gridRef={gridRef} tableType={tableType} socket={socket} />
      <AgGridReact
        ref={gridRef}
        onCellEditingStopped={(event) => {
          emitSaveRecord(tableType, event.data?.id, socket, SCHEDULING_ROOM_ID, event.column.getColDef().field, event.newValue);
          if (tableType === "ExceptReady" && event.data?.opReadiness === "Y") {
            moveRecord(gridRef, theOtherGridRef, event.data);
          } else if (tableType === "Ready" && event.data?.doctor) {
            moveRecord(gridRef, theOtherGridRef, event.data);
          }
        }}
        onCellEditingStarted={(event) => {
          emitLockRecord(event.data?.id, tableType, socket, user, SCHEDULING_ROOM_ID);
          if (gridRef.current) {
            focusedRowRef.current = { cellPosition: gridRef.current.api.getFocusedCell(), rowId: event.data?.id } as FocusedRow;
          }
        }}
        onCellValueChanged={(event) => {}}
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

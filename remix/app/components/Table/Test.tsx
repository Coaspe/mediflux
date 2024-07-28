import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the Data Grid
import "ag-grid-community/styles/ag-theme-quartz.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { CellPosition, ColDef, IRowNode, RowClassParams } from "ag-grid-community";
import { PRecord } from "~/type";
import { MOCK, QUANTITYTREAT1 } from "~/constant";
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
import { onLockRecord, onUnlockRecord, onSaveRecord, onDeleteRecord, emitLockRecord, emitUnLockRecord, emitSaveRecord, emitCreateRecord, onCreateRecord } from "~/utils/Table/socket";
import { Socket } from "socket.io-client";
import { useRecoilValue } from "recoil";
import { userState } from "~/recoil_state";
import { TableAction } from "./TableAction";
type props = {
  socket: Socket | null;
};

const GridExample = ({ socket }: props) => {
  const user = useRecoilValue(userState);
  const [rowData, setRowData] = useState<PRecord[]>(MOCK);
  const focusedCellRef = useRef<CellPosition | null>(null);
  const gridRef = useRef<AgGridReact>(null);

  useEffect(() => {
    if (!socket) return;
    socket.on(LOCK_RECORD, (arg) => onLockRecord(arg, gridRef, "Ready"));
    socket.on(UNLOCK_RECORD, (arg) => onUnlockRecord(arg, gridRef, "Ready"));
    socket.on(SAVE_RECORD, (arg) => onSaveRecord(arg, gridRef, "Ready"));
    socket.on(CREATE_RECORD, (arg) => onCreateRecord(arg, gridRef, "Ready", focusedCellRef));
    // socket.on(DELETE_RECORD, (arg) => onDeleteRecord(arg, deleteReadyPRecord, "Ready"));
    return () => {
      socket.off(LOCK_RECORD);
      socket.off(UNLOCK_RECORD);
      socket.off(SAVE_RECORD);
      socket.off(CREATE_RECORD);
      // socket.off(DELETE_RECORD);
      socket.disconnect();
    };
  }, [socket]);

  const [colDefs, setColDefs] = useState<ColDef<PRecord, any>[]>([
    { field: "id", headerName: "id", hide: true },
    checkinTimeColumn,
    chartNumberColumn,
    patientNameColumn,
    opReadinessColumn,
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

  const getRowStyle = (params: RowClassParams<PRecord>) => {
    if (params.data?.lockingUser) {
      return {
        background: "lightgray",
        pointerEvents: "none",
      };
    }
    if (params.data?.deleteYN) {
      return {
        display: "none"
      }
    }
  };

  const [pinnedTopRowData, setPinnedTopRowData] = useState<PRecord[]>([]);
  return (
    // wrapping container with theme & size
    <div
      className="ag-theme-quartz" // applying the Data Grid theme
      style={{ height: 500 }} // the Data Grid will fill the size of the parent container
    >
      <TableAction gridRef={gridRef} setPinnedTopRowData={setPinnedTopRowData} socket={socket} />
      <AgGridReact
        ref={gridRef}
        onCellEditingStopped={(event) => {
          emitSaveRecord("Ready", event.data?.id, socket, SCHEDULING_ROOM_ID, event.column.getColDef().field, event.newValue);
        }}
        onCellEditingStarted={(event) => {
          emitLockRecord(event.data?.id, "Ready", socket, user, SCHEDULING_ROOM_ID);
          if (gridRef.current) {
            focusedCellRef.current = gridRef.current.api.getFocusedCell();
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
        pinnedTopRowData={pinnedTopRowData}
        rowSelection={"multiple"}
      />
    </div>
  );
};

export default GridExample;

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, RowClassParams, RowStyle, TabToNextCellParams } from "ag-grid-community";
import { useRecoilValue } from "recoil";
import dayjs from "dayjs";

import { CustomAgGridReactProps, MenuPosition, SearchHelp, TableType } from "~/types/type";
import { PRecord } from "shared";
import { userState } from "~/recoil_state";
import { useGlobalSnackbar, useGridEvents, useSocket } from "~/utils/hook";
import { lockOrUnlockRecords } from "~/utils/request.client";
import { emitUnlockRecord } from "~/utils/Table/socket";

import CustomContextMenu from "./CustomContextMenu";
import LoadingOverlay from "../Loading";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "../../css/Table.css";
import { Socket } from "socket.io-client";
import { getColumnDefs } from "~/utils/Table/columnDef";

interface SchedulingTableProps {
  socket: Socket | null;
  gridRef: React.RefObject<CustomAgGridReactProps<PRecord>>;
  theOtherGridRef?: React.RefObject<CustomAgGridReactProps<PRecord>>;
  tableType: TableType;
  roomId: string;
  records: PRecord[];
  treatmentSearchHelp: SearchHelp[];
  doctorSearchHelp: SearchHelp[];
}

const SchedulingTable: React.FC<SchedulingTableProps> = ({ socket, gridRef, theOtherGridRef, tableType, roomId, records, treatmentSearchHelp, doctorSearchHelp }) => {
  const user = useRecoilValue(userState);
  const [rowData, setRowData] = useState<PRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const showErrorSnackbar = useGlobalSnackbar();
  const { onCellEditingStarted, onCellEditingStopped, isTabPressed } = useGridEvents(gridRef, theOtherGridRef, socket, user, tableType, roomId);

  useSocket(socket, gridRef, tableType, audioRef, theOtherGridRef);

  const colDefs = useMemo<ColDef<PRecord, any>[]>(
    () => getColumnDefs(tableType, treatmentSearchHelp, doctorSearchHelp, gridRef, showErrorSnackbar),
    [tableType, treatmentSearchHelp, doctorSearchHelp, showErrorSnackbar]
  );
  const rowStyle = {
    fontSize: "0.75rem" /* 12px */,
    lineheight: "1rem" /* 16px */,
  };

  useEffect(() => {
    if (!socket || !user || !records) return;

    const processData = async () => {
      setIsLoading(true);
      const mustBeUnlocked = records
        .filter((record) => record.lockingUser === user?.id)
        .map((record) => {
          record.lockingUser = null;
          return record.id;
        });

      try {
        const result = await lockOrUnlockRecords(mustBeUnlocked, null, user.clinic, window.ENV.FRONT_BASE_URL);
        if (result.statusCode === 200) {
          mustBeUnlocked.forEach((id) => emitUnlockRecord(id, tableType, socket, user.clinic + roomId));
          const sortedRecords = records.sort((a, b) => dayjs(b.createdAt ?? 0).valueOf() - dayjs(a.createdAt ?? 0).valueOf());
          setRowData(sortedRecords);
        } else {
          result.body.error && showErrorSnackbar(result.body.error);
        }
      } catch (error) {
        console.error("Error processing data:", error);
        showErrorSnackbar("An error occurred while processing the data.");
      } finally {
        setIsLoading(false);
      }
    };

    processData();
  }, [user, socket, records, showErrorSnackbar, tableType, roomId]);

  const defaultColDef = useMemo<ColDef>(() => ({ editable: true }), []);

  const getRowStyle = ({ data }: RowClassParams<PRecord>): RowStyle | undefined => {
    const baseStyle = { transition: "all 0.2s ease, color 0.2s ease" };
    if (data?.lockingUser && data?.lockingUser !== user?.id) {
      return { ...baseStyle, background: "lightgray", pointerEvents: "none" };
    }
    if (data?.deleteYn) {
      return { display: "none" };
    }
    return baseStyle;
  };

  const tabToNextCell = (params: TabToNextCellParams<PRecord, any>) => {
    isTabPressed.current = true;
    return params.nextCellPosition;
  };

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({ x: 0, y: 0 });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPosition({ x: e.pageX, y: e.pageY });
    setMenuVisible(true);
  };

  useEffect(() => {
    const handleClickOutside = () => setMenuVisible(false);
    if (menuVisible) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuVisible]);

  const noRowsOverlayComponent = () => {
    return <span>차트가 존재하지 않습니다</span>;
  };

  const MemoizedAgGrid = useMemo(() => {
    return (
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
    );
  }, [rowData, colDefs, isLoading]);

  return (
    <div onContextMenu={handleContextMenu} className="ag-theme-quartz h-1/2 flex flex-col">
      {tableType === "Ready" && <audio className="hidden" ref={audioRef} src="/assets/sounds/new_record_ready_noti.mp3" controls />}
      {MemoizedAgGrid}
      <CustomContextMenu position={menuPosition} onClose={() => setMenuVisible(false)} isOpen={menuVisible} gridRef={gridRef} tableType={tableType} socket={socket} />
    </div>
  );
};

export default SchedulingTable;

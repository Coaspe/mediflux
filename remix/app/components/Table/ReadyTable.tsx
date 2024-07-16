/** @format */

import { MaterialReactTable, MRT_ColumnDef, MRT_Row, MRT_TableInstance, useMaterialReactTable } from "material-react-table";
import { MRT_Localization_KO } from "material-react-table/locales/ko";
import { CREATE_RECORD, DELETE_RECORD, LOCK_RECORD, SAVE_RECORD, SCHEDULING_ROOM_ID, UNLOCK_RECORD } from "shared";
import { ROLE } from "~/constant";
import { PRecord } from "~/type";
import { emitLockRecord, onCreateRecord, onDeleteRecord, onLockRecord, onSaveRecord, onUnlockRecord } from "~/utils/Table/socket";
import SchedulingTableTopToolbar from "./SchedulingTableTopToolbar";
import React, { Dispatch, MutableRefObject, SetStateAction, useEffect, useMemo, useState } from "react";
import {
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
} from "~/utils/Table/columnDef";
import { useCreatePRecord, useGetPRecords, useUpdatePRecord, useDeletePRecord } from "~/utils/Table/crud";
import { useRecoilValue } from "recoil";
import { userState } from "~/recoil_state";
import { handleCreatePRecord, handleEditingCancel, handleSavePRecord } from "~/utils/utils";
import { Socket } from "socket.io-client";
import SchedulingTableRow from "~/components/Table/SchedulingTableRowAction";

type props = {
  originalPRecord: MutableRefObject<PRecord | undefined>;
  setOpenChangeStatusModal: Dispatch<SetStateAction<boolean>>;
  handleOpenAssignModal: (row: MRT_Row<PRecord>) => void;
  handleOpenDeleteModal: (row: MRT_Row<PRecord>) => void;
  playAudio: () => void;
  socket: Socket | null;
};

const ReadyTable: React.FC<props> = ({ originalPRecord, setOpenChangeStatusModal, handleOpenAssignModal, handleOpenDeleteModal, playAudio, socket }) => {
  const { mutate: createReadyPRecord, mutateAsync: createReadyPRecordWithDB, isPending: isCreatingReadyPRecord } = useCreatePRecord("Ready_PRecord");
  const { data: fetchedReadyPRecords, isError: isLoadingReadyPRecordsError, isFetching: isFetchingReadyPRecords, isLoading: isLoadingReadyPRecords } = useGetPRecords("Ready_PRecord");
  const { mutate: updateReadyPRecord, mutateAsync: updateReadyPRecordWithDB, isPending: isUpdatingReadyPRecord, error: updateError } = useUpdatePRecord("Ready_PRecord");
  const { mutate: deleteReadyPRecord, mutateAsync: _, isPending: isDeletingReadyPRecord } = useDeletePRecord("Ready_PRecord");
  const { mutate: createExceptReadyPRecord } = useCreatePRecord("ExceptReady_PRecord");

  const user = useRecoilValue(userState);

  console.log("Ready Rerender");

  useEffect(() => {
    if (!socket) return;
    socket.on(LOCK_RECORD, (arg) => onLockRecord(arg, readyTable, updateReadyPRecord, "Ready"));
    socket.on(UNLOCK_RECORD, (arg) => onUnlockRecord(arg, readyTable, updateReadyPRecord, "Ready"));
    socket.on(SAVE_RECORD, (arg) => onSaveRecord(arg, readyTable, updateReadyPRecord, "Ready"));
    socket.on(CREATE_RECORD, (arg) => onCreateRecord(arg, createReadyPRecord, "Ready", playAudio));
    socket.on(DELETE_RECORD, (arg) => onDeleteRecord(arg, deleteReadyPRecord, "Ready"));

    return () => {
      socket.off(LOCK_RECORD);
      socket.off(UNLOCK_RECORD);
      socket.off(SAVE_RECORD);
      socket.off(CREATE_RECORD);
      socket.off(DELETE_RECORD);
      socket.disconnect();
    };
  }, [socket]);

  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  const readyColumns = useMemo<MRT_ColumnDef<PRecord>[]>(
    () => [
      checkinTimeColumn(originalPRecord),
      chartNumberColumn,
      patientNameColumn,
      opReadinessColumn(setOpenChangeStatusModal, originalPRecord),
      treatment1Column(originalPRecord),
      quantitytreat1Column,
      treatmentRoomColumn,
      doctorColumn(originalPRecord),
      anesthesiaNoteColumn,
      skincareSpecialist1Column(originalPRecord),
      skincareSpecialist2Column(originalPRecord),
      nursingStaff1Column(originalPRecord),
      nursingStaff2Column(originalPRecord),
      coordinatorColumn(originalPRecord),
      consultantColumn(originalPRecord),
      commentCautionColumn,
    ],
    [validationErrors]
  );

  const readyTable: MRT_TableInstance<PRecord> = useMaterialReactTable({
    columns: readyColumns,
    data: fetchedReadyPRecords ? fetchedReadyPRecords : [],
    localization: MRT_Localization_KO,
    initialState: {
      columnPinning: { left: ["mrt-row-actions"] },
      density: "compact",
      pagination: {
        pageSize: 30,
        pageIndex: 0,
      },
    },
    createDisplayMode: "modal", // ('modal', and 'custom' are also available)
    editDisplayMode: "modal", // ('modal', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    enableColumnResizing: true,
    enableRowActions: true,
    muiTableHeadCellProps: {
      sx: {
        "& .Mui-TableHeadCell-Content": {
          justifyContent: "center",
        },
      },
    },
    muiTableContainerProps: ({ table }) => {
      const { isFullScreen } = table.getState();
      return {
        sx: {
          height: isFullScreen ? "100%" : "500px",
        },
      };
    },
    muiTableProps: ({}) => ({
      sx: {
        width: "0px",
      },
    }),
    muiToolbarAlertBannerProps: isLoadingReadyPRecordsError
      ? {
          color: "error",
          children: "Error loading data",
        }
      : undefined,
    muiTableBodyRowProps: ({ row, table }) => {
      const { density } = table.getState();
      return {
        sx: {
          backgroundColor: row.original.LockingUser && row.original.LockingUser?.id != user.id ? "gray" : "white",
          pointerEvents: row.original.LockingUser && row.original.LockingUser?.id != user.id ? "none" : "default",
          height: `${density === "compact" ? 45 : density === "comfortable" ? 50 : 57}px`,
          cursor: user.role === ROLE.DOCTOR ? "pointer" : "default",
        },
        onDoubleClick: () => handleOpenAssignModal(row),
      };
    },
    muiTableBodyCellProps: ({ row }) => ({
      onDoubleClick: async () => {
        if (row.original.LockingUser) {
          return;
        }
      },
    }),
    onCreatingRowCancel: () => {
      originalPRecord.current = undefined;
      setValidationErrors({});
    },
    onCreatingRowSave: ({ table, values }) => handleCreatePRecord(table, createReadyPRecordWithDB, socket, "Ready", values, originalPRecord),
    onEditingRowCancel: ({ row }) => handleEditingCancel(row, "Ready", socket, originalPRecord),
    onEditingRowSave: ({ row, table, values }) => handleSavePRecord(row, table, "Ready", values, originalPRecord, updateReadyPRecordWithDB, createExceptReadyPRecord, socket, user),
    renderRowActions: ({ row, table }) => (
      <SchedulingTableRow
        originalPRecord={originalPRecord}
        row={row}
        table={table}
        user={user}
        emitLockRecord={emitLockRecord}
        socket={socket}
        openDeleteConfirmModal={() => handleOpenDeleteModal(row)}
        tableType="Ready"
        roomId={SCHEDULING_ROOM_ID}
      />
    ),
    renderTopToolbarCustomActions: ({ table }) => <SchedulingTableTopToolbar originalPRecord={originalPRecord} table={table} tableType="Ready" />,
    getRowId: (originalRow) => originalRow.id,
    state: {
      isLoading: isLoadingReadyPRecords,
      isSaving: isCreatingReadyPRecord || isUpdatingReadyPRecord || isDeletingReadyPRecord,
      showAlertBanner: isLoadingReadyPRecordsError,
      showProgressBars: isFetchingReadyPRecords,
    },
  });

  useEffect(() => {
    console.log("Reaeraeraeraera");
  }, [readyTable]);
  return <MaterialReactTable table={readyTable} />;
};

export default ReadyTable;

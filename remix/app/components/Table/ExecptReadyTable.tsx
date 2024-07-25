/** @format */

import { MaterialReactTable, MRT_ColumnDef, MRT_Row, MRT_TableInstance, useMaterialReactTable } from "material-react-table";
import { MRT_Localization_KO } from "material-react-table/locales/ko";
import { CREATE_RECORD, DELETE_RECORD, LOCK_RECORD, ROLE, SAVE_RECORD, SCHEDULING_ROOM_ID, UNLOCK_RECORD } from "shared";
import { DEFAULT_RECORD_COLOR, EDITING_RECORD_COLOR, TABLE_CONTAINER_HEIGHT, TABLE_HEIGHT, TABLE_PAPER_HEIGHT } from "~/constant";
import { PRecord } from "~/type";
import { emitLockRecord, onCreateRecord, onDeleteRecord, onLockRecord, onSaveRecord, onUnlockRecord } from "~/utils/Table/socket";
import SchedulingTableTopToolbar from "./SchedulingTableTopToolbar";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { ChangeStatusDialog, DeleteRecordDialog } from "./Dialogs";

type props = {
  socket: Socket | null;
};

const ExceptReadyTable: React.FC<props> = ({ socket }) => {
  const { mutate: createReadyPRecord } = useCreatePRecord("Ready_PRecord");

  const { mutate: createExceptReadyPRecord, mutateAsync: createExceptReadyPRecordWithDB, isPending: isCreatingExceptReadyPRecord } = useCreatePRecord("ExceptReady_PRecord");
  const {
    data: fetchedExceptReadyPRecords,
    isError: isLoadingExceptReadyPRecordsError,
    isFetching: isFetchingExceptReadyPRecords,
    isLoading: isLoadingExceptReadyPRecords,
  } = useGetPRecords("ExceptReady_PRecord");
  const { mutate: updateExceptReadyPRecord, mutateAsync: updateExceptReadyPRecordWithDB, isPending: isUpdatingExceptReadyPRecord, error: updateError } = useUpdatePRecord("ExceptReady_PRecord");
  const { mutate: deleteExceptReadyPRecord, isPending: isDeletingExceptReadyPRecord } = useDeletePRecord("ExceptReady_PRecord");

  const user = useRecoilValue(userState);

  const actionPRecord = useRef<PRecord>();
  const originalPRecord = useRef<PRecord>();

  const [openChangeStatusModal, setOpenChangeStatusModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    if (!socket) return;
    socket.on(LOCK_RECORD, (arg) => onLockRecord(arg, ExceptReadyTable, updateExceptReadyPRecord, "ExceptReady"));
    socket.on(UNLOCK_RECORD, (arg) => onUnlockRecord(arg, ExceptReadyTable, updateExceptReadyPRecord, "ExceptReady"));
    socket.on(SAVE_RECORD, (arg) => onSaveRecord(arg, ExceptReadyTable, updateExceptReadyPRecord, "ExceptReady"));
    socket.on(CREATE_RECORD, (arg) => onCreateRecord(arg, createExceptReadyPRecord, "ExceptReady"));
    socket.on(DELETE_RECORD, (arg) => onDeleteRecord(arg, deleteExceptReadyPRecord, "ExceptReady"));

    return () => {
      socket.off(LOCK_RECORD);
      socket.off(UNLOCK_RECORD);
      socket.off(SAVE_RECORD);
      socket.off(CREATE_RECORD);
      socket.off(DELETE_RECORD);
      socket.disconnect();
    };
  }, [socket]);

  const ExceptReadyColumns = useMemo<MRT_ColumnDef<PRecord>[]>(
    () => [
      checkinTimeColumn(originalPRecord),
      chartNumberColumn,
      patientNameColumn,
      opReadinessColumn(originalPRecord, "ExceptReady", setOpenChangeStatusModal),
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

  const ExceptReadyTable: MRT_TableInstance<PRecord> = useMaterialReactTable({
    columns: ExceptReadyColumns,
    memoMode: "rows",
    data: fetchedExceptReadyPRecords ? fetchedExceptReadyPRecords : [],
    localization: MRT_Localization_KO,
    initialState: {
      columnPinning: { left: ["mrt-row-actions"] },
      density: "compact",
      pagination: {
        pageSize: 10,
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
    muiTableContainerProps: {
      sx: {
        height: TABLE_CONTAINER_HEIGHT,
      },
    },
    muiTableProps: ({}) => ({
      sx: {
        width: "full",
        height: TABLE_HEIGHT,
      },
    }),
    muiTablePaperProps: ({}) => ({
      sx: {
        height: TABLE_PAPER_HEIGHT,
        maxHeight: "800px",
      },
    }),
    muiToolbarAlertBannerProps: isLoadingExceptReadyPRecordsError
      ? {
          color: "error",
          children: "Error loading data",
        }
      : undefined,
    muiTableBodyRowProps: ({ row, table }) => {
      const { density } = table.getState();
      console.log(row.original.id);
      return {
        sx: {
          backgroundColor: row.original.LockingUser && user && row.original.LockingUser?.id != user.id ? EDITING_RECORD_COLOR : DEFAULT_RECORD_COLOR,
          pointerEvents: row.original.LockingUser && user && row.original.LockingUser?.id != user.id ? "none" : "default",
          height: `${density === "compact" ? 45 : density === "comfortable" ? 50 : 57}px`,
          cursor: user && user.role === ROLE.DOCTOR ? "pointer" : "default",
        },
        onDoubleClick: () => {
          originalPRecord.current = JSON.parse(JSON.stringify(row.original));
          table.setEditingRow(row);
        },
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
    onCreatingRowSave: ({ table, values }) => handleCreatePRecord(table, createExceptReadyPRecordWithDB, socket, "ExceptReady", values, originalPRecord),
    onEditingRowCancel: ({ row }) => handleEditingCancel(row, "ExceptReady", socket, originalPRecord),
    onEditingRowSave: ({ row, table, values }) => handleSavePRecord(row, table, "ExceptReady", values, originalPRecord, updateExceptReadyPRecordWithDB, createReadyPRecord, socket, user),
    renderRowActions: ({ row, table }) =>
      user && (
        <SchedulingTableRow
          originalPRecord={originalPRecord}
          row={row}
          table={table}
          emitLockRecord={emitLockRecord}
          socket={socket}
          openDeleteConfirmModal={() => handleOpenDeleteModal(row)}
          tableType="ExceptReady"
          roomId={SCHEDULING_ROOM_ID}
        />
      ),
    renderTopToolbarCustomActions: ({ table }) => <SchedulingTableTopToolbar originalPRecord={originalPRecord} table={table} tableType="ExceptReady" />,
    getRowId: (originalRow) => originalRow.id,
    state: {
      isLoading: isLoadingExceptReadyPRecords,
      isSaving: isCreatingExceptReadyPRecord || isUpdatingExceptReadyPRecord || isDeletingExceptReadyPRecord,
      showAlertBanner: isLoadingExceptReadyPRecordsError,
      showProgressBars: isFetchingExceptReadyPRecords,
    },
  });

  const handleOpenDeleteModal = (row: MRT_Row<PRecord>) => {
    setOpenDeleteModal(true);
    actionPRecord.current = JSON.parse(JSON.stringify(row.original));
    if (actionPRecord.current && user) {
      emitLockRecord(actionPRecord.current.id, "Ready", socket, user, SCHEDULING_ROOM_ID);
    }
  };

  return (
    <>
      <ChangeStatusDialog
        modalOpen={openChangeStatusModal}
        setModalOpen={setOpenChangeStatusModal}
        deleteFn={deleteExceptReadyPRecord}
        updateDbFn={updateExceptReadyPRecordWithDB}
        actionPRecord={originalPRecord}
        socket={socket}
      />
      <DeleteRecordDialog modalOpen={openDeleteModal} setModalOpen={setOpenDeleteModal} deleteFn={deleteExceptReadyPRecord} actionPRecord={actionPRecord} socket={socket} />
      <MaterialReactTable table={ExceptReadyTable} />;
    </>
  );
};

export default ExceptReadyTable;

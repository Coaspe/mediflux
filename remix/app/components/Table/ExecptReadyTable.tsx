import { MaterialReactTable, MRT_ColumnDef, MRT_Row, MRT_TableInstance, useMaterialReactTable } from "material-react-table";
import { MRT_Localization_KO } from "material-react-table/locales/ko";
import { SCHEDULING_ROOM_ID } from "shared";
import { ROLE } from "~/constant";
import { PRecord } from "~/type";
import { emitLockRecord } from "~/utils/Table/socket";
import SchedulingTableTopToolbar from "./SchedulingTableTopToolbar";
import React, { Dispatch, MutableRefObject, SetStateAction, useMemo, useState } from "react";
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
import { useRecoilValue, useSetRecoilState } from "recoil";
import { exceptReadyTableState, readyTableState, userState } from "~/recoil_state";
import { handleCreatePRecord, handleEditingCancel, handleSavePRecord } from "~/utils/utils";
import { Socket } from "socket.io-client";
import SchedulingTableRow from "~/components/Table/SchedulingTableRowAction";

type props = {
  originalPRecord: MutableRefObject<PRecord | undefined>;
  setOpenChangeStatusModal: Dispatch<SetStateAction<boolean>>;
  handleOpenAssignModal: (row: MRT_Row<PRecord>) => void;
  handleOpenDeleteModal: (row: MRT_Row<PRecord>) => void;
  socket: Socket | null;
};

const ExceptReadyTable: React.FC<props> = ({ originalPRecord, setOpenChangeStatusModal, handleOpenAssignModal, handleOpenDeleteModal, socket }) => {
  const { mutate: createReadyPRecord, mutateAsync: createReadyPRecordWithDB, isPending: isCreatingReadyPRecord } = useCreatePRecord("Ready_PRecord");

  const { mutate: createExceptReadyPRecord, mutateAsync: createExceptReadyPRecordWithDB, isPending: isCreatingExceptReadyPRecord } = useCreatePRecord("ExceptReady_PRecord");
  const {
    data: fetchedExceptReadyPRecords,
    isError: isLoadingExceptReadyPRecordsError,
    isFetching: isFetchingExceptReadyPRecords,
    isLoading: isLoadingExceptReadyPRecords,
  } = useGetPRecords("ExceptReady_PRecord");
  const { mutate: _, mutateAsync: updateExceptReadyPRecordWithDB, isPending: isUpdatingExceptReadyPRecord, error: updateError } = useUpdatePRecord("ExceptReady_PRecord");
  const { mutate: __, mutateAsync: ___, isPending: isDeletingExceptReadyPRecord } = useDeletePRecord("ExceptReady_PRecord");
  const user = useRecoilValue(userState);

  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});
  const setTable = useSetRecoilState(exceptReadyTableState);

  const ExceptReadyColumns = useMemo<MRT_ColumnDef<PRecord>[]>(
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

  const ExceptReadyTable: MRT_TableInstance<PRecord> = useMaterialReactTable({
    columns: ExceptReadyColumns,
    data: fetchedExceptReadyPRecords ? fetchedExceptReadyPRecords : [],
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
    muiToolbarAlertBannerProps: isLoadingExceptReadyPRecordsError
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
    onCreatingRowSave: ({ table, values }) => handleCreatePRecord(table, createExceptReadyPRecordWithDB, socket, "ExceptReady", values, originalPRecord),
    onEditingRowCancel: ({ row }) => handleEditingCancel(row, "ExceptReady", socket, originalPRecord),
    onEditingRowSave: ({ row, table, values }) => handleSavePRecord(row, table, "ExceptReady", values, originalPRecord, updateExceptReadyPRecordWithDB, createReadyPRecord, socket, user),
    renderRowActions: ({ row, table }) => (
      <SchedulingTableRow
        originalPRecord={originalPRecord}
        row={row}
        table={table}
        user={user}
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

  setTable(ExceptReadyTable);
  return <MaterialReactTable table={ExceptReadyTable} />;
};

export default ExceptReadyTable;

import { useEffect, useMemo, useRef, useState } from "react";
import { MaterialReactTable, useMaterialReactTable, type MRT_Row, type MRT_ColumnDef, MRT_TableInstance, LiteralUnion } from "material-react-table";
import { MRT_Localization_KO } from "material-react-table/locales/ko";
import { Socket, io } from "socket.io-client";
import { ROLE } from "../../constant";
import { LOCK_RECORD, CONNECT, CONNECTED_USERS, CREATE_RECORD, DELETE_RECORD, JOIN_ROOM, SAVE_RECORD, USER_JOINED, UNLOCK_RECORD, PORT, SCHEDULING_ROOM_ID } from "shared";
import { OpReadiness, PRecord, TableType, User } from "~/type";
import SchedulingTableRow from "~/components/Table/SchedulingTableRowAction";
import SchedulingTableTopToolbar from "./SchedulingTableTopToolbar";
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
import { isInvalidOpReadiessWithTable, getTableType } from "~/utils/utils";
import { emitUnLockRecord, emitCreateRecord, emitDeleteRecord, emitSaveRecord, emitLockRecord } from "~/utils/Table/socket";
import { UseMutateFunction, UseMutateAsyncFunction } from "@tanstack/react-query";
import { useCreatePRecord, useGetPRecords, useUpdatePRecord, useDeletePRecord } from "~/utils/Table/crud";
import { ChangeStatusDialog, AssignmentDialog, DeleteRecordDialog } from "./Dialogs";
import { useRecoilState } from "recoil";
import { userState } from "~/recoil_state";

const SchedulingTable = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [clients, setClients] = useState<String[]>([]);
  const [user, setUser] = useRecoilState(userState);

  // Assign and Delete Dialogs
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openChangeStatusModal, setOpenChangeStatusModal] = useState(false);

  const actionPRecord = useRef<PRecord>();
  const originalPRecord = useRef<PRecord>();
  const audioRef = useRef<HTMLAudioElement>(null);

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const handleConnectedUsers = (users: String[]) => {
    setClients(users);
  };

  // Socket configuration
  useEffect(() => {
    const socketInstance = io(`http://localhost:${PORT}`);
    setSocket(socketInstance);

    // Default
    socketInstance.on(CONNECT, () => {
      socketInstance.emit(JOIN_ROOM, {
        userId: user.id,
        username: user.name,
        roomId: SCHEDULING_ROOM_ID,
      });
    });

    // Other user joined
    socketInstance.on(USER_JOINED, (username) => {
      if (typeof socket === "undefined") return;
      setClients((prev) => [...prev, username]);
      socketInstance.emit(CONNECTED_USERS, clients); //Emit User Array
    });

    // Set connected users
    socketInstance.on(CONNECTED_USERS, handleConnectedUsers);
    socketInstance.on(LOCK_RECORD, onLockRecord);
    socketInstance.on(UNLOCK_RECORD, onUnlockRecord);
    socketInstance.on(SAVE_RECORD, onSaveRecord);
    socketInstance.on(CREATE_RECORD, onCreateRecord);
    socketInstance.on(DELETE_RECORD, onDeleteRecord);

    return () => {
      socketInstance.off(CONNECTED_USERS);
      socketInstance.off(LOCK_RECORD);
      socketInstance.off(UNLOCK_RECORD);
      socketInstance.off(SAVE_RECORD);
      socketInstance.off(CREATE_RECORD);
      socketInstance.off(DELETE_RECORD);
      socketInstance.disconnect();
    };
  }, []);

  const { mutate: createReadyPRecord, mutateAsync: createReadyPRecordWithDB, isPending: isCreatingReadyPRecord } = useCreatePRecord("Ready_PRecord");
  const { data: fetchedReadyPRecords, isError: isLoadingReadyPRecordsError, isFetching: isFetchingReadyPRecords, isLoading: isLoadingReadyPRecords } = useGetPRecords("Ready_PRecord");
  const { mutate: updateReadyPRecord, mutateAsync: updateReadyPRecordWithDB, isPending: isUpdatingReadyPRecord, error: updateError } = useUpdatePRecord("Ready_PRecord");
  const { mutate: deleteReadyPRecord, mutateAsync: deleteReadyPRecordWithDB, isPending: isDeletingReadyPRecord } = useDeletePRecord("Ready_PRecord");

  const { mutate: createExceptReadyPRecord, mutateAsync: createExceptReadyPRecordWithDB, isPending: isCreatingExceptReadyPRecord } = useCreatePRecord("ExceptReady_PRecord");
  const {
    data: fetchedExceptReadyPRecords,
    isError: isLoadingExceptReadyPRecordsError,
    isFetching: isFetchingExceptReadyPRecords,
    isLoading: isLoadingExceptReadyPRecords,
  } = useGetPRecords("ExceptReady_PRecord");
  const {
    mutate: updateExceptReadyPRecord,
    mutateAsync: updateExceptReadyPRecordWithDB,
    isPending: isUpdatingExceptReadyPRecord,
    error: updateExceptReadyError,
  } = useUpdatePRecord("ExceptReady_PRecord");
  const { mutate: deleteExceptReadyPRecord, mutateAsync: deleteExceptReadyPRecordWithDB, isPending: isDeletingExceptReadyPRecord } = useDeletePRecord("ExceptReady_PRecord");

  const dummyUpdateArchivePRecord: UseMutateFunction<void, Error, PRecord, void> = () => {
    console.warn("Archive update function is not implemented yet.");
    return Promise.resolve(); // 또는 필요한 기본 반환값
  };
  const dummyUpdateArchivePRecordString: UseMutateFunction<void, Error, string, void> = () => {
    console.warn("Archive update function is not implemented yet.");
    return Promise.resolve(); // 또는 필요한 기본 반환값
  };
  const dummyUpdateArchivePRecordStringWithDB: UseMutateAsyncFunction<void, Error, string, void> = () => {
    console.warn("Archive update function is not implemented yet.");
    return Promise.resolve(); // 또는 필요한 기본 반환값
  };
  const dummyUpdateArchivePRecordWithDB: UseMutateAsyncFunction<void, Error, PRecord, void> = () => {
    console.warn("Archive update function is not implemented yet.");
    return Promise.resolve(); // 또는 필요한 기본 반환값
  };

  const updateFnMapping: Record<TableType, UseMutateFunction<void, Error, PRecord, void>> = {
    Ready: updateReadyPRecord,
    ExceptReady: updateExceptReadyPRecord,
    Archive: dummyUpdateArchivePRecord,
  };
  const createFnMapping: Record<TableType, UseMutateFunction<void, Error, PRecord, void>> = {
    Ready: createReadyPRecord,
    ExceptReady: createExceptReadyPRecord,
    Archive: dummyUpdateArchivePRecord,
  };
  const deleteFnMapping: Record<TableType, UseMutateFunction<void, Error, string, void>> = {
    Ready: deleteReadyPRecord,
    ExceptReady: deleteExceptReadyPRecord,
    Archive: dummyUpdateArchivePRecordString,
  };
  const dbUpdateFnMapping: Record<TableType, UseMutateAsyncFunction<void, Error, PRecord, void>> = {
    Ready: updateReadyPRecordWithDB,
    ExceptReady: updateExceptReadyPRecordWithDB,
    Archive: dummyUpdateArchivePRecordWithDB,
  };
  const dbCreateFnMapping: Record<TableType, UseMutateAsyncFunction<void, Error, PRecord, void>> = {
    Ready: createReadyPRecordWithDB,
    ExceptReady: createExceptReadyPRecordWithDB,
    Archive: dummyUpdateArchivePRecordWithDB,
  };
  const dbDeleteFnMapping: Record<TableType, UseMutateAsyncFunction<void, Error, string, void>> = {
    Ready: deleteReadyPRecordWithDB,
    ExceptReady: deleteExceptReadyPRecordWithDB,
    Archive: dummyUpdateArchivePRecordStringWithDB,
  };
  // Start ---------------------------------------------- On socket event
  const setTableAndGetRow = (tableType: TableType, recordId: string) => {
    let table = readyTable;
    if (tableType == "ExceptReady") {
      table = exceptReadyTable;
    }

    try {
      let row = JSON.parse(JSON.stringify(table.getRow(recordId).original));
      return row;
    } catch (error) {
      return undefined;
    }
  };

  const onLockRecord = ({ recordId, locker, tableType }: { recordId: string; locker: User; tableType: TableType }) => {
    const row = setTableAndGetRow(tableType, recordId);
    if (row) {
      row.LockingUser = locker;
      updateFnMapping[tableType](row);
    }
  };
  const onUnlockRecord = ({ recordId, tableType }: { recordId: string; tableType: TableType }) => {
    const row = setTableAndGetRow(tableType, recordId);
    if (row) {
      row.LockingUser = null;
      updateFnMapping[tableType](row);
    }
  };

  const onSaveRecord = ({ recordId, record, tableType }: { recordId: string; record: string; tableType: TableType }) => {
    const precord: PRecord = JSON.parse(record);

    precord.LockingUser = null;
    let row = setTableAndGetRow(tableType, recordId);
    if (row) {
      row = precord;
      updateFnMapping[tableType](row);
    }
  };
  const onCreateRecord = ({ record, tableType }: { record: string; tableType: TableType }) => {
    const precord: PRecord = JSON.parse(record);
    precord.LockingUser = null;
    createFnMapping[tableType](precord);
    if (precord.opReadiness === "Y") {
      playAudio();
    }
  };

  const onDeleteRecord = ({ recordId, tableType }: { recordId: string; tableType: TableType }) => {
    deleteFnMapping[tableType](recordId);
  };
  // End ---------------------------------------------- On socket event

  const handleEditingCancel = (row: MRT_Row<PRecord>, tableType: TableType) => {
    setValidationErrors({});
    emitUnLockRecord(row.id, tableType, socket, SCHEDULING_ROOM_ID);
    originalPRecord.current = undefined;
  };

  function areObjectsEqual(obj1: PRecord, obj2: PRecord): boolean {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (let key of keys1) {
      if (!obj2.hasOwnProperty(key)) {
        return false;
      }

      if (typeof obj1[key] === "object" && typeof obj2[key] === "object") {
        if (!areObjectsEqual(obj1[key], obj2[key])) {
          return false;
        }
      } else {
        if (obj1[key] !== obj2[key]) {
          return false;
        }
      }
    }

    return true;
  }

  const handleSavePRecord = async (row: MRT_Row<PRecord>, table: MRT_TableInstance<PRecord>, tableType: TableType, values: Record<LiteralUnion<string, string>, any>) => {
    let precord = values as PRecord;

    if (precord.id === undefined) {
      precord.id = row.original.id;
    }

    if (originalPRecord.current) {
      for (let key of Object.keys(row.original)) {
        if ((typeof row.original[key] === "object" && areObjectsEqual(row.original[key], originalPRecord.current[key])) || row.original[key] !== originalPRecord.current[key]) {
          precord[key] = originalPRecord.current[key];
        }
      }
    }

    setValidationErrors({});

    if (precord.opReadiness === "Y" && precord.doctor) {
      precord.opReadiness = "P";
    }

    await dbUpdateFnMapping[tableType](precord);

    let otherType: TableType = tableType === "Ready" ? "ExceptReady" : "Ready";
    if (!isInvalidOpReadiessWithTable(precord, undefined, otherType)) {
      createFnMapping[otherType](precord);
      emitCreateRecord(precord, otherType, socket, SCHEDULING_ROOM_ID);
      emitDeleteRecord(precord.id, tableType, socket, user, SCHEDULING_ROOM_ID);
    } else {
      emitSaveRecord(precord, tableType, socket, SCHEDULING_ROOM_ID);
    }

    table.setEditingRow(null); // exit editing mode

    if (precord.LockingUser?.id === user.id) {
      emitUnLockRecord(row.id, tableType, socket, SCHEDULING_ROOM_ID);
    }

    originalPRecord.current = undefined;
  };
  const id = useRef(2001);

  const handleCreatePRecord = async (currentTable: MRT_TableInstance<PRecord>, anotherTable: MRT_TableInstance<PRecord>, tableType: TableType, values: Record<LiteralUnion<string, string>, any>) => {
    let precord = values as PRecord;
    let table: MRT_TableInstance<PRecord> = currentTable;
    if (originalPRecord.current) {
      for (let key of Object.keys(originalPRecord.current)) {
        if ((typeof originalPRecord.current[key] === "object" && areObjectsEqual(originalPRecord.current[key], precord[key])) || originalPRecord.current[key] !== precord[key]) {
          precord[key] = originalPRecord.current[key];
        }
      }
    }

    precord.id = id.current.toString();
    id.current += 1;

    if (isInvalidOpReadiessWithTable(precord, undefined, tableType)) {
      tableType = tableType === "Ready" ? "ExceptReady" : "Ready";
      table = anotherTable;
    }

    await dbCreateFnMapping[tableType](precord);
    emitCreateRecord(precord, tableType, socket, SCHEDULING_ROOM_ID);
    originalPRecord.current = undefined;
    table.setCreatingRow(null); //exit creating mode
    setValidationErrors({});
  };

  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  // Start ---------------------------------------------- Column definition
  const readyColumns = useMemo<MRT_ColumnDef<PRecord>[]>(
    () => [
      checkinTimeColumn(originalPRecord),
      chartNumberColumn,
      patientNameColumn,
      opReadinessColumn(setOpenChangeStatusModal, actionPRecord),
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
  const exceptReadyColumns = useMemo<MRT_ColumnDef<PRecord>[]>(
    () => [
      checkinTimeColumn(originalPRecord),
      chartNumberColumn,
      patientNameColumn,
      opReadinessColumn(setOpenChangeStatusModal, actionPRecord),
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
  // End ---------------------------------------------- Column definition

  // Start ---------------------------------------------- Table definition
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
    onCreatingRowSave: ({ table, values }) => handleCreatePRecord(table, exceptReadyTable, "Ready", values),
    onEditingRowCancel: ({ row }) => handleEditingCancel(row, "Ready"),
    onEditingRowSave: ({ row, table, values }) => handleSavePRecord(row, table, "Ready", values),
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

  const exceptReadyTable: MRT_TableInstance<PRecord> = useMaterialReactTable({
    columns: exceptReadyColumns,
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
    getRowId: (row) => row.id,
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
        },
      };
    },
    muiTableBodyCellProps: ({ row }) => ({
      onClick: async () => {
        if (row.original.LockingUser) {
          return;
        }
      },
    }),
    onCreatingRowCancel: () => {
      setValidationErrors({});
      originalPRecord.current = undefined;
    },
    onCreatingRowSave: ({ values, table }) => handleCreatePRecord(table, readyTable, "ExceptReady", values),
    onEditingRowCancel: ({ row }) => handleEditingCancel(row, "ExceptReady"),
    onEditingRowSave: ({ row, table, values }) => handleSavePRecord(row, table, "ExceptReady", values),
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
    state: {
      isLoading: isLoadingExceptReadyPRecords,
      isSaving: isCreatingExceptReadyPRecord || isUpdatingExceptReadyPRecord || isDeletingExceptReadyPRecord,
      showAlertBanner: isLoadingExceptReadyPRecordsError,
      showProgressBars: isFetchingExceptReadyPRecords,
    },
  });
  // End ---------------------------------------------- Table definition

  const handleOpenAssignModal = (row: MRT_Row<PRecord>) => {
    setOpenAssignModal(true);
    actionPRecord.current = JSON.parse(JSON.stringify(row.original));
    if (actionPRecord.current) {
      emitLockRecord(actionPRecord.current.id, getTableType(actionPRecord.current.opReadiness), socket, user, SCHEDULING_ROOM_ID);
    }
  };
  const handleCloseAssignModal = () => {
    setOpenAssignModal(false);
    if (actionPRecord.current) {
      emitUnLockRecord(actionPRecord.current.id, getTableType(actionPRecord.current.opReadiness), socket, SCHEDULING_ROOM_ID);
    }
    actionPRecord.current = undefined;
  };
  const handleConfirmAssign = async () => {
    if (actionPRecord.current) {
      actionPRecord.current.doctor = user.id;
      actionPRecord.current.opReadiness = "P";
      emitDeleteRecord(actionPRecord.current.id, "Ready", socket, user, SCHEDULING_ROOM_ID);
      emitCreateRecord(actionPRecord.current, "ExceptReady", socket, SCHEDULING_ROOM_ID);
      await dbUpdateFnMapping["Ready"](actionPRecord.current);
      createFnMapping["ExceptReady"](actionPRecord.current);
    }
    handleCloseAssignModal();
  };
  const handleOpenDeleteModal = (row: MRT_Row<PRecord>) => {
    setOpenDeleteModal(true);
    actionPRecord.current = JSON.parse(JSON.stringify(row.original));
    if (actionPRecord.current) {
      emitLockRecord(actionPRecord.current.id, getTableType(actionPRecord.current.opReadiness), socket, user, SCHEDULING_ROOM_ID);
    }
  };
  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);

    if (actionPRecord.current) {
      emitUnLockRecord(actionPRecord.current.id, getTableType(actionPRecord.current.opReadiness), socket, SCHEDULING_ROOM_ID);
    }
    actionPRecord.current = undefined;
  };
  const handleConfirmDelete = async () => {
    if (actionPRecord.current) {
      const tableType = getTableType(actionPRecord.current.opReadiness);
      dbDeleteFnMapping[tableType](actionPRecord.current.id);
      emitDeleteRecord(actionPRecord.current.id, tableType, socket, user, SCHEDULING_ROOM_ID);
    }
    handleCloseDeleteModal();
  };
  const handleCloseStatusChangeModal = () => {
    setOpenChangeStatusModal(false);
    if (actionPRecord.current) {
      emitUnLockRecord(actionPRecord.current.id, getTableType(actionPRecord.current.opReadiness), socket, SCHEDULING_ROOM_ID);
    }
    actionPRecord.current = undefined;
  };
  const handleConfirmStatusChange = async (newStatus?: OpReadiness) => {
    if (actionPRecord.current && actionPRecord.current.opReadiness !== newStatus) {
      let tableType = getTableType(actionPRecord.current.opReadiness);
      if (actionPRecord.current.opReadiness === "Y" || newStatus === "Y") {
        actionPRecord.current.opReadiness = newStatus;
        // need api call to update db
        deleteFnMapping[tableType](actionPRecord.current.id);
        emitDeleteRecord(actionPRecord.current.id, tableType, socket, user, SCHEDULING_ROOM_ID);
        tableType = tableType === "Ready" ? "ExceptReady" : "Ready";
        createFnMapping[tableType](actionPRecord.current);
        emitCreateRecord(actionPRecord.current, tableType, socket, SCHEDULING_ROOM_ID);
      } else {
        actionPRecord.current.opReadiness = newStatus;
        await dbUpdateFnMapping[tableType](actionPRecord.current);
        emitSaveRecord(actionPRecord.current, tableType, socket, SCHEDULING_ROOM_ID);
      }
    }
    handleCloseStatusChangeModal();
  };
  // Assign and Delete Dialogs

  return (
    <div className="w-full h-full gap-2 flex flex-col">
      <audio className="hidden" ref={audioRef} src={"../assets/sounds/new_record_ready_noti.mp3"} controls />
      {/* Assignment Modal */}
      <ChangeStatusDialog handleCloseModal={handleCloseStatusChangeModal} handleConfirmModal={handleConfirmStatusChange} openModal={openChangeStatusModal} actionPRecord={actionPRecord} />
      <AssignmentDialog handleCloseModal={handleCloseAssignModal} handleConfirmModal={handleConfirmAssign} openModal={openAssignModal} actionPRecord={actionPRecord} />
      <DeleteRecordDialog handleCloseModal={handleCloseDeleteModal} handleConfirmModal={handleConfirmDelete} openModal={openDeleteModal} actionPRecord={actionPRecord} />
      <MaterialReactTable table={readyTable} />
      <MaterialReactTable table={exceptReadyTable} />
    </div>
  );
};

export default SchedulingTable;

/** @format */

import { LiteralUnion, MRT_ColumnDef, MRT_Row, MRT_TableInstance, MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { MRT_Localization_KO } from "material-react-table/locales/ko";
import { OpReadiness, PRecord, TableType, User } from "~/type";
// import { emitCreateRecords, emitDeleteRecord, emitLockRecord, emitSaveRecord, emitUnLockRecord } from "~/utils/Table/socket";
import SchedulingTableTopToolbar from "../Table/SchedulingTableTopToolbar";
import { useCreatePRecord, useDeletePRecord, useGetPRecords, useUpdatePRecord } from "~/utils/Table/crud";
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
import { PORT, CONNECT, JOIN_ROOM, USER_JOINED, CONNECTED_USERS, LOCK_RECORD, UNLOCK_RECORD, SAVE_RECORD, CREATE_RECORD, DELETE_RECORD, ARCHIVE_ROOM_ID, ROLE } from "shared";
import { Socket, io } from "socket.io-client";
import SchedulingTableRow from "~/components/Table/SchedulingTableRowAction";
import { ChangeStatusDialog, DeleteRecordDialog } from "../Table/Dialogs";
import { Dayjs } from "dayjs";
import { useRecoilValue } from "recoil";
import { userState } from "~/recoil_state";

type props = {
  startDate: Dayjs;
  endDate: Dayjs;
};

const ArchiveTable: React.FC<props> = ({ startDate, endDate }) => {
  // const [socket, setSocket] = useState<Socket | null>(null);
  // const [clients, setClients] = useState<String[]>([]);
  // const user = useRecoilValue(userState);

  // const handleConnectedUsers = (users: String[]) => {
  //   setClients(users);
  // };
  // // Socket configuration
  // useEffect(() => {
  //   const socketInstance = io(`http://localhost:${PORT}`);
  //   setSocket(socketInstance);

  //   // Default
  //   // socketInstance.on(CONNECT, () => {
  //   //   socketInstance.emit(JOIN_ROOM, {
  //   //     userId: user.id,
  //   //     username: user.name,
  //   //   });
  //   // });

  //   // Other user joined
  //   socketInstance.on(USER_JOINED, (username) => {
  //     if (typeof socket === "undefined") return;
  //     setClients((prev) => [...prev, username]);
  //     socketInstance.emit(CONNECTED_USERS, clients); //Emit User Array
  //   });

  //   // Set connected users
  //   socketInstance.on(CONNECTED_USERS, handleConnectedUsers);
  //   socketInstance.on(LOCK_RECORD, onLockRecord);
  //   socketInstance.on(UNLOCK_RECORD, onUnlockRecord);
  //   socketInstance.on(SAVE_RECORD, onSaveRecord);
  //   socketInstance.on(CREATE_RECORD, onCreateRecord);
  //   socketInstance.on(DELETE_RECORD, onDeleteRecord);

  //   return () => {
  //     socketInstance.off(CONNECTED_USERS);
  //     socketInstance.off(LOCK_RECORD);
  //     socketInstance.off(UNLOCK_RECORD);
  //     socketInstance.off(SAVE_RECORD);
  //     socketInstance.off(CREATE_RECORD);
  //     socketInstance.off(DELETE_RECORD);
  //     socketInstance.disconnect();
  //   };
  // }, []);
  // // Assign and Delete Dialogs
  // const [openDeleteModal, setOpenDeleteModal] = useState(false);
  // const [openChangeStatusModal, setOpenChangeStatusModal] = useState(false);

  // const actionPRecord = useRef<PRecord>();
  // const originalPRecord = useRef<PRecord>();

  // const { mutate: createArchivePRecord, mutateAsync: createArchivePRecordWithDB, isPending: isCreatingArchivePRecord } = useCreatePRecord("Archive_PRecord");
  // const {
  //   data: fetchedArchivePRecords,
  //   isError: isLoadingArchivePRecordsError,
  //   isFetching: isFetchingArchivePRecords,
  //   isLoading: isLoadingArchivePRecords,
  // } = useGetPRecords("Archive_PRecord", startDate, endDate);
  // const { mutate: updateArchivePRecord, mutateAsync: updateArchivePRecordWithDB, isPending: isUpdatingArchivePRecord, error: updateError } = useUpdatePRecord("Archive_PRecord");
  // const { mutate: deleteArchivePRecord, mutateAsync: deleteArchivePRecordWithDB, isPending: isDeletingArchivePRecord } = useDeletePRecord("Archive_PRecord");

  // const onLockRecord = ({ recordId, locker, tableType }: { recordId: string; locker: User; tableType: TableType }) => {
  //   const row = archiveTable.getRow(recordId).original;
  //   if (row) {
  //     row.lockingUser = locker;
  //     updateArchivePRecord(row);
  //   }
  // };
  // const onUnlockRecord = ({ recordId, tableType }: { recordId: string; tableType: TableType }) => {
  //   const row = archiveTable.getRow(recordId).original;
  //   if (row) {
  //     row.lockingUser = null;
  //     updateArchivePRecord(row);
  //   }
  // };

  // const onSaveRecord = ({ recordId, record, tableType }: { recordId: string; record: string; tableType: TableType }) => {
  //   const precord: PRecord = JSON.parse(record);
  //   precord.lockingUser = null;
  //   let row = archiveTable.getRow(recordId).original;
  //   if (row) {
  //     row = precord;
  //     updateArchivePRecord(row);
  //   }
  // };
  // const onCreateRecord = ({ record, tableType }: { record: string; tableType: TableType }) => {
  //   const precord: PRecord = JSON.parse(record);
  //   precord.lockingUser = null;
  //   createArchivePRecord(precord);
  //   if (precord.opReadiness === "Y") {
  //     //   playAudio();
  //   }
  // };

  // const onDeleteRecord = ({ recordId, tableType }: { recordId: string; tableType: TableType }) => {
  //   deleteArchivePRecord(recordId);
  // };
  // const handleOpenDeleteModal = (row: MRT_Row<PRecord>) => {
  //   setOpenDeleteModal(true);
  //   actionPRecord.current = JSON.parse(JSON.stringify(row.original));
  //   if (actionPRecord.current) {
  //     emitLockRecord(actionPRecord.current.id, "Archive", socket, user, ARCHIVE_ROOM_ID);
  //   }
  // };
  // const handleCloseDeleteModal = () => {
  //   setOpenDeleteModal(false);
  //   if (actionPRecord.current) {
  //     emitUnLockRecord(actionPRecord.current.id, "Archive", socket, ARCHIVE_ROOM_ID);
  //   }
  //   actionPRecord.current = undefined;
  // };
  // const handleConfirmDelete = async () => {
  //   if (actionPRecord.current) {
  //     await deleteArchivePRecordWithDB(actionPRecord.current.id);
  //     emitDeleteRecord(actionPRecord.current.id, "Archive", socket, user, ARCHIVE_ROOM_ID);
  //   }
  //   handleCloseDeleteModal();
  // };
  // const handleCloseStatusChangeModal = () => {
  //   setOpenChangeStatusModal(false);
  //   if (actionPRecord.current) {
  //     emitUnLockRecord(actionPRecord.current.id, "Archive", socket, ARCHIVE_ROOM_ID);
  //   }
  //   actionPRecord.current = undefined;
  // };
  // const handleConfirmStatusChange = async (newStatus?: OpReadiness) => {
  //   if (actionPRecord.current && actionPRecord.current.opReadiness !== newStatus) {
  //     await updateArchivePRecordWithDB(actionPRecord.current);
  //     emitSaveRecord(actionPRecord.current, "Archive", socket, ARCHIVE_ROOM_ID);
  //   }
  //   handleCloseStatusChangeModal();
  // };
  // // Start ---------------------------------------------- Column definition
  // const columns = useMemo<MRT_ColumnDef<PRecord>[]>(
  //   () => [
  //     checkinTimeColumn(originalPRecord),
  //     chartNumberColumn,
  //     patientNameColumn,
  //     opReadinessColumn(actionPRecord, "Archive", setOpenChangeStatusModal),
  //     treatment1Column(originalPRecord),
  //     quantitytreat1Column,
  //     treatmentRoomColumn,
  //     doctorColumn(originalPRecord),
  //     anesthesiaNoteColumn,
  //     skincareSpecialist1Column(originalPRecord),
  //     skincareSpecialist2Column(originalPRecord),
  //     nursingStaff1Column(originalPRecord),
  //     nursingStaff2Column(originalPRecord),
  //     coordinatorColumn(originalPRecord),
  //     consultantColumn(originalPRecord),
  //     commentCautionColumn,
  //   ],
  //   []
  // );
  // const handleEditingCancel = (row: MRT_Row<PRecord>, tableType: TableType) => {
  //   // setValidationErrors({});
  //   emitUnLockRecord(row.id, tableType, socket, ARCHIVE_ROOM_ID);
  //   originalPRecord.current = undefined;
  // };

  // function areObjectsEqual(obj1: PRecord, obj2: PRecord): boolean {
  //   const keys1 = Object.keys(obj1);
  //   const keys2 = Object.keys(obj2);

  //   if (keys1.length !== keys2.length) {
  //     return false;
  //   }

  //   for (let key of keys1) {
  //     if (!obj2.hasOwnProperty(key)) {
  //       return false;
  //     }

  //     if (typeof obj1[key] === "object" && typeof obj2[key] === "object") {
  //       if (!areObjectsEqual(obj1[key], obj2[key])) {
  //         return false;
  //       }
  //     } else {
  //       if (obj1[key] !== obj2[key]) {
  //         return false;
  //       }
  //     }
  //   }

  //   return true;
  // }

  // const handleSavePRecord = async (row: MRT_Row<PRecord>, table: MRT_TableInstance<PRecord>, tableType: TableType, values: Record<LiteralUnion<string, string>, any>) => {
  //   let precord = values as PRecord;

  //   if (precord.id === undefined) {
  //     precord.id = row.original.id;
  //   }

  //   if (originalPRecord.current) {
  //     for (let key of Object.keys(row.original)) {
  //       if ((typeof row.original[key] === "object" && areObjectsEqual(row.original[key], originalPRecord.current[key])) || row.original[key] !== originalPRecord.current[key]) {
  //         precord[key] = originalPRecord.current[key];
  //       }
  //     }
  //   }

  //   if (precord.opReadiness === "Y" && precord.doctor) {
  //     precord.opReadiness = "P";
  //   }

  //   await updateArchivePRecordWithDB(precord);
  //   emitSaveRecord(precord, tableType, socket, ARCHIVE_ROOM_ID);

  //   table.setEditingRow(null); // exit editing mode

  //   if (user && precord.lockingUser?.id === user.id) {
  //     emitUnLockRecord(row.id, tableType, socket, ARCHIVE_ROOM_ID);
  //   }

  //   originalPRecord.current = undefined;
  // };
  // const id = useRef(2001);

  // const handleCreatePRecord = async (table: MRT_TableInstance<PRecord>, tableType: TableType, values: Record<LiteralUnion<string, string>, any>) => {
  //   let precord = values as PRecord;
  //   if (originalPRecord.current) {
  //     for (let key of Object.keys(originalPRecord.current)) {
  //       if ((typeof originalPRecord.current[key] === "object" && areObjectsEqual(originalPRecord.current[key], precord[key])) || originalPRecord.current[key] !== precord[key]) {
  //         precord[key] = originalPRecord.current[key];
  //       }
  //     }
  //   }

  //   precord.id = id.current.toString();
  //   id.current += 1;
  //   await createArchivePRecordWithDB(precord);
  //   emitCreateRecords(precord, tableType, socket, ARCHIVE_ROOM_ID);
  //   originalPRecord.current = undefined;
  //   table.setCreatingRow(null); //exit creating mode
  // };

  // // Start ---------------------------------------------- Table definition
  // const archiveTable: MRT_TableInstance<PRecord> = useMaterialReactTable({
  //   columns: columns,
  //   data: fetchedArchivePRecords ? fetchedArchivePRecords : [],
  //   localization: MRT_Localization_KO,
  //   initialState: {
  //     columnPinning: { left: ["mrt-row-actions"] },
  //     density: "compact",
  //     pagination: {
  //       pageSize: 30,
  //       pageIndex: 0,
  //     },
  //   },
  //   createDisplayMode: "modal", // ('modal', and 'custom' are also available)
  //   editDisplayMode: "modal", // ('modal', 'cell', 'table', and 'custom' are also available)
  //   enableEditing: true,
  //   enableColumnResizing: true,
  //   enableRowActions: true,
  //   muiTableHeadCellProps: {
  //     sx: {
  //       "& .Mui-TableHeadCell-Content": {
  //         justifyContent: "center",
  //       },
  //     },
  //   },
  //   muiTableContainerProps: ({ table }) => {
  //     const { isFullScreen } = table.getState();
  //     return {
  //       sx: {
  //         height: isFullScreen ? "100%" : "500px",
  //       },
  //     };
  //   },
  //   muiTableProps: ({}) => ({
  //     sx: {
  //       width: "0px",
  //     },
  //   }),
  //   muiToolbarAlertBannerProps: isLoadingArchivePRecordsError
  //     ? {
  //         color: "error",
  //         children: "Error loading data",
  //       }
  //     : undefined,
  //   muiTableBodyRowProps: ({ row, table }) => {
  //     const { density } = table.getState();
  //     return {
  //       sx: {
  //         backgroundColor: user && row.original.lockingUser && row.original.lockingUser?.id != user.id ? "gray" : "white",
  //         pointerEvents: user && row.original.lockingUser && row.original.lockingUser?.id != user.id ? "none" : "default",
  //         height: `${density === "compact" ? 45 : density === "comfortable" ? 50 : 57}px`,
  //         cursor: user && user.role === ROLE.DOCTOR ? "pointer" : "default",
  //       },
  //     };
  //   },
  //   muiTableBodyCellProps: ({ row }) => ({
  //     onDoubleClick: async () => {
  //       if (row.original.lockingUser) {
  //         return;
  //       }
  //     },
  //   }),
  //   onCreatingRowCancel: () => {
  //     originalPRecord.current = undefined;
  //   },
  //   onCreatingRowSave: ({ table, values }) => handleCreatePRecord(table, "Archive", values),
  //   onEditingRowCancel: ({ row }) => handleEditingCancel(row, "Archive"),
  //   onEditingRowSave: ({ row, table, values }) => handleSavePRecord(row, table, "Archive", values),
  //   renderRowActions: ({ row, table }) => (
  //     <SchedulingTableRow
  //       originalPRecord={originalPRecord}
  //       row={row}
  //       table={table}
  //       emitLockRecord={emitLockRecord}
  //       socket={socket}
  //       openDeleteConfirmModal={() => handleOpenDeleteModal(row)}
  //       tableType="Archive"
  //       roomId={ARCHIVE_ROOM_ID}
  //     />
  //   ),
  //   renderTopToolbarCustomActions: ({ table }) => <SchedulingTableTopToolbar originalPRecord={originalPRecord} table={table} tableType="Archive" />,
  //   getRowId: (originalRow) => originalRow.id,
  //   state: {
  //     isLoading: isLoadingArchivePRecords,
  //     isSaving: isCreatingArchivePRecord || isUpdatingArchivePRecord || isDeletingArchivePRecord,
  //     showAlertBanner: isLoadingArchivePRecordsError,
  //     showProgressBars: isFetchingArchivePRecords,
  //   },
  // });

  return (
    <>
      {/* <DeleteRecordDialog modalOpen={openDeleteModal} setModalOpen={setOpenDeleteModal} deleteFn={deleteArchivePRecord} actionPRecord={actionPRecord} socket={socket} />
      <MaterialReactTable table={archiveTable} /> */}
    </>
  );
};

export default ArchiveTable;

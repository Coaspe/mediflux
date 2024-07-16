/** @format */

// /** @format */

// import { UseMutateFunction, UseMutateAsyncFunction } from "@tanstack/react-query";
// import { SCHEDULING_ROOM_ID } from "shared";
// import { PRecord, TableType, OpReadiness } from "~/type";
// import { useCreatePRecord, useGetPRecords, useUpdatePRecord, useDeletePRecord } from "~/utils/Table/crud";
// import { emitUnLockRecord, emitDeleteRecord, emitCreateRecord, emitSaveRecord } from "~/utils/Table/socket";
// import { getTableType } from "~/utils/utils";
// import { ChangeStatusDialog, AssignmentDialog, DeleteRecordDialog } from "./Dialogs";
// import { useRef, useState } from "react";
// import { Socket } from "socket.io-client";
// type props = {
//   socket: Socket | null;
// };

// const Modals: React.FC<props> = ({ socket }) => {
//   const [openAssignModal, setOpenAssignModal] = useState(false);
//   const [openDeleteModal, setOpenDeleteModal] = useState(false);
//   const [openChangeStatusModal, setOpenChangeStatusModal] = useState(false);
//   const actionPRecord = useRef<PRecord>();

//   const { mutate: createReadyPRecord, mutateAsync: createReadyPRecordWithDB, isPending: isCreatingReadyPRecord } = useCreatePRecord("Ready_PRecord");
//   const { data: fetchedReadyPRecords, isError: isLoadingReadyPRecordsError, isFetching: isFetchingReadyPRecords, isLoading: isLoadingReadyPRecords } = useGetPRecords("Ready_PRecord");
//   const { mutate: updateReadyPRecord, mutateAsync: updateReadyPRecordWithDB, isPending: isUpdatingReadyPRecord, error: updateError } = useUpdatePRecord("Ready_PRecord");
//   const { mutate: deleteReadyPRecord, mutateAsync: deleteReadyPRecordWithDB, isPending: isDeletingReadyPRecord } = useDeletePRecord("Ready_PRecord");

//   const { mutate: createExceptReadyPRecord, mutateAsync: createExceptReadyPRecordWithDB, isPending: isCreatingExceptReadyPRecord } = useCreatePRecord("ExceptReady_PRecord");

//   const {
//     mutate: updateExceptReadyPRecord,
//     mutateAsync: updateExceptReadyPRecordWithDB,
//     isPending: isUpdatingExceptReadyPRecord,
//     error: updateExceptReadyError,
//   } = useUpdatePRecord("ExceptReady_PRecord");
//   const { mutate: deleteExceptReadyPRecord, mutateAsync: deleteExceptReadyPRecordWithDB, isPending: isDeletingExceptReadyPRecord } = useDeletePRecord("ExceptReady_PRecord");

//   const dummyUpdateArchivePRecord: UseMutateFunction<void, Error, PRecord, void> = () => {
//     console.warn("Archive update function is not implemented yet.");
//     return Promise.resolve(); // 또는 필요한 기본 반환값
//   };
//   const dummyUpdateArchivePRecordString: UseMutateFunction<void, Error, string, void> = () => {
//     console.warn("Archive update function is not implemented yet.");
//     return Promise.resolve(); // 또는 필요한 기본 반환값
//   };
//   const dummyUpdateArchivePRecordStringWithDB: UseMutateAsyncFunction<void, Error, string, void> = () => {
//     console.warn("Archive update function is not implemented yet.");
//     return Promise.resolve(); // 또는 필요한 기본 반환값
//   };
//   const dummyUpdateArchivePRecordWithDB: UseMutateAsyncFunction<void, Error, PRecord, void> = () => {
//     console.warn("Archive update function is not implemented yet.");
//     return Promise.resolve(); // 또는 필요한 기본 반환값
//   };

//   const updateFnMapping: Record<TableType, UseMutateFunction<void, Error, PRecord, void>> = {
//     Ready: updateReadyPRecord,
//     ExceptReady: updateExceptReadyPRecord,
//     Archive: dummyUpdateArchivePRecord,
//   };
//   const createFnMapping: Record<TableType, UseMutateFunction<void, Error, PRecord, void>> = {
//     Ready: createReadyPRecord,
//     ExceptReady: createExceptReadyPRecord,
//     Archive: dummyUpdateArchivePRecord,
//   };
//   const deleteFnMapping: Record<TableType, UseMutateFunction<void, Error, string, void>> = {
//     Ready: deleteReadyPRecord,
//     ExceptReady: deleteExceptReadyPRecord,
//     Archive: dummyUpdateArchivePRecordString,
//   };
//   const dbUpdateFnMapping: Record<TableType, UseMutateAsyncFunction<void, Error, PRecord, void>> = {
//     Ready: updateReadyPRecordWithDB,
//     ExceptReady: updateExceptReadyPRecordWithDB,
//     Archive: dummyUpdateArchivePRecordWithDB,
//   };
//   const dbDeleteFnMapping: Record<TableType, UseMutateAsyncFunction<void, Error, string, void>> = {
//     Ready: deleteReadyPRecordWithDB,
//     ExceptReady: deleteExceptReadyPRecordWithDB,
//     Archive: dummyUpdateArchivePRecordStringWithDB,
//   };
//   const handleCloseAssignModal = () => {
//     setOpenAssignModal(false);
//     if (actionPRecord.current) {
//       emitUnLockRecord(actionPRecord.current.id, getTableType(actionPRecord.current.opReadiness), socket, SCHEDULING_ROOM_ID);
//     }
//     actionPRecord.current = undefined;
//   };
//   const handleConfirmAssign = async () => {
//     if (actionPRecord.current) {
//       actionPRecord.current.doctor = user.id;
//       actionPRecord.current.opReadiness = "P";
//       emitDeleteRecord(actionPRecord.current.id, "Ready", socket, user, SCHEDULING_ROOM_ID);
//       emitCreateRecord(actionPRecord.current, "ExceptReady", socket, SCHEDULING_ROOM_ID);
//       await dbUpdateFnMapping["Ready"](actionPRecord.current);
//       createFnMapping["ExceptReady"](actionPRecord.current);
//     }
//     handleCloseAssignModal();
//   };
//   const handleCloseDeleteModal = () => {
//     setOpenDeleteModal(false);

//     if (actionPRecord.current) {
//       emitUnLockRecord(actionPRecord.current.id, getTableType(actionPRecord.current.opReadiness), socket, SCHEDULING_ROOM_ID);
//     }
//     actionPRecord.current = undefined;
//   };
//   const handleConfirmDelete = async () => {
//     if (actionPRecord.current) {
//       const tableType = getTableType(actionPRecord.current.opReadiness);
//       dbDeleteFnMapping[tableType](actionPRecord.current.id);
//       emitDeleteRecord(actionPRecord.current.id, tableType, socket, user, SCHEDULING_ROOM_ID);
//     }
//     handleCloseDeleteModal();
//   };
//   const handleCloseStatusChangeModal = () => {
//     setOpenChangeStatusModal(false);
//     if (actionPRecord.current) {
//       emitUnLockRecord(actionPRecord.current.id, getTableType(actionPRecord.current.opReadiness), socket, SCHEDULING_ROOM_ID);
//     }
//     actionPRecord.current = undefined;
//   };
//   const handleConfirmStatusChange = async (newStatus?: OpReadiness) => {
//     if (actionPRecord.current && actionPRecord.current.opReadiness !== newStatus) {
//       let tableType = getTableType(actionPRecord.current.opReadiness);
//       if (actionPRecord.current.opReadiness === "Y" || newStatus === "Y") {
//         actionPRecord.current.opReadiness = newStatus;
//         // need api call to update db
//         deleteFnMapping[tableType](actionPRecord.current.id);
//         emitDeleteRecord(actionPRecord.current.id, tableType, socket, user, SCHEDULING_ROOM_ID);
//         tableType = tableType === "Ready" ? "ExceptReady" : "Ready";
//         createFnMapping[tableType](actionPRecord.current);
//         emitCreateRecord(actionPRecord.current, tableType, socket, SCHEDULING_ROOM_ID);
//       } else {
//         actionPRecord.current.opReadiness = newStatus;
//         await dbUpdateFnMapping[tableType](actionPRecord.current);
//         emitSaveRecord(actionPRecord.current, tableType, socket, SCHEDULING_ROOM_ID);
//       }
//     }
//     handleCloseStatusChangeModal();
//   };
//   return (
//     <>
//       <ChangeStatusDialog handleCloseModal={handleCloseStatusChangeModal} handleConfirmModal={handleConfirmStatusChange} openModal={openChangeStatusModal} actionPRecord={actionPRecord} />
//       <AssignmentDialog handleCloseModal={handleCloseAssignModal} handleConfirmModal={handleConfirmAssign} openModal={openAssignModal} actionPRecord={actionPRecord} />
//       <DeleteRecordDialog handleCloseModal={handleCloseDeleteModal} handleConfirmModal={handleConfirmDelete} openModal={openDeleteModal} actionPRecord={actionPRecord} />
//     </>
//   );
// };

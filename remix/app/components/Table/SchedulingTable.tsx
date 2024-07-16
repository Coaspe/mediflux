/** @format */

import { useEffect, useRef, useState } from "react";
import { type MRT_Row } from "material-react-table";
import { Socket, io } from "socket.io-client";
import { CONNECT, CONNECTED_USERS, JOIN_ROOM, USER_JOINED, PORT, SCHEDULING_ROOM_ID } from "shared";
import { OpReadiness, PRecord, TableType } from "~/type";
import { getTableType } from "~/utils/utils";
import { emitUnLockRecord, emitCreateRecord, emitDeleteRecord, emitSaveRecord, emitLockRecord } from "~/utils/Table/socket";
import { UseMutateFunction, UseMutateAsyncFunction } from "@tanstack/react-query";
import { useCreatePRecord, useUpdatePRecord, useDeletePRecord } from "~/utils/Table/crud";
import { ChangeStatusDialog, AssignmentDialog, DeleteRecordDialog } from "./Dialogs";
import { useRecoilValue } from "recoil";
import { userState } from "~/recoil_state";
import ReadyTable from "./ReadyTable";
import ExceptReadyTable from "./ExecptReadyTable";

const SchedulingTable = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [clients, setClients] = useState<String[]>([]);
  const user = useRecoilValue(userState);

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

    return () => {
      socketInstance.off(CONNECTED_USERS);
      socketInstance.disconnect();
    };
  }, []);

  const { mutate: createReadyPRecord, isPending: isCreatingReadyPRecord } = useCreatePRecord("Ready_PRecord");
  const { mutate: updateReadyPRecord, mutateAsync: updateReadyPRecordWithDB, isPending: isUpdatingReadyPRecord, error: updateError } = useUpdatePRecord("Ready_PRecord");
  const { mutate: deleteReadyPRecord, mutateAsync: deleteReadyPRecordWithDB, isPending: isDeletingReadyPRecord } = useDeletePRecord("Ready_PRecord");

  const { mutate: updateExceptReadyPRecord, mutateAsync: updateExceptReadyPRecordWithDB, isPending: isUpdatingExceptReadyPRecord } = useCreatePRecord("ExceptReady_PRecord");
  const { mutate: createExceptReadyPRecord, isPending: isCreatingExceptReadyPRecord } = useCreatePRecord("ExceptReady_PRecord");
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
  const dbDeleteFnMapping: Record<TableType, UseMutateAsyncFunction<void, Error, string, void>> = {
    Ready: deleteReadyPRecordWithDB,
    ExceptReady: deleteExceptReadyPRecordWithDB,
    Archive: dummyUpdateArchivePRecordStringWithDB,
  };

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

  return (
    <div className="w-full h-full gap-2 flex flex-col">
      <audio className="hidden" ref={audioRef} src={"../assets/sounds/new_record_ready_noti.mp3"} controls />
      {/* Assignment Modal */}
      <ChangeStatusDialog handleCloseModal={handleCloseStatusChangeModal} handleConfirmModal={handleConfirmStatusChange} openModal={openChangeStatusModal} actionPRecord={actionPRecord} />
      <AssignmentDialog handleCloseModal={handleCloseAssignModal} handleConfirmModal={handleConfirmAssign} openModal={openAssignModal} actionPRecord={actionPRecord} />
      <DeleteRecordDialog handleCloseModal={handleCloseDeleteModal} handleConfirmModal={handleConfirmDelete} openModal={openDeleteModal} actionPRecord={actionPRecord} />
      <ReadyTable
        originalPRecord={originalPRecord}
        setOpenChangeStatusModal={setOpenChangeStatusModal}
        handleOpenAssignModal={handleOpenAssignModal}
        handleOpenDeleteModal={handleOpenDeleteModal}
        playAudio={playAudio}
        socket={socket}
      />
      <ExceptReadyTable
        originalPRecord={originalPRecord}
        setOpenChangeStatusModal={setOpenChangeStatusModal}
        handleOpenAssignModal={handleOpenAssignModal}
        handleOpenDeleteModal={handleOpenDeleteModal}
        socket={socket}
      />
    </div>
  );
};

export default SchedulingTable;

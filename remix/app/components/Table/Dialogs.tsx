import React, { Dispatch, MutableRefObject, useEffect, useState } from "react";
import { SCHEDULING_ROOM_ID, TREATMENTS } from "shared";
import { OpReadiness, PRecord } from "~/type";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Chip from "@mui/material/Chip";
import { getStatusChipColor } from "./ColumnRenderers";
import { Box } from "@mui/joy";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import { emitUnLockRecord, emitDeleteRecord, emitCreateRecord, emitSaveRecord, emitLockRecord } from "~/utils/Table/socket";
import { getTableType } from "~/utils/utils";
import { Socket } from "socket.io-client";
import { UseMutateAsyncFunction, UseMutateFunction } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import { userState } from "~/recoil_state";
import { useCreatePRecord, useUpdatePRecord } from "~/utils/Table/crud";
import { OP_READINESS_ENTRIES } from "~/constant";

type AssignmentDialogProps = {
  createExceptReadyFn: UseMutateFunction<void, Error, PRecord, void>;
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  actionPRecord: MutableRefObject<PRecord | undefined>;
  socket: Socket | null;
};

export const AssignmentDialog: React.FC<AssignmentDialogProps> = ({ createExceptReadyFn, modalOpen, setModalOpen, actionPRecord, socket }) => {
  const charNumString: string = `${actionPRecord.current?.chartNum && "["}${actionPRecord.current?.chartNum}${actionPRecord.current?.chartNum && ", "}`;
  const patientNameString: string = `${actionPRecord.current?.patientName}${actionPRecord.current?.patientName && ", "}`;
  const treatment = TREATMENTS.find((t) => t.id === actionPRecord.current?.treatment1)?.title;
  const treatmentString = treatment && `${treatment}]`;
  const user = useRecoilValue(userState);
  const { mutateAsync: updateDbReadyFn } = useUpdatePRecord("Ready_PRecord");

  const handleCloseAssignModal = () => {
    setModalOpen(false);
    if (actionPRecord.current) {
      emitUnLockRecord(actionPRecord.current.id, getTableType(actionPRecord.current.opReadiness), socket, SCHEDULING_ROOM_ID);
    }
    actionPRecord.current = undefined;
  };
  const handleConfirmAssign = async () => {
    if (actionPRecord.current) {
      actionPRecord.current.doctor = user.id;
      actionPRecord.current.opReadiness = "P";

      // Socket events
      emitDeleteRecord(actionPRecord.current.id, "Ready", socket, user, SCHEDULING_ROOM_ID);
      emitCreateRecord(actionPRecord.current, "ExceptReady", socket, SCHEDULING_ROOM_ID);

      // User and server events
      console.log(actionPRecord.current);

      await updateDbReadyFn(actionPRecord.current);
      createExceptReadyFn(actionPRecord.current);
    }
    handleCloseAssignModal();
  };

  return (
    <Dialog open={modalOpen} onClose={handleCloseAssignModal} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">시술 배정</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {charNumString}
          {patientNameString}
          {treatmentString} 시술을 진행하시겠습니까?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleConfirmAssign()} autoFocus>
          확인
        </Button>
        <Button onClick={handleCloseAssignModal}>취소</Button>
      </DialogActions>
    </Dialog>
  );
};

type ChangeStatusDialogProps = {
  deleteFn: UseMutateFunction<void, Error, string, void>;
  updateDbFn: UseMutateAsyncFunction<void, Error, PRecord, void>;
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  actionPRecord: MutableRefObject<PRecord | undefined>;
  socket: Socket | null;
};

export const ChangeStatusDialog: React.FC<ChangeStatusDialogProps> = ({ deleteFn, updateDbFn, modalOpen, setModalOpen, actionPRecord, socket }) => {
  const [opReadiness, setOpReadiness] = useState<OpReadiness | undefined>(actionPRecord.current?.opReadiness);
  const user = useRecoilValue(userState);
  const { mutate: createReadyPRecord } = useCreatePRecord("Ready_PRecord");
  console.log("ChangeStatusDialog", actionPRecord.current?.opReadiness);

  const handleCloseStatusChangeModal = () => {
    setModalOpen(false);
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
        deleteFn(actionPRecord.current.id);
        emitDeleteRecord(actionPRecord.current.id, tableType, socket, user, SCHEDULING_ROOM_ID);
        tableType = tableType === "Ready" ? "ExceptReady" : "Ready";
        createReadyPRecord(actionPRecord.current);
        emitCreateRecord(actionPRecord.current, tableType, socket, SCHEDULING_ROOM_ID);
      } else {
        actionPRecord.current.opReadiness = newStatus;
        await updateDbFn(actionPRecord.current);
        emitSaveRecord(actionPRecord.current, tableType, socket, SCHEDULING_ROOM_ID);
      }
    }
    handleCloseStatusChangeModal();
  };

  useEffect(() => {
    setOpReadiness(actionPRecord.current?.opReadiness);
  }, [modalOpen]);

  return (
    <Dialog open={modalOpen} onClose={handleCloseStatusChangeModal} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">상태 변경</DialogTitle>
      <DialogContent>
        <Box sx={{ gap: "1em", display: "flex", justifyContent: "center", alignItems: "center", padding: "10px 0px" }}>
          {OP_READINESS_ENTRIES.map((op) =>
            opReadiness !== op ? (
              <Chip
                key={op}
                onClick={() => {
                  setOpReadiness(op);
                }}
                sx={{ cursor: "pointer", transition: "transform 0.2s ease-in-out", "&:hover": { transform: "scale(1.1)" } }}
                label={op}
                color={getStatusChipColor(op)}
              />
            ) : (
              <CheckOutlinedIcon key={op} />
            )
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            handleConfirmStatusChange(opReadiness);
          }}
          autoFocus
        >
          확인
        </Button>
        <Button onClick={handleCloseStatusChangeModal}>취소</Button>
      </DialogActions>
    </Dialog>
  );
};

type DeleteRecordDialogProps = {
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  actionPRecord: MutableRefObject<PRecord | undefined>;
  deleteFn: UseMutateFunction<void, Error, string, void>;
  socket: Socket | null;
};

export const DeleteRecordDialog: React.FC<DeleteRecordDialogProps> = ({ modalOpen, setModalOpen, actionPRecord, deleteFn, socket }) => {
  const user = useRecoilValue(userState);

  const handleCloseModal = () => {
    setModalOpen(false);

    if (actionPRecord.current) {
      emitUnLockRecord(actionPRecord.current.id, getTableType(actionPRecord.current.opReadiness), socket, SCHEDULING_ROOM_ID);
    }
    actionPRecord.current = undefined;
  };
  const handleConfirmModal = async () => {
    if (actionPRecord.current) {
      const tableType = getTableType(actionPRecord.current.opReadiness);
      deleteFn(actionPRecord.current.id);
      emitDeleteRecord(actionPRecord.current.id, tableType, socket, user, SCHEDULING_ROOM_ID);
    }
    handleCloseModal();
  };
  return (
    <Dialog open={modalOpen} onClose={handleCloseModal} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">차트 삭제</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">차트번호 {actionPRecord.current?.chartNum}를 삭제하시겠습니까?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleConfirmModal()} autoFocus>
          확인
        </Button>
        <Button onClick={handleCloseModal}>취소</Button>
      </DialogActions>
    </Dialog>
  );
};

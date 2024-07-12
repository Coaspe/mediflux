import React, { MutableRefObject, useState } from "react";
import { TREATMENTS } from "shared";
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

type props = {
  handleCloseModal: () => void;
  handleConfirmModal: (newStatus?: OpReadiness) => Promise<void>;
  openModal: boolean;
  actionPRecord: MutableRefObject<PRecord | undefined>;
};

export const AssignmentDialog: React.FC<props> = ({ handleCloseModal, handleConfirmModal, actionPRecord, openModal }) => {
  const charNumString: string = `${actionPRecord.current?.chartNum && "["}${actionPRecord.current?.chartNum}${actionPRecord.current?.chartNum && ", "}`;
  const patientNameString: string = `${actionPRecord.current?.patientName}${actionPRecord.current?.patientName && ", "}`;
  const treatment = TREATMENTS.find((t) => t.id === actionPRecord.current?.treatment1)?.title;
  const treatmentString = treatment && `${treatment}]`;
  return (
    <Dialog open={openModal} onClose={handleCloseModal} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">시술 배정</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {charNumString}
          {patientNameString}
          {treatmentString} 시술을 진행하시겠습니까?
        </DialogContentText>
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

export const ChangeStatusDialog: React.FC<props> = ({ handleCloseModal, handleConfirmModal, actionPRecord, openModal }) => {
  const readinessArray: OpReadiness[] = ["Y", "N", "C", "P"];
  const [opReadiness, setOpReadiness] = useState<OpReadiness | undefined>(actionPRecord.current?.opReadiness);
  return (
    <Dialog open={openModal} onClose={handleCloseModal} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">상태 변경</DialogTitle>
      <DialogContent>
        <Box sx={{ gap: "1em", display: "flex", justifyContent: "center", alignItems: "center", padding: "10px 0px" }}>
          {readinessArray.map((op) =>
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
            handleConfirmModal(opReadiness);
          }}
          autoFocus
        >
          확인
        </Button>
        <Button onClick={handleCloseModal}>취소</Button>
      </DialogActions>
    </Dialog>
  );
};

export const DeleteRecordDialog: React.FC<props> = ({ handleCloseModal, handleConfirmModal, actionPRecord, openModal }) => {
  return (
    <Dialog open={openModal} onClose={handleCloseModal} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
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

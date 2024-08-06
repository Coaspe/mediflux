/** @format */

import { useRecoilState, useSetRecoilState } from "recoil";
import { sessionExpireModalOpenState, userState } from "~/recoil_state";
import { useNavigate } from "@remix-run/react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import DialogTitle from "@mui/material/DialogTitle";
import React, { MutableRefObject, RefObject, useEffect, useState } from "react";
import { PRecord, PRecordWithFocusedRow, SearchHelp } from "~/type";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { AgGridReact } from "ag-grid-react";
import { SCHEDULING_ROOM_ID, TREATMENTS } from "shared";
import dayjs from "dayjs";
import { updateRecord } from "~/utils/request.client";
import { emitSaveRecord } from "~/utils/Table/socket";
import { Socket } from "socket.io-client";

export const SessionExpiredModal = () => {
  const [open, setOpen] = useRecoilState(sessionExpireModalOpenState);
  const setUser = useSetRecoilState(userState);
  const navigator = useNavigate();

  const handleClose = () => {
    setUser(undefined);
    setOpen(false);
    navigator("/");
  };

  return (
    <div
      id="session-expired-modal"
      className={`${open ? "flex" : "hidden"} ${open ? "opacity-100" : "opacity-0"}`}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center" }}>
      <div className="flex flex-col" style={{ background: "white", padding: "20px", borderRadius: "5px" }}>
        <p>세션이 존재하지 않습니다. 다시 로그인해 주세요.</p>
        <button className="self-end " onClick={handleClose}>
          확인
        </button>
      </div>
    </div>
  );
};

type TreatmentComponentProps = {
  onClick: () => void;
  number: number;
  selectedTreatment: number | null;
  treatmentId: string;
};
const TreatmentComponent: React.FC<TreatmentComponentProps> = ({ onClick, number, selectedTreatment, treatmentId }) => {
  const [treatment, setTreatment] = useState<SearchHelp | undefined>();

  useEffect(() => {
    setTreatment(TREATMENTS.find((ele) => ele.id == treatmentId));
  }, []);

  return (
    treatment && (
      <Box
        onClick={onClick}
        className={`flex cursor-pointer border p-2 rounded-lg w-full items-center font-noto gap-2 transition-colors duration-200 ${
          selectedTreatment != null && selectedTreatment == number ? "bg-gray-300" : "hover:bg-gray-200"
        }`}>
        <Typography className="text-sm">{`시술${number}`}</Typography>
        <Divider sx={{ bgcolor: "grey" }} orientation="vertical" flexItem variant="middle" />
        <Typography>{treatment.title}</Typography>
      </Box>
    )
  );
};

type SetTreatmentReadyModalProps = {
  open: boolean;
  editingRowRef: MutableRefObject<PRecordWithFocusedRow | null>;
  gridRef: RefObject<AgGridReact<PRecord>>;
  handleClose: () => void;
  socket: Socket | null;
};
export const SetTreatmentReadyModal: React.FC<SetTreatmentReadyModalProps> = ({ open, handleClose, gridRef, editingRowRef, socket }) => {
  const [record, setRecord] = useState<PRecord | undefined>(undefined);
  const [selectedTreatment, setSelectedTreatment] = useState<number | null>(null);
  const [header, setHeader] = useState<string>();

  useEffect(() => {
    if (gridRef.current && editingRowRef.current) {
      const gridRecord = gridRef.current.api.getRowNode(editingRowRef.current.rowId);
      setRecord(gridRecord?.data);
      setHeader(() => {
        const data = gridRecord?.data;
        if (data?.patientName && data.chartNum) {
          return `${data?.patientName} - Chart #${data?.chartNum}`;
        } else if (data?.patientName) {
          return data?.patientName;
        } else if (data?.chartNum) {
          return data?.chartNum;
        }
        return "";
      });
    }
  }, [gridRef.current, editingRowRef.current]);

  const handleConfirm = async () => {
    try {
      if (!record || !selectedTreatment) return;
      const time = dayjs().unix();
      record[`treatmentReady${selectedTreatment}`] = time;
      record["opReadiness"] = "Y";
      const row = gridRef.current?.api.getRowNode(record.id);
      if (row && row.rowIndex !== null) {
        row?.updateData(record);
        gridRef.current?.api.startEditingCell({ rowIndex: row.rowIndex, colKey: "chartNum" });
        gridRef.current?.api.stopEditing(true);
      }
    } catch (error) {
    } finally {
      handleClose();
    }
  };

  const handleCancel = async () => {
    try {
      if (!record) return;
      record["opReadiness"] = editingRowRef.current?.opReadiness;
      console.log(record["opReadiness"]);

      record["lockingUser"] = null;
      gridRef.current?.api.applyTransaction({
        update: [record],
      });

      await updateRecord(record);
      emitSaveRecord([record], record["opReadiness"] === "Y" ? "Ready" : "ExceptReady", socket, SCHEDULING_ROOM_ID);
    } catch (error) {
    } finally {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">{"시술 준비 완료"}</DialogTitle>
      <DialogContent>
        <Box className="flex items-center gap-4 p-4 flex-col min-w-[300px]">
          <Box className="flex flex-col w-full">
            <Typography className="font-bold">{header}</Typography>
          </Box>
          {Array.from({ length: 5 }, (_, i) => i + 1).map(
            (number) =>
              record &&
              record[`treatment${number}`] && (
                <TreatmentComponent key={number} onClick={() => setSelectedTreatment(number)} number={number} treatmentId={record[`treatment${number}`]} selectedTreatment={selectedTreatment} />
              )
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>취소</Button>
        <Button disabled={selectedTreatment == null} onClick={handleConfirm} autoFocus>
          확인
        </Button>
      </DialogActions>
    </Dialog>
  );
};

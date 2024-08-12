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
import React, { RefObject, useEffect, useState } from "react";
import { PRecord, SearchHelp } from "~/type";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { AgGridReact } from "ag-grid-react";
import { TREATMENTS } from "shared";
import { OPREADINESS_P } from "~/constant";

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
  selectedTreatment: number | undefined;
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
        className={`flex cursor-pointer border p-2 rounded-lg w-full items-center font-noto gap-2 transition-colors duration-200 ${selectedTreatment == number ? "bg-gray-300" : "hover:bg-gray-200"}`}>
        <Typography className="text-sm">{`시술${number}`}</Typography>
        <Divider sx={{ bgcolor: "grey" }} orientation="vertical" flexItem variant="middle" />
        <Typography>{treatment.title}</Typography>
      </Box>
    )
  );
};

type SetTreatmentReadyModalProps = {
  open: boolean;
  selectedRow: PRecord;
  gridRef: RefObject<AgGridReact<PRecord>>;
  handleClose: () => void;
  handleConfirm: (record: PRecord | undefined, selectedTreatment: number | undefined) => void;
};
export const SetTreatmentReadyModal: React.FC<SetTreatmentReadyModalProps> = ({ open, handleClose, handleConfirm, gridRef, selectedRow }) => {
  const [selectedTreatment, setSelectedTreatment] = useState<number | undefined>();
  const [header, setHeader] = useState<string>();
  const [modalTitle, setModalTitle] = useState<string>("시술 준비 완료");

  useEffect(() => {
    setSelectedTreatment(undefined);
    if (gridRef.current) {
      if (selectedRow.opReadiness === OPREADINESS_P) {
        setModalTitle("시술 진행 완료");
      }

      setHeader(() => {
        if (selectedRow.patientName && selectedRow.chartNum) {
          return `${selectedRow.patientName} - Chart #${selectedRow.chartNum}`;
        } else if (selectedRow.patientName) {
          return selectedRow.patientName;
        } else if (selectedRow.chartNum) {
          return selectedRow.chartNum;
        }
        return "";
      });
    }
  }, [gridRef.current, selectedRow]);

  const handleCancel = async () => {
    try {
      const row = gridRef.current?.api.getRowNode(selectedRow.id);
      if (row && row.rowIndex !== null) {
        gridRef.current?.api.startEditingCell({ rowIndex: row.rowIndex, colKey: "chartNum" });
        gridRef.current?.api.stopEditing();
      }
    } catch (error) {
    } finally {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleCancel} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">{modalTitle}</DialogTitle>
      <DialogContent>
        <Box className="flex items-center gap-4 p-4 flex-col min-w-[300px]">
          <Box className="flex flex-col w-full">
            <Typography className="font-bold">{header}</Typography>
          </Box>
          {Array.from({ length: 5 }, (_, i) => i + 1).map(
            (number) =>
              selectedRow &&
              selectedRow[`treatment${number}`] &&
              ((selectedRow.opReadiness === "P" && selectedRow[`treatmentStart${number}`] && !selectedRow[`treatmentEnd${number}`]) ||
                (selectedRow.opReadiness !== "P" && !selectedRow[`treatmentReady${number}`])) && (
                <TreatmentComponent key={number} onClick={() => setSelectedTreatment(number)} number={number} treatmentId={selectedRow[`treatment${number}`]} selectedTreatment={selectedTreatment} />
              )
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>취소</Button>
        <Button
          disabled={selectedTreatment == null}
          onClick={() => {
            handleConfirm(selectedRow, selectedTreatment);
            const row = gridRef.current?.api.getRowNode(selectedRow.id);
            row &&
              gridRef.current?.api.refreshCells({
                force: true,
                rowNodes: [row],
                columns: [`treatment${selectedTreatment}`],
              });
          }}
          autoFocus>
          확인
        </Button>
      </DialogActions>
    </Dialog>
  );
};

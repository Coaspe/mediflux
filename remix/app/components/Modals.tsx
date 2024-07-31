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
import React, { MutableRefObject, useEffect, useState } from "react";
import { OpReadiness, PRecord } from "~/type";
import { OP_READINESS_ENTRIES } from "~/constant";
import { OpReadinessCell } from "./Table/ColumnRenderers";

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
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center" }}
    >
      <div className="flex flex-col" style={{ background: "white", padding: "20px", borderRadius: "5px" }}>
        <p>세션이 존재하지 않습니다. 다시 로그인해 주세요.</p>
        <button className="self-end " onClick={handleClose}>
          확인
        </button>
      </div>
    </div>
  );
};

type ChangeStatusModalProps = {
  recordRef: MutableRefObject<PRecord | null>;
  open: boolean;
  handleClose: () => void;
  handleComfirm: () => void;
};
export const ChangeStatusModal: React.FC<ChangeStatusModalProps> = ({ recordRef, open, handleClose, handleComfirm }) => {
  const [status, setStatus] = useState<OpReadiness | undefined>(recordRef.current?.opReadiness);
  const [treatmentsVisible, setTreatmentVisible] = useState(false);

  useEffect(() => {
    setStatus(recordRef.current?.opReadiness);
  }, [recordRef.current]);

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">{"상태 변경"}</DialogTitle>
      <DialogContent>
        <Box className="flex items-center gap-4 p-4">
          {OP_READINESS_ENTRIES.map((op) => (
            <button onClick={() => setStatus(op)} key={op}>
              {op !== status ? <OpReadinessCell value={op} /> : <span>???</span>}
            </button>
          ))}
        </Box>
        <Box></Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Disagree</Button>
        <Button onClick={handleClose} autoFocus>
          Agree
        </Button>
      </DialogActions>
    </Dialog>
  );
};

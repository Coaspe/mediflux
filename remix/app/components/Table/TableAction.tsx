/** @format */

import { AgGridReact } from "ag-grid-react";
import { PRecord, TableType } from "../../type";
import { FC, RefObject, useState } from "react";
import { SCHEDULING_ROOM_ID } from "shared";
import { emitCreateRecords, emitDeleteRecords } from "~/utils/Table/socket";
import { Socket } from "socket.io-client";
import { getAllRecords, hideRecords, insertRecords } from "~/utils/request.client";
import { convertServerPRecordtToPRecord } from "~/utils/utils";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { globalSnackbarState, userState } from "~/recoil_state";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

type TableActionHeader = {
  gridRef: RefObject<AgGridReact<PRecord>>;
  tableType: TableType;
  socket: Socket | null;
};

export const TableAction: FC<TableActionHeader> = ({ gridRef, socket, tableType }) => {
  const user = useRecoilValue(userState);
  const [selectedRows, setSeletedRows] = useState<string[]>([]);
  const setGlobalSnackBar = useSetRecoilState(globalSnackbarState);

  const onAddRecord = async () => {
    if (gridRef.current) {
      let newRecord = { opReadiness: tableType === "ExceptReady" ? "N" : "Y" } as PRecord;

      const { rows } = await insertRecords([newRecord]);

      if (rows.length > 0) {
        newRecord = convertServerPRecordtToPRecord(rows[0]);
        gridRef.current.api.applyTransaction({
          add: [newRecord],
          addIndex: 0,
        });
        emitCreateRecords([newRecord], tableType, socket, SCHEDULING_ROOM_ID);
      }
    }
  };

  const onDeleteRecord = async (ids: string[]) => {
    try {
      if (gridRef.current && ids.length > 0) {
        const records = gridRef.current.api.getSelectedRows();

        const result = await hideRecords(ids);

        if (result.status === 200) {
          gridRef.current.api.applyTransaction({
            remove: records,
          });
          emitDeleteRecords(
            records.map((ele) => ele.id),
            tableType,
            socket,
            user,
            SCHEDULING_ROOM_ID
          );
        } else {
          setGlobalSnackBar({ open: true, msg: "서버 오류", severity: "error" });
        }
      } else {
        throw Error("Internal server error");
      }
    } catch (error: any) {
      setGlobalSnackBar({ open: true, msg: error.message, severity: "error" });
    }
    handleCloseDeleteModal();
  };

  const onGetAllRecords = async () => {
    const results = await getAllRecords();
    return results.data.records.rows;
  };

  const [open, setOpen] = useState(false);
  const handleCloseDeleteModal = () => setOpen(false);
  const handleOpenDeleteModal = () => {
    if (gridRef.current) {
      const records = gridRef.current.api.getSelectedRows();
      setSeletedRows(records.map((records) => records.id));
      setOpen(true);
    }
  };

  return (
    <div>
      <Button onClick={onAddRecord}>추가</Button>
      <Button onClick={handleOpenDeleteModal}>삭제</Button>
      <Dialog open={open} onClose={handleCloseDeleteModal} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{"레코드 삭제"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{selectedRows?.length}개의 레코드를 삭제하시겠습니까?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteModal}>취소</Button>
          <Button onClick={async () => await onDeleteRecord(selectedRows)} autoFocus>
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

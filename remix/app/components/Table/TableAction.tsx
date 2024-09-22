/** @format */

import { CustomAgGridReactProps, TableType } from "../../types/type";
import { FC, RefObject, useState, useCallback } from "react";
import { OpReadiness, PRecord, SCHEDULING_ROOM_ID } from "shared";
import { emitCreateRecords, emitDeleteRecords, emitSaveRecord } from "~/utils/Table/socket";
import { hideRecords, insertRecords, lockOrUnlockRecords } from "~/utils/request.client";
import { convertServerPRecordToPRecord } from "~/utils/utils";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { globalSnackbarState, userState } from "~/recoil_state";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Socket } from "socket.io-client";
import IconButton from "@mui/material/IconButton";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
type TableActionHeader = {
  gridRef: RefObject<CustomAgGridReactProps<PRecord>>;
  tableType: TableType;
  socket: Socket | null;
};

export const TableAction: FC<TableActionHeader> = ({ gridRef, socket, tableType }) => {
  const user = useRecoilValue(userState);
  const setGlobalSnackBar = useSetRecoilState(globalSnackbarState);

  const [selectedRows, setSelectedRows] = useState<PRecord[]>([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const showErrorSnackbar = useCallback(
    (message: string, severity: "error" | "info" | "success" | "warning" = "error") => {
      setGlobalSnackBar({ open: true, msg: message, severity });
    },
    [setGlobalSnackBar]
  );

  const onAddRecord = async () => {
    if (!gridRef.current || !user) return;

    const newRecord = { opReadiness: tableType === "ExceptReady" ? OpReadiness.N : OpReadiness.Y } as PRecord;
    const {
      statusCode,
      body: { data, error },
    } = await insertRecords([newRecord], user.clinic, window.ENV.FRONT_BASE_URL);

    if (statusCode === 200) {
      const row = data.rows[0];
      const addedRecord = convertServerPRecordToPRecord(row);
      gridRef.current.api.applyTransaction({ add: [addedRecord], addIndex: 0 });
      emitCreateRecords([addedRecord], tableType, socket, user.clinic + SCHEDULING_ROOM_ID);
    } else {
      error && showErrorSnackbar(error);
    }
  };

  const onDeleteRecord = async () => {
    if (!user) return;
    if (!gridRef.current || !selectedRows.length) throw new Error("삭제할 레코드가 선택되지 않았습니다.");
    const ids = selectedRows.map((record) => record.id);
    const result = await hideRecords(ids, user.clinic, window.ENV.FRONT_BASE_URL);

    if (result.statusCode === 200) {
      gridRef.current.api.applyTransaction({
        remove: selectedRows,
      });
      emitDeleteRecords(ids, tableType, socket, user, user.clinic + SCHEDULING_ROOM_ID);
    } else {
      result.body.error && showErrorSnackbar(result.body.error);
    }

    handleCloseDeleteModal();
  };
  const handleOpenDeleteModal = async () => {
    if (!gridRef.current || !user) return;

    const records = gridRef.current.api.getSelectedRows();

    if (records.length === 0) {
      throw new Error("삭제할 레코드가 선택되지 않았습니다.");
    }

    setSelectedRows(records);
    const result = await lockOrUnlockRecords(
      records.map((record) => record.id),
      user.id,
      user.clinic,
      window.ENV.FRONT_BASE_URL
    );
    if (result.statusCode === 200) {
      emitSaveRecord(result.body.data.rows.map(convertServerPRecordToPRecord), tableType, socket, user.clinic + SCHEDULING_ROOM_ID);
      setOpenDeleteModal(true);
    } else {
      result.body.error && showErrorSnackbar(result.body.error);
    }
  };
  const handleCloseDeleteModal = useCallback(async () => {
    if (selectedRows.length && user) {
      const result = await lockOrUnlockRecords(
        selectedRows.map((record) => record.id),
        null,
        user.clinic,
        window.ENV.FRONT_BASE_URL
      );
      if (result.statusCode === 200) {
        emitSaveRecord(result.body.data.rows.map(convertServerPRecordToPRecord), tableType, socket, user.clinic + SCHEDULING_ROOM_ID);
      } else {
        result.body.error && showErrorSnackbar(result.body.error);
      }
    }
    setOpenDeleteModal(false);
  }, [selectedRows, user, tableType, socket]);

  return (
    <>
      {tableType === "ExceptReady" && (
        <>
          <Box className="flex gap-2 items-center justify-between w-fit">
            <IconButton onClick={onAddRecord}>
              <AddCircleIcon />
            </IconButton>
            <IconButton onClick={handleOpenDeleteModal}>
              <DeleteIcon />
            </IconButton>
          </Box>
          <Dialog open={openDeleteModal} onClose={handleCloseDeleteModal}>
            <DialogTitle>{"레코드 삭제"}</DialogTitle>
            <DialogContent>
              <DialogContentText>{selectedRows.length}개의 레코드를 삭제하시겠습니까?</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDeleteModal}>취소</Button>
              <Button onClick={onDeleteRecord} autoFocus>
                확인
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </>
  );
};

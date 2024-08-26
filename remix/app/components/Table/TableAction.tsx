/** @format */

import { CustomAgGridReactProps, PRecord, SearchHelp, TableType } from "../../type";
import { FC, RefObject, useState, useCallback } from "react";
import { SCHEDULING_ROOM_ID } from "shared";
import { emitCreateRecords, emitDeleteRecords, emitSaveRecord } from "~/utils/Table/socket";
import { hideRecords, insertRecords, lockOrUnlockRecords } from "~/utils/request.client";
import { convertServerPRecordtToPRecord } from "~/utils/utils";
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
import { TEST_TAG } from "~/constant";
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
    try {
      if (!gridRef.current) return;

      const newRecord = { opReadiness: tableType === "ExceptReady" ? "N" : "Y" } as PRecord;
      const { rows } = await insertRecords([newRecord], TEST_TAG);
      console.log(rows);

      if (rows?.length) {
        const addedRecord = convertServerPRecordtToPRecord(rows[0]);
        gridRef.current.api.applyTransaction({ add: [addedRecord], addIndex: 0 });
        emitCreateRecords([addedRecord], tableType, socket, SCHEDULING_ROOM_ID);
      }
    } catch (error) {
      showErrorSnackbar("레코드 추가 중 오류가 발생했습니다.");
    }
  };

  const onDeleteRecord = async () => {
    try {
      if (!gridRef.current || !selectedRows.length) throw new Error("삭제할 레코드가 선택되지 않았습니다.");
      const ids = selectedRows.map((record) => record.id);
      const result = await hideRecords(ids, TEST_TAG);

      if (result.status === 200) {
        gridRef.current.api.applyTransaction({
          remove: selectedRows,
        });
        emitDeleteRecords(ids, tableType, socket, user, SCHEDULING_ROOM_ID);
      } else {
        throw new Error("서버 오류로 레코드를 삭제할 수 없습니다.");
      }
    } catch (error: any) {
      showErrorSnackbar(error.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      handleCloseDeleteModal();
    }
  };
  const handleOpenDeleteModal = async () => {
    if (!gridRef.current || !user) return;

    try {
      const records = gridRef.current.api.getSelectedRows();

      if (records.length === 0) {
        throw new Error("삭제할 레코드가 선택되지 않았습니다.");
      }

      const ids = records.map((record) => record.id);
      setSelectedRows(records);

      const result = await lockOrUnlockRecords(ids, user.id, TEST_TAG);
      if (result.status === 200) {
        emitSaveRecord(result.data.map(convertServerPRecordtToPRecord), tableType, socket, SCHEDULING_ROOM_ID);
        setOpenDeleteModal(true);
      }
    } catch (error: any) {
      showErrorSnackbar(error.message || "알 수 없는 오류가 발생했습니다.");
    }
  };
  const handleCloseDeleteModal = useCallback(async () => {
    try {
      if (selectedRows.length && user) {
        const result = await lockOrUnlockRecords(
          selectedRows.map((record) => record.id),
          null,
          TEST_TAG
        );
        if (result.status === 200) {
          emitSaveRecord(result.data.map(convertServerPRecordtToPRecord), tableType, socket, SCHEDULING_ROOM_ID);
        }
      }
    } catch (error) {
    } finally {
      setOpenDeleteModal(false);
    }
  }, [selectedRows, user, tableType, socket]);

  return (
    <>
      {tableType === "ExceptReady" && (
        <>
          <Box className="flex justify-between items-center w-fit gap-2">
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

import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Paper from "@mui/material/Paper";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { RefObject, useState, useCallback } from "react";
import { useRecoilValue } from "recoil";
import { PRecord, OpReadiness, SCHEDULING_ROOM_ID } from "shared";
import { Socket } from "socket.io-client";
import { userState } from "~/recoil_state";
import { MenuPosition, CustomAgGridReactProps, TableType } from "~/types/type";
import { useGlobalSnackbar } from "~/utils/hook";
import { insertRecords, hideRecords, lockOrUnlockRecords } from "~/utils/request.client";
import { emitCreateRecords, emitDeleteRecords, emitSaveRecord } from "~/utils/Table/socket";
import { convertServerPRecordToPRecord } from "~/utils/utils";

const CustomContextMenu = ({
  position,
  onClose,
  isOpen,
  gridRef,
  tableType,
  socket,
}: {
  position: MenuPosition;
  onClose: any;
  isOpen: boolean;
  gridRef: RefObject<CustomAgGridReactProps<PRecord>>;
  tableType: TableType;
  socket: Socket | null;
}) => {
  const user = useRecoilValue(userState);
  const showErrorSnackbar = useGlobalSnackbar();
  const [selectedRows, setSelectedRows] = useState<PRecord[]>([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const handleAddRecord = async () => {
    onClose();
    if (!gridRef.current || !user) return;

    const focusedRow = gridRef.current.api.getFocusedCell();
    console.log(focusedRow);

    const index = focusedRow?.rowIndex ?? 0;

    // const newRecord = { opReadiness: tableType === "ExceptReady" ? OpReadiness.N : OpReadiness.Y } as PRecord;
    const newRecord = { opReadiness: OpReadiness.N } as PRecord;
    const {
      statusCode,
      body: { data, error },
    } = await insertRecords([newRecord], user.clinic, window.ENV.FRONT_BASE_URL);

    if (statusCode === 200) {
      const row = data.rows[0];
      const addedRecord = convertServerPRecordToPRecord(row);
      gridRef.current.api.applyTransaction({ add: [addedRecord], addIndex: index });
      emitCreateRecords([addedRecord], tableType, socket, user.clinic + SCHEDULING_ROOM_ID, index);
    } else {
      error && showErrorSnackbar(error);
    }
  };

  const handleDeleteRecord = async () => {
    if (!user) return;
    const ids = selectedRows.map((record) => record.id);
    const result = await hideRecords(ids, user.clinic, window.ENV.FRONT_BASE_URL);

    if (result.statusCode === 200 && gridRef.current) {
      gridRef.current.api.applyTransaction({
        remove: selectedRows,
      });
      emitDeleteRecords(ids, tableType, socket, user, user.clinic + SCHEDULING_ROOM_ID);
    } else {
      result.body.error && showErrorSnackbar(result.body.error);
    }

    setSelectedRows([]);
    setOpenDeleteModal(false);
  };

  const handleOpenDeleteModal = async () => {
    onClose();

    if (!gridRef.current || !user) return;

    const focusedRowIndex = gridRef.current.api.getFocusedCell()?.rowIndex;
    if (focusedRowIndex) {
      gridRef.current.api.getDisplayedRowAtIndex(focusedRowIndex)?.setSelected(true);
    }
    const records = gridRef.current.api.getSelectedRows();

    if (records.length === 0) {
      showErrorSnackbar("삭제할 레코드가 선택되지 않았습니다.");
      return;
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
    if (selectedRows.length > 0 && user) {
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
    setSelectedRows([]);
    setOpenDeleteModal(false);
  }, [selectedRows, user, tableType, socket]);

  // 한 개의 로우를 복사하는 기능
  const handleCopyRow = async () => {
    onClose();
    if (!gridRef.current || !user) return;

    const focusedRow = gridRef.current.api.getFocusedCell();

    if (!focusedRow) {
      showErrorSnackbar("복사할 레코드가 선택되지 않았습니다.");
      return;
    }

    const record = gridRef.current.api.getDisplayedRowAtIndex(focusedRow.rowIndex)?.data;
    const index = focusedRow.rowIndex;

    if (!record) return;

    const result = await insertRecords([record], user.clinic, window.ENV.FRONT_BASE_URL);
    if (result.statusCode === 200) {
      const converted = result.body.data.rows.map(convertServerPRecordToPRecord);

      gridRef.current.api.applyTransaction({
        add: converted,
        addIndex: index,
      });
      emitCreateRecords(converted, tableType, socket, user.clinic + SCHEDULING_ROOM_ID, index);
    } else {
      result.body.error && showErrorSnackbar(result.body.error);
    }
  };

  return (
    <>
      <Paper
        className={`context-menu slide-down ${isOpen ? "block" : "hidden"}`}
        style={{
          top: position.y,
          left: position.x,
        }}
      >
        <MenuList>
          <MenuItem onClick={handleAddRecord}>
            <ListItemIcon>
              <AddCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>추가</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleOpenDeleteModal}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>삭제</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleCopyRow}>
            <ListItemIcon>
              <ContentCopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>복제</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleCopyRow}>
            <ListItemIcon>
              <ContentCopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>복제</ListItemText>
          </MenuItem>
        </MenuList>
      </Paper>

      <Dialog open={openDeleteModal} onClose={handleCloseDeleteModal}>
        <DialogTitle>{"레코드 삭제"}</DialogTitle>
        <DialogContent>
          <DialogContentText>{selectedRows.length}개의 레코드를 삭제하시겠습니까?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteModal}>취소</Button>
          <Button onClick={handleDeleteRecord} autoFocus>
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CustomContextMenu;

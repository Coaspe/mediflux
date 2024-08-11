import { AgGridReact } from "ag-grid-react";
import { PRecord, PRecordWithFocusedRow, SearchHelp, TableType } from "../../type";
import { FC, RefObject, useState, useCallback, MutableRefObject } from "react";
import { SCHEDULING_ROOM_ID, TREATMENTS } from "shared";
import { emitCreateRecords, emitDeleteRecords, emitSaveRecord } from "~/utils/Table/socket";
import { hideRecords, insertRecords, lockOrUnlockRecords } from "~/utils/request.client";
import { convertServerPRecordtToPRecord } from "~/utils/utils";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { globalSnackbarState, userState } from "~/recoil_state";
import { OPREADINESS_P } from "~/constant";
import dayjs from "dayjs";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Socket } from "socket.io-client";
import { SetTreatmentReadyModal } from "../Modals";

type TableActionHeader = {
  gridRef: RefObject<AgGridReact<PRecord>>;
  tableType: TableType;
  socket: Socket | null;
  editingRowRef: MutableRefObject<PRecordWithFocusedRow | null>;
};

interface ReadyTreatment extends SearchHelp {
  number: number;
}

export const TableAction: FC<TableActionHeader> = ({ gridRef, socket, tableType, editingRowRef }) => {
  const user = useRecoilValue(userState);
  const setGlobalSnackBar = useSetRecoilState(globalSnackbarState);

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [assignRecord, setAssignRecord] = useState<PRecord | null>(null);
  const [readyTreatment, setReadyTreatment] = useState<ReadyTreatment | null>(null);
  const [setTreatmentReadyModalOpen, setSetTreatmentReadyModalOpen] = useState(false);

  const showErrorSnackbar = useCallback(
    (message: string) => {
      setGlobalSnackBar({ open: true, msg: message, severity: "error" });
    },
    [setGlobalSnackBar]
  );

  const onAddRecord = async () => {
    try {
      if (!gridRef.current) return;

      const newRecord = { opReadiness: tableType === "ExceptReady" ? "N" : "Y" } as PRecord;
      const { rows } = await insertRecords([newRecord]);

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

      const records = gridRef.current.api.getSelectedRows();
      const result = await hideRecords(selectedRows);

      if (result.status === 200) {
        gridRef.current.api.applyTransaction({ remove: records });
        emitDeleteRecords(selectedRows, tableType, socket, user, SCHEDULING_ROOM_ID);
      } else {
        showErrorSnackbar("서버 오류로 레코드를 삭제할 수 없습니다.");
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
      const ids = records.map((record) => record.id);
      setSelectedRows(ids);

      const result = await lockOrUnlockRecords(ids, user.id);
      if (result.status === 200) {
        emitSaveRecord(result.data.map(convertServerPRecordtToPRecord), tableType, socket, SCHEDULING_ROOM_ID);
        setOpen(true);
      }
    } catch {
      showErrorSnackbar("서버 오류로 레코드를 잠글 수 없습니다.");
    }
  };

  const handleCloseDeleteModal = useCallback(async () => {
    if (selectedRows.length && user) {
      const result = await lockOrUnlockRecords(selectedRows, null);
      if (result.status === 200) {
        emitSaveRecord(result.data.map(convertServerPRecordtToPRecord), tableType, socket, SCHEDULING_ROOM_ID);
      }
    }
    setOpen(false);
  }, [selectedRows, user, tableType, socket]);

  const handleOpenAssignModal = () => {
    if (!gridRef.current) return;

    try {
      const records = gridRef.current.api.getSelectedRows();
      if (records.length !== 1) {
        showErrorSnackbar(records.length ? "하나의 시술만 선택해주세요." : "시술만 선택해주세요.");
        return;
      }

      const record = records[0];
      setAssignRecord(record);

      const treatmentNumber = getReadyTreatmentNumber(record);
      const treatment = TREATMENTS.find((t) => t.id === record[`treatment${treatmentNumber}`]);
      if (treatmentNumber > 0 && treatment) {
        setReadyTreatment({ number: treatmentNumber, ...treatment });
        setOpenAssignModal(true);
      }
    } catch {
      showErrorSnackbar("서버 오류로 시술을 배정할 수 없습니다.");
    }
  };

  const getReadyTreatmentNumber = (record: PRecord): number => {
    for (let i = 1; i <= 5; i++) {
      if (record[`treatmentReady${i}`] && !record[`treatmentEnd${i}`]) return i;
    }
    return -1;
  };

  const handleCloseAssignModal = () => setOpenAssignModal(false);

  const onAssignRecord = async () => {
    if (!readyTreatment || !assignRecord || !gridRef.current || !user) return;

    try {
      assignRecord.opReadiness = OPREADINESS_P;
      assignRecord[`treatmentStart${readyTreatment.number}`] = dayjs().unix();
      assignRecord.doctor = user.id;

      const rowNode = gridRef.current.api.getRowNode(assignRecord.id);
      if (rowNode && rowNode.rowIndex !== null) {
        rowNode.updateData(assignRecord);
        gridRef.current.api.startEditingCell({ rowIndex: rowNode.rowIndex, colKey: "chartNum" });
        gridRef.current.api.stopEditing();
      }
    } catch {
      showErrorSnackbar("시술 배정 중 오류가 발생했습니다.");
    } finally {
      handleCloseAssignModal();
    }
  };
  const handleCloseSetTreatmentReadyModal = () => {
    setSetTreatmentReadyModalOpen(false);
  };
  const handleOpenSetTreatmentReadyModal = () => {
    setSetTreatmentReadyModalOpen(true);
  };

  const handleConfirmReady = async (record: PRecord | undefined, selectedTreatment: number | undefined) => {
    try {
      if (!record || !selectedTreatment) return;
      const time = dayjs().unix();

      if (record.opReadiness === "Y") {
        record[`treatmentReady${selectedTreatment}`] = time;
      } else if (record.opReadiness === "C") {
        record[`treatmentEnd${selectedTreatment}`] = time;
      } else {
        return;
      }

      const row = gridRef.current?.api.getRowNode(record.id);
      if (row && row.rowIndex !== null) {
        row?.updateData(record);
        gridRef.current?.api.startEditingCell({ rowIndex: row.rowIndex, colKey: "chartNum" });
        gridRef.current?.api.stopEditing();
      }
    } catch (error) {
    } finally {
      handleCloseSetTreatmentReadyModal();
    }
  };
  return (
    <div>
      <Button onClick={onAddRecord}>추가</Button>
      <Button onClick={handleOpenDeleteModal}>삭제</Button>
      {tableType === "Ready" && <Button onClick={handleOpenAssignModal}>시술 진행</Button>}
      {tableType === "ExceptReady" && <Button onClick={handleOpenSetTreatmentReadyModal}>시술 준비 완료</Button>}

      <Dialog open={open} onClose={handleCloseDeleteModal}>
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

      {tableType === "Ready" && (
        <Dialog open={openAssignModal} onClose={handleCloseAssignModal}>
          <DialogTitle>{"시술 진행"}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {assignRecord?.chartNum} - {assignRecord?.patientName} - {readyTreatment?.title}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAssignModal}>취소</Button>
            <Button onClick={onAssignRecord} autoFocus>
              확인
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {tableType === "ExceptReady" && (
        <SetTreatmentReadyModal
          open={setTreatmentReadyModalOpen}
          handleClose={handleCloseSetTreatmentReadyModal}
          gridRef={gridRef}
          editingRowRef={editingRowRef}
          socket={socket}
          handleConfirm={handleConfirmReady}
        />
      )}
    </div>
  );
};

import { Box, Button } from "@mui/joy";
import { UseMutateAsyncFunction, UseMutateFunction } from "@tanstack/react-query";
import { useState, MutableRefObject, Dispatch, SetStateAction, useEffect } from "react";
import { TREATEMENTS } from "shared";
import { Socket } from "socket.io-client";
import { OpReadiness, PRecord, TableType, User } from "~/type";
import { emitUnLockRecord, emitDeleteRecord, emitCreateRecord, emitSaveRecord } from "~/utils/Table/socket";
import { getTableType } from "~/utils/utils";
import { getStatusChipColor } from "./Table/ColumnRenderers";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import Chip from '@mui/material/Chip';

interface Props {
    socket: Socket | null
    user: User
    dbUpdateFnMapping: Record<TableType, UseMutateAsyncFunction<void, Error, PRecord, void>>
    dbDeleteFnMapping: Record<TableType, UseMutateAsyncFunction<void, Error, string, void>>
    deleteFnMapping: Record<TableType, UseMutateFunction<void, Error, string, void>>
    createFnMapping: Record<TableType, UseMutateFunction<void, Error, PRecord, void>>
    setModalOpen: Dispatch<SetStateAction<boolean>>
    modalOpen: boolean
    actionPRecord: MutableRefObject<PRecord | undefined>
}

export const AssignmentDialog: React.FC<Props> = ({ socket, user, dbUpdateFnMapping, createFnMapping, setModalOpen, modalOpen, actionPRecord }) => {
    const handleCloseAssignModal = () => {
        setModalOpen(false);
        if (actionPRecord.current) {
            emitUnLockRecord(
                actionPRecord.current.id,
                getTableType(actionPRecord.current.opReadiness),
                socket
            );
        }
        console.log(actionPRecord);
        actionPRecord.current = undefined;
    };
    const handleConfirmAssign = async () => {
        if (actionPRecord.current) {
            actionPRecord.current.doctor = user.id;
            actionPRecord.current.opReadiness = "P";
            emitDeleteRecord(actionPRecord.current.id, "Ready", socket, user);
            emitCreateRecord(actionPRecord.current, "ExceptReady", socket);
            await dbUpdateFnMapping["Ready"](actionPRecord.current);
            createFnMapping["ExceptReady"](actionPRecord.current);
        }
        handleCloseAssignModal();
    };


    const charNumString: string = `${actionPRecord.current?.chartNum}${actionPRecord.current?.chartNum && ', '}`
    const patientNameString: string = `${actionPRecord.current?.patientName}${actionPRecord.current?.patientName && ', '}`
    const treatment = TREATEMENTS.find((t) => t.id === actionPRecord.current?.treatment1)?.title
    const treatmentString = treatment && `${treatment} `
    return (
        <Dialog
            open={modalOpen}
            onClose={handleCloseAssignModal}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">시술 배정</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {charNumString}
                    {patientNameString}
                    {treatmentString}
                    시술을 진행하시겠습니까?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleConfirmAssign} autoFocus>
                    확인
                </Button>
                <Button onClick={handleCloseAssignModal}>취소</Button>
            </DialogActions>
        </Dialog>
    );
};

export const DeleteRecordDialog: React.FC<Props> = ({ socket, user, dbDeleteFnMapping, actionPRecord }) => {
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    const handleCloseDeleteModal = () => {
        setOpenDeleteModal(false);

        if (actionPRecord.current) {
            emitUnLockRecord(
                actionPRecord.current.id,
                getTableType(actionPRecord.current.opReadiness),
                socket
            );
        }
        actionPRecord.current = undefined;
    };
    const handleConfirmDelete = async () => {
        if (actionPRecord.current) {
            const tableType = getTableType(actionPRecord.current.opReadiness);
            await dbDeleteFnMapping[tableType](actionPRecord.current.id);
            emitDeleteRecord(actionPRecord.current.id, tableType, socket, user);
        }
        handleCloseDeleteModal();
    };
    return (
        <Dialog
            open={openDeleteModal}
            onClose={handleCloseDeleteModal}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">차트 삭제</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    차트번호 {actionPRecord.current?.chartNum}를 삭제하시겠습니까?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleConfirmDelete} autoFocus>
                    확인
                </Button>
                <Button onClick={handleCloseDeleteModal}>취소</Button>
            </DialogActions>
        </Dialog>
    );
};

export const ChangeStatusDialog: React.FC<Props> = ({ deleteFnMapping, createFnMapping, socket, user, dbUpdateFnMapping, setModalOpen, modalOpen, actionPRecord }) => {
    const readinessArray: OpReadiness[] = ['Y', 'N', 'C', 'P'];
    const [opReadiness, setOpReadiness] = useState<OpReadiness | undefined>(actionPRecord.current?.opReadiness)
    const handleCloseStatusChangeModal = (actionPRecord: MutableRefObject<PRecord | undefined>, setOpenChangeStatusModal: Dispatch<SetStateAction<boolean>>, socket: Socket | null) => {
        setOpenChangeStatusModal(false)
        if (actionPRecord.current) {
            emitUnLockRecord(
                actionPRecord.current.id,
                getTableType(actionPRecord.current.opReadiness),
                socket
            );
        }
        actionPRecord.current = undefined;
    }
    const handleConfirmStatusChange = async (newStatus?: OpReadiness) => {
        if (actionPRecord.current && actionPRecord.current.opReadiness !== newStatus) {
            let tableType = getTableType(actionPRecord.current.opReadiness);
            if (actionPRecord.current.opReadiness === 'Y' || newStatus === 'Y') {
                actionPRecord.current.opReadiness = newStatus
                // need api call to update db
                deleteFnMapping[tableType](actionPRecord.current.id)
                emitDeleteRecord(actionPRecord.current.id, tableType, socket, user)
                tableType = tableType === 'Ready' ? 'ExceptReady' : 'Ready'
                createFnMapping[tableType](actionPRecord.current)
                emitCreateRecord(actionPRecord.current, tableType, socket)
            } else {
                actionPRecord.current.opReadiness = newStatus
                await dbUpdateFnMapping[tableType](actionPRecord.current)
                emitSaveRecord(actionPRecord.current, tableType, socket)
            }
        }
        handleCloseStatusChangeModal(actionPRecord, setModalOpen, socket);
    }

    return (
        <Dialog
            open={modalOpen}
            onClose={() => { handleCloseStatusChangeModal(actionPRecord, setModalOpen, socket) }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">상태 변경</DialogTitle>
            <DialogContent>
                <Box sx={{ gap: '1em', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: "10px 0px" }}>
                    {readinessArray.map((op) => opReadiness !== op ? <Chip key={op} onClick={() => { setOpReadiness(op) }}
                        sx={{ cursor: "pointer", transition: 'transform 0.2s ease-in-out', '&:hover': { transform: 'scale(1.1)' }, }}
                        label={op} color={getStatusChipColor(op)} /> : <CheckOutlinedIcon key={op} />)}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => { handleConfirmStatusChange(opReadiness) }} autoFocus>
                    확인
                </Button>
                <Button onClick={() => { handleCloseStatusChangeModal(actionPRecord, setModalOpen, socket) }}>취소</Button>
            </DialogActions>
        </Dialog>
    );
};

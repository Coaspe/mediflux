// import { Button } from "@mui/joy";
// import Dialog from "@mui/material/Dialog";
// import DialogActions from "@mui/material/DialogActions";
// import DialogContent from "@mui/material/DialogContent";
// import DialogContentText from "@mui/material/DialogContentText";
// import DialogTitle from "@mui/material/DialogTitle";
// import { UseMutateAsyncFunction, UseMutateFunction } from "@tanstack/react-query";
// import { MRT_Row } from "material-react-table";
// import { useState, useRef } from "react";
// import { TREATEMENTS } from "shared";
// import { Socket } from "socket.io-client";
// import { PRecord, TableType, User } from "~/type";
// import { emitLockRecord, emitUnLockRecord, emitDeleteRecord, emitCreateRecord } from "~/utils/Table/socket";
// import { getTableType } from "~/utils/utils";

// interface AssignmentProps {
//     socket: Socket
//     user: User
//     dbUpdateFnMapping: Record<TableType, UseMutateFunction<void, Error, PRecord, void>>
//     createFnMapping: Record<TableType, UseMutateAsyncFunction<void, Error, PRecord, void>>
// }

// const AssignmentDialog: React.FC<AssignmentProps> = ({ socket, user, dbUpdateFnMapping, createFnMapping }) => {
//     const [openAssignModal, setOpenAssignModal] = useState(false);
//     const actionPRecord = useRef<PRecord>();

//     const handleOpenAssignModal = (row: MRT_Row<PRecord>) => {
//         setOpenAssignModal(true);
//         actionPRecord.current = JSON.parse(JSON.stringify(row.original));
//         if (actionPRecord.current) {
//             emitLockRecord(
//                 actionPRecord.current.id,
//                 getTableType(actionPRecord.current.opReadiness),
//                 socket,
//                 user
//             );
//         }
//     };
//     const handleCloseAssignModal = () => {
//         setOpenAssignModal(false);
//         if (actionPRecord.current) {
//             emitUnLockRecord(
//                 actionPRecord.current.id,
//                 getTableType(actionPRecord.current.opReadiness),
//                 socket
//             );
//         }
//         actionPRecord.current = undefined;
//     };
//     const handleConfirmAssign = async () => {
//         if (actionPRecord.current) {
//             actionPRecord.current.doctor = user.id;
//             actionPRecord.current.opReadiness = "P";
//             emitDeleteRecord(actionPRecord.current.id, "Ready", socket, user);
//             emitCreateRecord(actionPRecord.current, "ExceptReady", socket);
//             await dbUpdateFnMapping["Ready"](actionPRecord.current);
//             createFnMapping["ExceptReady"](actionPRecord.current);
//         }
//         handleCloseAssignModal();
//     };

//     return (
//         <Dialog
//             open={openAssignModal}
//             onClose={handleCloseAssignModal}
//             aria-labelledby="alert-dialog-title"
//             aria-describedby="alert-dialog-description"
//         >
//             <DialogTitle id="alert-dialog-title">시술 배정</DialogTitle>
//             <DialogContent>
//                 <DialogContentText id="alert-dialog-description">
//                     {actionPRecord.current?.chartNum},{" "}
//                     {actionPRecord.current?.patientName},{" "}
//                     {
//                         TREATEMENTS.find(
//                             (t) => t.id === actionPRecord.current?.treatment1
//                         )?.title
//                     }{" "}
//                     시술을 진행하시겠습니까?
//                 </DialogContentText>
//             </DialogContent>
//             <DialogActions>
//                 <Button onClick={handleConfirmAssign} autoFocus>
//                     확인
//                 </Button>
//                 <Button onClick={handleCloseAssignModal}>취소</Button>
//             </DialogActions>
//         </Dialog>
//     );
// };
// const DeleteRecordDialog = () => {
//     const [openDeleteModal, setOpenDeleteModal] = useState(false);

//     const actionPRecord = useRef<PRecord>();

//     const handleOpenDeleteModal = (row: MRT_Row<PRecord>) => {
//         setOpenDeleteModal(true);
//         actionPRecord.current = JSON.parse(JSON.stringify(row.original));
//         if (actionPRecord.current) {
//             emitLockRecord(
//                 actionPRecord.current.id,
//                 getTableType(actionPRecord.current.opReadiness),
//                 socket,
//                 user
//             );
//         }
//     };
//     const handleCloseDeleteModal = () => {
//         setOpenDeleteModal(false);

//         if (actionPRecord.current) {
//             emitUnLockRecord(
//                 actionPRecord.current.id,
//                 getTableType(actionPRecord.current.opReadiness),
//                 socket
//             );
//         }
//         actionPRecord.current = undefined;
//     };
//     const handleConfirmDelete = async () => {
//         if (actionPRecord.current) {
//             const tableType = getTableType(actionPRecord.current.opReadiness);
//             dbDeleteFnMapping[tableType](actionPRecord.current.id);
//             emitDeleteRecord(actionPRecord.current.id, tableType, socket, user);
//         }
//         handleCloseDeleteModal();
//     };
//     return (
//         <Dialog
//             open={openDeleteModal}
//             onClose={handleCloseDeleteModal}
//             aria-labelledby="alert-dialog-title"
//             aria-describedby="alert-dialog-description"
//         >
//             <DialogTitle id="alert-dialog-title">차트 삭제</DialogTitle>
//             <DialogContent>
//                 <DialogContentText id="alert-dialog-description">
//                     차트번호 {actionPRecord.current?.chartNum}를 삭제하시겠습니까?
//                 </DialogContentText>
//             </DialogContent>
//             <DialogActions>
//                 <Button onClick={handleConfirmDelete} autoFocus>
//                     확인
//                 </Button>
//                 <Button onClick={handleCloseDeleteModal}>취소</Button>
//             </DialogActions>
//         </Dialog>
//     );
// };
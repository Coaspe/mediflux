import { useEffect, useMemo, useRef, useState } from "react";
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_Row,
    type MRT_ColumnDef,
    MRT_TableInstance,
    LiteralUnion,
} from "material-react-table";
import {
    UseMutateAsyncFunction,
    UseMutateFunction,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { MRT_Localization_KO } from "material-react-table/locales/ko";
import { Socket, io } from "socket.io-client";
import {
    MOCK,
    MOCK2,
    ROLE,
} from "../../constant";
import {
    LOCK_RECORD,
    CONNECT,
    CONNECTED_USERS,
    CREATE_RECORD,
    DELETE_RECORD,
    JOIN_ROOM,
    ROOM_ID,
    SAVE_RECORD,
    USER_JOINED,
    UNLOCK_RECORD,
    PORT,
    TREATEMENTS,
} from 'shared'
import { OpReadiness, PRecord, QueryDataName, TableType, User } from "~/type";
import SchedulingTableRow from "~/components/Table/SchedulingTableRowAction";
import SchedulingTableTopToolbar from "./SchedulingTableTopToolbar";
import { checkinTimeColumn, chartNumberColumn, patientNameColumn, opReadinessColumn, treatment1Column, quantitytreat1Column, treatmentRoomColumn, doctorColumn, anesthesiaNoteColumn, skincareSpecialist1Column, skincareSpecialist2Column, nursingStaff1Column, nursingStaff2Column, coordinatorColumn, consultantColumn, commentCautionColumn } from "~/utils/Table/columnDef";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const SchedulingTable = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [clients, setClients] = useState<String[]>([]);
    let originalPRecord = useRef<PRecord>()

    const handleConnectedUsers = (users: String[]) => {
        console.log(`Updated list of connected users: ${users}`);
        setClients(users);
    };

    let user: User = {
        id: '1',
        name: "이우람",
        image: "",
        role: ROLE.DOCTOR,
    };

    const userAgent = navigator.userAgent;

    if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
        user = {
            id: '2',
            name: "율곡 이이",
            image: "",
            role: ROLE.DOCTOR,
        }
    }

    // Socket configuration
    useEffect(() => {
        const socketInstance = io(`http://localhost:${PORT}`);
        setSocket(socketInstance);

        // Default
        socketInstance.on(CONNECT, () => {
            socketInstance.emit(JOIN_ROOM, {
                userId: user.id,
                username: user.name,
            });
        });

        // Other user joined
        socketInstance.on(USER_JOINED, (username) => {
            if (typeof socket === "undefined") return;
            setClients((prev) => [...prev, username]);
            socketInstance.emit(CONNECTED_USERS, clients); //Emit User Array
        });

        // Set connected users
        socketInstance.on(CONNECTED_USERS, handleConnectedUsers);
        socketInstance.on(LOCK_RECORD, onLockRecord)
        socketInstance.on(UNLOCK_RECORD, onUnlockRecord)
        socketInstance.on(SAVE_RECORD, onSaveRecord)
        socketInstance.on(CREATE_RECORD, onCreateRecord)
        socketInstance.on(DELETE_RECORD, onDeleteRecord)

        return () => {
            socketInstance.off(CONNECTED_USERS);
            socketInstance.off(LOCK_RECORD);
            socketInstance.off(UNLOCK_RECORD);
            socketInstance.off(SAVE_RECORD);
            socketInstance.off(CREATE_RECORD);
            socketInstance.off(DELETE_RECORD)
            socketInstance.disconnect();
        }
    }, []);

    // Start ---------------------------------------------- On socket event
    const setTableAndGetRow = (tableType: TableType, recordId: string) => {
        let table = readyTable
        if (tableType == 'ExceptReady') {
            table = exceptReadyTable
        }
        let row = JSON.parse(JSON.stringify(table.getRow(recordId).original))
        return row
    }
    const onLockRecord = ({ recordId, locker, tableType }: { recordId: string, locker: User, tableType: TableType }) => {
        const row = setTableAndGetRow(tableType, recordId)
        row.LockingUser = locker
        updateFnMapping[tableType](row);
    }
    const onUnlockRecord = ({ recordId, tableType }: { recordId: string, tableType: TableType }) => {
        const row = setTableAndGetRow(tableType, recordId)
        row.LockingUser = null
        updateFnMapping[tableType](row);
    }

    const onSaveRecord = ({ recordId, record, tableType }: { recordId: string, record: string, tableType: TableType }) => {
        const precord: PRecord = JSON.parse(record)
        precord.LockingUser = null
        let row = setTableAndGetRow(tableType, recordId)
        row = precord
        updateFnMapping[tableType](row)
    }
    const onCreateRecord = ({ record, tableType }: { record: string, tableType: TableType }) => {
        const precord: PRecord = JSON.parse(record)
        precord.LockingUser = null
        createFnMapping[tableType](precord)
    }

    const onDeleteRecord = ({ recordId, tableType }: { recordId: string, tableType: TableType }) => {
        deleteFnMapping[tableType](recordId)
    }
    // End ---------------------------------------------- On socket event

    // DB Mutation
    const [validationErrors, setValidationErrors] = useState<
        Record<string, string | undefined>
    >({});

    const { mutate: createReadyPRecord, mutateAsync: createReadyPRecordWithDB, isPending: isCreatingReadyPRecord } =
        useCreatePRecord('Ready_PRecord');

    const {
        data: fetchedReadyPRecords,
        isError: isLoadingReadyPRecordsError,
        isFetching: isFetchingReadyPRecords,
        isLoading: isLoadingReadyPRecords,
    } = useGetPRecords('Ready_PRecord');

    const { mutate: updateReadyPRecord, mutateAsync: updateReadyPRecordWithDB, isPending: isUpdatingReadyPRecord, error: updateError } =
        useUpdatePRecord('Ready_PRecord');
    const { mutate: deleteReadyPRecord, mutateAsync: deleteReadyPRecordWithDB, isPending: isDeletingReadyPRecord } =
        useDeletePRecord('Ready_PRecord');

    const { mutate: createExceptReadyPRecord, mutateAsync: createExceptReadyPRecordWithDB, isPending: isCreatingExceptReadyPRecord } =
        useCreatePRecord('ExceptReady_PRecord');

    const {
        data: fetchedExceptReadyPRecords,
        isError: isLoadingExceptReadyPRecordsError,
        isFetching: isFetchingExceptReadyPRecords,
        isLoading: isLoadingExceptReadyPRecords,
    } = useGetPRecords('ExceptReady_PRecord');

    const { mutate: updateExceptReadyPRecord, mutateAsync: updateExceptReadyPRecordWithDB, isPending: isUpdatingExceptReadyPRecord, error: updateExceptReadyError } =
        useUpdatePRecord('ExceptReady_PRecord');
    const { mutate: deleteExceptReadyPRecord, mutateAsync: deleteExceptReadyPRecordWithDB, isPending: isDeletingExceptReadyPRecord } =
        useDeletePRecord('ExceptReady_PRecord');

    const updateFnMapping: Record<TableType, UseMutateFunction<void, Error, PRecord, void>> = {
        'Ready': updateReadyPRecord,
        'ExceptReady': updateExceptReadyPRecord
    }
    const createFnMapping: Record<TableType, UseMutateFunction<void, Error, PRecord, void>> = {
        'Ready': createReadyPRecord,
        'ExceptReady': createExceptReadyPRecord
    }
    const deleteFnMapping: Record<TableType, UseMutateFunction<void, Error, string, void>> = {
        'Ready': deleteReadyPRecord,
        'ExceptReady': deleteExceptReadyPRecord
    }
    const dbUpdateFnMapping: Record<TableType, UseMutateAsyncFunction<void, Error, PRecord, void>> = {
        'Ready': updateReadyPRecordWithDB,
        'ExceptReady': updateExceptReadyPRecordWithDB
    }
    const dbCreateFnMapping: Record<TableType, UseMutateAsyncFunction<void, Error, PRecord, void>> = {
        'Ready': createReadyPRecordWithDB,
        'ExceptReady': createExceptReadyPRecordWithDB
    }
    const dbDeleteFnMapping: Record<TableType, UseMutateAsyncFunction<void, Error, string, void>> = {
        'Ready': deleteReadyPRecordWithDB,
        'ExceptReady': deleteExceptReadyPRecordWithDB
    }
    // DB Mutation

    const handleEditingCancel = (row: MRT_Row<PRecord>, tableType: TableType) => {
        setValidationErrors({})
        emitUnLockRecord(row.id, row.original, tableType)
        originalPRecord.current = undefined
    }

    function areObjectsEqual(obj1: PRecord, obj2: PRecord): boolean {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) {
            return false;
        }

        for (let key of keys1) {
            if (!obj2.hasOwnProperty(key)) {
                return false;
            }

            if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
                if (!areObjectsEqual(obj1[key], obj2[key])) {
                    return false;
                }
            } else {
                if (obj1[key] !== obj2[key]) {
                    return false;
                }
            }
        }

        return true;
    }

    const handleSavePRecord = async (row: MRT_Row<PRecord>, table: MRT_TableInstance<PRecord>, tableType: TableType, values: Record<LiteralUnion<string, string>, any>) => {
        let precord = values as PRecord

        if (precord.id === undefined) {
            precord.id = row.original.id
        }

        if (originalPRecord.current) {
            for (let key of Object.keys(row.original)) {
                if ((typeof row.original[key] === 'object' && areObjectsEqual(row.original[key], originalPRecord.current[key])) || row.original[key] !== originalPRecord.current[key]) {
                    precord[key] = originalPRecord.current[key]
                }
            }
        }

        setValidationErrors({});

        if (precord.opReadiness === 'Y' && precord.doctor) {
            precord.opReadiness = 'P'
        }

        await dbUpdateFnMapping[tableType](precord);

        let otherType: TableType = tableType === 'Ready' ? 'ExceptReady' : 'Ready'
        if (!isInvalidOpReadiessWithTable(precord, undefined, otherType)) {
            createFnMapping[otherType](precord)
            emitCreateRecord(precord, otherType)
            emitDeleteRecord(precord.id, tableType)
            // createFnMapping[otherType](precord)
        }

        table.setEditingRow(null); //exit editing mode
        emitSaveRecord(precord, tableType);
        if (precord.LockingUser?.id === user.id) {
            emitUnLockRecord(row.id, precord, tableType)
        }

        originalPRecord.current = undefined
    };

    const id = useRef(11)

    const handleCreatePRecord = async (table: MRT_TableInstance<PRecord>, tableType: TableType, values: Record<LiteralUnion<string, string>, any>) => {
        let precord = values as PRecord
        console.log(precord, originalPRecord.current);
        if (originalPRecord.current) {
            for (let key of Object.keys(originalPRecord.current)) {
                if ((typeof originalPRecord.current[key] === 'object' && areObjectsEqual(originalPRecord.current[key], precord[key])) || originalPRecord.current[key] !== precord[key]) {
                    precord[key] = originalPRecord.current[key]
                }
            }
        }


        precord.id = id.current.toString()
        id.current += 1

        setValidationErrors({});
        await dbCreateFnMapping[tableType](precord)
        table.setCreatingRow(null); //exit creating mode
        emitCreateRecord(precord, tableType);
        originalPRecord.current = undefined

    };

    // Start ---------------------------------------------- Emit socket event
    const emitChangeRecord = (recordId: String, record: PRecord, tableType: TableType) => {
        const locker = { id: user.id, name: user.name }
        socket?.emit(LOCK_RECORD, { recordId, locker, roomId: ROOM_ID, tableType });
    };

    const emitDeleteRecord = (recordId: String, tableType: TableType) => {
        socket?.emit(DELETE_RECORD, { recordId, userId: user.id, roomId: ROOM_ID, tableType });
    };

    const emitSaveRecord = (record: PRecord, tableType: TableType) => {
        socket?.emit(SAVE_RECORD, { recordId: record.id, roomId: ROOM_ID, record: JSON.stringify(record), tableType });
    };

    const emitCreateRecord = (record: PRecord, tableType: TableType) => {
        socket?.emit(CREATE_RECORD, { record: JSON.stringify(record), roomId: ROOM_ID, tableType });
    };

    const emitUnLockRecord = (recordId: String, record: PRecord, tableType: TableType) => {
        socket?.emit(UNLOCK_RECORD, { recordId, roomId: ROOM_ID, tableType });
    };
    // End ---------------------------------------------- Emit socket event

    // Start ---------------------------------------------- Column definition
    const readyColumns = useMemo<MRT_ColumnDef<PRecord>[]>(
        () => [
            checkinTimeColumn(originalPRecord),
            chartNumberColumn,
            patientNameColumn,
            opReadinessColumn('Ready'),
            treatment1Column(originalPRecord),
            quantitytreat1Column,
            treatmentRoomColumn,
            doctorColumn(originalPRecord),
            anesthesiaNoteColumn,
            skincareSpecialist1Column(originalPRecord),
            skincareSpecialist2Column(originalPRecord),
            nursingStaff1Column(originalPRecord),
            nursingStaff2Column(originalPRecord),
            coordinatorColumn(originalPRecord),
            consultantColumn(originalPRecord),
            commentCautionColumn,
        ],
        [validationErrors]
    );
    const exceptReadyColumns = useMemo<MRT_ColumnDef<PRecord>[]>(
        () => [
            checkinTimeColumn(originalPRecord),
            chartNumberColumn,
            patientNameColumn,
            opReadinessColumn('ExceptReady'),
            treatment1Column(originalPRecord),
            quantitytreat1Column,
            treatmentRoomColumn,
            doctorColumn(originalPRecord),
            anesthesiaNoteColumn,
            skincareSpecialist1Column(originalPRecord),
            skincareSpecialist2Column(originalPRecord),
            nursingStaff1Column(originalPRecord),
            nursingStaff2Column(originalPRecord),
            coordinatorColumn(originalPRecord),
            consultantColumn(originalPRecord),
            commentCautionColumn,
        ],
        [validationErrors]
    );
    // End ---------------------------------------------- Column definition

    // Start ---------------------------------------------- Table definition
    const readyTable = useMaterialReactTable({
        columns: readyColumns,
        data: fetchedReadyPRecords ? fetchedReadyPRecords : [],
        localization: MRT_Localization_KO,
        // enableRowSelection: true,
        initialState: {
            columnPinning: { left: ['mrt-row-actions'] },
            density: 'compact'
        },
        createDisplayMode: "modal", // ('modal', and 'custom' are also available)
        editDisplayMode: "modal", // ('modal', 'cell', 'table', and 'custom' are also available)
        enableEditing: true,
        enableColumnResizing: true,
        enableRowActions: true,
        muiTableHeadCellProps: {
            sx: {
                '& .Mui-TableHeadCell-Content': {
                    justifyContent: 'center',
                },
            },
        },
        muiTableContainerProps: ({ table }) => {
            const { isFullScreen } = table.getState()
            return {
                sx: {
                    height: isFullScreen ? '100%' : '300px',
                }
            }
        },
        muiTableProps: ({ }) => ({
            sx: {
                width: '0px',
            }
        }),
        muiToolbarAlertBannerProps: isLoadingReadyPRecordsError
            ? {
                color: "error",
                children: "Error loading data",
            }
            : undefined,
        muiTableBodyRowProps: ({ row, table }) => {
            const { density } = table.getState()
            return {
                sx: {
                    backgroundColor: row.original.LockingUser && row.original.LockingUser?.id != user.id ? 'gray' : 'white',
                    pointerEvents: row.original.LockingUser && row.original.LockingUser?.id != user.id ? 'none' : 'default',
                    height: `${density === 'compact' ? 45 : density === 'comfortable' ? 50 : 57}px`,
                    cursor: user.role === ROLE.DOCTOR ? 'pointer' : 'default'
                },
                onDoubleClick: () => handleOpenAssignModal(row)
            }
        },
        muiTableBodyCellProps: ({ row, cell }) => ({
            onClick: async () => {
                if (row.original.LockingUser) {
                    return
                }

                // switch (cell.column.id) {
                //     case OP_READINESS:
                //         let newPRecord: PRecord = JSON.parse(JSON.stringify(row.original))
                //         newPRecord.opReadiness = !newPRecord.opReadiness
                //         await updatePRecordWithDB(newPRecord)
                //         emitSaveRecord(newPRecord)
                //         break;

                //     default:
                //         break;
                // }
            },
        }),
        onCreatingRowCancel: () => {
            originalPRecord.current = undefined
            setValidationErrors({})
        },
        onCreatingRowSave: ({ table, values }) => handleCreatePRecord(table, 'Ready', values),
        onEditingRowCancel: ({ row }) => handleEditingCancel(row, 'Ready'),
        onEditingRowSave: ({ row, table, values }) => handleSavePRecord(row, table, 'Ready', values),
        renderRowActions: ({ row, table }) => <SchedulingTableRow originalPRecord={originalPRecord}
            row={row} table={table} user={user}
            emitChangeRecord={emitChangeRecord}
            openDeleteConfirmModal={() => handleOpenDeleteModal(row)}
            tableType="Ready" />,
        renderTopToolbarCustomActions: ({ table }) => <SchedulingTableTopToolbar originalPRecord={originalPRecord} table={table} />,
        getRowId: (originalRow) => originalRow.id,
        state: {
            isLoading: isLoadingReadyPRecords,
            isSaving: isCreatingReadyPRecord || isUpdatingReadyPRecord || isDeletingReadyPRecord,
            showAlertBanner: isLoadingReadyPRecordsError,
            showProgressBars: isFetchingReadyPRecords,
        },
    });

    const exceptReadyTable = useMaterialReactTable({
        columns: exceptReadyColumns,
        data: fetchedExceptReadyPRecords ? fetchedExceptReadyPRecords : [],
        localization: MRT_Localization_KO,
        // enableRowSelection: true,
        initialState: {
            columnPinning: { left: ['mrt-row-actions'] },
            density: 'compact'
        },
        createDisplayMode: "modal", // ('modal', and 'custom' are also available)
        editDisplayMode: "modal", // ('modal', 'cell', 'table', and 'custom' are also available)
        enableEditing: true,
        enableColumnResizing: true,
        enableRowActions: true,
        muiTableHeadCellProps: {
            sx: {
                '& .Mui-TableHeadCell-Content': {
                    justifyContent: 'center',
                },
            },
        },
        muiTableContainerProps: ({ table }) => {
            const { isFullScreen } = table.getState()
            return {
                sx: {
                    height: isFullScreen ? '100%' : '300px',
                }
            }
        },
        muiTableProps: ({ }) => ({
            sx: {
                width: '0px',
            }
        }),
        getRowId: (row) => row.id,
        muiToolbarAlertBannerProps: isLoadingExceptReadyPRecordsError
            ? {
                color: "error",
                children: "Error loading data",
            }
            : undefined,
        muiTableBodyRowProps: ({ row, table }) => {
            const { density } = table.getState()
            return {
                sx: {
                    backgroundColor: row.original.LockingUser && row.original.LockingUser?.id != user.id ? 'gray' : 'white',
                    pointerEvents: row.original.LockingUser && row.original.LockingUser?.id != user.id ? 'none' : 'default',
                    height: `${density === 'compact' ? 45 : density === 'comfortable' ? 50 : 57}px`
                }
            }
        },
        muiTableBodyCellProps: ({ row }) => ({
            onClick: async () => {
                if (row.original.LockingUser) {
                    return
                }
            },
        }),
        onCreatingRowCancel: () => { setValidationErrors({}); originalPRecord.current = undefined },
        onCreatingRowSave: ({ values, table }) => handleCreatePRecord(table, 'ExceptReady', values),
        onEditingRowCancel: ({ row }) => handleEditingCancel(row, 'ExceptReady'),
        onEditingRowSave: ({ row, table, values }) => handleSavePRecord(row, table, 'ExceptReady', values),
        renderRowActions: ({ row, table }) => <SchedulingTableRow
            originalPRecord={originalPRecord}
            row={row} table={table} user={user}
            emitChangeRecord={emitChangeRecord}
            openDeleteConfirmModal={() => handleOpenDeleteModal(row)}
            tableType="ExceptReady" />,
        renderTopToolbarCustomActions: ({ table }) => <SchedulingTableTopToolbar originalPRecord={originalPRecord} table={table} />,
        state: {
            isLoading: isLoadingExceptReadyPRecords,
            isSaving: isCreatingExceptReadyPRecord || isUpdatingExceptReadyPRecord || isDeletingExceptReadyPRecord,
            showAlertBanner: isLoadingExceptReadyPRecordsError,
            showProgressBars: isFetchingExceptReadyPRecords,
        },
    });

    const [openAssignModal, setOpenAssignModal] = useState(false)
    const [openDeleteModal, setOpenDeleteModal] = useState(false)

    const actionPRecord = useRef<PRecord>()


    const handleOpenAssignModal = (row: MRT_Row<PRecord>) => {
        setOpenAssignModal(true)
        actionPRecord.current = JSON.parse(JSON.stringify(row.original))
        if (actionPRecord.current) {
            emitChangeRecord(actionPRecord.current.id, actionPRecord.current, getTableType(actionPRecord.current.opReadiness))
        }
    }
    const handleCloseAssignModal = () => {
        setOpenAssignModal(false)
        if (actionPRecord.current) {
            emitUnLockRecord(actionPRecord.current.id, actionPRecord.current, getTableType(actionPRecord.current.opReadiness))
        }
        actionPRecord.current = undefined
    }
    const handleConfirmAssign = async () => {
        if (actionPRecord.current) {
            actionPRecord.current.doctor = user.id
            actionPRecord.current.opReadiness = 'P'
            emitDeleteRecord(actionPRecord.current.id, 'Ready')
            emitCreateRecord(actionPRecord.current, 'ExceptReady')
            await dbUpdateFnMapping['Ready'](actionPRecord.current);
            createFnMapping['ExceptReady'](actionPRecord.current)
        }
        handleCloseAssignModal()
    }
    const handleOpenDeleteModal = (row: MRT_Row<PRecord>) => {
        setOpenDeleteModal(true)
        actionPRecord.current = JSON.parse(JSON.stringify(row.original))
        if (actionPRecord.current) {
            emitChangeRecord(actionPRecord.current.id, actionPRecord.current, getTableType(actionPRecord.current.opReadiness))
        }
    }
    const handleCloseDeleteModal = () => {
        setOpenDeleteModal(false)

        if (actionPRecord.current) {
            emitUnLockRecord(actionPRecord.current.id, actionPRecord.current, getTableType(actionPRecord.current.opReadiness))
        }
        actionPRecord.current = undefined
    }
    const handleConfirmDelete = async () => {
        if (actionPRecord.current) {
            const tableType = getTableType(actionPRecord.current.opReadiness)
            dbDeleteFnMapping[tableType](actionPRecord.current.id);
            emitDeleteRecord(actionPRecord.current.id, tableType);
        }
        handleCloseDeleteModal()
    }


    const AssignmentDialog = () => {
        return <Dialog
            open={openAssignModal}
            onClose={handleCloseAssignModal}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                시술 배정
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {actionPRecord.current?.chartNum}, {actionPRecord.current?.patientName}, {TREATEMENTS.find(t => t.id === actionPRecord.current?.treatment1)?.title} 시술을 진행하시겠습니까?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleConfirmAssign} autoFocus>
                    확인
                </Button>
                <Button onClick={handleCloseAssignModal}>취소</Button>
            </DialogActions>
        </Dialog>
    }

    const DeleteRecordDialog = () => {
        return <Dialog
            open={openDeleteModal}
            onClose={handleCloseDeleteModal}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                차트 삭제
            </DialogTitle>
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
    }
    return <div className="w-full h-full gap-2 flex flex-col">
        {/* Assignment Modal */}
        <AssignmentDialog />
        <DeleteRecordDialog />
        <MaterialReactTable table={readyTable} />
        <MaterialReactTable table={exceptReadyTable} />
    </div>
}
const getTableType = (opReadiness?: OpReadiness): TableType => {
    if (opReadiness === 'Y') {
        return 'Ready'
    } else {
        return 'ExceptReady'
    }
}
const isInvalidOpReadiessWithTable = (precord: PRecord, queryDataName?: QueryDataName, tableType?: TableType): boolean => {
    if (!precord.opReadiness) {
        return false
    }

    if (queryDataName) {
        if ((queryDataName === 'Ready_PRecord' && precord.opReadiness !== 'Y') || (queryDataName === 'ExceptReady_PRecord' && precord.opReadiness === 'Y')) {
            return true
        }
    }
    if (tableType) {
        if ((tableType === 'Ready' && precord.opReadiness !== 'Y') || (tableType === 'ExceptReady' && precord.opReadiness === 'Y')) {
            return true
        }
    }
    return false
}

// End ---------------------------------------------- Table definition
// handleSave -> update (async, 기존), create (반대 타입)
// onSave -> update ()
// Start ---------------------------------------------- CRUD
function useUpdatePRecord(queryDataName: QueryDataName) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (precord: PRecord) => {
            return Promise.resolve();
        },
        onMutate: (newPRecord: PRecord) => {

            queryClient.setQueryData([queryDataName], (prevs: any) => {
                console.log(prevs, newPRecord);
                let newPRecords: PRecord[] = []
                prevs?.forEach((prevPRecord: PRecord) => {
                    console.log(prevPRecord.id, newPRecord.id);
                    if (prevPRecord.id !== newPRecord.id) {

                        newPRecords.push(prevPRecord)
                    } else if (!isInvalidOpReadiessWithTable(newPRecord, queryDataName)) {
                        console.log(newPRecord, queryDataName);
                        newPRecords.push(newPRecord)
                    }
                })
                return newPRecords
            }
            );
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['precords'] }), //refetch precords after mutation, disabled for demo
    });
}

function useDeletePRecord(queryDataName: QueryDataName) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (precordId: string) => {
            //send api update request here
            // await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
            return Promise.resolve();
        },
        //client side optimistic update
        onMutate: (id: string) => {
            queryClient.setQueryData([queryDataName], (prevPRecords: any) =>
                prevPRecords?.filter((precord: PRecord) => precord.id !== id)
            );
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['precords'] }), //refetch precords after mutation, disabled for demo
    });
}

function useGetPRecords(queryDataName: QueryDataName) {
    return useQuery<PRecord[]>({
        queryKey: [queryDataName],
        queryFn: async () => {
            let mock: PRecord[] = []

            if (queryDataName !== 'Ready_PRecord') {
                mock = MOCK
            } else {
                mock = MOCK2
            }
            return Promise.resolve(mock);
        },
        refetchOnWindowFocus: false,
    });
}

function useCreatePRecord(queryDataName: QueryDataName) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (precord: PRecord) => {
            // send api update request here
            // await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
            return Promise.resolve();
        },
        //client side optimistic update
        onMutate: (newPRecordInfo: PRecord) => {
            console.log(newPRecordInfo);

            queryClient.setQueryData([queryDataName], (prevPRecords: any) => {
                return [
                    newPRecordInfo,
                    ...prevPRecords,
                ] as PRecord[];
            });
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['precords'] }), //refetch precords after mutation, disabled for demo
    });
}
// End ---------------------------------------------- CRUD

export default SchedulingTable
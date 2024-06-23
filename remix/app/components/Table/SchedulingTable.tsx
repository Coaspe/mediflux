import { useEffect, useMemo, useRef, useState } from "react";
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_Row,
    type MRT_ColumnDef,
    MRT_TableInstance,
    LiteralUnion,
} from "material-react-table";
import { MRT_Localization_KO } from "material-react-table/locales/ko";
import { Socket, io } from "socket.io-client";
import { MOCK, MOCK2, ROLE } from "../../constant";
import {
    LOCK_RECORD,
    CONNECT,
    CONNECTED_USERS,
    CREATE_RECORD,
    DELETE_RECORD,
    JOIN_ROOM,
    SAVE_RECORD,
    USER_JOINED,
    UNLOCK_RECORD,
    PORT,
    TREATEMENTS,
} from "shared";
import { OpReadiness, PRecord, QueryDataName, TableType, User } from "~/type";
import SchedulingTableRow from "~/components/Table/SchedulingTableRowAction";
import SchedulingTableTopToolbar from "./SchedulingTableTopToolbar";
import {
    checkinTimeColumn,
    chartNumberColumn,
    patientNameColumn,
    opReadinessColumn,
    treatment1Column,
    quantitytreat1Column,
    treatmentRoomColumn,
    doctorColumn,
    anesthesiaNoteColumn,
    skincareSpecialist1Column,
    skincareSpecialist2Column,
    nursingStaff1Column,
    nursingStaff2Column,
    coordinatorColumn,
    consultantColumn,
    commentCautionColumn,
} from "~/utils/Table/columnDef";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { isInvalidOpReadiessWithTable, getTableType } from "~/utils/utils";
import {
    emitUnLockRecord,
    emitCreateRecord,
    emitDeleteRecord,
    emitSaveRecord,
    emitLockRecord,
} from "~/utils/Table/socket";
import {
    useQueryClient,
    useMutation,
    useQuery,
    UseMutateFunction,
    UseMutateAsyncFunction,
} from "@tanstack/react-query";
import Chip from '@mui/material/Chip';
import { getStatusChipColor } from "./ColumnRenderers";
import { Box } from "@mui/joy";
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';

const SchedulingTable = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [clients, setClients] = useState<String[]>([]);

    // Assign and Delete Dialogs
    const [openAssignModal, setOpenAssignModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [openChangeStatusModal, setOpenChangeStatusModal] = useState(false);

    const actionPRecord = useRef<PRecord>();
    const originalPRecord = useRef<PRecord>();

    const handleConnectedUsers = (users: String[]) => {
        console.log(`Updated list of connected users: ${users}`);
        setClients(users);
    };

    let user: User = {
        id: "1",
        name: "이우람",
        image: "",
        role: ROLE.DOCTOR,
    };

    const userAgent = navigator.userAgent;

    function isEdgeBrowser(): boolean {
        const userAgent = window.navigator.userAgent;
        return userAgent.includes("Edg") || userAgent.includes("Edge");
    }

    if (
        (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) ||
        isEdgeBrowser()
    ) {
        user = {
            id: "2",
            name: "율곡 이이",
            image: "",
            role: ROLE.DOCTOR,
        };
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
        socketInstance.on(LOCK_RECORD, onLockRecord);
        socketInstance.on(UNLOCK_RECORD, onUnlockRecord);
        socketInstance.on(SAVE_RECORD, onSaveRecord);
        socketInstance.on(CREATE_RECORD, onCreateRecord);
        socketInstance.on(DELETE_RECORD, onDeleteRecord);

        return () => {
            socketInstance.off(CONNECTED_USERS);
            socketInstance.off(LOCK_RECORD);
            socketInstance.off(UNLOCK_RECORD);
            socketInstance.off(SAVE_RECORD);
            socketInstance.off(CREATE_RECORD);
            socketInstance.off(DELETE_RECORD);
            socketInstance.disconnect();
        };
    }, []);
    const {
        mutate: createReadyPRecord,
        mutateAsync: createReadyPRecordWithDB,
        isPending: isCreatingReadyPRecord,
    } = useCreatePRecord("Ready_PRecord");

    const {
        data: fetchedReadyPRecords,
        isError: isLoadingReadyPRecordsError,
        isFetching: isFetchingReadyPRecords,
        isLoading: isLoadingReadyPRecords,
    } = useGetPRecords("Ready_PRecord");

    const {
        mutate: updateReadyPRecord,
        mutateAsync: updateReadyPRecordWithDB,
        isPending: isUpdatingReadyPRecord,
        error: updateError,
    } = useUpdatePRecord("Ready_PRecord");
    const {
        mutate: deleteReadyPRecord,
        mutateAsync: deleteReadyPRecordWithDB,
        isPending: isDeletingReadyPRecord,
    } = useDeletePRecord("Ready_PRecord");

    const {
        mutate: createExceptReadyPRecord,
        mutateAsync: createExceptReadyPRecordWithDB,
        isPending: isCreatingExceptReadyPRecord,
    } = useCreatePRecord("ExceptReady_PRecord");

    const {
        data: fetchedExceptReadyPRecords,
        isError: isLoadingExceptReadyPRecordsError,
        isFetching: isFetchingExceptReadyPRecords,
        isLoading: isLoadingExceptReadyPRecords,
    } = useGetPRecords("ExceptReady_PRecord");

    const {
        mutate: updateExceptReadyPRecord,
        mutateAsync: updateExceptReadyPRecordWithDB,
        isPending: isUpdatingExceptReadyPRecord,
        error: updateExceptReadyError,
    } = useUpdatePRecord("ExceptReady_PRecord");
    const {
        mutate: deleteExceptReadyPRecord,
        mutateAsync: deleteExceptReadyPRecordWithDB,
        isPending: isDeletingExceptReadyPRecord,
    } = useDeletePRecord("ExceptReady_PRecord");

    const updateFnMapping: Record<
        TableType,
        UseMutateFunction<void, Error, PRecord, void>
    > = {
        Ready: updateReadyPRecord,
        ExceptReady: updateExceptReadyPRecord,
    };
    const createFnMapping: Record<
        TableType,
        UseMutateFunction<void, Error, PRecord, void>
    > = {
        Ready: createReadyPRecord,
        ExceptReady: createExceptReadyPRecord,
    };
    const deleteFnMapping: Record<
        TableType,
        UseMutateFunction<void, Error, string, void>
    > = {
        Ready: deleteReadyPRecord,
        ExceptReady: deleteExceptReadyPRecord,
    };
    const dbUpdateFnMapping: Record<
        TableType,
        UseMutateAsyncFunction<void, Error, PRecord, void>
    > = {
        Ready: updateReadyPRecordWithDB,
        ExceptReady: updateExceptReadyPRecordWithDB,
    };
    const dbCreateFnMapping: Record<
        TableType,
        UseMutateAsyncFunction<void, Error, PRecord, void>
    > = {
        Ready: createReadyPRecordWithDB,
        ExceptReady: createExceptReadyPRecordWithDB,
    };
    const dbDeleteFnMapping: Record<
        TableType,
        UseMutateAsyncFunction<void, Error, string, void>
    > = {
        Ready: deleteReadyPRecordWithDB,
        ExceptReady: deleteExceptReadyPRecordWithDB,
    };
    // Start ---------------------------------------------- On socket event
    const setTableAndGetRow = (tableType: TableType, recordId: string) => {
        let table = readyTable;
        if (tableType == "ExceptReady") {
            table = exceptReadyTable;
        }

        try {
            let row = JSON.parse(JSON.stringify(table.getRow(recordId).original));
            return row;
        } catch (error) {
            return undefined
        }
    };

    const onLockRecord = ({
        recordId,
        locker,
        tableType,
    }: {
        recordId: string;
        locker: User;
        tableType: TableType;
    }) => {
        const row = setTableAndGetRow(tableType, recordId);
        if (row) {
            row.LockingUser = locker;
            updateFnMapping[tableType](row);
        }
    };
    const onUnlockRecord = ({
        recordId,
        tableType,
    }: {
        recordId: string;
        tableType: TableType;
    }) => {
        const row = setTableAndGetRow(tableType, recordId);
        if (row) {
            row.LockingUser = null;
            updateFnMapping[tableType](row);
        }
    };

    const onSaveRecord = ({
        recordId,
        record,
        tableType,
    }: {
        recordId: string;
        record: string;
        tableType: TableType;
    }) => {
        const precord: PRecord = JSON.parse(record);
        console.log(record);

        precord.LockingUser = null;
        let row = setTableAndGetRow(tableType, recordId);
        if (row) {
            row = precord;
            updateFnMapping[tableType](row);
        }
    };
    const onCreateRecord = ({
        record,
        tableType,
    }: {
        record: string;
        tableType: TableType;
    }) => {
        const precord: PRecord = JSON.parse(record);
        precord.LockingUser = null;
        createFnMapping[tableType](precord);
    };

    const onDeleteRecord = ({
        recordId,
        tableType,
    }: {
        recordId: string;
        tableType: TableType;
    }) => {
        deleteFnMapping[tableType](recordId);
    };
    // End ---------------------------------------------- On socket event


    const handleEditingCancel = (row: MRT_Row<PRecord>, tableType: TableType) => {
        setValidationErrors({});
        emitUnLockRecord(row.id, tableType, socket);
        originalPRecord.current = undefined;
    };

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

            if (typeof obj1[key] === "object" && typeof obj2[key] === "object") {
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

    /**
     * 
     * @see
     * save -> create
     */
    const handleSavePRecord = async (
        row: MRT_Row<PRecord>,
        table: MRT_TableInstance<PRecord>,
        tableType: TableType,
        values: Record<LiteralUnion<string, string>, any>
    ) => {
        let precord = values as PRecord;

        if (precord.id === undefined) {
            precord.id = row.original.id;
        }

        if (originalPRecord.current) {
            for (let key of Object.keys(row.original)) {
                if (
                    (typeof row.original[key] === "object" &&
                        areObjectsEqual(row.original[key], originalPRecord.current[key])) ||
                    row.original[key] !== originalPRecord.current[key]
                ) {
                    precord[key] = originalPRecord.current[key];
                }
            }
        }

        setValidationErrors({});

        if (precord.opReadiness === "Y" && precord.doctor) {
            precord.opReadiness = "P";
        }

        await dbUpdateFnMapping[tableType](precord);

        let otherType: TableType = tableType === "Ready" ? "ExceptReady" : "Ready";
        if (!isInvalidOpReadiessWithTable(precord, undefined, otherType)) {
            createFnMapping[otherType](precord);
            emitCreateRecord(precord, otherType, socket);
            emitDeleteRecord(precord.id, tableType, socket, user);
        } else {
            emitSaveRecord(precord, tableType, socket);
        }

        table.setEditingRow(null); // exit editing mode

        if (precord.LockingUser?.id === user.id) {
            emitUnLockRecord(row.id, tableType, socket);
        }

        originalPRecord.current = undefined;
    };

    const id = useRef(2001);

    const handleCreatePRecord = async (
        table: MRT_TableInstance<PRecord>,
        tableType: TableType,
        values: Record<LiteralUnion<string, string>, any>
    ) => {
        let precord = values as PRecord;

        if (originalPRecord.current) {
            for (let key of Object.keys(originalPRecord.current)) {
                if (
                    (typeof originalPRecord.current[key] === "object" &&
                        areObjectsEqual(originalPRecord.current[key], precord[key])) ||
                    originalPRecord.current[key] !== precord[key]
                ) {
                    precord[key] = originalPRecord.current[key];
                }
            }
        }

        precord.id = id.current.toString();
        id.current += 1;

        if (isInvalidOpReadiessWithTable(precord, undefined, tableType)) {
            tableType = tableType === "Ready" ? "ExceptReady" : "Ready";
        }

        await dbCreateFnMapping[tableType](precord);
        emitCreateRecord(precord, tableType, socket);
        originalPRecord.current = undefined;
        table.setCreatingRow(null); //exit creating mode
        setValidationErrors({});
    };

    const [validationErrors, setValidationErrors] = useState<
        Record<string, string | undefined>
    >({});

    // Start ---------------------------------------------- Column definition
    const readyColumns = useMemo<MRT_ColumnDef<PRecord>[]>(
        () => [
            checkinTimeColumn(originalPRecord),
            chartNumberColumn,
            patientNameColumn,
            opReadinessColumn("Ready", setOpenChangeStatusModal, actionPRecord),
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
            opReadinessColumn("ExceptReady", setOpenChangeStatusModal, actionPRecord),
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
            columnPinning: { left: ["mrt-row-actions"] },
            density: "compact",
            pagination: {
                pageSize: 30,
                pageIndex: 0
            }
        },
        createDisplayMode: "modal", // ('modal', and 'custom' are also available)
        editDisplayMode: "modal", // ('modal', 'cell', 'table', and 'custom' are also available)
        enableEditing: true,
        enableColumnResizing: true,
        enableRowActions: true,
        muiTableHeadCellProps: {
            sx: {
                "& .Mui-TableHeadCell-Content": {
                    justifyContent: "center",
                },
            },
        },
        muiTableContainerProps: ({ table }) => {
            const { isFullScreen } = table.getState();
            return {
                sx: {
                    height: isFullScreen ? "100%" : "500px",
                },
            };
        },
        muiTableProps: ({ }) => ({
            sx: {
                width: "0px",
            },
        }),
        muiToolbarAlertBannerProps: isLoadingReadyPRecordsError
            ? {
                color: "error",
                children: "Error loading data",
            }
            : undefined,
        muiTableBodyRowProps: ({ row, table }) => {
            const { density } = table.getState();
            return {
                sx: {
                    backgroundColor:
                        row.original.LockingUser && row.original.LockingUser?.id != user.id
                            ? "gray"
                            : "white",
                    pointerEvents:
                        row.original.LockingUser && row.original.LockingUser?.id != user.id
                            ? "none"
                            : "default",
                    height: `${density === "compact" ? 45 : density === "comfortable" ? 50 : 57
                        }px`,
                    cursor: user.role === ROLE.DOCTOR ? "pointer" : "default",
                },
                onDoubleClick: () => handleOpenAssignModal(row),
            };
        },
        muiTableBodyCellProps: ({ row, cell }) => ({
            onDoubleClick: async (event) => {
                if (row.original.LockingUser) {
                    return;
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
            originalPRecord.current = undefined;
            setValidationErrors({});
        },
        onCreatingRowSave: ({ table, values }) =>
            handleCreatePRecord(table, "Ready", values),
        onEditingRowCancel: ({ row }) => handleEditingCancel(row, "Ready"),
        onEditingRowSave: ({ row, table, values }) =>
            handleSavePRecord(row, table, "Ready", values),
        renderRowActions: ({ row, table }) => (
            <SchedulingTableRow
                originalPRecord={originalPRecord}
                row={row}
                table={table}
                user={user}
                emitLockRecord={emitLockRecord}
                socket={socket}
                openDeleteConfirmModal={() => handleOpenDeleteModal(row)}
                tableType="Ready"
            />
        ),
        renderTopToolbarCustomActions: ({ table }) => (
            <SchedulingTableTopToolbar
                originalPRecord={originalPRecord}
                table={table}
                tableType="Ready"
            />
        ),
        getRowId: (originalRow) => originalRow.id,
        state: {
            isLoading: isLoadingReadyPRecords,
            isSaving:
                isCreatingReadyPRecord ||
                isUpdatingReadyPRecord ||
                isDeletingReadyPRecord,
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
            columnPinning: { left: ["mrt-row-actions"] },
            density: "compact",
            pagination: {
                pageSize: 30,
                pageIndex: 0
            }
        },
        createDisplayMode: "modal", // ('modal', and 'custom' are also available)
        editDisplayMode: "modal", // ('modal', 'cell', 'table', and 'custom' are also available)
        enableEditing: true,
        enableColumnResizing: true,
        enableRowActions: true,
        muiTableHeadCellProps: {
            sx: {
                "& .Mui-TableHeadCell-Content": {
                    justifyContent: "center",
                },
            },
        },
        muiTableContainerProps: ({ table }) => {
            const { isFullScreen } = table.getState();
            return {
                sx: {
                    height: isFullScreen ? "100%" : "500px",
                },
            };
        },
        muiTableProps: ({ }) => ({
            sx: {
                width: "0px",
            },
        }),
        getRowId: (row) => row.id,
        muiToolbarAlertBannerProps: isLoadingExceptReadyPRecordsError
            ? {
                color: "error",
                children: "Error loading data",
            }
            : undefined,
        muiTableBodyRowProps: ({ row, table }) => {
            const { density } = table.getState();
            return {
                sx: {
                    backgroundColor:
                        row.original.LockingUser && row.original.LockingUser?.id != user.id
                            ? "gray"
                            : "white",
                    pointerEvents:
                        row.original.LockingUser && row.original.LockingUser?.id != user.id
                            ? "none"
                            : "default",
                    height: `${density === "compact" ? 45 : density === "comfortable" ? 50 : 57
                        }px`,
                },
            };
        },
        muiTableBodyCellProps: ({ row }) => ({
            onClick: async () => {
                if (row.original.LockingUser) {
                    return;
                }
            },
        }),
        onCreatingRowCancel: () => {
            setValidationErrors({});
            originalPRecord.current = undefined;
        },
        onCreatingRowSave: ({ values, table }) =>
            handleCreatePRecord(table, "ExceptReady", values),
        onEditingRowCancel: ({ row }) => handleEditingCancel(row, "ExceptReady"),
        onEditingRowSave: ({ row, table, values }) =>
            handleSavePRecord(row, table, "ExceptReady", values),
        renderRowActions: ({ row, table }) => (
            <SchedulingTableRow
                originalPRecord={originalPRecord}
                row={row}
                table={table}
                user={user}
                emitLockRecord={emitLockRecord}
                socket={socket}
                openDeleteConfirmModal={() => handleOpenDeleteModal(row)}
                tableType="ExceptReady"
            />
        ),
        renderTopToolbarCustomActions: ({ table }) => (
            <SchedulingTableTopToolbar
                originalPRecord={originalPRecord}
                table={table}
                tableType="ExceptReady"
            />
        ),
        state: {
            isLoading: isLoadingExceptReadyPRecords,
            isSaving:
                isCreatingExceptReadyPRecord ||
                isUpdatingExceptReadyPRecord ||
                isDeletingExceptReadyPRecord,
            showAlertBanner: isLoadingExceptReadyPRecordsError,
            showProgressBars: isFetchingExceptReadyPRecords,
        },
    });
    // End ---------------------------------------------- Table definition
    function useUpdatePRecord(queryDataName: QueryDataName) {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: async (precord: PRecord) => {
                return Promise.resolve();
            },
            onMutate: (newPRecord: PRecord) => {
                queryClient.setQueryData([queryDataName], (prevs: any) => {
                    let newPRecords: PRecord[] = [];
                    prevs?.forEach((prevPRecord: PRecord) => {
                        if (prevPRecord.id !== newPRecord.id) {
                            newPRecords.push(prevPRecord);
                        } else if (!isInvalidOpReadiessWithTable(newPRecord, queryDataName)) {
                            newPRecords.push(newPRecord);
                        }
                    });
                    return newPRecords;
                });
            },
            // onSettled: () => queryClient.invalidateQueries({ queryKey: ['precords'] }), //refetch precords after mutation, disabled for demo
        });
    }

    function useDeletePRecord(queryDataName: QueryDataName) {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: async (precordId: string) => {
                return Promise.resolve();
            },
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
                let mock: PRecord[] = [];

                if (queryDataName !== "Ready_PRecord") {
                    mock = MOCK;
                } else {
                    mock = MOCK2;
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
                return Promise.resolve();
            },
            //client side optimistic update
            onMutate: (newPRecordInfo: PRecord) => {
                queryClient.setQueryData([queryDataName], (prevPRecords: any) => {
                    return [newPRecordInfo, ...prevPRecords] as PRecord[];
                });
            },
            // onSettled: () => queryClient.invalidateQueries({ queryKey: ['precords'] }), //refetch precords after mutation, disabled for demo
        });
    }


    const handleOpenAssignModal = (row: MRT_Row<PRecord>) => {
        setOpenAssignModal(true);
        actionPRecord.current = JSON.parse(JSON.stringify(row.original));
        if (actionPRecord.current) {
            emitLockRecord(
                actionPRecord.current.id,
                getTableType(actionPRecord.current.opReadiness),
                socket,
                user
            );
        }
    };
    const handleCloseAssignModal = () => {
        setOpenAssignModal(false);
        if (actionPRecord.current) {
            emitUnLockRecord(
                actionPRecord.current.id,
                getTableType(actionPRecord.current.opReadiness),
                socket
            );
        }
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
    const handleOpenDeleteModal = (row: MRT_Row<PRecord>) => {
        setOpenDeleteModal(true);
        actionPRecord.current = JSON.parse(JSON.stringify(row.original));
        if (actionPRecord.current) {
            emitLockRecord(
                actionPRecord.current.id,
                getTableType(actionPRecord.current.opReadiness),
                socket,
                user
            );
        }
    };
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
            dbDeleteFnMapping[tableType](actionPRecord.current.id);
            emitDeleteRecord(actionPRecord.current.id, tableType, socket, user);
        }
        handleCloseDeleteModal();
    };
    const handleCloseStatusChangeModal = () => {
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
        handleCloseStatusChangeModal();
    }

    const AssignmentDialog = () => {
        return (
            <Dialog
                open={openAssignModal}
                onClose={handleCloseAssignModal}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">시술 배정</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {actionPRecord.current?.chartNum},{" "}
                        {actionPRecord.current?.patientName},{" "}
                        {
                            TREATEMENTS.find(
                                (t) => t.id === actionPRecord.current?.treatment1
                            )?.title
                        }{" "}
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
    const ChangeStatusDialog = () => {
        const readinessArray: OpReadiness[] = ['Y', 'N', 'C', 'P'];
        const [opReadiness, setOpReadiness] = useState<OpReadiness | undefined>(actionPRecord.current?.opReadiness)
        return (
            <Dialog
                open={openChangeStatusModal}
                onClose={handleCloseStatusChangeModal}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">상태 변경</DialogTitle>
                <DialogContent>
                    <Box sx={{ gap: '1em', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: "10px 0px" }}>
                        {readinessArray.map((op) => opReadiness !== op ? <Chip key={op} onClick={() => { setOpReadiness(op) }}
                            sx={{ cursor: "pointer", transition: 'transform 0.2s ease-in-out', '&:hover': { transform: 'scale(1.1)' }, }}
                            label={op} color={getStatusChipColor(op)} /> : <CheckOutlinedIcon />)}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { handleConfirmStatusChange(opReadiness) }} autoFocus>
                        확인
                    </Button>
                    <Button onClick={handleCloseStatusChangeModal}>취소</Button>
                </DialogActions>
            </Dialog>
        );
    };

    const DeleteRecordDialog = () => {
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
    // Assign and Delete Dialogs
    return (
        <div className="w-full h-full gap-2 flex flex-col">
            {/* Assignment Modal */}
            <ChangeStatusDialog />
            <AssignmentDialog />
            <DeleteRecordDialog />
            <MaterialReactTable table={readyTable} />
            <MaterialReactTable table={exceptReadyTable} />
        </div>
    );
};

export default SchedulingTable;

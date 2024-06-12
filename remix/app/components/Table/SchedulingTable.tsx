import { useEffect, useMemo, useRef, useState } from "react";
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_Row,
    type MRT_ColumnDef,
    type MRT_TableOptions,
    MRT_TableInstance,
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
    OP_READINESS,
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
} from 'shared'
import { PRecord, TableType, User } from "~/type";
import SchedulingTableRow from "~/components/Table/SchedulingTableRowAction";
import SchedulingTableTopToolbar from "./SchedulingTableTopToolbar";
import { checkinTimeColumn, chartNumberColumn, patientNameColumn, opReadinessColumn, treatment1Column, quantitytreat1Column, treatmentRoomColumn, doctorColumn, anesthesiaNoteColumn, skincareSpecialist1Column, skincareSpecialist2Column, nursingStaff1Column, nursingStaff2Column, coordinatorColumn, consultantColumn, commentCautionColumn } from "~/utils/Table/columnDef";

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
        let row = table.getRow(recordId).original

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
    // DB Mutation

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

    const openDeleteConfirmModal = (row: MRT_Row<PRecord>, tableType: TableType) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            dbDeleteFnMapping[tableType](row.original.id);
            emitDeleteRecord(row.original.id);
        }
    };
    const handleEditingCancel = ({ row }: { row: MRT_Row<PRecord> }) => {
        setValidationErrors({})
        emitUnLockRecord(row.id, row.original)
    }

    const handleSavePRecord = async (row: MRT_Row<PRecord>, table: MRT_TableInstance<PRecord>, tableType: TableType) => {
        if (originalPRecord.current != undefined) {
            setValidationErrors({});
            await dbUpdateFnMapping[tableType](originalPRecord.current);
            table.setEditingRow(null); //exit editing mode
            emitSaveRecord(originalPRecord.current);
            if (originalPRecord.current.LockingUser?.id === user.id) {
                emitUnLockRecord(row.id, originalPRecord.current)
            }
            originalPRecord.current = undefined
        }
    };

    const handleCreatePRecord = async (table: MRT_TableInstance<PRecord>, tableType: TableType) => {
        if (originalPRecord.current != undefined) {
            setValidationErrors({});
            await dbCreateFnMapping[tableType](originalPRecord.current)
            table.setCreatingRow(null); //exit creating mode
            emitCreateRecord(originalPRecord.current);
            originalPRecord.current = undefined
        }
    };

    // Start ---------------------------------------------- Emit socket event
    const emitChangeRecord = (recordId: String, record: PRecord) => {
        const locker = { id: user.id, name: user.name }
        socket?.emit(LOCK_RECORD, { recordId, locker, roomId: ROOM_ID });
    };

    const emitDeleteRecord = (recordId: String) => {
        socket?.emit(DELETE_RECORD, { recordId, userId: user.id, roomId: ROOM_ID });
    };

    const emitSaveRecord = (record: PRecord) => {
        socket?.emit(SAVE_RECORD, { recordId: record.id, roomId: ROOM_ID, record: JSON.stringify(record) });
    };

    const emitCreateRecord = (record: PRecord) => {
        socket?.emit(CREATE_RECORD, { record: JSON.stringify(record), roomId: ROOM_ID });
    };

    const emitUnLockRecord = (recordId: String, record: PRecord) => {
        socket?.emit(UNLOCK_RECORD, { recordId, roomId: ROOM_ID, });
    };
    // End ---------------------------------------------- Emit socket event

    // Start ---------------------------------------------- Column definition
    const columns = useMemo<MRT_ColumnDef<PRecord>[]>(
        () => [
            checkinTimeColumn(originalPRecord),
            chartNumberColumn,
            patientNameColumn,
            opReadinessColumn,
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
        columns,
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
        muiTableProps: ({ }) => ({
            sx: {
                width: '0px',
            }
        }),
        getRowId: (row) => row.id,
        muiToolbarAlertBannerProps: isLoadingReadyPRecordsError
            ? {
                color: "error",
                children: "Error loading data",
            }
            : undefined,
        muiTableBodyRowProps: ({ row }) => ({
            sx: {
                backgroundColor: row.original.LockingUser && row.original.LockingUser?.id != user.id ? 'gray' : 'white',
                pointerEvents: row.original.LockingUser && row.original.LockingUser?.id != user.id ? 'none' : 'default',
            },
        }),
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
        onCreatingRowCancel: () => setValidationErrors({}),
        onCreatingRowSave: ({ table }) => handleCreatePRecord(table, 'Ready'),
        onEditingRowCancel: handleEditingCancel,
        onEditingRowSave: ({ row, table }) => handleSavePRecord(row, table, 'Ready'),
        renderRowActions: ({ row, table }) => <SchedulingTableRow originalPRecord={originalPRecord} row={row} table={table} user={user} emitChangeRecord={emitChangeRecord} openDeleteConfirmModal={() => openDeleteConfirmModal(row, 'Ready')} />,
        renderTopToolbarCustomActions: ({ table }) => <SchedulingTableTopToolbar originalPRecord={originalPRecord} table={table} />,
        state: {
            isLoading: isLoadingReadyPRecords,
            isSaving: isCreatingReadyPRecord || isUpdatingReadyPRecord || isDeletingReadyPRecord,
            showAlertBanner: isLoadingReadyPRecordsError,
            showProgressBars: isFetchingReadyPRecords,
        },
    });

    const exceptReadyTable = useMaterialReactTable({
        columns,
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
        muiTableBodyRowProps: ({ row }) => ({
            sx: {
                backgroundColor: row.original.LockingUser && row.original.LockingUser?.id != user.id ? 'gray' : 'white',
                pointerEvents: row.original.LockingUser && row.original.LockingUser?.id != user.id ? 'none' : 'default',
            },
        }),
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
        onCreatingRowCancel: () => setValidationErrors({}),
        onCreatingRowSave: ({ table }) => handleCreatePRecord(table, 'ExceptReady'),
        onEditingRowCancel: handleEditingCancel,
        onEditingRowSave: ({ row, table }) => handleSavePRecord(row, table, 'ExceptReady'),
        renderRowActions: ({ row, table }) => <SchedulingTableRow originalPRecord={originalPRecord} row={row} table={table} user={user} emitChangeRecord={emitChangeRecord} openDeleteConfirmModal={() => openDeleteConfirmModal(row, 'ExceptReady')} />,
        renderTopToolbarCustomActions: ({ table }) => <SchedulingTableTopToolbar originalPRecord={originalPRecord} table={table} />,
        state: {
            isLoading: isLoadingExceptReadyPRecords,
            isSaving: isCreatingExceptReadyPRecord || isUpdatingExceptReadyPRecord || isDeletingExceptReadyPRecord,
            showAlertBanner: isLoadingExceptReadyPRecordsError,
            showProgressBars: isFetchingExceptReadyPRecords,
        },
    });

    return <div className="w-full">
        <MaterialReactTable table={readyTable} />
        <MaterialReactTable table={exceptReadyTable} />
    </div>
}

// End ---------------------------------------------- Table definition

// Start ---------------------------------------------- CRUD
function useUpdatePRecord(queryDataName: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (precord: PRecord) => {
            return Promise.resolve();
        },
        onMutate: (newPRecord: PRecord) => {
            queryClient.setQueryData([queryDataName], (prevs: any) => {
                return prevs?.map((prevPRecord: PRecord) => {
                    return prevPRecord.id === newPRecord.id ? newPRecord : prevPRecord
                })
            }
            );
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['precords'] }), //refetch precords after mutation, disabled for demo
    });
}

function useDeletePRecord(queryDataName: string) {
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

function useGetPRecords(queryDataName: string) {
    return useQuery<PRecord[]>({
        queryKey: [queryDataName],
        queryFn: async () => {
            let mock: PRecord[] = []

            if (queryDataName == 'Ready_PRecord') {
                mock = MOCK
            } else {
                mock = MOCK2
            }
            //send api request here
            // await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
            // console.log("useGetPR");

            // return Promise.resolve(mock);
            return Promise.resolve(mock);
        },
        refetchOnWindowFocus: false,
    });
}

function useCreatePRecord(queryDataName: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (precord: PRecord) => {
            // send api update request here
            // await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
            return Promise.resolve();
        },
        //client side optimistic update
        onMutate: (newPRecordInfo: PRecord) => {
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
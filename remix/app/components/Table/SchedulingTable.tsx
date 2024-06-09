import { useEffect, useMemo, useRef, useState } from "react";
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_Row,
    type MRT_ColumnDef,
    type MRT_TableOptions,
} from "material-react-table";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { MRT_Localization_KO } from "material-react-table/locales/ko";
import { Socket, io } from "socket.io-client";
import {
    MOCK,
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
import { PRecord, User } from "~/type";
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

    const [validationErrors, setValidationErrors] = useState<
        Record<string, string | undefined>
    >({});

    const { mutate: createPRcord, mutateAsync: createPRecordWithDB, isPending: isCreatingPRecord } =
        useCreatePRecord();

    const {
        data: fetchedPRecords = MOCK,
        isError: isLoadingPRecordsError,
        isFetching: isFetchingPRecords,
        isLoading: isLoadingPRecords,
    } = useGetPRecords();

    // Start ---------------------------------------------- On socket event
    const onLockRecord = ({ recordId, locker }: { recordId: string, locker: User }) => {
        const row = table.getRow(recordId).original
        row.LockingUser = locker
        updatePRecord(row);
    }
    const onUnlockRecord = ({ recordId }: { recordId: string }) => {
        table.getRow(recordId).original.LockingUser = null
        updatePRecord(table.getRow(recordId).original);
    }

    const onSaveRecord = ({ recordId, record }: { recordId: string, record: string }) => {
        const precord: PRecord = JSON.parse(record)
        precord.LockingUser = null
        table.getRow(recordId).original = precord
        updatePRecord(table.getRow(recordId).original)
    }
    const onCreateRecord = ({ record }: { record: string }) => {
        const precord: PRecord = JSON.parse(record)
        precord.LockingUser = null
        createPRcord(precord)
    }

    const onDeleteRecord = ({ recordId }: { recordId: string }) => {
        deletePRecord(recordId)
    }
    // End ---------------------------------------------- On socket event

    // DB Mutate
    const { mutate: updatePRecord, mutateAsync: updatePRecordWithDB, isPending: isUpdatingPRecord, error: updateError } =
        useUpdatePRecord();
    const { mutate: deletePRecord, mutateAsync: deletePRecordWithDB, isPending: isDeletingPRecord } =
        useDeletePRecord();

    const openDeleteConfirmModal = (row: MRT_Row<PRecord>) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            deletePRecordWithDB(row.original.id);
            emitDeleteRecord(row.original.id);
        }
    };

    const handleEditingCancel = ({ row }: { row: MRT_Row<PRecord> }) => {
        setValidationErrors({})
        emitUnLockRecord(row.id, row.original)
    }

    const handleSavePRecord: MRT_TableOptions<PRecord>["onEditingRowSave"] =
        async ({ row, table }) => {
            if (originalPRecord.current != undefined) {
                setValidationErrors({});
                await updatePRecordWithDB(originalPRecord.current);
                table.setEditingRow(null); //exit editing mode
                emitSaveRecord(originalPRecord.current);
                if (originalPRecord.current.LockingUser?.id === user.id) {
                    emitUnLockRecord(row.id, originalPRecord.current)
                }
                originalPRecord.current = undefined
            }
        };

    const handleCreatePRecord: MRT_TableOptions<PRecord>["onCreatingRowSave"] =
        async ({ table }) => {
            if (originalPRecord.current != undefined) {
                setValidationErrors({});
                await createPRecordWithDB(originalPRecord.current);
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
    const table = useMaterialReactTable({
        columns,
        data: fetchedPRecords,
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
        getRowId: (row) => row.id,
        muiToolbarAlertBannerProps: isLoadingPRecordsError
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

                switch (cell.column.id) {
                    case OP_READINESS:
                        let newPRecord: PRecord = JSON.parse(JSON.stringify(row.original))
                        newPRecord.opReadiness = !newPRecord.opReadiness
                        await updatePRecordWithDB(newPRecord)
                        emitSaveRecord(newPRecord)
                        break;

                    default:
                        break;
                }
            },
        }),
        onCreatingRowCancel: () => setValidationErrors({}),
        onCreatingRowSave: handleCreatePRecord,
        onEditingRowCancel: handleEditingCancel,
        onEditingRowSave: handleSavePRecord,
        renderRowActions: ({ row, table }) => <SchedulingTableRow originalPRecord={originalPRecord} row={row} table={table} user={user} emitChangeRecord={emitChangeRecord} openDeleteConfirmModal={openDeleteConfirmModal} />,
        renderTopToolbarCustomActions: ({ table }) => <SchedulingTableTopToolbar originalPRecord={originalPRecord} table={table} />,
        state: {
            isLoading: isLoadingPRecords,
            isSaving: isCreatingPRecord || isUpdatingPRecord || isDeletingPRecord,
            showAlertBanner: isLoadingPRecordsError,
            showProgressBars: isFetchingPRecords,
        },
    });
    const ReadyTable = () => {

    }
    return <div className="w-full">
        <MaterialReactTable table={table} />
        <MaterialReactTable table={table} />
    </div>;
}

// End ---------------------------------------------- Table definition

// Start ---------------------------------------------- CRUD
function useUpdatePRecord() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (precord: PRecord) => {
            return Promise.resolve();
        },
        onMutate: (newPRecord: PRecord) => {
            queryClient.setQueryData(["precords"], (prevs: any) => {
                return prevs?.map((prevPRecord: PRecord) => {
                    return prevPRecord.id === newPRecord.id ? newPRecord : prevPRecord
                })
            }
            );
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['precords'] }), //refetch precords after mutation, disabled for demo
    });
}

function useDeletePRecord() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (precordId: string) => {
            //send api update request here
            // await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
            return Promise.resolve();
        },
        //client side optimistic update
        onMutate: (id: string) => {
            queryClient.setQueryData(["precords"], (prevPRecords: any) =>
                prevPRecords?.filter((precord: PRecord) => precord.id !== id)
            );
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['precords'] }), //refetch precords after mutation, disabled for demo
    });
}

function useGetPRecords() {
    return useQuery<PRecord[]>({
        queryKey: ["precords"],
        queryFn: async () => {
            //send api request here
            // await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
            // console.log("useGetPR");

            // return Promise.resolve(mock);
            return Promise.resolve(MOCK);
        },
        refetchOnWindowFocus: false,
    });
}

function useCreatePRecord() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (precord: PRecord) => {
            //send api update request here
            // await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
            MOCK.push(precord);
            return Promise.resolve();
        },
        //client side optimistic update
        onMutate: (newPRecordInfo: PRecord) => {
            console.log(newPRecordInfo);
            queryClient.setQueryData(["precords"], (prevPRecords: any) => {
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
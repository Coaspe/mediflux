import { useEffect, useMemo, useRef, useState } from "react";
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_Row,
    type MRT_ColumnDef,
    type MRT_TableOptions,
    MRT_FilterFn,
} from "material-react-table";
import { checkInTimeCell, opReadinessCell, treatmentEdit, nameChipCell, checkInTimeEdit, StaffEdit } from './ColumnRenderers'
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { MRT_Localization_KO } from "material-react-table/locales/ko";
import { Socket, io } from "socket.io-client";
import {
    ANESTHESIANOTE,
    ANESTHESIANOTE_H,
    CHART_NUMBER,
    CHART_NUMBER_H,
    CHECK_IN_TIME,
    CHECK_IN_TIME_H,
    COMMENTCAUTION,
    COMMENTCAUTION_H,
    CONSULTANT,
    CONSULTANT_H,
    COORDINATOR,
    COORDINATOR_H,
    DOCTOR,
    DOCTOR_H,
    DOCTORS,
    LONG_COLUMN_LENGTH,
    MEDIUM_COLUMN_LENGTH,
    mock,
    NURSINGSTAFF1,
    NURSINGSTAFF1_H,
    NURSINGSTAFF2,
    NURSINGSTAFF2_H,
    OP_READINESS,
    OP_READINESS_H,
    PATIENT_NAME,
    PATIENT_NAME_H,
    QUANTITYTREAT1,
    QUANTITYTREAT1_H,
    ROLE,
    SearchHelp,
    SHORT_COLUMN_LENGTH,
    SKINCARESPECIALIST1,
    SKINCARESPECIALIST1_H,
    SKINCARESPECIALIST2,
    SKINCARESPECIALIST2_H,
    TREATMENT1,
    TREATMENT1_H,
    TREATMENT_ROOM,
    TREATMENT_ROOM_H,
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
    PORT
} from 'shared'
import { PRecord, User } from "~/type";
import SchedulingTableRow from "~/components/Table/SchedulingTableRowAction";
import SchedulingTableTopToolbar from "./SchedulingTableTopToolbar";
import dayjs from "dayjs";

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
        data: fetchedPRecords = mock,
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
                emitSaveRecord(row.id, originalPRecord.current);
                if (originalPRecord.current.LockingUser?.id === user.id) {
                    emitUnLockRecord(row.id, originalPRecord.current)
                }
                originalPRecord.current = undefined
            }
        };

    const handleCreatePRecord: MRT_TableOptions<PRecord>["onCreatingRowSave"] =
        async ({ values, table }) => {
            setValidationErrors({});
            await createPRecordWithDB(values);
            table.setCreatingRow(null); //exit creating mode
            emitCreateRecord(values);
        };

    // Start ---------------------------------------------- Emit socket event
    const emitChangeRecord = (recordId: String, record: PRecord) => {
        const locker = { id: user.id, name: user.name }
        socket?.emit(LOCK_RECORD, { recordId, locker, roomId: ROOM_ID });
    };

    const emitDeleteRecord = (recordId: String) => {
        socket?.emit(DELETE_RECORD, { recordId, userId: user.id, roomId: ROOM_ID });
    };

    const emitSaveRecord = (recordId: String, record: PRecord) => {
        socket?.emit(SAVE_RECORD, { recordId, roomId: ROOM_ID, record: JSON.stringify(record) });
    };

    const emitCreateRecord = (record: PRecord) => {
        socket?.emit(CREATE_RECORD, { record: JSON.stringify(record), roomId: ROOM_ID });
    };

    const emitUnLockRecord = (recordId: String, record: PRecord) => {
        socket?.emit(UNLOCK_RECORD, { recordId, roomId: ROOM_ID, });
    };
    // End ---------------------------------------------- Emit socket event

    // Start ---------------------------------------------- Column definition
    const staffFilterFn = (id: unknown, filterValue: any, searchHelp: SearchHelp[]) => {
        const record = DOCTORS.find(ele => ele.id === id)
        const title = record?.title
        return title ? title.includes(filterValue) : false
    }
    const checkinTimeColumn: MRT_ColumnDef<PRecord> = {
        // id: 'date',
        // filterVariant: 'datetime',
        // filterFn: 'lessThan',
        accessorKey: CHECK_IN_TIME,
        header: CHECK_IN_TIME_H,
        sortingFn: 'datetime',
        Cell: checkInTimeCell,
        Edit: ({ row }: { row: MRT_Row<PRecord> }) => checkInTimeEdit(row, originalPRecord),
        size: LONG_COLUMN_LENGTH, //medium column
    }
    const chartNumberColumn: MRT_ColumnDef<PRecord> = {
        accessorKey: CHART_NUMBER,
        header: CHART_NUMBER_H,
        size: LONG_COLUMN_LENGTH, //medium column
    }
    const patientNameColumn: MRT_ColumnDef<PRecord> = {
        accessorKey: PATIENT_NAME,
        header: PATIENT_NAME_H,
    }
    const opReadinessColumn: MRT_ColumnDef<PRecord> = {
        accessorKey: OP_READINESS,
        header: OP_READINESS_H,
        editVariant: 'select',
        editSelectOptions: [{ label: '완료', value: true }, { label: '미완료', value: false }],
        Cell: opReadinessCell,
        size: SHORT_COLUMN_LENGTH, // medium column
    }
    const treatment1Column: MRT_ColumnDef<PRecord> = {
        accessorKey: TREATMENT1,
        header: TREATMENT1_H,
        enableResizing: true,
        Edit: ({ row }: { row: MRT_Row<PRecord> }) => treatmentEdit(row, originalPRecord)
    }
    const quantitytreat1Column: MRT_ColumnDef<PRecord> = {
        accessorKey: QUANTITYTREAT1,
        header: QUANTITYTREAT1_H,
        size: SHORT_COLUMN_LENGTH, //medium column
    }
    const treatmentRoomColumn: MRT_ColumnDef<PRecord> = {
        accessorKey: TREATMENT_ROOM,
        header: TREATMENT_ROOM_H,
        size: MEDIUM_COLUMN_LENGTH, //medium column
    }
    const doctorColumn: MRT_ColumnDef<PRecord> = {
        accessorKey: DOCTOR,
        header: DOCTOR_H,
        size: SHORT_COLUMN_LENGTH, //medium column
        filterFn: (row, id, filterValue) => staffFilterFn(row.getValue(id), filterValue, DOCTORS),
        Edit: ({ row }: { row: MRT_Row<PRecord> }) => StaffEdit(row, originalPRecord, DOCTORS, DOCTOR, DOCTOR_H),
        Cell: ({ cell, column }) => nameChipCell(cell, column, DOCTORS)
    }
    const anesthesiaNoteColumn: MRT_ColumnDef<PRecord> = {
        accessorKey: ANESTHESIANOTE,
        header: ANESTHESIANOTE_H
    }
    const skincareSpecialist1Column: MRT_ColumnDef<PRecord> = {
        accessorKey: SKINCARESPECIALIST1,
        header: SKINCARESPECIALIST1_H,
        filterFn: (row, id, filterValue) => staffFilterFn(row.getValue(id), filterValue, DOCTORS),
        Edit: ({ row }: { row: MRT_Row<PRecord> }) => StaffEdit(row, originalPRecord, DOCTORS, SKINCARESPECIALIST1, SKINCARESPECIALIST1_H),
        Cell: ({ cell, column }) => nameChipCell(cell, column, DOCTORS),
        size: MEDIUM_COLUMN_LENGTH, //medium column
    }
    const skincareSpecialist2Column: MRT_ColumnDef<PRecord> = {
        accessorKey: SKINCARESPECIALIST2,
        header: SKINCARESPECIALIST2_H,
        filterFn: (row, id, filterValue) => staffFilterFn(row.getValue(id), filterValue, DOCTORS),
        Edit: ({ row }: { row: MRT_Row<PRecord> }) => StaffEdit(row, originalPRecord, DOCTORS, SKINCARESPECIALIST2, SKINCARESPECIALIST2_H),
        Cell: ({ cell, column }) => nameChipCell(cell, column, DOCTORS),
        size: MEDIUM_COLUMN_LENGTH,
    }
    const nursingStaff1Column: MRT_ColumnDef<PRecord> = {
        accessorKey: NURSINGSTAFF1,
        header: NURSINGSTAFF1_H,
        filterFn: (row, id, filterValue) => staffFilterFn(row.getValue(id), filterValue, DOCTORS),
        Edit: ({ row }: { row: MRT_Row<PRecord> }) => StaffEdit(row, originalPRecord, DOCTORS, NURSINGSTAFF1, NURSINGSTAFF1_H),
        Cell: ({ cell, column }) => nameChipCell(cell, column, DOCTORS),
        size: MEDIUM_COLUMN_LENGTH,
    }
    const nursingStaff2Column: MRT_ColumnDef<PRecord> = {
        accessorKey: NURSINGSTAFF2,
        header: NURSINGSTAFF2_H,
        filterFn: (row, id, filterValue) => staffFilterFn(row.getValue(id), filterValue, DOCTORS),
        Edit: ({ row }: { row: MRT_Row<PRecord> }) => StaffEdit(row, originalPRecord, DOCTORS, NURSINGSTAFF2, NURSINGSTAFF2_H),
        Cell: ({ cell, column }) => nameChipCell(cell, column, DOCTORS),
        size: MEDIUM_COLUMN_LENGTH,
    }
    const coordinatorColumn: MRT_ColumnDef<PRecord> = {
        accessorKey: COORDINATOR,
        header: COORDINATOR_H,
        Edit: ({ row }: { row: MRT_Row<PRecord> }) => StaffEdit(row, originalPRecord, DOCTORS, COORDINATOR, COORDINATOR_H),
        Cell: ({ cell, column }) => nameChipCell(cell, column, DOCTORS),
        size: SHORT_COLUMN_LENGTH,
    }
    const consultantColumn: MRT_ColumnDef<PRecord> = {
        accessorKey: CONSULTANT,
        header: CONSULTANT_H,
        filterFn: (row, id, filterValue) => staffFilterFn(row.getValue(id), filterValue, DOCTORS),
        Edit: ({ row }: { row: MRT_Row<PRecord> }) => StaffEdit(row, originalPRecord, DOCTORS, CONSULTANT, CONSULTANT_H),
        Cell: ({ cell, column }) => nameChipCell(cell, column, DOCTORS),
        size: SHORT_COLUMN_LENGTH,
    }
    const commentCautionColumn = {
        accessorKey: COMMENTCAUTION,
        header: COMMENTCAUTION_H
    }
    const columns = useMemo<MRT_ColumnDef<PRecord>[]>(
        () => [
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
        muiTableContainerProps: {
            sx: {
                width: 'full',
                minHeight: "400px",
            },
        },
        muiTableBodyRowProps: ({ row }) => ({
            sx: {
                backgroundColor: row.original.LockingUser && row.original.LockingUser?.id != user.id ? 'gray' : 'white',
                pointerEvents: row.original.LockingUser && row.original.LockingUser?.id != user.id ? 'none' : 'default'
            }
        }),
        onCreatingRowCancel: () => setValidationErrors({}),
        onCreatingRowSave: handleCreatePRecord,
        onEditingRowCancel: handleEditingCancel,
        onEditingRowSave: handleSavePRecord,
        renderRowActions: ({ row, table }) => <SchedulingTableRow originalPRecord={originalPRecord} row={row} table={table} user={user} emitChangeRecord={emitChangeRecord} openDeleteConfirmModal={openDeleteConfirmModal} />,
        renderTopToolbarCustomActions: ({ table }) => <SchedulingTableTopToolbar table={table} />,
        state: {
            isLoading: isLoadingPRecords,
            isSaving: isCreatingPRecord || isUpdatingPRecord || isDeletingPRecord,
            showAlertBanner: isLoadingPRecordsError,
            showProgressBars: isFetchingPRecords,
        },
    });

    return <MaterialReactTable table={table} />;
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
            return Promise.resolve(mock);
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
            mock.push(precord);
            return Promise.resolve();
        },
        //client side optimistic update
        onMutate: (newPRecordInfo: PRecord) => {
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
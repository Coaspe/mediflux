import { useEffect, useMemo, useState } from "react";
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_Row,
    type MRT_ColumnDef,
    type MRT_TableOptions,
} from "material-react-table";
import { Button, Chip } from "@mui/material";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { MRT_Localization_KO } from "material-react-table/locales/ko";

import { Socket, io } from "socket.io-client";
import {
    mock,
    ROLE,
    FIELDS_DOCTOR,
    FIELDS_NURSE,
    FIELDS_PAITENT,
} from "../constant";

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
} from 'shared'

import { PRecord, User } from "~/type";
import SchedulingTableRow from "~/components/scheduling_table_row";

const SchedulingTable = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [clients, setClients] = useState<String[]>([]);
    const PORT = 5004;
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

    // On socket event
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

    // DB Mutate
    const { mutate: updatePRecord, mutateAsync: updatePRecordWithDB, isPending: isUpdatingPRecord } =
        useUpdatePRecord();
    const { mutate: deletePRecord, mutateAsync: deletePRecordWithDB, isPending: isDeletingPRecord } =
        useDeletePRecord();

    const openDeleteConfirmModal = (row: MRT_Row<PRecord>) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            deletePRecordWithDB(row.original.id);
            emitDeleteRecord(row.original.id);
        }
    };

    const handleEditingCancel = (row: MRT_Row<PRecord>) => {
        setValidationErrors({})
        emitUnLockRecord(row.id, row.original)
    }

    const handleSavePRecord: MRT_TableOptions<PRecord>["onEditingRowSave"] =
        async ({ row, values, table }) => {
            setValidationErrors({});
            await updatePRecordWithDB(values);
            table.setEditingRow(null); //exit editing mode
            emitSaveRecord(row.id, values);
        };

    const handleCreatePRecord: MRT_TableOptions<PRecord>["onCreatingRowSave"] =
        async ({ values, table }) => {
            setValidationErrors({});
            values.id = '11'
            await createPRecordWithDB(values);
            table.setCreatingRow(null); //exit creating mode
            emitCreateRecord(values);
        };

    // Emit socket event
    const emitChangeRecord = (recordId: String, record: PRecord) => {
        const locker = { id: user.id, name: user.name }
        socket?.emit(LOCK_RECORD, { recordId, locker, roomId: ROOM_ID });
        record.LockingUser = locker
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
        record.LockingUser = null
    };
    type ChipColor = "error" | "primary" | "secondary" | "warning" | "default" | "success" | "info"
    const nameCellRenderer = (fieldname: string, name?: string) => {
        let color: ChipColor
        if (FIELDS_DOCTOR.includes(fieldname)) {
            color = 'primary'
        } else if (FIELDS_NURSE.includes(fieldname)) {
            color = 'secondary'
        } else if (FIELDS_PAITENT.includes(fieldname)) {
            color = 'default'
        } else {
            color = 'warning'
        }
        return name ? <Chip size="small" color={color} label={name} /> : ""
    }
    const columns = useMemo<MRT_ColumnDef<PRecord>[]>(
        () => [
            {
                // accessorFn: (row) => row.date, //convert to Date for sorting and filtering
                // id: 'date',
                accessorKey: "checkInTime",
                header: "수납시간",
                // filterVariant: 'date',
                // filterFn: 'lessThan',
                sortingFn: 'datetime',
                size: 130, //medium column
                Cell: ({ cell }) => {
                    const date = new Date(cell.getValue<Date>());

                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');

                    return `${hours}:${minutes}`;
                },

                // Cell: ({ cell, column }) => cell.getValue<Date>()?.toLocaleDateString(), //render Date as a string
                // Header: ({ column }) => <em>{column.columnDef.header}</em>, //custom header markup
            },
            {
                accessorKey: 'chartNum',
                header: '차트번호',
                size: 130, //medium column
            },
            {
                accessorKey: "patientName",
                header: "고객 이름",
                enableResizing: true,
                muiEditTextFieldProps: {
                    required: true,
                    error: !!validationErrors?.firstName,
                    helperText: validationErrors?.firstName,
                    //remove any previous validation errors when prcord focuses on the input
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            firstName: undefined,
                        }),
                    //optionally add validation checking for onBlur or onChange
                },
            },
            {
                accessorKey: 'opReadiness',
                header: '준비',
                size: 110, //medium column
                Cell: ({ cell }) => {
                    return cell.getValue() ? <Chip size="small" label='Y' color="success" />
                        : <Chip size="small" label='N' color="error" />
                }
            },
            {
                accessorKey: 'treatment1',
                header: '시술',
            },
            {
                accessorKey: 'quantityTreat1',
                header: '수량',
                size: 110, //medium column
            },
            {
                accessorKey: 'treatmentRoom',
                header: '시술실',
                size: 120, //medium column
            },
            {
                accessorKey: "doctor",
                header: "의사",
                size: 110, //medium column
                muiEditTextFieldProps: {
                    required: true,
                    error: !!validationErrors?.lastName,
                    helperText: validationErrors?.lastName,
                    //remove any previous validation errors when prcord focuses on the input
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            lastName: undefined,
                        }),
                },
                Cell: ({ cell, column }) => nameCellRenderer(column.columnDef.header, cell.getValue()?.toString())
            },
            {
                accessorKey: 'anesthesiaNote',
                header: '마취 시간'
            },
            {
                accessorKey: 'skincareSpecialist1',
                header: '피부1',

                Cell: ({ cell, column }) => nameCellRenderer(column.columnDef.header, cell.getValue()?.toString()),
                size: 120, //medium column
            },
            {
                accessorKey: 'skincareSpecialist2',
                header: '피부2',
                Cell: ({ cell, column }) => nameCellRenderer(column.columnDef.header, cell.getValue()?.toString()),
                size: 120,
            },
            {
                accessorKey: 'nursingStaff1',
                header: '간호1',
                Cell: ({ cell, column }) => nameCellRenderer(column.columnDef.header, cell.getValue()?.toString()),
                size: 120,
            },
            {
                accessorKey: 'nursingStaff2',
                header: '간호2',
                Cell: ({ cell, column }) => nameCellRenderer(column.columnDef.header, cell.getValue()?.toString()),
                size: 120,
            },
            {
                accessorKey: 'coordinator',
                header: '코디',
                Cell: ({ cell, column }) => nameCellRenderer(column.columnDef.header, cell.getValue()?.toString()),
                size: 110,
            },
            {
                accessorKey: 'consultant',
                header: '상담',
                Cell: ({ cell, column }) =>
                    nameCellRenderer(column.columnDef.header, cell.getValue()?.toString()),
                size: 110,
            },
            {
                accessorKey: 'commentCaution',
                header: '비고/주의'
            },
        ],
        [validationErrors]
    );

    const table = useMaterialReactTable({
        columns,
        data: fetchedPRecords,
        localization: MRT_Localization_KO,
        initialState: {
            columnPinning: { left: ['mrt-row-actions'] },
        },
        // enableColumnResizing: true,
        createDisplayMode: "row", // ('modal', and 'custom' are also available)
        editDisplayMode: "row", // ('modal', 'cell', 'table', and 'custom' are also available)
        enableEditing: true,
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
                minHeight: "500px",
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
        onEditingRowCancel: ({ row }) => {
            handleEditingCancel(row)
        },
        onEditingRowSave: handleSavePRecord,
        renderRowActions: ({ row, table }) => (
            <SchedulingTableRow user={user} row={row} table={table} emitChangeRecord={emitChangeRecord} openDeleteConfirmModal={openDeleteConfirmModal} />
        ),
        renderTopToolbarCustomActions: ({ table }) => (
            <Button
                variant="contained"
                className="bg-button"
                onClick={() => {
                    table.setCreatingRow(true); //simplest way to open the create row modal with no default values
                    //or you can pass in a row object to set default values with the `createRow` helper function
                    // table.setCreatingRow(
                    //   createRow(table, {
                    //     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
                    //   }),
                    // );
                }}
            >
                레코드 추가
            </Button>
        ),
        state: {
            isLoading: isLoadingPRecords,
            isSaving: isCreatingPRecord || isUpdatingPRecord || isDeletingPRecord,
            showAlertBanner: isLoadingPRecordsError,
            showProgressBars: isFetchingPRecords,
        },
    });

    return <MaterialReactTable table={table} />;
}

function useUpdatePRecord() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (precord: PRecord) => {
            return Promise.resolve();
        },
        onMutate: (newPRecord: PRecord) => {
            queryClient.setQueryData(["precords"], (prevs: any) =>
                prevs?.map((prevPRecord: PRecord) =>
                    prevPRecord.id === newPRecord.id ? newPRecord : prevPRecord
                )
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


export default SchedulingTable
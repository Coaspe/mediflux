import { useEffect, useMemo, useState } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_Row,
  type MRT_ColumnDef,
  type MRT_TableOptions,
} from 'material-react-table';
import {
  Box,
  Button,
  IconButton, Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { MRT_Localization_KO } from 'material-react-table/locales/ko'

import { Socket, io } from 'socket.io-client';
import { CHANGED_RECORD, CONNECT, CONNECTED_USERS, CREATE_RECORD, DELETE_RECORD, JOIN_ROOM, SAVE_RECORD, USER_JOINED } from '../../../shared-constants/index'
import { User } from '~/type';
import { ROLE } from '~/constant';

type PRecord = {
  id: string;
  patient: string;
  attendingDoctor?: string;
  date: number;
}

let mock: PRecord[] = [
  {
    id: '1',
    patient: "나나미",
    attendingDoctor: "이우람",
    date: 0
  } as PRecord,
  {
    id: '2',
    patient: "나나미",
    attendingDoctor: "이우람",
    date: 0
  } as PRecord,
  {
    id: '3',
    patient: "나나미",
    attendingDoctor: "이우람",
    date: 0
  } as PRecord,
  {
    id: '4',
    patient: "나나미",
    attendingDoctor: "이우람",
    date: 0
  } as PRecord,
  {
    id: '5',
    patient: "나나미",
    attendingDoctor: "이우람",
    date: 0
  } as PRecord,
]

function Table() {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
  const { mutateAsync: createPRecord, isPending: isCreatingPRecord } =
    useCreatePRecord();
  const {
    data: fetchedPRecords = mock,
    isError: isLoadingPRecordsError,
    isFetching: isFetchingPRecords,
    isLoading: isLoadingPRecords,
  } = useGetPRecords();

  const { mutateAsync: updatePRecord, isPending: isUpdatingPRecord } =
    useUpdatePRecord();
  const { mutateAsync: deletePRecord, isPending: isDeletingPRecord } =
    useDeletePRecord();
  const openDeleteConfirmModal = (row: MRT_Row<PRecord>) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      deletePRecord(row.original.id);
    }
  };

  const handleSavePRecord: MRT_TableOptions<PRecord>['onEditingRowSave'] = async ({
    values,
    table,
  }) => {
    setValidationErrors({})
    await updatePRecord(values)
    table.setEditingRow(null); //exit editing mode
  };

  const handleCreatePRecord: MRT_TableOptions<PRecord>['onCreatingRowSave'] = async ({
    values,
    table,
  }) => {
    setValidationErrors({})
    await createPRecord(values)
    table.setCreatingRow(null); //exit creating mode
  }

  const columns = useMemo<MRT_ColumnDef<PRecord>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Id',
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: 'patient',
        header: 'Patient',
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
        accessorKey: 'attendingDoctor',
        header: 'Doctor',
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
      },
      {
        // accessorFn: (row) => row.date, //convert to Date for sorting and filtering
        // id: 'date',
        accessorKey: "date",
        header: 'Date',
        // filterVariant: 'date',
        // filterFn: 'lessThan',
        // sortingFn: 'datetime',
        // Cell: ({ cell }) => cell.getValue<Date>()?.toLocaleDateString(), //render Date as a string
        // Cell: ({ cell }) => cell.getValue<Date>()?.toLocaleDateString(), //render Date as a string
        // Header: ({ column }) => <em>{column.columnDef.header}</em>, //custom header markup
        muiFilterTextFieldProps: {
          sx: {
            minWidth: '250px',
          },
        },
      },
    ],
    [validationErrors],
  );

  const table = useMaterialReactTable({
    columns,
    data: fetchedPRecords,
    localization: MRT_Localization_KO,
    createDisplayMode: 'row', // ('modal', and 'custom' are also available)
    editDisplayMode: 'row', // ('modal', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    getRowId: (row) => String(row.id),
    muiToolbarAlertBannerProps: isLoadingPRecordsError
      ? {
        color: 'error',
        children: 'Error loading data',
      }
      : undefined,
    muiTableContainerProps: {
      sx: {
        minHeight: '500px',
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreatePRecord,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSavePRecord,
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        className='bg-button'
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
      //send api update request here
      // await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve();
    },
    //client side optimistic update
    onMutate: (newPRecord: PRecord) => {
      queryClient.setQueryData(['precords'], (prevs: any) =>
        prevs?.map((prevPRecord: PRecord) =>
          prevPRecord.id === newPRecord.id ? newPRecord : prevPRecord,
        ),
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
      queryClient.setQueryData(['precords'], (prevPRecords: any) =>
        prevPRecords?.filter((precord: PRecord) => precord.id !== id),
      );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['precords'] }), //refetch precords after mutation, disabled for demo
  });
}

function useGetPRecords() {
  return useQuery<PRecord[]>({
    queryKey: ['precords'],
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
      mock.push(precord)
      return Promise.resolve();
    },
    //client side optimistic update
    onMutate: (newPRecordInfo: PRecord) => {
      queryClient.setQueryData(
        ['precords'],
        (prevPRecords: any) => {
          return [
            ...prevPRecords,
            {
              ...newPRecordInfo,
              id: 123,
            },
          ] as PRecord[]
        }
      );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['precords'] }), //refetch precords after mutation, disabled for demo
  });
}

const queryClient = new QueryClient();

export default function Scheduling() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [clients, setClients] = useState<String[]>([]);
  const [user, setUser] = useState<User>({
    id: 1,
    name: '이우람',
    image: '',
    role: ROLE.DOCTOR
  })

  const handleConnectedUsers = (users: String[]) => {
    console.log(`Updated list of connected users: ${users}`);
    setClients(users);
  };

  // Lock record specified by recordId
  const handleChangeRecord = (recordId: number) => {
    socket?.emit(CHANGED_RECORD, { recordId, userId: user.id })
  }

  const handleDeleteRecord = (recordId: number) => {
    // Needs confirmation step
    socket?.emit(DELETE_RECORD, { recordId, userId: user.id })
  }

  const handleSaveRecord = (recordId: number) => {
    socket?.emit(SAVE_RECORD, { recordId, userId: user.id })
  }

  const handleCreateRecord = (recordId: number) => {
    socket?.emit(CREATE_RECORD, { recordId, userId: user.id })
  }

  useEffect(() => {
    const socketInstance = io("http://localhost:5001")
    setSocket(socketInstance)

    // Default
    socketInstance.on(CONNECT, () => {
      console.log("Socket connected, joining room with ID:", 100);
      socketInstance.emit(JOIN_ROOM, { roomId: 100, userId: user.id, username: user.name })
    })

    // Other user joined
    socketInstance.on(USER_JOINED, (username) => {
      if (typeof socket === 'undefined') return;
      setClients(prev => [...prev, username]);
      socketInstance.emit(CONNECTED_USERS, clients);        //Emit User Array 
    });

    // Set connected users
    socketInstance.on(CONNECTED_USERS, handleConnectedUsers);

  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <Table />
    </QueryClientProvider>
  )
}
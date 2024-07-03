import { MRT_ColumnDef, MRT_Row } from "material-react-table";
import { TREATEMENTS } from "shared";
import { checkInTimeCell, checkInTimeEdit, opReadinessCell, treatmentEdit, StaffEdit, nameChipCell } from "~/components/Table/ColumnRenderers";
import {
  DOCTORS,
  CHECK_IN_TIME,
  CHECK_IN_TIME_H,
  LONG_JUSTIFIED_CENTER_COLUMN_LENGTH,
  CHART_NUMBER,
  CHART_NUMBER_H,
  PATIENT_NAME,
  PATIENT_NAME_H,
  OP_READINESS,
  OP_READINESS_H,
  SHORT_COLUMN_LENGTH,
  TREATMENT1,
  TREATMENT1_H,
  QUANTITYTREAT1,
  QUANTITYTREAT1_H,
  TREATMENT_ROOM,
  TREATMENT_ROOM_H,
  MEDIUM_COLUMN_LENGTH,
  DOCTOR,
  DOCTOR_H,
  ANESTHESIANOTE,
  ANESTHESIANOTE_H,
  SKINCARESPECIALIST1,
  SKINCARESPECIALIST1_H,
  SKINCARESPECIALIST2,
  SKINCARESPECIALIST2_H,
  NURSINGSTAFF1,
  NURSINGSTAFF1_H,
  NURSINGSTAFF2,
  NURSINGSTAFF2_H,
  COORDINATOR,
  COORDINATOR_H,
  CONSULTANT,
  CONSULTANT_H,
  COMMENTCAUTION,
  COMMENTCAUTION_H,
  LONG_LEFT_JUSTIFIED_COLUMN_LENGTH,
  SHORT_CENTER_JUSTIFIED_COLUMN_LENGTH,
  MEDIUM_CENTER_JUSTIFIED_COLUMN_LENGTH,
} from "~/constant";
import { SearchHelp, PRecord, TableType, User } from "~/type";
import { getValueWithId } from "../utils";
import { Dispatch, MutableRefObject, SetStateAction } from "react";

export const staffFilterFn = (id: unknown, filterValue: any, searchHelp: SearchHelp[]) => {
  const record = DOCTORS.find((ele) => ele.id === id);
  const title = record?.title;
  return title ? title.includes(filterValue) : false;
};
export const checkinTimeColumn = (originalPRecord: MutableRefObject<PRecord | undefined>): MRT_ColumnDef<PRecord> => {
  return {
    // id: 'date',
    // filterVariant: 'datetime',
    // filterFn: 'lessThan',
    accessorKey: CHECK_IN_TIME,
    header: CHECK_IN_TIME_H,
    sortingFn: "datetime",
    Cell: checkInTimeCell,
    Edit: ({ row }: { row: MRT_Row<PRecord> }) => checkInTimeEdit(row, originalPRecord),
    size: LONG_JUSTIFIED_CENTER_COLUMN_LENGTH, //medium column
    muiTableHeadCellProps: {
      align: "center",
    },
    muiTableBodyCellProps: {
      align: "center",
    },
  };
};
export const chartNumberColumn: MRT_ColumnDef<PRecord> = {
  accessorKey: CHART_NUMBER,
  header: CHART_NUMBER_H,
  size: LONG_JUSTIFIED_CENTER_COLUMN_LENGTH, //medium column
  muiTableHeadCellProps: {
    align: "center",
  },
  muiEditTextFieldProps: {
    required: true,
  },
};
export const patientNameColumn: MRT_ColumnDef<PRecord> = {
  accessorKey: PATIENT_NAME,
  header: PATIENT_NAME_H,
  size: LONG_JUSTIFIED_CENTER_COLUMN_LENGTH,
  muiTableHeadCellProps: {
    align: "center",
  },
  muiEditTextFieldProps: {
    required: true,
  },
};
export const opReadinessColumn = (tableType: TableType, setOpenStatusModal: Dispatch<SetStateAction<boolean>>, actionPRecord: MutableRefObject<PRecord | undefined>): MRT_ColumnDef<PRecord> => {
  return {
    accessorKey: OP_READINESS,
    header: OP_READINESS_H,
    editVariant: "select",
    // editSelectOptions: ({}) => tableType === 'Ready' ? [{ label: '준비 완료', value: 'Y' }] : [{ label: '준비 미완료', value: 'N' }, { label: '시술 완료', value: 'C' }, { label: "시술 중", value: 'P' }],
    editSelectOptions: [
      { label: "준비 완료 (Y)", value: "Y" },
      { label: "준비 미완료 (N)", value: "N" },
      { label: "시술 완료 (C)", value: "C" },
      { label: "시술 중 (P)", value: "P" },
    ],
    Cell: opReadinessCell,
    size: SHORT_CENTER_JUSTIFIED_COLUMN_LENGTH, // medium column
    muiTableHeadCellProps: {
      align: "center",
    },
    muiTableBodyCellProps: ({ row }) => {
      return {
        align: "center",
        onDoubleClick: (event) => {
          event.stopPropagation();
          actionPRecord.current = JSON.parse(JSON.stringify(row.original));
          setOpenStatusModal(true);
        },
      };
    },
    muiEditTextFieldProps: {
      required: true,
      defaultValue: "Y",
    },
  };
};
export const treatment1Column = (originalPRecord: MutableRefObject<PRecord | undefined>): MRT_ColumnDef<PRecord> => {
  return {
    Cell: ({ cell }) => getValueWithId(TREATEMENTS, cell.getValue<string>()).title,
    accessorKey: TREATMENT1,
    header: TREATMENT1_H,
    Edit: ({ row }: { row: MRT_Row<PRecord> }) => treatmentEdit(row, originalPRecord),
    muiTableHeadCellProps: {
      align: "center",
    },
    muiTableBodyCellProps: {
      align: "left",
    },
  };
};
export const quantitytreat1Column: MRT_ColumnDef<PRecord> = {
  accessorKey: QUANTITYTREAT1,
  header: QUANTITYTREAT1_H,
  size: SHORT_CENTER_JUSTIFIED_COLUMN_LENGTH, //medium column
  muiTableHeadCellProps: {
    align: "center",
  },
  muiTableBodyCellProps: {
    align: "center",
  },
};
export const treatmentRoomColumn: MRT_ColumnDef<PRecord> = {
  accessorKey: TREATMENT_ROOM,
  header: TREATMENT_ROOM_H,
  size: MEDIUM_CENTER_JUSTIFIED_COLUMN_LENGTH, //medium column
  muiTableHeadCellProps: {
    align: "center",
  },
  muiTableBodyCellProps: {
    align: "center",
  },
};
export const doctorColumn = (originalPRecord: MutableRefObject<PRecord | undefined>): MRT_ColumnDef<PRecord> => {
  return {
    accessorKey: DOCTOR,
    header: DOCTOR_H,
    size: SHORT_CENTER_JUSTIFIED_COLUMN_LENGTH, //medium column
    filterFn: (row, id, filterValue) => staffFilterFn(row.getValue(id), filterValue, DOCTORS),
    Edit: ({ row }: { row: MRT_Row<PRecord> }) => StaffEdit(row, originalPRecord, DOCTORS, DOCTOR, DOCTOR_H),
    Cell: ({ cell, column }) => nameChipCell(cell, column, DOCTORS),
    muiTableHeadCellProps: {
      align: "center",
    },
    muiTableBodyCellProps: {
      align: "center",
    },
  };
};
export const anesthesiaNoteColumn: MRT_ColumnDef<PRecord> = {
  accessorKey: ANESTHESIANOTE,
  header: ANESTHESIANOTE_H,
  muiTableHeadCellProps: {
    align: "center",
  },
};
export const skincareSpecialist1Column = (originalPRecord: MutableRefObject<PRecord | undefined>): MRT_ColumnDef<PRecord> => {
  return {
    accessorKey: SKINCARESPECIALIST1,
    header: SKINCARESPECIALIST1_H,
    filterFn: (row, id, filterValue) => staffFilterFn(row.getValue(id), filterValue, DOCTORS),
    Edit: ({ row }: { row: MRT_Row<PRecord> }) => StaffEdit(row, originalPRecord, DOCTORS, SKINCARESPECIALIST1, SKINCARESPECIALIST1_H),
    Cell: ({ cell, column }) => nameChipCell(cell, column, DOCTORS),
    size: SHORT_CENTER_JUSTIFIED_COLUMN_LENGTH, //medium column
    muiTableHeadCellProps: {
      align: "center",
    },
    muiTableBodyCellProps: {
      align: "center",
    },
  };
};
export const skincareSpecialist2Column = (originalPRecord: MutableRefObject<PRecord | undefined>): MRT_ColumnDef<PRecord> => {
  return {
    accessorKey: SKINCARESPECIALIST2,
    header: SKINCARESPECIALIST2_H,
    filterFn: (row, id, filterValue) => staffFilterFn(row.getValue(id), filterValue, DOCTORS),
    Edit: ({ row }: { row: MRT_Row<PRecord> }) => StaffEdit(row, originalPRecord, DOCTORS, SKINCARESPECIALIST2, SKINCARESPECIALIST2_H),
    Cell: ({ cell, column }) => nameChipCell(cell, column, DOCTORS),
    size: SHORT_CENTER_JUSTIFIED_COLUMN_LENGTH,
    muiTableHeadCellProps: {
      align: "center",
    },
    muiTableBodyCellProps: {
      align: "center",
    },
  };
};
export const nursingStaff1Column = (originalPRecord: MutableRefObject<PRecord | undefined>): MRT_ColumnDef<PRecord> => {
  return {
    accessorKey: NURSINGSTAFF1,
    header: NURSINGSTAFF1_H,
    filterFn: (row, id, filterValue) => staffFilterFn(row.getValue(id), filterValue, DOCTORS),
    Edit: ({ row }: { row: MRT_Row<PRecord> }) => StaffEdit(row, originalPRecord, DOCTORS, NURSINGSTAFF1, NURSINGSTAFF1_H),
    Cell: ({ cell, column }) => nameChipCell(cell, column, DOCTORS),
    size: SHORT_CENTER_JUSTIFIED_COLUMN_LENGTH,
    muiTableHeadCellProps: {
      align: "center",
    },
    muiTableBodyCellProps: {
      align: "center",
    },
  };
};
export const nursingStaff2Column = (originalPRecord: MutableRefObject<PRecord | undefined>): MRT_ColumnDef<PRecord> => {
  return {
    accessorKey: NURSINGSTAFF2,
    header: NURSINGSTAFF2_H,
    filterFn: (row, id, filterValue) => staffFilterFn(row.getValue(id), filterValue, DOCTORS),
    Edit: ({ row }: { row: MRT_Row<PRecord> }) => StaffEdit(row, originalPRecord, DOCTORS, NURSINGSTAFF2, NURSINGSTAFF2_H),
    Cell: ({ cell, column }) => nameChipCell(cell, column, DOCTORS),
    size: SHORT_CENTER_JUSTIFIED_COLUMN_LENGTH,
    muiTableHeadCellProps: {
      align: "center",
    },
    muiTableBodyCellProps: {
      align: "center",
    },
  };
};
export const coordinatorColumn = (originalPRecord: MutableRefObject<PRecord | undefined>): MRT_ColumnDef<PRecord> => {
  return {
    accessorKey: COORDINATOR,
    header: COORDINATOR_H,
    Edit: ({ row }: { row: MRT_Row<PRecord> }) => StaffEdit(row, originalPRecord, DOCTORS, COORDINATOR, COORDINATOR_H),
    Cell: ({ cell, column }) => nameChipCell(cell, column, DOCTORS),
    size: SHORT_CENTER_JUSTIFIED_COLUMN_LENGTH,
    muiTableHeadCellProps: {
      align: "center",
    },
    muiTableBodyCellProps: {
      align: "center",
    },
  };
};
export const consultantColumn = (originalPRecord: MutableRefObject<PRecord | undefined>): MRT_ColumnDef<PRecord> => {
  return {
    accessorKey: CONSULTANT,
    header: CONSULTANT_H,
    filterFn: (row, id, filterValue) => staffFilterFn(row.getValue(id), filterValue, DOCTORS),
    Edit: ({ row }: { row: MRT_Row<PRecord> }) => StaffEdit(row, originalPRecord, DOCTORS, CONSULTANT, CONSULTANT_H),
    Cell: ({ cell, column }) => nameChipCell(cell, column, DOCTORS),
    size: SHORT_CENTER_JUSTIFIED_COLUMN_LENGTH,
    muiTableHeadCellProps: {
      align: "center",
    },
    muiTableBodyCellProps: {
      align: "center",
    },
  };
};
export const commentCautionColumn: MRT_ColumnDef<PRecord> = {
  accessorKey: COMMENTCAUTION,
  header: COMMENTCAUTION_H,
  muiTableHeadCellProps: {
    align: "center",
  },
};

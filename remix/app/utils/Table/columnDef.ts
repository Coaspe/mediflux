import { MRT_ColumnDef, MRT_Row } from "material-react-table";
import { TREATMENTS } from "shared";
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
  TREATMENT1,
  TREATMENT1_H,
  QUANTITYTREAT1,
  QUANTITYTREAT1_H,
  TREATMENT_ROOM,
  TREATMENT_ROOM_H,
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
  SHORT_CENTER_JUSTIFIED_COLUMN_LENGTH,
  MEDIUM_CENTER_JUSTIFIED_COLUMN_LENGTH,
} from "~/constant";
import { SearchHelp, PRecord, TableType, User, OpReadiness } from "~/type";
import { getValueWithId } from "../utils";
import { Dispatch, MutableRefObject, SetStateAction } from "react";
import { ColDef } from "ag-grid-community";
import { CustomCellEditorProps, CustomCellRendererProps } from "ag-grid-react";

export const staffFilterFn = (id: unknown, searchHelp: SearchHelp[]) => {
  console.log(id, searchHelp);

  const record = searchHelp.find((ele) => ele.id === id);
  const title = record?.title;
  return title;
};
export const checkinTimeColumn: ColDef<PRecord, number> = {
  field: CHECK_IN_TIME,
  filter: true,
  headerName: CHECK_IN_TIME_H,
  cellRenderer: ({ value }: CustomCellRendererProps) => checkInTimeCell(value),
  cellEditor: ({ value, onValueChange }: CustomCellEditorProps) => checkInTimeEdit(value, onValueChange),
};

export const chartNumberColumn: ColDef<PRecord, string> = {
  field: CHART_NUMBER,
  comparator: (valueA, valueB, nodeA, nodeB, isDescending) => parseInt(valueA ? valueA : "0") - parseInt(valueB ? valueB : "0"),
  headerName: CHART_NUMBER_H,
};

export const patientNameColumn: ColDef<PRecord, string> = {
  field: PATIENT_NAME,
  headerName: PATIENT_NAME_H,
};

export const opReadinessColumn: ColDef<PRecord, OpReadiness> = {
  field: OP_READINESS,
  headerName: OP_READINESS_H,
  cellRenderer: ({ value }: CustomCellRendererProps) => opReadinessCell(value),
  // editSelectOptions: ({}) =>
  //   tableType === "Ready"
  //     ? [{ label: "준비 완료 (Y)", value: "Y" }]
  //     : [
  //         { label: "준비 완료 (Y)", value: "Y" },
  //         { label: "준비 미완료 (N)", value: "N" },
  //         { label: "시술 완료 (C)", value: "C" },
  //         { label: "시술 중 (P)", value: "P" },
  //       ],
  // size: SHORT_CENTER_JUSTIFIED_COLUMN_LENGTH, // medium column
  // muiTableHeadCellProps: {
  //   align: "center",
  // },
  // muiTableBodyCellProps: ({ row }) => {
  //   return {
  //     align: "center",
  //     onDoubleClick: (event) => {
  //       if (setOpenStatusModal) {
  //         event.stopPropagation();
  //         actionPRecord.current = JSON.parse(JSON.stringify(row.original));
  //         setOpenStatusModal(true);
  //       }
  //     },
  //   };
  // },
  // muiEditTextFieldProps: {
  //   required: true,
  //   defaultValue: "Y",
  // },
};

export const treatment1Column: ColDef<PRecord, string> = {
  field: TREATMENT1,
  headerName: TREATMENT1_H,
  cellRenderer: ({ value }: CustomCellRendererProps) => getValueWithId(TREATMENTS, value).title,
  cellEditor: treatmentEdit,
};
export const quantitytreat1Column: ColDef<PRecord, number> = {
  field: QUANTITYTREAT1,
  headerName: QUANTITYTREAT1_H,
};
export const treatmentRoomColumn: ColDef<PRecord, number> = {
  field: TREATMENT_ROOM,
  headerName: TREATMENT_ROOM_H,
};

const personComparator = (searchHelp: SearchHelp[], valueA: string | null | undefined, valueB: string | null | undefined) => {
  if (!valueA && !valueB) {
    return 0;
  }
  if (!valueA) {
    return -1;
  }
  if (!valueB) {
    return 1;
  }
  const a = searchHelp[searchHelp.findIndex((val) => val.id === valueA)].title;
  const b = searchHelp[searchHelp.findIndex((val) => val.id === valueB)].title;
  if (a <= b) {
    return 1;
  } else {
    return -1;
  }
};

export const personColumn = (field: string, headerName: string, searchHelp: SearchHelp[]): ColDef<PRecord, string> => {
  return {
    field,
    headerName,
    comparator: (valueA, valueB) => personComparator(searchHelp, valueA, valueB),
    cellEditor: ({ colDef, onValueChange, data }: CustomCellEditorProps<PRecord, string>) => StaffEdit(data, searchHelp, colDef.headerName, headerName, onValueChange),
    cellRenderer: ({ value, colDef }: CustomCellRendererProps) => nameChipCell(colDef?.headerName, searchHelp, value),
  };
};

export const doctorColumn: ColDef<PRecord, string> = personColumn(DOCTOR, DOCTOR_H, DOCTORS);

export const anesthesiaNoteColumn: ColDef<PRecord, string> = {
  field: ANESTHESIANOTE,
  headerName: ANESTHESIANOTE_H,
};
export const skincareSpecialist1Column: ColDef<PRecord, string> = personColumn(SKINCARESPECIALIST1, SKINCARESPECIALIST1_H, DOCTORS);
export const skincareSpecialist2Column: ColDef<PRecord, string> = personColumn(SKINCARESPECIALIST2, SKINCARESPECIALIST2_H, DOCTORS);
export const nursingStaff1Column: ColDef<PRecord, string> = personColumn(NURSINGSTAFF1, NURSINGSTAFF1_H, DOCTORS);
export const nursingStaff2Column: ColDef<PRecord, string> = personColumn(NURSINGSTAFF2, NURSINGSTAFF2_H, DOCTORS);
export const coordinatorColumn: ColDef<PRecord, string> = personColumn(COORDINATOR, COMMENTCAUTION_H, DOCTORS);
export const consultantColumn: ColDef<PRecord, string> = personColumn(CONSULTANT, CONSULTANT_H, DOCTORS);

export const commentCautionColumn: ColDef<PRecord, string> = {
  field: COMMENTCAUTION,
  headerName: COMMENTCAUTION_H,
};

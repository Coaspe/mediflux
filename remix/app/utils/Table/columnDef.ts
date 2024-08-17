/** @format */

import { checkInTimeCell, checkInTimeEdit, opReadinessCell, nameChipRendererByFieldname, treatmentCell, autoCompleteEdit } from "~/components/Table/ColumnRenderers";
import {
  CHECK_IN_TIME,
  CHECK_IN_TIME_H,
  CHART_NUMBER,
  CHART_NUMBER_H,
  PATIENT_NAME,
  PATIENT_NAME_H,
  OP_READINESS,
  OP_READINESS_H,
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
  CONSULTANT,
  CONSULTANT_H,
  COMMENTCAUTION,
  COMMENTCAUTION_H,
  SHORT_CENTER_JUSTIFIED_COLUMN_LENGTH,
  SHORT_COLUMN_LENGTH,
  COORDINATOR_H,
  OPREADINESS_SEARCH_HELP,
  DOCTOR_SEARCH_HELP,
} from "~/constant";
import { SearchHelp, PRecord, OpReadiness, TableType } from "~/type";
import { ColDef } from "ag-grid-community";
import { AgGridReact, CustomCellEditorProps, CustomCellRendererProps } from "ag-grid-react";
import { RefObject } from "react";
import { TREATMENTS } from "shared";
import { isCellEditable } from "material-react-table";

export const staffFilterFn = (id: unknown, searchHelp: SearchHelp[]) => {
  const record = searchHelp.find((ele) => ele.id === id);
  const title = record?.title;
  return title;
};
export const checkinTimeColumn: ColDef<PRecord, number> = {
  field: CHECK_IN_TIME,
  filter: true,
  checkboxSelection: true,
  headerName: CHECK_IN_TIME_H,
  cellRenderer: ({ value }: CustomCellRendererProps) => checkInTimeCell(value),
  cellEditor: ({ value, onValueChange }: CustomCellEditorProps) => checkInTimeEdit(value, onValueChange),
};

export const chartNumberColumn: ColDef<PRecord, string> = {
  field: CHART_NUMBER,
  width: 100,
  comparator: (valueA, valueB) => parseInt(valueA ? valueA : "0") - parseInt(valueB ? valueB : "0"),
  headerName: CHART_NUMBER_H,
};

export const patientNameColumn: ColDef<PRecord, string> = {
  field: PATIENT_NAME,
  headerName: PATIENT_NAME_H,
  width: SHORT_COLUMN_LENGTH,
};

export const opReadinessColumn = {
  field: OP_READINESS,
  headerName: OP_READINESS_H,
  cellRenderer: opReadinessCell,
  editable: false,
  width: 70,
  cellStyle: () => {
    return {
      alignItems: "center",
      justifyContent: "center",
      display: "flex",
    };
  },
};

export const treatmentColumn = (field: string, headerName: string, tableType: TableType): ColDef<PRecord, string> => {
  return {
    field,
    headerName,
    cellRenderer: (arg: CustomCellRendererProps) => treatmentCell(arg, tableType),
    cellEditor: (arg: CustomCellEditorProps) => autoCompleteEdit(arg, TREATMENTS),
    width: 150,
    editable: (params) => {
      const number = params.colDef.field?.charAt(params.colDef.field?.length - 1);
      return !(params.data && params.data[`treatmentEnd${number}`]);
    },
  };
};
export const quantitytreat1Column: ColDef<PRecord, number> = {
  field: QUANTITYTREAT1,
  headerName: QUANTITYTREAT1_H,
  width: 70,
};
export const treatmentRoomColumn: ColDef<PRecord, number> = {
  field: TREATMENT_ROOM,
  headerName: TREATMENT_ROOM_H,
  width: 70,
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

export const personColumn = (field: string, headerName: string, searchHelp: SearchHelp[], gridRef: RefObject<AgGridReact<PRecord>>): ColDef<PRecord, string> => {
  return {
    field,
    headerName,
    width: 150,
    comparator: (valueA, valueB) => personComparator(searchHelp, valueA, valueB),
    cellEditor: (arg: CustomCellEditorProps) => autoCompleteEdit(arg, searchHelp),
    cellRenderer: ({ value, colDef }: CustomCellRendererProps) => nameChipRendererByFieldname(colDef?.headerName, searchHelp, value),
  };
};

export const doctorColumn = (gridRef: RefObject<AgGridReact<PRecord>>): ColDef<PRecord, string> => personColumn(DOCTOR, DOCTOR_H, DOCTOR_SEARCH_HELP, gridRef);
export const anesthesiaNoteColumn: ColDef<PRecord, string> = { field: ANESTHESIANOTE, headerName: ANESTHESIANOTE_H };
export const skincareSpecialist1Column = (gridRef: RefObject<AgGridReact<PRecord>>): ColDef<PRecord, string> => personColumn(SKINCARESPECIALIST1, SKINCARESPECIALIST1_H, DOCTOR_SEARCH_HELP, gridRef);
export const skincareSpecialist2Column = (gridRef: RefObject<AgGridReact<PRecord>>): ColDef<PRecord, string> => personColumn(SKINCARESPECIALIST2, SKINCARESPECIALIST2_H, DOCTOR_SEARCH_HELP, gridRef);
export const nursingStaff1Column = (gridRef: RefObject<AgGridReact<PRecord>>): ColDef<PRecord, string> => personColumn(NURSINGSTAFF1, NURSINGSTAFF1_H, DOCTOR_SEARCH_HELP, gridRef);
export const nursingStaff2Column = (gridRef: RefObject<AgGridReact<PRecord>>): ColDef<PRecord, string> => personColumn(NURSINGSTAFF2, NURSINGSTAFF2_H, DOCTOR_SEARCH_HELP, gridRef);
export const coordinatorColumn = (gridRef: RefObject<AgGridReact<PRecord>>): ColDef<PRecord, string> => personColumn(COORDINATOR, COORDINATOR_H, DOCTOR_SEARCH_HELP, gridRef);
export const consultantColumn = (gridRef: RefObject<AgGridReact<PRecord>>): ColDef<PRecord, string> => personColumn(CONSULTANT, CONSULTANT_H, DOCTOR_SEARCH_HELP, gridRef);
export const commentCautionColumn: ColDef<PRecord, string> = { field: COMMENTCAUTION, headerName: COMMENTCAUTION_H };

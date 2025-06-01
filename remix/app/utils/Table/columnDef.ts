/** @format */

import { createdAtCell, createdAtEdit, opReadinessCell, nameChipRendererByFieldname, treatmentCell, autoCompleteEdit, deleteCell } from "~/components/Table/ColumnRenderers";
import {
  CREATED_AT,
  CREATED_AT_H,
  CHART_NUMBER,
  CHART_NUMBER_H,
  PATIENT_NAME,
  PATIENT_NAME_H,
  OP_READINESS,
  OP_READINESS_H,
  QUANTITY_TREAT1,
  QUANTITY_TREAT1_H,
  TREATMENT_ROOM,
  TREATMENT_ROOM_H,
  DOCTOR,
  DOCTOR_H,
  ANESTHESIA_NOTE,
  ANESTHESIA_NOTE_H,
  SKINCARE_SPECIALIST1,
  SKINCARE_SPECIALIST1_H,
  SKINCARE_SPECIALIST2,
  SKINCARE_SPECIALIST2_H,
  NURSING_STAFF1,
  NURSING_STAFF1_H,
  NURSING_STAFF2,
  NURSING_STAFF2_H,
  COORDINATOR,
  CONSULTANT,
  CONSULTANT_H,
  COMMENT_CAUTION,
  COMMENT_CAUTION_H,
  SHORT_COLUMN_LENGTH,
  COORDINATOR_H,
  DOCTOR_SEARCH_HELP,
  MEDIUM_COLUMN_LENGTH,
  LONG_COLUMN_LENGTH,
  POINT_COLUMN_LENGTH,
  TREATMENT_END,
  GROUP,
  GROUP_H,
  POINT,
  POINT_H,
  DURATION,
  DURATION_H,
  PRICE,
  PRICE_H,
  DELETE,
  DELETE_H,
  TREATMENT_NAME_COLUMN,
} from "~/constants/constant";
import { TREATMENT1, TREATMENT1_H, TREATMENT2, TREATMENT2_H, TREATMENT3, TREATMENT3_H, TREATMENT4, TREATMENT4_H, TREATMENT5, TREATMENT5_H, LOCKING_USER } from "~/constants/constant";
import { SearchHelp, TableType, GlobalSnackBark, Treatment, CustomAgGridReactProps, MessageSeverity } from "~/types/type";
import { ColDef } from "ag-grid-community";
import { CustomCellEditorProps, CustomCellRendererProps } from "ag-grid-react";
import { findCanCompleteTreatmentNumber, formatNumberWithCommas } from "../utils";
import { SetterOrUpdater } from "recoil";
import { PRecord } from "shared";
import { RefObject } from "react";

export const staffFilterFn = (id: string | number, searchHelp: SearchHelp[]) => {
  const record = searchHelp.find((ele) => ele.id == id);
  const title = record?.title;
  return title;
};
export const createdAtColumn: ColDef<PRecord, number> = {
  field: CREATED_AT,
  filter: true,
  checkboxSelection: true,
  headerName: CREATED_AT_H,
  cellRenderer: ({ value }: CustomCellRendererProps) => createdAtCell(value),
  cellEditor: ({ value, onValueChange }: CustomCellEditorProps) => createdAtEdit(value, onValueChange),
  cellStyle: { justifyContent: "left" },
};

export const chartNumberColumn: ColDef<PRecord, string> = {
  field: CHART_NUMBER,
  filter: true,

  width: MEDIUM_COLUMN_LENGTH,
  comparator: (valueA, valueB) => parseInt(valueA ? valueA : "0") - parseInt(valueB ? valueB : "0"),
  headerName: CHART_NUMBER_H,
};

export const patientNameColumn: ColDef<PRecord, string> = {
  field: PATIENT_NAME,
  filter: true,
  headerName: PATIENT_NAME_H,
  width: MEDIUM_COLUMN_LENGTH,
};

export const opReadinessColumn = {
  field: OP_READINESS,
  headerName: OP_READINESS_H,
  cellRenderer: opReadinessCell,
  editable: false,
  width: MEDIUM_COLUMN_LENGTH,
  cellStyle: () => {
    return {
      alignItems: "center",
      justifyContent: "center",
      display: "flex",
    };
  },
};

export const treatmentColumn = (field: string, headerName: string, tableType: TableType, searchHelp: SearchHelp[], gridRef: RefObject<CustomAgGridReactProps<PRecord>>): ColDef<PRecord, string> => {
  return {
    field,
    headerName,
    cellRenderer: (arg: CustomCellRendererProps) => treatmentCell(arg, gridRef, tableType),
    cellEditor: (arg: CustomCellEditorProps) => autoCompleteEdit(arg, searchHelp),
    width: TREATMENT_NAME_COLUMN,
    editable: (params) => {
      const number = params.colDef.field?.charAt(params.colDef.field?.length - 1);
      return !(params.data && params.data[`${TREATMENT_END}${number}`]);
    },
  };
};
export const quantitytreat1Column: ColDef<PRecord, number> = {
  field: QUANTITY_TREAT1,
  headerName: QUANTITY_TREAT1_H,
  width: SHORT_COLUMN_LENGTH,
};
export const treatmentRoomColumn: ColDef<PRecord, number> = {
  field: TREATMENT_ROOM,
  headerName: TREATMENT_ROOM_H,
  width: SHORT_COLUMN_LENGTH + 10,
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
export const personColumn = (field: string, headerName: string, searchHelp: SearchHelp[], showErrorSnackbar?: (mesage: string, severity: MessageSeverity) => void): ColDef<PRecord, string> => {
  const isDoctor = field === DOCTOR;
  return {
    field,
    filter: true,
    headerName,
    width: LONG_COLUMN_LENGTH,
    editable: !isDoctor,
    onCellDoubleClicked: () => showErrorSnackbar?.("시술을 시작하면 자동으로 입력됩니다.", "warning"),
    comparator: (valueA, valueB) => personComparator(searchHelp, valueA, valueB),
    cellEditor: (arg: CustomCellEditorProps) => autoCompleteEdit(arg, searchHelp),
    cellRenderer: ({ value, colDef, data }: CustomCellRendererProps) => {
      let number = -1;
      if (data && isDoctor) {
        number = findCanCompleteTreatmentNumber(data);
      }
      return nameChipRendererByFieldname(colDef?.headerName, searchHelp, number !== -1 && data ? data[`${DOCTOR}${number}`] : value);
    },
  };
};

export const doctorColumn = (doctorSearchHelp: SearchHelp[], showErrorSnackbar?: (mesage: string, severity: MessageSeverity) => void): ColDef<PRecord, string> =>
  personColumn(DOCTOR, DOCTOR_H, doctorSearchHelp, showErrorSnackbar);
export const anesthesiaNoteColumn: ColDef<PRecord, string> = { field: ANESTHESIA_NOTE, headerName: ANESTHESIA_NOTE_H, width: MEDIUM_COLUMN_LENGTH };
export const skincareSpecialist1Column: ColDef<PRecord, string> = personColumn(SKINCARE_SPECIALIST1, SKINCARE_SPECIALIST1_H, DOCTOR_SEARCH_HELP);
export const skincareSpecialist2Column: ColDef<PRecord, string> = personColumn(SKINCARE_SPECIALIST2, SKINCARE_SPECIALIST2_H, DOCTOR_SEARCH_HELP);
export const nursingStaff1Column: ColDef<PRecord, string> = personColumn(NURSING_STAFF1, NURSING_STAFF1_H, DOCTOR_SEARCH_HELP);
export const nursingStaff2Column: ColDef<PRecord, string> = personColumn(NURSING_STAFF2, NURSING_STAFF2_H, DOCTOR_SEARCH_HELP);
export const coordinatorColumn: ColDef<PRecord, string> = personColumn(COORDINATOR, COORDINATOR_H, DOCTOR_SEARCH_HELP);
export const consultantColumn: ColDef<PRecord, string> = personColumn(CONSULTANT, CONSULTANT_H, DOCTOR_SEARCH_HELP);
export const commentCautionColumn: ColDef<PRecord, string> = { field: COMMENT_CAUTION, headerName: COMMENT_CAUTION_H };

export const treatmentGroupColumn = (): ColDef<Treatment, string> => {
  return {
    field: GROUP,
    headerName: GROUP_H,
    width: POINT_COLUMN_LENGTH,
  };
};

export const treatmentPointColumn = (): ColDef<Treatment, number> => {
  return {
    field: POINT,
    headerName: POINT_H,
    width: POINT_COLUMN_LENGTH,
    type: "number",
  };
};

export const treatmentDurationColumn = (): ColDef<Treatment, number> => {
  return {
    field: DURATION,
    headerName: DURATION_H,
    width: MEDIUM_COLUMN_LENGTH,
    type: "number",
  };
};

export const treatmentPriceColumn = (): ColDef<Treatment, number> => {
  return {
    field: PRICE,
    headerName: PRICE_H,
    width: SHORT_COLUMN_LENGTH,
    type: "number",
    cellRenderer: (params: CustomCellRendererProps) => formatNumberWithCommas(params.value),
  };
};
export const treatementDeleteColumn = (setGlobalSnackbar: SetterOrUpdater<GlobalSnackBark>, clinic: string): ColDef<Treatment, any> => {
  return {
    field: DELETE,
    headerName: DELETE_H,
    width: SHORT_COLUMN_LENGTH,
    cellStyle: () => {
      return {
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
      };
    },
    cellRenderer: ({ data, api }: CustomCellRendererProps) => deleteCell(data, setGlobalSnackbar, api, clinic),
  };
};

export const getColumnDefs = (
  tableType: TableType,
  treatmentSearchHelp: SearchHelp[],
  doctorSearchHelp: SearchHelp[],
  gridRef: React.RefObject<CustomAgGridReactProps<PRecord>>,
  showErrorSnackbar: (message: string) => void
): ColDef<PRecord, any>[] => {
  return [
    { field: "id", headerName: "id", hide: true },
    createdAtColumn,
    chartNumberColumn,
    patientNameColumn,
    opReadinessColumn,
    treatmentRoomColumn,
    treatmentColumn(TREATMENT1, TREATMENT1_H, tableType, treatmentSearchHelp, gridRef),
    treatmentColumn(TREATMENT2, TREATMENT2_H, tableType, treatmentSearchHelp, gridRef),
    treatmentColumn(TREATMENT3, TREATMENT3_H, tableType, treatmentSearchHelp, gridRef),
    treatmentColumn(TREATMENT4, TREATMENT4_H, tableType, treatmentSearchHelp, gridRef),
    treatmentColumn(TREATMENT5, TREATMENT5_H, tableType, treatmentSearchHelp, gridRef),
    quantitytreat1Column,
    doctorColumn(doctorSearchHelp, showErrorSnackbar),
    anesthesiaNoteColumn,
    skincareSpecialist1Column,
    skincareSpecialist2Column,
    nursingStaff1Column,
    nursingStaff2Column,
    coordinatorColumn,
    consultantColumn,
    commentCautionColumn,
    { field: LOCKING_USER, headerName: "", hide: true },
  ];
};

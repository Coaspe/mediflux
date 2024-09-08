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
} from "~/constant";
import { SearchHelp, PRecord, TableType, GlobalSnackBark, Treatment } from "~/type";
import { ColDef } from "ag-grid-community";
import { CustomCellEditorProps, CustomCellRendererProps } from "ag-grid-react";
import { findCanCompleteTreatmentNumber } from "../utils";
import { SetterOrUpdater } from "recoil";

export const staffFilterFn = (id: unknown, searchHelp: SearchHelp[]) => {
  const record = searchHelp.find((ele) => ele.id === id);
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
  width: MEDIUM_COLUMN_LENGTH,
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
  width: SHORT_COLUMN_LENGTH,
  cellStyle: () => {
    return {
      alignItems: "center",
      justifyContent: "center",
      display: "flex",
    };
  },
};

export const treatmentColumn = (field: string, headerName: string, tableType: TableType, searchHelp: SearchHelp[]): ColDef<PRecord, string> => {
  return {
    field,
    headerName,
    cellRenderer: (arg: CustomCellRendererProps) => treatmentCell(arg, tableType),
    cellEditor: (arg: CustomCellEditorProps) => autoCompleteEdit(arg, searchHelp),
    width: LONG_COLUMN_LENGTH,
    editable: (params) => {
      const number = params.colDef.field?.charAt(params.colDef.field?.length - 1);
      return !(params.data && params.data[`treatmentEnd${number}`]);
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
export const personColumn = (field: string, headerName: string, searchHelp: SearchHelp[], setGlobalSnackbar?: SetterOrUpdater<GlobalSnackBark>): ColDef<PRecord, string> => {
  const isDoctor = "doctor" === field;
  return {
    field,
    headerName,
    width: LONG_COLUMN_LENGTH,
    editable: !isDoctor,
    onCellDoubleClicked: () => setGlobalSnackbar?.({ open: true, msg: "시술을 시작하면 자동으로 입력됩니다.", severity: "warning" }),
    comparator: (valueA, valueB) => personComparator(searchHelp, valueA, valueB),
    cellEditor: (arg: CustomCellEditorProps) => autoCompleteEdit(arg, searchHelp),
    cellRenderer: ({ value, colDef, data }: CustomCellRendererProps) => {
      let number = -1;
      if (data && isDoctor) {
        number = findCanCompleteTreatmentNumber(data);
      }
      return nameChipRendererByFieldname(colDef?.headerName, searchHelp, number !== -1 && data ? data[`doctor${number}`] : value);
    },
  };
};

export const doctorColumn = (doctorSearchHelp: SearchHelp[], setGlobalSnackbar?: SetterOrUpdater<GlobalSnackBark>): ColDef<PRecord, string> =>
  personColumn(DOCTOR, DOCTOR_H, doctorSearchHelp, setGlobalSnackbar);
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
    field: "group",
    headerName: "그룹",
    width: POINT_COLUMN_LENGTH,
  };
};

export const treatmentPointColumn = (): ColDef<Treatment, number> => {
  return {
    field: "point",
    headerName: "포인트",
    width: POINT_COLUMN_LENGTH,
    type: "number",
  };
};

export const treatmentDurationColumn = (): ColDef<Treatment, number> => {
  return {
    field: "duration",
    headerName: "시술 시간",
    width: MEDIUM_COLUMN_LENGTH,
    type: "number",
  };
};

export const treatmentPriceColumn = (): ColDef<Treatment, number> => {
  return {
    field: "price",
    headerName: "가격",
    width: SHORT_COLUMN_LENGTH,
    type: "number",
  };
};
export const treatementDeleteColumn = (setGlobalSnackbar: SetterOrUpdater<GlobalSnackBark>): ColDef<Treatment, any> => {
  return {
    field: "delete",
    headerName: "삭제",
    width: SHORT_COLUMN_LENGTH,
    cellStyle: () => {
      return {
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
      };
    },
    cellRenderer: ({ data, api }: CustomCellRendererProps) => deleteCell(data, setGlobalSnackbar, api),
  };
};

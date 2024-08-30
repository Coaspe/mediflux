/** @format */

import { SIDE_MENU } from "~/constant";
import { OverridableStringUnion } from "@mui/types";
import { ChipPropsColorOverrides } from "@mui/joy/Chip/ChipProps";
import { ServerUser, Role } from "shared";
import { CellPosition } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

export type SideMenu = (typeof SIDE_MENU)[keyof typeof SIDE_MENU];
export type User = {
  id: string;
  userid: string;
  name: string;
  resignFlag: boolean;
  image?: string;
  role?: Role;
  point?: number;
  sessionId?: string | null;
};
export type Gender = "M" | "F";
// Do not change fields order arbitrarily.
export type PRecord = {
  id: string; // Unique record id
  createdAt?: string; // TIMESTAMP (e.g., "14:08")
  chartNum?: string; // VARCHAR (15)
  patientName?: string; // VARCHAR (100)
  opReadiness?: OpReadiness; // BOOLEAN (e.g., "T", "F" interpreted as true/false)
  treatment1?: string; // VARCHAR (50)
  treatment2?: string; // VARCHAR (50), optional
  treatment3?: string; // VARCHAR (50), optional
  treatment4?: string; // VARCHAR (50), optional
  treatment5?: string; // VARCHAR (50), optional
  treatmentReady1?: string;
  treatmentReady2?: string;
  treatmentReady3?: string;
  treatmentReady4?: string;
  treatmentReady5?: string;
  treatmentStart1?: string;
  treatmentStart2?: string;
  treatmentStart3?: string;
  treatmentStart4?: string;
  treatmentStart5?: string;
  treatmentEnd1?: string;
  treatmentEnd2?: string;
  treatmentEnd3?: string;
  treatmentEnd4?: string;
  treatmentEnd5?: string;
  quantityTreat1?: number; // INTEGER
  quantityTreat2?: number; // INTEGER, optional
  quantityTreat3?: number; // INTEGER, optional
  quantityTreat4?: number; // INTEGER, optional
  quantityTreat5?: number; // INTEGER, optional
  treatmentRoom?: number; // INTEGER
  doctor1?: string; // VARCHAR (50)
  doctor2?: string; // VARCHAR (50)
  doctor3?: string; // VARCHAR (50)
  doctor4?: string; // VARCHAR (50)
  doctor5?: string; // VARCHAR (50)
  patientCareRoom?: string;
  anesthesiaNote?: string; // VARCHAR (300), optional
  skincareSpecialist1?: string; // VARCHAR (50)
  skincareSpecialist2?: string; // VARCHAR (50), optional
  nursingStaff1?: string; // VARCHAR (50)
  nursingStaff2?: string; // VARCHAR (50), optional
  coordinator?: string; // VARCHAR (50)
  consultant?: string; // VARCHAR (50)
  commentCaution?: string; // VARCHAR (300), optional
  lockingUser?: string | null;
  deleteYN?: boolean;
  [key: string]: any;
};
export type ServerPRecord = {
  record_id: string; // Unique record id
  created_at?: number; // TIMESTAMP (e.g., "14:08")
  chart_num?: string; // VARCHAR (15)
  patient_name?: string; // VARCHAR (100)
  op_readiness?: OpReadiness; // BOOLEAN (e.g., "T", "F" interpreted as true/false)
  treatment_1?: string; // VARCHAR (50)
  treatment_2?: string; // VARCHAR (50), optional
  treatment_3?: string; // VARCHAR (50), optional
  treatment_4?: string; // VARCHAR (50), optional
  treatment_5?: string; // VARCHAR (50), optional
  treatment_ready_1?: number;
  treatment_ready_2?: number;
  treatment_ready_3?: number;
  treatment_ready_4?: number;
  treatment_ready_5?: number;
  treatment_start_1?: number;
  treatment_start_2?: number;
  treatment_start_3?: number;
  treatment_start_4?: number;
  treatment_start_5?: number;
  treatment_end_1?: number;
  treatment_end_2?: number;
  treatment_end_3?: number;
  treatment_end_4?: number;
  treatment_end_5?: number;
  quantity_treat_1?: number; // INTEGER
  quantity_treat_2?: number; // INTEGER, optional
  quantity_treat_3?: number; // INTEGER, optional
  quantity_treat_4?: number; // INTEGER, optional
  quantity_treat_5?: number; // INTEGER, optional
  treatment_room?: number; // INTEGER
  patient_care_room?: string;
  doctor: string;
  doctor_1?: string; // VARCHAR (50)
  doctor_2?: string; // VARCHAR (50)
  doctor_3?: string; // VARCHAR (50)
  doctor_4?: string; // VARCHAR (50)
  doctor_5?: string; // VARCHAR (50)
  anesthesia_note?: string; // VARCHAR (300), optional
  skincare_specialist_1?: string; // VARCHAR (50)
  skincare_specialist_2?: string; // VARCHAR (50), optional
  nursing_staff_1?: string; // VARCHAR (50)
  nursing_staff_2?: string; // VARCHAR (50), optional
  coordinator?: string; // VARCHAR (50)
  consultant?: string; // VARCHAR (50)
  comment_caution?: string; // VARCHAR (300), optional
  locking_user?: string | null;
  delete_yn?: boolean;
  [key: string]: any;
};

// Do not change fields order arbitrarily.
export type Treatment = SearchHelp & {
  duration: number | null;
  point: number | null;
  price: number | null;
  searchTitle?: string;
  [key: string]: any;
};

export type TableType = "Ready" | "ExceptReady" | "Archive";
export type QueryDataName = "Ready_PRecord" | "ExceptReady_PRecord" | "Archive_PRecord";
export type ChipColor = OverridableStringUnion<"default" | "error" | "primary" | "secondary" | "info" | "success" | "warning", ChipPropsColorOverrides>;
export type OpReadiness = "Y" | "N" | "C" | "P";
export type SearchHelp = {
  id: string;
  group: string;
  title: string;
};
export type Interval = "day" | "week" | "month" | "year";
export type LoginForm = {
  userId: string;
  password: string;
};

export type RegisgerForm = {
  userId: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
};

export type IdError = 1;
export type PasswordError = 2;
export type EtcError = 3;

export type LoginResponse = {
  errorType?: IdError | PasswordError | EtcError;
  message?: string;
  status: number;
  user: ServerUser;
};

export type FocusedRow = {
  cellPosition: CellPosition;
  rowId: string;
  tableType: TableType;
};

export type PRecordWithFocusedRow = FocusedRow & PRecord;

export interface CustomAgGridReactProps<TData> extends AgGridReact<TData> {
  tableType: TableType;
}

export type GlobalSnackBark = { open: boolean; msg: string; severity: "error" | "info" | "success" | "warning" };

export type ChartData = {
  name: string;
  numOfPRecords: number;
};

export type TreatmentRoom = {
  room: string;
  roomChartNum?: string;
};

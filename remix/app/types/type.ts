/** @format */

import { SIDE_MENU } from "~/constant";
import { OverridableStringUnion } from "@mui/types";
import { ChipPropsColorOverrides } from "@mui/joy/Chip/ChipProps";
import { ServerUser, Role, PRecord } from "shared";
import { CellPosition } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

export type CustomResponse = {
  statusCode: number;
  body: {
    data?: any;
    error?: string;
  };
};
export type SideMenu = (typeof SIDE_MENU)[keyof typeof SIDE_MENU];
export type User = {
  id: string;
  loginId: string;
  name: string;
  clinic: string;
  role?: Role;
  sessionId?: string | null;
};
export type Gender = "M" | "F";
export type SearchableType = { searchTitle?: string };

// Do not change fields order arbitrarily.
export type Treatment = SearchHelp &
  SearchableType & {
    duration?: number;
    point?: number;
    price?: number;
    [key: string]: any;
  };
export type ServerTreatment = {
  tr_id: string;
  tr_group?: string;
  tr_title?: string;
  tr_duration?: number;
  tr_point?: number;
  tr_price?: number;
};
export type TableType = "Ready" | "ExceptReady" | "Archive";
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

export type Member = SearchableType & {
  id: string;
  name: string;
  numOfTreatments: number;
  revenue: number;
  performedTreatments: { [key: string]: number };
};

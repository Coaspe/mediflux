/** @format */

import { Role, ServerUser, PRecord, ServerPRecord, OpReadiness } from "shared";
import {
  EMPTY_SEARCHHELP,
  SideMenu,
  TREATMENT_NUMBERS,
  TREATMENT,
  TREATMENT_START,
  TREATMENT_END,
  TREATMENT_READY,
  OP_READINESS,
  DOCTOR,
  ON_LINE_CHANGING_TRANSACTION_APPLIED,
} from "~/constants/constant";
import { CustomAgGridReactProps, SearchHelp, TableType, Treatment, User } from "~/types/type";
import { MutableRefObject, RefObject } from "react";
import { GridApi, RowDataTransaction } from "ag-grid-community";
import CryptoJS from "crypto-js";
import { SetterOrUpdater } from "recoil";
import { getAllTreatments, getAllRoleEmployees } from "./request";

export const getMenuName = (menu?: SideMenu): string => {
  switch (menu) {
    case SideMenu.SCHEDULING:
      return "Scheduling";
    case SideMenu.ARCHIVE:
      return "Archive";
    case SideMenu.MEMBERS:
      return "Members";
    case SideMenu.TREATMENTS:
      return "Treatments";
    default:
      return "";
  }
};

export const getRoleName = (role: Role): string => {
  switch (role) {
    case Role.DOCTOR:
      return "Doctor";
    case Role.NURSE:
      return "Nurse";
    default:
      return "Staff";
  }
};

export const getValueWithId = (searchHelp: SearchHelp[], id?: string): SearchHelp => {
  return searchHelp.find((element) => element.id == id) || EMPTY_SEARCHHELP;
};

export const convertServerUserToClientUser = (user: ServerUser): User => {
  const convertedUser = convertToCamelCaseObject<User>(user);
  return { ...convertedUser, id: user.id, role: user.role, name: `${user.first_name}${user.last_name}` };
};

const snakeToCamel = (origin: string): string => origin.replace(/_./g, (s) => s.charAt(1).toUpperCase());

export const convertToCamelCaseObject = <T>(source: { [key: string]: any }): T => {
  const result = {} as T;
  Object.keys(source).forEach((key) => {
    const camelKey = snakeToCamel(key);
    result[camelKey as keyof T] = source[key];
  });
  return result;
};

export const convertServerPRecordToPRecord = (serverRecord: ServerPRecord): PRecord => {
  const convertedRecord = convertToCamelCaseObject<PRecord>(serverRecord);
  return {
    ...convertedRecord,
    id: String(serverRecord.id),
    deleteYn: serverRecord.delete_yn,
  };
};

export const focusEditingRecord = (gridRef: RefObject<CustomAgGridReactProps<any>>, id?: string, columnId?: string) => {
  if (!id || !columnId) return;
  const editingRow = gridRef.current?.api.getRowNode(id);

  if (gridRef.current && editingRow && typeof editingRow.rowIndex === "number") {
    gridRef.current.api.startEditingCell({
      rowIndex: editingRow.rowIndex,
      colKey: columnId,
    });
    gridRef.current.api.setFocusedCell(editingRow.rowIndex, columnId);
  }
};

const move = (gridRef: RefObject<CustomAgGridReactProps<PRecord>>, tx: RowDataTransaction<PRecord>, data: PRecord) => {
  if (!gridRef.current?.api.getRowNode(data.id)) return;
  let isCurGridNeedFocus = false;
  let curGridEditingRowId: string | undefined;
  const curGridEditingCell = getEditingCell(gridRef);

  if (curGridEditingCell) {
    curGridEditingRowId = gridRef.current?.api.getDisplayedRowAtIndex(curGridEditingCell.rowIndex)?.id;

    if (tx.remove) {
      const soonRemovedIndex = gridRef.current?.api.getRowNode(data.id)?.rowIndex;
      isCurGridNeedFocus = typeof soonRemovedIndex === "number" && curGridEditingCell.rowIndex > soonRemovedIndex;
    }

    if (tx.add || isCurGridNeedFocus) {
      const event = new CustomEvent(ON_LINE_CHANGING_TRANSACTION_APPLIED);
      gridRef.current?.api.dispatchEvent(event);
    }
  }

  gridRef.current?.api.applyTransaction(tx);

  if ((isCurGridNeedFocus || tx.add) && curGridEditingCell) {
    focusEditingRecord(gridRef, curGridEditingRowId, curGridEditingCell.column.getColId());
  }
};

export const moveRecord = (gridRef: RefObject<CustomAgGridReactProps<PRecord>>, theOtherGridRef: RefObject<CustomAgGridReactProps<PRecord>>, data: PRecord) => {
  move(gridRef, { remove: [data] }, data);
  move(theOtherGridRef, { add: [data], addIndex: 0 }, data);
};

export const checkIsInvalidRecord = (tableType: TableType, record: PRecord) => {
  const etrCondition = tableType === "ExceptReady" && record.opReadiness === "Y";
  const rteCondition = tableType === "Ready" && record.opReadiness !== "Y";
  return { etrCondition, rteCondition };
};

export const autoCompleteKeyDownCapture = (event: React.KeyboardEvent<HTMLDivElement>, onValueChange: (value?: string) => void, optionRef: MutableRefObject<SearchHelp | null>) => {
  if (event.key === "Enter" || event.key === "Tab") {
    onValueChange(optionRef.current?.id.toString());
  }
};

export const getEditingCell = (gridRef?: RefObject<CustomAgGridReactProps<PRecord>>) => {
  return gridRef?.current?.api.getEditingCells()[0];
};

export const refreshTreatmentCells = (api: GridApi<PRecord>, recordId: string) => {
  if (!api) return;
  const row = api.getRowNode(recordId);

  if (!row || !row.data) return;

  const columns = [OP_READINESS, DOCTOR];
  TREATMENT_NUMBERS.forEach((i) => {
    columns.push(`${TREATMENT}${i}`);
  });

  api.refreshCells({
    force: true,
    rowNodes: [row],
    columns,
  });
};

export const findCanCompleteTreatmentNumber = (record: PRecord): number => {
  return TREATMENT_NUMBERS.find((i) => record[`${TREATMENT}${i}`] && record[`${TREATMENT_START}${i}`] && !record[`${TREATMENT_END}${i}`]) ?? -1;
};

export const statusTransition = (record: PRecord): OpReadiness => {
  let cFlag = true;
  let yFlag = false;
  let pFlag = false;
  let hasAnyTreatment = false;

  for (const number of TREATMENT_NUMBERS) {
    const ready = record[`${TREATMENT_READY}${number}`];
    const start = record[`${TREATMENT_START}${number}`];
    const end = record[`${TREATMENT_END}${number}`];

    if (record[`${TREATMENT}${number}`]) {
      hasAnyTreatment = true;
      if (!ready || !start || !end) {
        cFlag = false;
      }
      if (ready && !start) {
        yFlag = true;
        break;
      }
      if (ready && start && !end) {
        pFlag = true;
        break;
      }
    }
  }

  if (!hasAnyTreatment) cFlag = false;
  if (yFlag) return OpReadiness.Y;
  if (pFlag) return OpReadiness.P;
  if (cFlag) return OpReadiness.C;

  return OpReadiness.N;
};

export const editAndStopRecord = (grid: RefObject<CustomAgGridReactProps<PRecord>>, record: PRecord, originalRecord: PRecord) => {
  if (!grid.current) return;
  const api = grid.current.api;
  const row = api.getRowNode(record.id);
  if (row && row.rowIndex !== null) {
    grid.current.saveRecord?.(record, originalRecord, api);
  }
};

export const encryptSessionId = (ip: string | null, browser: string | null, sessionSecret: string, userId: string, clinic: string) => {
  const key = `${ip || ""}${browser || ""}${sessionSecret}${userId}${clinic}`;
  return CryptoJS.SHA256(key).toString();
};

export const getTreatmentSearchHelp = async (setTreatmentSearchHelp: SetterOrUpdater<Treatment[]>, baseURL: string, clinic: string) => {
  const {
    statusCode,
    body: { data },
  } = await getAllTreatments(clinic, baseURL);
  if (statusCode === 200) {
    const treatment = data.rows.map((treatment: Treatment) => treatment as SearchHelp);
    setTreatmentSearchHelp(treatment);
  }
};

export const getDoctorSearchHelp = async (setDoctorSearchHelp: SetterOrUpdater<SearchHelp[]>, baseURL: string, clinic: string) => {
  const {
    statusCode,
    body: { data },
  } = await getAllRoleEmployees(Role.DOCTOR, clinic, baseURL);

  if (statusCode === 200) {
    const doctors = data.rows.map((user: ServerUser) => convertServerUserToClientUser(user)).map((user: User) => ({ id: user.id, title: user.name, group: "" } as SearchHelp));
    setDoctorSearchHelp(doctors);
  }
};

export const getRevenueForPeriod = (doctors: ServerUser[], data: ServerPRecord[], treatments: { [key: string]: Treatment }) => {
  const revenue: { [key: string]: { [key: string]: number | string } } = {};
  doctors.forEach((doctor) => (revenue[doctor.id] = { name: `${doctor.first_name}${doctor.last_name}` }));
  data.forEach((chart) => {
    const clientChart = convertServerPRecordToPRecord(chart);
    TREATMENT_NUMBERS.forEach((num) => {
      const treatment = clientChart[`${TREATMENT}${num}`];
      const doctor = clientChart[`${DOCTOR}${num}`];
      const end = clientChart[`${TREATMENT_END}${num}`];

      if (!end || !treatment || !(treatment in treatments) || doctor === undefined || !(doctor in revenue)) return;
      if (!(treatment in revenue[doctor])) {
        revenue[doctor][treatment] = 0;
      }

      if (typeof revenue[doctor][treatment] === "number") {
        revenue[doctor][treatment] += 1;
      }
    });
  });

  return revenue;
};

export const formatNumberWithCommas = (number: number) => {
  return `${number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}원`;
};

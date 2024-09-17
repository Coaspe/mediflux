/** @format */

import { Role, ServerUser, PRecord, ServerPRecord, OpReadiness } from "shared";
import { EMPTY_SEARCHHELP, SideMenu, TREATMENT_NUMBERS, TEST_TAG } from "~/constant";
import { CustomAgGridReactProps, SearchHelp, ServerTreatment, TableType, Treatment, User } from "~/types/type";
import { MutableRefObject, RefObject } from "react";
import { GridApi, RowDataTransaction } from "ag-grid-community";
import CryptoJS from "crypto-js";
import { SetterOrUpdater } from "recoil";
import { getAllTreatments, getAllRoleEmployees } from "./request";

export function getMenuName(menu: SideMenu | undefined): string {
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
}

export function getRoleName(role: Role): string {
  switch (role) {
    case Role.DOCTOR:
      return "Doctor";
    case Role.NURSE:
      return "Nurse";
    default:
      return "Staff";
  }
}

export const getValueWithId = (searchHelp: SearchHelp[], id?: string): SearchHelp => {
  for (let i = 0; i < searchHelp.length; i++) {
    const element = searchHelp[i];
    if (element.id == id) {
      return searchHelp[i];
    }
  }
  return EMPTY_SEARCHHELP;
};

export const convertServerUserToClientUser = (user: ServerUser) => {
  const convertedUser = convertToCamelCaseObject<User>(user);
  return { ...convertedUser, id: user.id, role: user.role, name: user.first_name + user.last_name } as User;
};

const snakeToCamel = (origin: string): string => origin.replace(/_./g, (s) => s.charAt(1).toUpperCase());

export function convertToCamelCaseObject<T>(source: { [key: string]: any }): T {
  const result = {} as T;
  Object.keys(source).forEach((key) => {
    const camelKey = snakeToCamel(key);
    result[camelKey as keyof T] = source[key];
  });
  return result;
}

export function convertServerPRecordToPRecord(serverRecord: ServerPRecord): PRecord {
  const convertedRecord = convertToCamelCaseObject<PRecord>(serverRecord);
  return {
    ...convertedRecord,
    id: String(serverRecord.id), // 필요시 특정 필드만 직접 수정 가능
    deleteYn: serverRecord.delete_yn,
  };
}
export const focusEditingRecord = (gridRef: RefObject<CustomAgGridReactProps<any>>, id: string | undefined, columnId: string | undefined) => {
  if (id === undefined || columnId === undefined) return;
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
  let isCurGridNeedFocus = false;
  let curGridEditingRowId = undefined;
  const curGridEditingCell = getEditingCell(gridRef);

  if (curGridEditingCell) {
    curGridEditingRowId = gridRef.current?.api.getDisplayedRowAtIndex(curGridEditingCell?.rowIndex)?.id;

    if (tx.remove) {
      let soonRemovedIndex = gridRef.current?.api.getRowNode(data.id)?.rowIndex;
      isCurGridNeedFocus = typeof soonRemovedIndex === "number" && curGridEditingCell.rowIndex > soonRemovedIndex;
    }

    if (tx.add || isCurGridNeedFocus) {
      const event = new CustomEvent("onLineChangingTransactionApplied");
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

export const checkIsInvaildRecord = (tableType: TableType, record: PRecord) => {
  const etrcondition = tableType === "ExceptReady" && record.opReadiness === "Y";
  const rtecondition1 = tableType === "Ready" && record.opReadiness !== "Y";
  // const rtecondition1 = tableType === "Ready" && record.doctor;
  const rtecondition2 = tableType === "Ready" && record.opReadiness !== "Y";
  return { etrcondition, rtecondition1, rtecondition2 };
};

export const autoCompleteKeyDownCapture = (event: React.KeyboardEvent<HTMLDivElement>, onValueChange: (value: string | undefined) => void, optionRef: MutableRefObject<SearchHelp | null>) => {
  if (event.key === "Enter") {
    onValueChange(optionRef.current?.id.toString());
  } else if (event.key === "Tab") {
    if (optionRef.current) {
      onValueChange(optionRef.current.id.toString());
    }
  }
};

export const getEditingCell = (gridRef: RefObject<CustomAgGridReactProps<PRecord>> | undefined) => {
  return gridRef?.current?.api.getEditingCells()[0];
};

export const refreshTreatmentCells = (api: GridApi<PRecord> | undefined, recordId: string) => {
  if (!api) return;
  const row = api.getRowNode(recordId);

  if (!row || !row.data) return;

  const columns = ["opReadiness", "doctor"];
  for (const i of TREATMENT_NUMBERS) {
    if (row.data[`treatment${i}`]) {
      columns.push(`treatment${i}`);
    }
  }

  api.refreshCells({
    force: true,
    rowNodes: [row],
    columns,
  });
};
export const findCanCompleteTreatmentNumber = (record: PRecord): number => {
  for (const i of TREATMENT_NUMBERS) {
    if (record[`treatment${i}`] && record[`treatmentStart${i}`] && !record[`treatmentEnd${i}`]) {
      return i;
    }
  }
  return -1;
};
export const statusTransition = (record: PRecord): OpReadiness => {
  // 시술이 1개 이상 있고 모든 시술 완료 C
  // 어떤 시술이 Ready가 있고 start가 없다면 Y
  // 어떤 시술이 Ready가 있고 start가 있고 end가 없다면 P
  // 나머지 N

  let c_flag = true;
  let y_flag = false;
  let p_flag = false;

  for (const number of TREATMENT_NUMBERS) {
    if (record[`treatment${number}`]) {
      if (!record[`treatmentReady${number}`] || !record[`treatmentStart${number}`] || !record[`treatmentEnd${number}`]) {
        c_flag = false;
      }
      if (record[`treatmentReady${number}`] && !record[`treatmentStart${number}`]) {
        y_flag = true;
        break;
      }
      if (record[`treatmentReady${number}`] && record[`treatmentStart${number}`] && !record[`treatmentEnd${number}`]) {
        p_flag = true;
        break;
      }
    }
  }

  if (y_flag) return OpReadiness.Y;
  if (p_flag) return OpReadiness.P;
  if (c_flag) return OpReadiness.C;

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

export const encryptSessionId = (ip: string | null, browser: string | null, sessionSecret: string, userId: string) => {
  const key = (ip || "") + (browser || "") + sessionSecret + userId;
  return CryptoJS.SHA256(key).toString();
};

export const convertServerTreatmentToClient = (serverTreatment: ServerTreatment): Treatment => {
  let retVal = {} as Treatment;

  for (const [key, value] of Object.entries(serverTreatment)) {
    const field = key.split("_")[1];
    if (field) {
      retVal[`${field}`] = value;
    }
  }

  return retVal;
};

export const getTreatmentSearchHelp = async (setTreatmentSearchHelp: SetterOrUpdater<Treatment[]>, baseURL: string) => {
  const {
    statusCode,
    body: { data },
  } = await getAllTreatments(TEST_TAG, baseURL);
  if (statusCode === 200) {
    console.log(data.rows);

    const treatment = data.rows.map((treatment: Treatment) => {
      return treatment as SearchHelp;
    });
    setTreatmentSearchHelp(treatment);
  }
};

export const getDoctorSearchHelp = async (setDoctorSearchHelp: SetterOrUpdater<SearchHelp[]>, baseURL: string) => {
  const {
    statusCode,
    body: { data },
  } = await getAllRoleEmployees(Role.DOCTOR, TEST_TAG, baseURL);

  if (statusCode === 200) {
    const doctors = data.rows
      .map((user: ServerUser) => convertServerUserToClientUser(user))
      .map((user: User) => {
        return { id: user.id, title: user.name, group: "" } as SearchHelp;
      });
    setDoctorSearchHelp(doctors);
  }
};
export const getRevenueForPeriod = (doctors: ServerUser[], data: ServerPRecord[], treatments: { [key: string]: Treatment }) => {
  let revenue: { [key: string]: { [key: string]: number | string } } = {};
  doctors.forEach((doctor) => (revenue[doctor.id] = { name: `${doctor.first_name}${doctor.last_name}` }));
  data.forEach((chart) => {
    const clientChart = convertServerPRecordToPRecord(chart);
    for (const num of TREATMENT_NUMBERS) {
      const treatment = clientChart[`treatment${num}`];
      const doctor = clientChart[`doctor${num}`];
      const end = clientChart[`treatmentEnd${num}`];

      if (!end || !treatment || !(treatment in treatments) || doctor === undefined || !(doctor in revenue)) continue;
      if (!(treatment in revenue[doctor])) {
        revenue[doctor][treatment] = 0;
      }

      if (typeof revenue[doctor][treatment] === "number") {
        revenue[doctor][treatment] += 1;
      }
    }
  });

  return revenue;
};

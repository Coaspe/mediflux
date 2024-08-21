/** @format */

import { Role, ServerUser, ROLE } from "shared";
import { EMPTY_SEARCHHELP, OPREADINESS_Y_TITLE, OPREADINESS_Y, SIDE_MENU, OPREADINESS_N, TREATMENT_NUMBERS, OPREADINESS_C, OPREADINESS_P } from "~/constant";
import { CustomAgGridReactProps, OpReadiness, PRecord, SearchHelp, ServerPRecord, SideMenu, TableType, User } from "~/type";
import { MutableRefObject, RefObject } from "react";
import { GridApi } from "ag-grid-community";
import CryptoJS from "crypto-js";

export function getMenuName(menu: SideMenu | undefined): string {
  switch (menu) {
    case SIDE_MENU.SCHEDULING:
      return "Scheduling";
    case SIDE_MENU.ARCHIVE:
      return "Archive";
    default:
      return "";
  }
}

export function getRoleName(role: Role): string {
  switch (role) {
    case ROLE.DOCTOR:
      return "Doctor";
    case ROLE.NURSE:
      return "Nurse";
    default:
      return "Staff";
  }
}

export const getValueWithId = (searchHelp: SearchHelp[], id?: string): SearchHelp => {
  for (let i = 0; i < searchHelp.length; i++) {
    const element = searchHelp[i];
    if (element.id === id) {
      return searchHelp[i];
    }
  }
  return EMPTY_SEARCHHELP;
};

export const getTableType = (opReadiness?: OpReadiness): TableType => {
  if (opReadiness === OPREADINESS_Y) {
    return "Ready";
  } else {
    return "ExceptReady";
  }
};

export const getBrowserType = () => {
  const userAgent = navigator.userAgent;
  if (userAgent.indexOf("Firefox") > -1) {
    return "Mozilla Firefox";
  } else if (userAgent.indexOf("SamsungBrowser") > -1) {
    return "Samsung Internet";
  } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
    return "Opera";
  } else if (userAgent.indexOf("Trident") > -1) {
    return "Microsoft Internet Explorer";
  } else if (userAgent.indexOf("Edg") > -1) {
    return "Microsoft Edge";
  } else if (userAgent.indexOf("Chrome") > -1) {
    return "Google Chrome";
  } else if (userAgent.indexOf("Safari") > -1) {
    return "Apple Safari";
  } else {
    return "Unknown";
  }
};

export const convertServerUserToClientUser = (user: ServerUser) => {
  return { id: user.contact_id, userid: user.login_id, role: user.user_role, name: user.first_name + user.last_name, sessionId: user.session_id } as User;
};
const convertServerTimeToClientTime = (time: number | undefined) => {
  return time ? new Date(time).getTime() / 1000 : undefined;
};
export function convertServerPRecordtToPRecord(serverRecord: ServerPRecord): PRecord {
  return {
    id: String(serverRecord.record_id),
    checkInTime: convertServerTimeToClientTime(serverRecord.check_in_time),
    chartNum: serverRecord.chart_num,
    patientName: serverRecord.patient_name,
    opReadiness: serverRecord.op_readiness,
    treatment1: serverRecord.treatment_1,
    treatment2: serverRecord.treatment_2,
    treatment3: serverRecord.treatment_3,
    treatment4: serverRecord.treatment_4,
    treatment5: serverRecord.treatment_5,
    treatmentReady1: convertServerTimeToClientTime(serverRecord.treatment_ready_1),
    treatmentReady2: convertServerTimeToClientTime(serverRecord.treatment_ready_2),
    treatmentReady3: convertServerTimeToClientTime(serverRecord.treatment_ready_3),
    treatmentReady4: convertServerTimeToClientTime(serverRecord.treatment_ready_4),
    treatmentReady5: convertServerTimeToClientTime(serverRecord.treatment_ready_5),
    treatmentEnd1: convertServerTimeToClientTime(serverRecord.treatment_end_1),
    treatmentEnd2: convertServerTimeToClientTime(serverRecord.treatment_end_2),
    treatmentEnd3: convertServerTimeToClientTime(serverRecord.treatment_end_3),
    treatmentEnd4: convertServerTimeToClientTime(serverRecord.treatment_end_4),
    treatmentEnd5: convertServerTimeToClientTime(serverRecord.treatment_end_5),
    treatmentStart1: convertServerTimeToClientTime(serverRecord.treatment_start_1),
    treatmentStart2: convertServerTimeToClientTime(serverRecord.treatment_start_2),
    treatmentStart3: convertServerTimeToClientTime(serverRecord.treatment_start_3),
    treatmentStart4: convertServerTimeToClientTime(serverRecord.treatment_start_4),
    treatmentStart5: convertServerTimeToClientTime(serverRecord.treatment_start_5),
    quantityTreat1: serverRecord.quantity_treat_1,
    quantityTreat2: serverRecord.quantity_treat_2,
    quantityTreat3: serverRecord.quantity_treat_3,
    quantityTreat4: serverRecord.quantity_treat_4,
    quantityTreat5: serverRecord.quantity_treat_5,
    treatmentRoom: serverRecord.treatment_room,
    doctor: serverRecord.doctor,
    anesthesiaNote: serverRecord.anesthesia_note,
    skincareSpecialist1: serverRecord.skincare_specialist_1,
    skincareSpecialist2: serverRecord.skincare_specialist_2,
    nursingStaff1: serverRecord.nursing_staff_1,
    nursingStaff2: serverRecord.nursing_staff_2,
    coordinator: serverRecord.coordinator,
    consultant: serverRecord.consultant,
    commentCaution: serverRecord.comment_caution,
    lockingUser: serverRecord.locking_user,
    readyTime: serverRecord.ready_time,
    deleteYN: serverRecord.delete_yn,
  } as PRecord;
}

export const focusEditingRecord = (gridRef: RefObject<CustomAgGridReactProps<any>>, rowIndex?: number | null | undefined) => {
  const editingCell = getEditingCell(gridRef);
  if (gridRef.current && editingCell) {
    if (typeof rowIndex !== "number") {
      rowIndex = editingCell.rowIndex;
    }
    if (typeof rowIndex === "number") {
      gridRef.current.api.setFocusedCell(rowIndex, editingCell.column.getColId());
      gridRef.current.api.startEditingCell({
        rowIndex,
        colKey: editingCell.column.getColId(),
      });
    }
  }
};

export const moveRecord = (gridRef: RefObject<CustomAgGridReactProps<PRecord>>, theOtherGridRef: RefObject<CustomAgGridReactProps<PRecord>>, data: PRecord) => {
  let needFocus = false;
  let soonRemovedIndex = gridRef.current?.api.getRowNode(data.id)?.rowIndex;

  const editingCell = getEditingCell(gridRef);
  if (editingCell) {
    const editingCellsCurGrid = gridRef.current?.api.getEditingCells();
    if (editingCellsCurGrid && editingCellsCurGrid.length > 0 && typeof soonRemovedIndex === "number") {
      needFocus = editingCellsCurGrid[0].rowIndex > soonRemovedIndex;
      const event = new CustomEvent("onLineChangingTransactionApplied");
      gridRef.current?.api.dispatchEvent(event);
    }
  }

  gridRef.current?.api.applyTransaction({
    remove: [data],
  });

  if (needFocus) {
    focusEditingRecord(gridRef);
  }

  const theOtherEditingCell = getEditingCell(theOtherGridRef);
  if (theOtherEditingCell) {
    const event = new CustomEvent("onLineChangingTransactionApplied");
    theOtherGridRef.current?.api.dispatchEvent(event);
  }

  // O(n)
  // n: Number of rows single page has.
  theOtherGridRef.current?.api.applyTransaction({
    add: [data],
    addIndex: 0,
  });

  // O(1)
  focusEditingRecord(theOtherGridRef);
};

export const checkIsInvaildRecord = (tableType: TableType, record: PRecord) => {
  const etrcondition = tableType === "ExceptReady" && record.opReadiness === "Y";
  const rtecondition1 = tableType === "Ready" && record.opReadiness !== "Y";
  // const rtecondition1 = tableType === "Ready" && record.doctor;
  const rtecondition2 = tableType === "Ready" && record.opReadiness !== "Y";
  return { etrcondition, rtecondition1, rtecondition2 };
};

export const autoCompleteKeyDownCapture = (event: any, onValueChange: (value: any) => void, optionRef: MutableRefObject<SearchHelp | null>, setModalOpen?: () => void) => {
  if (event.key === "Enter") {
    onValueChange(optionRef.current?.id);
    if (optionRef.current?.id === OPREADINESS_Y && optionRef.current?.title == OPREADINESS_Y_TITLE) {
      setModalOpen?.();
    }
  } else if (event.key === "Tab") {
    if (optionRef.current) {
      onValueChange(optionRef.current.id);
    }
  }
};

export const checkForUnReadyTreatments = (record: PRecord) => {
  for (let i = 1; i <= 5; i++) {
    if (record[`treatment${i}`] && !record[`treatmentReady${i}`]) {
      return true;
    }
  }
  return false;
};

export const getEditingCell = (gridRef: RefObject<CustomAgGridReactProps<PRecord>> | undefined) => {
  return gridRef?.current?.api.getEditingCells()[0];
};

export const refreshTreatmentCells = (api: GridApi<PRecord> | undefined, recordId: string) => {
  if (!api) return;
  const row = api.getRowNode(recordId);

  if (!row || !row.data) return;
  const columns = [];
  for (let i = 1; i <= 5; i++) {
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
export const findCanBeAssignedTreatmentNumber = (record: PRecord): number => {
  for (let i = 1; i <= 5; i++) {
    if (record[`treatmentReady${i}`] && record[`treatment${i}`] && !record[`treatmentStart${i}`]) {
      return i;
    }
  }
  return -1;
};
export const findCanbeReadyTreatmentNumber = (record: PRecord): number => {
  for (let i = 1; i <= 5; i++) {
    if (!record[`treatmentReady${i}`] && record[`treatment${i}`]) {
      return i;
    }
  }
  return -1;
};
export const findCanCompleteTreatmentNumber = (record: PRecord): number => {
  for (let i = 1; i <= 5; i++) {
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

  let returnFlag = true;
  let c_flag = true;
  let y_flag = false;
  let p_flag = false;

  for (const number of TREATMENT_NUMBERS) {
    if (record[`treatment${number}`]) {
      returnFlag = false;
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

  if (returnFlag) return OPREADINESS_N;
  if (y_flag) return OPREADINESS_Y;
  if (p_flag) return OPREADINESS_P;
  if (c_flag) return OPREADINESS_C;

  return OPREADINESS_N;
};

export const editAndStopRecord = (api: GridApi<PRecord>, record: PRecord) => {
  const row = api.getRowNode(record.id);
  if (row && row.rowIndex !== null) {
    row?.updateData(record);
    refreshTreatmentCells(api, record.id);
    api.startEditingCell({ rowIndex: row.rowIndex, colKey: "chartNum" });
    api.stopEditing();
  }
};

export const encryptSessionId = (ip: string | null, browser: string | null, sessionSecret: string, userId: string) => {
  const key = (ip || "") + (browser || "") + sessionSecret + userId;
  return CryptoJS.SHA256(key).toString();
};

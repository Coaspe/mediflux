/** @format */

import { MRT_Row, MRT_TableInstance, LiteralUnion } from "material-react-table";
import { Role, SCHEDULING_ROOM_ID, ServerUser, ROLE } from "shared";
import { EMPTY_SEARCHHELP, SIDE_MENU } from "~/constant";
import { OpReadiness, PRecord, QueryDataName, SearchHelp, ServerPRecord, SideMenu, TableType, User } from "~/type";
import { Socket } from "socket.io-client";
import { MutableRefObject, RefObject } from "react";
import { UseMutateAsyncFunction, UseMutateFunction } from "@tanstack/react-query";
import dayjs from "dayjs";
import { stringify } from "postcss";
import { AgGridReact } from "ag-grid-react";

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
  if (opReadiness === "Y") {
    return "Ready";
  } else {
    return "ExceptReady";
  }
};
export const isInvalidOpReadiessWithTable = (precord: PRecord, queryDataName?: QueryDataName, tableType?: TableType): boolean => {
  if (!precord.opReadiness) {
    return false;
  }

  if (queryDataName) {
    if ((queryDataName === "Ready_PRecord" && precord.opReadiness !== "Y") || (queryDataName === "ExceptReady_PRecord" && precord.opReadiness === "Y")) {
      return true;
    }
  }
  if (tableType) {
    if ((tableType === "Ready" && precord.opReadiness !== "Y") || (tableType === "ExceptReady" && precord.opReadiness === "Y")) {
      return true;
    }
  }
  return false;
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

export const handleEditingCancel = (row: MRT_Row<PRecord>, tableType: TableType, socket: Socket | null, originalPRecord: MutableRefObject<PRecord | undefined>) => {
  originalPRecord.current = undefined;
};

export const handleSavePRecord = async (
  row: MRT_Row<PRecord>,
  table: MRT_TableInstance<PRecord>,
  tableType: TableType,
  values: Record<LiteralUnion<string, string>, any>,
  originalPRecord: MutableRefObject<PRecord | undefined>,
  dbUpdateFn: UseMutateAsyncFunction<void, Error, PRecord, void>,
  createFn: UseMutateFunction<void, Error, PRecord, void>,
  socket: Socket | null,
  user: User | undefined
) => {
  if (!user) {
    return;
  }

  let precord = values as PRecord;

  if (precord.id === undefined) {
    precord.id = row.original.id;
  }

  if (originalPRecord.current) {
    for (let key of Object.keys(row.original)) {
      if ((typeof row.original[key] === "object" && areObjectsEqual(row.original[key], originalPRecord.current[key])) || row.original[key] !== originalPRecord.current[key]) {
        precord[key] = originalPRecord.current[key];
      }
    }
  }

  if (precord.opReadiness === "Y" && precord.doctor) {
    precord.opReadiness = "P";
  }

  await dbUpdateFn(precord);

  let otherType: TableType = tableType === "Ready" ? "ExceptReady" : "Ready";
  if (!isInvalidOpReadiessWithTable(precord, undefined, otherType)) {
    if (otherType === "Ready") {
      precord.readyTime = dayjs().unix();
    }
    createFn(precord);
    // emitCreateRecords(precord, otherType, socket, SCHEDULING_ROOM_ID);
    // emitDeleteRecord(precord.id, tableType, socket, user, SCHEDULING_ROOM_ID);
  } else {
    // emitSaveRecord(precord, tableType, socket, SCHEDULING_ROOM_ID);
  }

  table.setEditingRow(null); // exit editing mode

  if (precord.lockingUser?.id === user.id) {
  }

  originalPRecord.current = undefined;
};

export const handleCreatePRecord = async (
  currentTable: MRT_TableInstance<PRecord>,
  dbCreateFn: UseMutateAsyncFunction<void, Error, PRecord, void>,
  socket: Socket | null,
  tableType: TableType,
  values: Record<LiteralUnion<string, string>, any>,
  originalPRecord: MutableRefObject<PRecord | undefined>
) => {
  let id = 2002;
  let precord = values as PRecord;
  let table: MRT_TableInstance<PRecord> = currentTable;
  if (originalPRecord.current) {
    for (let key of Object.keys(originalPRecord.current)) {
      if ((typeof originalPRecord.current[key] === "object" && areObjectsEqual(originalPRecord.current[key], precord[key])) || originalPRecord.current[key] !== precord[key]) {
        precord[key] = originalPRecord.current[key];
      }
    }
  }

  precord.id = id.toString();
  id += 1;
  if (precord.opReadiness == "Y") {
    precord.readyTime = dayjs().unix();
  }
  await dbCreateFn(precord);
  // emitCreateRecords(precord, tableType, socket, SCHEDULING_ROOM_ID);
  originalPRecord.current = undefined;
  table.setCreatingRow(null); //exit creating mode
};

function areObjectsEqual(obj1: PRecord, obj2: PRecord): boolean {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (!obj2.hasOwnProperty(key)) {
      return false;
    }

    if (typeof obj1[key] === "object" && typeof obj2[key] === "object") {
      if (!areObjectsEqual(obj1[key], obj2[key])) {
        return false;
      }
    } else {
      if (obj1[key] !== obj2[key]) {
        return false;
      }
    }
  }

  return true;
}

export const convertServerUserToClientUser = (user: ServerUser) => {
  return { id: user.contact_id, userid: user.login_id, role: user.user_role, name: user.first_name + user.last_name } as User;
};

export function convertServerPRecordtToPRecord(serverRecord: ServerPRecord): PRecord {
  if (serverRecord.check_in_time) {
    serverRecord.check_in_time = new Date(serverRecord.check_in_time).getTime() / 1000;
  }
  return {
    id: String(serverRecord.record_id),
    checkInTime: serverRecord.check_in_time,
    chartNum: serverRecord.chart_num,
    patientName: serverRecord.patient_name,
    opReadiness: serverRecord.op_readiness,
    treatment1: serverRecord.treatment_1,
    treatment2: serverRecord.treatment_2,
    treatment3: serverRecord.treatment_3,
    treatment4: serverRecord.treatment_4,
    treatment5: serverRecord.treatment_5,
    treatmentReady1: serverRecord.treatment_ready_1,
    treatmentReady2: serverRecord.treatment_ready_2,
    treatmentReady3: serverRecord.treatment_ready_3,
    treatmentReady4: serverRecord.treatment_ready_4,
    treatmentReady5: serverRecord.treatment_ready_5,
    treatmentEnd1: serverRecord.treatment_end_1,
    treatmentEnd2: serverRecord.treatment_end_2,
    treatmentEnd3: serverRecord.treatment_end_3,
    treatmentEnd4: serverRecord.treatment_end_4,
    treatmentEnd5: serverRecord.treatment_end_5,
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
  };
}

export const moveRecord = (gridRef: RefObject<AgGridReact<PRecord>>, theOtherGridRef: RefObject<AgGridReact<PRecord>>, data: PRecord) => {
  gridRef.current?.api.applyTransaction({
    remove: [data],
  });
  theOtherGridRef.current?.api.applyTransaction({
    add: [data],
    addIndex: 0,
  });
};

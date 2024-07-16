/** @format */

import { MRT_Row, MRT_TableInstance, LiteralUnion } from "material-react-table";
import { SCHEDULING_ROOM_ID } from "shared";
import { EMPTY_SEARCHHELP, ROLE, SIDE_MENU } from "~/constant";
import { OpReadiness, PRecord, QueryDataName, Role, SearchHelp, SideMenu, TableType, User } from "~/type";
import { emitUnLockRecord, emitCreateRecord, emitDeleteRecord, emitSaveRecord } from "./Table/socket";
import { Socket } from "socket.io-client";
import { MutableRefObject } from "react";
import { UseMutateAsyncFunction, UseMutateFunction } from "@tanstack/react-query";

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
  emitUnLockRecord(row.id, tableType, socket, SCHEDULING_ROOM_ID);
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
  user: User
) => {
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
    createFn(precord);
    emitCreateRecord(precord, otherType, socket, SCHEDULING_ROOM_ID);
    emitDeleteRecord(precord.id, tableType, socket, user, SCHEDULING_ROOM_ID);
  } else {
    emitSaveRecord(precord, tableType, socket, SCHEDULING_ROOM_ID);
  }

  table.setEditingRow(null); // exit editing mode

  if (precord.LockingUser?.id === user.id) {
    emitUnLockRecord(row.id, tableType, socket, SCHEDULING_ROOM_ID);
  }

  originalPRecord.current = undefined;
};

export const handleCreatePRecord = async (
  currentTable: MRT_TableInstance<PRecord>,
  // anotherTable: MRT_TableInstance<PRecord>,
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

  // if (isInvalidOpReadiessWithTable(precord, undefined, tableType)) {
  //   tableType = tableType === "Ready" ? "ExceptReady" : "Ready";
  //   table = anotherTable;
  // }

  await dbCreateFn(precord);
  emitCreateRecord(precord, tableType, socket, SCHEDULING_ROOM_ID);
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

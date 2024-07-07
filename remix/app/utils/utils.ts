import { EMPTY_SEARCHHELP, ROLE, SIDE_MENU } from "~/constant";
import { OpReadiness, PRecord, QueryDataName, Role, SearchHelp, SideMenu, TableType } from "~/type";

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

/** @format */

import { Role, ServerUser, ROLE } from "shared";
import { EMPTY_SEARCHHELP, SIDE_MENU } from "~/constant";
import { OpReadiness, PRecord, SearchHelp, ServerPRecord, SideMenu, TableType, User } from "~/type";
import { MutableRefObject, RefObject } from "react";
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

export const checkIsInvaildRecord = (tableType: TableType, record: PRecord) => {
  const etrcondition = tableType === "ExceptReady" && record.opReadiness === "Y";
  const rtecondition1 = tableType === "Ready" && record.doctor;
  const rtecondition2 = tableType === "Ready" && record.opReadiness !== "Y";
  return { etrcondition, rtecondition1, rtecondition2 };
};

export const autoCompleteKeyDownCapture = (event: any, onValueChange: (value: any) => void, gridRef: RefObject<AgGridReact<PRecord>>, optionRef: MutableRefObject<string>) => {
  if (event.key === "Enter") {
    event.stopPropagation();
    onValueChange(optionRef.current);
    gridRef.current?.api.stopEditing(false);
  } else if (event.key === "Tab") {
    if (optionRef.current) {
      onValueChange(optionRef.current);
    }
  }
};

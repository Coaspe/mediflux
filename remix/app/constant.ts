/** @format */

import { OpReadiness, SearchHelp, User } from "./type";

export const SERVERUSER_CLIENTUSER_MAPPING = {
  login_id: "userid" as keyof User,
  login_pw: "password" as keyof User,
  contact_id: "id" as keyof User,
};

export const SIDE_MENU = {
  SCHEDULING: "scheduling",
  ARCHIVE: "archive",
} as const;

export const TABLE_CONTAINER_HEIGHT = "78%";
export const TABLE_HEIGHT = "100%";
export const TABLE_PAPER_HEIGHT = "50%";
export const NEW_READY_RECORD_COLOR = "#fffacd";
export const EDITING_RECORD_COLOR = "#dcdcdc";
export const DEFAULT_RECORD_COLOR = "white";

export const CHECK_IN_TIME = "checkInTime";
export const CHECK_IN_TIME_H = "수납시간";
export const CHART_NUMBER = "chartNum";
export const CHART_NUMBER_H = "차트번호";
export const PATIENT_NAME = "patientName";
export const PATIENT_NAME_H = "고객이름";
export const OP_READINESS = "opReadiness";
export const OP_READINESS_H = "상태";
export const TREATMENT1 = "treatment1";
export const TREATMENT2 = "treatment2";
export const TREATMENT3 = "treatment3";
export const TREATMENT4 = "treatment4";
export const TREATMENT5 = "treatment5";
export const TREATMENT1_H = "시술1";
export const TREATMENT2_H = "시술2";
export const TREATMENT3_H = "시술3";
export const TREATMENT4_H = "시술4";
export const TREATMENT5_H = "시술5";
export const QUANTITYTREAT1 = "quantityTreat1";
export const QUANTITYTREAT1_H = "수량";
export const TREATMENT_ROOM = "treatmentRoom";
export const TREATMENT_ROOM_H = "시술실";
export const DOCTOR = "doctor";
export const DOCTOR_H = "의사";
export const ANESTHESIANOTE = "anesthesiaNote";
export const ANESTHESIANOTE_H = "마취 시간";
export const SKINCARESPECIALIST1 = "skincareSpecialist1";
export const SKINCARESPECIALIST1_H = "피부1";
export const SKINCARESPECIALIST2 = "skincareSpecialist2";
export const SKINCARESPECIALIST2_H = "피부2";
export const NURSINGSTAFF1 = "nursingStaff1";
export const NURSINGSTAFF1_H = "간호1";
export const NURSINGSTAFF2 = "nursingStaff2";
export const NURSINGSTAFF2_H = "간호2";
export const COORDINATOR = "coordinator";
export const COORDINATOR_H = "코디";
export const CONSULTANT = "consultant";
export const CONSULTANT_H = "상담";
export const COMMENTCAUTION = "commentCaution";
export const COMMENTCAUTION_H = "비고/주의";

export const SHORT_COLUMN_LENGTH = 110;
export const SHORT_CENTER_JUSTIFIED_COLUMN_LENGTH = 140;
export const MEDIUM_COLUMN_LENGTH = 120;
export const MEDIUM_CENTER_JUSTIFIED_COLUMN_LENGTH = 150;
export const LONG_JUSTIFIED_CENTER_COLUMN_LENGTH = 190;
export const LONG_LEFT_JUSTIFIED_COLUMN_LENGTH = 120;

export const FIELDS_STAFF = ["피부1", "피부2", "코디", "상담"];
export const FIELDS_NURSE = ["간호1", "간호2"];
export const FIELDS_DOCTOR = ["의사"];
export const FIELDS_PAITENT = ["고객 이름"];
export const OP_READINESS_ENTRIES: OpReadiness[] = ["Y", "N", "C", "P"];

export const DOCTOR_SEARCH_HELP: SearchHelp[] = [
  { id: "1", group: "", title: "이우람" },
  { id: "2", group: "", title: "강승완" },
  { id: "3", group: "", title: "황희찬" },
  { id: "4", group: "", title: "손흥민" },
  { id: "5", group: "", title: "즐라탄" },
  { id: "6", group: "", title: "매머드" },
];
export const OPREADINESS_SEARCH_HELP: SearchHelp[] = [
  { title: "준비 완료 (Y)", id: "Y", group: "" },
  { title: "준비 미완료 (N)", id: "N", group: "" },
  { title: "시술 완료 (C)", id: "C", group: "" },
  { title: "시술 중 (P)", id: "P", group: "" },
];
export const EMPTY_SEARCHHELP: SearchHelp = {
  id: "",
  group: "",
  title: "",
};

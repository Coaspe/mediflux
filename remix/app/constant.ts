/** @format */

import { OpReadiness, SearchHelp, Treatment, User } from "./type";

export const TEST_TAG = "gn_ss_bailor";
export const SERVERUSER_CLIENTUSER_MAPPING = {
  login_id: "userid" as keyof User,
  login_pw: "password" as keyof User,
  contact_id: "id" as keyof User,
};

export const SIDE_MENU = {
  SCHEDULING: "scheduling",
  ARCHIVE: "archive",
  MEMBERS: "members",
  TREATMENTS: "treatments",
} as const;

export const TABLE_CONTAINER_HEIGHT = "78%";
export const TABLE_HEIGHT = "100%";
export const TABLE_PAPER_HEIGHT = "50%";
export const NEW_READY_RECORD_COLOR = "#fffacd";
export const EDITING_RECORD_COLOR = "#dcdcdc";
export const DEFAULT_RECORD_COLOR = "white";

export const CREATED_AT = "createdAt";
export const CREATED_AT_H = "수납시간";
export const CHART_NUMBER = "chartNum";
export const CHART_NUMBER_H = "차트번호";
export const PATIENT_NAME = "patientName";
export const PATIENT_NAME_H = "고객";
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
export const QUANTITY_TREAT1 = "quantityTreat1";
export const QUANTITY_TREAT1_H = "수량";
export const TREATMENT_ROOM = "treatmentRoom";
export const TREATMENT_ROOM_H = "시술실";
export const DOCTOR = "doctor";
export const DOCTOR1 = "doctor1";
export const DOCTOR2 = "doctor2";
export const DOCTOR3 = "doctor3";
export const DOCTOR4 = "doctor4";
export const DOCTOR5 = "doctor5";
export const DOCTOR_H = "의사";
export const ANESTHESIA_NOTE = "anesthesiaNote";
export const ANESTHESIA_NOTE_H = "마취 시간";
export const SKINCARE_SPECIALIST1 = "skincareSpecialist1";
export const SKINCARE_SPECIALIST1_H = "피부1";
export const SKINCARE_SPECIALIST2 = "skincareSpecialist2";
export const SKINCARE_SPECIALIST2_H = "피부2";
export const NURSING_STAFF1 = "nursingStaff1";
export const NURSING_STAFF1_H = "간호1";
export const NURSING_STAFF2 = "nursingStaff2";
export const NURSING_STAFF2_H = "간호2";
export const COORDINATOR = "coordinator";
export const COORDINATOR_H = "코디";
export const CONSULTANT = "consultant";
export const CONSULTANT_H = "상담";
export const COMMENT_CAUTION = "commentCaution";
export const COMMENT_CAUTION_H = "비고/주의";
export const LOCKING_USER = "lockingUser";

export const TREATMENT_NAME_COLUMN = 250;
export const LONG_COLUMN_LENGTH = 150;
export const MEDIUM_COLUMN_LENGTH = 100;
export const POINT_COLUMN_LENGTH = 80;
export const SHORT_COLUMN_LENGTH = 70;

export const FIELDS_STAFF = [SKINCARE_SPECIALIST1_H, SKINCARE_SPECIALIST2_H, COORDINATOR_H, CONSULTANT_H];
export const FIELDS_NURSE = [NURSING_STAFF1_H, NURSING_STAFF2_H];
export const FIELDS_DOCTOR = [DOCTOR_H];
export const FIELDS_PAITENT = [PATIENT_NAME_H];

export const OP_READINESS_Y: OpReadiness = "Y";
export const OP_READINESS_N: OpReadiness = "N";
export const OP_READINESS_C: OpReadiness = "C";
export const OP_READINESS_P: OpReadiness = "P";
export const OP_READINESS_ENTRIES: OpReadiness[] = [OP_READINESS_Y, OP_READINESS_N, OP_READINESS_C, OP_READINESS_P];
export const OP_READINESS_Y_TITLE = "준비 완료 (Y)";
export const OP_READINESS_N_TITLE = "준비 미완료 (N)";
export const OP_READINESS_C_TITLE = "시술 완료 (C)";
export const OP_READINESS_P_TITLE = "시술 중 (P)";

export const DOCTOR_SEARCH_HELP: SearchHelp[] = [
  { id: "1", group: "", title: "이우람" },
  { id: "2", group: "", title: "강승완" },
  { id: "3", group: "", title: "황희찬" },
  { id: "4", group: "", title: "손흥민" },
  { id: "5", group: "", title: "즐라탄" },
  { id: "6", group: "", title: "매머드" },
];

export const EMPTY_SEARCHHELP: SearchHelp = {
  id: "",
  group: "",
  title: "",
};

export const TREATMENT_NUMBERS = Array.from({ length: 5 }, (_, k) => k + 1);

export const KEY_OF_CLIENT_TREATMENT: (keyof Treatment)[] = ["id", "group", "title", "duration", "price", "point"];
